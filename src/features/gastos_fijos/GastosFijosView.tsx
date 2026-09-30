import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { HousingExpense, ObligationItem, PaymentPeriod } from '../../models/finance';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { AmountCalculatorInput } from '../../components/ui/AmountCalculatorInput';
import {
  Home,
  Layers,
  Edit2,
  Plus,
  Trash2,
  X,
  Users,
  User,
  Calendar,
  Check,
  GripVertical
} from 'lucide-react';

export const GastosFijosView: React.FC<{ hideHeader?: boolean }> = ({ hideHeader = false }) => {
  const {
    data,
    summary,
    addHousingExpense,
    updateHousingExpense,
    deleteHousingExpense,
    reorderHousingExpenses,
    toggleHousingShared,
    addObligation,
    updateObligation,
    deleteObligation,
    reorderObligations,
    toggleObligationShared
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

  // Active people for dynamic proportional splits
  const activePeople = (data.people || []).filter(p => p.enabled);
  const totalCombinedIncome = activePeople.reduce((sum, p) => sum + (p.monthlyIncome || 0), 0);

  // Edit states
  const [isEditingHousing, setIsEditingHousing] = useState(false);
  const [isEditingObligations, setIsEditingObligations] = useState(false);
  const [draggedHousingIdx, setDraggedHousingIdx] = useState<number | null>(null);
  const [draggedObligationIdx, setDraggedObligationIdx] = useState<number | null>(null);

  // Modal: Housing
  const [showHousingModal, setShowHousingModal] = useState(false);
  const [editingHousingObj, setEditingHousingObj] = useState<HousingExpense | null>(null);
  const [housingName, setHousingName] = useState('');
  const [housingTotal, setHousingTotal] = useState('');
  const [housingPeriod, setHousingPeriod] = useState<PaymentPeriod>('1st_fortnight');

  // Modal: Obligation (Cuota Mensual + Total Deuda)
  const [showObligationModal, setShowObligationModal] = useState(false);
  const [editingObligationObj, setEditingObligationObj] = useState<ObligationItem | null>(null);
  const [obligationName, setObligationName] = useState('');
  const [obligationMonthlyPayment, setObligationMonthlyPayment] = useState('');
  const [obligationTotalDebt, setObligationTotalDebt] = useState('');
  const [obligationPeriod, setObligationPeriod] = useState<PaymentPeriod>('1st_fortnight');

  // Calculate ratio for a person
  const getPersonRatio = (personMonthlyIncome: number) => {
    if (activePeople.length <= 1) return 1.0;
    if (data.expenseSplitMethod === 'equal') {
      return 1.0 / activePeople.length;
    }
    if (data.expenseSplitMethod === 'equal_remaining') {
      const avg = totalCombinedIncome / activePeople.length;
      return totalCombinedIncome > 0
        ? Math.max(0, Math.min(1, 0.5 + (personMonthlyIncome - avg) / (totalCombinedIncome || 1)))
        : 1.0 / activePeople.length;
    }
    return totalCombinedIncome > 0 ? personMonthlyIncome / totalCombinedIncome : 1.0;
  };

  // Open Create Housing
  const openCreateHousing = () => {
    setEditingHousingObj(null);
    setHousingName('');
    setHousingTotal('');
    setHousingPeriod('1st_fortnight');
    setShowHousingModal(true);
  };

  // Open Edit Housing
  const openEditHousing = (h: HousingExpense) => {
    setEditingHousingObj(h);
    setHousingName(h.name);
    setHousingTotal(h.totalAmount.toString());
    setHousingPeriod(h.period);
    setShowHousingModal(true);
  };

  // Save Housing
  const handleSaveHousing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!housingName.trim()) return;
    const total = parseFloat(housingTotal) || 0;

    if (editingHousingObj) {
      updateHousingExpense(editingHousingObj.id, {
        name: housingName.trim(),
        totalAmount: total,
        period: housingPeriod,
        moneda: 'COP'
      });
    } else {
      addHousingExpense({
        name: housingName.trim(),
        totalAmount: total,
        period: housingPeriod,
        moneda: 'COP'
      });
    }
    setShowHousingModal(false);
    setEditingHousingObj(null);
  };

  // Delete Housing
  const handleDeleteHousing = () => {
    if (!editingHousingObj) return;
    setConfirmConfig({
      isOpen: true,
      title: 'Eliminar Gasto de Vivienda',
      message: `¿Estás seguro de eliminar el gasto "${editingHousingObj.name}"?`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
      onConfirm: () => {
        deleteHousingExpense(editingHousingObj.id);
        setShowHousingModal(false);
        setEditingHousingObj(null);
      }
    });
  };

  // Open Create Obligation
  const openCreateObligation = () => {
    setEditingObligationObj(null);
    setObligationName('');
    setObligationMonthlyPayment('');
    setObligationTotalDebt('');
    setObligationPeriod('1st_fortnight');
    setShowObligationModal(true);
  };

  // Open Edit Obligation
  const openEditObligation = (ob: ObligationItem) => {
    setEditingObligationObj(ob);
    setObligationName(ob.name);
    setObligationMonthlyPayment(ob.totalAmount.toString());
    setObligationTotalDebt(ob.totalDebtBalance !== undefined ? ob.totalDebtBalance.toString() : '');
    setObligationPeriod(ob.period);
    setShowObligationModal(true);
  };

  // Save Obligation
  const handleSaveObligation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obligationName.trim()) return;
    const monthlyVal = parseFloat(obligationMonthlyPayment) || 0;
    const debtVal = obligationTotalDebt ? parseFloat(obligationTotalDebt) : undefined;

    if (editingObligationObj) {
      updateObligation(editingObligationObj.id, {
        name: obligationName.trim(),
        totalAmount: monthlyVal,
        totalDebtBalance: debtVal,
        period: obligationPeriod,
        moneda: 'COP'
      });
    } else {
      addObligation({
        name: obligationName.trim(),
        totalAmount: monthlyVal,
        totalDebtBalance: debtVal,
        period: obligationPeriod,
        moneda: 'COP'
      });
    }
    setShowObligationModal(false);
    setEditingObligationObj(null);
  };

  // Delete Obligation
  const handleDeleteObligation = () => {
    if (!editingObligationObj) return;
    setConfirmConfig({
      isOpen: true,
      title: 'Eliminar Obligación',
      message: `¿Estás seguro de eliminar "${editingObligationObj.name}"?`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
      onConfirm: () => {
        deleteObligation(editingObligationObj.id);
        setShowObligationModal(false);
        setEditingObligationObj(null);
      }
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {!hideHeader && (
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Gastos Fijos
          </h2>
        </div>
      )}

      {/* SECCIÓN 1: VIVIENDA */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-4 bg-slate-100 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 flex items-center justify-center shadow-xs flex-shrink-0">
              <Home className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-slate-800 dark:text-white text-base tracking-wide uppercase">
              VIVIENDA
            </span>
          </div>

          {/* Botones de acción: Editar y Agregar (+) */}
          <div className="flex items-center gap-2">
            {(data.housingExpenses || []).length > 0 && (
              <button
                onClick={() => setIsEditingHousing(!isEditingHousing)}
                className={`p-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center shadow-sm ${
                  isEditingHousing
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300/80 dark:border-transparent'
                }`}
                title={isEditingHousing ? 'Listo' : 'Editar Vivienda'}
              >
                {isEditingHousing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={openCreateHousing}
              className="p-2 rounded-xl text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40 hover:bg-blue-200 transition-all flex items-center justify-center shadow-sm"
              title="Agregar Vivienda"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {(!data.housingExpenses || data.housingExpenses.length === 0) ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              No tienes gastos de vivienda registrados. Haz clic en <strong>+</strong> para registrar uno.
            </div>
          ) : (
            data.housingExpenses.map((item, idx) => {
              const isSharedItem = item.isShared !== false;

              return (
                <div
                  key={item.id}
                  draggable={isEditingHousing}
                  onDragStart={(e) => {
                    setDraggedHousingIdx(idx);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedHousingIdx !== null && draggedHousingIdx !== idx) {
                      reorderHousingExpenses(draggedHousingIdx, idx);
                    }
                    setDraggedHousingIdx(null);
                  }}
                  onDragEnd={() => setDraggedHousingIdx(null)}
                  className={`p-4 bg-white dark:bg-slate-900 transition-all flex flex-col gap-2 ${
                    isEditingHousing ? 'cursor-move select-none' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {isEditingHousing && (
                        <div className="text-slate-400 dark:text-slate-500 cursor-grab active:cursor-grabbing p-1 flex-shrink-0">
                          <GripVertical className="w-4 h-4" />
                        </div>
                      )}
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">{item.name}</h4>

                      <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap flex-shrink-0 border ${
                        item.period === '1st_fortnight'
                          ? 'bg-blue-100 dark:bg-blue-950/70 border-blue-300/60 dark:border-blue-800/40 text-blue-700 dark:text-blue-300'
                          : 'bg-amber-100 dark:bg-amber-950/70 border-amber-300/60 dark:border-amber-800/40 text-amber-700 dark:text-amber-300'
                      }`}>
                        {item.period === '1st_fortnight' ? '1Q' : '2Q'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white block">
                        {formatCurrency(item.totalAmount)}
                      </span>

                      {isEditingHousing ? (
                        <button
                          onClick={() => {
                            setConfirmConfig({
                              isOpen: true,
                              title: 'Eliminar Gasto de Vivienda',
                              message: `¿Estás seguro de eliminar el gasto "${item.name}"?`,
                              confirmText: 'Sí, eliminar',
                              cancelText: 'Cancelar',
                              variant: 'danger',
                              onConfirm: () => deleteHousingExpense(item.id)
                            });
                          }}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-300/80 dark:border-transparent transition-colors"
                          title="Eliminar gasto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {activePeople.length > 1 && (
                            <button
                              onClick={() => toggleHousingShared(item.id)}
                              className={`p-1.5 rounded-xl transition-all border ${
                                isSharedItem
                                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/40 shadow-sm'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-300/80 dark:border-transparent'
                              }`}
                              title={isSharedItem ? 'Gasto compartido entre personas' : 'Gasto individual (100% Yo)'}
                            >
                              <Users className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => openEditHousing(item)}
                            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300/80 dark:border-transparent transition-colors"
                            title="Editar gasto"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reparto proporcional en Malla 2x2 pegado al costado izquierdo */}
                  {activePeople.length > 1 && isSharedItem && (
                    <div className="grid grid-cols-2 gap-1.5 w-full pt-1">
                      {activePeople.map((p, pIdx) => {
                        const ratio = getPersonRatio(p.monthlyIncome);
                        const share = item.totalAmount * ratio;
                        return (
                          <div
                            key={p.name}
                            className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800"
                          >
                            <div className="flex-shrink-0 text-blue-600 dark:text-blue-400">
                              {pIdx === 0 ? <User className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                            </div>
                            <div className="flex flex-col leading-tight min-w-0 flex-1">
                              <span className="font-semibold text-slate-700 dark:text-slate-300 text-[10px] truncate">
                                {p.name}
                              </span>
                              <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px]">
                                {formatCurrency(share)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SECCIÓN 2: OBLIGACIONES */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-4 bg-slate-100 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 flex items-center justify-center shadow-xs flex-shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-slate-800 dark:text-white text-base tracking-wide uppercase">
              OBLIGACIONES
            </span>
          </div>

          {/* Botones de acción: Editar y Agregar (+) */}
          <div className="flex items-center gap-2">
            {(data.obligations || []).length > 0 && (
              <button
                onClick={() => setIsEditingObligations(!isEditingObligations)}
                className={`p-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center shadow-sm ${
                  isEditingObligations
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300/80 dark:border-transparent'
                }`}
                title={isEditingObligations ? 'Listo' : 'Editar Obligaciones'}
              >
                {isEditingObligations ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={openCreateObligation}
              className="p-2 rounded-xl text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40 hover:bg-blue-200 transition-all flex items-center justify-center shadow-sm"
              title="Agregar Obligación"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {(!data.obligations || data.obligations.length === 0) ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              No tienes obligaciones registradas. Haz clic en <strong>+</strong> para registrar una.
            </div>
          ) : (
            data.obligations.map((ob, idx) => {
              const monthlyPayment = ob.davidAmount !== undefined && ob.davidAmount !== ob.totalAmount && ob.totalDebtBalance
                ? ob.davidAmount
                : ob.totalAmount;
              const isSharedOb = ob.isShared !== false;

              return (
                <div
                  key={ob.id}
                  draggable={isEditingObligations}
                  onDragStart={(e) => {
                    setDraggedObligationIdx(idx);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedObligationIdx !== null && draggedObligationIdx !== idx) {
                      reorderObligations(draggedObligationIdx, idx);
                    }
                    setDraggedObligationIdx(null);
                  }}
                  onDragEnd={() => setDraggedObligationIdx(null)}
                  className={`p-4 bg-white dark:bg-slate-900 transition-all flex flex-col gap-2 ${
                    isEditingObligations ? 'cursor-move select-none' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {isEditingObligations && (
                        <div className="text-slate-400 dark:text-slate-500 cursor-grab active:cursor-grabbing p-1 flex-shrink-0">
                          <GripVertical className="w-4 h-4" />
                        </div>
                      )}
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">{ob.name}</h4>

                      <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap flex-shrink-0 border ${
                        ob.period === '1st_fortnight'
                          ? 'bg-blue-100 dark:bg-blue-950/70 border-blue-300/60 dark:border-blue-800/40 text-blue-700 dark:text-blue-300'
                          : 'bg-amber-100 dark:bg-amber-950/70 border-amber-300/60 dark:border-amber-800/40 text-amber-700 dark:text-amber-300'
                      }`}>
                        {ob.period === '1st_fortnight' ? '1Q' : '2Q'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white block">
                        {formatCurrency(monthlyPayment)}
                      </span>

                      {isEditingObligations ? (
                        <button
                          onClick={() => {
                            setConfirmConfig({
                              isOpen: true,
                              title: 'Eliminar Obligación',
                              message: `¿Estás seguro de eliminar "${ob.name}"?`,
                              confirmText: 'Sí, eliminar',
                              cancelText: 'Cancelar',
                              variant: 'danger',
                              onConfirm: () => deleteObligation(ob.id)
                            });
                          }}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-300/80 dark:border-transparent transition-colors"
                          title="Eliminar obligación"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {activePeople.length > 1 && (
                            <button
                              onClick={() => toggleObligationShared(ob.id)}
                              className={`p-1.5 rounded-xl transition-all border ${
                                isSharedOb
                                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/40 shadow-sm'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-300/80 dark:border-transparent'
                              }`}
                              title={isSharedOb ? 'Obligación compartida entre personas' : 'Obligación individual (100% Yo)'}
                            >
                              <Users className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => openEditObligation(ob)}
                            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300/80 dark:border-transparent transition-colors"
                            title="Editar obligación"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reparto proporcional en Malla 2x2 pegado al costado izquierdo */}
                  {activePeople.length > 1 && isSharedOb && (
                    <div className="grid grid-cols-2 gap-1.5 w-full pt-1">
                      {activePeople.map((p, pIdx) => {
                        const ratio = getPersonRatio(p.monthlyIncome);
                        const share = monthlyPayment * ratio;
                        return (
                          <div
                            key={p.name}
                            className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800"
                          >
                            <div className="flex-shrink-0 text-blue-600 dark:text-blue-400">
                              {pIdx === 0 ? <User className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                            </div>
                            <div className="flex flex-col leading-tight min-w-0 flex-1">
                              <span className="font-semibold text-slate-700 dark:text-slate-300 text-[10px] truncate">
                                {p.name}
                              </span>
                              <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px]">
                                {formatCurrency(share)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal: Crear / Editar Vivienda */}
      {showHousingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingHousingObj ? 'Editar Gasto de Vivienda' : 'Nuevo Gasto de Vivienda'}
              </h3>
              <button
                onClick={() => setShowHousingModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveHousing} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nombre</label>
                <input
                  type="text"
                  value={housingName}
                  onChange={e => setHousingName(e.target.value)}
                  placeholder="Ej. Gasto 1, Arriendo, Servicio"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Valor Mensual con Calculadora */}
              <AmountCalculatorInput
                label="Valor Mensual"
                value={housingTotal}
                onChange={setHousingTotal}
                placeholder="0"
                required
                title="Ajustar Monto"
              />

              {/* Quincena de Pago */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Periodo de Pago
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setHousingPeriod('1st_fortnight')}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all ${
                      housingPeriod === '1st_fortnight'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    1ª Quincena
                  </button>

                  <button
                    type="button"
                    onClick={() => setHousingPeriod('2nd_fortnight')}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all ${
                      housingPeriod === '2nd_fortnight'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    2ª Quincena
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowHousingModal(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs py-3 rounded-2xl transition-colors border border-slate-300/80 dark:border-transparent text-center"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-2xl shadow-sm transition-all text-center"
                >
                  {editingHousingObj ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Crear / Editar Obligación (Cuota Mensual + Total Deuda) */}
      {showObligationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingObligationObj ? 'Editar Obligación' : 'Nueva Obligación'}
              </h3>
              <button
                onClick={() => setShowObligationModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveObligation} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nombre</label>
                <input
                  type="text"
                  value={obligationName}
                  onChange={e => setObligationName(e.target.value)}
                  placeholder="Ej. Obligación 1, Crédito, Cuota mensual"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Cuota con Calculadora */}
              <AmountCalculatorInput
                label="Cuota Mensual"
                value={obligationMonthlyPayment}
                onChange={setObligationMonthlyPayment}
                placeholder="0"
                required
                title="Ajustar Cuota"
              />

              {/* Quincena de Pago */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Periodo de Pago
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setObligationPeriod('1st_fortnight')}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all ${
                      obligationPeriod === '1st_fortnight'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    1ª Quincena
                  </button>

                  <button
                    type="button"
                    onClick={() => setObligationPeriod('2nd_fortnight')}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all ${
                      obligationPeriod === '2nd_fortnight'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    2ª Quincena
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowObligationModal(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs py-3 rounded-2xl transition-colors border border-slate-300/80 dark:border-transparent text-center"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-2xl shadow-sm transition-all text-center"
                >
                  {editingObligationObj ? 'Actualizar' : 'Guardar'}
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
