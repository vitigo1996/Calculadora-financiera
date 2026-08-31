import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { Receipt, ShieldCheck, Home, CreditCard, Layers, ArrowDownRight } from 'lucide-react';

export const PresupuestoView: React.FC = () => {
  const { summary, baseCurrency } = useFinance();
  const pres = summary.presupuesto;

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Presupuesto
        </h2>
      </div>

      {/* Lista de Gastos */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
          {/* 1. Deducciones de ley */}
          <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-semibold text-slate-800 dark:text-white">Deducciones de ley</span>
            </div>
            <span className="font-bold text-blue-700 dark:text-blue-400 font-mono">
              {formatCurrency(pres.m3_saludPension, baseCurrency)}
            </span>
          </div>

          {/* 2. Vivienda */}
          <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center font-bold text-xs">
                <Home className="w-4 h-4" />
              </div>
              <span className="font-semibold text-slate-800 dark:text-white">Vivienda</span>
            </div>
            <span className="font-bold text-blue-700 dark:text-blue-400 font-mono">
              {formatCurrency(pres.m4_vivienda, baseCurrency)}
            </span>
          </div>

          {/* 3. Obligaciones */}
          <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center font-bold text-xs">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-semibold text-slate-800 dark:text-white">Obligaciones</span>
            </div>
            <span className="font-bold text-blue-700 dark:text-blue-400 font-mono">
              {formatCurrency(pres.m6_obligaciones, baseCurrency)}
            </span>
          </div>

          {/* 4. Tarjetas */}
          <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center font-bold text-xs">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="font-semibold text-slate-800 dark:text-white">Tarjetas</span>
            </div>
            <span className="font-bold text-blue-700 dark:text-blue-400 font-mono">
              {formatCurrency(pres.m5_tarjetas, baseCurrency)}
            </span>
          </div>

          {/* 5. Gastos del mes */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/70 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                <ArrowDownRight className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-800 dark:text-white">Gastos del mes</span>
            </div>
            <span className="font-black text-base text-slate-800 dark:text-slate-100 font-mono">
              {formatCurrency(pres.m7_totalGastos, baseCurrency)}
            </span>
          </div>
        </div>
      </div>

      {/* 3 Recuadros: Mitad de Mes, Fin de Mes, Disponible */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Mitad de Mes (1ª Quincena) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 block">Mitad de Mes</span>
          <div className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-400 mt-1 font-mono">
            {formatCurrency(pres.m9_mitadDeMes, baseCurrency)}
          </div>
        </div>

        {/* Fin de Mes (2ª Quincena) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 block">Fin de Mes</span>
          <div className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-400 mt-1 font-mono">
            {formatCurrency(pres.m10_finDeMes, baseCurrency)}
          </div>
        </div>

        {/* Disponible */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-300 dark:border-blue-500/30 shadow-sm transition-colors">
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 block">Disponible</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-1 font-mono">
            {formatCurrency(pres.m11_disponible, baseCurrency)}
          </div>
        </div>
      </div>
    </div>
  );
};
