import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { BilleteraAccountItem } from '../../models/finance';
import { getIconComponent, IconPickerModal } from '../../components/ui/IconPicker';
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
    addBilleteraItem,
    updateBilleteraItem,
    deleteBilleteraItem,
    moveBilleteraItem,
    addExpenseMovement,
    deleteExpenseMovement
  } = useFinance();

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
    targetId?: string;
    currentIcon: string;
    title: string;
  } | null>(null);

  // Drag and drop states
  const [draggedBilleteraIdx, setDraggedBilleteraIdx] = useState<number | null>(null);

  // Billetera State & Modals
  const [showAddBilleteraModal, setShowAddBilleteraModal] = useState(false);
  const [editingBilleteraObj, setEditingBilleteraObj] = useState<BilleteraAccountItem | null>(null);

  // Form fields for Billetera (Create / Edit)
  const [billeteraName, setBilleteraName] = useState('');
  const [billeteraBalance, setBilleteraBalance] = useState('');
  const [billeteraIcon, setBilleteraIcon] = useState('wallet');

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

  // Save Billetera
  const handleSaveBilletera = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billeteraName.trim()) return;
    const balance = parseFloat(billeteraBalance) || 0;

    if (editingBilleteraObj) {
      updateBilleteraItem(editingBilleteraObj.id, {
        nombre: billeteraName.trim(),
        saldo: balance,
        icon: billeteraIcon
      });
    } else {
      addBilleteraItem({
        nombre: billeteraName.trim(),
        saldo: balance,
        moneda: 'COP',
        icon: billeteraIcon
      });
    }

    setShowAddBilleteraModal(false);
    setEditingBilleteraObj(null);
  };

  // Delete Billetera
  const handleDeleteBilleteraFromModal = () => {
    if (!editingBilleteraObj) return;
    setConfirmConfig({
      isOpen: true,
      title: 'Eliminar Cuenta',
      message: `¿Estás seguro de eliminar "${editingBilleteraObj.nombre}"?`,
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

  // Open Create Movement Modal
  const openCreateMovement = () => {
    setMovementName('');
    setMovementAmount('');
    setMovementType('expense');
    setMovementSourceId(data.billeteraItems[0]?.id || '');
    setMovementDestType('none');
    setMovementDestId('');
    setMovementDestTransferId(data.billeteraItems[1]?.id || '');
    setShowAddMovementModal(true);
  };

  // Save Movement
  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(movementAmount) || 0;
    if (amount <= 0) return;

    const sourceId = movementSourceId || data.billeteraItems[0]?.id || '';
    const sourceAccount = data.billeteraItems.find(b => b.id === sourceId);

    // Negative balance warning
    if (movementType === 'expense' || movementType === 'transfer') {
      if (sourceAccount && (sourceAccount.saldo - amount < 0)) {
        setConfirmConfig({
          isOpen: true,
          title: 'Saldo Insuficiente en Origen',
          message: `El movimiento de ${formatCurrency(amount)} supera el saldo actual de "${sourceAccount.nombre}" (${formatCurrency(sourceAccount.saldo)}). El saldo resultante sería negativo (${formatCurrency(sourceAccount.saldo - amount)}).\n\nPor favor corrige el valor o revisa los saldos antes de continuar.`,
          confirmText: 'Entendido',
          cancelText: null,
          variant: 'danger',
          onConfirm: () => {}
        });
        return;
      }
    }

    let destType: 'none' | 'card' = 'none';
    let destId: string | undefined = undefined;
    let destName: string | undefined = undefined;

    if (movementType === 'transfer') {
      const destAccount = data.billeteraItems.find(b => b.id === movementDestTransferId);
      destType = 'none';
      destId = movementDestTransferId;
      destName = destAccount?.nombre;
    } else if (movementType === 'expense' && movementDestType === 'card' && movementDestId) {
      const card = data.creditCards.find(c => c.id === movementDestId);
      destType = 'card';
      destId = movementDestId;
      destName = card ? `Tarjeta ${card.name}` : undefined;
    }

    const defaultName = movementType === 'expense'
      ? (destName ? `Pago a ${destName}` : 'Gasto')
      : movementType === 'transfer'
      ? (destName ? `Transferencia a ${destName}` : 'Transferencia')
      : 'Ingreso';

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

      {/* SECCIÓN 2: REGISTRO (Movimientos) DIRECTAMENTE DEBAJO */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Registro
          </h3>

          <div className="flex items-center gap-2">
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

      {/* Modal: Crear / Editar Billetera */}
      {showAddBilleteraModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp my-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingBilleteraObj ? 'Editar Cuenta' : 'Nueva Cuenta'}
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
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={billeteraName}
                  onChange={e => setBilleteraName(e.target.value)}
                  placeholder="Ej. Billetera 1, Cuenta de Ahorros, Tarjeta Débito"
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
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nombre / Concepto
                </label>
                <input
                  type="text"
                  value={movementName}
                  onChange={e => setMovementName(e.target.value)}
                  placeholder={
                    movementType === 'expense'
                      ? 'Ej. Supermercado, Almuerzo, Transporte'
                      : movementType === 'income'
                      ? 'Ej. Salario, Rendimiento, Pago de amigo'
                      : 'Ej. Retiro de cajero, Transferencia a bolsillo'
                  }
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Monto con Calculadora */}
              <AmountCalculatorInput
                label="Monto"
                value={movementAmount}
                onChange={setMovementAmount}
                placeholder="0"
                required
                title="Ajustar Monto del Registro"
              />

              {/* Selector de Cuenta Origen / Destino */}
              {movementType === 'transfer' ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Desde Cuenta (Origen)
                    </label>
                    <select
                      value={movementSourceId}
                      onChange={e => setMovementSourceId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                      required
                    >
                      {data.billeteraItems.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.nombre} ({formatCurrency(b.saldo)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Hacia Cuenta (Destino)
                    </label>
                    <select
                      value={movementDestTransferId}
                      onChange={e => setMovementDestTransferId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                      required
                    >
                      {data.billeteraItems
                        .filter(b => b.id !== movementSourceId)
                        .map(b => (
                          <option key={b.id} value={b.id}>
                            {b.nombre} ({formatCurrency(b.saldo)})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {movementType === 'income' ? 'Depositar en Cuenta' : 'Desde Cuenta (Origen)'}
                  </label>
                  <select
                    value={movementSourceId}
                    onChange={e => setMovementSourceId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    required
                  >
                    {data.billeteraItems.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.nombre} ({formatCurrency(b.saldo)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Destino Opcional si es GASTO: ¿Es pago a Tarjeta de Crédito? */}
              {movementType === 'expense' && data.creditCards.length > 0 && (
                <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    ¿Es un pago / abono a Tarjeta de Crédito?
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMovementDestType('none');
                        setMovementDestId('');
                      }}
                      className={`py-2 px-3 rounded-2xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                        movementDestType === 'none'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Gasto General
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMovementDestType('card');
                        setMovementDestId(data.creditCards[0]?.id || '');
                      }}
                      className={`py-2 px-3 rounded-2xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                        movementDestType === 'card'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Pagar Tarjeta
                    </button>
                  </div>

                  {movementDestType === 'card' && (
                    <div className="animate-fadeIn mt-2">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        Selecciona la Tarjeta
                      </label>
                      <select
                        value={movementDestId}
                        onChange={e => setMovementDestId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                        required
                      >
                        {data.creditCards.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} (Cupo: {formatCurrency(c.creditLimit)})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
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

      {/* Pop-up Modal de Selección de Ícono */}
      {iconPickerTarget && (
        <IconPickerModal
          isOpen={true}
          onClose={() => setIconPickerTarget(null)}
          selectedIconId={iconPickerTarget.currentIcon}
          title={iconPickerTarget.title}
          onSelectIcon={(newIcon) => {
            if (!iconPickerTarget) return;
            if (iconPickerTarget.targetId) {
              updateBilleteraItem(iconPickerTarget.targetId, { icon: newIcon });
            }
            setIconPickerTarget(null);
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
