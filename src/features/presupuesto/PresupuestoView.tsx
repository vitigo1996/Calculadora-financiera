import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { GastosFijosView } from '../gastos_fijos/GastosFijosView';
import {
  Receipt,
  ShieldCheck,
  Home,
  CreditCard,
  Layers
} from 'lucide-react';

export const PresupuestoView: React.FC = () => {
  const { summary } = useFinance();
  const pres = summary.presupuesto;

  // Submenu: Presupuesto | Gastos
  const [subView, setSubView] = useState<'presupuesto' | 'gastos'>('presupuesto');

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
          {/* Lista de Gastos Presupuestados */}
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
          </div>
        </div>
      )}
    </div>
  );
};
