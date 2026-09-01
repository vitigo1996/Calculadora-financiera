import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { BilleteraAccountItem, DeudaItem } from '../../models/finance';
import { getIconComponent, IconPickerModal, IconPickerTrigger } from '../../components/ui/IconPicker';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { AmountCalculatorInput } from '../../components/ui/AmountCalculatorInput';
import {
  Wallet,
  Edit2,
  Plus,
  Trash2,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  GripVertical,
  History,
  CreditCard,
  ShoppingBag,
  Calendar
} from 'lucide-react';

export const BilleteraView: React.FC = () => {
  const {
    data,
    summary,
    addBilleteraItem,
    updateBilleteraItem,
    deleteBilleteraItem,
    moveBilleteraItem,
    addDeudaItem,
    updateDeudaItem,
    deleteDeudaItem,
    moveDeudaItem,
    addExpenseMovement,
    deleteExpenseMovement,
    clearExpenseMovements
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

  // Icon Picker Modal State
  const [iconPickerTarget, setIconPickerTarget] = useState<{
    type: 'billetera_item' | 'deuda_item' | 'billetera_form' | 'deuda_form';
    targetId?: string;
    currentIcon: string;
    title: string;
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

  // Deudas State & Modals
  const [showAddDeudaModal, setShowAddDeudaModal] = useState(false);
  const [editingDeudaObj, setEditingDeudaObj] = useState<DeudaItem | null>(null);

  // Form fields for Deuda (Create / Edit)
  const [deudaName, setDeudaName] = useState('');
  const [deudaTipo, setDeudaTipo] = useState<'por_cobrar' | 'por_pagar'>('por_pagar');
  const [deudaAmount, setDeudaAmount] = useState('');
  const [deudaIcon, setDeudaIcon] = useState('shield_alert');

  // Movimientos / Registro State & Modal
  const [showAddMovementModal, setShowAddMovementModal] = useState(false);
  const [movementType, setMovementType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [movementName, setMovementName] = useState('');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementSourceId, setMovementSourceId] = useState('');
  const [movementDestType, setMovementDestType] = useState<'none' | 'card'>('none');
  const [movementDestId, setMovementDestId] = useState('');
  const [movementDestTransferId, setMovementDestTransferId] = useState('');

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
  // Open Create Billetera Modal
  const openCreateBilletera = () => {
    setBilleteraName('');
    setBilleteraBalance('');
    setBilleteraIcon('wallet');
    setEditingBilleteraObj(null);
    setShowAddBilleteraModal(true);
  };

  // Open Edit Billetera Modal
  const openEditBilletera = (b: BilleteraAccountItem) => {
    setEditingBilleteraObj(b);
    setBilleteraName(b.nombre);
    setBilleteraBalance(b.saldo.toString());
    setBilleteraIcon(b.icon || 'wallet');
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
    const firstAccId = data.billeteraItems[0]?.id || '';
    setMovementSourceId(firstAccId);
    setMovementDestType('none');
    setMovementDestId(data.creditCards[0]?.id || '');
    const secondAcc = data.billeteraItems.find(b => b.id !== firstAccId);
    setMovementDestTransferId(secondAcc ? secondAcc.id : firstAccId);
    setShowAddMovementModal(true);
  };

  // Save Movement (Income, Expense, or Transfer)
  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(movementAmount) || 0;
    if (amount <= 0) return;

    let destType: 'none' | 'card' | 'account' | undefined = undefined;
    let destId: string | undefined = undefined;
    let destName: string | undefined = undefined;

    if (movementType === 'expense') {
      destType = movementDestType;
      if (movementDestType === 'card') {
        destId = movementDestId;
        const card = (data.creditCards || []).find(c => c.id === movementDestId) || data.creditCards[0];
        destName = card ? card.name : undefined;
      } else {
        destName = 'Pagos';
      }
    } else if (movementType === 'transfer') {
      destType = 'account';
      destId = movementDestTransferId;
      const targetAcc = (data.billeteraItems || []).find(a => a.id === movementDestTransferId);
      destName = targetAcc ? targetAcc.nombre : 'Cuenta destino';
    }

    const defaultName = movementType === 'transfer' ? 'Transferencia' : (movementType === 'income' ? 'Ingreso' : 'Gasto');
    const sourceId = movementSourceId || (data.billeteraItems[0]?.id || '');

    // Validar si el saldo origen queda menor a cero para advertir corrección
    if (movementType !== 'income') {
      const sourceAcc = (data.billeteraItems || []).find(b => b.id === sourceId);
      if (sourceAcc && (sourceAcc.saldo - amount < 0)) {
        setConfirmConfig({
          isOpen: true,
          title: 'Saldo Insuficiente',
          message: `El monto a registrar (${formatCurrency(amount)}) supera el saldo disponible en ${sourceAcc.nombre} (${formatCurrency(sourceAcc.saldo)}). Por favor corrige el valor o revisa los saldos de tus cuentas antes de continuar.`,
          confirmText: 'Entendido',
          cancelText: null,
          variant: 'danger',
          onConfirm: () => {}
        });
        return;
      }
    }

    addExpenseMovement({
      type: movementType,
      name: movementName.trim() || defaultName,
      amount,
      moneda: 'COP',
      sourceAccountId: sourceId,
      destinationType: destType,
      destinationId: destId,
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
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {/* Grip Handle */}
                        <div className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 cursor-grab active:cursor-grabbing flex-shrink-0">
                          <GripVertical className="w-4 h-4" />
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIconPickerTarget({
                              type: 'billetera_item',
                              targetId: item.id,
                              currentIcon: item.icon || 'wallet',
                              title: `Ícono para ${item.nombre}`
                            });
                          }}
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 cursor-pointer hover:scale-105 transition-transform ${getItemIconStyle()}`}
                          title="Toca para cambiar ícono"
                        >
                          <Icon className="w-5 h-5" />
                        </button>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">{item.nombre}</h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
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
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Grip Handle */}
                      <div className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 cursor-grab active:cursor-grabbing flex-shrink-0">
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIconPickerTarget({
                            type: 'deuda_item',
                            targetId: item.id,
                            currentIcon: item.icon || (isPorCobrar ? 'coins' : 'shield_alert'),
                            title: `Ícono para ${item.nombre}`
                          });
                        }}
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 cursor-pointer hover:scale-105 transition-transform ${getItemIconStyle()}`}
                        title="Toca para cambiar ícono"
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">{item.nombre}</h4>

                          {isPorCobrar ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 flex-shrink-0">
                              <ArrowDownLeft className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                              Me Deben
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 flex-shrink-0">
                              <ArrowUpRight className="w-2.5 h-2.5 text-rose-600 dark:text-rose-400" />
                              Debo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
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
                const isTransfer = mov.type === 'transfer';
                const formattedDate = new Date(mov.date).toLocaleDateString('es-CO', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={mov.id}
                    className="p-4 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 mt-0.5 ${
                          isIncome
                            ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                            : isTransfer
                            ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40'
                            : 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : isTransfer ? (
                          <ArrowLeftRight className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">{mov.name}</h4>

                        {/* Metadatos en Columna Vertical: Fecha, De:, Hacia: */}
                        <div className="flex flex-col gap-0.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                          <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500 font-medium">
                            <Calendar className="w-3 h-3 flex-shrink-0" /> {formattedDate}
                          </span>
                          <span className="font-medium text-slate-600 dark:text-slate-300">
                            De: <strong className="text-blue-600 dark:text-blue-400">{mov.sourceAccountName}</strong>
                          </span>
                          {mov.destinationName && (
                            <span className="font-medium text-slate-600 dark:text-slate-300">
                              Hacia:{' '}
                              <strong className="text-slate-800 dark:text-slate-200">
                                {isTransfer
                                  ? mov.destinationName
                                  : (mov.destinationType === 'card' ? `Tarjeta ${mov.destinationName}` : mov.destinationName)}
                              </strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <span
                          className={`font-mono font-bold text-sm block ${
                            isIncome
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : isTransfer
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isIncome ? '+' : isTransfer ? '' : '-'}{formatCurrency(mov.amount)}
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

      {/* Modal: Registro (Ingreso, Gasto o Transferencia) */}
      {showAddMovementModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto my-auto">
            {/* Header del Modal */}
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

            {/* Selector de 3 Opciones: Gasto | Ingreso | Transferencia */}
            <div className="grid grid-cols-3 gap-1.5 mb-4">
              <button
                type="button"
                onClick={() => setMovementType('expense')}
                className={`py-2.5 px-1.5 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                  movementType === 'expense'
                    ? 'bg-rose-100 dark:bg-rose-950/60 border-rose-500 text-rose-800 dark:text-rose-300 shadow-sm ring-1 ring-rose-400'
                    : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                Gasto
              </button>

              <button
                type="button"
                onClick={() => setMovementType('income')}
                className={`py-2.5 px-1.5 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                  movementType === 'income'
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-400'
                    : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Ingreso
              </button>

              <button
                type="button"
                onClick={() => setMovementType('transfer')}
                className={`py-2.5 px-1.5 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                  movementType === 'transfer'
                    ? 'bg-blue-100 dark:bg-blue-950/60 border-blue-500 text-blue-800 dark:text-blue-300 shadow-sm ring-1 ring-blue-400'
                    : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Transferir
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
                  placeholder={
                    movementType === 'transfer'
                      ? 'Ej. Retiro de cajero, Transferencia, Depósito'
                      : movementType === 'income'
                      ? 'Ej. Ingreso 1, Pago, Abono'
                      : 'Ej. Gasto 1, Compra, Servicio'
                  }
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>

              {/* Monto con Calculadora */}
              <AmountCalculatorInput
                label="Monto"
                value={movementAmount}
                onChange={setMovementAmount}
                placeholder="0"
                required
                title="Ajustar Monto"
              />

              {/* Origen / Cuenta */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {movementType === 'income' ? 'Cuenta' : 'Cuenta Origen'}
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

              {/* Para Transferencias: Selector de Cuenta Destino */}
              {movementType === 'transfer' && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Cuenta Destino
                  </label>
                  <select
                    value={movementDestTransferId}
                    onChange={e => setMovementDestTransferId(e.target.value)}
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
              )}

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

              {/* Saldo con Calculadora */}
              <AmountCalculatorInput
                label="Saldo"
                value={billeteraBalance}
                onChange={setBilleteraBalance}
                placeholder="0"
                title="Ajustar Saldo"
              />

              {/* Icon Picker Trigger */}
              <IconPickerTrigger
                selectedIconId={billeteraIcon}
                onClick={() => setIconPickerTarget({
                  type: 'billetera_form',
                  currentIcon: billeteraIcon,
                  title: 'Seleccionar Ícono de la Cuenta'
                })}
              />

              <div className="flex items-center gap-2 pt-3">
                {editingBilleteraObj && (
                  <button
                    type="button"
                    onClick={handleDeleteBilleteraFromModal}
                    className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 transition-colors flex items-center justify-center"
                    title="Eliminar esta cuenta"
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

              {/* Monto con Calculadora */}
              <AmountCalculatorInput
                label="Monto"
                value={deudaAmount}
                onChange={setDeudaAmount}
                placeholder="0"
                title="Ajustar Monto"
              />

              {/* Icon Picker Trigger */}
              <IconPickerTrigger
                selectedIconId={deudaIcon}
                onClick={() => setIconPickerTarget({
                  type: 'deuda_form',
                  currentIcon: deudaIcon,
                  title: 'Seleccionar Ícono de la Deuda'
                })}
              />

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

      {/* Pop-up Modal de Selección de Ícono */}
      {iconPickerTarget && (
        <IconPickerModal
          isOpen={true}
          onClose={() => setIconPickerTarget(null)}
          selectedIconId={iconPickerTarget.currentIcon}
          title={iconPickerTarget.title}
          onSelectIcon={(newIcon) => {
            if (!iconPickerTarget) return;
            if (iconPickerTarget.type === 'billetera_form') {
              setBilleteraIcon(newIcon);
            } else if (iconPickerTarget.type === 'deuda_form') {
              setDeudaIcon(newIcon);
            } else if (iconPickerTarget.type === 'billetera_item' && iconPickerTarget.targetId) {
              updateBilleteraItem(iconPickerTarget.targetId, { icon: newIcon });
            } else if (iconPickerTarget.type === 'deuda_item' && iconPickerTarget.targetId) {
              updateDeudaItem(iconPickerTarget.targetId, { icon: newIcon });
            }
          }}
        />
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
