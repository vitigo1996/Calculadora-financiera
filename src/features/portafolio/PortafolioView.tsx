import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const PortafolioView: React.FC = () => {
  const { summary } = useFinance();
  const port = summary.portafolio;

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Portafolio & Ahorro
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Seguimiento de inversiones en dólares, fondo de emergencia y ahorros
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Patrimonio Total</span>
          <span className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
            {formatCurrency(port.totalPortafolio, 'COP')}
          </span>
        </div>
      </div>

      {/* Grid of Items & Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table of Assets */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Composición de Activos</h3>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              1 USD = {formatCurrency(summary.dolar, 'COP')}
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {port.items.map(item => (
              <div key={item.key} className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.label}</h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400">({item.category})</span>
                    </div>
                    {item.valorOriginal && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                        Base: {item.valorOriginal}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-slate-800 dark:text-white">
                    {formatCurrency(item.valorCOP, 'COP')}
                  </div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">
                    {item.percentage.toFixed(1)}% del portafolio
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-2">Distribución Porcentual</h3>

          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={port.items}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="valorCOP"
                >
                  {port.items.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value), 'COP')}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 mt-2">
            {port.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
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
