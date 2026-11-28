import {
  AppFinanceData,
  CreditCardPayment,
  ExpenseMovement
} from '../models/finance';
import { convertToBase, formatCurrency, getPurchaseInstallmentInfo, isInstallmentPurchase, parsePurchaseDate } from './financeCalculations';
import { generateId } from './idService';

type Moneda = 'COP' | 'USD';
type AccountKind = 'billetera' | 'portfolio';

/** Datos de entrada para registrar un movimiento (gasto, ingreso o transferencia). */
export interface NewMovementInput {
  type?: 'expense' | 'income' | 'transfer';
  name: string;
  amount: number;
  moneda?: Moneda; // Ignorado: la moneda real es la de la cuenta de origen
  sourceAccountId: string;
  destinationType?: 'none' | 'card' | 'obligation' | 'account' | 'deuda' | 'portfolio';
  destinationId?: string;
  destinationName?: string;
  icon?: string;
}

/** Quita los prefijos 'billetera:' / 'portfolio:' de un id de cuenta. */
const stripPrefix = (id?: string): string =>
  (id || '').replace(/^portfolio:/, '').replace(/^billetera:/, '');

/** Quita los prefijos 'd-' / 'o-' usados por ids de deudas/obligaciones antiguos. */
const stripDebtPrefix = (id: string): string =>
  id.startsWith('d-') ? id.slice(2) : id.startsWith('o-') ? id.slice(2) : id;

/**
 * Resuelve a qué tipo de cuenta pertenece un id:
 * 1. Prefijo explícito ('portfolio:' / 'billetera:').
 * 2. Pista del tipo de destino ('portfolio' / 'account').
 * 3. Búsqueda: primero Billetera, luego Portafolio.
 */
function resolveAccountKind(
  data: AppFinanceData,
  id: string | undefined,
  hint?: string
): AccountKind | undefined {
  if (!id) return undefined;
  if (id.startsWith('portfolio:')) return 'portfolio';
  if (id.startsWith('billetera:')) return 'billetera';
  if (hint === 'portfolio') return 'portfolio';
  if (hint === 'account') return 'billetera';
  const raw = stripPrefix(id);
  if ((data.billeteraItems || []).some(b => b.id === raw)) return 'billetera';
  if ((data.portfolioItems || []).some(p => p.id === raw)) return 'portfolio';
  return undefined;
}

/** Busca la cuenta (Billetera o Portafolio) según su tipo e id. */
function findAccount(data: AppFinanceData, kind: AccountKind | undefined, id: string | undefined) {
  if (!kind || !id) return undefined;
  const raw = stripPrefix(id);
  return kind === 'portfolio'
    ? (data.portfolioItems || []).find(p => p.id === raw)
    : (data.billeteraItems || []).find(b => b.id === raw);
}

/** Suma `delta` al saldo de una cuenta. Si `clampAtZero`, el saldo no baja de 0. Devuelve el delta real aplicado. */
function adjustAccount(
  data: AppFinanceData,
  kind: AccountKind | undefined,
  id: string | undefined,
  delta: number,
  clampAtZero: boolean
): { data: AppFinanceData; applied: number } {
  const acc = findAccount(data, kind, id);
  if (!acc || !kind) return { data, applied: 0 };
  const newSaldo = clampAtZero ? Math.max(0, acc.saldo + delta) : acc.saldo + delta;
  const applied = newSaldo - acc.saldo;
  if (kind === 'portfolio') {
    return {
      data: { ...data, portfolioItems: data.portfolioItems.map(p => (p.id === acc.id ? { ...p, saldo: newSaldo } : p)) },
      applied
    };
  }
  return {
    data: { ...data, billeteraItems: data.billeteraItems.map(b => (b.id === acc.id ? { ...b, saldo: newSaldo } : b)) },
    applied
  };
}

/**
 * Reparte un pago a tarjeta entre sus compras en cuotas:
 * 1. Cada compra pendiente recibe su cuota del mes (de la más antigua a la más reciente).
 * 2. Si el pago supera las cuotas y la deuda de contado, el excedente abona saldo de las compras en cuotas.
 * Devuelve las asignaciones (para poder revertirlas) y las compras actualizadas.
 */
export function allocateCardPayment(
  card: CreditCard,
  payAmount: number
): { allocations: { purchaseId: string; amount: number }[]; purchases: CreditCard['purchases'] } {
  const purchases = card.purchases || [];
  const pending = purchases
    .filter(p => isInstallmentPurchase(p) && !getPurchaseInstallmentInfo(p).finished)
    .sort((a, b) =>
      (parsePurchaseDate(a.date, a.id)?.getTime() || 0) - (parsePurchaseDate(b.date, b.id)?.getTime() || 0)
    );
  const assigned = new Map<string, number>();
  let left = payAmount;

  // 1. Una cuota por compra
  for (const p of pending) {
    if (left <= 0) break;
    const info = getPurchaseInstallmentInfo(p);
    const take = Math.min(left, info.quota, info.remaining);
    if (take > 0) {
      assigned.set(p.id, take);
      left -= take;
    }
  }

  // 2. Excedente después de cubrir la deuda de contado → abono a saldos en cuotas
  if (left > 0) {
    const cashPurchases = purchases.filter(p => !isInstallmentPurchase(p)).reduce((s, p) => s + (p.amount || 0), 0);
    const allocatedBefore = purchases.filter(isInstallmentPurchase).reduce((s, p) => s + (p.paidAmount || 0), 0);
    const paymentsBefore = (card.payments || []).reduce((s, p) => s + (p.amount || 0), 0);
    const cashDebt = Math.max(0, cashPurchases - Math.max(0, paymentsBefore - allocatedBefore));
    let extra = Math.max(0, left - cashDebt);
    for (const p of pending) {
      if (extra <= 0) break;
      const info = getPurchaseInstallmentInfo(p);
      const room = info.remaining - (assigned.get(p.id) || 0);
      const take = Math.min(extra, room);
      if (take > 0) {
        assigned.set(p.id, (assigned.get(p.id) || 0) + take);
        extra -= take;
      }
    }
  }

  const allocations = [...assigned.entries()].map(([purchaseId, amount]) => ({ purchaseId, amount }));
  return {
    allocations,
    purchases: purchases.map(p =>
      assigned.has(p.id) ? { ...p, paidAmount: (p.paidAmount || 0) + assigned.get(p.id)! } : p
    )
  };
}

type CreditCard = AppFinanceData['creditCards'][number];

/** Convierte un monto entre COP y USD con la tasa vigente. */
const convert = (amount: number, from: Moneda, to: Moneda, rate: number): number =>
  convertToBase(amount, from, to, rate);

/**
 * Aplica un nuevo movimiento a los datos (función pura).
 * Guarda en el movimiento los montos realmente aplicados para poder revertirlo exactamente.
 */
export function applyNewMovement(
  prev: AppFinanceData,
  input: NewMovementInput,
  now: Date = new Date()
): AppFinanceData {
  const type = input.type || 'expense';
  const isIncome = type === 'income';
  const isTransfer = type === 'transfer';
  const rate = prev.dolarRate || 3600;
  const stamp = now.getTime();
  const amount = Math.max(0, input.amount || 0);

  // --- Origen ---
  const sourceKind = resolveAccountKind(prev, input.sourceAccountId);
  const sourceAcc = findAccount(prev, sourceKind, input.sourceAccountId);
  const sourceMoneda: Moneda = sourceAcc?.moneda || 'COP';
  const sourceAccountName = sourceAcc
    ? sourceAcc.nombre
    : sourceKind === 'portfolio' ? 'Portafolio' : 'Billetera';

  // Ingreso suma; gasto/transferencia resta (sin bajar de 0)
  const srcResult = adjustAccount(prev, sourceKind, input.sourceAccountId, isIncome ? amount : -amount, !isIncome);
  let next = srcResult.data;
  const sourceApplied = Math.abs(srcResult.applied);

  const movement: ExpenseMovement = {
    id: generateId('mov', stamp),
    type,
    name: input.name.trim(),
    amount,
    moneda: sourceMoneda,
    icon: input.icon,
    sourceAccountId: input.sourceAccountId,
    sourceAccountName,
    sourceKind,
    sourceApplied,
    date: now.toISOString()
  };

  if (isTransfer && input.destinationId) {
    // --- Transferencia: el destino recibe lo realmente debitado, convertido a su moneda ---
    const destKind = resolveAccountKind(prev, input.destinationId, input.destinationType);
    const destAcc = findAccount(next, destKind, input.destinationId);
    const destMoneda: Moneda = destAcc?.moneda || 'COP';
    const destAmount = convert(sourceApplied, sourceMoneda, destMoneda, rate);
    const dstResult = adjustAccount(next, destKind, input.destinationId, destAmount, false);
    next = dstResult.data;
    const destName = destAcc ? destAcc.nombre : destKind === 'portfolio' ? 'Portafolio' : 'Cuenta destino';
    Object.assign(movement, {
      destinationType: destKind === 'portfolio' ? 'portfolio' : 'account',
      destinationId: stripPrefix(input.destinationId),
      destinationName: sourceMoneda !== destMoneda
        ? `${destName} (Recibe: ${formatCurrency(destAmount, destMoneda)})`
        : destName,
      destKind,
      destApplied: dstResult.applied
    });
  } else if (!isIncome && !isTransfer && input.destinationType === 'card' && input.destinationId) {
    // --- Pago a tarjeta: se registra un abono en la moneda de la tarjeta ---
    const card = (next.creditCards || []).find(c => c.id === input.destinationId);
    Object.assign(movement, {
      destinationType: 'card',
      destinationId: input.destinationId,
      destinationName: input.destinationName
    });
    if (card) {
      const payAmount = convert(sourceApplied, sourceMoneda, card.moneda || 'COP', rate);
      const payment: CreditCardPayment = {
        id: generateId('pay', stamp),
        amount: payAmount,
        date: now.toISOString(),
        concept: input.name.trim() || 'Abono / Pago',
        sourceAccountName
      };
      // Abonar la cuota del mes a cada compra en cuotas (antes de agregar el pago al historial)
      const allocation = allocateCardPayment(card, payAmount);
      if (allocation.allocations.length > 0) movement.installmentAllocations = allocation.allocations;
      const payments = [payment, ...(card.payments || [])];
      const totalPayments = payments.reduce((s, p) => s + (p.amount || 0), 0);
      let updatedCard = { ...card, payments, purchases: allocation.purchases };
      // Si el pago cubre el corte facturado, se cierra el corte (y se guarda para poder restaurarlo)
      if (card.billingCutoffAmount !== undefined) {
        const paidSinceCutoff = Math.max(0, totalPayments - (card.cutoffBasePayments || 0));
        if (paidSinceCutoff >= card.billingCutoffAmount) {
          movement.clearedCutoff = {
            amount: card.billingCutoffAmount,
            date: card.billingCutoffDate,
            basePayments: card.cutoffBasePayments
          };
          updatedCard = { ...updatedCard, billingCutoffAmount: undefined, billingCutoffDate: undefined, cutoffBasePayments: undefined };
        }
      }
      movement.cardPaymentId = payment.id;
      movement.destApplied = payAmount;
      next = { ...next, creditCards: next.creditCards.map(c => (c.id === card.id ? updatedCard : c)) };
    }
  } else if (input.destinationId && (input.destinationType === 'deuda' || input.destinationType === 'obligation') && !isTransfer) {
    // --- Abono a deuda/obligación (gasto) o cobro de deuda a favor (ingreso) ---
    const destId = input.destinationId;
    const rawId = stripDebtPrefix(destId);
    let applied = 0;
    next = {
      ...next,
      deudaItems: (next.deudaItems || []).map(d => {
        if (d.id !== destId && d.id !== rawId) return d;
        const delta = convert(sourceApplied, sourceMoneda, d.moneda || 'COP', rate);
        const newMonto = Math.max(0, (d.monto || 0) - delta);
        applied = (d.monto || 0) - newMonto;
        return { ...d, monto: newMonto };
      }),
      obligations: isIncome ? next.obligations : (next.obligations || []).map(ob => {
        if ((ob.id !== destId && ob.id !== rawId) || ob.totalDebtBalance === undefined) return ob;
        const delta = convert(sourceApplied, sourceMoneda, ob.moneda || 'COP', rate);
        const newBal = Math.max(0, ob.totalDebtBalance - delta);
        applied = ob.totalDebtBalance - newBal;
        return { ...ob, totalDebtBalance: newBal };
      })
    };
    Object.assign(movement, {
      destinationType: input.destinationType,
      destinationId: destId,
      destinationName: input.destinationName,
      destApplied: applied
    });
  } else if (!isIncome && !isTransfer) {
    Object.assign(movement, {
      destinationType: input.destinationType || 'none',
      destinationId: input.destinationId,
      destinationName: input.destinationName
    });
  }

  return { ...next, expenseMovements: [movement, ...(next.expenseMovements || [])] };
}

/**
 * Elimina un movimiento y revierte su efecto sobre saldos, tarjetas, deudas y obligaciones (función pura).
 * - Movimientos nuevos: revierte exactamente los montos guardados (sourceApplied / destApplied / cardPaymentId).
 * - Movimientos antiguos: lógica heredada, con resolución de cuentas corregida.
 */
export function revertMovement(prev: AppFinanceData, id: string): AppFinanceData {
  const movement = (prev.expenseMovements || []).find(m => m.id === id);
  if (!movement) return prev;

  const isIncome = movement.type === 'income';
  const isTransfer = movement.type === 'transfer';
  const tracked = movement.sourceApplied !== undefined;
  const rate = prev.dolarRate || 3600;

  let next: AppFinanceData = {
    ...prev,
    expenseMovements: (prev.expenseMovements || []).filter(m => m.id !== id)
  };

  // --- 1. Revertir origen ---
  const sourceKind = movement.sourceKind || resolveAccountKind(prev, movement.sourceAccountId);
  const srcAmount = tracked ? movement.sourceApplied! : movement.amount;
  next = adjustAccount(
    next,
    sourceKind,
    movement.sourceAccountId,
    isIncome ? -srcAmount : srcAmount,
    !tracked && isIncome // registros antiguos conservan el piso en 0
  ).data;

  // --- 2. Revertir destino de transferencia ---
  if (isTransfer && movement.destinationId) {
    const destKind = movement.destKind || resolveAccountKind(prev, movement.destinationId, movement.destinationType);
    let destAmount: number;
    if (tracked && movement.destApplied !== undefined) {
      destAmount = movement.destApplied;
    } else {
      // Registro antiguo: el destino recibió el monto convertido a su moneda (tasa actual como aproximación)
      const srcMoneda: Moneda = findAccount(prev, sourceKind, movement.sourceAccountId)?.moneda || movement.moneda || 'COP';
      const dstMoneda: Moneda = findAccount(prev, destKind, movement.destinationId)?.moneda || 'COP';
      destAmount = convert(movement.amount, srcMoneda, dstMoneda, rate);
    }
    next = adjustAccount(next, destKind, movement.destinationId, -destAmount, !tracked).data;
  }

  // --- 3. Revertir abono a tarjeta ---
  if (!isIncome && !isTransfer && movement.destinationType === 'card' && movement.destinationId) {
    next = {
      ...next,
      creditCards: (next.creditCards || []).map(c => {
        if (c.id !== movement.destinationId) return c;
        let payments: CreditCardPayment[];
        if (movement.cardPaymentId) {
          // Elimina exactamente el abono creado por este movimiento
          payments = (c.payments || []).filter(p => p.id !== movement.cardPaymentId);
        } else {
          // Registro antiguo: descuenta desde el abono más reciente (comportamiento heredado)
          let toRemove = movement.amount;
          payments = [];
          for (const pay of (c.payments || [])) {
            if (toRemove <= 0) payments.push(pay);
            else if (pay.amount <= toRemove) toRemove -= pay.amount;
            else { payments.push({ ...pay, amount: pay.amount - toRemove }); toRemove = 0; }
          }
        }
        // Revertir los abonos que este pago hizo a compras en cuotas
        const allocs = new Map((movement.installmentAllocations || []).map(a => [a.purchaseId, a.amount]));
        const purchases = allocs.size === 0 ? c.purchases : (c.purchases || []).map(p =>
          allocs.has(p.id) ? { ...p, paidAmount: Math.max(0, (p.paidAmount || 0) - allocs.get(p.id)!) } : p
        );
        // Restaurar el corte que este pago cerró, si no se ha hecho un corte nuevo desde entonces
        if (movement.clearedCutoff && c.billingCutoffAmount === undefined) {
          return {
            ...c,
            payments,
            purchases,
            billingCutoffAmount: movement.clearedCutoff.amount,
            billingCutoffDate: movement.clearedCutoff.date,
            cutoffBasePayments: movement.clearedCutoff.basePayments
          };
        }
        return { ...c, payments, purchases };
      })
    };
  }

  // --- 4. Revertir deuda / obligación ---
  if (!isTransfer && movement.destinationId && (movement.destinationType === 'deuda' || movement.destinationType === 'obligation')) {
    const destId = movement.destinationId;
    const rawId = stripDebtPrefix(destId);
    const restore = (moneda?: Moneda) =>
      tracked && movement.destApplied !== undefined
        ? movement.destApplied
        : convert(movement.amount, movement.moneda || 'COP', moneda || 'COP', rate);
    next = {
      ...next,
      deudaItems: (next.deudaItems || []).map(d =>
        d.id === destId || d.id === rawId ? { ...d, monto: (d.monto || 0) + restore(d.moneda) } : d
      ),
      obligations: isIncome ? next.obligations : (next.obligations || []).map(ob =>
        (ob.id === destId || ob.id === rawId) && ob.totalDebtBalance !== undefined
          ? { ...ob, totalDebtBalance: ob.totalDebtBalance + restore(ob.moneda) }
          : ob
      )
    };
  }

  return next;
}
