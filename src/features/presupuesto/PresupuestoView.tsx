import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, calculateCardPaymentDue } from '../../services/financeCalculations';
import { GastosFijosView } from '../gastos_fijos/GastosFijosView';
import { DeudasView } from '../deudas/DeudasView';
import {
  Receipt,
  ShieldCheck,
  Home,
  CreditCard,
  Layers,
  ArrowDownRight,
  ArrowLeftRight,
  Eye,
  X
} from 'lucide-react';

export const PresupuestoView: React.FC = () => {
  const { data, summary } = useFinance();
  const pres = summary.presupuesto;

  // Submenu: Presupuesto | Gastos | Deudas
  const [subView, setSubView] = useState<'presupuesto' | 'gastos' | 'deudas'>('presupuesto');

  // Fortnight detail popup modal state
  const [fortnightDetail, setFortnightDetail] = useState<'1st' | '2nd' | null>(null);

  const ratioYo = summary.ingresos.ratioYo || 1.0;
  const isShared = summary.ingresos.isShared;

  // Compute breakdown items for selected fortnight
  const selectedPeriod = fortnightDetail === '2nd' ? '2nd_fortnight' : '1st_fortnight';

  const housingItems = (data.housingExpenses || [])
    .filter(h => (fortnightDetail === '2nd' ? h.period === '2nd_fortnight' : h.period !== '2nd_fortnight'))
    .map(h => {
      const isItemShared = h.isShared !== false && isShared;
      const amount = isItemShared ? (h.totalAmount || 0) * ratioYo : (h.totalAmount || 0);
      return { id: h.id, name: h.name, amount };
    });

  const obligationItems = (data.obligations || [])
    .filter(o => (fortnightDetail === '2nd' ? o.period === '2nd_fortnight' : o.period !== '2nd_fortnight'))
    .map(o => {
      const monthlyVal = o.davidAmount !== undefined && o.davidAmount !== o.totalAmount && o.totalDebtBalance
        ? o.davidAmount
        : o.totalAmount;
      const isItemShared = o.isShared !== false && isShared;
      const amount = isItemShared ? (monthlyVal || 0) * ratioYo : (monthlyVal || 0);
      return { id: o.id, name: o.name, amount };
    });

  const cardItems = (data.creditCards || [])
    .filter(c => (fortnightDetail === '2nd' ? c.period === '2nd_fortnight' : c.period !== '2nd_fortnight'))
    .map(c => ({
      id: c.id,
      name: c.name,
      amount: calculateCardPaymentDue(c) || 0
    }));

  return (
    <div className="space-y-6 pb-2 animate-fadeIn">
      {/* Menú Superior de 3 opciones: Presupuesto | Gastos | Deudas */}
      <div className="flex items-center justify-center">
        <div className="bg-slate-200/80 dark:bg-slate-800 p-1 rounded-2xl flex items-center gap-1 shadow-inner border border-slate-300/80 dark:border-slate-700/60 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSubView('presupuesto')}
            className={`flex-1 sm:px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
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
            className={`flex-1 sm:px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              subView === 'gastos'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Home className="w-4 h-4" /> Gastos
          </button>
          <button
            type="button"
            onClick={() => setSubView('deudas')}
            className={`flex-1 sm:px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              subView === 'deudas'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" /> Deudas
          </button>
        </div>
      </div>

      {subView === 'gastos' ? (
        <GastosFijosView hideHeader={true} />
      ) : subView === 'deudas' ? (
        <DeudasView />
      ) : (
        <div className="space-y-6">
          {/* Lista de Gastos */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {/* 1. Deducciones de ley */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">Deducciones de ley</span>
                </div>
                <span className="font-bold text-blue-700 dark:text-blue-400 font-mono">
                  {formatCurrency(pres.m3_saludPension)}
                </span>
              </div>

              {/* 2. Vivienda */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center font-bold text-xs">
                    <Home className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">Vivienda</span>
                </div>
                <span className="font-bold text-blue-700 dark:text-blue-400 font-mono">
                  {formatCurrency(pres.m4_vivienda)}
                </span>
              </div>

              {/* 3. Obligaciones */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center font-bold text-xs">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">Obligaciones</span>
                </div>
                <span className="font-bold text-blue-700 dark:text-blue-400 font-mono">
                  {formatCurrency(pres.m6_obligaciones)}
                </span>
              </div>

              {/* 4. Tarjetas */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center font-bold text-xs">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">Tarjetas</span>
                </div>
                <span className="font-bold text-blue-700 dark:text-blue-400 font-mono">
                  {formatCurrency(pres.m5_tarjetas)}
                </span>
              </div>

              {/* 5. Gastos del mes */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/70 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                  <span className="font-black text-slate-900 dark:text-white">Gastos del mes</span>
                </div>
                <span className="font-black text-base text-slate-900 dark:text-white font-mono">
                  {formatCurrency(pres.m7_totalGastos)}
                </span>
              </div>
            </div>
          </div>

          {/* 3 Recuadros: Mitad de Mes, Fin de Mes, Disponible en vertical */}
          <div className="space-y-3">
            {/* Mitad de Mes (1ª Quincena) */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm transition-colors overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Mitad de Mes</span>
                <button
                  type="button"
                  onClick={() => setFortnightDetail('1st')}
                  className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                  title="Ver detalle de gastos de mitad de mes"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-base font-bold text-blue-700 dark:text-blue-400 font-mono tracking-tight">
                {formatCurrency(pres.m9_mitadDeMes)}
              </div>
            </div>

            {/* Fin de Mes (2ª Quincena) */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm transition-colors overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Fin de Mes</span>
                <button
                  type="button"
                  onClick={() => setFortnightDetail('2nd')}
                  className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                  title="Ver detalle de gastos de fin de mes"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-base font-bold text-blue-700 dark:text-blue-400 font-mono tracking-tight">
                {formatCurrency(pres.m10_finDeMes)}
              </div>
            </div>

            {/* Libre */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm transition-colors overflow-hidden">
              <span className="text-xs font-bold text-slate-900 dark:text-white block mb-1">Libre</span>
              <div className="text-base font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {formatCurrency(pres.m11_disponible)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ventana pequeña emergente con el detalle de gastos de la quincena */}
      {fortnightDetail !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl animate-scaleUp max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Gastos {fortnightDetail === '1st' ? 'Mitad de Mes (1ª Q)' : 'Fin de Mes (2ª Q)'}
              </h3>
              <button
                onClick={() => setFortnightDetail(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto py-3 space-y-2 flex-1 pr-1 scrollbar-thin">
              {/* Deducciones de Ley (50%) */}
              {pres.m3_saludPension > 0 && (
                <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Deducciones de Ley (50%)</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(pres.m3_saludPension / 2)}
                  </span>
                </div>
              )}

              {/* Vivienda Items */}
              {housingItems.map(item => (
                <div key={item.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Home className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white flex-shrink-0 ml-2">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}

              {/* Obligaciones Items */}
              {obligationItems.map(item => (
                <div key={item.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white flex-shrink-0 ml-2">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}

              {/* Tarjetas Items */}
              {cardItems.map(item => (
                <div key={item.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <CreditCard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate">Tarjeta {item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white flex-shrink-0 ml-2">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}

              {housingItems.length === 0 && obligationItems.length === 0 && cardItems.length === 0 && pres.m3_saludPension === 0 && (
                <div className="p-4 text-center text-xs text-slate-400">
                  No hay gastos asignados a esta quincena.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider">Total Quincena</span>
              <span className="font-mono font-black text-sm text-blue-600 dark:text-blue-400">
                {formatCurrency(fortnightDetail === '1st' ? pres.m9_mitadDeMes : pres.m10_finDeMes)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
