import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, calculateCreditCardDebt, calculateCreditCardPayment } from '../../services/financeCalculations';
import { CreditCardItem } from '../../models/finance';
import {
  CreditCard,
  Plus,
  Trash2,
  AlertCircle,
  TrendingDown,
  ShieldCheck,
  Zap,
  ShoppingBag
} from 'lucide-react';

export const CreditCardsView: React.FC = () => {
  const { data, addCardPurchase, deleteCardPurchase, updateCreditCard, addCreditCard } = useFinance();
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

  const totalCreditLimit = data.creditCards.reduce((s, c) => s + c.creditLimit, 0);
  const totalDebt = data.creditCards.reduce((s, c) => s + calculateCreditCardDebt(c), 0);
  const totalAvailableCredit = totalCreditLimit - totalDebt;

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-rose-400" /> Tarjetas de Crédito & Cupos
        </h2>
        <p className="text-xs text-slate-400">
          Control de cupo disponible, compras diferidas y pagos quincenales
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 block">Cupo Total Otorgado</span>
          <span className="text-xl font-bold text-white block mt-1">
            {formatCurrency(totalCreditLimit, 'COP')}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">{data.creditCards.length} tarjetas bancarias</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 block">Deuda Total Utilizada</span>
          <span className="text-xl font-bold text-rose-400 block mt-1">
            {formatCurrency(totalDebt, 'COP')}
          </span>
          <span className="text-[11px] text-rose-400/80 block mt-1">
            {totalCreditLimit > 0 ? ((totalDebt / totalCreditLimit) * 100).toFixed(1) : 0}% de uso de cupo
          </span>
        </div>

        <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 block">Cupo Libre / Disponible</span>
          <span className="text-xl font-bold text-emerald-400 block mt-1">
            {formatCurrency(totalAvailableCredit, 'COP')}
          </span>
          <span className="text-[11px] text-emerald-400/80 block mt-1">Capacidad crediticia libre</span>
        </div>
      </div>

      {/* Visual Card Selector / Carousel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.creditCards.map(cc => {
          const debt = calculateCreditCardDebt(cc);
          const available = cc.creditLimit - debt;
          const usagePercent = cc.creditLimit > 0 ? (debt / cc.creditLimit) * 100 : 0;
          const isSelected = selectedCard?.id === cc.id;

          return (
            <div
              key={cc.id}
              onClick={() => setSelectedCardId(cc.id)}
              className={`cursor-pointer rounded-3xl p-5 border transition-all duration-300 relative overflow-hidden bg-gradient-to-br ${getCardColor(cc.name)} ${
                isSelected
                  ? 'ring-2 ring-emerald-400 shadow-2xl scale-[1.02]'
                  : 'opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">{cc.name}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/40 text-slate-300 border border-white/10">
                  {cc.period === '1st_fortnight' ? 'Paga 1ª Quincena' : 'Paga 2ª Quincena'}
                </span>
              </div>

              <div className="my-4">
                <span className="text-[11px] text-slate-300 block">Deuda Actual</span>
                <div className="text-2xl font-extrabold text-white">
                  {formatCurrency(debt, 'COP')}
                </div>
              </div>

              {/* Progress bar for credit usage */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>Disponible: {formatCurrency(available, 'COP')}</span>
                  <span>{usagePercent.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      usagePercent > 70 ? 'bg-rose-500' : usagePercent > 40 ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-[11px] text-slate-300">
                <span>Cupo: {formatCurrency(cc.creditLimit, 'COP')}</span>
                <span>{cc.purchases?.length || 0} compras</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Card Purchases Breakdown */}
      {selectedCard && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-lg">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  Desglose de Compras: <span className="text-rose-400">{selectedCard.name}</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {selectedCard.purchases.length} compras activas sumando un pago de{' '}
                  <strong className="text-white">{formatCurrency(calculateCreditCardDebt(selectedCard), 'COP')}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddPurchaseModal(true)}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-3.5 py-2 rounded-2xl shadow-lg shadow-rose-500/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Registrar Compra
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {selectedCard.purchases.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Esta tarjeta no tiene compras registradas (Saldo 0).
              </div>
            ) : (
              selectedCard.purchases.map(p => (
                <div key={p.id} className="p-4 hover:bg-slate-850/50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">{p.concept}</h4>
                      <span className="text-[11px] text-slate-400">Gasto con tarjeta</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-white font-mono">
                      {formatCurrency(p.amount, 'COP')}
                    </span>
                    <button
                      onClick={() => deleteCardPurchase(selectedCard.id, p.id)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Eliminar compra"
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

      {/* Modal: Add Purchase */}
      {showAddPurchaseModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold text-white mb-4">
              Registrar Compra en {selectedCard?.name}
            </h3>

            <form onSubmit={handleAddPurchase} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Concepto o Comercio</label>
                <input
                  type="text"
                  value={concept}
                  onChange={e => setConcept(e.target.value)}
                  placeholder="Ej. Supermercado, Ropa, Restaurante"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Valor de la Compra (COP)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="Ej. 120000"
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
