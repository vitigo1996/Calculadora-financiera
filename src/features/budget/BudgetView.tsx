import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { HousingExpense, ObligationItem, PaymentPeriod } from '../../models/finance';
import {
  Home,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

export const BudgetView: React.FC = () => {
  const {
    data,
    summary,
    addHousingExpense,
    updateHousingExpense,
    deleteHousingExpense,
    addObligation,
    updateObligation,
    deleteObligation
  } = useFinance();

  const [activePeriodFilter, setActivePeriodFilter] = useState<'all' | '1st' | '2nd'>('all');
  const [showAddHousingModal, setShowAddHousingModal] = useState(false);
  const [editingHousing, setEditingHousing] = useState<HousingExpense | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [refCode, setRefCode] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<PaymentPeriod>('1st_fortnight');
  const [splitType, setSplitType] = useState<'proportional' | 'equal' | 'individual_1' | 'individual_2'>('proportional');

  const [p1, p2] = data.people;

  const openAddModal = () => {
    setEditingHousing(null);
    setName('');
    setRefCode('');
    setAmount('');
    setPeriod('1st_fortnight');
    setSplitType('proportional');
    setShowAddHousingModal(true);
  };

  const openEditModal = (item: HousingExpense) => {
    setEditingHousing(item);
    setName(item.name);
    setRefCode(item.referenceCode || '');
    setAmount(item.totalAmount.toString());
    setPeriod(item.period);
    setSplitType(item.splitType as any);
    setShowAddHousingModal(true);
  };

  const handleSaveHousing = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!name || isNaN(parsedAmount) || parsedAmount < 0) return;

    if (editingHousing) {
      updateHousingExpense(editingHousing.id, {
        name,
        referenceCode: refCode,
        totalAmount: parsedAmount,
        period,
        splitType
      });
    } else {
      addHousingExpense({
        name,
        referenceCode: refCode,
        totalAmount: parsedAmount,
        period,
        splitType
      });
    }
    setShowAddHousingModal(false);
  };

  const filteredHousing = data.housingExpenses.filter(h => {
    if (activePeriodFilter === '1st') return h.period === '1st_fortnight';
    if (activePeriodFilter === '2nd') return h.period === '2nd_fortnight';
    return true;
  });

  const filteredObligations = data.obligations.filter(o => {
    if (activePeriodFilter === '1st') return o.period === '1st_fortnight';
    if (activePeriodFilter === '2nd') return o.period === '2nd_fortnight';
    return true;
  });

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-400" /> Presupuesto Quincenal & Gastos
          </h2>
          <p className="text-xs text-slate-400">
            Control de vivienda compartida, servicios públicos y compromisos quincenales
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActivePeriodFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activePeriodFilter === 'all'
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todo el Mes
          </button>
          <button
            onClick={() => setActivePeriodFilter('1st')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activePeriodFilter === '1st'
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1ª Quincena
          </button>
          <button
            onClick={() => setActivePeriodFilter('2nd')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activePeriodFilter === '2nd'
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2ª Quincena
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 block">Total Vivienda (Hogar)</span>
          <span className="text-xl font-bold text-white block mt-1">
            {formatCurrency(data.housingExpenses.reduce((s, h) => s + h.totalAmount, 0), 'COP')}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Servicios + Internet + Arriendo</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 block">Aporte {p1.name} ({(summary.p1.ratio * 100).toFixed(1)}%)</span>
          <span className="text-xl font-bold text-emerald-400 block mt-1">
            {formatCurrency(summary.p1.housingShare, 'COP')}
          </span>
          <span className="text-[11px] text-emerald-400/80 block mt-1">Calculado proporcional</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 block">Aporte {p2.name} ({(summary.p2.ratio * 100).toFixed(1)}%)</span>
          <span className="text-xl font-bold text-indigo-400 block mt-1">
            {formatCurrency(summary.p2.housingShare, 'COP')}
          </span>
          <span className="text-[11px] text-indigo-400/80 block mt-1">Calculado proporcional</span>
        </div>
      </div>

      {/* Section 1: Vivienda */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Gastos de Vivienda Compartidos</h3>
              <p className="text-[11px] text-slate-400">Divididos automáticamente según los ingresos de cada uno</p>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-2 rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Agregar Gasto
          </button>
        </div>

        <div className="divide-y divide-slate-800/80">
          {filteredHousing.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No hay gastos de vivienda en esta quincena.
            </div>
          ) : (
            filteredHousing.map(item => {
              const p1Share = item.splitType === 'proportional' ? item.totalAmount * summary.p1.ratio : item.totalAmount * 0.5;
              const p2Share = item.splitType === 'proportional' ? item.totalAmount * summary.p2.ratio : item.totalAmount * 0.5;

              return (
                <div key={item.id} className="p-4 hover:bg-slate-850/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 px-2.5 py-1 rounded-xl text-xs font-bold ${
                      item.period === '1st_fortnight' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                      {item.period === '1st_fortnight' ? '1ª Quincena' : '2ª Quincena'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{item.name}</h4>
                        {item.referenceCode && (
                          <span className="text-[11px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700">
                            Ref: {item.referenceCode}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                        <span>Total: <strong className="text-slate-200">{formatCurrency(item.totalAmount, 'COP')}</strong></span>
                        <span>•</span>
                        <span className="text-emerald-400 font-medium">{p1.name}: {formatCurrency(p1Share, 'COP')}</span>
                        <span>•</span>
                        <span className="text-indigo-400 font-medium">{p2.name}: {formatCurrency(p2Share, 'COP')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteHousingExpense(item.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Section 2: Obligaciones & Compromisos */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Obligaciones, Préstamos y Carro</h3>
              <p className="text-[11px] text-slate-400">Cuotas fijas y compromisos financieros mensuales</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-800/80">
          {filteredObligations.map(ob => (
            <div key={ob.id} className="p-4 hover:bg-slate-850/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 px-2.5 py-1 rounded-xl text-xs font-bold ${
                  ob.period === '1st_fortnight' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                }`}>
                  {ob.period === '1st_fortnight' ? '1ª Quincena' : '2ª Quincena'}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm">{ob.name}</h4>
                    {ob.totalDebtBalance && (
                      <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-lg border border-purple-500/20">
                        Saldo Deuda: {formatCurrency(ob.totalDebtBalance, 'COP')}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                    <span>Cuota Total: <strong className="text-slate-200">{formatCurrency(ob.totalAmount, 'COP')}</strong></span>
                    <span>•</span>
                    <span className="text-emerald-400 font-medium">Cuota {p1.name}: {formatCurrency(ob.person1Amount, 'COP')}</span>
                    {ob.person2Amount > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-indigo-400 font-medium">Cuota {p2.name}: {formatCurrency(ob.person2Amount, 'COP')}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-xs font-bold text-right text-purple-400 self-end sm:self-auto">
                {formatCurrency(ob.person1Amount, 'COP')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Add / Edit Housing Expense */}
      {showAddHousingModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingHousing ? 'Editar Gasto de Vivienda' : 'Nuevo Gasto de Vivienda'}
            </h3>

            <form onSubmit={handleSaveHousing} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nombre / Concepto</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej. Servicios, Gas, Administración"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Código de Referencia de Pago (Opcional)</label>
                <input
                  type="text"
                  value={refCode}
                  onChange={e => setRefCode(e.target.value)}
                  placeholder="Ej. 3628, Referencia de factura"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Monto Total Factura (COP)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="Ej. 250000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Quincena de Pago</label>
                  <select
                    value={period}
                    onChange={e => setPeriod(e.target.value as PaymentPeriod)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="1st_fortnight">1ª Quincena (Mitad mes)</option>
                    <option value="2nd_fortnight">2ª Quincena (Fin mes)</option>
                    <option value="monthly">Dividido en Ambas</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Tipo de Reparto</label>
                  <select
                    value={splitType}
                    onChange={e => setSplitType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="proportional">Proporcional a Ingresos</option>
                    <option value="equal">50% / 50% Mitad c/u</option>
                    <option value="individual_1">100% {p1.name}</option>
                    <option value="individual_2">100% {p2.name}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddHousingModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs py-3 rounded-2xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all"
                >
                  Guardar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
