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
  GripVertical,
  Scissors,
  RotateCcw
} from 'lucide-react';

export const CreditosSuscripcionesView: React.FC = () => {
  const {
    data,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    moveCreditCard,
    performCardCutoff,
    cancelCardCutoff,
    clearCardPurchases,
    clearCardPurchasesVisual,
    addCardPurchase,
    deleteCardPurchase,
    moveCardPurchase
  } = useFinance();

  const [selectedCardId, setSelectedCardId] = useState<string>(data.creditCards[0]?.id || '');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedPurchaseIdx, setDraggedPurchaseIdx] = useState<number | null>(null);

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

  // Modal: Add Purchase
  const [showAddPurchaseModal, setShowAddPurchaseModal] = useState(false);
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
    setPurchaseConcept('');
    setPurchaseAmount('');
    setShowAddPurchaseModal(true);
  };

  // Save Purchase
  const handleAddPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard || !purchaseConcept.trim()) return;
    const amount = parseFloat(purchaseAmount) || 0;
    if (amount <= 0) return;

    addCardPurchase(selectedCard.id, {
      concept: purchaseConcept.trim(),
      amount,
      moneda: 'COP'
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

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const diff = index - draggedIndex;
    if (diff > 0) {
      for (let i = draggedIndex; i < index; i++) moveCreditCard(i, 'down');
    } else {
      for (let i = draggedIndex; i > index; i--) moveCreditCard(i, 'up');
    }
    setDraggedIndex(null);
  };

  // Drag and drop for Card Purchases
  const handlePurchaseDragStart = (e: React.DragEvent, index: number) => {
    setDraggedPurchaseIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handlePurchaseDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handlePurchaseDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedPurchaseIdx === null || draggedPurchaseIdx === targetIndex || !selectedCard) {
      setDraggedPurchaseIdx(null);
      return;
    }
    moveCardPurchase(selectedCard.id, draggedPurchaseIdx, targetIndex);
    setDraggedPurchaseIdx(null);
  };

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header Principal de Tarjetas Alineado */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Tarjetas
        </h2>

        <button
          onClick={openCreateCard}
          className="p-2 rounded-xl text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40 hover:bg-blue-200 transition-all flex items-center justify-center shadow-sm"
          title="Agregar Tarjeta"
        >
          <Plus className="w-4 h-4" />
        </button>
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
              const isDragging = draggedIndex === idx;

              return (
                <div
                  key={cc.id}
                  draggable
                  onDragStart={e => handleDragStart(e, idx)}
                  onDragOver={e => handleDragOver(e, idx)}
                  onDrop={e => handleDrop(e, idx)}
                  onDragEnd={() => setDraggedIndex(null)}
                  onClick={() => setSelectedCardId(cc.id)}
                  className={`w-[290px] sm:w-[320px] flex-shrink-0 snap-start p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isDragging ? 'opacity-40 scale-[0.98]' : ''
                  } ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-white/80 dark:bg-slate-900/80 border-slate-300 dark:border-slate-800 shadow-sm'
                  }`}
                >
                  <div>
                    {/* Header de la Tarjeta */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800/50 flex-shrink-0">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm truncate">
                          {cc.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1">
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
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 p-5 shadow-sm space-y-4 animate-fadeIn">
            {/* Encabezado del Detalle */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Compras con {selectedCard.name}
                  </h3>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedCard.period === '1st_fortnight' ? 'Pago en 1ª Quincena' : 'Pago en 2ª Quincena'}
                </p>
              </div>

              {/* Botones de acción: 1. +  2. Corte  3. Limpiar Historial (Barrer) */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* 1. Agregar Compra (+) */}
                <button
                  onClick={openAddPurchase}
                  className="p-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center justify-center shadow-sm"
                  title="Agregar Compra"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {/* 2. Corte */}
                {selectedCard.billingCutoffAmount !== undefined ? (
                  <button
                    onClick={() => cancelCardCutoff(selectedCard.id)}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-white transition-all flex items-center gap-1.5 shadow-sm"
                    title="Deshacer corte y volver a cálculo en tiempo real"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Corte
                  </button>
                ) : (
                  <button
                    onClick={() => handleDoCutoff(selectedCard)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300/80 dark:border-transparent transition-all flex items-center gap-1.5 shadow-sm"
                    title="Hacer corte de facturación actual"
                  >
                    <Scissors className="w-3.5 h-3.5" /> Corte
                  </button>
                )}

                {/* 3. Limpiar Historial (Icono de barrer) */}
                <button
                  onClick={() => {
                    setConfirmConfig({
                      isOpen: true,
                      title: 'Limpiar Historial de Compras',
                      message: `¿Deseas limpiar visualmente el historial de compras de "${selectedCard.name}"? Los cálculos de deuda acumulada y cupo disponible se mantendrán intactos.`,
                      confirmText: 'Sí, limpiar',
                      cancelText: 'Cancelar',
                      variant: 'warning',
                      onConfirm: () => clearCardPurchasesVisual(selectedCard.id)
                    });
                  }}
                  className="p-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300/80 dark:border-transparent transition-all flex items-center justify-center shadow-sm"
                  title="Limpiar historial visual"
                >
                  <svg className="w-4 h-4 text-slate-600 dark:text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m16 2 4 4-8.5 8.5" />
                    <path d="M14.5 9.5 8 16" />
                    <path d="M2 22s2.5-3 5-3 4.5 3 7 3c1 0 1.5-.5 2-1.5L18 16l-6-6-4.5 2C6.5 12.5 6 13 6 14c0 2.5 3 4.5 3 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Aviso de Corte Activo */}
            {selectedCard.billingCutoffAmount !== undefined && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-2xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    Corte de facturación con valor de: <strong>{formatCurrency(selectedCard.billingCutoffAmount)}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Lista de Compras */}
            <div className="space-y-2">
              {(() => {
                const visiblePurchases = (selectedCard.purchases || []).filter(p => !p.hidden);
                if (visiblePurchases.length === 0) {
                  return (
                    <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                      No hay compras visibles registradas. Haz clic en <strong>+</strong> para añadir una.
                    </div>
                  );
                }
                return (
                  <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    {visiblePurchases.map((p, pIdx) => {
                      const isDragging = draggedPurchaseIdx === pIdx;
                      return (
                        <div
                          key={p.id}
                          draggable
                          onDragStart={e => handlePurchaseDragStart(e, pIdx)}
                          onDragOver={e => handlePurchaseDragOver(e, pIdx)}
                          onDrop={e => handlePurchaseDrop(e, pIdx)}
                          onDragEnd={() => setDraggedPurchaseIdx(null)}
                          className={`p-3 flex items-center justify-between text-xs transition-colors cursor-grab active:cursor-grabbing ${
                            isDragging ? 'opacity-40 scale-[0.99] bg-blue-50/50 dark:bg-blue-950/30' : 'bg-white dark:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 cursor-grab active:cursor-grabbing flex-shrink-0">
                              <GripVertical className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-semibold text-slate-800 dark:text-white truncate">
                              {p.concept}
                            </span>
                            {p.isAfterCutoff && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex-shrink-0">
                                Post-Corte
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2.5 flex-shrink-0">
                            <div className="text-right">
                              <span className="font-mono font-bold text-slate-800 dark:text-white">
                                {formatCurrency(p.amount)}
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                setConfirmConfig({
                                  isOpen: true,
                                  title: 'Eliminar Compra',
                                  message: `¿Estás seguro de eliminar la compra "${p.concept}"?`,
                                  confirmText: 'Sí, eliminar',
                                  cancelText: 'Cancelar',
                                  variant: 'danger',
                                  onConfirm: () => deleteCardPurchase(selectedCard.id, p.id)
                                });
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                              title="Eliminar compra"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
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
                Nueva Compra en {selectedCard?.name}
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
