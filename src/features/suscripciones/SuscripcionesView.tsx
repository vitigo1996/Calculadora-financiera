import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, calculateSubscriptionMonthlyCost } from '../../services/financeCalculations';
import { SubscriptionItem } from '../../models/finance';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { AmountCalculatorInput } from '../../components/ui/AmountCalculatorInput';
import { InfoModal, InfoButton } from '../../components/ui/InfoModal';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Calendar,
  Check,
  GripVertical
} from 'lucide-react';

/**
 * SECCIÓN SUSCRIPCIONES (Incrustable al final de Gastos)
 */
export const SuscripcionesView: React.FC = () => {
  const {
    data,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    reorderSubscriptions
  } = useFinance();

  const [isEditingSubs, setIsEditingSubs] = useState(false);
  const [draggedSubIdx, setDraggedSubIdx] = useState<number | null>(null);
  const [infoModalTitle, setInfoModalTitle] = useState<string | null>(null);

  // Modal: Subscription
  const [showSubModal, setShowSubModal] = useState(false);
  const [editingSubObj, setEditingSubObj] = useState<SubscriptionItem | null>(null);
  const [subName, setSubName] = useState('');
  const [subPrice, setSubPrice] = useState('');
  const [subBilling, setSubBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [subMembers, setSubMembers] = useState('1');

  // Confirmation modal
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string | null;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  } | null>(null);

  // Open Create Subscription
  const openCreateSub = () => {
    setEditingSubObj(null);
    setSubName('');
    setSubPrice('');
    setSubBilling('monthly');
    setSubMembers('1');
    setShowSubModal(true);
  };

  // Open Edit Subscription
  const openEditSub = (sub: SubscriptionItem) => {
    setEditingSubObj(sub);
    setSubName(sub.name);
    setSubPrice(sub.totalPrice.toString());
    setSubBilling(sub.billing);
    setSubMembers((sub.members || 1).toString());
    setShowSubModal(true);
  };

  // Save Subscription
  const handleSaveSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) return;
    const price = parseFloat(subPrice) || 0;
    const members = parseInt(subMembers, 10) || 1;

    if (editingSubObj) {
      updateSubscription(editingSubObj.id, {
        name: subName.trim(),
        totalPrice: price,
        members,
        billing: subBilling,
        moneda: 'COP'
      });
    } else {
      addSubscription({
        name: subName.trim(),
        totalPrice: price,
        members,
        billing: subBilling,
        moneda: 'COP'
      });
    }
    setShowSubModal(false);
    setEditingSubObj(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      <div className="p-4 bg-slate-100 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-600 text-white border-2 border-indigo-400 dark:border-indigo-400 flex items-center justify-center shadow-xs flex-shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800 dark:text-white text-base tracking-wide uppercase">
              SUSCRIPCIONES
            </span>
            <InfoButton onClick={() => setInfoModalTitle('Suscripciones')} />
          </div>
        </div>

        {/* Botones de acción: Editar y Agregar (+) */}
        <div className="flex items-center gap-2">
          {(data.subscriptions || []).length > 0 && (
            <button
              onClick={() => setIsEditingSubs(!isEditingSubs)}
              className={`p-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center shadow-sm ${
                isEditingSubs
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300/80 dark:border-transparent'
              }`}
              title={isEditingSubs ? 'Listo' : 'Editar Suscripciones'}
            >
              {isEditingSubs ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={openCreateSub}
            className="p-2 rounded-xl text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40 hover:bg-blue-200 transition-all flex items-center justify-center shadow-sm"
            title="Agregar Suscripción"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {(!data.subscriptions || data.subscriptions.length === 0) ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
            No tienes suscripciones registradas. Haz clic en <strong>+</strong> para registrar una.
          </div>
        ) : (
          data.subscriptions.map((sub, idx) => {
            const monthlyCost = calculateSubscriptionMonthlyCost(sub);
            const isYearly = sub.billing === 'yearly';

            return (
              <div
                key={sub.id}
                draggable={isEditingSubs}
                onDragStart={(e) => {
                  setDraggedSubIdx(idx);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedSubIdx !== null && draggedSubIdx !== idx) {
                    reorderSubscriptions(draggedSubIdx, idx);
                  }
                  setDraggedSubIdx(null);
                }}
                onDragEnd={() => setDraggedSubIdx(null)}
                className={`p-4 bg-white dark:bg-slate-900 transition-all flex items-center justify-between ${
                  isEditingSubs ? 'cursor-move select-none' : ''
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {isEditingSubs && (
                    <div className="text-slate-400 dark:text-slate-500 cursor-grab active:cursor-grabbing p-1 flex-shrink-0">
                      <GripVertical className="w-4 h-4" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">{sub.name}</h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-slate-800 dark:text-white block">
                      {formatCurrency(monthlyCost)}{isYearly ? '/año' : '/mes'}
                    </span>
                  </div>

                  {isEditingSubs ? (
                    <button
                      onClick={() => {
                        setConfirmConfig({
                          isOpen: true,
                          title: 'Eliminar Suscripción',
                          message: `¿Estás seguro de eliminar "${sub.name}"?`,
                          confirmText: 'Sí, eliminar',
                          cancelText: 'Cancelar',
                          variant: 'danger',
                          onConfirm: () => deleteSubscription(sub.id)
                        });
                      }}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-300/80 dark:border-transparent transition-colors"
                      title="Eliminar suscripción"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => openEditSub(sub)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300/80 dark:border-transparent transition-colors"
                      title="Editar suscripción"
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

      {/* Modal: Crear / Editar Suscripción */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 pb-8 sm:p-6 flex justify-center items-start sm:items-center modal-backdrop-scroll">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp my-auto modal-card-scroll">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingSubObj ? 'Editar Suscripción' : 'Nueva Suscripción'}
              </h3>
              <button
                onClick={() => setShowSubModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSub} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nombre</label>
                <input
                  type="text"
                  value={subName}
                  onChange={e => setSubName(e.target.value)}
                  placeholder="Ej. Netflix, Spotify, iCloud"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Precio con Calculadora */}
              <AmountCalculatorInput
                label="Precio Total"
                value={subPrice}
                onChange={setSubPrice}
                placeholder="0"
                required
                title="Ajuste"
              />

              {/* Miembros / Personas */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Número de Personas (Dividir costo)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={subMembers}
                  onChange={e => setSubMembers(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Frecuencia: Mensual vs Anual */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Frecuencia de Cobro
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSubBilling('monthly')}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all ${
                      subBilling === 'monthly'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Mensual
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubBilling('yearly')}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all ${
                      subBilling === 'yearly'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Anual
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSubModal(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs py-3 rounded-2xl transition-colors border border-slate-300/80 dark:border-transparent text-center"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-2xl shadow-sm transition-all text-center"
                >
                  {editingSubObj ? 'Actualizar' : 'Guardar'}
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

      {/* Modal Informativo ! */}
      <InfoModal
        isOpen={!!infoModalTitle}
        title={infoModalTitle}
        onClose={() => setInfoModalTitle(null)}
      />
    </div>
  );
};
