import React, { useState } from 'react';
import {
  X,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  ShoppingBag,
  CreditCard
} from 'lucide-react';
import { AppFinanceData, DeudaItem } from '../../../models/finance';
import { AmountCalculatorInput } from '../../../components/ui/AmountCalculatorInput';
import { CustomSelect } from '../../../components/ui/CustomSelect';
import { formatCurrency, calculateCardPurchasesTotal } from '../../../services/financeCalculations';
import { predictCategory } from '../../../services/categoryPredictor';

interface MovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppFinanceData;
  deudasPorCobrar: DeudaItem[];
  deudasPorPagar: DeudaItem[];
  onSave: (movement: {
    type: 'expense' | 'income' | 'transfer';
    name: string;
    amount: number;
    moneda: 'COP' | 'USD';
    sourceAccountId: string;
    destinationType?: 'none' | 'card' | 'obligation' | 'account' | 'deuda' | 'portfolio';
    destinationId?: string;
    destinationName?: string;
    icon?: string;
  }) => void;
  setConfirmConfig: (config: any) => void;
}

export const MovementModal: React.FC<MovementModalProps> = ({
  isOpen,
  onClose,
  data,
  deudasPorCobrar,
  deudasPorPagar,
  onSave,
  setConfirmConfig
}) => {
  const [movementType, setMovementType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [movementName, setMovementName] = useState('');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementIcon, setMovementIcon] = useState('compras');
  const [movementSourceId, setMovementSourceId] = useState(
    data.billeteraItems[0] ? `billetera:${data.billeteraItems[0].id}` : ''
  );
  const [movementExpenseDestId, setMovementExpenseDestId] = useState('none');
  const [movementIncomeOriginId, setMovementIncomeOriginId] = useState('general');
  const [movementIncomeDestId, setMovementIncomeDestId] = useState(
    data.billeteraItems[0] ? `billetera:${data.billeteraItems[0].id}` : ''
  );
  const [movementDestTransferId, setMovementDestTransferId] = useState(
    data.billeteraItems[1] ? `billetera:${data.billeteraItems[1].id}` : ''
  );

  if (!isOpen) return null;

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(movementAmount) || 0;
    if (amount <= 0) return;

    let destType: 'none' | 'card' | 'deuda' | 'portfolio' | 'account' = 'none';
    let destId: string | undefined = undefined;
    let destName: string | undefined = undefined;

    if (movementType === 'expense') {
      if (movementExpenseDestId.startsWith('card:')) {
        const cardId = movementExpenseDestId.replace('card:', '');
        const card = data.creditCards.find(c => c.id === cardId);

        if (card) {
          const totalDeuda = calculateCardPurchasesTotal(card);
          if (amount > totalDeuda) {
            setConfirmConfig({
              isOpen: true,
              title: 'Monto Superior a la Deuda',
              message: `Estás ingresando un pago de ${formatCurrency(amount, card.moneda)}, pero la totalidad adeudada en "${card.name}" es de ${formatCurrency(totalDeuda, card.moneda)}.\n\nPor favor corrige el valor antes de continuar.`,
              confirmText: 'Entendido',
              cancelText: null,
              variant: 'warning',
              onConfirm: () => {}
            });
            return;
          }
        }

        destType = 'card';
        destId = cardId;
        destName = card ? `Tarjeta ${card.name}` : undefined;
      } else if (movementExpenseDestId.startsWith('deuda:')) {
        const dId = movementExpenseDestId.replace('deuda:', '');
        const deuda = deudasPorPagar.find(d => d.id === dId);
        destType = 'deuda';
        destId = dId;
        destName = deuda ? deuda.nombre : undefined;
      }
    } else if (movementType === 'income') {
      if (movementIncomeOriginId.startsWith('deuda:')) {
        const dId = movementIncomeOriginId.replace('deuda:', '');
        const deuda = deudasPorCobrar.find(d => d.id === dId);
        destType = 'deuda';
        destId = dId;
        destName = deuda ? deuda.nombre : undefined;
      }
    } else if (movementType === 'transfer') {
      if (movementDestTransferId.startsWith('portfolio:')) {
        const pId = movementDestTransferId.replace('portfolio:', '');
        const port = (data.portfolioItems || []).find(p => p.id === pId);
        destType = 'portfolio';
        destId = pId;
        destName = port ? port.nombre : undefined;
      } else if (movementDestTransferId.startsWith('billetera:')) {
        const bId = movementDestTransferId.replace('billetera:', '');
        const bill = data.billeteraItems.find(b => b.id === bId);
        destType = 'account';
        destId = bId;
        destName = bill ? bill.nombre : undefined;
      }
    }

    const selectedSourceId =
      movementType === 'income'
        ? movementIncomeDestId ||
          (data.billeteraItems[0] ? `billetera:${data.billeteraItems[0].id}` : '')
        : movementSourceId ||
          (data.billeteraItems[0] ? `billetera:${data.billeteraItems[0].id}` : '');

    const defaultName =
      movementType === 'expense'
        ? 'Gasto'
        : movementType === 'income'
        ? 'Ingreso'
        : 'Transferencia';

    onSave({
      type: movementType,
      name: movementName.trim() || defaultName,
      amount,
      moneda: 'COP',
      sourceAccountId: selectedSourceId,
      destinationType: destType,
      destinationId: destId,
      destinationName: destName,
      icon: movementIcon
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 pb-8 sm:p-6 flex justify-center items-start sm:items-center modal-backdrop-scroll">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp my-auto modal-card-scroll">
        {/* Header del Modal */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Registro</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selector de 3 Opciones: Gasto | Ingreso | Transferencia */}
        <div className="grid grid-cols-3 gap-1.5 mb-4">
          <button
            type="button"
            onClick={() => {
              setMovementType('expense');
              const pred = predictCategory(movementName);
              setMovementIcon(pred || 'compras');
            }}
            className={`py-2.5 px-1.5 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
              movementType === 'expense'
                ? 'bg-rose-100 dark:bg-rose-950/60 border-rose-500 text-rose-800 dark:text-rose-300 shadow-sm ring-1 ring-rose-400'
                : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            Gasto
          </button>

          <button
            type="button"
            onClick={() => {
              setMovementType('income');
              const pred = predictCategory(movementName);
              setMovementIcon(pred || 'pago');
            }}
            className={`py-2.5 px-1.5 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
              movementType === 'income'
                ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-400'
                : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Ingreso
          </button>

          <button
            type="button"
            onClick={() => {
              setMovementType('transfer');
              const pred = predictCategory(movementName);
              setMovementIcon(pred || 'transferencia');
            }}
            className={`py-2.5 px-1.5 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
              movementType === 'transfer'
                ? 'bg-blue-100 dark:bg-blue-950/60 border-blue-500 text-blue-800 dark:text-blue-300 shadow-sm ring-1 ring-blue-400'
                : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Transferir
          </button>
        </div>

        <form onSubmit={handleSaveMovement} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Concepto
            </label>
            <input
              type="text"
              value={movementName}
              onChange={e => {
                const val = e.target.value;
                setMovementName(val);
                const pred = predictCategory(val);
                if (pred) {
                  setMovementIcon(pred);
                } else {
                  setMovementIcon(
                    movementType === 'income'
                      ? 'pago'
                      : movementType === 'transfer'
                      ? 'transferencia'
                      : 'compras'
                  );
                }
              }}
              placeholder={
                movementType === 'expense'
                  ? 'Ej. Supermercado, Almuerzo, Transporte'
                  : movementType === 'income'
                  ? 'Ej. Salario, Rendimiento, Pago de amigo'
                  : 'Ej. Retiro de cajero, Transferencia a bolsillo'
              }
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Monto con Calculadora */}
          <AmountCalculatorInput
            label="Monto"
            value={movementAmount}
            onChange={setMovementAmount}
            placeholder="0"
            required
            title="Ajuste"
          />

          {/* Selector de Cuenta Origen / Destino */}
          <div className="space-y-3">
            {/* 1. Origen */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Origen
              </label>
              {movementType === 'income' ? (
                <CustomSelect
                  value={movementIncomeOriginId}
                  onChange={val => setMovementIncomeOriginId(val)}
                  options={[
                    {
                      value: 'general',
                      label: 'Ingreso General',
                      icon: ShoppingBag
                    },
                    ...deudasPorCobrar.map(d => ({
                      value: `deuda:${d.id}`,
                      label: `${d.nombre}${d.monto !== undefined && d.monto > 0 ? ` (${formatCurrency(d.monto, d.moneda)})` : ''}`,
                      group: 'Deudas a favor',
                      icon: CreditCard
                    }))
                  ]}
                />
              ) : (
                <CustomSelect
                  value={movementSourceId}
                  onChange={val => {
                    setMovementSourceId(val);
                    if (movementType === 'transfer' && val === movementDestTransferId) {
                      const accounts = [
                        ...data.billeteraItems.map(b => `billetera:${b.id}`),
                        ...(data.portfolioItems || []).map(p => `portfolio:${p.id}`)
                      ];
                      const other = accounts.find(a => a !== val) || '';
                      setMovementDestTransferId(other);
                    }
                  }}
                  options={[
                    ...data.billeteraItems.map(b => ({
                      value: `billetera:${b.id}`,
                      label: b.nombre,
                      group: 'Billetera'
                    })),
                    ...(data.portfolioItems || []).map(p => ({
                      value: `portfolio:${p.id}`,
                      label: p.nombre,
                      group: 'Portafolio'
                    }))
                  ]}
                />
              )}
            </div>

            {/* 2. Destino */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Destino
              </label>
              {movementType === 'expense' ? (
                <CustomSelect
                  value={movementExpenseDestId}
                  onChange={val => setMovementExpenseDestId(val)}
                  options={[
                    {
                      value: 'none',
                      label: 'Gasto General',
                      icon: ShoppingBag
                    },
                    ...data.creditCards.map(c => {
                      const deuda = calculateCardPurchasesTotal(c);
                      return {
                        value: `card:${c.id}`,
                        label: `${c.name}${deuda > 0 ? ` (${formatCurrency(deuda, c.moneda)})` : ''}`,
                        group: 'Tarjetas de Crédito',
                        icon: CreditCard
                      };
                    }),
                    ...deudasPorPagar.map(d => ({
                      value: `deuda:${d.id}`,
                      label: `${d.nombre}${d.monto !== undefined && d.monto > 0 ? ` (${formatCurrency(d.monto, d.moneda)})` : ''}`,
                      group: 'Deudas por pagar',
                      icon: CreditCard
                    }))
                  ]}
                />
              ) : movementType === 'income' ? (
                <CustomSelect
                  value={movementIncomeDestId}
                  onChange={val => setMovementIncomeDestId(val)}
                  options={[
                    ...data.billeteraItems.map(b => ({
                      value: `billetera:${b.id}`,
                      label: b.nombre,
                      group: 'Billetera'
                    })),
                    ...(data.portfolioItems || []).map(p => ({
                      value: `portfolio:${p.id}`,
                      label: p.nombre,
                      group: 'Portafolio'
                    }))
                  ]}
                />
              ) : (
                <CustomSelect
                  value={movementDestTransferId}
                  onChange={val => setMovementDestTransferId(val)}
                  options={[
                    ...data.billeteraItems
                      .filter(b => `billetera:${b.id}` !== movementSourceId && b.id !== movementSourceId)
                      .map(b => ({
                        value: `billetera:${b.id}`,
                        label: b.nombre,
                        group: 'Billetera'
                      })),
                    ...(data.portfolioItems || [])
                      .filter(p => `portfolio:${p.id}` !== movementSourceId && p.id !== movementSourceId)
                      .map(p => ({
                        value: `portfolio:${p.id}`,
                        label: p.nombre,
                        group: 'Portafolio'
                      }))
                  ]}
                />
              )}
            </div>

            {/* Si es transferencia entre monedas distintas, mostrar conversión TRM */}
            {movementType === 'transfer' && (() => {
              const isSrcPort = movementSourceId.startsWith('portfolio:');
              const rSrcId = movementSourceId.replace('portfolio:', '').replace('billetera:', '');
              const srcAcc = isSrcPort
                ? (data.portfolioItems || []).find(p => p.id === rSrcId)
                : (data.billeteraItems || []).find(b => b.id === rSrcId);
              const srcCurr = srcAcc?.moneda || 'COP';

              const isDstPort = movementDestTransferId.startsWith('portfolio:');
              const rDstId = movementDestTransferId.replace('portfolio:', '').replace('billetera:', '');
              const dstAcc = isDstPort
                ? (data.portfolioItems || []).find(p => p.id === rDstId)
                : (data.billeteraItems || []).find(b => b.id === rDstId);
              const dstCurr = dstAcc?.moneda || 'COP';

              const isDiff = srcCurr !== dstCurr;
              const numAmt = parseFloat(movementAmount) || 0;
              const rate = data.dolarRate || 3600;
              const convertedAmt =
                srcCurr === 'USD' && dstCurr === 'COP'
                  ? numAmt * rate
                  : rate > 0
                  ? numAmt / rate
                  : 0;

              if (!isDiff || numAmt <= 0) return null;

              return (
                <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 rounded-2xl text-xs space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 font-medium">
                    <span>Tasa de cambio (TRM):</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">
                      1 USD = {formatCurrency(rate, 'COP')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
                    <span>Se descuenta ({srcCurr}):</span>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrency(numAmt, srcCurr)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
                    <span>Se acredita ({dstCurr}):</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(convertedAmt, dstCurr)}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="flex items-center gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs py-3 rounded-2xl transition-colors border border-slate-300/80 dark:border-transparent text-center"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-2xl shadow-sm transition-all text-center"
            >
              Guardar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
