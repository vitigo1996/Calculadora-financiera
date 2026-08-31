import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { Wallet, DollarSign, Edit2, AlertCircle, ShieldAlert, ArrowRight } from 'lucide-react';

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

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-400" /> Billetera
        </h2>
        <p className="text-xs text-slate-400">
          Celdas B2 a C6 (Saldos y Dólar) y celdas B17 a C24 (Deudas y Contingencias)
        </p>
      </div>

      {/* Celdas B2 a C6: Saldos y Divisas */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm">Saldos & Cuentas (Celdas B2:C6)</h3>
          <span className="text-xs font-mono text-emerald-400">1 USD = {formatCurrency(data.billetera.dolar, 'COP')}</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {/* B2:C2 -> Dolar */}
          <div className="p-4 hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-slate-400">
                B2
              </span>
              <div>
                <h4 className="font-bold text-white text-sm">Dolar</h4>
                <span className="text-xs text-slate-400">Tasa de cambio USD/COP (C2)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {editingKey === 'dolar' ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    className="w-24 bg-slate-950 border border-slate-700 text-xs px-2 py-1 rounded-lg text-white font-mono"
                    autoFocus
                  />
                  <button onClick={() => saveEdit('dolar')} className="p-1 px-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs">
                    OK
                  </button>
                </div>
              ) : (
                <>
                  <span className="font-mono font-bold text-sm text-emerald-400">
                    {formatCurrency(data.billetera.dolar, 'COP')}
                  </span>
                  <button onClick={() => startEdit('dolar', data.billetera.dolar)} className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* B3:C3 -> Etoro */}
          <div className="p-4 hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-slate-400">
                B3
              </span>
              <div>
                <h4 className="font-bold text-white text-sm">Etoro</h4>
                <span className="text-xs text-slate-400">Saldo en dólares (C3) &rarr; {formatCurrency(summary.portafolio.etoroCOP, 'COP')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {editingKey === 'etoroUSD' ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    className="w-24 bg-slate-950 border border-slate-700 text-xs px-2 py-1 rounded-lg text-white font-mono"
                    autoFocus
                  />
                  <button onClick={() => saveEdit('etoroUSD')} className="p-1 px-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs">
                    OK
                  </button>
                </div>
              ) : (
                <>
                  <span className="font-mono font-bold text-sm text-white">
                    {formatCurrency(data.billetera.etoroUSD, 'USD')}
                  </span>
                  <button onClick={() => startEdit('etoroUSD', data.billetera.etoroUSD)} className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* B4:C4 -> Plenti */}
          <div className="p-4 hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-slate-400">
                B4
              </span>
              <div>
                <h4 className="font-bold text-white text-sm">Plenti</h4>
                <span className="text-xs text-slate-400">Saldo USDt (C4) &rarr; {formatCurrency(summary.portafolio.plentiCOP, 'COP')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {editingKey === 'plentiUSD' ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    className="w-24 bg-slate-950 border border-slate-700 text-xs px-2 py-1 rounded-lg text-white font-mono"
                    autoFocus
                  />
                  <button onClick={() => saveEdit('plentiUSD')} className="p-1 px-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs">
                    OK
                  </button>
                </div>
              ) : (
                <>
                  <span className="font-mono font-bold text-sm text-white">
                    {formatCurrency(data.billetera.plentiUSD, 'USD')}
                  </span>
                  <button onClick={() => startEdit('plentiUSD', data.billetera.plentiUSD)} className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* B5:C5 -> Efectivo */}
          <div className="p-4 hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-slate-400">
                B5
              </span>
              <div>
                <h4 className="font-bold text-white text-sm">Efectivo</h4>
                <span className="text-xs text-slate-400">Efectivo disponible en mano (C5)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {editingKey === 'efectivoCOP' ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    className="w-28 bg-slate-950 border border-slate-700 text-xs px-2 py-1 rounded-lg text-white font-mono"
                    autoFocus
                  />
                  <button onClick={() => saveEdit('efectivoCOP')} className="p-1 px-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs">
                    OK
                  </button>
                </div>
              ) : (
                <>
                  <span className="font-mono font-bold text-sm text-white">
                    {formatCurrency(data.billetera.efectivoCOP, 'COP')}
                  </span>
                  <button onClick={() => startEdit('efectivoCOP', data.billetera.efectivoCOP)} className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* B6:C6 -> Bancolombia */}
          <div className="p-4 hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-slate-400">
                B6
              </span>
              <div>
                <h4 className="font-bold text-white text-sm">Bancolombia</h4>
                <span className="text-xs text-slate-400">Saldo cuenta Bancolombia (C6)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {editingKey === 'bancolombiaCOP' ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    className="w-28 bg-slate-950 border border-slate-700 text-xs px-2 py-1 rounded-lg text-white font-mono"
                    autoFocus
                  />
                  <button onClick={() => saveEdit('bancolombiaCOP')} className="p-1 px-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs">
                    OK
                  </button>
                </div>
              ) : (
                <>
                  <span className="font-mono font-bold text-sm text-white">
                    {formatCurrency(data.billetera.bancolombiaCOP, 'COP')}
                  </span>
                  <button onClick={() => startEdit('bancolombiaCOP', data.billetera.bancolombiaCOP)} className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Celdas B17 a C24: Deudas & Contingencias */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800">
          <h3 className="font-bold text-white text-sm">Deudas & Gastos Eventuales (Celdas B17:C24)</h3>
          <p className="text-xs text-slate-400">Autofinanciera, Multas, SOAT y Declaración</p>
        </div>

        <div className="divide-y divide-slate-800/80">
          {/* B18: Autofinanciera */}
          <div className="p-4 hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-slate-400">
                B18
              </span>
              <div>
                <h4 className="font-bold text-white text-sm">Autofinanciera</h4>
                <span className="text-xs text-slate-400">Monto total de deuda (C18)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {editingKey === 'autofinanciera' ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    className="w-32 bg-slate-950 border border-slate-700 text-xs px-2 py-1 rounded-lg text-white font-mono"
                    autoFocus
                  />
                  <button onClick={() => saveEdit('autofinanciera')} className="p-1 px-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs">
                    OK
                  </button>
                </div>
              ) : (
                <>
                  <span className="font-mono font-bold text-sm text-rose-400">
                    {formatCurrency(data.deudas.autofinancieraMonto, 'COP')}
                  </span>
                  <button onClick={() => startEdit('autofinanciera', data.deudas.autofinancieraMonto)} className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* B22: Multas */}
          <div className="p-4 hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-slate-400">
                B22
              </span>
              <div>
                <h4 className="font-bold text-white text-sm">Multas</h4>
                <span className="text-xs text-slate-400">Contingencia vehicular</span>
              </div>
            </div>
            <span className="text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
              Registrado
            </span>
          </div>

          {/* B23: Soat y Tecno */}
          <div className="p-4 hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-slate-400">
                B23
              </span>
              <div>
                <h4 className="font-bold text-white text-sm">Soat y Tecno</h4>
                <span className="text-xs text-slate-400">Gasto anual obligatorio</span>
              </div>
            </div>
            <span className="text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
              Registrado
            </span>
          </div>

          {/* B24: Declaracion */}
          <div className="p-4 hover:bg-slate-850/50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-slate-400">
                B24
              </span>
              <div>
                <h4 className="font-bold text-white text-sm">Declaracion</h4>
                <span className="text-xs text-slate-400">Impuesto de renta anual</span>
              </div>
            </div>
            <span className="text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
              Registrado
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
