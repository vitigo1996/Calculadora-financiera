import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { Wallet, Edit2, TrendingUp, Building2, Coins, ShieldAlert, FileText, Check } from 'lucide-react';

export const BilleteraView: React.FC = () => {
  const { data, summary, updateBilletera, updateAutofinanciera } = useFinance();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');

  const startEdit = (key: string, currentVal: number) => {
    setEditingKey(key);
    setInputValue(currentVal.toString());
  };

  const saveEdit = (key: string) => {
    const val = parseFloat(inputValue);
    if (!isNaN(val) && val >= 0) {
      if (key === 'dolar') updateBilletera({ dolar: val });
      else if (key === 'etoroUSD') updateBilletera({ etoroUSD: val });
      else if (key === 'plentiUSD') updateBilletera({ plentiUSD: val });
      else if (key === 'efectivoCOP') updateBilletera({ efectivoCOP: val });
      else if (key === 'bancolombiaCOP') updateBilletera({ bancolombiaCOP: val });
      else if (key === 'autofinanciera') updateAutofinanciera(val);
    }
    setEditingKey(null);
  };

  const cuentas = [
    {
      key: 'etoroUSD',
      nombre: 'Etoro',
      saldo: data.billetera.etoroUSD,
      moneda: 'USD',
      equivalenteCOP: summary.portafolio.etoroCOP,
      icon: TrendingUp,
      color: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
    },
    {
      key: 'plentiUSD',
      nombre: 'Plenti',
      saldo: data.billetera.plentiUSD,
      moneda: 'USD',
      equivalenteCOP: summary.portafolio.plentiCOP,
      icon: Coins,
      color: 'bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/40'
    },
    {
      key: 'efectivoCOP',
      nombre: 'Efectivo',
      saldo: data.billetera.efectivoCOP,
      moneda: 'COP',
      icon: Wallet,
      color: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40'
    },
    {
      key: 'bancolombiaCOP',
      nombre: 'Bancolombia',
      saldo: data.billetera.bancolombiaCOP,
      moneda: 'COP',
      icon: Building2,
      color: 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40'
    }
  ];

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Billetera
        </h2>
      </div>

      {/* Cuentas y Saldos */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">Billetera</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            1 USD = {formatCurrency(data.billetera.dolar, 'COP')}
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {cuentas.map(c => {
            const Icon = c.icon;
            const isEditing = editingKey === c.key;

            return (
              <div key={c.key} className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${c.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">{c.nombre}</h4>
                    {c.equivalenteCOP && (
                      <span className="block text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                        Equivalente: {formatCurrency(c.equivalenteCOP, 'COP')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        className="w-28 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs px-2.5 py-1.5 rounded-xl text-slate-800 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(c.key)}
                        className="p-1.5 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold text-xs shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-slate-800 dark:text-white block">
                          {formatCurrency(c.saldo, c.moneda as any)}
                        </span>
                      </div>
                      <button
                        onClick={() => startEdit(c.key, c.saldo)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Modificar saldo"
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

      {/* Deudas */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">Deudas</h3>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {/* Autofinanciera */}
          <div className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Autofinanciera</h4>
            </div>

            <div className="flex items-center gap-2">
              {editingKey === 'autofinanciera' ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    className="w-32 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs px-2.5 py-1.5 rounded-xl text-slate-800 dark:text-white font-mono focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => saveEdit('autofinanciera')}
                    className="p-1.5 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold text-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="font-mono font-bold text-sm text-rose-600 dark:text-rose-400">
                    {formatCurrency(data.deudas.autofinancieraMonto, 'COP')}
                  </span>
                  <button
                    onClick={() => startEdit('autofinanciera', data.deudas.autofinancieraMonto)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Multas */}
          <div className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Multas</h4>
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
              Registrado
            </span>
          </div>

          {/* SOAT y Tecnomecánica */}
          <div className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/40 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">SOAT y Tecnomecánica</h4>
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
              Registrado
            </span>
          </div>

          {/* Declaración de Renta */}
          <div className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Declaración de Renta</h4>
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
              Registrado
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
