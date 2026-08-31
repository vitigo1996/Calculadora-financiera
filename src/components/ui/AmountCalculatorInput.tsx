import React, { useState } from 'react';
import { formatCurrency } from '../../services/financeCalculations';
import { Calculator, Plus, Minus, Check, X, RotateCcw } from 'lucide-react';

interface AmountCalculatorInputProps {
  initialValue: number;
  currency: 'COP' | 'USD';
  onApply: (newAmount: number) => void;
  onCancel: () => void;
  title?: string;
}

export const AmountCalculatorInput: React.FC<AmountCalculatorInputProps> = ({
  initialValue,
  currency,
  onApply,
  onCancel,
  title = 'Modificar Monto'
}) => {
  const [currentTotal, setCurrentTotal] = useState<number>(initialValue);
  const [calcInput, setCalcInput] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);

  const handleOperation = (op: '+' | '-') => {
    const val = parseFloat(calcInput);
    if (isNaN(val) || val <= 0) return;

    const newTotal = op === '+' ? currentTotal + val : Math.max(0, currentTotal - val);
    const operationText = `${formatCurrency(currentTotal, currency)} ${op} ${formatCurrency(val, currency)} = ${formatCurrency(newTotal, currency)}`;

    setHistory(prev => [operationText, ...prev.slice(0, 4)]);
    setCurrentTotal(newTotal);
    setCalcInput('');
  };

  const handleQuickAdd = (delta: number) => {
    const newTotal = Math.max(0, currentTotal + delta);
    const op = delta > 0 ? '+' : '-';
    const operationText = `${formatCurrency(currentTotal, currency)} ${op} ${formatCurrency(Math.abs(delta), currency)} = ${formatCurrency(newTotal, currency)}`;

    setHistory(prev => [operationText, ...prev.slice(0, 4)]);
    setCurrentTotal(newTotal);
  };

  const resetToInitial = () => {
    setCurrentTotal(initialValue);
    setCalcInput('');
    setHistory([]);
  };

  const copPresets = [
    { label: '+10.000', val: 10000 },
    { label: '+50.000', val: 50000 },
    { label: '+100.000', val: 100000 },
    { label: '+500.000', val: 500000 },
    { label: '-50.000', val: -50000 },
    { label: '-100.000', val: -100000 },
  ];

  const usdPresets = [
    { label: '+10', val: 10 },
    { label: '+50', val: 50 },
    { label: '+100', val: 100 },
    { label: '+500', val: 500 },
    { label: '-50', val: -50 },
    { label: '-100', val: -100 },
  ];

  const presets = currency === 'USD' ? usdPresets : copPresets;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 max-w-sm w-full animate-scaleUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">{title}</h4>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Calculadora de saldo</span>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Current Total Display */}
      <div className="bg-slate-50 dark:bg-slate-950/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5 font-medium">
          Monto Actual Resultante
        </span>
        <div className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400">
          {formatCurrency(currentTotal, currency)}
        </div>
        {initialValue !== currentTotal && (
          <span className="text-[11px] text-slate-400 block mt-1">
            Valor inicial: {formatCurrency(initialValue, currency)}
          </span>
        )}
      </div>

      {/* Calculator Operation Input */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
          Valor a Sumar o Restar ({currency})
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="any"
            value={calcInput}
            onChange={e => setCalcInput(e.target.value)}
            placeholder="0"
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
            autoFocus
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleOperation('+');
              }
            }}
          />

          <button
            type="button"
            onClick={() => handleOperation('+')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
            title="Sumar al monto actual"
          >
            <Plus className="w-3.5 h-3.5" /> Sumar
          </button>

          <button
            type="button"
            onClick={() => handleOperation('-')}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
            title="Restar al monto actual"
          >
            <Minus className="w-3.5 h-3.5" /> Restar
          </button>
        </div>
      </div>

      {/* Quick Adjustment Presets */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
          Ajustes Rápidos:
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {presets.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleQuickAdd(p.val)}
              className={`py-1.5 px-2 rounded-xl text-xs font-mono font-semibold border transition-all ${
                p.val > 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-100'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/40 hover:bg-rose-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* History log if any */}
      {history.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-850 space-y-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">
            <span>Historial de cálculo</span>
            <button
              type="button"
              onClick={resetToInitial}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reiniciar
            </button>
          </div>
          {history.map((h, i) => (
            <div key={i} className="truncate">{h}</div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs py-2.5 rounded-xl transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => onApply(currentTotal)}
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
        >
          <Check className="w-4 h-4" /> Aplicar Monto
        </button>
      </div>
    </div>
  );
};
