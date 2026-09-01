import React, { useState } from 'react';
import { Calculator, Plus, Minus, X } from 'lucide-react';

interface AmountCalculatorInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  title?: string;
}

export const AmountCalculatorInput: React.FC<AmountCalculatorInputProps> = ({
  value,
  onChange,
  label = 'Monto',
  placeholder = '0',
  required = false,
  className = '',
  title = 'Ajustar Monto'
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [delta, setDelta] = useState('');

  const applyCalc = (op: '+' | '-') => {
    const deltaNum = parseFloat(delta);
    if (!isNaN(deltaNum) && deltaNum > 0) {
      const current = parseFloat(value) || 0;
      const result = op === '+' ? current + deltaNum : Math.max(0, current - deltaNum);
      onChange(result.toString());
    }
    setDelta('');
    setShowPopup(false);
  };

  return (
    <div className={className}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type="number"
          step="any"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl pl-3.5 pr-11 py-2.5 text-sm text-slate-800 dark:text-white font-mono focus:outline-none focus:border-blue-500 transition-colors"
        />

        <button
          type="button"
          onClick={() => setShowPopup(!showPopup)}
          title="Calculadora (+ / -)"
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-all ${
            showPopup
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          <Calculator className="w-4 h-4" />
        </button>

        {/* Pop-up de Calculadora */}
        {showPopup && (
          <div className="absolute right-0 top-full mt-2 z-30 p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-xl space-y-2.5 w-64 animate-scaleUp">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {title}
              </span>
              <button
                type="button"
                onClick={() => setShowPopup(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <input
              type="number"
              step="any"
              value={delta}
              onChange={e => setDelta(e.target.value)}
              placeholder="Valor a sumar o restar..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs px-2.5 py-1.5 rounded-xl text-slate-800 dark:text-white font-mono focus:outline-none focus:border-blue-500"
              autoFocus
            />

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => applyCalc('+')}
                className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Sumar
              </button>
              <button
                type="button"
                onClick={() => applyCalc('-')}
                className="flex-1 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
              >
                <Minus className="w-3.5 h-3.5" /> Restar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
