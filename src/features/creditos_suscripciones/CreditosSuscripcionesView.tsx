import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  formatCurrency,
  calculateCardPurchasesTotal,
  calculateCardPaymentDue
} from '../../services/financeCalculations';
import { CreditCardItem } from '../../models/finance';
import { getIconComponent, IconPickerModal } from '../../components/ui/IconPicker';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { AmountCalculatorInput } from '../../components/ui/AmountCalculatorInput';
import {
  CreditCard,
  Edit2,
  Plus,
  Trash2,
  X,
  Scissors,
  RotateCcw,
  Check,
  Calendar,
  GripVertical
} from 'lucide-react';

export const CreditosSuscripcionesView: React.FC = () => {
  const {
    data,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    performCardCutoff,
    cancelCardCutoff,
    addCardPurchase,
    updateCardPurchase,
    deleteCardPurchaseRecord,
    moveCardPurchase
  } = useFinance();

  // Selection & Edit mode
  const [selectedCardId, setSelectedCardId] = useState<string>(data.creditCards[0]?.id || '');
  const [isEditingCards, setIsEditingCards] = useState(false);
  const [isEditingPurchases, setIsEditingPurchases] = useState(false);
  const [draggedPurchaseIdx, setDraggedPurchaseIdx] = useState<number | null>(null);

  // Pagination for purchases (10 records at a time)
  const [visiblePurchasesCount, setVisiblePurchasesCount] = useState(10);

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

  // Modal: Add / Edit Credit Card
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCardObj, setEditingCardObj] = useState<CreditCardItem | null>(null);
  const [cardName, setCardName] = useState('');
  const [cardLimit, setCardLimit] = useState('');
  const [cardPaymentDay, setCardPaymentDay] = useState<string>('');

  // Modal: Add Purchase
  const [showAddPurchaseModal, setShowAddPurchaseModal] = useState(false);
  const [purchaseConcept, setPurchaseConcept] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');

  // Selected card reference
  const selectedCard = data.creditCards.find(c => c.id === selectedCardId) || data.creditCards[0];

  const getNextMonthPaymentDateStr = (day: number) => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const daysInNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
    const validDay = Math.min(day, daysInNextMonth);
    const targetDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), validDay);
    return targetDate.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Open Create Card Modal
  const openCreateCard = () => {
    setCardName('');
    setCardLimit('');
    setCardPaymentDay('');
    setEditingCardObj(null);
    setShowCardModal(true);
  };

  // Open Edit Card Modal
  const openEditCard = (card: CreditCardItem) => {
    setEditingCardObj(card);
    setCardName(card.name);
    setCardLimit(card.creditLimit.toString());
    setCardPaymentDay(card.paymentDay !== undefined ? card.paymentDay.toString() : '');
    setShowCardModal(true);
  };

  // Save Card (Create or Edit)
  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim()) return;
    const limit = parseFloat(cardLimit) || 0;
    const dayVal = cardPaymentDay ? parseInt(cardPaymentDay, 10) : undefined;

    if (editingCardObj) {
      updateCreditCard(editingCardObj.id, {
        name: cardName.trim(),
        creditLimit: limit,
        paymentDay: dayVal,
        moneda: 'COP'
      });
    } else {
      addCreditCard({
        name: cardName.trim(),
        creditLimit: limit,
        paymentDay: dayVal,
        moneda: 'COP'
      });
    }
    setShowCardModal(false);
    setEditingCardObj(null);
  };

  // Open Add Purchase Modal
  const openAddPurchase = () => {
    setPurchaseConcept('');
    setPurchaseAmount('');
    setShowAddPurchaseModal(true);
  };

  // Save Purchase (Add)
  const handleAddPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard || !purchaseConcept.trim()) return;
    const amount = parseFloat(purchaseAmount) || 0;
    if (amount <= 0) return;

    addCardPurchase(selectedCard.id, {
      concept: purchaseConcept.trim(),
      amount,
      moneda: selectedCard.moneda || 'COP',
      icon: 'shopping_bag'
    });

    setPurchaseConcept('');
    setPurchaseAmount('');
    setShowAddPurchaseModal(false);
  };

  // Do Cutoff
  const handleDoCutoff = (card: CreditCardItem) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Confirmar Corte de Facturación',
      message: '¿Deseas confirmar el corte?',
      confirmText: 'Confirmar Corte',
      cancelText: 'Cancelar',
      variant: 'warning',
      onConfirm: () => {
        performCardCutoff(card.id);
      }
    });
  };

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* SECCIÓN 1: TARJETAS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-4 bg-slate-100 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-600 text-white border-2 border-indigo-400 dark:border-indigo-400 flex items-center justify-center shadow-xs flex-shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-slate-800 dark:text-white text-base tracking-wide uppercase">
              TARJETAS
            </span>
          </div>

          <div className="flex items-center gap-2">
            {data.creditCards.length > 0 && (
              <button
                onClick={() => setIsEditingCards(!isEditingCards)}
                className={`p-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center shadow-sm ${
                  isEditingCards
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300/80 dark:border-transparent'
                }`}
                title={isEditingCards ? 'Listo' : 'Editar Tarjetas'}
              >
                {isEditingCards ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={openCreateCard}
              className="p-2 rounded-xl text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40 hover:bg-blue-200 transition-all flex items-center justify-center shadow-sm"
              title="Agregar Tarjeta"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carrusel / Lista Horizontal de Tarjetas */}
        <div className="p-4">
          {data.creditCards.length === 0 ? (
            <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-xs">
              No tienes tarjetas agregadas. Haz clic en <strong>+</strong> para registrar una.
            </div>
          ) : (
            <div className="flex items-stretch gap-4 overflow-x-auto pb-2 pt-1 scrollbar-thin snap-x">
              {data.creditCards.map((cc) => {
                const isSelected = (selectedCard?.id === cc.id);
                const totalDeuda = calculateCardPurchasesTotal(cc);
                const pagoDelMes = calculateCardPaymentDue(cc);
                const cupoDisponible = cc.creditLimit - totalDeuda;
                const hasCutoff = cc.billingCutoffAmount !== undefined;

                return (
                  <div
                    key={cc.id}
                    onClick={() => setSelectedCardId(cc.id)}
                    className={`flex-shrink-0 w-72 rounded-3xl p-4 cursor-pointer transition-all border snap-start flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50/90 dark:bg-slate-800/90 border-blue-500 dark:border-blue-400 shadow-md ring-2 ring-blue-500/25'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Cabecera Tarjeta: Nombre + Icono / Acciones */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <CreditCard className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                          <h3 className="font-bold text-base truncate text-slate-800 dark:text-white">
                            {cc.name}
                          </h3>
                          {hasCutoff && (
                            <span className="p-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 font-bold border border-amber-300/60 dark:border-amber-800/40 flex items-center justify-center flex-shrink-0" title={`Corte de facturación: ${formatCurrency(cc.billingCutoffAmount!)}`}>
                              <Scissors className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            </span>
                          )}
                        </div>

                        {/* Botones de acción cuando se editan tarjetas */}
                        {isEditingCards && (
                          <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => openEditCard(cc)}
                              className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                              title="Editar cupo y nombre"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setConfirmConfig({
                                  isOpen: true,
                                  title: 'Eliminar Tarjeta',
                                  message: `¿Estás seguro de eliminar la tarjeta "${cc.name}"?`,
                                  confirmText: 'Sí, eliminar',
                                  cancelText: 'Cancelar',
                                  variant: 'danger',
                                  onConfirm: () => {
                                    deleteCreditCard(cc.id);
                                    if (selectedCardId === cc.id) {
                                      const remaining = data.creditCards.filter(c => c.id !== cc.id);
                                      setSelectedCardId(remaining[0]?.id || '');
                                    }
                                  }
                                });
                              }}
                              className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 text-rose-600 dark:text-rose-400 transition-colors"
                              title="Eliminar tarjeta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Métricas Principales: Pago Mínimo y Deuda Total */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Pago Mínimo */}
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 block text-xs font-semibold">
                            Pago Mínimo
                          </span>
                          <span className="font-mono font-bold text-base block text-slate-900 dark:text-white truncate">
                            {formatCurrency(pagoDelMes)}
                          </span>
                        </div>

                        {/* Deuda Total */}
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 block text-xs font-semibold">
                            Deuda Total
                          </span>
                          <span className="font-mono font-bold text-base block text-slate-900 dark:text-white truncate">
                            {formatCurrency(totalDeuda)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer de Tarjeta: Cupo y Cupo Disp. */}
                    <div className={`pt-2.5 mt-2.5 border-t flex items-center justify-between text-xs ${isSelected ? 'border-blue-200 dark:border-slate-700 text-slate-500 dark:text-slate-400' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}>
                      <span className="text-slate-500 dark:text-slate-400">
                        Cupo: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{formatCurrency(cc.creditLimit)}</span>
                      </span>

                      <span className="text-slate-500 dark:text-slate-400">
                        Cupo Disp.: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(cupoDisponible)}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN 2: DETALLE Y COMPRAS DE LA TARJETA SELECCIONADA */}
      {selectedCard && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          {/* Encabezado del Detalle */}
          <div className="p-4 bg-slate-100 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white uppercase tracking-wide">
                {selectedCard.name.toUpperCase()}
              </h3>
              {selectedCard.paymentDay ? (
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                  Pago: {getNextMonthPaymentDateStr(selectedCard.paymentDay)}
                </span>
              ) : null}
            </div>

            {/* Botones de acción: Corte, Editar, Agregar (+) */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* 1. Corte */}
              {selectedCard.billingCutoffAmount !== undefined ? (
                <button
                  onClick={() => cancelCardCutoff(selectedCard.id)}
                  className="p-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-white transition-all flex items-center justify-center shadow-sm"
                  title="Deshacer corte"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => handleDoCutoff(selectedCard)}
                  className="p-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300/80 dark:border-transparent transition-all flex items-center justify-center shadow-sm"
                  title="Hacer corte de facturación"
                >
                  <Scissors className="w-4 h-4" />
                </button>
              )}

              {/* 2. Botón Editar Compras */}
              {(selectedCard.purchases || []).filter(p => !p.hidden).length > 0 && (
                <button
                  onClick={() => setIsEditingPurchases(!isEditingPurchases)}
                  className={`p-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center shadow-sm ${
                    isEditingPurchases
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300/80 dark:border-transparent'
                  }`}
                  title={isEditingPurchases ? 'Listo' : 'Editar Compras'}
                >
                  {isEditingPurchases ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                </button>
              )}

              {/* 3. Agregar Compra (+) */}
              <button
                onClick={openAddPurchase}
                className="p-2 rounded-xl text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40 hover:bg-blue-200 transition-all flex items-center justify-center shadow-sm"
                title="Agregar Compra"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lista de Compras con ícono de categoría interactivo */}
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {(() => {
              const visiblePurchases = (selectedCard.purchases || []).filter(p => !p.hidden);
              if (visiblePurchases.length === 0) {
                return (
                  <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                    No hay compras visibles registradas. Haz clic en <strong>+</strong> para añadir una.
                  </div>
                );
              }
              return visiblePurchases.slice(0, visiblePurchasesCount).map((p, pIdx) => {
                const PurchaseIcon = getIconComponent(p.icon || 'shopping_bag');
                const formattedDate = p.date ? (() => {
                  const d = new Date(p.date);
                  return isNaN(d.getTime())
                    ? p.date
                    : d.toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'short'
                      });
                })() : '';

                return (
                  <div
                    key={p.id}
                    draggable={isEditingPurchases}
                    onDragStart={(e) => {
                      setDraggedPurchaseIdx(pIdx);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedPurchaseIdx !== null && draggedPurchaseIdx !== pIdx) {
                        moveCardPurchase(selectedCard.id, draggedPurchaseIdx, pIdx);
                      }
                      setDraggedPurchaseIdx(null);
                    }}
                    onDragEnd={() => setDraggedPurchaseIdx(null)}
                    className={`p-4 transition-colors flex items-center justify-between gap-3 bg-white dark:bg-slate-900 ${
                      isEditingPurchases ? 'cursor-move select-none' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {isEditingPurchases && (
                        <div className="text-slate-400 dark:text-slate-500 cursor-grab active:cursor-grabbing p-1 flex-shrink-0 mt-0.5">
                          <GripVertical className="w-4 h-4" />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setIconPickerTarget({
                          targetId: p.id,
                          currentIcon: p.icon || 'shopping_bag',
                          title: 'Cambiar Categoría'
                        })}
                        title="Click para cambiar categoría"
                        className="w-10 h-10 rounded-2xl flex items-center justify-center bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 shadow-sm flex-shrink-0 mt-0.5 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                      >
                        <PurchaseIcon className="w-5 h-5" />
                      </button>

                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">{p.concept}</h4>

                        {/* Metadatos: Fecha y Hora */}
                        <div className="flex flex-col gap-0.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                          {formattedDate && (
                            <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500 font-medium">
                              <Calendar className="w-3 h-3 flex-shrink-0" /> {formattedDate}
                            </span>
                          )}
                          {p.isAfterCutoff && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                              <Scissors className="w-3 h-3 flex-shrink-0" /> Compra Post-Corte
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-slate-800 dark:text-white block">
                          {formatCurrency(p.amount)}
                        </span>
                      </div>

                      {isEditingPurchases && (
                        <button
                          onClick={() => {
                            setConfirmConfig({
                              isOpen: true,
                              title: 'Eliminar Registro',
                              message: '¿Estás seguro de eliminar este registro?',
                              confirmText: 'Sí, eliminar',
                              cancelText: 'Cancelar',
                              variant: 'danger',
                              onConfirm: () => deleteCardPurchaseRecord(selectedCard.id, p.id)
                            });
                          }}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-300/80 dark:border-transparent transition-colors"
                          title="Eliminar registro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* Botón Cargar Más Compras */}
          {(() => {
            const visiblePurchases = (selectedCard.purchases || []).filter(p => !p.hidden);
            if (visiblePurchases.length > visiblePurchasesCount) {
              return (
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 text-center">
                  <button
                    type="button"
                    onClick={() => setVisiblePurchasesCount(prev => prev + 10)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/50 transition-all shadow-sm inline-flex items-center gap-1.5"
                  >
                    Mostrar más
                  </button>
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}

      {/* Modal: Crear / Editar Tarjeta */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingCardObj ? 'Editar Tarjeta' : 'Nueva Tarjeta'}
              </h3>
              <button
                onClick={() => setShowCardModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCard} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nombre</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                  placeholder="Ej. Tarjeta 1, Tarjeta 2"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Cupo Total con Calculadora */}
              <AmountCalculatorInput
                label="Cupo Total"
                value={cardLimit}
                onChange={setCardLimit}
                placeholder="0"
                required
                title="Ajustar Cupo"
              />

              {/* Día de Pago */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Día de Pago (1 - 31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={cardPaymentDay}
                  onChange={e => setCardPaymentDay(e.target.value)}
                  placeholder="Ej. 15, 30"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCardModal(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs py-3 rounded-2xl transition-colors border border-slate-300/80 dark:border-transparent text-center"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-2xl shadow-sm transition-all text-center"
                >
                  {editingCardObj ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Agregar Compra */}
      {showAddPurchaseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {`Nueva Compra en ${selectedCard?.name || 'Tarjeta'}`}
              </h3>
              <button
                onClick={() => setShowAddPurchaseModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPurchase} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Concepto de la Compra
                </label>
                <input
                  type="text"
                  value={purchaseConcept}
                  onChange={e => setPurchaseConcept(e.target.value)}
                  placeholder="Ej. Compra 1, Servicio, Almuerzo"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                  autoFocus
                />
              </div>

              {/* Monto con Calculadora */}
              <AmountCalculatorInput
                label="Monto"
                value={purchaseAmount}
                onChange={setPurchaseAmount}
                placeholder="0"
                required
                title="Ajustar Monto"
              />

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddPurchaseModal(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs py-3 rounded-2xl transition-colors border border-slate-300/80 dark:border-transparent text-center"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-2xl shadow-sm transition-all text-center"
                >
                  Guardar Compra
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
            if (!iconPickerTarget || !selectedCard) return;
            if (iconPickerTarget.targetId) {
              const existingP = (selectedCard.purchases || []).find(p => p.id === iconPickerTarget.targetId);
              if (existingP) {
                updateCardPurchase(selectedCard.id, existingP.id, {
                  concept: existingP.concept,
                  amount: existingP.amount,
                  moneda: existingP.moneda,
                  icon: newIcon
                });
              }
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
