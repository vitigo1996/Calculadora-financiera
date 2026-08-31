import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { PortfolioAccountItem } from '../../models/finance';
import { getIconComponent, IconPicker } from '../../components/ui/IconPicker';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  TrendingUp as PieChartIcon,
  Edit2,
  Plus,
  Minus,
  Trash2,
  X,
  Calculator,
  GripVertical,
  Check
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
    addPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    movePortfolioItem
  } = useFinance();

  const port = summary.portafolio;

  // Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Active item for the 4x4 color palette popover
  const [colorPickerTarget, setColorPickerTarget] = useState<{ id: string; label: string; currentColor: string } | null>(null);

  // Modal states for Portafolio item (Create / Edit)
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItemObj, setEditingItemObj] = useState<PortfolioAccountItem | null>(null);

  // Form fields
  const [itemName, setItemName] = useState('');
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
    setItemBalance(p.saldo.toString());
    setItemIcon(p.icon || 'trending_up');
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

  // Save Item (Create or Edit)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;
    const saldo = parseFloat(itemBalance) || 0;

    if (editingItemObj) {
      updatePortfolioItem(editingItemObj.id, {
        nombre: itemName.trim(),
        moneda: 'COP',
        saldo,
        icon: itemIcon
      });
    } else {
      addPortfolioItem({
        nombre: itemName.trim(),
        moneda: 'COP',
        saldo,
        icon: itemIcon
      });
    }
    setShowAddModal(false);
    setEditingItemObj(null);
  };

  // Delete Item from inside Edit Modal
  const handleDeleteFromModal = () => {
    if (!editingItemObj) return;
    if (confirm(`¿Eliminar la cuenta "${editingItemObj.nombre}"?`)) {
      deletePortfolioItem(editingItemObj.id);
      setShowAddModal(false);
      setEditingItemObj(null);
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
      for (let i = draggedIndex; i < index; i++) movePortfolioItem(i, 'down');
    } else {
      for (let i = draggedIndex; i > index; i--) movePortfolioItem(i, 'up');
    }
    setDraggedIndex(null);
  };

  // Handle selecting a color from the 4x4 grid
  const handleSelectColor = (colorHex: string) => {
    if (!colorPickerTarget) return;
    updatePortfolioItem(colorPickerTarget.id, { color: colorHex });
    setColorPickerTarget(null);
  };

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <PieChartIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Portafolio
        </h2>
      </div>

      {/* Tarjeta de Resumen Global del Portafolio */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 block">
            Patrimonio Total en Portafolio
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
            {port.items.length} activos
          </span>
        </div>
        <div className="text-3xl font-black text-slate-800 dark:text-white mt-1 font-mono">
          {formatCurrency(port.totalPortafolio)}
        </div>
      </div>

      {/* Gráfica Circular de Distribución */}
      {port.items.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Distribución del Portafolio</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Haz clic en el color para cambiarlo</span>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
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
                  {port.items.map((entry: any) => (
                    <Cell key={`cell-${entry.id}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [
                    formatCurrency(Number(value) || 0),
                    'Valor'
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '16px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Leyenda interactiva de Colores */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            {port.items.map((item: any) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setColorPickerTarget({ id: item.id, label: item.label, currentColor: item.color })}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                title={`Cambiar color de ${item.label}`}
              >
                <span className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                <span className="text-slate-700 dark:text-slate-200">{item.label}</span>
                <span className="font-mono text-slate-500 dark:text-slate-400 text-[10px]">
                  ({item.percentage.toFixed(1)}%)
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recuadro Portafolio con Filas Arrastrables */}
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
          {(data.portfolioItems || []).map((item, idx) => {
            const Icon = getIconComponent(item.icon || 'trending_up');
            const isDragging = draggedIndex === idx;

            return (
              <div
                key={item.id}
                draggable
                onDragStart={e => handleDragStart(e, idx)}
                onDragOver={e => handleDragOver(e, idx)}
                onDrop={e => handleDrop(e, idx)}
                onDragEnd={() => setDraggedIndex(null)}
                className={`p-4 bg-white dark:bg-slate-900 transition-all flex items-center justify-between cursor-grab active:cursor-grabbing ${
                  isDragging ? 'opacity-40 scale-[0.99] bg-blue-50/50 dark:bg-blue-950/30' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Ícono de agarre arrastrable */}
                  <div className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4" />
                  </div>

                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${getItemIconStyle()}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.nombre}</h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-slate-800 dark:text-white block">
                      {formatCurrency(item.saldo)}
                    </span>
                  </div>

                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300/80 dark:border-transparent transition-colors"
                    title="Editar saldo y cuenta"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
                  placeholder="Ej. ETF S&P500, CDT Bancolombia, Nu Emergencia"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Saldo con botón de calculadora integrado dentro del input */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Saldo
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

              {/* Icon Picker */}
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
