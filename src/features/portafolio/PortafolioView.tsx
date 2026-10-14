import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, convertToBase } from '../../services/financeCalculations';
import { PortfolioAccountItem } from '../../models/finance';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { AmountCalculatorInput } from '../../components/ui/AmountCalculatorInput';
import {
  Briefcase,
  Edit2,
  Plus,
  Trash2,
  X,
  Check,
  Globe,
  RefreshCw,
  GripVertical
} from 'lucide-react';

export const PortafolioView: React.FC = () => {
  const {
    data,
    baseCurrency,
    isFetchingRate,
    refreshLiveDolarRate,
    addPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    reorderPortfolioItems
  } = useFinance();

  // Edit states
  const [isEditingPortfolio, setIsEditingPortfolio] = useState(false);
  const [draggedPortfolioIdx, setDraggedPortfolioIdx] = useState<number | null>(null);

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

  const dolarRate = data.dolarRate || 3600;

  // Modal states for Portafolio item (Create / Edit)
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItemObj, setEditingItemObj] = useState<PortfolioAccountItem | null>(null);

  // Form fields
  const [itemName, setItemName] = useState('');
  const [itemCurrency, setItemCurrency] = useState<'COP' | 'USD'>('COP');
  const [itemBalance, setItemBalance] = useState('');

  // Open Create Modal
  const openCreateModal = () => {
    setItemName('');
    setItemCurrency('COP');
    setItemBalance('');
    setEditingItemObj(null);
    setShowAddModal(true);
  };

  // Open Edit Modal
  const openEditModal = (p: PortfolioAccountItem) => {
    setEditingItemObj(p);
    setItemName(p.nombre);
    setItemCurrency(p.moneda || 'COP');
    setItemBalance(p.saldo.toString());
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
        saldo
      });
    } else {
      addPortfolioItem({
        nombre: itemName.trim(),
        moneda: itemCurrency,
        saldo
      });
    }

    setShowAddModal(false);
    setEditingItemObj(null);
  };

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Recuadro Portafolio */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-4 bg-slate-100 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-600 text-white border-2 border-indigo-400 dark:border-indigo-400 flex items-center justify-center shadow-xs flex-shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-slate-800 dark:text-white text-base tracking-wide uppercase">
              PORTAFOLIO
            </span>
          </div>

          {/* Botones de acción: Editar y Agregar (+) */}
          <div className="flex items-center gap-2">
            {(data.portfolioItems || []).length > 0 && (
              <button
                onClick={() => setIsEditingPortfolio(!isEditingPortfolio)}
                className={`p-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center shadow-sm ${
                  isEditingPortfolio
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300/80 dark:border-transparent'
                }`}
                title={isEditingPortfolio ? 'Listo' : 'Editar Portafolio'}
              >
                {isEditingPortfolio ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
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
              const itemMoneda = item.moneda || 'COP';
              const isDiff = itemMoneda !== baseCurrency;
              const equivalentInBase = convertToBase(item.saldo, itemMoneda, baseCurrency, dolarRate);

              return (
                <div
                  key={item.id}
                  draggable={isEditingPortfolio}
                  onDragStart={(e) => {
                    setDraggedPortfolioIdx(idx);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedPortfolioIdx !== null && draggedPortfolioIdx !== idx) {
                      reorderPortfolioItems(draggedPortfolioIdx, idx);
                    }
                    setDraggedPortfolioIdx(null);
                  }}
                  onDragEnd={() => setDraggedPortfolioIdx(null)}
                  className={`p-4 bg-white dark:bg-slate-900 transition-all flex items-center justify-between ${
                    isEditingPortfolio ? 'cursor-move select-none' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Indicador de arrastre cuando se está editando */}
                    {isEditingPortfolio && (
                      <div className="text-slate-400 dark:text-slate-500 cursor-grab active:cursor-grabbing p-1 flex-shrink-0">
                        <GripVertical className="w-4 h-4" />
                      </div>
                    )}

                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">
                        {item.nombre}
                      </h4>
                    </div>
                  </div>

                  {/* Lado Derecho: Saldo y Botón de Edición / Eliminar */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isDiff && (
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">
                            {itemMoneda}
                          </span>
                        )}
                        <span className="font-mono font-bold text-sm text-slate-800 dark:text-white">
                          {formatCurrency(item.saldo, itemMoneda)}
                        </span>
                      </div>
                      {isDiff && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block">
                          {formatCurrency(equivalentInBase, baseCurrency)}
                        </span>
                      )}
                    </div>

                    {isEditingPortfolio ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmConfig({
                            isOpen: true,
                            title: 'Eliminar Activo',
                            message: `¿Estás seguro de eliminar "${item.nombre}"?`,
                            confirmText: 'Sí, eliminar',
                            cancelText: 'Cancelar',
                            variant: 'danger',
                            onConfirm: () => deletePortfolioItem(item.id)
                          });
                        }}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-300/80 dark:border-transparent transition-colors"
                        title="Eliminar activo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300/80 dark:border-transparent transition-colors"
                        title="Editar activo"
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
                title="Ajuste"
              />

              <div className="flex items-center gap-2 pt-3">
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
