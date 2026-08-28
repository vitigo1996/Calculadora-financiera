import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, calculateSubscriptionMonthlyCost } from '../../services/financeCalculations';
import { SubscriptionItem } from '../../models/finance';
import {
  Sparkles,
  Plus,
  Trash2,
  Users,
  Calendar,
  Check,
  TrendingDown,
  Tv,
  Music,
  Dumbbell,
  Bot,
  Wifi,
  Layers
} from 'lucide-react';

export const SubscriptionsView: React.FC = () => {
  const { data, summary, addSubscription, updateSubscription, deleteSubscription, toggleSubscription } = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [members, setMembers] = useState('1');
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [category, setCategory] = useState('Streaming');

  const handleAddSub = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(totalPrice);
    const mem = parseInt(members) || 1;
    if (!name || isNaN(price) || price <= 0) return;

    addSubscription({
      name,
      totalPrice: price,
      members: mem,
      billing,
      active: true,
      category
    });

    setName('');
    setTotalPrice('');
    setMembers('1');
    setBilling('monthly');
    setShowAddModal(false);
  };

  const getSubIcon = (cat?: string, name?: string) => {
    const text = (cat + ' ' + name).toLowerCase();
    if (text.includes('music') || text.includes('spotify')) return Music;
    if (text.includes('gym') || text.includes('action black') || text.includes('fitness')) return Dumbbell;
    if (text.includes('ai') || text.includes('gemini') || text.includes('gpt')) return Bot;
    if (text.includes('datos') || text.includes('móvil') || text.includes('internet')) return Wifi;
    return Tv;
  };

  const totalMonthlyCost = summary.p1.subscriptionsShare;
  const activeCount = data.subscriptions.filter(s => s.active).length;

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" /> Suscripciones & Planes Compartidos
          </h2>
          <p className="text-xs text-slate-400">
            Optimizador de costos compartidos (división por miembros y planes anuales)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs px-3.5 py-2 rounded-2xl shadow-lg shadow-pink-500/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Agregar Suscripción
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 block">Gasto Mensual Personal</span>
          <span className="text-xl font-bold text-pink-400 block mt-1">
            {formatCurrency(totalMonthlyCost, 'COP')}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">{activeCount} servicios activos</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 block">Gasto Anual Proyectado</span>
          <span className="text-xl font-bold text-white block mt-1">
            {formatCurrency(totalMonthlyCost * 12, 'COP')}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">12 meses de servicios</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 block">Ahorro por Planes Compartidos</span>
          <span className="text-xl font-bold text-emerald-400 block mt-1">
            +65% Ahorro
          </span>
          <span className="text-[11px] text-emerald-400/80 block mt-1">Gracias a planes familiares / anuales</span>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.subscriptions.map(sub => {
          const Icon = getSubIcon(sub.category, sub.name);
          const monthlyPersonalCost = calculateSubscriptionMonthlyCost(sub);

          return (
            <div
              key={sub.id}
              className={`p-5 rounded-3xl border transition-all duration-300 ${
                sub.active
                  ? 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-lg'
                  : 'bg-slate-950/40 border-slate-850 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{sub.name}</h4>
                      {sub.category && (
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                          {sub.category}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Users className="w-3 h-3" />
                      {sub.members > 1 ? `Plan Familiar (${sub.members} miembros)` : 'Individual'}
                    </span>
                  </div>
                </div>

                {/* Toggle switch */}
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

              {/* Price Breakdown */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">
                    Factura: {formatCurrency(sub.totalPrice, 'COP')} / {sub.billing === 'yearly' ? 'año' : 'mes'}
                  </span>
                  <div className="text-base font-extrabold text-pink-400">
                    {formatCurrency(monthlyPersonalCost, 'COP')} <span className="text-xs text-slate-400 font-normal">/ mes</span>
                  </div>
                </div>

                <button
                  onClick={() => deleteSubscription(sub.id)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Eliminar suscripción"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Subscription */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold text-white mb-4">Nueva Suscripción</h3>

            <form onSubmit={handleAddSub} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nombre del Servicio</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej. Disney+, iCloud, ChatGPT Plus"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Categoría</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="Streaming">Streaming / Video</option>
                  <option value="Música">Música & Audio</option>
                  <option value="Productividad">Productividad / IA</option>
                  <option value="Salud y Deporte">Gimnasio / Deporte</option>
                  <option value="Telefonía">Telefonía / Internet</option>
                  <option value="Gaming">Videojuegos</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Precio Total Facturado (COP)</label>
                <input
                  type="number"
                  value={totalPrice}
                  onChange={e => setTotalPrice(e.target.value)}
                  placeholder="Ej. 30000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Miembros Compartidos</label>
                  <input
                    type="number"
                    value={members}
                    min="1"
                    onChange={e => setMembers(e.target.value)}
                    placeholder="1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Frecuencia Cobro</label>
                  <select
                    value={billing}
                    onChange={e => setBilling(e.target.value as 'monthly' | 'yearly')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="monthly">Mensual</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs py-3 rounded-2xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs py-3 rounded-2xl shadow-lg shadow-pink-500/20 transition-all"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
