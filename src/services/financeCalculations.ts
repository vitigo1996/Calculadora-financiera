import {
  AppFinanceData,
  CreditCardPurchase,
  HousingExpense,
  ObligationItem,
  CreditCardItem,
  SubscriptionItem
} from '../models/finance';

export interface CalculatedSummary {
  ingresos: {
    p1Income: number;
    p2Income: number;
    totalIncome: number;
    ratioYo: number;
    ratioDaniela: number;
    isShared: boolean;
  };
  gastosFijos: {
    viviendaDaniela: number;
    viviendaHogar: number;
    obligacionesDaniela: number;
    firstFortnightHousing: number;
    secondFortnightHousing: number;
    firstFortnightObligations: number;
    secondFortnightObligations: number;
    firstFortnightCards: number;
    secondFortnightCards: number;
    totalMonthlyGastosFijos: number;
  };
  vivienda: {
    totalMonth: number;
    totalYear: number;
    items: HousingExpense[];
  };
  obligaciones: {
    totalMonthly: number;
    totalDebtBalance: number;
    items: ObligationItem[];
  };
  tarjetasCredito: {
    totalCreditLimit: number;
    totalDueThisMonth: number;
    cards: CreditCardItem[];
  };
  suscripciones: {
    items: any[];
    totalMonthly: number;
  };
  presupuesto: {
    m3_saludPension: number;
    m4_vivienda: number;
    m5_tarjetas: number;
    m6_obligaciones: number;
    m7_totalGastos: number;
    m9_mitadDeMes: number;
    m10_finDeMes: number;
    m11_disponible: number;
  };
  portafolio: {
    totalPortafolio: number;
    items: any[];
  };
}

export function calculateSubscriptionMonthlyCost(sub: SubscriptionItem): number {
  const members = Math.max(1, sub.members || 1);
  return (sub.totalPrice || 0) / members;
}

export function calculateCardPurchasesTotal(cc: CreditCardItem): number {
  const totalPurchases = (cc.purchases || []).reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPayments = (cc.payments || []).reduce((sum, pay) => sum + (pay.amount || 0), 0);
  return Math.max(0, totalPurchases - totalPayments);
}

/** Información de cuotas de una compra de tarjeta. */
export interface PurchaseInstallmentInfo {
  installments: number;   // Total de cuotas (1 = contado)
  quota: number;          // Cuota mensual fija = monto / cuotas
  paid: number;           // Monto abonado a la compra con pagos desde "Registro"
  remaining: number;      // Saldo pendiente de la compra
  currentInstallment: number; // Cuota que se está pagando (1..installments)
  paidInstallments: number;   // Cuotas completas ya pagadas
  finished: boolean;      // Compra totalmente pagada
}

/** Compra diferida a más de una cuota. */
export function isInstallmentPurchase(p: CreditCardPurchase): boolean {
  return (p.installments || 1) > 1;
}

/**
 * Calcula el estado de cuotas de una compra. No depende de la fecha:
 * el avance solo cambia cuando se registra un pago a la tarjeta desde "Registro".
 */
export function getPurchaseInstallmentInfo(p: CreditCardPurchase): PurchaseInstallmentInfo {
  const installments = Math.max(1, Math.floor(p.installments || 1));
  const amount = Math.max(0, p.amount || 0);
  const quota = amount / installments;
  const paid = Math.min(amount, Math.max(0, p.paidAmount || 0));
  const remaining = Math.max(0, amount - paid);
  // Tolerancia de 1 peso por redondeos en la división
  const paidInstallments = quota > 0 ? Math.min(installments, Math.floor((paid + 1) / quota)) : installments;
  const finished = remaining <= 1;
  return {
    installments,
    quota,
    paid,
    remaining,
    paidInstallments,
    currentInstallment: Math.min(installments, paidInstallments + 1),
    finished
  };
}

/**
 * Pago del mes según el modelo anterior (corte de facturación / total pendiente).
 * Se aplica a las compras de contado.
 */
function calculateLegacyPaymentDue(cc: CreditCardItem): number {
  const totalPurchases = (cc.purchases || []).reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPayments = (cc.payments || []).reduce((sum, pay) => sum + (pay.amount || 0), 0);

  if (totalPurchases === 0) {
    return 0;
  }

  if (cc.billingCutoffAmount !== undefined && cc.billingCutoffAmount > 0) {
    const preCutoffPurchasesSum = (cc.purchases || []).filter(p => !p.isAfterCutoff).reduce((sum, p) => sum + (p.amount || 0), 0);
    if (preCutoffPurchasesSum === 0) {
      return calculateCardPurchasesTotal(cc);
    }
    const paymentsSinceCutoff = Math.max(0, totalPayments - (cc.cutoffBasePayments || 0));
    const effectiveCutoff = Math.min(preCutoffPurchasesSum, cc.billingCutoffAmount);
    const cutoffRemaining = Math.max(0, effectiveCutoff - paymentsSinceCutoff);
    if (cutoffRemaining > 0) {
      return cutoffRemaining;
    }
    // Si la deuda facturada en el corte ya se pagó en su totalidad, continuar con lo que siga activo en la deuda
    return calculateCardPurchasesTotal(cc);
  }

  return calculateCardPurchasesTotal(cc);
}

/**
 * Pago del mes de una tarjeta (valor que entra al presupuesto):
 * - Compras en cuotas: suma de la cuota mensual fija de cada compra no pagada
 *   (no cambia por las cuotas que falten ni por el saldo; solo baja la última cuota si queda menos).
 * - Compras de contado: cálculo anterior (corte de facturación / saldo pendiente).
 */
export function calculateCardPaymentDue(cc: CreditCardItem): number {
  if (cc.minPaymentOverride !== undefined && cc.minPaymentOverride > 0) {
    return cc.minPaymentOverride;
  }
  const purchases = cc.purchases || [];
  const installmentPurchases = purchases.filter(isInstallmentPurchase);
  if (installmentPurchases.length === 0) return calculateLegacyPaymentDue(cc);

  // Cuotas del mes de las compras diferidas
  let installmentsDue = 0;
  let allocatedToInstallments = 0;
  for (const p of installmentPurchases) {
    const info = getPurchaseInstallmentInfo(p);
    allocatedToInstallments += info.paid;
    if (!info.finished) installmentsDue += Math.min(info.quota, info.remaining);
  }

  // Compras de contado: se descuentan de los pagos lo ya abonado a compras en cuotas
  const totalPayments = (cc.payments || []).reduce((sum, pay) => sum + (pay.amount || 0), 0);
  const cashCard: CreditCardItem = {
    ...cc,
    purchases: purchases.filter(p => !isInstallmentPurchase(p)),
    payments: [{ id: 'agg', amount: Math.max(0, totalPayments - allocatedToInstallments), date: '' }],
    cutoffBasePayments: cc.cutoffBasePayments !== undefined
      ? Math.max(0, cc.cutoffBasePayments - allocatedToInstallments)
      : undefined
  };
  return installmentsDue + calculateLegacyPaymentDue(cashCard);
}

/**
 * Convierte un monto en la moneda del registro a la moneda base configurada en la app.
 * Registros sin moneda se asumen en COP.
 */
export function toBaseCurrency(amount: number, moneda: 'COP' | 'USD' | undefined, data: AppFinanceData): number {
  return convertToBase(amount || 0, moneda || 'COP', data.baseCurrency || 'COP', data.dolarRate || 3600);
}

export function calculateAllFinances(data: AppFinanceData): CalculatedSummary {
  // Todos los totales se expresan en la moneda base (conversión COP/USD con la tasa vigente)
  const toBase = (amount: number, moneda?: 'COP' | 'USD') => toBaseCurrency(amount, moneda, data);
  const activePeople = (data.people || []).filter((p, idx) => idx === 0 ? true : (p.enabled && (p.monthlyIncome || 0) > 0));
  const isShared = data.mode === 'shared' && activePeople.length > 1;
  const p1 = activePeople[0] || { name: 'Yo', monthlyIncome: 0, healthPensionRate: 0.08, enabled: true };
  const p2 = activePeople[1] || { name: 'Persona 2', monthlyIncome: 0, healthPensionRate: 0.0, enabled: false };

  const totalIncome = activePeople.reduce((sum, p) => sum + toBase(p.monthlyIncome || 0, p.moneda), 0);
  const p1Income = toBase(p1.monthlyIncome || 0, (p1 as { moneda?: 'COP' | 'USD' }).moneda);
  const p2Income = toBase(p2.monthlyIncome || 0, (p2 as { moneda?: 'COP' | 'USD' }).moneda);

  const splitMethod = data.expenseSplitMethod || 'proportional';

  // Calculate H4 (p1 ratio / aporte proporcional de Yo)
  let h4 = 1.0;
  let i4 = 0.0;

  if (isShared && activePeople.length >= 2) {
    if (splitMethod === 'equal') {
      h4 = 1.0 / activePeople.length;
      i4 = 1.0 / activePeople.length;
    } else if (splitMethod === 'equal_remaining') {
      const avgIncome = totalIncome / activePeople.length;
      h4 = totalIncome > 0 ? Math.max(0, Math.min(1, 0.5 + (p1Income - avgIncome) / (totalIncome || 1))) : 0.5;
      i4 = Math.max(0, 1.0 - h4);
    } else {
      h4 = totalIncome > 0 ? p1Income / totalIncome : 1.0;
      i4 = totalIncome > 0 ? p2Income / totalIncome : 0.0;
    }
  }

  // M3: Salud / Pensión (Deducciones de ley sobre ingreso de Yo)
  const m3_saludPension = p1Income * (p1.healthPensionRate || 0.08);

  // 1. Vivienda (Dinámica sumando cada registro según su quincena y distribución)
  let m4_vivienda = 0;
  let viviendaDaniela = 0;
  let viviendaHogar = 0;
  let mitadDeMesHousing = 0;
  let finDeMesHousing = 0;

  (data.housingExpenses || []).forEach(item => {
    const itemAmount = toBase(item.totalAmount || 0, item.moneda);
    const isItemShared = item.isShared !== false && isShared;
    const myShare = isItemShared ? itemAmount * h4 : itemAmount;
    const partnerShare = isItemShared ? itemAmount * i4 : 0;

    m4_vivienda += myShare;
    viviendaDaniela += partnerShare;
    viviendaHogar += itemAmount;

    const isMitad = item.paymentDay !== undefined ? item.paymentDay >= 16 : item.period === '2nd_fortnight';
    if (isMitad) {
      mitadDeMesHousing += myShare;
    } else {
      finDeMesHousing += myShare;
    }
  });

  // 2. Obligaciones (Dinámica sumando cuota mensual de cada registro según su quincena y distribución)
  let m6_obligaciones = 0;
  let obligacionesDaniela = 0;
  let mitadDeMesObligations = 0;
  let finDeMesObligations = 0;

  (data.obligations || []).forEach(ob => {
    const monthlyVal = ob.davidAmount !== undefined && ob.davidAmount !== ob.totalAmount && ob.totalDebtBalance
      ? ob.davidAmount
      : ob.totalAmount;
    const obAmount = toBase(monthlyVal || 0, ob.moneda);
    const isObShared = ob.isShared !== false && isShared;
    const myShare = isObShared ? obAmount * h4 : obAmount;
    const partnerShare = isObShared ? obAmount * i4 : 0;

    m6_obligaciones += myShare;
    obligacionesDaniela += partnerShare;

    const isMitad = ob.paymentDay !== undefined ? ob.paymentDay >= 16 : ob.period === '2nd_fortnight';
    if (isMitad) {
      mitadDeMesObligations += myShare;
    } else {
      finDeMesObligations += myShare;
    }
  });

  // 3. Tarjetas de Crédito (Dinámica sumando pago de cada tarjeta registrada)
  let m5_tarjetas = 0;
  let mitadDeMesCards = 0;
  let finDeMesCards = 0;

  (data.creditCards || []).forEach(cc => {
    const dueAmount = toBase(calculateCardPaymentDue(cc) || 0, cc.moneda);

    m5_tarjetas += dueAmount;

    const isMitad = cc.paymentDay !== undefined ? cc.paymentDay >= 16 : cc.period === '2nd_fortnight';
    if (isMitad) {
      mitadDeMesCards += dueAmount;
    } else {
      finDeMesCards += dueAmount;
    }
  });

  // 4. Suscripciones
  const processedSubs = (data.subscriptions || []).map(sub => ({
    id: sub.id,
    name: sub.name,
    totalPrice: sub.totalPrice,
    members: sub.members,
    billing: sub.billing,
    monthlyCost: calculateSubscriptionMonthlyCost(sub),
    active: sub.active
  }));
  const totalMonthlySubs = processedSubs.reduce((sum, s) => sum + s.monthlyCost, 0);

  // M7: Total Gastos del Mes (Deducciones de ley excluidas de presupuesto según requerimiento)
  const m7_totalGastos = m4_vivienda + m6_obligaciones + m5_tarjetas;

  // M9: Mitad de mes (Vencimientos del 16 al último día del mes, pagados con la quincena del 15)
  const m9_mitadDeMes = mitadDeMesHousing + mitadDeMesObligations + mitadDeMesCards;

  // M10: Fin de mes (Vencimientos del 1 al 15, pagados con la quincena de fin de mes)
  const m10_finDeMes = finDeMesHousing + finDeMesObligations + finDeMesCards;

  // M11: Disponible del Mes
  const m11_disponible = p1Income - m7_totalGastos;

  // Portafolio Dinámico
  const distinctPalette = [
    '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'
  ];

  const rawPortItems = data.portfolioItems || [];
  const baseCurrency = data.baseCurrency || 'COP';
  const dolarRate = data.dolarRate || 3600;

  const calculatedPortItems = rawPortItems.map((item, idx) => {
    const itemMoneda = item.moneda || 'COP';
    const valorCOP = convertToBase(item.saldo || 0, itemMoneda, baseCurrency, dolarRate);
    return {
      id: item.id,
      label: item.nombre,
      moneda: itemMoneda,
      saldoOriginal: item.saldo,
      valorCOP,
      icon: item.icon,
      color: item.color || distinctPalette[idx % distinctPalette.length]
    };
  });

  const totalPortafolio = calculatedPortItems.reduce((sum, item) => sum + item.valorCOP, 0);

  const portfolioItemsWithPercentages = calculatedPortItems.map(item => {
    const percentage = totalPortafolio > 0 ? (item.valorCOP / totalPortafolio) * 100 : 0;
    return {
      ...item,
      percentage
    };
  });

  // Totales de vivienda
  const totalHousingMonth = (data.housingExpenses || []).reduce((acc, h) => acc + toBase(h.totalAmount || 0, h.moneda), 0);
  const totalHousingYear = totalHousingMonth * 12;

  // Totales de obligaciones
  const totalMonthlyObligations = (data.obligations || []).reduce((acc, ob) => acc + toBase(ob.totalAmount || 0, ob.moneda), 0);
  const totalDebtBalance = (data.obligations || []).reduce((acc, ob) => acc + toBase(ob.totalDebtBalance || 0, ob.moneda), 0);

  // Totales de tarjetas
  const totalCreditLimit = (data.creditCards || []).reduce((acc, c) => acc + toBase(c.creditLimit || 0, c.moneda), 0);
  const totalCreditCardDue = m5_tarjetas;

  return {
    ingresos: {
      p1Income,
      p2Income,
      totalIncome,
      ratioYo: h4,
      ratioDaniela: i4,
      isShared
    },
    gastosFijos: {
      viviendaDaniela,
      viviendaHogar,
      obligacionesDaniela,
      firstFortnightHousing: finDeMesHousing,
      secondFortnightHousing: mitadDeMesHousing,
      firstFortnightObligations: finDeMesObligations,
      secondFortnightObligations: mitadDeMesObligations,
      firstFortnightCards: finDeMesCards,
      secondFortnightCards: mitadDeMesCards,
      totalMonthlyGastosFijos: m4_vivienda + m6_obligaciones
    },
    vivienda: {
      totalMonth: totalHousingMonth,
      totalYear: totalHousingYear,
      items: data.housingExpenses || []
    },
    obligaciones: {
      totalMonthly: totalMonthlyObligations,
      totalDebtBalance,
      items: data.obligations || []
    },
    tarjetasCredito: {
      totalCreditLimit,
      totalDueThisMonth: totalCreditCardDue,
      cards: data.creditCards || []
    },
    suscripciones: {
      items: processedSubs,
      totalMonthly: totalMonthlySubs
    },
    presupuesto: {
      m3_saludPension,
      m4_vivienda,
      m5_tarjetas,
      m6_obligaciones,
      m7_totalGastos,
      m9_mitadDeMes,
      m10_finDeMes,
      m11_disponible
    },
    portafolio: {
      totalPortafolio,
      items: portfolioItemsWithPercentages
    }
  };
}

export function convertToBase(
  amount: number,
  itemCurrency: 'COP' | 'USD' = 'COP',
  baseCurrency: 'COP' | 'USD' = 'COP',
  dolarRate: number = 3600
): number {
  if (itemCurrency === baseCurrency) return amount;
  if (itemCurrency === 'USD' && baseCurrency === 'COP') return amount * dolarRate;
  if (itemCurrency === 'COP' && baseCurrency === 'USD') return dolarRate > 0 ? amount / dolarRate : 0;
  return amount;
}

export function formatWithEquivalence(
  amount: number,
  itemCurrency: 'COP' | 'USD' = 'COP',
  baseCurrency: 'COP' | 'USD' = 'COP',
  dolarRate: number = 3600
) {
  const isDifferent = itemCurrency !== baseCurrency;
  const equivalent = convertToBase(amount, itemCurrency, baseCurrency, dolarRate);
  return {
    isDifferent,
    itemCurrency,
    baseCurrency,
    equivalentAmount: equivalent,
    formattedOriginal: formatCurrency(amount, itemCurrency),
    formattedEquivalent: formatCurrency(equivalent, baseCurrency)
  };
}

export function formatCurrency(amount: number, currency: 'COP' | 'USD' = 'COP'): string {
  if (currency === 'USD') {
    return `$${amount.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
  return `$${Math.round(amount || 0).toLocaleString('es-CO')}`;
}

/**
 * Parsea de forma segura cualquier formato de fecha de compra:
 * - Cadenas ISO (ej. 2026-09-28T...)
 * - Fechas con barras o guiones (ej. 28/09/2026, 28-09-2026, 2026/09/28)
 * - Fechas en español (ej. '28 de sept', '28 sept', '28 sep.', '28 de septiembre de 2026')
 * - Timestamps numéricos o en ID (ej. 'p-1727500000000')
 */
export function parsePurchaseDate(dateStr?: string | number, id?: string): Date | null {
  if (typeof dateStr === 'number') {
    const d = new Date(dateStr > 1e11 ? dateStr : dateStr * 1000);
    if (!isNaN(d.getTime())) return d;
  }

  if (typeof dateStr === 'string' && dateStr.trim()) {
    const trimmed = dateStr.trim();

    // Timestamp numérico en cadena
    if (/^\d{10,13}$/.test(trimmed)) {
      const ts = parseInt(trimmed, 10);
      const d = new Date(ts > 1e11 ? ts : ts * 1000);
      if (!isNaN(d.getTime())) return d;
    }

    // Mapa de meses en español
    const monthsMap: Record<string, number> = {
      ene: 0, enero: 0,
      feb: 1, febrero: 1,
      mar: 2, marzo: 2,
      abr: 3, abril: 3,
      may: 4, mayo: 4,
      jun: 5, junio: 5,
      jul: 6, julio: 6,
      ago: 7, agosto: 7,
      sep: 8, sept: 8, septiembre: 8,
      oct: 9, octubre: 9,
      nov: 10, noviembre: 10,
      dic: 11, diciembre: 11
    };

    // Formato DD/MM/YYYY o DD-MM-YYYY
    const dmy = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
    if (dmy) {
      const day = parseInt(dmy[1], 10);
      const month = parseInt(dmy[2], 10) - 1;
      let year = parseInt(dmy[3], 10);
      if (year < 100) year += 2000;
      return new Date(year, month, day);
    }

    // Formato YYYY/MM/DD o YYYY-MM-DD
    const ymd = trimmed.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
    if (ymd) {
      const year = parseInt(ymd[1], 10);
      const month = parseInt(ymd[2], 10) - 1;
      const day = parseInt(ymd[3], 10);
      return new Date(year, month, day);
    }

    // Formato en español: '28 de sept', '28 sept 2026', '28 de septiembre de 2026'
    const cleanSp = trimmed.toLowerCase().replace(/[.,]/g, '').replace(/\s+/g, ' ');
    const spMatch = cleanSp.match(/^(\d{1,2})\s*(?:de\s+)?([a-z]+)(?:\s*(?:de\s+)?(\d{2,4}))?$/);
    if (spMatch) {
      const day = parseInt(spMatch[1], 10);
      const mStr = spMatch[2];
      const yStr = spMatch[3];
      if (monthsMap[mStr] !== undefined) {
        let year = yStr ? parseInt(yStr, 10) : new Date().getFullYear();
        if (year < 100) year += 2000;
        return new Date(year, monthsMap[mStr], day);
      }
    }

    // Intento nativo estándar (ISO 8601, UTC, etc.)
    const directDate = new Date(trimmed);
    if (!isNaN(directDate.getTime())) {
      return directDate;
    }
  }

  // Si no hay fecha directa o falló, intentar extraer timestamp del ID (ej. 'p-1727500000000')
  if (id && typeof id === 'string') {
    const idMatch = id.match(/\b(\d{10,13})\b/);
    if (idMatch) {
      const ts = parseInt(idMatch[1], 10);
      const d = new Date(ts > 1e11 ? ts : ts * 1000);
      if (!isNaN(d.getTime())) return d;
    }
  }

  return null;
}

/**
 * Verifica si una fecha está dentro de los últimos N meses respecto a la fecha actual.
 * Si months es null/undefined/0 o <= 0, retorna true (sin límite).
 */
export function isWithinMonths(dateStr?: string, months?: number): boolean {
  if (!months || months <= 0) return true;
  if (!dateStr) return true;
  const d = parsePurchaseDate(dateStr);
  if (!d) return true;

  const now = new Date();
  const cutoff = new Date(now.getFullYear(), now.getMonth() - months, now.getDate(), 0, 0, 0, 0);
  return d >= cutoff;
}

/**
 * Calcula la fecha de inicio del ciclo de facturación actual de una tarjeta
 * según su día de corte (cutoffDay). El período dura 1 mes.
 * Si hoy es >= cutoffDay, el ciclo actual inició el cutoffDay del mes actual.
 * Si hoy es < cutoffDay, el ciclo actual inició el cutoffDay del mes anterior.
 */
export function getCardBillingCycleStartDate(cutoffDay: number, referenceDate: Date = new Date()): Date {
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth();
  const currentDay = referenceDate.getDate();

  let cycleYear = currentYear;
  let cycleMonth = currentMonth;

  if (currentDay < cutoffDay) {
    cycleMonth -= 1;
    if (cycleMonth < 0) {
      cycleMonth = 11;
      cycleYear -= 1;
    }
  }

  const maxDays = new Date(cycleYear, cycleMonth + 1, 0).getDate();
  const safeDay = Math.min(cutoffDay, maxDays);

  return new Date(cycleYear, cycleMonth, safeDay, 0, 0, 0, 0);
}

/**
 * Determina si una compra es un registro viejo (anterior a la fecha de inicio del corte actual).
 * Si el día de corte es 15 y hoy es 12 de nov: el corte actual inició el 15 de oct.
 * Todo lo que esté entre el 15 de oct y hoy está en el corte actual (normal).
 * Todo lo que sea anterior al 15 de oct hacia atrás es registro viejo (en gris / tono tenue).
 * Si un registro no tiene fecha o no es parseable, al haber día de corte configurado,
 * se trata como registro anterior para que quede en gris.
 */
export function isPurchaseBeforeCurrentMonthBillingDate(
  purchaseDateStr?: string,
  cutoffDay?: number,
  now: Date = new Date(),
  id?: string
): boolean {
  if (!cutoffDay || cutoffDay <= 0) return false;
  const cycleStart = getCardBillingCycleStartDate(cutoffDay, now);
  const pDate = parsePurchaseDate(purchaseDateStr, id);
  if (!pDate) return true; // Todo registro anterior o sin fecha debe quedar en gris
  return pDate < cycleStart;
}
