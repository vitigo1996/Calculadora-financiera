import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { BilleteraAccountItem, DeudaItem } from '../../models/finance';
import { getIconComponent, IconPicker } from '../../components/ui/IconPicker';
import { AmountCalculatorInput } from '../../components/ui/AmountCalculatorInput';
import {
  Wallet,
  Edit2,
  Plus,
  Trash2,
  X,
  SlidersHorizontal,
  Calculator
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

  const dolarRate = data.dolarRate || 3600;

  // Billetera Edit Mode & State
  const [isManagingBilleteras, setIsManagingBilleteras] = useState(false);
  const [showAddBilleteraModal, setShowAddBilleteraModal] = useState(false);
  const [editingBilleteraObj, setEditingBilleteraObj] = useState<BilleteraAccountItem | null>(null);

  // Form fields for Billetera (Create / Edit)
  const [billeteraName, setBilleteraName] = useState('');
  const [billeteraCurrency, setBilleteraCurrency] = useState<'COP' | 'USD'>('COP');
  const [billeteraBalance, setBilleteraBalance] = useState('');
  const [billeteraIcon, setBilleteraIcon] = useState('wallet');

  // Calculator Modal for quick balance update
  const [calcTargetBilletera, setCalcTargetBilletera] = useState<BilleteraAccountItem | null>(null);

  // Deudas Edit Mode & State
  const [isManagingDeudas, setIsManagingDeudas] = useState(false);
  const [showAddDeudaModal, setShowAddDeudaModal] = useState(false);
  const [editingDeudaObj, setEditingDeudaObj] = useState<DeudaItem | null>(null);

  // Form fields for Deuda (Create / Edit)
  const [deudaName, setDeudaName] = useState('');
  const [deudaAmount, setDeudaAmount] = useState('');
  const [deudaIcon, setDeudaIcon] = useState('shield_alert');

  // Calculator Modal for quick debt update
  const [calcTargetDeuda, setCalcTargetDeuda] = useState<DeudaItem | null>(null);

  // Helper color based on currency and name
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

  // Open Create Billetera Modal
  const openCreateBilletera = () => {
    setBilleteraName('');
    setBilleteraCurrency('COP');
    setBilleteraBalance('');
    setBilleteraIcon('wallet');
    setEditingBilleteraObj(null);
    setShowAddBilleteraModal(true);
  };

  // Open Edit Billetera Modal
  const openEditBilletera = (b: BilleteraAccountItem) => {
    setEditingBilleteraObj(b);
    setBilleteraName(b.nombre);
    setBilleteraCurrency(b.moneda);
    setBilleteraBalance(b.saldo.toString());
    setBilleteraIcon(b.icon || (b.moneda === 'USD' ? 'coins' : 'wallet'));
    setShowAddBilleteraModal(true);
  };

  // Save Billetera (Create or Edit)
  const handleSaveBilletera = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billeteraName.trim()) return;
    const saldo = parseFloat(billeteraBalance) || 0;

    if (editingBilleteraObj) {
      updateBilleteraItem(editingBilleteraObj.id, {
        nombre: billeteraName.trim(),
        moneda: billeteraCurrency,
        saldo,
        icon: billeteraIcon
      });
    } else {
      addBilleteraItem({
        nombre: billeteraName.trim(),
        moneda: billeteraCurrency,
        saldo,
        icon: billeteraIcon
      } as any);
    }

    setShowAddBilleteraModal(false);
    setEditingBilleteraObj(null);
  };

  // Open Create Deuda Modal
  const openCreateDeuda = () => {
    setDeudaName('');
    setDeudaAmount('');
    setDeudaIcon('shield_alert');
    setEditingDeudaObj(null);
    setShowAddDeudaModal(true);
  };

  // Open Edit Deuda Modal
  const openEditDeuda = (d: DeudaItem) => {
    setEditingDeudaObj(d);
    setDeudaName(d.nombre);
    setDeudaAmount((d.monto || 0).toString());
    setDeudaIcon(d.icon || 'shield_alert');
    setShowAddDeudaModal(true);
  };

  // Save Deuda (Create or Edit)
  const handleSaveDeuda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deudaName.trim()) return;
    const monto = parseFloat(deudaAmount) || 0;

    if (editingDeudaObj) {
      updateDeudaItem(editingDeudaObj.id, {
        nombre: deudaName.trim(),
        monto,
        icon: deudaIcon
      });
    } else {
      addDeudaItem({
        nombre: deudaName.trim(),
        monto,
        icon: deudaIcon
      } as any);
    }

    setShowAddDeudaModal(false);
    setEditingDeudaObj(null);
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
                onClick={openCreateBilletera}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-200 transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {data.billeteraItems.map(item => {
            const Icon = getIconComponent(item.icon);
            const isUSD = item.moneda === 'USD';
            const equivalentCOP = isUSD ? item.saldo * dolarRate : null;

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
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.nombre}</h4>
                      {isUSD && equivalentCOP !== null && (
                        <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400">
                          ({formatCurrency(equivalentCOP, 'COP')})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-slate-800 dark:text-white block">
                      {formatCurrency(item.saldo, item.moneda)}
                    </span>
                  </div>

                  {/* Calculator Button to modify balance */}
                  <button
                    onClick={() => setCalcTargetBilletera(item)}
                    className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 transition-colors"
                    title="Calculadora de saldo (+ / -)"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => openEditBilletera(item)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                    title="Editar billetera e ícono"
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
                onClick={openCreateDeuda}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 hover:bg-rose-200 transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {data.deudaItems.map(item => {
            const Icon = getIconComponent(item.icon || 'shield_alert');
            const hasAmount = item.monto !== undefined && item.monto > 0;

            return (
              <div
                key={item.id}
                className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.nombre}</h4>
                </div>

                <div className="flex items-center gap-2">
                  {hasAmount ? (
                    <span className="font-mono font-bold text-sm text-rose-600 dark:text-rose-400">
                      {formatCurrency(item.monto || 0, 'COP')}
                    </span>
                  ) : null}

                  {/* Calculator Button to modify debt */}
                  <button
                    onClick={() => setCalcTargetDeuda(item)}
                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 transition-colors"
                    title="Calculadora de deuda (+ / -)"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => openEditDeuda(item)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                    title="Editar deuda e ícono"
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
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Calculator Modal for Billetera */}
      {calcTargetBilletera && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <AmountCalculatorInput
            title={`Saldo: ${calcTargetBilletera.nombre}`}
            currency={calcTargetBilletera.moneda}
            initialValue={calcTargetBilletera.saldo}
            onApply={newSaldo => {
              updateBilleteraItem(calcTargetBilletera.id, { saldo: newSaldo });
              setCalcTargetBilletera(null);
            }}
            onCancel={() => setCalcTargetBilletera(null)}
          />
        </div>
      )}

      {/* Interactive Calculator Modal for Deuda */}
      {calcTargetDeuda && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <AmountCalculatorInput
            title={`Deuda: ${calcTargetDeuda.nombre}`}
            currency="COP"
            initialValue={calcTargetDeuda.monto || 0}
            onApply={newMonto => {
              updateDeudaItem(calcTargetDeuda.id, { monto: newMonto });
              setCalcTargetDeuda(null);
            }}
            onCancel={() => setCalcTargetDeuda(null)}
          />
        </div>
      )}

      {/* Modal: Crear / Editar Billetera con IconPicker */}
      {showAddBilleteraModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingBilleteraObj ? 'Editar Billetera' : 'Nueva Billetera'}
              </h3>
              <button
                onClick={() => setShowAddBilleteraModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBilletera} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nombre</label>
                <input
                  type="text"
                  value={billeteraName}
                  onChange={e => setBilleteraName(e.target.value)}
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
                    onClick={() => setBilleteraCurrency('COP')}
                    className={`py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                      billeteraCurrency === 'COP'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🇨🇴 Pesos (COP)
                  </button>

                  <button
                    type="button"
                    onClick={() => setBilleteraCurrency('USD')}
                    className={`py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                      billeteraCurrency === 'USD'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🇺🇸 Dólares (USD)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Saldo {billeteraCurrency === 'USD' ? '(en Dólares USD)' : '(en Pesos COP)'}
                </label>
                <input
                  type="number"
                  step="any"
                  value={billeteraBalance}
                  onChange={e => setBilleteraBalance(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Icon Picker */}
              <IconPicker selectedIconId={billeteraIcon} onSelectIcon={setBilleteraIcon} />

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
                  {editingBilleteraObj ? 'Actualizar Billetera' : 'Guardar Billetera'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Crear / Editar Deuda con IconPicker */}
      {showAddDeudaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingDeudaObj ? 'Editar Deuda' : 'Nueva Deuda'}
              </h3>
              <button
                onClick={() => setShowAddDeudaModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDeuda} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nombre</label>
                <input
                  type="text"
                  value={deudaName}
                  onChange={e => setDeudaName(e.target.value)}
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
                  value={deudaAmount}
                  onChange={e => setDeudaAmount(e.target.value)}
                  placeholder="0 (o valor adeudado)"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Icon Picker */}
              <IconPicker selectedIconId={deudaIcon} onSelectIcon={setDeudaIcon} />

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
                  {editingDeudaObj ? 'Actualizar Deuda' : 'Guardar Deuda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
