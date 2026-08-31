import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { Receipt, Calendar, ShieldCheck, Home, CreditCard, Layers, CheckCircle2 } from 'lucide-react';

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
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Receipt className="w-5 h-5 text-emerald-400" /> Presupuesto General
        </h2>
        <p className="text-xs text-slate-400">
          Tabla de presupuesto oficial de las columnas K y M (Filas 2 a 11) del Excel
        </p>
      </div>

      {/* Top Cards: Disponible, Mitad de mes, Fin de mes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Disponible */}
        <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 p-5 rounded-3xl border border-emerald-500/30 shadow-xl">
          <span className="text-xs font-semibold text-emerald-400 block">Disponible (M11)</span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1 font-mono">
            {formatCurrency(pres.m11_disponible, 'COP')}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            =H3-SUM(M3:M6) (Ingreso - Total Gastos)
          </span>
        </div>

        {/* Mitad de mes */}
        <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl">
          <span className="text-xs font-semibold text-blue-400 block">Mitad de mes (M9)</span>
          <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-1 font-mono">
            {formatCurrency(pres.m9_mitadDeMes, 'COP')}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            1ª Quincena (Servicios + Falabella + Addi + Carro + Icetex + Salud/2)
          </span>
        </div>

        {/* Fin de mes */}
        <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl">
          <span className="text-xs font-semibold text-purple-400 block">Fin de mes (M10)</span>
          <div className="text-2xl sm:text-3xl font-black text-purple-400 mt-1 font-mono">
            {formatCurrency(pres.m10_finDeMes, 'COP')}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            2ª Quincena (Arriendo + Nu + Salud/2)
          </span>
        </div>
      </div>

      {/* Tabla Oficial de Presupuesto (Columnas K y M) */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm">Desglose de la Tabla de Presupuesto</h3>
          <span className="text-xs font-mono text-emerald-400">Ingreso {p1.name} (H3): {formatCurrency(p1.income, 'COP')}</span>
        </div>

        <div className="divide-y divide-slate-800/80 text-sm">
          {/* M3: Salud / Pensión */}
          <div className="p-4 hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs">
                M3
              </span>
              <div>
                <span className="font-semibold text-white block">Salud / Pensión</span>
                <span className="text-xs text-slate-400 font-mono">=H3*0.08 (8% de {p1.name})</span>
              </div>
            </div>
            <span className="font-bold text-cyan-400 font-mono">
              {formatCurrency(pres.m3_saludPension, 'COP')}
            </span>
          </div>

          {/* M4: Vivienda */}
          <div className="p-4 hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                M4
              </span>
              <div>
                <span className="font-semibold text-white block">Vivienda</span>
                <span className="text-xs text-slate-400 font-mono">=SUM(H7:H9) (Servicios + Internet + Arriendo)</span>
              </div>
            </div>
            <span className="font-bold text-blue-400 font-mono">
              {formatCurrency(pres.m4_vivienda, 'COP')}
            </span>
          </div>

          {/* M5: Tarjetas */}
          <div className="p-4 hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-xs">
                M5
              </span>
              <div>
                <span className="font-semibold text-white block">Tarjetas de crédito</span>
                <span className="text-xs text-slate-400 font-mono">=SUM(H16:H18) (Nu + Falabella + Addi)</span>
              </div>
            </div>
            <span className="font-bold text-rose-400 font-mono">
              {formatCurrency(pres.m5_tarjetas, 'COP')}
            </span>
          </div>

          {/* M6: Obligaciones */}
          <div className="p-4 hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs">
                M6
              </span>
              <div>
                <span className="font-semibold text-white block">Obligaciones</span>
                <span className="text-xs text-slate-400 font-mono">=SUM(H12:H13) (Carro + Icetex)</span>
              </div>
            </div>
            <span className="font-bold text-purple-400 font-mono">
              {formatCurrency(pres.m6_obligaciones, 'COP')}
            </span>
          </div>

          {/* M7: Total Gastos */}
          <div className="p-4 bg-slate-950/70 flex items-center justify-between border-t border-slate-800">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold text-xs">
                M7
              </span>
              <div>
                <span className="font-bold text-white block">Total Gastos</span>
                <span className="text-xs text-slate-400 font-mono">=SUM(M3:M6)</span>
              </div>
            </div>
            <span className="font-black text-base text-rose-400 font-mono">
              {formatCurrency(pres.m7_totalGastos, 'COP')}
            </span>
          </div>

          {/* M9: Mitad de mes */}
          <div className="p-4 hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                M9
              </span>
              <div>
                <span className="font-semibold text-white block">Mitad de mes</span>
                <span className="text-xs text-slate-400 font-mono">=H7+H8+H17+H18+H12+H13+(M3/2)</span>
              </div>
            </div>
            <span className="font-bold text-blue-400 font-mono">
              {formatCurrency(pres.m9_mitadDeMes, 'COP')}
            </span>
          </div>

          {/* M10: Fin de mes */}
          <div className="p-4 hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs">
                M10
              </span>
              <div>
                <span className="font-semibold text-white block">Fin de mes</span>
                <span className="text-xs text-slate-400 font-mono">=H9+H16+(M3/2)</span>
              </div>
            </div>
            <span className="font-bold text-purple-400 font-mono">
              {formatCurrency(pres.m10_finDeMes, 'COP')}
            </span>
          </div>

          {/* M11: Disponible */}
          <div className="p-4 bg-emerald-950/30 flex items-center justify-between border-t border-emerald-500/20">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                M11
              </span>
              <div>
                <span className="font-bold text-emerald-300 block">Disponible</span>
                <span className="text-xs text-emerald-400/80 font-mono">=H3-SUM(M3:M6)</span>
              </div>
            </div>
            <span className="font-black text-lg text-emerald-400 font-mono">
              {formatCurrency(pres.m11_disponible, 'COP')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
