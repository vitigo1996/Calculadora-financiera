import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, calculateCardPaymentDue } from '../../services/financeCalculations';
import { GastosFijosView } from '../gastos_fijos/GastosFijosView';
import {
  Receipt,
  ShieldCheck,
  Home,
  CreditCard,
  Layers,
  Eye,
  X
} from 'lucide-react';

export const PresupuestoView: React.FC = () => {
  const { data, summary } = useFinance();
  const pres = summary.presupuesto;

  // Submenu: Presupuesto | Gastos
  const [subView, setSubView] = useState<'presupuesto' | 'gastos'>('presupuesto');
  const [fortnightDetail, setFortnightDetail] = useState<'mitad' | 'fin' | null>(null);

  // Determinar los ítems a pagar según su fecha límite de pago
  const isShared = summary.ingresos.isShared;
  const ratioYo = summary.ingresos.ratioYo;

  // 1. Vivienda
  const housingItems = (data.housingExpenses || []).map(h => {
    const isItemShared = h.isShared !== false && isShared;
    const amount = isItemShared ? (h.totalAmount || 0) * ratioYo : (h.totalAmount || 0);
    return {
      id: h.id,
      name: h.name,
      type: 'Vivienda',
      period: h.period,
      paymentDay: h.paymentDay,
      amount,
      icon: Home
    };
  });

  // 2. Obligaciones
  const obligationItems = (data.obligations || []).map(ob => {
    const monthlyVal = ob.davidAmount !== undefined && ob.davidAmount !== ob.totalAmount && ob.totalDebtBalance
      ? ob.davidAmount
      : ob.totalAmount;
    const isObShared = ob.isShared !== false && isShared;
    const amount = isObShared ? (monthlyVal || 0) * ratioYo : (monthlyVal || 0);
    return {
      id: ob.id,
      name: ob.name,
      type: 'Obligación',
      period: ob.period,
      paymentDay: ob.paymentDay,
      amount,
      icon: Layers
    };
  });

  // 3. Tarjetas
  const cardItems = (data.creditCards || []).map(cc => {
    const amount = calculateCardPaymentDue(cc);
    return {
      id: cc.id,
      name: cc.name,
      type: 'Tarjeta',
      period: cc.period,
      paymentDay: cc.paymentDay,
      amount,
      icon: CreditCard
    };
  });

  const allPayableItems = [...housingItems, ...obligationItems, ...cardItems];

  // Mitad de Mes: gastos con fecha de pago entre el 16 y el último día del mes (pagados con la quincena del 15)
  const mitadDeMesItems = allPayableItems
    .filter(item => {
      const day = item.paymentDay ?? (item.period === '2nd_fortnight' ? 16 : 1);
      return day >= 16;
    })
    .sort((a, b) => (a.paymentDay || 16) - (b.paymentDay || 16));

  // Fin de Mes: gastos con fecha de pago entre el 1 y el 15 (pagados con la quincena de fin de mes)
  const finDeMesItems = allPayableItems
    .filter(item => {
      const day = item.paymentDay ?? (item.period === '2nd_fortnight' ? 16 : 1);
      return day <= 15;
    })
    .sort((a, b) => (a.paymentDay || 1) - (b.paymentDay || 1));

  const halfSalud = (pres.m3_saludPension || 0) / 2;
  const totalMitadDeMes = mitadDeMesItems.reduce((sum, item) => sum + item.amount, 0) + halfSalud;
  const totalFinDeMes = finDeMesItems.reduce((sum, item) => sum + item.amount, 0) + halfSalud;

  return (
    <div className="space-y-6 pb-2 animate-fadeIn">
      {/* Menú Superior de 2 opciones: Presupuesto | Gastos */}
      <div className="sticky top-0 z-30 bg-slate-50 dark:bg-slate-900 pt-1 pb-2.5 -mx-3.5 px-3.5 flex items-center justify-center border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="bg-slate-200/80 dark:bg-slate-800 p-1 rounded-2xl flex items-center gap-1 shadow-inner border border-slate-300/80 dark:border-slate-700/60 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSubView('presupuesto')}
            className={`flex-1 sm:px-8 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              subView === 'presupuesto'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4" /> Presupuesto
          </button>
          <button
            type="button"
            onClick={() => setSubView('gastos')}
            className={`flex-1 sm:px-8 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              subView === 'gastos'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Home className="w-4 h-4" /> Gastos
          </button>
        </div>
      </div>

      {subView === 'gastos' ? (
        <GastosFijosView hideHeader={true} />
      ) : (
        <div className="space-y-6">
          {/* Primera Tabla: Gastos Presupuestados sin título */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {/* 1. Deducciones de ley */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="font-bold text-slate-900 dark:text-white">Deducciones de ley</span>
                </div>
                <span className="font-bold text-blue-700 dark:text-blue-400 font-mono">
                  {formatCurrency(pres.m3_saludPension)}
                </span>
              </div>

              {/* 2. Vivienda */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Home className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="font-bold text-slate-900 dark:text-white">Vivienda</span>
                </div>
                <span className="font-bold text-blue-700 dark:text-blue-400 font-mono">
                  {formatCurrency(pres.m4_vivienda)}
                </span>
              </div>

              {/* 3. Obligaciones */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="font-bold text-slate-900 dark:text-white">Obligaciones</span>
                </div>
                <span className="font-bold text-blue-700 dark:text-blue-400 font-mono">
                  {formatCurrency(pres.m6_obligaciones)}
                </span>
              </div>

              {/* 4. Tarjetas */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="font-bold text-slate-900 dark:text-white">Tarjetas</span>
                </div>
                <span className="font-bold text-blue-700 dark:text-blue-400 font-mono">
                  {formatCurrency(pres.m5_tarjetas)}
                </span>
              </div>
            </div>

            {/* Línea pequeña y discreta con el total del gasto */}
            <div className="px-4 py-2.5 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Total gastos
              </span>
              <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                {formatCurrency(pres.m7_totalGastos)}
              </span>
            </div>
          </div>

          {/* Segunda Sección: Distribución en 2 bloques (Mitad de Mes y Fin de Mes) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Bloque 1: Mitad de Mes */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm transition-colors flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Mitad de Mes
                </span>
                <button
                  type="button"
                  onClick={() => setFortnightDetail('mitad')}
                  className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shadow-xs"
                  title="Ver detalle de gastos"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-base font-bold text-blue-700 dark:text-blue-400 font-mono tracking-tight">
                {formatCurrency(totalMitadDeMes)}
              </div>
            </div>

            {/* Bloque 2: Fin de Mes */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm transition-colors flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Fin de Mes
                </span>
                <button
                  type="button"
                  onClick={() => setFortnightDetail('fin')}
                  className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shadow-xs"
                  title="Ver detalle de gastos"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-base font-bold text-blue-700 dark:text-blue-400 font-mono tracking-tight">
                {formatCurrency(totalFinDeMes)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ventana pequeña emergente con la pequeña tabla de gastos de cada mitad */}
      {fortnightDetail !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl animate-scaleUp max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {fortnightDetail === 'mitad' ? 'Mitad de Mes' : 'Fin de Mes'}
              </h3>
              <button
                type="button"
                onClick={() => setFortnightDetail(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto py-2 space-y-1 flex-1 pr-1 scrollbar-thin">
              {halfSalud > 0 && (
                <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                      Deducciones de Ley (50%)
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white flex-shrink-0 ml-2">
                    {formatCurrency(halfSalud)}
                  </span>
                </div>
              )}

              {(fortnightDetail === 'mitad' ? mitadDeMesItems : finDeMesItems).map(item => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800/60"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white flex-shrink-0 ml-2">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                );
              })}

              {(fortnightDetail === 'mitad' ? mitadDeMesItems : finDeMesItems).length === 0 && halfSalud === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                  No hay gastos asignados para este periodo.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
