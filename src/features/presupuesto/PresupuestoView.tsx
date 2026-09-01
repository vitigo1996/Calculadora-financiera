import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { GastosFijosView } from '../gastos_fijos/GastosFijosView';
import { DeudasView } from '../deudas/DeudasView';
import { Receipt, ShieldCheck, Home, CreditCard, Layers, ArrowDownRight, ArrowLeftRight } from 'lucide-react';

export const PresupuestoView: React.FC = () => {
  const { summary } = useFinance();
  const pres = summary.presupuesto;

  // Submenu: Presupuesto | Gastos | Deudas
  const [subView, setSubView] = useState<'presupuesto' | 'gastos' | 'deudas'>('presupuesto');

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
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

          {/* 3 Recuadros: Mitad de Mes, Fin de Mes, Disponible */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Mitad de Mes (1ª Quincena) */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm transition-colors overflow-hidden">
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 block mb-1">Mitad de Mes</span>
              <div className="text-sm sm:text-base font-bold text-blue-700 dark:text-blue-400 font-mono tracking-tight whitespace-nowrap">
                {formatCurrency(pres.m9_mitadDeMes)}
              </div>
            </div>

            {/* Fin de Mes (2ª Quincena) */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm transition-colors overflow-hidden">
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 block mb-1">Fin de Mes</span>
              <div className="text-sm sm:text-base font-bold text-blue-700 dark:text-blue-400 font-mono tracking-tight whitespace-nowrap">
                {formatCurrency(pres.m10_finDeMes)}
              </div>
            </div>

            {/* Libre */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm transition-colors overflow-hidden">
              <span className="text-xs font-bold text-slate-900 dark:text-white block mb-1">Libre</span>
              <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono tracking-tight whitespace-nowrap">
                {formatCurrency(pres.m11_disponible)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
