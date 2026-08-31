import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, calculateCardPurchasesTotal, calculateSubscriptionMonthlyCost } from '../../services/financeCalculations';
import { CreditCard, Sparkles, Plus, Trash2, ShoppingBag, Users } from 'lucide-react';

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

  const getCardColor = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('nu')) return 'from-purple-900 via-indigo-900 to-slate-900 border-purple-500/30';
    if (n.includes('falabella')) return 'from-emerald-900 via-teal-900 to-slate-900 border-emerald-500/30';
    if (n.includes('addi')) return 'from-amber-900 via-rose-900 to-slate-900 border-amber-500/30';
    return 'from-blue-900 via-slate-900 to-slate-950 border-blue-500/30';
  };

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-rose-400" /> Créditos & Suscripciones
        </h2>
        <p className="text-xs text-slate-400">
          Tarjetas de crédito (Filas 15:18) y Suscripciones mensuales/anuales (Filas 8:15)
        </p>
      </div>

      {/* PARTE 1: Tarjetas de Crédito */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-rose-400" /> Tarjetas de Crédito (Nu, Falabella, Addi)
          </h3>
          <span className="text-xs text-slate-400">
            Total Pago Tarjetas (M5): <strong className="text-rose-400 font-mono">{formatCurrency(summary.tarjetas.totalPagoDavid, 'COP')}</strong>
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
                className={`cursor-pointer rounded-3xl p-5 border transition-all duration-300 relative overflow-hidden bg-gradient-to-br ${getCardColor(cc.name)} ${
                  isSelected ? 'ring-2 ring-emerald-400 shadow-2xl scale-[1.02]' : 'opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">{cc.name}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/40 text-slate-300 border border-white/10">
                    {cc.period === '1st_fortnight' ? '1ª Quincena' : '2ª Quincena'}
                  </span>
                </div>

                <div className="my-3">
                  <span className="text-[11px] text-slate-300 block">Deuda Total (G) / Pago Mínimo (H)</span>
                  <div className="text-xl font-black text-white font-mono">
                    {formatCurrency(pagoMinimo, 'COP')}
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Cupo Total:</span>
                    <span className="font-mono">{formatCurrency(cc.creditLimit, 'COP')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cupo Disponible (I):</span>
                    <span className="font-mono text-emerald-300">{formatCurrency(cupoDisponible, 'COP')}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/10 flex justify-between text-[11px] text-slate-300">
                  <span>{cc.purchases?.length || 0} compras</span>
                  <span className="font-semibold text-emerald-400">Ver compras &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Card Purchases Breakdown */}
        {selectedCard && (
          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-lg mt-3">
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-white text-sm">
                  Desglose de compras: <span className="text-rose-400">{selectedCard.name}</span>
                </h4>
                <span className="text-xs text-slate-400">
                  {selectedCard.purchases.length} compras sumando{' '}
                  <strong className="text-white font-mono">{formatCurrency(calculateCardPurchasesTotal(selectedCard), 'COP')}</strong>
                </span>
              </div>

              <button
                onClick={() => setShowAddPurchaseModal(true)}
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-2xl shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" /> Registrar Compra
              </button>
            </div>

            <div className="divide-y divide-slate-800/80">
              {selectedCard.purchases.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  Sin compras activas en esta tarjeta.
                </div>
              ) : (
                selectedCard.purchases.map(p => (
                  <div key={p.id} className="p-3.5 px-4 hover:bg-slate-850/50 transition-colors flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{p.concept}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-xs text-white">
                        {formatCurrency(p.amount, 'COP')}
                      </span>
                      <button
                        onClick={() => deleteCardPurchase(selectedCard.id, p.id)}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
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
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" /> Suscripciones (Filas 8:15 de B y C)
          </h3>
          <span className="text-xs text-slate-400">
            Total Mensual: <strong className="text-pink-400 font-mono">{formatCurrency(summary.suscripciones.totalMonthly, 'COP')}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {summary.suscripciones.items.map(sub => (
            <div
              key={sub.id}
              className={`p-4 rounded-3xl border transition-all ${
                sub.active ? 'bg-slate-900 border-slate-800 shadow-md' : 'bg-slate-950/40 border-slate-850 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{sub.name}</h4>
                  <span className="text-xs text-slate-400">
                    {sub.members > 1 ? `Plan Familiar (${sub.members} miembros ${sub.billing === 'yearly' ? '• Anual' : ''})` : 'Individual'}
                  </span>
                </div>

                <button
                  onClick={() => toggleSubscription(sub.id)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${sub.active ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${sub.active ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </button>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Factura: {formatCurrency(sub.totalPrice, 'COP')}</span>
                <span className="font-bold text-pink-400 font-mono">
                  {formatCurrency(sub.monthlyCost, 'COP')} / mes
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Compra */}
      {showAddPurchaseModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold text-white mb-4">Registrar Compra en {selectedCard?.name}</h3>
            <form onSubmit={handleAddPurchase} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Concepto</label>
                <input
                  type="text"
                  value={concept}
                  onChange={e => setConcept(e.target.value)}
                  placeholder="Ej. Supermercado, Farmacia, Combustible"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Valor (COP)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="Ej. 85000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddPurchaseModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs py-3 rounded-2xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-3 rounded-2xl shadow-lg shadow-rose-500/20 transition-all"
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
