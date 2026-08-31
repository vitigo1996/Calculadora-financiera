import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { Receipt, Calendar, ShieldCheck, Home, CreditCard, Layers, CheckCircle2, Wallet, ArrowDownRight } from 'lucide-react';

export const PresupuestoView: React.FC = () => {
  const { summary } = useFinance();
  const isShared = summary.mode === 'shared' && summary.p2.enabled;
  const p1 = summary.p1;
  const p2 = summary.p2;
  const pres = summary.presupuesto;

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Presupuesto & Flujo Quincenal
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Control de compromisos quincenales, gastos fijos y dinero disponible
        </p>
      </div>

      {/* Top 3 KPI Cards: Disponible, 1ra Quincena, 2da Quincena */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Disponible */}
        <div className="bg-emerald-50 dark:bg-slate-900 p-5 rounded-3xl border border-emerald-200 dark:border-emerald-500/30 shadow-sm transition-colors">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block">Disponible del Mes</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-1 font-mono">
            {formatCurrency(pres.m11_disponible, 'COP')}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
            Ingreso neto menos el total de gastos
          </span>
        </div>

        {/* 1ra Quincena */}
        <div className="bg-sky-50 dark:bg-slate-900 p-5 rounded-3xl border border-sky-200 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-xs font-semibold text-sky-700 dark:text-sky-400 block">Mitad de Mes (1ª Quincena)</span>
          <div className="text-2xl sm:text-3xl font-black text-sky-700 dark:text-sky-400 mt-1 font-mono">
            {formatCurrency(pres.m9_mitadDeMes, 'COP')}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
            Servicios, Falabella, Addi, Carro, Icetex y Salud
          </span>
        </div>

        {/* 2da Quincena */}
        <div className="bg-purple-50 dark:bg-slate-900 p-5 rounded-3xl border border-purple-200 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 block">Fin de Mes (2ª Quincena)</span>
          <div className="text-2xl sm:text-3xl font-black text-purple-700 dark:text-purple-400 mt-1 font-mono">
            {formatCurrency(pres.m10_finDeMes, 'COP')}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
            Arriendo, Tarjeta Nu y Salud
          </span>
        </div>
      </div>

      {/* Tabla Oficial de Presupuesto */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">Resumen de Gastos Mensuales</h3>
          <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400">
            Ingreso {p1.name}: {formatCurrency(p1.income, 'COP')}
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
          {/* Salud / Pensión */}
          <div className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/40 flex items-center justify-center font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-800 dark:text-white block">Salud & Pensión</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Deducción de ley (8% del ingreso de {p1.name})</span>
              </div>
            </div>
            <span className="font-bold text-cyan-700 dark:text-cyan-400 font-mono">
              {formatCurrency(pres.m3_saludPension, 'COP')}
            </span>
          </div>

          {/* Vivienda */}
          <div className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/40 flex items-center justify-center font-bold text-xs">
                <Home className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-800 dark:text-white block">Vivienda</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Servicios públicos, internet y arriendo</span>
              </div>
            </div>
            <span className="font-bold text-sky-700 dark:text-sky-400 font-mono">
              {formatCurrency(pres.m4_vivienda, 'COP')}
            </span>
          </div>

          {/* Tarjetas */}
          <div className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 flex items-center justify-center font-bold text-xs">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-800 dark:text-white block">Tarjetas de Crédito</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Pagos mensuales de Nu, Falabella y Addi</span>
              </div>
            </div>
            <span className="font-bold text-rose-700 dark:text-rose-400 font-mono">
              {formatCurrency(pres.m5_tarjetas, 'COP')}
            </span>
          </div>

          {/* Obligaciones */}
          <div className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40 flex items-center justify-center font-bold text-xs">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-800 dark:text-white block">Obligaciones</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Cuotas fijas de Carro e Icetex</span>
              </div>
            </div>
            <span className="font-bold text-purple-700 dark:text-purple-400 font-mono">
              {formatCurrency(pres.m6_obligaciones, 'COP')}
            </span>
          </div>

          {/* Total Gastos */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/70 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 flex items-center justify-center font-bold text-xs">
                <ArrowDownRight className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-800 dark:text-white block">Total Gastos del Mes</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Suma de salud, vivienda, tarjetas y obligaciones</span>
              </div>
            </div>
            <span className="font-black text-base text-rose-700 dark:text-rose-400 font-mono">
              {formatCurrency(pres.m7_totalGastos, 'COP')}
            </span>
          </div>

          {/* Mitad de mes */}
          <div className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-xs">
                1ª
              </div>
              <div>
                <span className="font-semibold text-slate-800 dark:text-white block">Mitad de mes (1ª Quincena)</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Servicios, Internet, Falabella, Addi, Carro, Icetex y Salud</span>
              </div>
            </div>
            <span className="font-bold text-sky-700 dark:text-sky-400 font-mono">
              {formatCurrency(pres.m9_mitadDeMes, 'COP')}
            </span>
          </div>

          {/* Fin de mes */}
          <div className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs">
                2ª
              </div>
              <div>
                <span className="font-semibold text-slate-800 dark:text-white block">Fin de mes (2ª Quincena)</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Arriendo, Tarjeta Nu y Salud</span>
              </div>
            </div>
            <span className="font-bold text-purple-700 dark:text-purple-400 font-mono">
              {formatCurrency(pres.m10_finDeMes, 'COP')}
            </span>
          </div>

          {/* Disponible */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-between border-t border-emerald-200 dark:border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-emerald-800 dark:text-emerald-300 block">Disponible / Ahorro Libre</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400/80">Excedente neto tras cubrir todos los compromisos</span>
              </div>
            </div>
            <span className="font-black text-lg text-emerald-700 dark:text-emerald-400 font-mono">
              {formatCurrency(pres.m11_disponible, 'COP')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
