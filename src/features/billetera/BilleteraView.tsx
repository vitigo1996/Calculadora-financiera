import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, calculateCardPurchasesTotal } from '../../services/financeCalculations';
import { BilleteraAccountItem } from '../../models/finance';
import { getIconComponent, IconPickerModal, IconPickerTrigger } from '../../components/ui/IconPicker';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { AmountCalculatorInput } from '../../components/ui/AmountCalculatorInput';
import { CreditosSuscripcionesView } from '../creditos_suscripciones/CreditosSuscripcionesView';
import {
  Wallet,
  Edit2,
  Plus,
  Trash2,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  History,
  CreditCard,
  ShoppingBag,
  Calendar,
  Check,
  GripVertical
} from 'lucide-react';

export const BilleteraView: React.FC = () => {
  const {
    data,
    addBilleteraItem,
    updateBilleteraItem,
    deleteBilleteraItem,
    reorderBilleteraItems,
    addExpenseMovement,
    deleteExpenseMovement,
    clearExpenseMovements
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
    type?: 'billetera_item' | 'billetera_form' | 'movement_form';
  } | null>(null);

  // Submenu: Billetera | Tarjetas
  const [subView, setSubView] = useState<'billetera' | 'tarjetas'>('billetera');

  // Edit states for Billetera and Registro
  const [isEditingBilletera, setIsEditingBilletera] = useState(false);
  const [isEditingMovements, setIsEditingMovements] = useState(false);
  const [draggedBilleteraIdx, setDraggedBilleteraIdx] = useState<number | null>(null);

  // Pagination for movements (10 records at a time)
  const [visibleMovementsCount, setVisibleMovementsCount] = useState(10);

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
  const [movementIcon, setMovementIcon] = useState('shopping_bag');
  const [movementSourceId, setMovementSourceId] = useState('');
  const [movementDestType, setMovementDestType] = useState<'none' | 'payment'>('none');
  const [movementDestId, setMovementDestId] = useState('');
  const [movementDestTransferId, setMovementDestTransferId] = useState('');

  // Origen de Ingreso (General vs Deuda a mi favor)
  const [incomeOriginType, setIncomeOriginType] = useState<'general' | 'deuda'>('general');
  const [incomeOriginDeudaId, setIncomeOriginDeudaId] = useState('');

  const deudasPorPagar = (data.deudaItems || []).filter(d => d.tipo === 'por_pagar');
  const deudasPorCobrar = (data.deudaItems || []).filter(d => d.tipo === 'por_cobrar');

  // Uniform neutral blue icon container
  const getItemIconStyle = () => {
    return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 shadow-sm';
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
    setMovementIcon('shopping_bag');
    const firstBilletera = data.billeteraItems[0] ? `billetera:${data.billeteraItems[0].id}` : '';
    setMovementSourceId(firstBilletera);
    setMovementDestType('none');
    setIncomeOriginType('general');
    setIncomeOriginDeudaId(deudasPorCobrar[0]?.id || '');
    const firstTarget = data.creditCards[0]
      ? `card:${data.creditCards[0].id}`
      : (deudasPorPagar[0] ? `deuda:${deudasPorPagar[0].id}` : '');
    setMovementDestId(firstTarget);
    const secondTarget = data.billeteraItems[1]
      ? `billetera:${data.billeteraItems[1].id}`
      : (data.portfolioItems[0] ? `portfolio:${data.portfolioItems[0].id}` : '');
    setMovementDestTransferId(secondTarget);
    setShowAddMovementModal(true);
  };

  // Save Movement
  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(movementAmount) || 0;
    if (amount <= 0) return;

    const sourceId = movementSourceId || (data.billeteraItems[0] ? `billetera:${data.billeteraItems[0].id}` : '');
    const isSourcePortfolio = sourceId.startsWith('portfolio:');
    const rawSourceId = sourceId.replace('portfolio:', '').replace('billetera:', '');
    const sourceAccount = isSourcePortfolio
      ? data.portfolioItems.find(p => p.id === rawSourceId)
      : data.billeteraItems.find(b => b.id === rawSourceId);

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

    let destType: 'none' | 'card' | 'deuda' | 'portfolio' | 'account' = 'none';
    let destId: string | undefined = undefined;
    let destName: string | undefined = undefined;

    if (movementType === 'transfer') {
      const isDestPortfolio = movementDestTransferId.startsWith('portfolio:');
      const rawDestId = movementDestTransferId.replace('portfolio:', '').replace('billetera:', '');
      const destAccount = isDestPortfolio
        ? data.portfolioItems.find(p => p.id === rawDestId)
        : data.billeteraItems.find(b => b.id === rawDestId);

      destType = isDestPortfolio ? 'portfolio' : 'account';
      destId = movementDestTransferId;
      destName = destAccount?.nombre;
    } else if (movementType === 'expense' && movementDestType === 'payment' && movementDestId) {
      if (movementDestId.startsWith('card:')) {
        const cardId = movementDestId.replace('card:', '');
        const card = data.creditCards.find(c => c.id === cardId);
        
        // Validar si el pago supera la deuda total adeudada
        if (card) {
          const totalDeuda = calculateCardPurchasesTotal(card);
          if (amount > totalDeuda) {
            setConfirmConfig({
              isOpen: true,
              title: 'Monto Superior a la Deuda',
              message: `Estás ingresando un pago de ${formatCurrency(amount)}, pero la totalidad adeudada en "${card.name}" es de ${formatCurrency(totalDeuda)}.\n\nPor favor corrige el valor antes de continuar.`,
              confirmText: 'Entendido',
              cancelText: null,
              variant: 'warning',
              onConfirm: () => {}
            });
            return;
          }
        }

        destType = 'card';
        destId = cardId;
        destName = card ? `Tarjeta ${card.name}` : undefined;
      } else if (movementDestId.startsWith('deuda:')) {
        const deudaId = movementDestId.replace('deuda:', '');
        const deuda = deudasPorPagar.find(d => d.id === deudaId);
        destType = 'deuda';
        destId = deudaId;
        destName = deuda ? `Deuda ${deuda.nombre}` : undefined;
      }
    } else if (movementType === 'income' && incomeOriginType === 'deuda' && incomeOriginDeudaId) {
      const deuda = deudasPorCobrar.find(d => d.id === incomeOriginDeudaId);
      destType = 'deuda';
      destId = incomeOriginDeudaId;
      destName = deuda ? deuda.nombre : undefined;
    }

    const defaultName = movementType === 'expense'
      ? (destName ? `Pago a ${destName}` : 'Gasto')
      : movementType === 'transfer'
      ? (destName ? `Transferencia a ${destName}` : 'Transferencia')
      : (destName ? `Cobro de deuda ${destName}` : 'Ingreso');

    const sourceMoneda = sourceAccount?.moneda || 'COP';

    addExpenseMovement({
      type: movementType,
      name: movementName.trim() || defaultName,
      amount,
      moneda: sourceMoneda,
      icon: movementIcon,
      sourceAccountId: sourceId,
      destinationType: destType,
      destinationId: destId,
      destinationName: destName
    });

    setShowAddMovementModal(false);
  };

  const movements = data.expenseMovements || [];

  const isAnyModalOpen =
    showAddBilleteraModal ||
    showAddMovementModal ||
    Boolean(iconPickerTarget) ||
    Boolean(confirmConfig?.isOpen);

  return (
    <div className="space-y-6 pb-2 animate-fadeIn">
      {/* Menú Superior de 2 opciones: Billetera | Tarjetas */}
      <div className="sticky top-0 z-30 bg-slate-50 dark:bg-slate-900 pt-1 pb-2.5 -mx-3.5 px-3.5 flex items-center justify-center border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="bg-slate-200/80 dark:bg-slate-800 p-1 rounded-2xl flex items-center gap-1 shadow-inner border border-slate-300/80 dark:border-slate-700/60 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSubView('billetera')}
            className={`flex-1 sm:px-8 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              subView === 'billetera'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wallet className="w-4 h-4" /> Billetera
          </button>
          <button
            type="button"
            onClick={() => setSubView('tarjetas')}
            className={`flex-1 sm:px-8 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              subView === 'tarjetas'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Tarjetas
          </button>
        </div>
      </div>

      {subView === 'tarjetas' ? (
        <CreditosSuscripcionesView />
      ) : (
        <>
          {/* SECCIÓN 1: BILLETERA */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="p-4 bg-slate-100 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base flex items-center gap-2.5 uppercase tracking-wide">
                <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" /> BILLETERA
              </h3>

              {/* Botones de acción: Editar y Agregar (+) */}
              <div className="flex items-center gap-2">
                {(data.billeteraItems || []).length > 0 && (
                  <button
                    onClick={() => setIsEditingBilletera(!isEditingBilletera)}
                    className={`p-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center shadow-sm ${
                      isEditingBilletera
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300/80 dark:border-transparent'
                    }`}
                    title={isEditingBilletera ? 'Listo' : 'Editar Billetera'}
                  >
                    {isEditingBilletera ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                  </button>
                )}

                <button
                  onClick={openCreateBilletera}
                  className="p-2 rounded-xl text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40 hover:bg-blue-200 transition-all flex items-center justify-center shadow-sm"
                  title="Agregar Cuenta"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {(!data.billeteraItems || data.billeteraItems.length === 0) ? (
                <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                  No tienes cuentas en tu billetera. Haz clic en <strong>+</strong> para registrar una.
                </div>
              ) : (
                data.billeteraItems.map((item, idx) => {
                  return (
                    <div
                      key={item.id}
                      draggable={isEditingBilletera}
                      onDragStart={(e) => {
                        setDraggedBilleteraIdx(idx);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedBilleteraIdx !== null && draggedBilleteraIdx !== idx) {
                          reorderBilleteraItems(draggedBilleteraIdx, idx);
                        }
                        setDraggedBilleteraIdx(null);
                      }}
                      onDragEnd={() => setDraggedBilleteraIdx(null)}
                      className={`p-4 bg-white dark:bg-slate-900 transition-all flex items-center justify-between ${
                        isEditingBilletera ? 'cursor-move select-none' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {isEditingBilletera && (
                          <div className="text-slate-400 dark:text-slate-500 cursor-grab active:cursor-grabbing p-1 flex-shrink-0">
                            <GripVertical className="w-4 h-4" />
                          </div>
                        )}
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

                        {isEditingBilletera ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmConfig({
                                isOpen: true,
                                title: 'Eliminar Cuenta',
                                message: `¿Estás seguro de eliminar "${item.nombre}"?`,
                                confirmText: 'Sí, eliminar',
                                cancelText: 'Cancelar',
                                variant: 'danger',
                                onConfirm: () => deleteBilleteraItem(item.id)
                              });
                            }}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-300/80 dark:border-transparent transition-colors"
                            title="Eliminar cuenta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => openEditBilletera(item)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300/80 dark:border-transparent transition-colors"
                            title="Editar saldo y cuenta"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* SECCIÓN 2: REGISTRO (Movimientos) DIRECTAMENTE DEBAJO */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="p-4 bg-slate-100 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base flex items-center gap-2.5 uppercase tracking-wide">
                <History className="w-5 h-5 text-blue-600 dark:text-blue-400" /> REGISTRO
              </h3>

              <div className="flex items-center gap-2">
                {movements.length > 0 && (
                  <button
                    onClick={() => {
                      setConfirmConfig({
                        isOpen: true,
                        title: 'Limpiar Registro',
                        message: '¿Estás seguro de limpiar todo el registro de movimientos?',
                        confirmText: 'Sí, limpiar',
                        cancelText: 'Cancelar',
                        variant: 'warning',
                        onConfirm: () => clearExpenseMovements()
                      });
                    }}
                    className="p-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300/80 dark:border-transparent transition-all flex items-center justify-center shadow-sm"
                    title="Limpiar Registro"
                  >
                    <svg className="w-4 h-4 text-slate-700 dark:text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v9" />
                      <path d="M8.5 13.5C8.5 12 9.8 11 12 11s3.5 1 3.5 2.5" />
                      <path d="M7 13.5h10" />
                      <path d="M7 13.5c-.5 3-1.8 5.5-2.5 7.5a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1c-.7-2-2-4.5-2.5-7.5" />
                      <path d="M9.5 17.5 9 22" />
                      <path d="M12 16.5v5.5" />
                      <path d="M14.5 17.5 15 22" />
                    </svg>
                  </button>
                )}

                {movements.length > 0 && (
                  <button
                    onClick={() => setIsEditingMovements(!isEditingMovements)}
                    className={`p-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center shadow-sm ${
                      isEditingMovements
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300/80 dark:border-transparent'
                    }`}
                    title={isEditingMovements ? 'Listo' : 'Editar Registro'}
                  >
                    {isEditingMovements ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                  </button>
                )}

                <button
                  onClick={openCreateMovement}
                  className="p-2 rounded-xl text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40 hover:bg-blue-200 transition-all flex items-center justify-center shadow-sm"
                  title="Registrar Movimiento"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {movements.length === 0 ? (
                <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                  No hay movimientos registrados. Haz clic en <strong>+</strong> para añadir uno.
                </div>
              ) : (
                movements.slice(0, visibleMovementsCount).map(mov => {
                  const isIncome = mov.type === 'income';
                  const isTransfer = mov.type === 'transfer';
                  const MovementIcon = getIconComponent(mov.icon || (isIncome ? 'banknote' : isTransfer ? 'layers' : 'shopping_bag'));
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
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 mt-0.5 border bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50">
                          <MovementIcon className="w-5 h-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">{mov.name}</h4>

                          {/* Metadatos en Columna Vertical: Fecha, De:, Hacia: */}
                          <div className="flex flex-col gap-0.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                            <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500 font-medium">
                              <Calendar className="w-3 h-3 flex-shrink-0" /> {formattedDate}
                            </span>
                            {isIncome ? (
                              <>
                                {mov.destinationType === 'deuda' && mov.destinationName ? (
                                   <>
                                    <span className="font-medium text-slate-600 dark:text-slate-300">
                                      De: <strong className="text-emerald-600 dark:text-emerald-400">Deuda {mov.destinationName}</strong>
                                    </span>
                                    <span className="font-medium text-slate-600 dark:text-slate-300">
                                      Hacia: <strong className="text-slate-800 dark:text-slate-200">{mov.sourceAccountName}</strong>
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-medium text-slate-600 dark:text-slate-300">
                                    Hacia: <strong className="text-emerald-600 dark:text-emerald-400">{mov.sourceAccountName}</strong>
                                  </span>
                                )}
                              </>
                            ) : (
                              <>
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
                              </>
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

                        {isEditingMovements && (
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
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {movements.length > visibleMovementsCount && (
              <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleMovementsCount(prev => prev + 10)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/50 transition-all shadow-sm inline-flex items-center gap-1.5"
                >
                  Mostrar más
                </button>
              </div>
            )}
          </div>
        </>
      )}

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
                onClick={() => {
                  setMovementType('expense');
                  setMovementIcon('shopping_bag');
                }}
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
                onClick={() => {
                  setMovementType('income');
                  setMovementIcon('banknote');
                }}
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
                onClick={() => {
                  setMovementType('transfer');
                  setMovementIcon('layers');
                }}
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
              {/* Selector de Categoría / Ícono */}
              <IconPickerTrigger
                selectedIconId={movementIcon}
                label="Categoría / Ícono"
                onClick={() => {
                  setIconPickerTarget({
                    type: 'movement_form',
                    currentIcon: movementIcon,
                    title: 'Seleccionar Categoría'
                  });
                }}
              />

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Concepto
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
                      Cuenta Origen
                    </label>
                    <select
                      value={movementSourceId}
                      onChange={e => setMovementSourceId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                      required
                    >
                      {data.billeteraItems.length > 0 && (
                        <optgroup label="Billetera">
                          {data.billeteraItems.map(b => (
                            <option key={b.id} value={`billetera:${b.id}`}>
                              {b.nombre}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {(data.portfolioItems || []).length > 0 && (
                        <optgroup label="Portafolio">
                          {(data.portfolioItems || []).map(p => (
                            <option key={p.id} value={`portfolio:${p.id}`}>
                              {p.nombre}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Destino
                    </label>
                    <select
                      value={movementDestTransferId}
                      onChange={e => setMovementDestTransferId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                      required
                    >
                      {data.billeteraItems
                        .filter(b => `billetera:${b.id}` !== movementSourceId && b.id !== movementSourceId)
                        .length > 0 && (
                        <optgroup label="Billetera">
                          {data.billeteraItems
                            .filter(b => `billetera:${b.id}` !== movementSourceId && b.id !== movementSourceId)
                            .map(b => (
                              <option key={b.id} value={`billetera:${b.id}`}>
                                {b.nombre}
                              </option>
                            ))}
                        </optgroup>
                      )}
                      {(data.portfolioItems || [])
                        .filter(p => `portfolio:${p.id}` !== movementSourceId && p.id !== movementSourceId)
                        .length > 0 && (
                        <optgroup label="Portafolio">
                          {(data.portfolioItems || [])
                            .filter(p => `portfolio:${p.id}` !== movementSourceId && p.id !== movementSourceId)
                            .map(p => (
                              <option key={p.id} value={`portfolio:${p.id}`}>
                                {p.nombre}
                              </option>
                            ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  {(() => {
                    const isSrcPort = movementSourceId.startsWith('portfolio:');
                    const rSrcId = movementSourceId.replace('portfolio:', '').replace('billetera:', '');
                    const srcAcc = isSrcPort
                      ? (data.portfolioItems || []).find(p => p.id === rSrcId)
                      : (data.billeteraItems || []).find(b => b.id === rSrcId);
                    const srcCurr = srcAcc?.moneda || 'COP';

                    const isDstPort = movementDestTransferId.startsWith('portfolio:');
                    const rDstId = movementDestTransferId.replace('portfolio:', '').replace('billetera:', '');
                    const dstAcc = isDstPort
                      ? (data.portfolioItems || []).find(p => p.id === rDstId)
                      : (data.billeteraItems || []).find(b => b.id === rDstId);
                    const dstCurr = dstAcc?.moneda || 'COP';

                    const isDiff = srcCurr !== dstCurr;
                    const numAmt = parseFloat(movementAmount) || 0;
                    const rate = data.dolarRate || 3600;
                    const convertedAmt = srcCurr === 'USD' && dstCurr === 'COP'
                      ? numAmt * rate
                      : (rate > 0 ? numAmt / rate : 0);

                    if (!isDiff || numAmt <= 0) return null;

                    return (
                      <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 rounded-2xl text-xs space-y-1.5 animate-fadeIn">
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 font-medium">
                          <span>Tasa de cambio (TRM):</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-white">
                            1 USD = {formatCurrency(rate, 'COP')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
                          <span>Se descuenta ({srcCurr}):</span>
                          <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                            {formatCurrency(numAmt, srcCurr)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
                          <span>Se acredita ({dstCurr}):</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(convertedAmt, dstCurr)}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {movementType === 'income' ? 'Cuenta Destino' : 'Cuenta Origen'}
                  </label>
                  <select
                    value={movementSourceId}
                    onChange={e => setMovementSourceId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    required
                  >
                    {data.billeteraItems.map(b => (
                      <option key={b.id} value={`billetera:${b.id}`}>
                        {b.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Origen si es INGRESO */}
              {movementType === 'income' && deudasPorCobrar.length > 0 && (
                <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Origen del Ingreso
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIncomeOriginType('general');
                      }}
                      className={`py-2 px-3 rounded-2xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                        incomeOriginType === 'general'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Ingreso General
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIncomeOriginType('deuda');
                        if (!incomeOriginDeudaId && deudasPorCobrar[0]) {
                          setIncomeOriginDeudaId(deudasPorCobrar[0].id);
                        }
                      }}
                      className={`py-2 px-3 rounded-2xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                        incomeOriginType === 'deuda'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Deuda
                    </button>
                  </div>

                  {incomeOriginType === 'deuda' && (
                    <div className="animate-fadeIn mt-2">
                      <select
                        value={incomeOriginDeudaId}
                        onChange={e => setIncomeOriginDeudaId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                        required
                      >
                        {deudasPorCobrar.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.nombre} {d.monto !== undefined ? `(${formatCurrency(d.monto)})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Destino si es GASTO */}
              {movementType === 'expense' && (data.creditCards.length > 0 || deudasPorPagar.length > 0) && (
                <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Destino
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMovementDestType('none');
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
                        setMovementDestType('payment');
                        if (!movementDestId) {
                          const firstTarget = data.creditCards[0]
                            ? `card:${data.creditCards[0].id}`
                            : (deudasPorPagar[0] ? `deuda:${deudasPorPagar[0].id}` : '');
                          setMovementDestId(firstTarget);
                        }
                      }}
                      className={`py-2 px-3 rounded-2xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                        movementDestType === 'payment'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Pagos
                    </button>
                  </div>

                  {movementDestType === 'payment' && (
                    <div className="animate-fadeIn mt-2">
                      <select
                        value={movementDestId}
                        onChange={e => setMovementDestId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                        required
                      >
                        {data.creditCards.length > 0 && (
                          <optgroup label="Tarjetas de Crédito">
                            {data.creditCards.map(c => (
                              <option key={c.id} value={`card:${c.id}`}>
                                {c.name}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {deudasPorPagar.length > 0 && (
                          <optgroup label="Deudas">
                            {deudasPorPagar.map(d => (
                              <option key={d.id} value={`deuda:${d.id}`}>
                                {d.nombre}
                              </option>
                            ))}
                          </optgroup>
                        )}
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
            if (iconPickerTarget.type === 'movement_form') {
              setMovementIcon(newIcon);
            } else if (iconPickerTarget.type === 'billetera_form') {
              setBilleteraIcon(newIcon);
            } else if (iconPickerTarget.targetId) {
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
