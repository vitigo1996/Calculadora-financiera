import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../services/financeCalculations';
import { TrendingUp, Sun, Moon, RefreshCw, Globe } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { data, baseCurrency, setBaseCurrency, isFetchingRate, refreshLiveDolarRate } = useFinance();
  const { theme, toggleTheme } = useTheme();

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

        {/* Action Controls: Base Currency, TRM en Vivo, Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* Selector de Moneda Base */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-300/80 dark:border-slate-700/60 p-0.5 shadow-sm">
            <button
              type="button"
              onClick={() => setBaseCurrency('COP')}
              title="Establecer COP como moneda base"
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                baseCurrency === 'COP'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              COP
            </button>
            <button
              type="button"
              onClick={() => setBaseCurrency('USD')}
              title="Establecer USD como moneda base"
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                baseCurrency === 'USD'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              USD
            </button>
          </div>

          {/* Dólar TRM en Vivo (No editable) con botón de refresco */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-300/80 dark:border-slate-700/60 px-3 py-1.5 shadow-sm">
            <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="font-mono text-blue-700 dark:text-blue-400 font-bold text-xs">
              {formatCurrency(data.dolarRate || 3600, 'COP')}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">TRM</span>

            <button
              onClick={refreshLiveDolarRate}
              disabled={isFetchingRate}
              title="Actualizar TRM en vivo desde internet"
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-600 transition-all ml-0.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingRate ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>

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
        </div>
      </div>
    </header>
  );
};
