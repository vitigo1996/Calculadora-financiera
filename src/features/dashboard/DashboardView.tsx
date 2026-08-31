import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import {
  Wallet,
  Calendar,
  ShieldCheck,
  Home,
  CreditCard,
  Layers,
  ArrowUpRight,
  TrendingDown,
  DollarSign,
  AlertCircle
} from 'lucide-react';

export const DashboardView: React.FC<{ onNavigate: (tab: any) => void }> = ({ onNavigate }) => {
  const { data, summary } = useFinance();
  const isShared = summary.mode === 'shared' && summary.p2.enabled;
  const p1 = summary.p1;
  const p2 = summary.p2;

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Top Banner: Presupuesto & Disponible */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-5 md:p-7 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-4 h-4" /> Billetera & Presupuesto
            </span>
            <div className="text-3xl md:text-4xl font-black text-white mt-1">
              {formatCurrency(p1.disponible, 'COP')}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Disponible / Ahorro Libre Mensual (Ingreso - Total Gastos)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('budget')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" /> Ver Quincenas
            </button>
            <button
              onClick={() => onNavigate('cards')}
              className="bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs px-4 py-2.5 rounded-2xl border border-slate-700 transition-all flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-rose-400" /> Tarjetas
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60">
            <span className="text-[11px] text-slate-400 block">Ingreso {p1.name}</span>
            <span className="text-sm font-bold text-white block mt-0.5">
              {formatCurrency(p1.income, 'COP')}
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60">
            <span className="text-[11px] text-slate-400 block">Total Gastos {p1.name}</span>
            <span className="text-sm font-bold text-rose-400 block mt-0.5">
              {formatCurrency(p1.totalGastos, 'COP')}
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60">
            <span className="text-[11px] text-slate-400 block">Mitad de Mes (1ª)</span>
            <span className="text-sm font-bold text-blue-400 block mt-0.5">
              {formatCurrency(p1.mitadDeMes, 'COP')}
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60">
            <span className="text-[11px] text-slate-400 block">Fin de Mes (2ª)</span>
            <span className="text-sm font-bold text-purple-400 block mt-0.5">
              {formatCurrency(p1.finDeMes, 'COP')}
            </span>
          </div>
        </div>
      </div>

      {/* Pareja / Reparto Proporcional (si está en modo compartido) */}
      {isShared && (
        <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Reparto Proporcional de Ingresos (Fila 4 del Excel)
            </h3>
            <span className="text-xs text-slate-400">
              Total: <strong className="text-white">{formatCurrency(p1.income + p2.income, 'COP')}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
              <span className="text-xs text-emerald-400 font-bold block">{p1.name}</span>
              <span className="text-base font-black text-white">{formatCurrency(p1.income, 'COP')}</span>
              <span className="text-[11px] text-emerald-400/80 block mt-0.5">
                Proporción (H4): {(p1.ratio * 100).toFixed(1)}%
              </span>
            </div>

            <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
              <span className="text-xs text-indigo-400 font-bold block">{p2.name}</span>
              <span className="text-base font-black text-white">{formatCurrency(p2.income, 'COP')}</span>
              <span className="text-[11px] text-indigo-400/80 block mt-0.5">
                Proporción (I4): {(p2.ratio * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabla Oficial de Presupuesto del Excel (Filas 2 a 11) */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm">
            Tabla de Presupuesto Oficial (Columnas K y M del Excel)
          </h3>
          <span className="text-xs font-mono text-slate-400">Hoja: Billetera</span>
        </div>

        <div className="divide-y divide-slate-800/80 text-sm">
          {/* Salud / Pension */}
          <div className="p-4 hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs">
                M3
              </div>
              <div>
                <span className="font-semibold text-white block">Salud / Pensión</span>
                <span className="text-[11px] text-slate-400">Fórmula: =H3*0.08 (8% del ingreso de {p1.name})</span>
              </div>
            </div>
            <span className="font-bold text-cyan-400 font-mono">
              {formatCurrency(p1.healthPension, 'COP')}
            </span>
          </div>

          {/* Vivienda */}
          <div className="p-4 hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                M4
              </div>
              <div>
                <span className="font-semibold text-white block">Vivienda</span>
                <span className="text-[11px] text-slate-400">Fórmula: =SUM(H7:H9) (Servicios + Internet + Arriendo)</span>
              </div>
            </div>
            <span className="font-bold text-blue-400 font-mono">
              {formatCurrency(p1.housingTotal, 'COP')}
            </span>
          </div>

          {/* Tarjetas */}
          <div className="p-4 hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-xs">
                M5
              </div>
              <div>
                <span className="font-semibold text-white block">Tarjetas de Crédito</span>
                <span className="text-[11px] text-slate-400">Fórmula: =SUM(H16:H18) (Nu + Falabella + Addi)</span>
              </div>
            </div>
            <span className="font-bold text-rose-400 font-mono">
              {formatCurrency(p1.cardsTotal, 'COP')}
            </span>
          </div>

          {/* Obligaciones */}
          <div className="p-4 hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs">
                M6
              </div>
              <div>
                <span className="font-semibold text-white block">Obligaciones</span>
                <span className="text-[11px] text-slate-400">Fórmula: =SUM(H12:H13) (Carro + Icetex)</span>
              </div>
            </div>
            <span className="font-bold text-purple-400 font-mono">
              {formatCurrency(p1.obligationsTotal, 'COP')}
            </span>
          </div>

          {/* Total Gastos */}
          <div className="p-4 bg-slate-950/70 flex items-center justify-between border-t border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold text-xs">
                M7
              </div>
              <div>
                <span className="font-bold text-white block">Total Gastos</span>
                <span className="text-[11px] text-slate-400">Fórmula: =SUM(M3:M6)</span>
              </div>
            </div>
            <span className="font-extrabold text-base text-rose-400 font-mono">
              {formatCurrency(p1.totalGastos, 'COP')}
            </span>
          </div>

          {/* Mitad de mes */}
          <div className="p-4 hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                M9
              </div>
              <div>
                <span className="font-semibold text-white block">Mitad de mes (1ª Quincena)</span>
                <span className="text-[11px] text-slate-400">Servicios + Internet + Falabella + Addi + Carro + Icetex + (Salud/2)</span>
              </div>
            </div>
            <span className="font-bold text-blue-400 font-mono">
              {formatCurrency(p1.mitadDeMes, 'COP')}
            </span>
          </div>

          {/* Fin de mes */}
          <div className="p-4 hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs">
                M10
              </div>
              <div>
                <span className="font-semibold text-white block">Fin de mes (2ª Quincena)</span>
                <span className="text-[11px] text-slate-400">Arriendo + Nu + (Salud/2)</span>
              </div>
            </div>
            <span className="font-bold text-purple-400 font-mono">
              {formatCurrency(p1.finDeMes, 'COP')}
            </span>
          </div>

          {/* Disponible */}
          <div className="p-4 bg-emerald-950/30 flex items-center justify-between border-t border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                M11
              </div>
              <div>
                <span className="font-bold text-emerald-300 block">Disponible</span>
                <span className="text-[11px] text-emerald-400/80">Fórmula: =H3-SUM(M3:M6)</span>
              </div>
            </div>
            <span className="font-extrabold text-lg text-emerald-400 font-mono">
              {formatCurrency(p1.disponible, 'COP')}
            </span>
          </div>
        </div>
      </div>

      {/* Otras Deudas & Gastos del Excel (Filas 18, 22-24) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Deuda Autofinanciera */}
        <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Deuda (Fila 18 de B, C)</span>
            <h4 className="font-bold text-white text-base mt-0.5">Autofinanciera</h4>
            <span className="text-[11px] text-slate-400">Monto total registrado</span>
          </div>
          <div className="text-lg font-black text-rose-400 font-mono">
            {formatCurrency(data.deudaAutofinanciera, 'COP')}
          </div>
        </div>

        {/* Gastos Anuales / Eventuales */}
        <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-lg">
          <span className="text-xs text-slate-400 block mb-2">Gastos Eventuales (Filas 22-24)</span>
          <div className="flex flex-wrap gap-2">
            {data.annualExpenses.map(item => (
              <span key={item.id} className="text-xs bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 text-slate-300 font-medium">
                {item.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
