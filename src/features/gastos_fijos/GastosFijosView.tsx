import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { HousingExpense } from '../../models/finance';
import { Home, Layers, Edit2 } from 'lucide-react';

export const GastosFijosView: React.FC = () => {
  const { data, summary, updateHousingExpense, updateObligation } = useFinance();
  const isShared = summary.mode === 'shared' && summary.p2.enabled;
  const p1 = summary.p1;
  const p2 = summary.p2;

  const [editingHousingId, setEditingHousingId] = useState<string | null>(null);
  const [housingAmountInput, setHousingAmountInput] = useState('');

  const [editingObligationId, setEditingObligationId] = useState<string | null>(null);
  const [obligationAmountInput, setObligationAmountInput] = useState('');

  const startEditHousing = (h: HousingExpense) => {
    setEditingHousingId(h.id);
    setHousingAmountInput(h.totalAmount.toString());
  };

  const saveEditHousing = (id: string) => {
    const val = parseFloat(housingAmountInput);
    if (!isNaN(val) && val >= 0) {
      updateHousingExpense(id, { totalAmount: val });
    }
    setEditingHousingId(null);
  };

  const startEditObligation = (obId: string, currentTotal: number) => {
    setEditingObligationId(obId);
    setObligationAmountInput(currentTotal.toString());
  };

  const saveEditObligation = (obId: string) => {
    const val = parseFloat(obligationAmountInput);
    if (!isNaN(val) && val >= 0) {
      updateObligation(obId, { totalAmount: val });
    }
    setEditingObligationId(null);
  };

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Home className="w-5 h-5 text-blue-400" /> Gastos Fijos
        </h2>
        <p className="text-xs text-slate-400">
          Vivienda (Filas 6 a 9) y Obligaciones (Filas 11 a 13) del Excel
        </p>
      </div>

      {/* Sección Vivienda (Filas 6 a 9) */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-sm">Vivienda (Filas 6:9)</h3>
            <span className="text-xs text-slate-400">Servicios, Internet y Arriendo</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Total Vivienda {p1.name} (M4)</span>
            <span className="text-base font-black text-blue-400 font-mono">
              {formatCurrency(summary.vivienda.totalDavid, 'COP')}
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-800/80">
          {data.housingExpenses.map(item => {
            const p1Share = item.totalAmount * summary.p1.ratio;
            const p2Share = item.totalAmount * summary.p2.ratio;
            const isEditing = editingHousingId === item.id;

            return (
              <div key={item.id} className="p-4 hover:bg-slate-850/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 px-2.5 py-1 rounded-xl text-xs font-bold ${
                    item.period === '1st_fortnight' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  }`}>
                    {item.period === '1st_fortnight' ? '1ª Quincena' : '2ª Quincena'}
                  </span>

                  <div>
                    <h4 className="font-bold text-white text-sm">{item.name}</h4>
                    <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
                      <span>Total (G): <strong className="text-white">{formatCurrency(item.totalAmount, 'COP')}</strong></span>
                      {isShared && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold">{p1.name} (H): {formatCurrency(p1Share, 'COP')}</span>
                          <span>•</span>
                          <span className="text-indigo-400 font-semibold">{p2.name} (I): {formatCurrency(p2Share, 'COP')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={housingAmountInput}
                        onChange={e => setHousingAmountInput(e.target.value)}
                        className="w-28 bg-slate-950 border border-slate-700 text-xs px-2 py-1 rounded-lg text-white font-mono"
                        autoFocus
                      />
                      <button onClick={() => saveEditHousing(item.id)} className="p-1 px-2 rounded-lg bg-blue-500 text-white font-bold text-xs">
                        OK
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-mono font-bold text-sm text-blue-400">
                        {formatCurrency(p1Share, 'COP')}
                      </span>
                      <button onClick={() => startEditHousing(item)} className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sección Obligaciones (Filas 11 a 13) */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-sm">Obligaciones (Filas 11:13)</h3>
            <span className="text-xs text-slate-400">Carro e Icetex</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Total Obligaciones {p1.name} (M6)</span>
            <span className="text-base font-black text-purple-400 font-mono">
              {formatCurrency(summary.obligaciones.totalDavid, 'COP')}
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-800/80">
          {data.obligations.map(item => {
            const p1Val = item.name.toLowerCase().includes('carro') && isShared
              ? item.totalAmount * summary.p1.ratio
              : (item.davidAmount !== undefined ? item.davidAmount : item.totalAmount);

            const isEditing = editingObligationId === item.id;

            return (
              <div key={item.id} className="p-4 hover:bg-slate-850/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    1ª Quincena
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{item.name}</h4>
                      {item.totalDebtBalance && (
                        <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-lg border border-purple-500/20">
                          Deuda Total: {formatCurrency(item.totalDebtBalance, 'COP')}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
                      <span>Cuota Total (G): <strong className="text-white">{formatCurrency(item.totalAmount, 'COP')}</strong></span>
                      {isShared && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold">{p1.name} (H): {formatCurrency(p1Val, 'COP')}</span>
                          {item.danielaAmount !== undefined && (
                            <>
                              <span>•</span>
                              <span className="text-indigo-400 font-semibold">{p2.name} (I): {formatCurrency(item.danielaAmount, 'COP')}</span>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={obligationAmountInput}
                        onChange={e => setObligationAmountInput(e.target.value)}
                        className="w-28 bg-slate-950 border border-slate-700 text-xs px-2 py-1 rounded-lg text-white font-mono"
                        autoFocus
                      />
                      <button onClick={() => saveEditObligation(item.id)} className="p-1 px-2 rounded-lg bg-purple-500 text-white font-bold text-xs">
                        OK
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-mono font-bold text-sm text-purple-400">
                        {formatCurrency(p1Val, 'COP')}
                      </span>
                      <button onClick={() => startEditObligation(item.id, item.totalAmount)} className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
