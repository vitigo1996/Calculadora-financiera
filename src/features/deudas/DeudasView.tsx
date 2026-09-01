import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { DeudaItem } from '../../models/finance';
import { getIconComponent, IconPickerModal } from '../../components/ui/IconPicker';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { AmountCalculatorInput } from '../../components/ui/AmountCalculatorInput';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  GripVertical,
  ArrowDownLeft,
  ArrowUpRight,
  Coins
} from 'lucide-react';

export const DeudasView: React.FC = () => {
  const {
    data,
    addDeudaItem,
    updateDeudaItem,
    deleteDeudaItem,
    moveDeudaItem
  } = useFinance();

  const [showAddDeudaModal, setShowAddDeudaModal] = useState(false);
  const [editingDeudaObj, setEditingDeudaObj] = useState<DeudaItem | null>(null);

  // Form fields
  const [deudaName, setDeudaName] = useState('');
  const [deudaTipo, setDeudaTipo] = useState<'por_cobrar' | 'por_pagar'>('por_pagar');
  const [deudaAmount, setDeudaAmount] = useState('');
  const [deudaIcon, setDeudaIcon] = useState('shield_alert');

  // Drag and drop state
  const [draggedDeudaIdx, setDraggedDeudaIdx] = useState<number | null>(null);

  // Icon Picker Modal State
  const [iconPickerTarget, setIconPickerTarget] = useState<{
    targetId?: string;
    currentIcon: string;
    title: string;
  } | null>(null);

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

  const getItemIconStyle = () => {
    return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 shadow-sm';
  };

  const handleDeudaDrop = (targetIdx: number) => {
    if (draggedDeudaIdx === null || draggedDeudaIdx === targetIdx) {
      setDraggedDeudaIdx(null);
      return;
    }
    const diff = targetIdx - draggedDeudaIdx;
    if (diff > 0) {
      for (let i = draggedDeudaIdx; i < targetIdx; i++) {
        moveDeudaItem(i, 'down');
      }
    } else {
      for (let i = draggedDeudaIdx; i > targetIdx; i--) {
        moveDeudaItem(i, 'up');
      }
    }
    setDraggedDeudaIdx(null);
  };

  const openCreateDeuda = () => {
    setEditingDeudaObj(null);
    setDeudaName('');
    setDeudaTipo('por_pagar');
    setDeudaAmount('');
    setDeudaIcon('shield_alert');
    setShowAddDeudaModal(true);
  };

  const openEditDeuda = (item: DeudaItem) => {
    setEditingDeudaObj(item);
    setDeudaName(item.nombre);
    setDeudaTipo(item.tipo);
    setDeudaAmount(item.monto !== undefined ? item.monto.toString() : '');
    setDeudaIcon(item.icon || (item.tipo === 'por_cobrar' ? 'coins' : 'shield_alert'));
    setShowAddDeudaModal(true);
  };

  const handleSaveDeuda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deudaName.trim()) return;
    const parsedAmount = deudaAmount ? parseFloat(deudaAmount) : undefined;

    if (editingDeudaObj) {
      updateDeudaItem(editingDeudaObj.id, {
        nombre: deudaName.trim(),
        tipo: deudaTipo,
        monto: parsedAmount,
        icon: deudaIcon
      });
    } else {
      addDeudaItem({
        nombre: deudaName.trim(),
        tipo: deudaTipo,
        monto: parsedAmount,
        moneda: 'COP',
        icon: deudaIcon
      });
    }

    setShowAddDeudaModal(false);
    setEditingDeudaObj(null);
  };

  const handleDeleteDeudaFromModal = () => {
    if (!editingDeudaObj) return;
    setConfirmConfig({
      isOpen: true,
      title: 'Eliminar Registro de Deuda',
      message: `¿Estás seguro de eliminar "${editingDeudaObj.nombre}"?`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
      onConfirm: () => {
        deleteDeudaItem(editingDeudaObj.id);
        setShowAddDeudaModal(false);
        setEditingDeudaObj(null);
      }
    });
  };

  const totalPorCobrar = (data.deudaItems || [])
    .filter(d => d.tipo === 'por_cobrar')
    .reduce((sum, d) => sum + (d.monto || 0), 0);
  const totalPorPagar = (data.deudaItems || [])
    .filter(d => d.tipo === 'por_pagar')
    .reduce((sum, d) => sum + (d.monto || 0), 0);
  const balanceNeto = totalPorCobrar - totalPorPagar;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 3 Tarjetas de Resumen: Me Deben, Debo, Balance Neto */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Por Cobrar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm transition-colors overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Me Deben</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-400 font-mono tracking-tight whitespace-nowrap">
            {formatCurrency(totalPorCobrar)}
          </div>
        </div>

        {/* Por Pagar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm transition-colors overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">Debo</span>
            <ArrowUpRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-base sm:text-lg font-bold text-rose-700 dark:text-rose-400 font-mono tracking-tight whitespace-nowrap">
            {formatCurrency(totalPorPagar)}
          </div>
        </div>

        {/* Balance Neto */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm transition-colors overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Balance Neto</span>
            <Coins className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-mono tracking-tight whitespace-nowrap">
            {formatCurrency(balanceNeto)}
          </div>
        </div>
      </div>

      {/* Lista de Deudas */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">Registro de Deudas</h3>

          <button
            onClick={openCreateDeuda}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40 hover:bg-blue-200 transition-all flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar
          </button>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {(!data.deudaItems || data.deudaItems.length === 0) ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              No tienes deudas registradas. Haz clic en <strong>Agregar</strong> para registrar una.
            </div>
          ) : (
            data.deudaItems.map((item, idx) => {
              const isDragging = draggedDeudaIdx === idx;
              const Icon = getIconComponent(item.icon);
              const isPorCobrar = item.tipo === 'por_cobrar';
              const hasAmount = item.monto !== undefined && item.monto > 0;

              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={e => {
                    setDraggedDeudaIdx(idx);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={e => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={e => {
                    e.preventDefault();
                    handleDeudaDrop(idx);
                  }}
                  onDragEnd={() => setDraggedDeudaIdx(null)}
                  className={`p-4 bg-white dark:bg-slate-900 transition-all flex items-center justify-between cursor-grab active:cursor-grabbing ${
                    isDragging ? 'opacity-40 scale-[0.99] bg-blue-50/50 dark:bg-blue-950/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Grip Handle */}
                    <div className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 cursor-grab active:cursor-grabbing flex-shrink-0">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIconPickerTarget({
                          targetId: item.id,
                          currentIcon: item.icon || (isPorCobrar ? 'coins' : 'shield_alert'),
                          title: `Ícono para ${item.nombre}`
                        });
                      }}
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 cursor-pointer hover:scale-105 transition-transform ${getItemIconStyle()}`}
                      title="Toca para cambiar ícono"
                    >
                      <Icon className="w-5 h-5" />
                    </button>

                    {/* Nombre y etiqueta Debo/Me deben debajo */}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">{item.nombre}</h4>
                      <div className="mt-0.5">
                        {isPorCobrar ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                            <ArrowDownLeft className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                            Me Deben
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50">
                            <ArrowUpRight className="w-2.5 h-2.5 text-rose-600 dark:text-rose-400" />
                            Debo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {hasAmount ? (
                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-slate-800 dark:text-white block">
                          {formatCurrency(item.monto || 0)}
                        </span>
                      </div>
                    ) : null}

                    <button
                      onClick={() => openEditDeuda(item)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300/80 dark:border-transparent transition-colors"
                      title="Editar deuda y monto"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal: Crear / Editar Deuda */}
      {showAddDeudaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp my-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingDeudaObj ? 'Editar Deuda' : 'Nueva Deuda'}
              </h3>
              <button
                onClick={() => setShowAddDeudaModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDeuda} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nombre o Persona
                </label>
                <input
                  type="text"
                  value={deudaName}
                  onChange={e => setDeudaName(e.target.value)}
                  placeholder="Ej. Deuda 1, Préstamo, Amigo"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Selector de Dirección: 'Me Deben' vs 'Debo' */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Dirección
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeudaTipo('por_cobrar')}
                    className={`py-2.5 px-2 rounded-2xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                      deudaTipo === 'por_cobrar'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-400'
                        : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Me Deben
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeudaTipo('por_pagar')}
                    className={`py-2.5 px-2 rounded-2xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                      deudaTipo === 'por_pagar'
                        ? 'bg-rose-100 dark:bg-rose-950/60 border-rose-500 text-rose-800 dark:text-rose-300 shadow-sm ring-1 ring-rose-400'
                        : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    Debo
                  </button>
                </div>
              </div>

              {/* Monto con Calculadora */}
              <AmountCalculatorInput
                label="Monto"
                value={deudaAmount}
                onChange={setDeudaAmount}
                placeholder="0"
                title="Ajustar Monto"
              />

              <div className="flex items-center gap-2 pt-3">
                {editingDeudaObj && (
                  <button
                    type="button"
                    onClick={handleDeleteDeudaFromModal}
                    className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 transition-colors flex items-center justify-center"
                    title="Eliminar esta deuda"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowAddDeudaModal(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs py-3 rounded-2xl transition-colors border border-slate-300/80 dark:border-transparent text-center"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-2xl shadow-sm transition-all text-center"
                >
                  {editingDeudaObj ? 'Actualizar' : 'Guardar'}
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
            if (iconPickerTarget.targetId) {
              updateDeudaItem(iconPickerTarget.targetId, { icon: newIcon });
            }
            setIconPickerTarget(null);
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
