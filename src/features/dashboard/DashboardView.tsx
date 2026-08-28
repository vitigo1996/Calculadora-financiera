import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  ShieldCheck,
  Home,
  CreditCard,
  Layers,
  Sparkles,
  PieChart as PieChartIcon,
  PiggyBank,
  CheckCircle2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const DashboardView: React.FC<{ onNavigate: (tab: any) => void }> = ({ onNavigate }) => {
  const { data, summary } = useFinance();
  const [p1, p2] = data.people;

  const expenseBreakdownData = [
    { name: 'Salud y Pensión', value: summary.p1.healthPension, color: '#06b6d4' },
    { name: 'Vivienda', value: summary.p1.housingShare, color: '#3b82f6' },
    { name: 'Tarjetas Crédito', value: summary.p1.creditCardsShare, color: '#f43f5e' },
    { name: 'Obligaciones', value: summary.p1.obligationsShare, color: '#8b5cf6' },
    { name: 'Suscripciones', value: summary.p1.subscriptionsShare, color: '#ec4899' },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Top Banner: Welcome & Net Worth */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-5 md:p-7 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Salud Financiera Óptima
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
              {formatCurrency(summary.portfolio.totalNetWorthCOP, 'COP')}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Patrimonio Total Estimado (USD + COP)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('portfolio')}
              className="flex-1 md:flex-initial bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <PieChartIcon className="w-4 h-4" /> Ver Portafolio
            </button>
            <button
              onClick={() => onNavigate('budget')}
              className="flex-1 md:flex-initial bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs px-4 py-2.5 rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-emerald-400" /> Presupuesto
            </button>
          </div>
        </div>

        {/* Quick KPI Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50">
            <span className="text-[11px] text-slate-400 block">Ingreso Bruto {p1.name}</span>
            <span className="text-sm font-bold text-white block mt-0.5">
              {formatCurrency(summary.p1.grossIncome, 'COP')}
            </span>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50">
            <span className="text-[11px] text-slate-400 block">Total Gastos {p1.name}</span>
            <span className="text-sm font-bold text-rose-400 block mt-0.5">
              {formatCurrency(summary.p1.totalExpenses, 'COP')}
            </span>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50">
            <span className="text-[11px] text-slate-400 block">Disponible / Ahorro</span>
            <span className="text-sm font-bold text-emerald-400 block mt-0.5">
              {formatCurrency(summary.p1.availableCash, 'COP')}
            </span>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50">
            <span className="text-[11px] text-slate-400 block">Tasa de Ahorro</span>
            <span className="text-sm font-bold text-teal-300 block mt-0.5">
              {summary.p1.savingsRatePercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Quincenas: Mitad de Mes vs Fin de Mes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1ra Quincena / Mitad de mes */}
        <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm">
                1ª
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Mitad de Mes (1ra Quincena)</h3>
                <p className="text-[11px] text-slate-400">Servicios, Internet, Falabella, Addi, Carro, Icetex</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Día 1-15
            </span>
          </div>

          <div className="mt-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Gasto requerido ({p1.name})</span>
              <div className="text-lg font-bold text-blue-400">
                {formatCurrency(summary.p1.fortnight1Need, 'COP')}
              </div>
            </div>
            <button
              onClick={() => onNavigate('budget')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              Ver detalle <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2da Quincena / Fin de mes */}
        <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm">
                2ª
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Fin de Mes (2da Quincena)</h3>
                <p className="text-[11px] text-slate-400">Arriendo, Tarjeta Nu, Ahorro libre</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Día 16-30
            </span>
          </div>

          <div className="mt-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Gasto requerido ({p1.name})</span>
              <div className="text-lg font-bold text-purple-400">
                {formatCurrency(summary.p1.fortnight2Need, 'COP')}
              </div>
            </div>
            <button
              onClick={() => onNavigate('budget')}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
            >
              Ver detalle <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Pareja / Reparto Proporcional Card */}
      <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Distribución Proporcional de Ingresos y Gastos
          </h3>
          <span className="text-xs text-slate-400">
            Ingreso Total Hogar: <strong className="text-white">{formatCurrency(summary.household.totalGrossIncome, 'COP')}</strong>
          </span>
        </div>

        <div className="space-y-3">
          {/* David */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-emerald-400">{p1.name} (Ingreso: {formatCurrency(p1.monthlyIncome, 'COP')})</span>
              <span className="font-bold text-white">{(summary.p1.ratio * 100).toFixed(1)}% de aporte</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${summary.p1.ratio * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Daniela */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-indigo-400">{p2.name} (Ingreso: {formatCurrency(p2.monthlyIncome, 'COP')})</span>
              <span className="font-bold text-white">{(summary.p2.ratio * 100).toFixed(1)}% de aporte</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${summary.p2.ratio * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Categories Breakdown & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Category List */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-lg">
          <h3 className="font-bold text-white text-sm mb-4">Desglose de Gastos Mensuales ({p1.name})</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Salud / Pensión */}
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">Salud / Pensión</span>
                  <span className="text-[11px] text-slate-400">8% de Ley</span>
                </div>
              </div>
              <span className="text-sm font-bold text-cyan-400">
                {formatCurrency(summary.p1.healthPension, 'COP')}
              </span>
            </div>

            {/* Vivienda */}
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">Vivienda Compartida</span>
                  <span className="text-[11px] text-slate-400">Servicios + Arriendo</span>
                </div>
              </div>
              <span className="text-sm font-bold text-blue-400">
                {formatCurrency(summary.p1.housingShare, 'COP')}
              </span>
            </div>

            {/* Tarjetas */}
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">Tarjetas de Crédito</span>
                  <span className="text-[11px] text-slate-400">Nu, Falabella, Addi</span>
                </div>
              </div>
              <span className="text-sm font-bold text-rose-400">
                {formatCurrency(summary.p1.creditCardsShare, 'COP')}
              </span>
            </div>

            {/* Obligaciones */}
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">Obligaciones</span>
                  <span className="text-[11px] text-slate-400">Carro, Icetex</span>
                </div>
              </div>
              <span className="text-sm font-bold text-purple-400">
                {formatCurrency(summary.p1.obligationsShare, 'COP')}
              </span>
            </div>

            {/* Suscripciones */}
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between sm:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">Suscripciones & Planes</span>
                  <span className="text-[11px] text-slate-400">{data.subscriptions.length} servicios activos</span>
                </div>
              </div>
              <span className="text-sm font-bold text-pink-400">
                {formatCurrency(summary.p1.subscriptionsShare, 'COP')}
              </span>
            </div>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-lg flex flex-col justify-between">
          <h3 className="font-bold text-white text-sm mb-2">Distribución de Gastos</h3>

          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {expenseBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value), 'COP')}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 mt-2">
            {expenseBreakdownData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-200">
                  {((item.value / summary.p1.totalExpenses) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
