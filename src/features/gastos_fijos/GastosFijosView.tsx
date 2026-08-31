import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { HousingExpense } from '../../models/finance';
import { Home, Edit2, Check } from 'lucide-react';

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
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Home className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Gastos Fijos & Quincenas
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Distribución de vivienda compartida y obligaciones financieras del mes
        </p>
      </div>

      {/* Sección Vivienda */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Vivienda Compartida</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Servicios públicos, internet y arriendo</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Total {p1.name}</span>
            <span className="text-base font-black text-blue-600 dark:text-blue-400 font-mono">
              COP {formatCurrency(summary.vivienda.totalDavid, 'COP')}
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {data.housingExpenses.map(item => {
            const p1Share = item.totalAmount * summary.p1.ratio;
            const p2Share = item.totalAmount * summary.p2.ratio;
            const isEditing = editingHousingId === item.id;

            return (
              <div key={item.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40">
                    {item.period === '1st_fortnight' ? '1ª Quincena' : '2ª Quincena'}
                  </span>

                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.name}</h4>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
                      <span>Total: <strong className="text-slate-700 dark:text-slate-200 font-mono">COP {formatCurrency(item.totalAmount, 'COP')}</strong></span>
                      {isShared && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">{p1.name}: COP {formatCurrency(p1Share, 'COP')}</span>
                          <span>•</span>
                          <span className="text-slate-600 dark:text-slate-400 font-semibold">{p2.name}: COP {formatCurrency(p2Share, 'COP')}</span>
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
                        className="w-28 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs px-2.5 py-1.5 rounded-xl text-slate-800 dark:text-white font-mono focus:outline-none"
                        autoFocus
                      />
                      <button onClick={() => saveEditHousing(item.id)} className="p-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-bold font-mono px-1.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          COP
                        </span>
                        <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                          {formatCurrency(p1Share, 'COP')}
                        </span>
                      </div>
                      <button onClick={() => startEditHousing(item)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300/80 dark:border-transparent transition-colors">
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

      {/* Sección Obligaciones */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Obligaciones & Préstamos</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Cuotas vehiculares y créditos formativos</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Total {p1.name}</span>
            <span className="text-base font-black text-blue-600 dark:text-blue-400 font-mono">
              COP {formatCurrency(summary.obligaciones.totalDavid, 'COP')}
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {data.obligations.map(item => {
            const p1Val = item.name.toLowerCase().includes('carro') && isShared
              ? item.totalAmount * summary.p1.ratio
              : (item.davidAmount !== undefined ? item.davidAmount : item.totalAmount);

            const isEditing = editingObligationId === item.id;

            return (
              <div key={item.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40">
                    1ª Quincena
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.name}</h4>
                      {item.totalDebtBalance && (
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          Deuda: COP {formatCurrency(item.totalDebtBalance, 'COP')}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
                      <span>Cuota Total: <strong className="text-slate-700 dark:text-slate-200 font-mono">COP {formatCurrency(item.totalAmount, 'COP')}</strong></span>
                      {isShared && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">{p1.name}: COP {formatCurrency(p1Val, 'COP')}</span>
                          {item.danielaAmount !== undefined && (
                            <>
                              <span>•</span>
                              <span className="text-slate-600 dark:text-slate-400 font-semibold">{p2.name}: COP {formatCurrency(item.danielaAmount, 'COP')}</span>
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
                        className="w-28 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs px-2.5 py-1.5 rounded-xl text-slate-800 dark:text-white font-mono focus:outline-none"
                        autoFocus
                      />
                      <button onClick={() => saveEditObligation(item.id)} className="p-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-bold font-mono px-1.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          COP
                        </span>
                        <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                          {formatCurrency(p1Val, 'COP')}
                        </span>
                      </div>
                      <button onClick={() => startEditObligation(item.id, item.totalAmount)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300/80 dark:border-transparent transition-colors">
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
