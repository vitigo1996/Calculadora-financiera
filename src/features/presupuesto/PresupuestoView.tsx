import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { Receipt, ShieldCheck, Home, CreditCard, Layers, CheckCircle2, ArrowDownRight } from 'lucide-react';

export const PresupuestoView: React.FC = () => {
  const { summary, baseCurrency } = useFinance();
  const p1 = summary.p1;
  const pres = summary.presupuesto;

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Presupuesto & Flujo Quincenal
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Control de compromisos quincenales, gastos fijos y dinero disponible
        </p>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Disponible */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-300 dark:border-blue-500/30 shadow-sm transition-colors">
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 block">Disponible del Mes</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-1 font-mono">
            {formatCurrency(pres.m11_disponible, baseCurrency)}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
            Ingreso neto menos el total de gastos
          </span>
        </div>

        {/* 1ra Quincena */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 block">Mitad de Mes (1ª Quincena)</span>
          <div className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-400 mt-1 font-mono">
            {formatCurrency(pres.m9_mitadDeMes, baseCurrency)}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
            Servicios, Falabella, Addi, Carro, Icetex y Salud
          </span>
        </div>

        {/* 2da Quincena */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 block">Fin de Mes (2ª Quincena)</span>
          <div className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-400 mt-1 font-mono">
            {formatCurrency(pres.m10_finDeMes, baseCurrency)}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
            Arriendo, Tarjeta Nu y Salud
          </span>
        </div>
      </div>

      {/* Tabla Oficial de Presupuesto */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">Resumen de Gastos Mensuales</h3>
          <span className="text-xs font-mono text-blue-700 dark:text-blue-400">
            Ingreso {p1.name}: {formatCurrency(p1.income, baseCurrency)}
          </span>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
          {/* Salud / Pensión */}
          <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-800 dark:text-white block">Salud & Pensión</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Deducción de ley (8% del ingreso de {p1.name})</span>
              </div>
            </div>
            <span className="font-bold text-blue-700 dark:text-blue-400 font-mono">
              {formatCurrency(pres.m3_saludPension, baseCurrency)}
            </span>
          </div>

          {/* Vivienda */}
          <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center font-bold text-xs">
                <Home className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-800 dark:text-white block">Vivienda</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Servicios públicos, internet y arriendo</span>
              </div>
            </div>
            <span className="font-bold text-blue-700 dark:text-blue-400 font-mono">
              {formatCurrency(pres.m4_vivienda, baseCurrency)}
            </span>
          </div>

          {/* Tarjetas */}
          <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center font-bold text-xs">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-800 dark:text-white block">Tarjetas de Crédito</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Pagos mensuales de Nu, Falabella y Addi</span>
              </div>
            </div>
            <span className="font-bold text-blue-700 dark:text-blue-400 font-mono">
              {formatCurrency(pres.m5_tarjetas, baseCurrency)}
            </span>
          </div>

          {/* Obligaciones */}
          <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center font-bold text-xs">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-800 dark:text-white block">Obligaciones</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Cuotas fijas de Carro e Icetex</span>
              </div>
            </div>
            <span className="font-bold text-blue-700 dark:text-blue-400 font-mono">
              {formatCurrency(pres.m6_obligaciones, baseCurrency)}
            </span>
          </div>

          {/* Total Gastos */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/70 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                <ArrowDownRight className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-800 dark:text-white block">Total Gastos del Mes</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Suma de salud, vivienda, tarjetas y obligaciones</span>
              </div>
            </div>
            <span className="font-black text-base text-slate-800 dark:text-slate-100 font-mono">
              {formatCurrency(pres.m7_totalGastos, baseCurrency)}
            </span>
          </div>

          {/* Mitad de mes */}
          <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                1ª
              </div>
              <div>
                <span className="font-semibold text-slate-800 dark:text-white block">Mitad de mes (1ª Quincena)</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Servicios, Internet, Falabella, Addi, Carro, Icetex y Salud</span>
              </div>
            </div>
            <span className="font-bold text-blue-700 dark:text-blue-400 font-mono">
              {formatCurrency(pres.m9_mitadDeMes, baseCurrency)}
            </span>
          </div>

          {/* Fin de mes */}
          <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                2ª
              </div>
              <div>
                <span className="font-semibold text-slate-800 dark:text-white block">Fin de mes (2ª Quincena)</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Arriendo, Tarjeta Nu y Salud</span>
              </div>
            </div>
            <span className="font-bold text-blue-700 dark:text-blue-400 font-mono">
              {formatCurrency(pres.m10_finDeMes, baseCurrency)}
            </span>
          </div>

          {/* Disponible */}
          <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 flex items-center justify-between border-t border-slate-200 dark:border-blue-500/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-800 dark:text-white block">Disponible / Ahorro Libre</span>
                <span className="text-xs text-blue-600 dark:text-blue-400/80">Excedente neto tras cubrir todos los compromisos</span>
              </div>
            </div>
            <span className="font-black text-lg text-blue-700 dark:text-blue-400 font-mono">
              {formatCurrency(pres.m11_disponible, baseCurrency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
