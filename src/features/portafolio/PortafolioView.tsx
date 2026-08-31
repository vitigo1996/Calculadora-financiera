import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { PortfolioAccountItem } from '../../models/finance';
import { getIconComponent, IconPicker } from '../../components/ui/IconPicker';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  PieChart as PieChartIcon,
  Edit2,
  Plus,
  Minus,
  Trash2,
  X,
  Calculator
} from 'lucide-react';

export const PortafolioView: React.FC = () => {
  const {
    data,
    summary,
    addPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem
  } = useFinance();

  const dolarRate = data.dolarRate || 3600;
  const port = summary.portafolio;

  // Modal states for Portafolio item (Create / Edit)
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItemObj, setEditingItemObj] = useState<PortfolioAccountItem | null>(null);

  // Form fields
  const [itemName, setItemName] = useState('');
  const [itemCurrency, setItemCurrency] = useState<'COP' | 'USD'>('COP');
  const [itemBalance, setItemBalance] = useState('');
  const [itemIcon, setItemIcon] = useState('trending_up');
  const [showCalcPopup, setShowCalcPopup] = useState(false);
  const [calcDelta, setCalcDelta] = useState('');

  // Uniform neutral blue icon container style
  const getItemIconStyle = () => {
    return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 shadow-sm';
  };

  // Open Create Modal
  const openCreateModal = () => {
    setItemName('');
    setItemCurrency('COP');
    setItemBalance('');
    setItemIcon('trending_up');
    setCalcDelta('');
    setShowCalcPopup(false);
    setEditingItemObj(null);
    setShowAddModal(true);
  };

  // Open Edit Modal
  const openEditModal = (p: PortfolioAccountItem) => {
    setEditingItemObj(p);
    setItemName(p.nombre);
    setItemCurrency(p.moneda);
    setItemBalance(p.saldo.toString());
    setItemIcon(p.icon || (p.moneda === 'USD' ? 'coins' : 'trending_up'));
    setCalcDelta('');
    setShowCalcPopup(false);
    setShowAddModal(true);
  };

  // Apply Add/Subtract operation and immediately close popup
  const applyCalc = (op: '+' | '-') => {
    const delta = parseFloat(calcDelta);
    if (!isNaN(delta) && delta > 0) {
      const current = parseFloat(itemBalance) || 0;
      const result = op === '+' ? current + delta : Math.max(0, current - delta);
      setItemBalance(result.toString());
    }
    setCalcDelta('');
    setShowCalcPopup(false);
  };

  // Save (Create or Edit)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;
    const saldo = parseFloat(itemBalance) || 0;

    if (editingItemObj) {
      updatePortfolioItem(editingItemObj.id, {
        nombre: itemName.trim(),
        moneda: itemCurrency,
        saldo,
        icon: itemIcon
      });
    } else {
      addPortfolioItem({
        nombre: itemName.trim(),
        moneda: itemCurrency,
        saldo,
        icon: itemIcon
      });
    }

    setShowAddModal(false);
    setEditingItemObj(null);
  };

  // Delete Item from Modal
  const handleDeleteFromModal = () => {
    if (!editingItemObj) return;
    if (confirm(`¿Eliminar "${editingItemObj.nombre}" del portafolio?`)) {
      deletePortfolioItem(editingItemObj.id);
      setShowAddModal(false);
      setEditingItemObj(null);
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <PieChartIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Portafolio
        </h2>

        <div className="text-right">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Patrimonio Total</span>
          <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
            COP {formatCurrency(port.totalPortafolio, 'COP')}
          </span>
        </div>
      </div>

      {/* Recuadro Portafolio (Mismo formato que Billetera) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">Portafolio</h3>

          {/* Botón directo de Agregar */}
          <button
            onClick={openCreateModal}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40 hover:bg-blue-200 transition-all flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar
          </button>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {(data.portfolioItems || []).map(item => {
            const Icon = getIconComponent(item.icon || 'trending_up');
            const isUSD = item.moneda === 'USD';
            const equivalentCOP = isUSD ? item.saldo * dolarRate : null;

            return (
              <div
                key={item.id}
                className="p-4 bg-white dark:bg-slate-900 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${getItemIconStyle()}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.nombre}</h4>
                      {isUSD && equivalentCOP !== null && (
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          {formatCurrency(equivalentCOP, 'COP')} COP
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right flex items-center gap-1.5">
                    {/* Moneda como texto plano */}
                    <span className="text-xs font-semibold font-mono text-slate-500 dark:text-slate-400">
                      {item.moneda}
                    </span>
                    <span className="font-mono font-bold text-sm text-slate-800 dark:text-white">
                      {formatCurrency(item.saldo, item.moneda)}
                    </span>
                  </div>

                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300/80 dark:border-transparent transition-colors"
                    title="Editar activo y monto"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gráfico Donut y Distribución */}
      {port.items.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-300 dark:border-slate-800 shadow-sm transition-colors">
          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={port.items}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="valorCOP"
                >
                  {port.items.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => `COP ${formatCurrency(Number(value), 'COP')}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            {port.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{item.label}</span>
                </div>
                <span className="font-bold text-blue-700 dark:text-blue-300 font-mono ml-1">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Crear / Editar Item de Portafolio */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingItemObj ? 'Editar Activo' : 'Nuevo Activo'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nombre</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  placeholder="Ej. Etoro ETF, CDT Bancolombia, Nu Emergencia"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Selector de Moneda en Menú Desplegable */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Moneda</label>
                <select
                  value={itemCurrency}
                  onChange={e => setItemCurrency(e.target.value as 'COP' | 'USD')}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="COP">Pesos (COP)</option>
                  <option value="USD">Dólares (USD)</option>
                </select>
              </div>

              {/* Saldo con botón de calculadora integrado dentro del input */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Saldo {itemCurrency === 'USD' ? '(USD)' : '(COP)'}
                </label>

                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={itemBalance}
                    onChange={e => setItemBalance(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl pl-3.5 pr-11 py-2.5 text-sm text-slate-800 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowCalcPopup(!showCalcPopup)}
                    title="Calculadora (+ / -)"
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-all ${
                      showCalcPopup
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Calculator className="w-4 h-4" />
                  </button>

                  {/* Pop-up de Calculadora */}
                  {showCalcPopup && (
                    <div className="absolute right-0 top-full mt-2 z-30 p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-xl space-y-2.5 w-64 animate-scaleUp">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Ajustar Saldo
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowCalcPopup(false)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="number"
                        step="any"
                        value={calcDelta}
                        onChange={e => setCalcDelta(e.target.value)}
                        placeholder="Valor a sumar o restar..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs px-2.5 py-1.5 rounded-xl text-slate-800 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                        autoFocus
                      />

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => applyCalc('+')}
                          className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> Sumar
                        </button>
                        <button
                          type="button"
                          onClick={() => applyCalc('-')}
                          className="flex-1 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" /> Restar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Icon Picker con Mosaico Compacto y Pequeño */}
              <IconPicker selectedIconId={itemIcon} onSelectIcon={setItemIcon} />

              <div className="flex items-center gap-2 pt-3">
                {editingItemObj && (
                  <button
                    type="button"
                    onClick={handleDeleteFromModal}
                    className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 transition-colors flex items-center justify-center"
                    title="Eliminar este activo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs py-3 rounded-2xl transition-colors border border-slate-300/80 dark:border-transparent text-center"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-2xl shadow-sm transition-all text-center"
                >
                  {editingItemObj ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
