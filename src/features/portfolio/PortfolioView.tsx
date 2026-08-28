import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { InvestmentAsset } from '../../models/finance';
import {
  PieChart as PieChartIcon,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  TrendingUp,
  Shield,
  Coins,
  Building2,
  Wallet,
  ArrowRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const PortfolioView: React.FC = () => {
  const { data, summary, addAsset, updateAsset, deleteAsset, updateCurrencyRate } = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<InvestmentAsset | null>(null);

  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState<'COP' | 'USD'>('COP');
  const [type, setType] = useState<InvestmentAsset['type']>('Ahorro');

  const openAddModal = () => {
    setEditingAsset(null);
    setName('');
    setInstitution('');
    setBalance('');
    setCurrency('COP');
    setType('Ahorro');
    setShowAddModal(true);
  };

  const openEditModal = (asset: InvestmentAsset) => {
    setEditingAsset(asset);
    setName(asset.name);
    setInstitution(asset.institution);
    setBalance(asset.balance.toString());
    setCurrency(asset.currency);
    setType(asset.type);
    setShowAddModal(true);
  };

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = parseFloat(balance);
    if (!name || isNaN(bal) || bal < 0) return;

    if (editingAsset) {
      updateAsset(editingAsset.id, {
        name,
        institution,
        balance: bal,
        currency,
        type
      });
    } else {
      addAsset({
        name,
        institution,
        balance: bal,
        currency,
        type
      });
    }
    setShowAddModal(false);
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'ETF':
      case 'Acciones':
        return TrendingUp;
      case 'Crypto':
        return Coins;
      case 'Emergencia':
        return Shield;
      case 'Vivienda':
        return Building2;
      default:
        return Wallet;
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-emerald-400" /> Portafolio & Activos
          </h2>
          <p className="text-xs text-slate-400">
            Seguimiento patrimonial, inversiones globales (USD) y fondo de emergencia (COP)
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Agregar Activo
        </button>
      </div>

      {/* Main Net Worth Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div>
            <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Patrimonio Líquido Total</span>
            <div className="text-3xl sm:text-4xl font-black text-white mt-1">
              {formatCurrency(summary.portfolio.totalNetWorthCOP, 'COP')}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
              <span>Total USD: <strong className="text-emerald-400">{formatCurrency(summary.portfolio.totalUSD, 'USD')}</strong></span>
              <span>•</span>
              <span>Total COP: <strong className="text-blue-400">{formatCurrency(summary.portfolio.totalCOP, 'COP')}</strong></span>
            </div>
          </div>

          {/* Emergency Fund Meter */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-teal-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Fondo de Emergencia ({formatCurrency(summary.portfolio.emergencyFundCOP, 'COP')})
              </span>
              <span className="font-bold text-white">
                {summary.portfolio.emergencyFundMonths.toFixed(1)} meses de libertad financiera
              </span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((summary.portfolio.emergencyFundMonths / 6) * 100, 100)}%` }}
              ></div>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Meta recomendada: 3 a 6 meses de gastos mensuales cubiertos.
            </span>
          </div>
        </div>

        {/* Portfolio Distribution Pie */}
        <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
          <span className="text-xs font-semibold text-slate-300 mb-2">Composición del Portafolio</span>
          <div className="h-36 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.portfolio.distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={3}
                  dataKey="balanceCOP"
                >
                  {summary.portfolio.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value), 'COP')}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.portfolio.map(asset => {
          const Icon = getAssetIcon(asset.type);
          const balanceCOP = asset.currency === 'USD' ? asset.balance * data.currencyRateUSD : asset.balance;
          const percentage = summary.portfolio.totalNetWorthCOP > 0 ? (balanceCOP / summary.portfolio.totalNetWorthCOP) * 100 : 0;

          return (
            <div
              key={asset.id}
              className="bg-slate-900 p-5 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{asset.name}</h4>
                      <span className="text-xs text-slate-400">{asset.institution}</span>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {asset.type}
                  </span>
                </div>

                <div className="my-4">
                  <div className="text-xl font-black text-white">
                    {formatCurrency(balanceCOP, 'COP')}
                  </div>
                  {asset.currency === 'USD' && (
                    <span className="text-xs font-semibold text-emerald-400 block mt-0.5">
                      {formatCurrency(asset.balance, 'USD')} USD
                    </span>
                  )}
                </div>
              </div>

              {/* Footer / Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">
                  {percentage.toFixed(1)}% del total
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(asset)}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Editar saldo"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteAsset(asset.id)}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Eliminar activo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add / Edit Asset */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingAsset ? 'Editar Activo / Inversión' : 'Nuevo Activo / Inversión'}
            </h3>

            <form onSubmit={handleSaveAsset} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nombre de la Cuenta o Activo</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej. Nu Cajita, eToro ETF, CDT, Efectivo"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Institución / Broker</label>
                <input
                  type="text"
                  value={institution}
                  onChange={e => setInstitution(e.target.value)}
                  placeholder="Ej. Nu Bank, Bancolombia, eToro, Plenti"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Moneda</label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value as 'COP' | 'USD')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="COP">COP (Pesos Colombianos)</option>
                    <option value="USD">USD (Dólares)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Tipo de Activo</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Emergencia">Fondo Emergencia</option>
                    <option value="ETF">ETF / Acciones</option>
                    <option value="Crypto">Crypto / Dólar Digital</option>
                    <option value="Vivienda">Ahorro Casa / Cesantías</option>
                    <option value="Ahorro">Cuenta Ahorros</option>
                    <option value="Efectivo">Efectivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Saldo Actual ({currency})
                </label>
                <input
                  type="number"
                  step="any"
                  value={balance}
                  onChange={e => setBalance(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
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
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all"
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
