import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, calculateCardPurchasesTotal, calculateSubscriptionMonthlyCost } from '../../services/financeCalculations';
import { CreditCard, Sparkles, Plus, Trash2 } from 'lucide-react';

export const CreditosSuscripcionesView: React.FC = () => {
  const { data, summary, addCardPurchase, deleteCardPurchase, toggleSubscription } = useFinance();
  const [selectedCardId, setSelectedCardId] = useState<string>(data.creditCards[0]?.id || '');
  const [showAddPurchaseModal, setShowAddPurchaseModal] = useState(false);
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');

  const selectedCard = data.creditCards.find(c => c.id === selectedCardId) || data.creditCards[0];

  const handleAddPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!concept || isNaN(val) || val <= 0) return;
    if (selectedCard) {
      addCardPurchase(selectedCard.id, { concept, amount: val });
    }
    setConcept('');
    setAmount('');
    setShowAddPurchaseModal(false);
  };

  const getCardTheme = (isSelected: boolean) => {
    return isSelected
      ? 'bg-gradient-to-br from-blue-900 to-slate-900 text-white border-blue-400/60 ring-2 ring-blue-400 shadow-md'
      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-800 shadow-sm hover:border-blue-300';
  };

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Créditos & Suscripciones
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Tarjetas de crédito bancarias y optimizador de servicios recurrentes
        </p>
      </div>

      {/* PARTE 1: Tarjetas de Crédito */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Tarjetas de Crédito
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Total Pago Mensual: <strong className="text-blue-600 dark:text-blue-400 font-mono">COP {formatCurrency(summary.tarjetas.totalPagoDavid, 'COP')}</strong>
          </span>
        </div>

        {/* Card Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.creditCards.map(cc => {
            const isAddi = cc.name.toLowerCase().includes('addi');
            const purchasesSum = calculateCardPurchasesTotal(cc);
            const deudaTotal = isAddi ? (purchasesSum || 124950) : purchasesSum;
            const pagoMinimo = isAddi ? (cc.minPaymentOverride || 41650) : deudaTotal;
            const cupoDisponible = cc.creditLimit - deudaTotal;
            const isSelected = selectedCard?.id === cc.id;

            return (
              <div
                key={cc.id}
                onClick={() => setSelectedCardId(cc.id)}
                className={`cursor-pointer rounded-3xl p-5 border transition-all duration-200 relative overflow-hidden ${getCardTheme(isSelected)}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">{cc.name}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    isSelected ? 'bg-black/30 border-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {cc.period === '1st_fortnight' ? '1ª Quincena' : '2ª Quincena'}
                  </span>
                </div>

                <div className="my-3">
                  <span className="text-[11px] opacity-80 block">Deuda / Pago del Mes</span>
                  <div className="text-xl font-black font-mono">
                    COP {formatCurrency(pagoMinimo, 'COP')}
                  </div>
                </div>

                <div className="space-y-1 text-xs opacity-90">
                  <div className="flex justify-between">
                    <span>Cupo Total:</span>
                    <span className="font-mono">COP {formatCurrency(cc.creditLimit, 'COP')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cupo Disponible:</span>
                    <span className="font-mono font-semibold text-blue-600 dark:text-blue-300">COP {formatCurrency(cupoDisponible, 'COP')}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-white/10 flex justify-between text-[11px] opacity-80">
                  <span>{cc.purchases?.length || 0} compras</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-300">Ver detalle &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Card Purchases Breakdown */}
        {selectedCard && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden mt-3 transition-colors">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                  Desglose de compras: <span className="text-blue-600 dark:text-blue-400">{selectedCard.name}</span>
                </h4>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedCard.purchases.length} compras sumando{' '}
                  <strong className="text-slate-800 dark:text-white font-mono">COP {formatCurrency(calculateCardPurchasesTotal(selectedCard), 'COP')}</strong>
                </span>
              </div>

              <button
                onClick={() => setShowAddPurchaseModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-2 rounded-2xl shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" /> Registrar Compra
              </button>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {selectedCard.purchases.length === 0 ? (
                <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-xs">
                  Sin compras activas en esta tarjeta.
                </div>
              ) : (
                selectedCard.purchases.map(p => (
                  <div key={p.id} className="p-3.5 px-4 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 dark:text-white">{p.concept}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-xs text-slate-800 dark:text-white">
                        COP {formatCurrency(p.amount, 'COP')}
                      </span>
                      <button
                        onClick={() => deleteCardPurchase(selectedCard.id, p.id)}
                        className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-500 transition-colors border border-slate-300/80 dark:border-transparent"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* PARTE 2: Suscripciones */}
      <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Suscripciones & Planes
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Total Mensual: <strong className="text-blue-600 dark:text-blue-400 font-mono">COP {formatCurrency(summary.suscripciones.totalMonthly, 'COP')}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {summary.suscripciones.items.map(sub => (
            <div
              key={sub.id}
              className={`p-4 rounded-3xl border transition-all ${
                sub.active
                  ? 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 shadow-sm'
                  : 'bg-slate-100/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-850 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">{sub.name}</h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {sub.members > 1 ? `Plan Compartido (${sub.members} miembros ${sub.billing === 'yearly' ? '• Anual' : ''})` : 'Individual'}
                  </span>
                </div>

                <button
                  onClick={() => toggleSubscription(sub.id)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${sub.active ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${sub.active ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </button>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-mono">Factura: COP {formatCurrency(sub.totalPrice, 'COP')}</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                  COP {formatCurrency(sub.monthlyCost, 'COP')} / mes
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Compra */}
      {showAddPurchaseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Registrar Compra en {selectedCard?.name}</h3>
            <form onSubmit={handleAddPurchase} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Concepto</label>
                <input
                  type="text"
                  value={concept}
                  onChange={e => setConcept(e.target.value)}
                  placeholder="Ej. Supermercado, Farmacia, Combustible"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Valor (COP)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="Ej. 85000"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddPurchaseModal(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs py-3 rounded-2xl transition-colors border border-slate-300/80 dark:border-transparent"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-2xl shadow-md transition-all"
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
