import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  formatCurrency,
  calculateCardPurchasesTotal,
  calculateCardPaymentDue,
  convertToBase
} from '../../services/financeCalculations';
import { CreditCardItem, PaymentPeriod } from '../../models/finance';
import {
  CreditCard,
  Plus,
  Minus,
  Edit2,
  Trash2,
  X,
  Calculator,
  GripVertical,
  Scissors,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';

export const CreditosSuscripcionesView: React.FC = () => {
  const {
    data,
    baseCurrency,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    moveCreditCard,
    performCardCutoff,
    payCardCutoff,
    cancelCardCutoff,
    addCardPurchase,
    deleteCardPurchase
  } = useFinance();

  const dolarRate = data.dolarRate || 3600;

  const [selectedCardId, setSelectedCardId] = useState<string>(data.creditCards[0]?.id || '');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Modal: Add / Edit Credit Card
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCardObj, setEditingCardObj] = useState<CreditCardItem | null>(null);
  const [cardName, setCardName] = useState('');
  const [cardLimit, setCardLimit] = useState('');
  const [cardCurrency, setCardCurrency] = useState<'COP' | 'USD'>('COP');
  const [cardPeriod, setCardPeriod] = useState<PaymentPeriod>('1st_fortnight');
  const [showLimitCalcPopup, setShowLimitCalcPopup] = useState(false);
  const [limitCalcDelta, setLimitCalcDelta] = useState('');

  // Modal: Add Purchase
  const [showAddPurchaseModal, setShowAddPurchaseModal] = useState(false);
  const [purchaseConcept, setPurchaseConcept] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [purchaseCurrency, setPurchaseCurrency] = useState<'COP' | 'USD'>('COP');

  const selectedCard = data.creditCards.find(c => c.id === selectedCardId) || data.creditCards[0];

  // Open Create Card Modal
  const openCreateCard = () => {
    setEditingCardObj(null);
    setCardName('');
    setCardLimit('');
    setCardCurrency(baseCurrency);
    setCardPeriod('1st_fortnight');
    setLimitCalcDelta('');
    setShowLimitCalcPopup(false);
    setShowCardModal(true);
  };

  // Open Edit Card Modal
  const openEditCard = (card: CreditCardItem) => {
    setEditingCardObj(card);
    setCardName(card.name);
    setCardLimit(card.creditLimit.toString());
    setCardCurrency(card.moneda || 'COP');
    setCardPeriod(card.period);
    setLimitCalcDelta('');
    setShowLimitCalcPopup(false);
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
        moneda: cardCurrency,
        period: cardPeriod
      });
    } else {
      addCreditCard({
        name: cardName.trim(),
        creditLimit: limit,
        moneda: cardCurrency,
        period: cardPeriod
      });
    }

    setShowCardModal(false);
    setEditingCardObj(null);
  };

  // Delete Card
  const handleDeleteCard = () => {
    if (!editingCardObj) return;
    if (confirm(`¿Eliminar la tarjeta "${editingCardObj.name}" y todas sus compras asociadas?`)) {
      deleteCreditCard(editingCardObj.id);
      if (selectedCardId === editingCardObj.id) {
        const remaining = data.creditCards.filter(c => c.id !== editingCardObj.id);
        setSelectedCardId(remaining[0]?.id || '');
      }
      setShowCardModal(false);
      setEditingCardObj(null);
    }
  };

  // Open Add Purchase Modal
  const openAddPurchase = () => {
    setPurchaseConcept('');
    setPurchaseAmount('');
    setPurchaseCurrency(selectedCard?.moneda || baseCurrency);
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
      moneda: purchaseCurrency
    });

    setPurchaseConcept('');
    setPurchaseAmount('');
    setShowAddPurchaseModal(false);
  };

  // Do Cutoff
  const handleDoCutoff = (card: CreditCardItem) => {
    const totalCurrent = calculateCardPurchasesTotal(card);
    const cardMoneda = card.moneda || 'COP';
    if (confirm(`¿Hacer corte en "${card.name}" por ${formatCurrency(totalCurrent, cardMoneda)}? Este será el pago fijado del mes. Las compras que agregues después seguirán restando cupo pero no alterarán este pago.`)) {
      performCardCutoff(card.id);
    }
  };

  // Pay Cutoff
  const handlePayCutoff = (card: CreditCardItem) => {
    const payAmount = card.billingCutoffAmount !== undefined ? card.billingCutoffAmount : calculateCardPurchasesTotal(card);
    const cardMoneda = card.moneda || 'COP';
    if (confirm(`¿Registrar pago del corte por ${formatCurrency(payAmount, cardMoneda)} en "${card.name}"? Las compras posteriores al corte se convertirán en el saldo del siguiente periodo.`)) {
      payCardCutoff(card.id);
    }
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

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Tarjetas
        </h2>
      </div>

      {/* SECCIÓN TARJETAS DE CRÉDITO */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Tus Tarjetas
          </span>

          {/* Botón directo de Agregar Tarjeta */}
          <button
            onClick={openCreateCard}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40 hover:bg-blue-200 transition-all flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar Tarjeta
          </button>
        </div>

        {/* Grid de Tarjetas con Drag and Drop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.creditCards.map((cc, idx) => {
            const isSelected = (selectedCard?.id === cc.id);
            const totalDeuda = calculateCardPurchasesTotal(cc);
            const pagoDelMes = calculateCardPaymentDue(cc);
            const cupoDisponible = cc.creditLimit - totalDeuda;
            const hasCutoff = cc.billingCutoffAmount !== undefined;
            const isDragging = draggedIndex === idx;
            const cardMoneda = cc.moneda || 'COP';
            const isDiff = cardMoneda !== baseCurrency;
            const pagoInBase = convertToBase(pagoDelMes, cardMoneda, baseCurrency, dolarRate);

            return (
              <div
                key={cc.id}
                draggable
                onDragStart={e => handleDragStart(e, idx)}
                onDragOver={e => handleDragOver(e, idx)}
                onDrop={e => handleDrop(e, idx)}
                onDragEnd={() => setDraggedIndex(null)}
                onClick={() => setSelectedCardId(cc.id)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                  isDragging ? 'opacity-40 scale-[0.98]' : ''
                } ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-white/80 dark:bg-slate-900/80 border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 shadow-sm'
                }`}
              >
                {/* Grip Handle */}
                <div
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 cursor-grab active:cursor-grabbing"
                  onClick={e => e.stopPropagation()}
                >
                  <GripVertical className="w-4 h-4" />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center font-bold text-sm">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{cc.name}</h4>
                      {isDiff && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300">
                          {cardMoneda}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {cc.period === '1st_fortnight' ? '1ª Quincena' : '2ª Quincena'}
                    </span>
                  </div>
                </div>

                <div className="my-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">
                      Pago del Mes
                    </span>
                    {hasCutoff && (
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                        Corte Realizado
                      </span>
                    )}
                  </div>
                  <div className="text-xl font-black font-mono text-blue-700 dark:text-blue-400">
                    {formatCurrency(pagoDelMes, cardMoneda)}
                  </div>
                  {isDiff && (
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block">
                      (≈ {formatCurrency(pagoInBase, baseCurrency)})
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Cupo Total:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {formatCurrency(cc.creditLimit, cardMoneda)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Cupo Disponible:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(cupoDisponible, cardMoneda)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{cc.purchases?.length || 0} compras</span>
                  {isSelected && (
                    <span className="text-blue-600 dark:text-blue-400 font-bold">Seleccionada ✓</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detalles de la Tarjeta Seleccionada */}
      {selectedCard && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm p-6 space-y-4 transition-colors">
          {/* Header con solo el nombre de la tarjeta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-800 dark:text-white text-lg">
                  {selectedCard.name}
                </h3>
                {(selectedCard.moneda || 'COP') !== baseCurrency && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300">
                    {selectedCard.moneda || 'COP'}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Pago en {selectedCard.period === '1st_fortnight' ? '1ª Quincena' : '2ª Quincena'}
                {selectedCard.billingCutoffAmount !== undefined && (
                  <strong className="text-amber-600 dark:text-amber-400 ml-1.5 font-mono">
                    • Corte: {formatCurrency(selectedCard.billingCutoffAmount, selectedCard.moneda || 'COP')}
                  </strong>
                )}
              </span>
            </div>

            {/* Acciones ordenadas: [Corte / Pagar / Deshacer], [Registrar Compra], [Editar Tarjeta] */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Botón de Corte / Pagar / Deshacer Corte */}
              {selectedCard.billingCutoffAmount !== undefined ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePayCutoff(selectedCard)}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Pagar Tarjeta
                  </button>

                  <button
                    onClick={() => cancelCardCutoff(selectedCard.id)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300/80 dark:border-transparent transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Deshacer Corte
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleDoCutoff(selectedCard)}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-white transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Scissors className="w-3.5 h-3.5" /> Corte
                </button>
              )}

              {/* Botón Registrar Compra */}
              <button
                onClick={openAddPurchase}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Registrar Compra
              </button>

              {/* Botón Editar Tarjeta */}
              <button
                onClick={() => openEditCard(selectedCard)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300/80 dark:border-transparent transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Edit2 className="w-3.5 h-3.5" /> Editar Tarjeta
              </button>
            </div>
          </div>

          {/* Tabla de Compras */}
          {selectedCard.purchases && selectedCard.purchases.length > 0 ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {selectedCard.purchases.map(p => {
                const pMoneda = p.moneda || selectedCard.moneda || 'COP';
                const isPDiff = pMoneda !== baseCurrency;
                const pInBase = convertToBase(p.amount, pMoneda, baseCurrency, dolarRate);

                return (
                  <div key={p.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        {p.concept}
                      </span>
                      {isPDiff && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300">
                          {pMoneda}
                        </span>
                      )}
                      {p.isAfterCutoff && (
                        <span className="text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/40">
                          Post-Corte
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-mono font-bold text-xs text-slate-800 dark:text-white block">
                          {formatCurrency(p.amount, pMoneda)}
                        </span>
                        {isPDiff && (
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block">
                            (≈ {formatCurrency(pInBase, baseCurrency)})
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => deleteCardPurchase(selectedCard.id, p.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="Eliminar compra"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs">
              No hay compras registradas en esta tarjeta.
            </div>
          )}
        </div>
      )}

      {/* Modal: Crear / Editar Tarjeta de Crédito */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingCardObj ? 'Editar Tarjeta de Crédito' : 'Nueva Tarjeta de Crédito'}
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
                  placeholder="Ej. Tarjeta Bancolombia, Nu, RappiCard"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Selector de Moneda */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Moneda</label>
                <select
                  value={cardCurrency}
                  onChange={e => setCardCurrency(e.target.value as 'COP' | 'USD')}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="COP">Pesos (COP)</option>
                  <option value="USD">Dólares (USD)</option>
                </select>
              </div>

              {/* Cupo Total con Calculadora */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Cupo Total
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={cardLimit}
                    onChange={e => setCardLimit(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl pl-3.5 pr-11 py-2.5 text-sm text-slate-800 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowLimitCalcPopup(!showLimitCalcPopup)}
                    title="Calculadora (+ / -)"
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-all ${
                      showLimitCalcPopup
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Calculator className="w-4 h-4" />
                  </button>

                  {/* Pop-up Calculadora Cupo */}
                  {showLimitCalcPopup && (
                    <div className="absolute right-0 top-full mt-2 z-30 p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-xl space-y-2.5 w-64 animate-scaleUp">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Ajustar Cupo
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowLimitCalcPopup(false)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="number"
                        step="any"
                        value={limitCalcDelta}
                        onChange={e => setLimitCalcDelta(e.target.value)}
                        placeholder="Valor a sumar o restar..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs px-2.5 py-1.5 rounded-xl text-slate-800 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                        autoFocus
                      />

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const delta = parseFloat(limitCalcDelta);
                            if (!isNaN(delta) && delta > 0) {
                              const curr = parseFloat(cardLimit) || 0;
                              setCardLimit((curr + delta).toString());
                            }
                            setLimitCalcDelta('');
                            setShowLimitCalcPopup(false);
                          }}
                          className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> Sumar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const delta = parseFloat(limitCalcDelta);
                            if (!isNaN(delta) && delta > 0) {
                              const curr = parseFloat(cardLimit) || 0;
                              setCardLimit(Math.max(0, curr - delta).toString());
                            }
                            setLimitCalcDelta('');
                            setShowLimitCalcPopup(false);
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

              {/* Quincena de Pago */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Quincena de Pago
                </label>
                <select
                  value={cardPeriod}
                  onChange={e => setCardPeriod(e.target.value as PaymentPeriod)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="1st_fortnight">1ª Quincena (Mitad de mes)</option>
                  <option value="2nd_fortnight">2ª Quincena (Fin de mes)</option>
                </select>
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

      {/* Modal: Registrar Compra */}
      {showAddPurchaseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Registrar Compra ({selectedCard?.name})
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
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Concepto</label>
                <input
                  type="text"
                  value={purchaseConcept}
                  onChange={e => setPurchaseConcept(e.target.value)}
                  placeholder="Ej. Supermercado, Gasolina, Restaurante"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                  autoFocus
                />
              </div>

              {/* Selector de Moneda para Compra */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Moneda</label>
                <select
                  value={purchaseCurrency}
                  onChange={e => setPurchaseCurrency(e.target.value as 'COP' | 'USD')}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="COP">Pesos (COP)</option>
                  <option value="USD">Dólares (USD)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Monto
                </label>
                <input
                  type="number"
                  step="any"
                  value={purchaseAmount}
                  onChange={e => setPurchaseAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddPurchaseModal(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs py-3 rounded-2xl transition-colors text-center"
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
    </div>
  );
};
