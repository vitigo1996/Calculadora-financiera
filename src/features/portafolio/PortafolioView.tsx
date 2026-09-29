import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, convertToBase } from '../../services/financeCalculations';
import { PortfolioAccountItem } from '../../models/finance';
import { getIconComponent, IconPickerModal, IconPickerTrigger } from '../../components/ui/IconPicker';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { AmountCalculatorInput } from '../../components/ui/AmountCalculatorInput';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  TrendingUp as PieChartIcon,
  Edit2,
  Plus,
  Trash2,
  X,
  Check,
  Globe,
  RefreshCw,
  ArrowUpDown,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

// Malla de 4x4 colores predefinidos (16 colores elegantes y distinguibles)
const PRESET_COLORS_4X4 = [
  // Fila 1: Azules y Teals
  '#2563eb', '#0284c7', '#06b6d4', '#0d9488',
  // Fila 2: Verdes y Amarillos
  '#059669', '#16a34a', '#65a30d', '#eab308',
  // Fila 3: Cálidos, Naranjas y Rojos
  '#d97706', '#ea580c', '#f43f5e', '#dc2626',
  // Fila 4: Púrpuras, Violetas, Rosas y Neutros
  '#9333ea', '#7c3aed', '#db2777', '#475569'
];

export const PortafolioView: React.FC = () => {
  const {
    data,
    summary,
    baseCurrency,
    isFetchingRate,
    refreshLiveDolarRate,
    addPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    movePortfolioItem
  } = useFinance();

  // Confirmation modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string | null;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  } | null>(null);

  // Icon Picker Modal State
  const [iconPickerTarget, setIconPickerTarget] = useState<{
    type: 'portfolio_item' | 'portfolio_form';
    targetId?: string;
    currentIcon: string;
    title: string;
  } | null>(null);

  const dolarRate = data.dolarRate || 3600;
  const port = summary.portafolio;

  // Reorder state
  const [isReorderingPortfolio, setIsReorderingPortfolio] = useState(false);

  // Active item for the 4x4 color palette popover
  const [colorPickerTarget, setColorPickerTarget] = useState<{ id: string; label: string; currentColor: string } | null>(null);

  // Modal states for Portafolio item (Create / Edit)
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItemObj, setEditingItemObj] = useState<PortfolioAccountItem | null>(null);

  // Form fields
  const [itemName, setItemName] = useState('');
  const [itemCurrency, setItemCurrency] = useState<'COP' | 'USD'>('COP');
  const [itemBalance, setItemBalance] = useState('');
  const [itemIcon, setItemIcon] = useState('trending_up');
  const [itemColor, setItemColor] = useState('#2563eb');

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
    setItemColor('#2563eb');
    setEditingItemObj(null);
    setShowAddModal(true);
  };

  // Open Edit Modal
  const openEditModal = (p: PortfolioAccountItem) => {
    setEditingItemObj(p);
    setItemName(p.nombre);
    setItemCurrency(p.moneda || 'COP');
    setItemBalance(p.saldo.toString());
    setItemIcon(p.icon || (p.moneda === 'USD' ? 'coins' : 'trending_up'));
    setItemColor(p.color || '#2563eb');
    setShowAddModal(true);
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
        icon: itemIcon,
        color: itemColor
      });
    } else {
      addPortfolioItem({
        nombre: itemName.trim(),
        moneda: itemCurrency,
        saldo,
        icon: itemIcon,
        color: itemColor
      });
    }

    setShowAddModal(false);
    setEditingItemObj(null);
  };

  // Delete Item from Modal
  const handleDeleteFromModal = () => {
    if (!editingItemObj) return;
    setConfirmConfig({
      isOpen: true,
      title: 'Eliminar Activo',
      message: `¿Estás seguro de eliminar "${editingItemObj.nombre}" del portafolio?`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
      onConfirm: () => {
        deletePortfolioItem(editingItemObj.id);
        setShowAddModal(false);
        setEditingItemObj(null);
      }
    });
  };

  // Handle selecting a color from the 4x4 grid
  const handleSelectColor = (colorHex: string) => {
    if (colorPickerTarget) {
      updatePortfolioItem(colorPickerTarget.id, { color: colorHex });
      setColorPickerTarget(null);
    }
  };

  return (
    <div className="space-y-6 pb-2 animate-fadeIn">
      {/* Recuadro Portafolio */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">Portafolio</h3>

          {/* Botones de acción: Reordenar y Agregar (+) */}
          <div className="flex items-center gap-2">
            {(data.portfolioItems || []).length > 1 && (
              <button
                onClick={() => setIsReorderingPortfolio(!isReorderingPortfolio)}
                className={`p-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center shadow-sm ${
                  isReorderingPortfolio
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300/80 dark:border-transparent'
                }`}
                title={isReorderingPortfolio ? 'Listo' : 'Reordenar Portafolio'}
              >
                {isReorderingPortfolio ? <Check className="w-4 h-4" /> : <ArrowUpDown className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={openCreateModal}
              className="p-2 rounded-xl text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40 hover:bg-blue-200 transition-all flex items-center justify-center shadow-sm"
              title="Agregar Activo"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {(!data.portfolioItems || data.portfolioItems.length === 0) ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              No tienes activos en tu portafolio. Haz clic en <strong>+</strong> para registrar uno.
            </div>
          ) : (
            data.portfolioItems.map((item, idx) => {
              const Icon = getIconComponent(item.icon || 'trending_up');
              const itemMoneda = item.moneda || 'COP';
              const isDiff = itemMoneda !== baseCurrency;
              const equivalentInBase = convertToBase(item.saldo, itemMoneda, baseCurrency, dolarRate);

              return (
                <div
                  key={item.id}
                  className="p-4 bg-white dark:bg-slate-900 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIconPickerTarget({
                          type: 'portfolio_item',
                          targetId: item.id,
                          currentIcon: item.icon || 'trending_up',
                          title: `Ícono para ${item.nombre}`
                        });
                      }}
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 cursor-pointer hover:scale-105 transition-transform ${getItemIconStyle()}`}
                      title="Toca para cambiar ícono"
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">{item.nombre}</h4>
                        {isDiff && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 flex-shrink-0">
                            {itemMoneda}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <span className="font-mono font-bold text-sm text-slate-800 dark:text-white block">
                        {formatCurrency(item.saldo, itemMoneda)}
                      </span>
                      {isDiff && (
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block">
                          {formatCurrency(equivalentInBase, baseCurrency)}
                        </span>
                      )}
                    </div>

                    {isReorderingPortfolio ? (
                      <div className="flex items-center gap-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => movePortfolioItem(idx, 'up')}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          title="Mover arriba"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          disabled={idx === data.portfolioItems.length - 1}
                          onClick={() => movePortfolioItem(idx, 'down')}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          title="Mover abajo"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300/80 dark:border-transparent transition-colors"
                        title="Editar activo y monto"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Gráfico Donut y Distribución de Activos a ancho completo */}
      {port.items.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-300 dark:border-slate-800 shadow-sm transition-colors space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Distribución de Activos
            </span>
          </div>

          {/* Gráfica Donut */}
          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={port.items}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="valorCOP"
                  nameKey="label"
                >
                  {port.items.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={1.5} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${formatCurrency(Number(value), 'COP')}`, `${name}`]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '16px',
                    padding: '10px 14px',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.4)'
                  }}
                  itemStyle={{ color: '#60a5fa', fontSize: '13px', fontWeight: 'bold' }}
                  labelStyle={{ color: '#f8fafc', fontSize: '13px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Lista de Leyenda de Activos a ancho completo */}
          <div className="space-y-2 pt-1">
            {port.items.map((item, i) => (
              <div
                key={item.id || i}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 transition-colors flex items-center justify-between gap-3"
              >
                {/* Lado Izquierdo: Botón de Color + Nombre */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => setColorPickerTarget({ id: item.id, label: item.label, currentColor: item.color })}
                    title="Click para cambiar color"
                    className="w-5 h-5 rounded-full shadow-sm ring-2 ring-white dark:ring-slate-800 hover:scale-110 active:scale-95 transition-transform flex-shrink-0 cursor-pointer"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.label}
                  </span>
                </div>

                {/* Lado Derecho: Valor en COP + Porcentaje */}
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(item.valorCOP, 'COP')}
                  </span>
                  <span
                    className="font-bold text-[11px] font-mono px-2 py-0.5 rounded-lg text-white whitespace-nowrap shadow-xs min-w-[46px] text-center"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Emergente de Selección de Color (Malla 4x4) */}
      {colorPickerTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setColorPickerTarget(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-5 max-w-xs w-full shadow-2xl animate-scaleUp space-y-4 my-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                  Color para: <span className="text-blue-600 dark:text-blue-400">{colorPickerTarget.label}</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Selecciona un color para este activo</p>
              </div>
              <button
                type="button"
                onClick={() => setColorPickerTarget(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Malla de 4x4 (16 colores) */}
            <div className="grid grid-cols-4 gap-3 p-2 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800">
              {PRESET_COLORS_4X4.map(colorHex => {
                const isSelected = (colorPickerTarget.currentColor || '').toLowerCase() === colorHex.toLowerCase();
                return (
                  <button
                    key={colorHex}
                    type="button"
                    onClick={() => handleSelectColor(colorHex)}
                    className="h-10 rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md ring-2 ring-white/30 cursor-pointer"
                    style={{ backgroundColor: colorHex }}
                    title={colorHex}
                  >
                    {isSelected && <Check className="w-5 h-5 text-white drop-shadow-md stroke-[3]" />}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setColorPickerTarget(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors text-center"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal: Crear / Editar Item de Portafolio */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto my-auto">
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
                  placeholder="Ej. Activo 1, Fondo de ahorro, Inversión"
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

              {/* Tasa TRM cuando la moneda del activo difiere de la Moneda Base */}
              {itemCurrency !== baseCurrency && (
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/70 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 animate-fadeIn">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
                      Tasa de Cambio (TRM)
                    </span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                      <Globe className="w-3.5 h-3.5" />
                      <span>1 USD = {formatCurrency(dolarRate, 'COP')}</span>
                    </div>
                    {data.dolarRateLiveUpdated && (
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-0.5">
                        Actualizado: {data.dolarRateLiveUpdated}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={refreshLiveDolarRate}
                    disabled={isFetchingRate}
                    title="Actualizar TRM en vivo"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 shadow-sm transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isFetchingRate ? 'animate-spin' : ''}`} />
                    <span>Actualizar</span>
                  </button>
                </div>
              )}

              {/* Saldo con Calculadora */}
              <AmountCalculatorInput
                label="Saldo"
                value={itemBalance}
                onChange={setItemBalance}
                placeholder="0"
                title="Ajustar Saldo"
              />

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

      {/* Pop-up Modal de Selección de Ícono */}
      {iconPickerTarget && (
        <IconPickerModal
          isOpen={true}
          onClose={() => setIconPickerTarget(null)}
          selectedIconId={iconPickerTarget.currentIcon}
          title={iconPickerTarget.title}
          onSelectIcon={(newIcon) => {
            if (!iconPickerTarget) return;
            if (iconPickerTarget.type === 'portfolio_form') {
              setItemIcon(newIcon);
            } else if (iconPickerTarget.type === 'portfolio_item' && iconPickerTarget.targetId) {
              updatePortfolioItem(iconPickerTarget.targetId, { icon: newIcon });
            }
          }}
        />
      )}

      {/* Confirmation Modal */}
      {confirmConfig && (
        <ConfirmModal
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          cancelText={confirmConfig.cancelText}
          variant={confirmConfig.variant}
          onConfirm={() => {
            confirmConfig.onConfirm();
            setConfirmConfig(null);
          }}
          onCancel={() => setConfirmConfig(null)}
        />
      )}
    </div>
  );
};
