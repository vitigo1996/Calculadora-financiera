import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, calculateSubscriptionMonthlyCost } from '../../services/financeCalculations';
import { Sparkles, Users } from 'lucide-react';

export const SubscriptionsView: React.FC = () => {
  const { data, summary, toggleSubscription } = useFinance();

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" /> Subscripciones (Filas 8 a 15 de B y C)
          </h2>
          <p className="text-xs text-slate-400">
            Fórmulas y cálculo de valor mensual por persona según el Excel
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Total Mensual</span>
          <span className="text-lg font-black text-pink-400 font-mono">
            {formatCurrency(summary.subscriptionsTotal, 'COP')}
          </span>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.subscriptions.map(sub => {
          const monthlyCost = calculateSubscriptionMonthlyCost(sub);

          return (
            <div
              key={sub.id}
              className={`p-5 rounded-3xl border transition-all duration-300 ${
                sub.active
                  ? 'bg-slate-900 border-slate-800 shadow-lg'
                  : 'bg-slate-950/40 border-slate-850 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-base">{sub.name}</h4>
                  <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    {sub.members > 1 ? (
                      <>
                        <Users className="w-3.5 h-3.5 text-pink-400" />
                        Plan compartido ({sub.members} miembros {sub.billing === 'yearly' ? '• Anual' : '• Mensual'})
                      </>
                    ) : (
                      'Individual'
                    )}
                  </span>
                </div>

                <button
                  onClick={() => toggleSubscription(sub.id)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                    sub.active ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                  title={sub.active ? 'Pausar' : 'Activar'}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      sub.active ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">
                  Factura: {formatCurrency(sub.totalPrice, 'COP')}
                </span>
                <div className="text-base font-extrabold text-pink-400 font-mono">
                  {formatCurrency(monthlyCost, 'COP')} <span className="text-xs font-normal text-slate-400">/ mes</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
