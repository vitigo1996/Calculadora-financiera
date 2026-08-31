import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { BilleteraAccountItem, DeudaItem } from '../../models/finance';
import {
  Wallet,
  Edit2,
  Plus,
  Trash2,
  ShieldAlert,
  Building2,
  Coins,
  TrendingUp,
  Check,
  X,
  SlidersHorizontal
} from 'lucide-react';

export const BilleteraView: React.FC = () => {
  const {
    data,
    addBilleteraItem,
    updateBilleteraItem,
    deleteBilleteraItem,
    addDeudaItem,
    updateDeudaItem,
    deleteDeudaItem
  } = useFinance();

  // Billetera Edit Mode & State
  const [isManagingBilleteras, setIsManagingBilleteras] = useState(false);
  const [showAddBilleteraModal, setShowAddBilleteraModal] = useState(false);
  const [newBilleteraName, setNewBilleteraName] = useState('');
  const [newBilleteraCurrency, setNewBilleteraCurrency] = useState<'COP' | 'USD'>('COP');
  const [newBilleteraBalance, setNewBilleteraBalance] = useState('');

  // Editing individual balance
  const [editingBilleteraId, setEditingBilleteraId] = useState<string | null>(null);
  const [editingBalanceInput, setEditingBalanceInput] = useState('');

  // Deudas Edit Mode & State
  const [isManagingDeudas, setIsManagingDeudas] = useState(false);
  const [showAddDeudaModal, setShowAddDeudaModal] = useState(false);
  const [newDeudaName, setNewDeudaName] = useState('');
  const [newDeudaAmount, setNewDeudaAmount] = useState('');

  // Editing individual debt amount
  const [editingDeudaId, setEditingDeudaId] = useState<string | null>(null);
  const [editingDeudaInput, setEditingDeudaInput] = useState('');

  // Helper icons/colors
  const getBilleteraIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('etoro')) return TrendingUp;
    if (n.includes('plenti') || n.includes('usdt') || n.includes('crypto')) return Coins;
    if (n.includes('bancolombia') || n.includes('davivienda') || n.includes('banco')) return Building2;
    return Wallet;
  };

  const getBilleteraColor = (name: string, moneda: 'COP' | 'USD') => {
    const n = name.toLowerCase();
    if (moneda === 'USD') {
      return 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40';
    }
    if (n.includes('efectivo')) {
      return 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40';
    }
    return 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40';
  };

  // Actions for Billeteras
  const handleAddBilletera = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBilleteraName.trim()) return;
    const saldo = parseFloat(newBilleteraBalance) || 0;
    addBilleteraItem({
      nombre: newBilleteraName.trim(),
      moneda: newBilleteraCurrency,
      saldo
    });
    setNewBilleteraName('');
    setNewBilleteraBalance('');
    setNewBilleteraCurrency('COP');
    setShowAddBilleteraModal(false);
  };

  const startEditBalance = (b: BilleteraAccountItem) => {
    setEditingBilleteraId(b.id);
    setEditingBalanceInput(b.saldo.toString());
  };

  const saveEditBalance = (id: string) => {
    const val = parseFloat(editingBalanceInput);
    if (!isNaN(val) && val >= 0) {
      updateBilleteraItem(id, { saldo: val });
    }
    setEditingBilleteraId(null);
  };

  // Actions for Deudas
  const handleAddDeuda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeudaName.trim()) return;
    const monto = parseFloat(newDeudaAmount) || 0;
    addDeudaItem({
      nombre: newDeudaName.trim(),
      monto
    });
    setNewDeudaName('');
    setNewDeudaAmount('');
    setShowAddDeudaModal(false);
  };

  const startEditDeuda = (d: DeudaItem) => {
    setEditingDeudaId(d.id);
    setEditingDeudaInput((d.monto || 0).toString());
  };

  const saveEditDeuda = (id: string) => {
    const val = parseFloat(editingDeudaInput);
    if (!isNaN(val) && val >= 0) {
      updateDeudaItem(id, { monto: val });
    }
    setEditingDeudaId(null);
  };

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Billetera
        </h2>
      </div>

      {/* Recuadro Billetera */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">Billetera</h3>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsManagingBilleteras(!isManagingBilleteras)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isManagingBilleteras
                  ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {isManagingBilleteras ? 'Listo' : 'Editar'}
            </button>

            {isManagingBilleteras && (
              <button
                onClick={() => setShowAddBilleteraModal(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-200 transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {data.billeteraItems.map(item => {
            const Icon = getBilleteraIcon(item.nombre);
            const isEditing = editingBilleteraId === item.id;

            return (
              <div
                key={item.id}
                className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${getBilleteraColor(item.nombre, item.moneda)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.nombre}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {item.moneda}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={editingBalanceInput}
                        onChange={e => setEditingBalanceInput(e.target.value)}
                        className="w-28 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs px-2.5 py-1.5 rounded-xl text-slate-800 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEditBalance(item.id)}
                        className="p-1.5 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold text-xs shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-slate-800 dark:text-white block">
                          {formatCurrency(item.saldo, item.moneda)}
                        </span>
                      </div>

                      <button
                        onClick={() => startEditBalance(item)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Modificar saldo"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {isManagingBilleteras && (
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar la billetera "${item.nombre}"?`)) {
                              deleteBilleteraItem(item.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40 transition-colors"
                          title="Eliminar billetera"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recuadro Deudas */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">Deudas</h3>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsManagingDeudas(!isManagingDeudas)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isManagingDeudas
                  ? 'bg-rose-600 dark:bg-rose-500 text-white font-bold shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {isManagingDeudas ? 'Listo' : 'Editar'}
            </button>

            {isManagingDeudas && (
              <button
                onClick={() => setShowAddDeudaModal(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 hover:bg-rose-200 transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {data.deudaItems.map(item => {
            const isEditing = editingDeudaId === item.id;
            const hasAmount = item.monto !== undefined && item.monto > 0;

            return (
              <div
                key={item.id}
                className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.nombre}</h4>
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={editingDeudaInput}
                        onChange={e => setEditingDeudaInput(e.target.value)}
                        className="w-32 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs px-2.5 py-1.5 rounded-xl text-slate-800 dark:text-white font-mono focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEditDeuda(item.id)}
                        className="p-1.5 rounded-xl bg-rose-600 dark:bg-rose-500 text-white font-bold text-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      {hasAmount ? (
                        <span className="font-mono font-bold text-sm text-rose-600 dark:text-rose-400">
                          {formatCurrency(item.monto || 0, 'COP')}
                        </span>
                      ) : null}

                      <button
                        onClick={() => startEditDeuda(item)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Modificar valor"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {isManagingDeudas && (
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar la deuda "${item.nombre}"?`)) {
                              deleteDeudaItem(item.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40 transition-colors"
                          title="Eliminar deuda"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Crear Billetera */}
      {showAddBilleteraModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Nueva Billetera</h3>
              <button
                onClick={() => setShowAddBilleteraModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBilletera} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nombre</label>
                <input
                  type="text"
                  value={newBilleteraName}
                  onChange={e => setNewBilleteraName(e.target.value)}
                  placeholder="Ej. Nequi, Daviplata, Binance, Interactive Brokers"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Moneda</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewBilleteraCurrency('COP')}
                    className={`py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                      newBilleteraCurrency === 'COP'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🇨🇴 Pesos (COP)
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewBilleteraCurrency('USD')}
                    className={`py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                      newBilleteraCurrency === 'USD'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🇺🇸 Dólares (USD)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Saldo Inicial</label>
                <input
                  type="number"
                  step="any"
                  value={newBilleteraBalance}
                  onChange={e => setNewBilleteraBalance(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddBilleteraModal(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs py-3 rounded-2xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-2xl shadow-sm transition-all"
                >
                  Guardar Billetera
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Crear Deuda */}
      {showAddDeudaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Nueva Deuda / Obligación</h3>
              <button
                onClick={() => setShowAddDeudaModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDeuda} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nombre</label>
                <input
                  type="text"
                  value={newDeudaName}
                  onChange={e => setNewDeudaName(e.target.value)}
                  placeholder="Ej. Crédito Libre Inversión, Impuesto Predial"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Monto (COP)</label>
                <input
                  type="number"
                  step="any"
                  value={newDeudaAmount}
                  onChange={e => setNewDeudaAmount(e.target.value)}
                  placeholder="0 (o valor adeudado)"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddDeudaModal(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs py-3 rounded-2xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-3 rounded-2xl shadow-sm transition-all"
                >
                  Guardar Deuda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
