import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  formatCurrency,
  calculateCardPurchasesTotal,
  calculateCardPaymentDue
} from '../../services/financeCalculations';
import { CreditCardItem, PaymentPeriod } from '../../models/finance';
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
    addCardPurchase,
    deleteCardPurchase
  } = useFinance();

  const [selectedCardId, setSelectedCardId] = useState<string>(data.creditCards[0]?.id || '');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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
    if (confirm(`¿Eliminar la tarjeta "${editingCardObj.name}"?`)) {
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
    const totalCurrent = calculateCardPurchasesTotal(card);
    if (confirm(`¿Hacer corte en "${card.name}" por ${formatCurrency(totalCurrent)}? Este será el pago fijado del mes. Las compras que agregues después seguirán restando cupo pero no alterarán este pago.`)) {
      performCardCutoff(card.id);
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
      {/* Header Principal de Tarjetas Alineado */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Tarjetas
        </h2>

        <button
          onClick={openCreateCard}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40 hover:bg-blue-200 transition-all flex items-center gap-1 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Agregar Tarjeta
        </button>
      </div>

      {/* SECCIÓN TARJETAS DE CRÉDITO: Diseño Horizontal Desplazable */}
      <div className="space-y-4">
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
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing p-0.5">
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>
                      <div className="w-9 h-9 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 flex items-center justify-center font-bold text-xs shadow-sm">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-800 dark:text-white text-sm">{cc.name}</h4>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          {cc.period === '1st_fortnight' ? '1ª Quincena' : '2ª Quincena'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {hasCutoff && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/50">
                          Corte
                        </span>
                      )}

                      {/* Botón de Editar Tarjeta en el Recuadro */}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          openEditCard(cc);
                        }}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300/80 dark:border-transparent transition-colors"
                        title="Editar tarjeta"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs pt-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-500 dark:text-slate-400">Pago del Mes:</span>
                      <div className="text-right">
                        <span className="font-bold text-blue-700 dark:text-blue-400 font-mono text-sm block">
                          {formatCurrency(pagoDelMes)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Cupo Total:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">
                        {formatCurrency(cc.creditLimit)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Disponible:</span>
                      <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                        {formatCurrency(cupoDisponible)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        (totalDeuda / (cc.creditLimit || 1)) > 0.8
                          ? 'bg-rose-500'
                          : (totalDeuda / (cc.creditLimit || 1)) > 0.5
                          ? 'bg-amber-500'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, (totalDeuda / (cc.creditLimit || 1)) * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                    <span>Usado: {Math.round((totalDeuda / (cc.creditLimit || 1)) * 100)}%</span>
                    <span>Deuda: {formatCurrency(totalDeuda)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* DETALLES DE LA TARJETA SELECCIONADA: Compras y Acciones de Corte */}
        {selectedCard && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-6 animate-scaleUp transition-colors">
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Compras en {selectedCard.name}
                  </h3>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedCard.period === '1st_fortnight' ? 'Pago en 1ª Quincena' : 'Pago en 2ª Quincena'} • Cupo: {formatCurrency(selectedCard.creditLimit)}
                </p>
              </div>

              {/* Botones de acción: Hacer Corte y Agregar Compra */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Hacer Corte / Deshacer Corte */}
                {selectedCard.billingCutoffAmount !== undefined ? (
                  <button
                    onClick={() => cancelCardCutoff(selectedCard.id)}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-white transition-all flex items-center gap-1.5 shadow-sm"
                    title="Deshacer corte y volver a cálculo en tiempo real"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Deshacer Corte
                  </button>
                ) : (
                  <button
                    onClick={() => handleDoCutoff(selectedCard)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300/80 dark:border-transparent transition-all flex items-center gap-1.5 shadow-sm"
                    title="Fijar corte de facturación actual"
                  >
                    <Scissors className="w-3.5 h-3.5" /> Hacer Corte
                  </button>
                )}

                {/* Agregar Compra */}
                <button
                  onClick={openAddPurchase}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar Compra
                </button>
              </div>
            </div>

            {/* Aviso de Corte Activo */}
            {selectedCard.billingCutoffAmount !== undefined && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-2xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    <strong>Corte de facturación fijado:</strong> El pago fijado para el presupuesto es{' '}
                    <strong>{formatCurrency(selectedCard.billingCutoffAmount)}</strong>.
                  </span>
                </div>
              </div>
            )}

            {/* Lista de Compras */}
            <div className="space-y-2">
              {(!selectedCard.purchases || selectedCard.purchases.length === 0) ? (
                <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                  No hay compras registradas en esta tarjeta. Haz clic en <strong>Agregar Compra</strong> para añadir una.
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  {selectedCard.purchases.map(p => {
                    return (
                      <div
                        key={p.id}
                        className="p-3 flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-semibold text-slate-800 dark:text-white">{p.concept}</span>
                          {p.isAfterCutoff && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              Post-Corte
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="font-mono font-bold text-slate-800 dark:text-white">
                              {formatCurrency(p.amount)}
                            </span>
                          </div>

                          <button
                            onClick={() => deleteCardPurchase(selectedCard.id, p.id)}
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
              )}
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
                  placeholder="Ej. Nu, Bancolombia Black, RappiCard"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Cupo Total */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Cupo Total
                </label>
                <input
                  type="number"
                  step="any"
                  value={cardLimit}
                  onChange={e => setCardLimit(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

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
                  placeholder="Ej. Tiquetes avión, Mercado, Almuerzo"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                  autoFocus
                />
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
    </div>
  );
};
