import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  formatCurrency,
  calculateCardPurchasesTotal,
  calculateCardPaymentDue
} from '../../services/financeCalculations';
import { CreditCardItem, PaymentPeriod } from '../../models/finance';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { AmountCalculatorInput } from '../../components/ui/AmountCalculatorInput';
import {
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  X,
  Scissors,
  RotateCcw,
  Calendar,
  Check,
  GripVertical
} from 'lucide-react';

export const CreditosSuscripcionesView: React.FC = () => {
  const {
    data,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    reorderCreditCards,
    performCardCutoff,
    cancelCardCutoff,
    clearCardPurchases,
    clearCardPurchasesVisual,
    addCardPurchase,
    updateCardPurchase,
    cancelCardPurchase,
    deleteCardPurchaseRecord,
    deleteCardPurchase,
    moveCardPurchase
  } = useFinance();

  const [selectedCardId, setSelectedCardId] = useState<string>(data.creditCards[0]?.id || '');
  const [isEditingCards, setIsEditingCards] = useState(false);
  const [isEditingPurchases, setIsEditingPurchases] = useState(false);
  const [draggedCardIdx, setDraggedCardIdx] = useState<number | null>(null);
  const [draggedPurchaseIdx, setDraggedPurchaseIdx] = useState<number | null>(null);
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

  // Modal: Add / Edit Credit Card
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCardObj, setEditingCardObj] = useState<CreditCardItem | null>(null);
  const [cardName, setCardName] = useState('');
  const [cardLimit, setCardLimit] = useState('');
  const [cardPeriod, setCardPeriod] = useState<PaymentPeriod>('1st_fortnight');

  // Modal: Add / Edit Purchase
  const [showAddPurchaseModal, setShowAddPurchaseModal] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<{ id: string; concept: string; amount: number; moneda?: 'COP' | 'USD' } | null>(null);
  const [purchaseConcept, setPurchaseConcept] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');

  // Selected card reference
  const selectedCard = data.creditCards.find(c => c.id === selectedCardId) || data.creditCards[0];

  // Open Create Card Modal
  const openCreateCard = () => {
    setCardName('');
    setCardLimit('');
    setCardPeriod('1st_fortnight');
    setEditingCardObj(null);
    setShowCardModal(true);
  };

  // Open Edit Card Modal
  const openEditCard = (card: CreditCardItem) => {
    setEditingCardObj(card);
    setCardName(card.name);
    setCardLimit(card.creditLimit.toString());
    setCardPeriod(card.period);
    setShowCardModal(true);
  };

  // Save Card (Create or Edit)
  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim()) return;
    const limit = parseFloat(cardLimit) || 0;

    if (editingCardObj) {
      updateCreditCard(editingCardObj.id, {
        name: cardName.trim(),
        creditLimit: limit,
        period: cardPeriod,
        moneda: 'COP'
      });
    } else {
      addCreditCard({
        name: cardName.trim(),
        creditLimit: limit,
        period: cardPeriod,
        moneda: 'COP'
      });
    }
    setShowCardModal(false);
    setEditingCardObj(null);
  };

  // Delete Card
  const handleDeleteCard = () => {
    if (!editingCardObj) return;
    setConfirmConfig({
      isOpen: true,
      title: 'Eliminar Tarjeta',
      message: `¿Estás seguro de eliminar la tarjeta "${editingCardObj.name}"?`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
      onConfirm: () => {
        deleteCreditCard(editingCardObj.id);
        if (selectedCardId === editingCardObj.id) {
          const remaining = data.creditCards.filter(c => c.id !== editingCardObj.id);
          setSelectedCardId(remaining[0]?.id || '');
        }
        setShowCardModal(false);
        setEditingCardObj(null);
      }
    });
  };

  // Open Add Purchase Modal
  const openAddPurchase = () => {
    setEditingPurchase(null);
    setPurchaseConcept('');
    setPurchaseAmount('');
    setShowAddPurchaseModal(true);
  };

  // Save Purchase (Add or Edit)
  const handleAddPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard || !purchaseConcept.trim()) return;
    const amount = parseFloat(purchaseAmount) || 0;
    if (amount <= 0) return;

    if (editingPurchase) {
      updateCardPurchase(selectedCard.id, editingPurchase.id, {
        concept: purchaseConcept.trim(),
        amount,
        moneda: editingPurchase.moneda || selectedCard.moneda || 'COP'
      });
    } else {
      addCardPurchase(selectedCard.id, {
        concept: purchaseConcept.trim(),
        amount,
        moneda: selectedCard.moneda || 'COP'
      });
    }

    setEditingPurchase(null);
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
      {/* Header Principal de Tarjetas Alineado */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-wide">
          <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" /> TARJETAS
        </h2>

        <div className="flex items-center gap-2">
          {data.creditCards.length > 0 && (
            <button
              onClick={() => setIsEditingCards(!isEditingCards)}
              className={`p-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center shadow-sm ${
                isEditingCards
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300/80 dark:border-transparent'
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

      {/* SECCIÓN TARJETAS DE CRÉDITO: Diseño Horizontal Desplazable */}
      <div className="space-y-4">
        {data.creditCards.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
            No tienes tarjetas agregadas. Haz clic en <strong>+</strong> para registrar una.
          </div>
        ) : (
          <div className="flex items-stretch gap-4 overflow-x-auto pb-3 pt-1 scrollbar-thin snap-x">
            {data.creditCards.map((cc, idx) => {
              const isSelected = (selectedCard?.id === cc.id);
              const totalDeuda = calculateCardPurchasesTotal(cc);
              const pagoDelMes = calculateCardPaymentDue(cc);
              const cupoDisponible = cc.creditLimit - totalDeuda;
              const hasCutoff = cc.billingCutoffAmount !== undefined;

              return (
                <div
                  key={cc.id}
                  draggable={isEditingCards}
                  onDragStart={(e) => {
                    setDraggedCardIdx(idx);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedCardIdx !== null && draggedCardIdx !== idx) {
                      reorderCreditCards(draggedCardIdx, idx);
                    }
                    setDraggedCardIdx(null);
                  }}
                  onDragEnd={() => setDraggedCardIdx(null)}
                  onClick={() => {
                    if (selectedCardId !== cc.id) {
                      setSelectedCardId(cc.id);
                      setVisiblePurchasesCount(10);
                    }
                  }}
                  className={`w-[290px] sm:w-[320px] flex-shrink-0 snap-start p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-white/80 dark:bg-slate-900/80 border-slate-300 dark:border-slate-800 shadow-sm'
                  } ${isEditingCards ? 'cursor-move select-none' : ''}`}
                >
                  <div>
                    {/* Header de la Tarjeta */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        {isEditingCards && (
                          <div className="text-slate-400 dark:text-slate-500 cursor-grab active:cursor-grabbing p-1 flex-shrink-0">
                            <GripVertical className="w-4 h-4" />
                          </div>
                        )}
                        <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800/50 flex-shrink-0">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm truncate">
                          {cc.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1">
                        {isEditingCards ? (
                          <button
                            onClick={e => {
                              e.stopPropagation();
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
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-300/80 dark:border-transparent transition-colors"
                            title="Eliminar tarjeta"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              openEditCard(cc);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                            title="Editar tarjeta"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Métricas Principales */}
                    <div className="space-y-2 text-xs">
                      {/* Pago del Mes */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Pago del Mes</span>
                        <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                          {formatCurrency(pagoDelMes)}
                        </span>
                      </div>

                      {/* Deuda Total y Cupo */}
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2.5 bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 rounded-xl">
                          <span className="text-slate-400 block text-[10px]">Deuda Total</span>
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-200 block">
                            {formatCurrency(totalDeuda)}
                          </span>
                        </div>

                        <div className="p-2.5 bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 rounded-xl">
                          <span className="text-slate-400 block text-[10px]">Cupo Disp.</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                            {formatCurrency(cupoDisponible)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer de Tarjeta con Badge de Corte */}
                  <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-medium">
                      Cupo: {formatCurrency(cc.creditLimit)}
                    </span>
                    {hasCutoff && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 font-semibold border border-amber-300/60 dark:border-amber-800/40 flex items-center gap-1">
                        <Scissors className="w-2.5 h-2.5" /> Corte Activo
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* DETALLE Y COMPRAS DE LA TARJETA SELECCIONADA */}
        {selectedCard && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            {/* Encabezado del Detalle */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-wide">
                    <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    COMPRAS CON {selectedCard.name.toUpperCase()}
                  </h3>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedCard.period === '1st_fortnight' ? 'Pago en 1ª Quincena' : 'Pago en 2ª Quincena'}
                </p>
              </div>

              {/* Botones de acción: Corte, Limpiar, Editar, Agregar (+) */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* 1. Corte (Solo icono) */}
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
                    className="p-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300/80 dark:border-transparent transition-all flex items-center justify-center shadow-sm"
                    title="Hacer corte de facturación"
                  >
                    <Scissors className="w-4 h-4" />
                  </button>
                )}

                {/* 2. Limpiar registro */}
                {(selectedCard.purchases || []).filter(p => !p.hidden).length > 0 && (
                  <button
                    onClick={() => {
                      setConfirmConfig({
                        isOpen: true,
                        title: 'Limpiar Compras de Tarjeta',
                        message: '¿Estás seguro de limpiar los registros de compras pasadas?',
                        confirmText: 'Sí, limpiar',
                        cancelText: 'Cancelar',
                        variant: 'warning',
                        onConfirm: () => clearCardPurchasesVisual(selectedCard.id)
                      });
                    }}
                    className="p-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300/80 dark:border-transparent transition-all flex items-center justify-center shadow-sm"
                    title="Limpiar Registro de Compras"
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

                {/* 3. Botón Editar Compras */}
                {(selectedCard.purchases || []).filter(p => !p.hidden).length > 0 && (
                  <button
                    onClick={() => setIsEditingPurchases(!isEditingPurchases)}
                    className={`p-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center shadow-sm ${
                      isEditingPurchases
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300/80 dark:border-transparent'
                    }`}
                    title={isEditingPurchases ? 'Listo' : 'Editar Compras'}
                  >
                    {isEditingPurchases ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                  </button>
                )}

                {/* 4. Agregar Compra (+) */}
                <button
                  onClick={openAddPurchase}
                  className="p-2 rounded-xl text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40 hover:bg-blue-200 transition-all flex items-center justify-center shadow-sm"
                  title="Agregar Compra"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Aviso de Corte Activo */}
            {selectedCard.billingCutoffAmount !== undefined && (
              <div className="mx-5 my-4 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-2xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    Corte de facturación con valor de: <strong>{formatCurrency(selectedCard.billingCutoffAmount)}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Lista de Compras con diseño grande idéntico a Billetera */}
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
                  const formattedDate = p.date ? (() => {
                    const d = new Date(p.date);
                    return isNaN(d.getTime())
                      ? p.date
                      : d.toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
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
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">{p.concept}</h4>

                          {/* Metadatos en Columna Vertical: Fecha y Hora */}
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

                        {isEditingPurchases ? (
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
                        ) : (
                          <button
                            onClick={() => {
                              setEditingPurchase(p);
                              setPurchaseConcept(p.concept);
                              setPurchaseAmount(p.amount.toString());
                              setShowAddPurchaseModal(true);
                            }}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300/80 dark:border-transparent transition-colors"
                            title="Editar compra"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
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
      </div>

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

              {/* Quincena de Pago */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Periodo de Pago
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCardPeriod('1st_fortnight')}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all ${
                      cardPeriod === '1st_fortnight'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    1ª Quincena
                  </button>

                  <button
                    type="button"
                    onClick={() => setCardPeriod('2nd_fortnight')}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all ${
                      cardPeriod === '2nd_fortnight'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    2ª Quincena
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                {editingCardObj && (
                  <button
                    type="button"
                    onClick={handleDeleteCard}
                    className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 transition-colors flex items-center justify-center"
                    title="Eliminar esta tarjeta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

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
                {editingPurchase ? 'Editar Compra' : `Nueva Compra en ${selectedCard?.name || 'Tarjeta'}`}
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
                  {editingPurchase ? 'Actualizar Compra' : 'Guardar Compra'}
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
