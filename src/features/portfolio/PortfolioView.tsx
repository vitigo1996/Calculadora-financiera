import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { PieChart as PieChartIcon, DollarSign, Wallet } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const PortfolioView: React.FC = () => {
  const { data, summary } = useFinance();

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-emerald-400" /> Portafolio (Filas 13 a 18 de K, L, M, N)
          </h2>
          <p className="text-xs text-slate-400">
            Ahorro, inversiones en USD/COP y distribución porcentual del Excel
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Total Portafolio</span>
          <span className="text-xl font-black text-emerald-400 font-mono">
            {formatCurrency(summary.portfolio.totalPortafolio, 'COP')}
          </span>
        </div>
      </div>

      {/* Main Breakdown Grid & Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table of Assets */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-lg">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Detalle de Activos y Ahorros</h3>
            <span className="text-xs font-mono text-slate-400">1 USD = {formatCurrency(data.currencyRateUSD, 'COP')}</span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {summary.portfolio.items.map(item => (
              <div key={item.id} className="p-4 hover:bg-slate-850/50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{item.name}</h4>
                      <span className="text-xs text-slate-400">({item.institution})</span>
                    </div>
                    {item.currency === 'USD' && (
                      <span className="text-[11px] text-emerald-400 font-mono">
                        Saldo USD: {formatCurrency(item.balance, 'USD')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-white">
                    {formatCurrency(item.valorCOP, 'COP')}
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    {item.percentage.toFixed(1)}% del total
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-lg flex flex-col justify-between">
          <h3 className="font-bold text-white text-sm mb-2">Composición Porcentual</h3>

          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.portfolio.items}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="valorCOP"
                >
                  {summary.portfolio.items.map((entry, index) => (
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
            {summary.portfolio.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-300">{item.name} ({item.institution})</span>
                </div>
                <span className="font-semibold text-slate-200 font-mono">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
