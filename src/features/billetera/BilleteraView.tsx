import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { BilleteraAccountItem, DeudaItem } from '../../models/finance';
import { getIconComponent, IconPicker } from '../../components/ui/IconPicker';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import {
  Wallet,
  Edit2,
  Plus,
  Minus,
  Trash2,
  X,
  Calculator,
  ArrowDownLeft,
  ArrowUpRight,
  GripVertical,
  History,
  CreditCard,
  ShoppingBag,
  Calendar
} from 'lucide-react';

export const BilleteraView: React.FC = () => {
  const {
    data,
    addBilleteraItem,
    updateBilleteraItem,
    deleteBilleteraItem,
    moveBilleteraItem,
    addExpenseMovement,
    deleteExpenseMovement,
    clearExpenseMovements,
    addDeudaItem,
    updateDeudaItem,
    deleteDeudaItem,
    moveDeudaItem
  } = useFinance();

  // Submenu: Billetera vs Registro
  const [subView, setSubView] = useState<'billetera' | 'registro'>('billetera');

  // Confirmation modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string | null;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  } | null>(null);

  // Drag and drop states
  const [draggedBilleteraIdx, setDraggedBilleteraIdx] = useState<number | null>(null);
  const [draggedDeudaIdx, setDraggedDeudaIdx] = useState<number | null>(null);

  // Billetera State & Modals
  const [showAddBilleteraModal, setShowAddBilleteraModal] = useState(false);
  const [editingBilleteraObj, setEditingBilleteraObj] = useState<BilleteraAccountItem | null>(null);

  // Form fields for Billetera (Create / Edit)
  const [billeteraName, setBilleteraName] = useState('');
  const [billeteraBalance, setBilleteraBalance] = useState('');
  const [billeteraIcon, setBilleteraIcon] = useState('wallet');
  const [showBilleteraCalcPopup, setShowBilleteraCalcPopup] = useState(false);
  const [billeteraCalcDelta, setBilleteraCalcDelta] = useState('');

  // Deudas State & Modals
  const [showAddDeudaModal, setShowAddDeudaModal] = useState(false);
  const [editingDeudaObj, setEditingDeudaObj] = useState<DeudaItem | null>(null);

  // Form fields for Deuda (Create / Edit)
  const [deudaName, setDeudaName] = useState('');
  const [deudaTipo, setDeudaTipo] = useState<'por_cobrar' | 'por_pagar'>('por_pagar');
  const [deudaAmount, setDeudaAmount] = useState('');
  const [deudaIcon, setDeudaIcon] = useState('shield_alert');
  const [showDeudaCalcPopup, setShowDeudaCalcPopup] = useState(false);
  const [deudaCalcDelta, setDeudaCalcDelta] = useState('');

  // Movimientos / Registro State & Modal
  const [showAddMovementModal, setShowAddMovementModal] = useState(false);
  const [movementType, setMovementType] = useState<'expense' | 'income'>('expense');
  const [movementName, setMovementName] = useState('');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementSourceId, setMovementSourceId] = useState('');
  const [movementDestType, setMovementDestType] = useState<'none' | 'card'>('none');
  const [movementDestId, setMovementDestId] = useState('');
  const [showMovementCalcPopup, setShowMovementCalcPopup] = useState(false);
  const [movementCalcDelta, setMovementCalcDelta] = useState('');

  // Uniform neutral blue icon container
  const getItemIconStyle = () => {
    return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 shadow-sm';
  };

  // Drag and Drop for Billeteras
  const handleBilleteraDrop = (targetIdx: number) => {
    if (draggedBilleteraIdx === null || draggedBilleteraIdx === targetIdx) {
      setDraggedBilleteraIdx(null);
      return;
    }
    const diff = targetIdx - draggedBilleteraIdx;
    if (diff > 0) {
      for (let i = draggedBilleteraIdx; i < targetIdx; i++) {
        moveBilleteraItem(i, 'down');
      }
    } else {
      for (let i = draggedBilleteraIdx; i > targetIdx; i--) {
        moveBilleteraItem(i, 'up');
      }
    }
    setDraggedBilleteraIdx(null);
  };

  // Drag and Drop for Deudas
  const handleDeudaDrop = (targetIdx: number) => {
    if (draggedDeudaIdx === null || draggedDeudaIdx === targetIdx) {
      setDraggedDeudaIdx(null);
      return;
    }
    const diff = targetIdx - draggedDeudaIdx;
    if (diff > 0) {
      for (let i = draggedDeudaIdx; i < targetIdx; i++) {
        moveDeudaItem(i, 'down');
      }
    } else {
      for (let i = draggedDeudaIdx; i > targetIdx; i--) {
        moveDeudaItem(i, 'up');
      }
    }
    setDraggedDeudaIdx(null);
  };

  // Open Create Billetera Modal
  const openCreateBilletera = () => {
    setBilleteraName('');
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
    setBilleteraBalance(b.saldo.toString());
    setBilleteraIcon(b.icon || 'wallet');
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
        moneda: 'COP',
        saldo,
        icon: billeteraIcon
      });
    } else {
      addBilleteraItem({
        nombre: billeteraName.trim(),
        moneda: 'COP',
        saldo,
        icon: billeteraIcon
      });
    }
    setShowAddBilleteraModal(false);
    setEditingBilleteraObj(null);
  };

  // Delete Billetera from inside Edit Modal
  const handleDeleteBilleteraFromModal = () => {
    if (!editingBilleteraObj) return;
    setConfirmConfig({
      isOpen: true,
      title: 'Eliminar Cuenta',
      message: `¿Estás seguro de eliminar la cuenta "${editingBilleteraObj.nombre}"?`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
      onConfirm: () => {
        deleteBilleteraItem(editingBilleteraObj.id);
        setShowAddBilleteraModal(false);
        setEditingBilleteraObj(null);
      }
    });
  };

  // Open Create Deuda Modal
  const openCreateDeuda = () => {
    setDeudaName('');
    setDeudaTipo('por_pagar');
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
    setDeudaTipo(d.tipo);
    setDeudaAmount(d.monto !== undefined && d.monto > 0 ? d.monto.toString() : '');
    setDeudaIcon(d.icon || (d.tipo === 'por_cobrar' ? 'arrow_down_left' : 'shield_alert'));
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
        moneda: 'COP',
        tipo: deudaTipo,
        monto,
        icon: deudaIcon
      });
    } else {
      addDeudaItem({
        nombre: deudaName.trim(),
        moneda: 'COP',
        tipo: deudaTipo,
        monto,
        icon: deudaIcon
      });
    }
    setShowAddDeudaModal(false);
    setEditingDeudaObj(null);
  };

  // Delete Deuda from inside Edit Modal
  const handleDeleteDeudaFromModal = () => {
    if (!editingDeudaObj) return;
    setConfirmConfig({
      isOpen: true,
      title: 'Eliminar Deuda',
      message: `¿Estás seguro de eliminar el registro "${editingDeudaObj.nombre}"?`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
      onConfirm: () => {
        deleteDeudaItem(editingDeudaObj.id);
        setShowAddDeudaModal(false);
        setEditingDeudaObj(null);
      }
    });
  };

  // Open Create Movement Modal
  const openCreateMovement = () => {
    if (!data.billeteraItems || data.billeteraItems.length === 0) {
      setConfirmConfig({
        isOpen: true,
        title: 'Atención',
        message: 'Debes agregar primero al menos una cuenta en la pestaña Billetera antes de registrar un movimiento.',
        confirmText: 'Entendido',
        cancelText: null,
        variant: 'warning',
        onConfirm: () => {}
      });
      return;
    }
    setMovementType('expense');
    setMovementName('');
    setMovementAmount('');
    setMovementSourceId(data.billeteraItems[0]?.id || '');
    setMovementDestType('none');
    setMovementDestId(data.creditCards[0]?.id || '');
    setMovementCalcDelta('');
    setShowMovementCalcPopup(false);
    setShowAddMovementModal(true);
  };

  // Save Movement (Income or Expense)
  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementName.trim()) return;
    const amount = parseFloat(movementAmount) || 0;
    if (amount <= 0) return;

    let destName: string | undefined = undefined;
    if (movementType === 'expense' && movementDestType === 'card') {
      const card = (data.creditCards || []).find(c => c.id === movementDestId) || data.creditCards[0];
      destName = card ? card.name : undefined;
    }

    addExpenseMovement({
      type: movementType,
      name: movementName.trim(),
      amount,
      moneda: 'COP',
      sourceAccountId: movementSourceId || (data.billeteraItems[0]?.id || ''),
      destinationType: movementType === 'expense' ? movementDestType : undefined,
      destinationId: (movementType === 'expense' && movementDestType === 'card') ? movementDestId : undefined,
      destinationName: destName
    });

    setShowAddMovementModal(false);
  };

  const movements = data.expenseMovements || [];

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Menú Superior de 2 opciones: Billetera | Registro */}
      <div className="flex items-center justify-center">
        <div className="bg-slate-200/80 dark:bg-slate-800 p-1 rounded-2xl flex items-center gap-1 shadow-inner border border-slate-300/80 dark:border-slate-700/60 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSubView('billetera')}
            className={`flex-1 sm:px-8 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              subView === 'billetera'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wallet className="w-4 h-4" /> Billetera
          </button>
          <button
            type="button"
            onClick={() => setSubView('registro')}
            className={`flex-1 sm:px-8 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              subView === 'registro'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-4 h-4" /> Registro
          </button>
        </div>
      </div>

      {/* CONTENIDO SEGÚN LA PESTAÑA ACTIVA */}
      {subView === 'billetera' ? (
        <div className="space-y-6">
          {/* SECCIÓN 1: BILLETERA */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Billetera</h3>

              {/* Botón directo de Agregar */}
              <button
                onClick={openCreateBilletera}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40 hover:bg-blue-200 transition-all flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar
              </button>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {(!data.billeteraItems || data.billeteraItems.length === 0) ? (
                <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                  No tienes cuentas en tu billetera. Haz clic en <strong>Agregar</strong> para registrar una.
                </div>
              ) : (
                data.billeteraItems.map((item, idx) => {
                  const isDragging = draggedBilleteraIdx === idx;
                  const Icon = getIconComponent(item.icon);

                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={e => {
                        setDraggedBilleteraIdx(idx);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragOver={e => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                      }}
                      onDrop={e => {
                        e.preventDefault();
                        handleBilleteraDrop(idx);
                      }}
                      onDragEnd={() => setDraggedBilleteraIdx(null)}
                      className={`p-4 bg-white dark:bg-slate-900 transition-all flex items-center justify-between cursor-grab active:cursor-grabbing ${
                        isDragging ? 'opacity-40 scale-[0.99] bg-blue-50/50 dark:bg-blue-950/30' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Grip Handle */}
                        <div className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 cursor-grab active:cursor-grabbing">
                          <GripVertical className="w-4 h-4" />
                        </div>

                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${getItemIconStyle()}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.nombre}</h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="font-mono font-bold text-sm text-slate-800 dark:text-white block">
                            {formatCurrency(item.saldo)}
                          </span>
                        </div>

                        <button
                          onClick={() => openEditBilletera(item)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300/80 dark:border-transparent transition-colors"
                          title="Editar saldo y cuenta"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* SECCIÓN 2: DEUDAS */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Deudas</h3>

              {/* Botón directo de Agregar */}
              <button
                onClick={openCreateDeuda}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40 hover:bg-blue-200 transition-all flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar
              </button>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {(!data.deudaItems || data.deudaItems.length === 0) ? (
                <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                  No tienes deudas registradas. Haz clic en <strong>Agregar</strong> para registrar una.
                </div>
              ) : (
                data.deudaItems.map((item, idx) => {
                const isDragging = draggedDeudaIdx === idx;
                const Icon = getIconComponent(item.icon);
                const isPorCobrar = item.tipo === 'por_cobrar';
                const hasAmount = item.monto !== undefined && item.monto > 0;

                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={e => {
                      setDraggedDeudaIdx(idx);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={e => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={e => {
                      e.preventDefault();
                      handleDeudaDrop(idx);
                    }}
                    onDragEnd={() => setDraggedDeudaIdx(null)}
                    className={`p-4 bg-white dark:bg-slate-900 transition-all flex items-center justify-between cursor-grab active:cursor-grabbing ${
                      isDragging ? 'opacity-40 scale-[0.99] bg-blue-50/50 dark:bg-blue-950/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Grip Handle */}
                      <div className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${getItemIconStyle()}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.nombre}</h4>

                          {isPorCobrar ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                              <ArrowDownLeft className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              Me Deben
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50">
                              <ArrowUpRight className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                              Debo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {hasAmount ? (
                        <div className="text-right">
                          <span className="font-mono font-bold text-sm text-slate-800 dark:text-white block">
                            {formatCurrency(item.monto || 0)}
                          </span>
                        </div>
                      ) : null}

                      <button
                        onClick={() => openEditDeuda(item)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300/80 dark:border-transparent transition-colors"
                        title="Editar deuda y monto"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    ) : (
        /* SECCIÓN: REGISTRO (Movimientos) */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Registro
            </h3>

            <div className="flex items-center gap-2">
              {movements.length > 0 && (
                <button
                  onClick={() => {
                    setConfirmConfig({
                      isOpen: true,
                      title: 'Limpiar Historial',
                      message: '¿Estás seguro de eliminar todo el historial de movimientos registrados?',
                      confirmText: 'Sí, limpiar',
                      cancelText: 'Cancelar',
                      variant: 'danger',
                      onConfirm: () => clearExpenseMovements()
                    });
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40 hover:bg-rose-100 transition-all flex items-center gap-1 shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Limpiar Historial
                </button>
              )}

              <button
                onClick={openCreateMovement}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40 hover:bg-blue-200 transition-all flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Registrar
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {movements.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                No hay movimientos registrados. Haz clic en <strong>Registrar</strong> para añadir uno.
              </div>
            ) : (
              movements.map(mov => {
                const isIncome = mov.type === 'income';
                const formattedDate = new Date(mov.date).toLocaleDateString('es-CO', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={mov.id}
                    className="p-4 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-sm ${
                          isIncome
                            ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                            : 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
                        }`}
                      >
                        {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 dark:text-white text-sm">{mov.name}</h4>
                        </div>

                        {/* Sin emojis: solo De y Hacia */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500">
                            <Calendar className="w-3 h-3" /> {formattedDate}
                          </span>
                          <span>•</span>
                          <span className="font-medium text-slate-600 dark:text-slate-300">
                            De: <strong className="text-blue-600 dark:text-blue-400">{mov.sourceAccountName}</strong>
                          </span>
                          {!isIncome && mov.destinationType && (
                            <>
                              <span>•</span>
                              <span className="font-medium text-slate-600 dark:text-slate-300">
                                Hacia:{' '}
                                <strong className="text-slate-800 dark:text-slate-200">
                                  {mov.destinationType === 'card'
                                    ? `Tarjeta ${mov.destinationName || ''}`
                                    : 'Pagos'}
                                </strong>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span
                          className={`font-mono font-bold text-sm block ${
                            isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isIncome ? '+' : '-'}{formatCurrency(mov.amount)}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setConfirmConfig({
                            isOpen: true,
                            title: 'Eliminar Registro',
                            message: `¿Estás seguro de eliminar el registro "${mov.name}"?`,
                            confirmText: 'Sí, eliminar',
                            cancelText: 'Cancelar',
                            variant: 'danger',
                            onConfirm: () => deleteExpenseMovement(mov.id)
                          });
                        }}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-300/80 dark:border-transparent transition-colors"
                        title="Eliminar este registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modal: Registro (Ingreso o Gasto) */}
      {showAddMovementModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto my-auto">
            {/* Header del Modal con solo el título Registro */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Registro
              </h3>
              <button
                onClick={() => setShowAddMovementModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selector de Opción: Ingreso o Gasto */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setMovementType('expense')}
                className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  movementType === 'expense'
                    ? 'bg-rose-100 dark:bg-rose-950/60 border-rose-500 text-rose-800 dark:text-rose-300 shadow-sm ring-1 ring-rose-400'
                    : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                Gasto
              </button>

              <button
                type="button"
                onClick={() => setMovementType('income')}
                className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  movementType === 'income'
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-400'
                    : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Ingreso
              </button>
            </div>

            <form onSubmit={handleSaveMovement} className="space-y-4">
              {/* Concepto */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Concepto
                </label>
                <input
                  type="text"
                  value={movementName}
                  onChange={e => setMovementName(e.target.value)}
                  placeholder={movementType === 'income' ? 'Ej. Ingreso 1, Pago, Abono' : 'Ej. Gasto 1, Compra, Servicio'}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                  autoFocus
                />
              </div>

              {/* Monto con Calculadora */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Monto
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={movementAmount}
                    onChange={e => setMovementAmount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl pl-3.5 pr-11 py-2.5 text-sm text-slate-800 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowMovementCalcPopup(!showMovementCalcPopup)}
                    title="Calculadora (+ / -)"
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-all ${
                      showMovementCalcPopup
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Calculator className="w-4 h-4" />
                  </button>

                  {/* Pop-up de Calculadora */}
                  {showMovementCalcPopup && (
                    <div className="absolute right-0 top-full mt-2 z-30 p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-xl space-y-2.5 w-64 animate-scaleUp">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Ajustar Monto
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowMovementCalcPopup(false)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="number"
                        step="any"
                        value={movementCalcDelta}
                        onChange={e => setMovementCalcDelta(e.target.value)}
                        placeholder="Valor a sumar o restar..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs px-2.5 py-1.5 rounded-xl text-slate-800 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                        autoFocus
                      />

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const delta = parseFloat(movementCalcDelta);
                            if (!isNaN(delta) && delta > 0) {
                              const curr = parseFloat(movementAmount) || 0;
                              setMovementAmount((curr + delta).toString());
                            }
                            setMovementCalcDelta('');
                            setShowMovementCalcPopup(false);
                          }}
                          className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> Sumar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const delta = parseFloat(movementCalcDelta);
                            if (!isNaN(delta) && delta > 0) {
                              const curr = parseFloat(movementAmount) || 0;
                              setMovementAmount(Math.max(0, curr - delta).toString());
                            }
                            setMovementCalcDelta('');
                            setShowMovementCalcPopup(false);
                          }}
                          className="flex-1 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" /> Restar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Origen / Cuenta */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {movementType === 'income' ? 'Cuenta' : 'Origen'}
                </label>
                <select
                  value={movementSourceId}
                  onChange={e => setMovementSourceId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                >
                  {data.billeteraItems.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destino: Solo para Gastos (Pagos y Tarjetas) */}
              {movementType === 'expense' && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Destino
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {/* 1. Pagos */}
                    <button
                      type="button"
                      onClick={() => {
                        setMovementDestType('none');
                        setMovementDestId('');
                      }}
                      className={`py-2 px-2 rounded-2xl text-xs font-bold border flex flex-col items-center justify-center gap-1 transition-all ${
                        movementDestType === 'none'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Pagos</span>
                    </button>

                    {/* 2. Tarjetas */}
                    <button
                      type="button"
                      onClick={() => {
                        setMovementDestType('card');
                        setMovementDestId(data.creditCards[0]?.id || '');
                      }}
                      className={`py-2 px-2 rounded-2xl text-xs font-bold border flex flex-col items-center justify-center gap-1 transition-all ${
                        movementDestType === 'card'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Tarjetas</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-selector de Tarjeta (Solo para Gastos a Tarjeta) */}
              {movementType === 'expense' && movementDestType === 'card' && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Selecciona la Tarjeta
                  </label>
                  <select
                    value={movementDestId}
                    onChange={e => setMovementDestId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    required
                  >
                    {data.creditCards.map(card => (
                      <option key={card.id} value={card.id}>
                        {card.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddMovementModal(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs py-3 rounded-2xl transition-colors border border-slate-300/80 dark:border-transparent text-center"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-2xl shadow-sm transition-all text-center"
                >
                  Guardar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Crear / Editar Billetera */}
      {showAddBilleteraModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto my-auto">
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
                  placeholder="Ej. Cuenta 1, Cuenta 2, Efectivo"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Saldo con botón de calculadora integrado dentro del input */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Saldo
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
                    <div className="absolute right-0 top-full mt-2 z-30 p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-xl space-y-2.5 w-64 animate-scaleUp">
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

              {/* Icon Picker con Mosaico Compacto y Pequeño */}
              <IconPicker selectedIconId={billeteraIcon} onSelectIcon={setBilleteraIcon} />

              <div className="flex items-center gap-2 pt-3">
                {editingBilleteraObj && (
                  <button
                    type="button"
                    onClick={handleDeleteBilleteraFromModal}
                    className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 transition-colors flex items-center justify-center"
                    title="Eliminar esta billetera"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowAddBilleteraModal(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs py-3 rounded-2xl transition-colors border border-slate-300/80 dark:border-transparent text-center"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-2xl shadow-sm transition-all text-center"
                >
                  {editingBilleteraObj ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Crear / Editar Deuda */}
      {showAddDeudaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto my-auto">
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
                  placeholder="Ej. Deuda 1, Préstamo 1, Compromiso"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Selector de Dirección: 'Me Deben' (Verde suave) vs 'Debo' (Rojo suave) */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Dirección
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeudaTipo('por_cobrar')}
                    className={`py-2.5 px-2 rounded-2xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                      deudaTipo === 'por_cobrar'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-400'
                        : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Me Deben
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeudaTipo('por_pagar')}
                    className={`py-2.5 px-2 rounded-2xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                      deudaTipo === 'por_pagar'
                        ? 'bg-rose-100 dark:bg-rose-950/60 border-rose-500 text-rose-800 dark:text-rose-300 shadow-sm ring-1 ring-rose-400'
                        : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    Debo
                  </button>
                </div>
              </div>

              {/* Monto con botón de calculadora integrado dentro del input */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Monto
                </label>

                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={deudaAmount}
                    onChange={e => setDeudaAmount(e.target.value)}
                    placeholder="0"
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
                    <div className="absolute right-0 top-full mt-2 z-30 p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-xl space-y-2.5 w-64 animate-scaleUp">
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

              {/* Icon Picker con Mosaico Compacto y Pequeño */}
              <IconPicker selectedIconId={deudaIcon} onSelectIcon={setDeudaIcon} />

              <div className="flex items-center gap-2 pt-3">
                {editingDeudaObj && (
                  <button
                    type="button"
                    onClick={handleDeleteDeudaFromModal}
                    className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 transition-colors flex items-center justify-center"
                    title="Eliminar esta deuda"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowAddDeudaModal(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs py-3 rounded-2xl transition-colors border border-slate-300/80 dark:border-transparent text-center"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-2xl shadow-sm transition-all text-center"
                >
                  {editingDeudaObj ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmConfig && (
        <ConfirmModal
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          cancelText={confirmConfig.cancelText}
          variant={confirmConfig.variant}
          onConfirm={() => {
            confirmConfig.onConfirm();
            setConfirmConfig(null);
          }}
          onCancel={() => setConfirmConfig(null)}
        />
      )}
    </div>
  );
};
