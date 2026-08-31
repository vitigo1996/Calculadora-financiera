import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { BilleteraAccountItem, DeudaItem } from '../../models/finance';
import { getIconComponent, IconPicker } from '../../components/ui/IconPicker';
import {
  Wallet,
  Edit2,
  Plus,
  Minus,
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
  const [showBilleteraCalcPopup, setShowBilleteraCalcPopup] = useState(false);
  const [billeteraCalcDelta, setBilleteraCalcDelta] = useState('');

  // Deudas Edit Mode & State
  const [isManagingDeudas, setIsManagingDeudas] = useState(false);
  const [showAddDeudaModal, setShowAddDeudaModal] = useState(false);
  const [editingDeudaObj, setEditingDeudaObj] = useState<DeudaItem | null>(null);

  // Form fields for Deuda (Create / Edit)
  const [deudaName, setDeudaName] = useState('');
  const [deudaAmount, setDeudaAmount] = useState('');
  const [deudaIcon, setDeudaIcon] = useState('shield_alert');
  const [showDeudaCalcPopup, setShowDeudaCalcPopup] = useState(false);
  const [deudaCalcDelta, setDeudaCalcDelta] = useState('');

  // Uniform neutral blue card theme for all items
  const getItemIconStyle = () => {
    return 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/40';
  };

  // Open Create Billetera Modal
  const openCreateBilletera = () => {
    setBilleteraName('');
    setBilleteraCurrency('COP');
    setBilleteraBalance('');
    setBilleteraIcon('wallet');
    setBilleteraCalcDelta('');
    setShowBilleteraCalcPopup(false);
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
    setBilleteraCalcDelta('');
    setShowBilleteraCalcPopup(false);
    setShowAddBilleteraModal(true);
  };

  // Apply Billetera Add/Subtract operation and immediately close popup
  const applyBilleteraCalc = (op: '+' | '-') => {
    const delta = parseFloat(billeteraCalcDelta);
    if (!isNaN(delta) && delta > 0) {
      const current = parseFloat(billeteraBalance) || 0;
      const result = op === '+' ? current + delta : Math.max(0, current - delta);
      setBilleteraBalance(result.toString());
    }
    setBilleteraCalcDelta('');
    setShowBilleteraCalcPopup(false);
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
    setDeudaCalcDelta('');
    setShowDeudaCalcPopup(false);
    setEditingDeudaObj(null);
    setShowAddDeudaModal(true);
  };

  // Open Edit Deuda Modal
  const openEditDeuda = (d: DeudaItem) => {
    setEditingDeudaObj(d);
    setDeudaName(d.nombre);
    setDeudaAmount((d.monto || 0).toString());
    setDeudaIcon(d.icon || 'shield_alert');
    setDeudaCalcDelta('');
    setShowDeudaCalcPopup(false);
    setShowAddDeudaModal(true);
  };

  // Apply Deuda Add/Subtract operation and immediately close popup
  const applyDeudaCalc = (op: '+' | '-') => {
    const delta = parseFloat(deudaCalcDelta);
    if (!isNaN(delta) && delta > 0) {
      const current = parseFloat(deudaAmount) || 0;
      const result = op === '+' ? current + delta : Math.max(0, current - delta);
      setDeudaAmount(result.toString());
    }
    setDeudaCalcDelta('');
    setShowDeudaCalcPopup(false);
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
          <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Billetera
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
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {isManagingBilleteras ? 'Listo' : 'Editar'}
            </button>

            {isManagingBilleteras && (
              <button
                onClick={openCreateBilletera}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 hover:bg-blue-200 transition-all flex items-center gap-1"
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
                  <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${getItemIconStyle()}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.nombre}</h4>
                      {isUSD && equivalentCOP !== null && (
                        <span className="text-xs font-mono font-medium text-blue-600 dark:text-blue-400">
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

                  <button
                    onClick={() => openEditBilletera(item)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                    title="Editar billetera y saldo"
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
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-slate-500 hover:text-rose-600 transition-colors"
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
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {isManagingDeudas ? 'Listo' : 'Editar'}
            </button>

            {isManagingDeudas && (
              <button
                onClick={openCreateDeuda}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 hover:bg-blue-200 transition-all flex items-center gap-1"
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
                  <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${getItemIconStyle()}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.nombre}</h4>
                </div>

                <div className="flex items-center gap-2">
                  {hasAmount ? (
                    <span className="font-mono font-bold text-sm text-slate-800 dark:text-white">
                      {formatCurrency(item.monto || 0, 'COP')}
                    </span>
                  ) : null}

                  <button
                    onClick={() => openEditDeuda(item)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                    title="Editar deuda y monto"
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
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-slate-500 hover:text-rose-600 transition-colors"
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

      {/* Modal: Crear / Editar Billetera */}
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
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Selector de Moneda: 'Pesos (COP)' y 'Dólares (USD)' */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Moneda</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBilleteraCurrency('COP')}
                    className={`py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                      billeteraCurrency === 'COP'
                        ? 'bg-blue-100 dark:bg-blue-950/60 border-blue-500 text-blue-800 dark:text-blue-300 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Pesos (COP)
                  </button>

                  <button
                    type="button"
                    onClick={() => setBilleteraCurrency('USD')}
                    className={`py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                      billeteraCurrency === 'USD'
                        ? 'bg-blue-100 dark:bg-blue-950/60 border-blue-500 text-blue-800 dark:text-blue-300 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Dólares (USD)
                  </button>
                </div>
              </div>

              {/* Saldo con botón de calculadora integrado dentro del input */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Saldo {billeteraCurrency === 'USD' ? '(USD)' : '(COP)'}
                </label>

                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={billeteraBalance}
                    onChange={e => setBilleteraBalance(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl pl-3.5 pr-11 py-2.5 text-sm text-slate-800 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowBilleteraCalcPopup(!showBilleteraCalcPopup)}
                    title="Calculadora (+ / -)"
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-all ${
                      showBilleteraCalcPopup
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Calculator className="w-4 h-4" />
                  </button>

                  {/* Pop-up de Calculadora */}
                  {showBilleteraCalcPopup && (
                    <div className="absolute right-0 top-full mt-2 z-30 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl space-y-2.5 w-64 animate-scaleUp">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Ajustar Saldo
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowBilleteraCalcPopup(false)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="number"
                        step="any"
                        value={billeteraCalcDelta}
                        onChange={e => setBilleteraCalcDelta(e.target.value)}
                        placeholder="Valor a sumar o restar..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs px-2.5 py-1.5 rounded-xl text-slate-800 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                        autoFocus
                      />

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => applyBilleteraCalc('+')}
                          className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> Sumar
                        </button>
                        <button
                          type="button"
                          onClick={() => applyBilleteraCalc('-')}
                          className="flex-1 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" /> Restar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Icon Picker con Mosaico Compacto */}
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
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-2xl shadow-sm transition-all"
                >
                  {editingBilleteraObj ? 'Actualizar Billetera' : 'Guardar Billetera'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Crear / Editar Deuda */}
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
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Monto con botón de calculadora integrado dentro del input */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Monto (COP)
                </label>

                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={deudaAmount}
                    onChange={e => setDeudaAmount(e.target.value)}
                    placeholder="0 (o valor adeudado)"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl pl-3.5 pr-11 py-2.5 text-sm text-slate-800 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowDeudaCalcPopup(!showDeudaCalcPopup)}
                    title="Calculadora (+ / -)"
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-all ${
                      showDeudaCalcPopup
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Calculator className="w-4 h-4" />
                  </button>

                  {/* Pop-up de Calculadora */}
                  {showDeudaCalcPopup && (
                    <div className="absolute right-0 top-full mt-2 z-30 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl space-y-2.5 w-64 animate-scaleUp">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Ajustar Monto
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowDeudaCalcPopup(false)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="number"
                        step="any"
                        value={deudaCalcDelta}
                        onChange={e => setDeudaCalcDelta(e.target.value)}
                        placeholder="Valor a sumar o restar..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs px-2.5 py-1.5 rounded-xl text-slate-800 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                        autoFocus
                      />

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => applyDeudaCalc('+')}
                          className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> Sumar
                        </button>
                        <button
                          type="button"
                          onClick={() => applyDeudaCalc('-')}
                          className="flex-1 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" /> Restar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Icon Picker con Mosaico Compacto */}
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
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-2xl shadow-sm transition-all"
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
