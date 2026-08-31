import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../services/financeCalculations';
import { DollarSign, TrendingUp, Sun, Moon, RefreshCw, Globe } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { data, updateDolarRate, isFetchingRate, refreshLiveDolarRate } = useFinance();
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
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-300/80 dark:border-slate-800 px-4 py-3 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center shadow-sm">
            <TrendingUp className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-tight">
              Finanzas Personales
            </h1>
          </div>
        </div>

        {/* Action Controls: Theme Toggle & Dólar TRM en Vivo */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300/80 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-blue-500" />
            )}
          </button>

          {/* Dólar TRM button with Live Internet Sync */}
          {editingRate ? (
            <form onSubmit={handleSaveRate} className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-xl border border-blue-400 dark:border-slate-700 shadow-sm">
              <span className="text-xs text-slate-500 font-mono">USD =</span>
              <input
                type="number"
                value={rateInput}
                onChange={e => setRateInput(e.target.value)}
                className="w-20 bg-slate-50 dark:bg-slate-900 text-xs px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 text-blue-700 dark:text-blue-400 font-mono text-right focus:outline-none"
                autoFocus
              />
              <button type="submit" className="text-xs text-blue-600 dark:text-blue-400 font-bold px-1">
                OK
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-300/80 dark:border-slate-700/60 p-1 shadow-sm">
              <button
                onClick={() => {
                  setRateInput((data.dolarRate || 3600).toString());
                  setEditingRate(true);
                }}
                title="Tasa de cambio USD/COP oficial en vivo (Haz clic para editar manualmente)"
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="font-mono text-blue-700 dark:text-blue-400 font-bold">
                  {formatCurrency(data.dolarRate || 3600, 'COP')}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">TRM</span>
              </button>

              <button
                onClick={refreshLiveDolarRate}
                disabled={isFetchingRate}
                title="Actualizar TRM en vivo desde internet"
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-600 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetchingRate ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
