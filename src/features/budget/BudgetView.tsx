import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { HousingExpense, ObligationItem } from '../../models/finance';
import { Home, Layers, Calendar, Edit2, CheckCircle2 } from 'lucide-react';

export const BudgetView: React.FC = () => {
  const { data, summary, updateHousingExpense, updateObligation } = useFinance();
  const isShared = summary.mode === 'shared' && summary.p2.enabled;
  const p1 = summary.p1;
  const p2 = summary.p2;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');

  const startEditHousing = (item: HousingExpense) => {
    setEditingId(item.id);
    setEditAmount(item.totalAmount.toString());
  };

  const saveEditHousing = (id: string) => {
    const val = parseFloat(editAmount);
    if (!isNaN(val) && val >= 0) {
      updateHousingExpense(id, { totalAmount: val });
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Home className="w-5 h-5 text-blue-400" /> Vivienda & Obligaciones Quincenales
        </h2>
        <p className="text-xs text-slate-400">
          Distribución exacta según las filas 6 a 13 del Excel
        </p>
      </div>

      {/* Vivienda Section (Filas 6 a 9) */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-sm">Vivienda (Filas 6 a 9)</h3>
            <p className="text-[11px] text-slate-400">Servicios, Internet y Arriendo</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Total {p1.name}: {formatCurrency(summary.p1.housingTotal, 'COP')}
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {data.housingExpenses.map(item => {
            const p1Share = item.totalAmount * summary.p1.ratio;
            const p2Share = item.totalAmount * summary.p2.ratio;
            const isEditing = editingId === item.id;

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
                    <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                      <span>Total: <strong className="text-white">{formatCurrency(item.totalAmount, 'COP')}</strong></span>
                      {isShared && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400">{p1.name} ({(p1.ratio * 100).toFixed(0)}%): {formatCurrency(p1Share, 'COP')}</span>
                          <span>•</span>
                          <span className="text-indigo-400">{p2.name} ({(p2.ratio * 100).toFixed(0)}%): {formatCurrency(p2Share, 'COP')}</span>
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
                        value={editAmount}
                        onChange={e => setEditAmount(e.target.value)}
                        className="w-28 bg-slate-950 border border-slate-700 text-xs px-2 py-1 rounded-lg text-white font-mono"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEditHousing(item.id)}
                        className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs"
                      >
                        OK
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-mono font-bold text-sm text-blue-400">
                        {formatCurrency(p1Share, 'COP')}
                      </span>
                      <button
                        onClick={() => startEditHousing(item)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Modificar valor"
                      >
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

      {/* Obligaciones Section (Filas 11 a 13) */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-sm">Obligaciones (Filas 11 a 13)</h3>
            <p className="text-[11px] text-slate-400">Carro e Icetex</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Total {p1.name}: {formatCurrency(summary.p1.obligationsTotal, 'COP')}
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {data.obligations.map(item => {
            const p1Val = item.name.toLowerCase().includes('carro') && isShared
              ? item.totalAmount * summary.p1.ratio
              : item.person1Amount;

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
                    <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                      <span>Total Cuota: <strong className="text-white">{formatCurrency(item.totalAmount, 'COP')}</strong></span>
                      {isShared && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400">Cuota {p1.name}: {formatCurrency(p1Val, 'COP')}</span>
                          {item.person2Amount > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-indigo-400">Cuota {p2.name}: {formatCurrency(item.person2Amount, 'COP')}</span>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <span className="font-mono font-bold text-sm text-purple-400 self-end sm:self-auto">
                  {formatCurrency(p1Val, 'COP')}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
