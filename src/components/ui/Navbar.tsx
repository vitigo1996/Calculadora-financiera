import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { DollarSign, RefreshCw, Smartphone, TrendingUp, Users } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { data, summary, updateCurrencyRate } = useFinance();
  const [editingRate, setEditingRate] = useState(false);
  const [rateInput, setRateInput] = useState(data.currencyRateUSD.toString());

  const handleSaveRate = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(rateInput);
    if (!isNaN(val) && val > 0) {
      updateCurrencyRate(val);
      setEditingRate(false);
    }
  };

  const [p1, p2] = data.people;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo & App Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <TrendingUp className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base md:text-lg text-white leading-tight">Finanzas Personales</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PRO
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {p1.name} ({(summary.p1.ratio * 100).toFixed(0)}%) & {p2.name} ({(summary.p2.ratio * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Currency TRM & Fast Actions */}
        <div className="flex items-center gap-2">
          {editingRate ? (
            <form onSubmit={handleSaveRate} className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400 font-mono">1 USD =</span>
              <input
                type="number"
                value={rateInput}
                onChange={e => setRateInput(e.target.value)}
                className="w-20 bg-slate-900 text-xs px-1.5 py-0.5 rounded border border-slate-700 text-emerald-400 font-mono text-right focus:outline-none focus:border-emerald-500"
                autoFocus
              />
              <button type="submit" className="text-xs text-emerald-400 hover:text-emerald-300 px-1 font-semibold">
                OK
              </button>
            </form>
          ) : (
            <button
              onClick={() => {
                setRateInput(data.currencyRateUSD.toString());
                setEditingRate(true);
              }}
              title="Haz clic para modificar la tasa de cambio USD/COP"
              className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 text-xs text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700/60 transition-colors"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-emerald-400 font-semibold">{formatCurrency(data.currencyRateUSD, 'COP')}</span>
              <span className="text-[10px] text-slate-400">USD</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1 text-xs bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-400">
            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
            <span>Android & Web</span>
          </div>
        </div>
      </div>
    </header>
  );
};
