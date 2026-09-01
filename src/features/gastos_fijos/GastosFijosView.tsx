import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, calculateSubscriptionMonthlyCost } from '../../services/financeCalculations';
import { HousingExpense, ObligationItem, SubscriptionItem, PaymentPeriod } from '../../models/finance';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { AmountCalculatorInput } from '../../components/ui/AmountCalculatorInput';
import {
  Home,
  Edit2,
  Plus,
  Trash2,
  X,
  GripVertical,
  Users,
  User,
  Calendar
} from 'lucide-react';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const GastosFijosView: React.FC<{ hideHeader?: boolean }> = ({ hideHeader = false }) => {
  const {
    data,
    summary,
    addHousingExpense,
    updateHousingExpense,
    deleteHousingExpense,
    moveHousingExpense,
    toggleHousingShared,
    addObligation,
    updateObligation,
    deleteObligation,
    moveObligation,
    toggleObligationShared,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    moveSubscription
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

  // Drag states
  const [draggedHousingIdx, setDraggedHousingIdx] = useState<number | null>(null);
  const [draggedObligationIdx, setDraggedObligationIdx] = useState<number | null>(null);
  const [draggedSubIdx, setDraggedSubIdx] = useState<number | null>(null);

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

  // Modal: Subscription
  const [showSubModal, setShowSubModal] = useState(false);
  const [editingSubObj, setEditingSubObj] = useState<SubscriptionItem | null>(null);
  const [subName, setSubName] = useState('');
  const [subPrice, setSubPrice] = useState('');
  const [subBilling, setSubBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [subMembers, setSubMembers] = useState('1');
  const [subPeriod, setSubPeriod] = useState<PaymentPeriod>('1st_fortnight');
  const [subMonth, setSubMonth] = useState('Enero');

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

  // Open Create Subscription
  const openCreateSub = () => {
    setEditingSubObj(null);
    setSubName('');
    setSubPrice('');
    setSubBilling('monthly');
    setSubMembers('1');
    setSubPeriod('1st_fortnight');
    setSubMonth('Enero');
    setShowSubModal(true);
  };

  // Open Edit Subscription
  const openEditSub = (sub: SubscriptionItem) => {
    setEditingSubObj(sub);
    setSubName(sub.name);
    setSubPrice(sub.totalPrice.toString());
    setSubBilling(sub.billing);
    setSubMembers((sub.members || 1).toString());
    setSubPeriod(sub.period || '1st_fortnight');
    setSubMonth(sub.billingMonth || 'Enero');
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
        period: subBilling === 'monthly' ? subPeriod : undefined,
        billingMonth: subBilling === 'yearly' ? subMonth : undefined,
        moneda: 'COP'
      });
    } else {
      addSubscription({
        name: subName.trim(),
        totalPrice: price,
        members,
        billing: subBilling,
        period: subBilling === 'monthly' ? subPeriod : undefined,
        billingMonth: subBilling === 'yearly' ? subMonth : undefined,
        moneda: 'COP'
      });
    }
    setShowSubModal(false);
    setEditingSubObj(null);
  };

  // Delete Subscription
  const handleDeleteSub = () => {
    if (!editingSubObj) return;
    setConfirmConfig({
      isOpen: true,
      title: 'Eliminar Suscripción',
      message: `¿Estás seguro de eliminar la suscripción "${editingSubObj.name}"?`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
      onConfirm: () => {
        deleteSubscription(editingSubObj.id);
        setShowSubModal(false);
        setEditingSubObj(null);
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
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">Vivienda</h3>

          {/* Botón directo de Agregar */}
          <button
            onClick={openCreateHousing}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40 hover:bg-blue-200 transition-all flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar
          </button>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {(!data.housingExpenses || data.housingExpenses.length === 0) ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              No tienes gastos de vivienda registrados. Haz clic en <strong>Agregar</strong> para registrar uno.
            </div>
          ) : (
            data.housingExpenses.map((item, idx) => {
            const isDragging = draggedHousingIdx === idx;
            const isSharedItem = item.isShared !== false;

            return (
              <div
                key={item.id}
                draggable
                onDragStart={() => setDraggedHousingIdx(idx)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => {
                  if (draggedHousingIdx !== null && draggedHousingIdx !== idx) {
                    const diff = idx - draggedHousingIdx;
                    if (diff > 0) {
                      for (let i = draggedHousingIdx; i < idx; i++) moveHousingExpense(i, 'down');
                    } else {
                      for (let i = draggedHousingIdx; i > idx; i--) moveHousingExpense(i, 'up');
                    }
                  }
                  setDraggedHousingIdx(null);
                }}
                onDragEnd={() => setDraggedHousingIdx(null)}
                className={`p-4 bg-white dark:bg-slate-900 transition-all flex items-center justify-between cursor-grab active:cursor-grabbing ${
                  isDragging ? 'opacity-40 scale-[0.99]' : ''
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 cursor-grab active:cursor-grabbing flex-shrink-0 mt-0.5">
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.name}</h4>
                    </div>

                    {/* Reparto proporcional en Malla 2x2 */}
                    {activePeople.length > 1 && isSharedItem && (
                      <div className="grid grid-cols-2 gap-1.5 mt-2 text-[11px] w-full">
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
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="font-mono font-bold text-sm text-slate-900 dark:text-white block">
                    {formatCurrency(item.totalAmount)}{item.period === '1st_fortnight' ? '/1Q' : '/2Q'}
                  </span>

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
                </div>
              </div>
            );
          })
        )}
        </div>
      </div>

      {/* SECCIÓN 2: OBLIGACIONES */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">Obligaciones</h3>

          {/* Botón directo de Agregar */}
          <button
            onClick={openCreateObligation}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40 hover:bg-blue-200 transition-all flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar
          </button>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {(!data.obligations || data.obligations.length === 0) ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              No tienes obligaciones registradas. Haz clic en <strong>Agregar</strong> para registrar una.
            </div>
          ) : (
            data.obligations.map((ob, idx) => {
            const isDragging = draggedObligationIdx === idx;
            const monthlyPayment = ob.davidAmount !== undefined && ob.davidAmount !== ob.totalAmount && ob.totalDebtBalance
              ? ob.davidAmount
              : ob.totalAmount;
            const totalDebt = ob.totalDebtBalance || (ob.name.toLowerCase().includes('icetex') ? 3471648 : ob.totalAmount);
            const isSharedOb = ob.isShared !== false;

            return (
              <div
                key={ob.id}
                draggable
                onDragStart={() => setDraggedObligationIdx(idx)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => {
                  if (draggedObligationIdx !== null && draggedObligationIdx !== idx) {
                    const diff = idx - draggedObligationIdx;
                    if (diff > 0) {
                      for (let i = draggedObligationIdx; i < idx; i++) moveObligation(i, 'down');
                    } else {
                      for (let i = draggedObligationIdx; i > idx; i--) moveObligation(i, 'up');
                    }
                  }
                  setDraggedObligationIdx(null);
                }}
                onDragEnd={() => setDraggedObligationIdx(null)}
                className={`p-4 bg-white dark:bg-slate-900 transition-all flex items-center justify-between cursor-grab active:cursor-grabbing ${
                  isDragging ? 'opacity-40 scale-[0.99]' : ''
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 cursor-grab active:cursor-grabbing flex-shrink-0 mt-0.5">
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Nombre y al frente el valor de la cuota mensual sin paréntesis */}
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{ob.name}</h4>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                        {formatCurrency(monthlyPayment)}/mes
                      </span>
                    </div>

                    {/* Reparto proporcional en Malla 2x2 */}
                    {activePeople.length > 1 && isSharedOb && (
                      <div className="grid grid-cols-2 gap-1.5 mt-2 text-[11px] w-full">
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
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="font-mono font-bold text-sm text-slate-900 dark:text-white block">
                    {formatCurrency(totalDebt)}{ob.period === '1st_fortnight' ? '/1Q' : '/2Q'}
                  </span>

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
                </div>
              </div>
            );
          })
        )}
        </div>
      </div>

      {/* SECCIÓN 3: SUSCRIPCIONES */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">
            Suscripciones
          </h3>

          {/* Botón directo de Agregar */}
          <button
            onClick={openCreateSub}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40 hover:bg-blue-200 transition-all flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar
          </button>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {(!data.subscriptions || data.subscriptions.length === 0) ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              No tienes suscripciones registradas. Haz clic en <strong>Agregar</strong> para registrar una.
            </div>
          ) : (
            data.subscriptions.map((sub, idx) => {
            const monthlyCost = calculateSubscriptionMonthlyCost(sub);
            const isDragging = draggedSubIdx === idx;
            const isYearly = sub.billing === 'yearly';

            return (
              <div
                key={sub.id}
                draggable
                onDragStart={() => setDraggedSubIdx(idx)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => {
                  if (draggedSubIdx !== null && draggedSubIdx !== idx) {
                    const diff = idx - draggedSubIdx;
                    if (diff > 0) {
                      for (let i = draggedSubIdx; i < idx; i++) moveSubscription(i, 'down');
                    } else {
                      for (let i = draggedSubIdx; i > idx; i--) moveSubscription(i, 'up');
                    }
                  }
                  setDraggedSubIdx(null);
                }}
                onDragEnd={() => setDraggedSubIdx(null)}
                className={`p-4 bg-white dark:bg-slate-900 transition-all flex items-center justify-between cursor-grab active:cursor-grabbing ${
                  isDragging ? 'opacity-40 scale-[0.99]' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 cursor-grab active:cursor-grabbing flex-shrink-0">
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>

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

                  <button
                    onClick={() => openEditSub(sub)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300/80 dark:border-transparent transition-colors"
                    title="Editar suscripción"
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

              {/* Valor Total con Calculadora */}
              <AmountCalculatorInput
                label="Valor Total"
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
                {editingHousingObj && (
                  <button
                    type="button"
                    onClick={handleDeleteHousing}
                    className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 transition-colors flex items-center justify-center"
                    title="Eliminar este gasto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

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

              {/* Cuota Mensual con Calculadora */}
              <AmountCalculatorInput
                label="Cuota Mensual"
                value={obligationMonthlyPayment}
                onChange={setObligationMonthlyPayment}
                placeholder="0"
                required
                title="Ajustar Cuota Mensual"
              />

              {/* Total Deuda con Calculadora */}
              <AmountCalculatorInput
                label="Total Deuda (Saldo Pendiente)"
                value={obligationTotalDebt}
                onChange={setObligationTotalDebt}
                placeholder="0 (Saldo total que resta por pagar)"
                title="Ajustar Total Deuda"
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
                {editingObligationObj && (
                  <button
                    type="button"
                    onClick={handleDeleteObligation}
                    className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 transition-colors flex items-center justify-center"
                    title="Eliminar esta obligación"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

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

      {/* Modal: Crear / Editar Suscripción */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto my-auto">
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
                  placeholder="Ej. Suscripción 1, Membresía, Servicio digital"
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
                title="Ajustar Precio"
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
                {editingSubObj && (
                  <button
                    type="button"
                    onClick={handleDeleteSub}
                    className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 transition-colors flex items-center justify-center"
                    title="Eliminar esta suscripción"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

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
    </div>
  );
};
