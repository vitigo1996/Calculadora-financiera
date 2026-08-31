import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../services/financeCalculations';
import { DollarSign, TrendingUp, Sun, Moon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { data, updateDolarRate } = useFinance();
  const { theme, toggleTheme } = useTheme();
  const [editingRate, setEditingRate] = useState(false);
  const [rateInput, setRateInput] = useState((data.dolarRate || 3600).toString());

  const handleSaveRate = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(rateInput);
    if (!isNaN(val) && val > 0) {
      updateDolarRate(val);
      setEditingRate(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center shadow-sm">
            <TrendingUp className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-tight">
              Finanzas Personales
            </h1>
          </div>
        </div>

        {/* Action Controls: Theme Toggle & Dólar TRM */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>

          {/* Dólar TRM button */}
          {editingRate ? (
            <form onSubmit={handleSaveRate} className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-xl border border-emerald-300 dark:border-slate-700 shadow-sm">
              <span className="text-xs text-slate-400 font-mono">USD =</span>
              <input
                type="number"
                value={rateInput}
                onChange={e => setRateInput(e.target.value)}
                className="w-20 bg-slate-50 dark:bg-slate-900 text-xs px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-mono text-right focus:outline-none"
                autoFocus
              />
              <button type="submit" className="text-xs text-emerald-600 dark:text-emerald-400 font-bold px-1">
                OK
              </button>
            </form>
          ) : (
            <button
              onClick={() => {
                setRateInput((data.dolarRate || 3600).toString());
                setEditingRate(true);
              }}
              title="Haz clic para modificar la tasa de cambio USD/COP"
              className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 transition-all shadow-sm"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                {formatCurrency(data.dolarRate || 3600, 'COP')}
              </span>
              <span className="text-[10px] text-slate-400">USD</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
