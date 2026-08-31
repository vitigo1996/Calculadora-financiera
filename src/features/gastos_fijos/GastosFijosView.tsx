import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, calculateSubscriptionMonthlyCost, convertToBase } from '../../services/financeCalculations';
import { HousingExpense, ObligationItem, SubscriptionItem, PaymentPeriod } from '../../models/finance';
import {
  Home,
  Sparkles,
  Edit2,
  Plus,
  Minus,
  Trash2,
  X,
  Calculator,
  GripVertical,
  Users,
  User,
  Calendar
} from 'lucide-react';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const GastosFijosView: React.FC = () => {
  const {
    data,
    summary,
    baseCurrency,
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

  const dolarRate = data.dolarRate || 3600;

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
  const [housingCurrency, setHousingCurrency] = useState<'COP' | 'USD'>('COP');
  const [housingPeriod, setHousingPeriod] = useState<PaymentPeriod>('1st_fortnight');
  const [showHousingCalc, setShowHousingCalc] = useState(false);
  const [housingCalcDelta, setHousingCalcDelta] = useState('');

  // Modal: Obligation (Cuota Mensual + Total Deuda)
  const [showObligationModal, setShowObligationModal] = useState(false);
  const [editingObligationObj, setEditingObligationObj] = useState<ObligationItem | null>(null);
  const [obligationName, setObligationName] = useState('');
  const [obligationMonthlyPayment, setObligationMonthlyPayment] = useState('');
  const [obligationTotalDebt, setObligationTotalDebt] = useState('');
  const [obligationCurrency, setObligationCurrency] = useState<'COP' | 'USD'>('COP');
  const [obligationPeriod, setObligationPeriod] = useState<PaymentPeriod>('1st_fortnight');
  const [showObligationMonthlyCalc, setShowObligationMonthlyCalc] = useState(false);
  const [obligationMonthlyCalcDelta, setObligationMonthlyCalcDelta] = useState('');
  const [showObligationDebtCalc, setShowObligationDebtCalc] = useState(false);
  const [obligationDebtCalcDelta, setObligationDebtCalcDelta] = useState('');

  // Modal: Subscription
  const [showSubModal, setShowSubModal] = useState(false);
  const [editingSubObj, setEditingSubObj] = useState<SubscriptionItem | null>(null);
  const [subName, setSubName] = useState('');
  const [subPrice, setSubPrice] = useState('');
  const [subCurrency, setSubCurrency] = useState<'COP' | 'USD'>('COP');
  const [subBilling, setSubBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [subMembers, setSubMembers] = useState('1');
  const [subPeriod, setSubPeriod] = useState<PaymentPeriod>('1st_fortnight');
  const [subMonth, setSubMonth] = useState('Enero');
  const [showSubCalc, setShowSubCalc] = useState(false);
  const [subCalcDelta, setSubCalcDelta] = useState('');

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
    setHousingCurrency(baseCurrency);
    setHousingPeriod('1st_fortnight');
    setHousingCalcDelta('');
    setShowHousingCalc(false);
    setShowHousingModal(true);
  };

  // Open Edit Housing
  const openEditHousing = (h: HousingExpense) => {
    setEditingHousingObj(h);
    setHousingName(h.name);
    setHousingTotal(h.totalAmount.toString());
    setHousingCurrency(h.moneda || 'COP');
    setHousingPeriod(h.period);
    setHousingCalcDelta('');
    setShowHousingCalc(false);
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
        moneda: housingCurrency,
        period: housingPeriod
      });
    } else {
      addHousingExpense({
        name: housingName.trim(),
        totalAmount: total,
        moneda: housingCurrency,
        period: housingPeriod
      });
    }
    setShowHousingModal(false);
    setEditingHousingObj(null);
  };

  // Delete Housing
  const handleDeleteHousing = () => {
    if (!editingHousingObj) return;
    if (confirm(`¿Eliminar gasto de vivienda "${editingHousingObj.name}"?`)) {
      deleteHousingExpense(editingHousingObj.id);
      setShowHousingModal(false);
      setEditingHousingObj(null);
    }
  };

  // Open Create Obligation
  const openCreateObligation = () => {
    setEditingObligationObj(null);
    setObligationName('');
    setObligationMonthlyPayment('');
    setObligationTotalDebt('');
    setObligationCurrency(baseCurrency);
    setObligationPeriod('1st_fortnight');
    setObligationMonthlyCalcDelta('');
    setShowObligationMonthlyCalc(false);
    setObligationDebtCalcDelta('');
    setShowObligationDebtCalc(false);
    setShowObligationModal(true);
  };

  // Open Edit Obligation
  const openEditObligation = (ob: ObligationItem) => {
    setEditingObligationObj(ob);
    setObligationName(ob.name);
    const monthlyVal = ob.davidAmount !== undefined && ob.davidAmount !== ob.totalAmount && ob.totalDebtBalance
      ? ob.davidAmount
      : ob.totalAmount;
    setObligationMonthlyPayment(monthlyVal.toString());

    const debtVal = ob.totalDebtBalance !== undefined
      ? ob.totalDebtBalance
      : (ob.name.toLowerCase().includes('icetex') ? 3471648 : ob.totalAmount);
    setObligationTotalDebt(debtVal ? debtVal.toString() : '');

    setObligationCurrency(ob.moneda || 'COP');
    setObligationPeriod(ob.period);
    setObligationMonthlyCalcDelta('');
    setShowObligationMonthlyCalc(false);
    setObligationDebtCalcDelta('');
    setShowObligationDebtCalc(false);
    setShowObligationModal(true);
  };

  // Save Obligation (Cuota Mensual + Total Deuda)
  const handleSaveObligation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obligationName.trim()) return;
    const monthlyVal = parseFloat(obligationMonthlyPayment) || 0;
    const totalDebtVal = parseFloat(obligationTotalDebt) || 0;

    if (editingObligationObj) {
      updateObligation(editingObligationObj.id, {
        name: obligationName.trim(),
        totalAmount: monthlyVal,
        davidAmount: monthlyVal,
        totalDebtBalance: totalDebtVal > 0 ? totalDebtVal : undefined,
        moneda: obligationCurrency,
        period: obligationPeriod
      });
    } else {
      addObligation({
        name: obligationName.trim(),
        totalAmount: monthlyVal,
        totalDebtBalance: totalDebtVal > 0 ? totalDebtVal : undefined,
        moneda: obligationCurrency,
        period: obligationPeriod
      });
    }
    setShowObligationModal(false);
    setEditingObligationObj(null);
  };

  // Delete Obligation
  const handleDeleteObligation = () => {
    if (!editingObligationObj) return;
    if (confirm(`¿Eliminar obligación "${editingObligationObj.name}"?`)) {
      deleteObligation(editingObligationObj.id);
      setShowObligationModal(false);
      setEditingObligationObj(null);
    }
  };

  // Open Create Subscription
  const openCreateSub = () => {
    setEditingSubObj(null);
    setSubName('');
    setSubPrice('');
    setSubCurrency(baseCurrency);
    setSubBilling('monthly');
    setSubMembers('1');
    setSubPeriod('1st_fortnight');
    setSubMonth('Enero');
    setSubCalcDelta('');
    setShowSubCalc(false);
    setShowSubModal(true);
  };

  // Open Edit Subscription
  const openEditSub = (sub: SubscriptionItem) => {
    setEditingSubObj(sub);
    setSubName(sub.name);
    setSubPrice(sub.totalPrice.toString());
    setSubCurrency(sub.moneda || 'COP');
    setSubBilling(sub.billing);
    setSubMembers(sub.members.toString());
    setSubPeriod(sub.period || '1st_fortnight');
    setSubMonth(sub.billingMonth || 'Enero');
    setSubCalcDelta('');
    setShowSubCalc(false);
    setShowSubModal(true);
  };

  // Save Subscription
  const handleSaveSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) return;
    const price = parseFloat(subPrice) || 0;
    const members = parseInt(subMembers) || 1;

    if (editingSubObj) {
      updateSubscription(editingSubObj.id, {
        name: subName.trim(),
        totalPrice: price,
        moneda: subCurrency,
        billing: subBilling,
        members,
        period: subBilling === 'yearly' ? undefined : subPeriod,
        billingMonth: subBilling === 'yearly' ? subMonth : undefined
      });
    } else {
      addSubscription({
        name: subName.trim(),
        totalPrice: price,
        moneda: subCurrency,
        billing: subBilling,
        members,
        period: subBilling === 'yearly' ? undefined : subPeriod,
        billingMonth: subBilling === 'yearly' ? subMonth : undefined
      });
    }
    setShowSubModal(false);
    setEditingSubObj(null);
  };

  // Delete Subscription
  const handleDeleteSub = () => {
    if (!editingSubObj) return;
    if (confirm(`¿Eliminar suscripción "${editingSubObj.name}"?`)) {
      deleteSubscription(editingSubObj.id);
      setShowSubModal(false);
      setEditingSubObj(null);
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Home className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Gastos
        </h2>
      </div>

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
          {data.housingExpenses.map((item, idx) => {
            const isDragging = draggedHousingIdx === idx;
            const isSharedItem = item.isShared !== false;
            const itemMoneda = item.moneda || 'COP';
            const isDiff = itemMoneda !== baseCurrency;
            const equivalentInBase = convertToBase(item.totalAmount, itemMoneda, baseCurrency, dolarRate);

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
                  isDragging ? 'opacity-40 scale-[0.99]' : 'hover:bg-slate-50/70 dark:hover:bg-slate-850/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>

                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-blue-100 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 whitespace-nowrap">
                    {item.period === '1st_fortnight' ? '1ª Quincena' : '2ª Quincena'}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.name}</h4>
                      {isDiff && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300">
                          {itemMoneda}
                        </span>
                      )}
                    </div>
                    {/* Reparto proporcional */}
                    {activePeople.length > 1 && isSharedItem && (
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        {activePeople.map((p, pIdx) => {
                          const ratio = getPersonRatio(p.monthlyIncome);
                          const share = item.totalAmount * ratio;
                          return (
                            <span key={p.id || pIdx}>
                              {pIdx > 0 && <span className="mr-2 opacity-40">•</span>}
                              <strong className={pIdx === 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}>
                                {p.name}:
                              </strong>{' '}
                              {formatCurrency(share, itemMoneda)}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-slate-800 dark:text-white block">
                      {formatCurrency(item.totalAmount, itemMoneda)}
                    </span>
                    {isDiff && (
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block">
                        (≈ {formatCurrency(equivalentInBase, baseCurrency)})
                      </span>
                    )}
                  </div>

                  {/* Botón de toggle Compartido / Individual */}
                  {activePeople.length > 1 && (
                    <button
                      onClick={() => toggleHousingShared(item.id)}
                      className={`p-2 rounded-xl border transition-all ${
                        isSharedItem
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/40 hover:bg-blue-100'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-300/80 dark:border-transparent hover:bg-slate-200'
                      }`}
                      title={isSharedItem ? 'Gasto Compartido activo (clic para hacer individual)' : 'Gasto Individual (clic para compartir)'}
                    >
                      {isSharedItem ? <Users className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    </button>
                  )}

                  <button
                    onClick={() => openEditHousing(item)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300/80 dark:border-transparent transition-colors"
                    title="Editar gasto"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
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
          {data.obligations.map((ob, idx) => {
            const isDragging = draggedObligationIdx === idx;
            const monthlyPayment = ob.davidAmount !== undefined && ob.davidAmount !== ob.totalAmount && ob.totalDebtBalance
              ? ob.davidAmount
              : ob.totalAmount;
            const totalDebt = ob.totalDebtBalance || (ob.name.toLowerCase().includes('icetex') ? 3471648 : ob.totalAmount);
            const isSharedOb = ob.isShared !== false;
            const obMoneda = ob.moneda || 'COP';
            const isDiff = obMoneda !== baseCurrency;
            const debtInBase = convertToBase(totalDebt, obMoneda, baseCurrency, dolarRate);

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
                  isDragging ? 'opacity-40 scale-[0.99]' : 'hover:bg-slate-50/70 dark:hover:bg-slate-850/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>

                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-blue-100 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 whitespace-nowrap">
                    {ob.period === '1st_fortnight' ? '1ª Quincena' : '2ª Quincena'}
                  </span>

                  <div>
                    {/* Nombre y al frente el valor de la cuota mensual sin paréntesis */}
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{ob.name}</h4>
                      {isDiff && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300">
                          {obMoneda}
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                        {formatCurrency(monthlyPayment, obMoneda)}/mes
                      </span>
                    </div>

                    {/* Distribución proporcional debajo del nombre */}
                    {activePeople.length > 1 && isSharedOb && (
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        {activePeople.map((p, pIdx) => {
                          const ratio = getPersonRatio(p.monthlyIncome);
                          const share = monthlyPayment * ratio;
                          return (
                            <span key={p.id || pIdx}>
                              {pIdx > 0 && <span className="mr-2 opacity-40">•</span>}
                              <strong className={pIdx === 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}>
                                {p.name}:
                              </strong>{' '}
                              {formatCurrency(share, obMoneda)}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Total de la deuda a la derecha */}
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-slate-800 dark:text-white block">
                      {formatCurrency(totalDebt, obMoneda)}
                    </span>
                    {isDiff && (
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block">
                        (≈ {formatCurrency(debtInBase, baseCurrency)})
                      </span>
                    )}
                  </div>

                  {/* Botón de toggle Compartido / Individual */}
                  {activePeople.length > 1 && (
                    <button
                      onClick={() => toggleObligationShared(ob.id)}
                      className={`p-2 rounded-xl border transition-all ${
                        isSharedOb
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/40 hover:bg-blue-100'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-300/80 dark:border-transparent hover:bg-slate-200'
                      }`}
                      title={isSharedOb ? 'Gasto Compartido activo (clic para hacer individual)' : 'Gasto Individual (clic para compartir)'}
                    >
                      {isSharedOb ? <Users className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    </button>
                  )}

                  <button
                    onClick={() => openEditObligation(ob)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300/80 dark:border-transparent transition-colors"
                    title="Editar obligación"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN 3: SUSCRIPCIONES */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Suscripciones
          </h3>

          {/* Botón Agregar a la izquierda y Total a su derecha */}
          <div className="flex items-center gap-3">
            <button
              onClick={openCreateSub}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40 hover:bg-blue-200 transition-all flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar
            </button>

            <span className="text-xs text-slate-500 dark:text-slate-400">
              Total: <strong className="text-blue-600 dark:text-blue-400 font-mono font-bold">{formatCurrency(summary.suscripciones.totalMonthly, baseCurrency)}</strong>
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {data.subscriptions.map((sub, idx) => {
            const monthlyCost = calculateSubscriptionMonthlyCost(sub);
            const isDragging = draggedSubIdx === idx;
            const isYearly = sub.billing === 'yearly';
            const subMoneda = sub.moneda || 'COP';
            const isDiff = subMoneda !== baseCurrency;
            const costInBase = convertToBase(monthlyCost, subMoneda, baseCurrency, dolarRate);

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
                  isDragging ? 'opacity-40 scale-[0.99]' : 'hover:bg-slate-50/70 dark:hover:bg-slate-850/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>

                  {/* Quincena si es mensual, o Mes si es anual */}
                  {isYearly ? (
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800/40 text-amber-700 dark:text-amber-300 whitespace-nowrap flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {sub.billingMonth || 'Anual'}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-blue-100 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 whitespace-nowrap">
                      {sub.period === '2nd_fortnight' ? '2ª Quincena' : '1ª Quincena'}
                    </span>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{sub.name}</h4>
                      {isDiff && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300">
                          {subMoneda}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isYearly ? 'Anual' : 'Mensual'}
                      {sub.members > 1 && ` • ${sub.members} personas`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-slate-800 dark:text-white block">
                      {formatCurrency(monthlyCost, subMoneda)}
                    </span>
                    {isDiff && (
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block">
                        (≈ {formatCurrency(costInBase, baseCurrency)})
                      </span>
                    )}
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
          })}
        </div>
      </div>

      {/* Modal: Crear / Editar Vivienda */}
      {showHousingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
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
                  placeholder="Ej. Arriendo, Servicios Públicos, Internet"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Selector de Moneda */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Moneda</label>
                <select
                  value={housingCurrency}
                  onChange={e => setHousingCurrency(e.target.value as 'COP' | 'USD')}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="COP">Pesos (COP)</option>
                  <option value="USD">Dólares (USD)</option>
                </select>
              </div>

              {/* Valor Total con Calculadora */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Valor Total
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={housingTotal}
                    onChange={e => setHousingTotal(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl pl-3.5 pr-11 py-2.5 text-sm text-slate-800 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowHousingCalc(!showHousingCalc)}
                    title="Calculadora (+ / -)"
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-all ${
                      showHousingCalc
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Calculator className="w-4 h-4" />
                  </button>

                  {/* Pop-up Calculadora */}
                  {showHousingCalc && (
                    <div className="absolute right-0 top-full mt-2 z-30 p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-xl space-y-2.5 w-64 animate-scaleUp">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Ajustar Monto
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowHousingCalc(false)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="number"
                        step="any"
                        value={housingCalcDelta}
                        onChange={e => setHousingCalcDelta(e.target.value)}
                        placeholder="Valor a sumar o restar..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs px-2.5 py-1.5 rounded-xl text-slate-800 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                        autoFocus
                      />

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const delta = parseFloat(housingCalcDelta);
                            if (!isNaN(delta) && delta > 0) {
                              const curr = parseFloat(housingTotal) || 0;
                              setHousingTotal((curr + delta).toString());
                            }
                            setHousingCalcDelta('');
                            setShowHousingCalc(false);
                          }}
                          className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> Sumar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const delta = parseFloat(housingCalcDelta);
                            if (!isNaN(delta) && delta > 0) {
                              const curr = parseFloat(housingTotal) || 0;
                              setHousingTotal(Math.max(0, curr - delta).toString());
                            }
                            setHousingCalcDelta('');
                            setShowHousingCalc(false);
                          }}
                          className="flex-1 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" /> Restar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quincena */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Quincena de Pago
                </label>
                <select
                  value={housingPeriod}
                  onChange={e => setHousingPeriod(e.target.value as PaymentPeriod)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="1st_fortnight">1ª Quincena (Mitad de mes)</option>
                  <option value="2nd_fortnight">2ª Quincena (Fin de mes)</option>
                </select>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
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
                  placeholder="Ej. Cuota Carro, Crédito Icetex"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Selector de Moneda */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Moneda</label>
                <select
                  value={obligationCurrency}
                  onChange={e => setObligationCurrency(e.target.value as 'COP' | 'USD')}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="COP">Pesos (COP)</option>
                  <option value="USD">Dólares (USD)</option>
                </select>
              </div>

              {/* Cuota Mensual con Calculadora */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Cuota Mensual
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={obligationMonthlyPayment}
                    onChange={e => setObligationMonthlyPayment(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl pl-3.5 pr-11 py-2.5 text-sm text-slate-800 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowObligationMonthlyCalc(!showObligationMonthlyCalc)}
                    title="Calculadora (+ / -)"
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-all ${
                      showObligationMonthlyCalc
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Calculator className="w-4 h-4" />
                  </button>

                  {/* Pop-up Calculadora Cuota Mensual */}
                  {showObligationMonthlyCalc && (
                    <div className="absolute right-0 top-full mt-2 z-30 p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-xl space-y-2.5 w-64 animate-scaleUp">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Ajustar Cuota
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowObligationMonthlyCalc(false)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="number"
                        step="any"
                        value={obligationMonthlyCalcDelta}
                        onChange={e => setObligationMonthlyCalcDelta(e.target.value)}
                        placeholder="Valor a sumar o restar..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs px-2.5 py-1.5 rounded-xl text-slate-800 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                        autoFocus
                      />

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const delta = parseFloat(obligationMonthlyCalcDelta);
                            if (!isNaN(delta) && delta > 0) {
                              const curr = parseFloat(obligationMonthlyPayment) || 0;
                              setObligationMonthlyPayment((curr + delta).toString());
                            }
                            setObligationMonthlyCalcDelta('');
                            setShowObligationMonthlyCalc(false);
                          }}
                          className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> Sumar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const delta = parseFloat(obligationMonthlyCalcDelta);
                            if (!isNaN(delta) && delta > 0) {
                              const curr = parseFloat(obligationMonthlyPayment) || 0;
                              setObligationMonthlyPayment(Math.max(0, curr - delta).toString());
                            }
                            setObligationMonthlyCalcDelta('');
                            setShowObligationMonthlyCalc(false);
                          }}
                          className="flex-1 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" /> Restar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Total de la Deuda con Calculadora */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Total de la Deuda <span className="text-[11px] font-normal text-slate-400">(Opcional)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={obligationTotalDebt}
                    onChange={e => setObligationTotalDebt(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl pl-3.5 pr-11 py-2.5 text-sm text-slate-800 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowObligationDebtCalc(!showObligationDebtCalc)}
                    title="Calculadora (+ / -)"
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-all ${
                      showObligationDebtCalc
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Calculator className="w-4 h-4" />
                  </button>

                  {/* Pop-up Calculadora Total Deuda */}
                  {showObligationDebtCalc && (
                    <div className="absolute right-0 top-full mt-2 z-30 p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-xl space-y-2.5 w-64 animate-scaleUp">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Ajustar Total Deuda
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowObligationDebtCalc(false)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="number"
                        step="any"
                        value={obligationDebtCalcDelta}
                        onChange={e => setObligationDebtCalcDelta(e.target.value)}
                        placeholder="Valor a sumar o restar..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs px-2.5 py-1.5 rounded-xl text-slate-800 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                        autoFocus
                      />

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const delta = parseFloat(obligationDebtCalcDelta);
                            if (!isNaN(delta) && delta > 0) {
                              const curr = parseFloat(obligationTotalDebt) || 0;
                              setObligationTotalDebt((curr + delta).toString());
                            }
                            setObligationDebtCalcDelta('');
                            setShowObligationDebtCalc(false);
                          }}
                          className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> Sumar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const delta = parseFloat(obligationDebtCalcDelta);
                            if (!isNaN(delta) && delta > 0) {
                              const curr = parseFloat(obligationTotalDebt) || 0;
                              setObligationTotalDebt(Math.max(0, curr - delta).toString());
                            }
                            setObligationDebtCalcDelta('');
                            setShowObligationDebtCalc(false);
                          }}
                          className="flex-1 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" /> Restar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quincena */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Quincena de Pago
                </label>
                <select
                  value={obligationPeriod}
                  onChange={e => setObligationPeriod(e.target.value as PaymentPeriod)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="1st_fortnight">1ª Quincena (Mitad de mes)</option>
                  <option value="2nd_fortnight">2ª Quincena (Fin de mes)</option>
                </select>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
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
                  placeholder="Ej. Netflix, Spotify, Gemini, ChatGPT"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Selector de Moneda */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Moneda</label>
                <select
                  value={subCurrency}
                  onChange={e => setSubCurrency(e.target.value as 'COP' | 'USD')}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="COP">Pesos (COP)</option>
                  <option value="USD">Dólares (USD)</option>
                </select>
              </div>

              {/* Precio con Calculadora */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Precio Total
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={subPrice}
                    onChange={e => setSubPrice(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl pl-3.5 pr-11 py-2.5 text-sm text-slate-800 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowSubCalc(!showSubCalc)}
                    title="Calculadora (+ / -)"
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-all ${
                      showSubCalc
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Calculator className="w-4 h-4" />
                  </button>

                  {/* Pop-up Calculadora */}
                  {showSubCalc && (
                    <div className="absolute right-0 top-full mt-2 z-30 p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-xl space-y-2.5 w-64 animate-scaleUp">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Ajustar Monto
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowSubCalc(false)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="number"
                        step="any"
                        value={subCalcDelta}
                        onChange={e => setSubCalcDelta(e.target.value)}
                        placeholder="Valor a sumar o restar..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs px-2.5 py-1.5 rounded-xl text-slate-800 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                        autoFocus
                      />

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const delta = parseFloat(subCalcDelta);
                            if (!isNaN(delta) && delta > 0) {
                              const curr = parseFloat(subPrice) || 0;
                              setSubPrice((curr + delta).toString());
                            }
                            setSubCalcDelta('');
                            setShowSubCalc(false);
                          }}
                          className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> Sumar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const delta = parseFloat(subCalcDelta);
                            if (!isNaN(delta) && delta > 0) {
                              const curr = parseFloat(subPrice) || 0;
                              setSubPrice(Math.max(0, curr - delta).toString());
                            }
                            setSubCalcDelta('');
                            setShowSubCalc(false);
                          }}
                          className="flex-1 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" /> Restar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Tipo de Cobro */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Frecuencia
                  </label>
                  <select
                    value={subBilling}
                    onChange={e => setSubBilling(e.target.value as 'monthly' | 'yearly')}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="monthly">Mensual</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>

                {/* Personas / Miembros */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Miembros
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={subMembers}
                    onChange={e => setSubMembers(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Quincena si es Mensual, o Selección de Mes si es Anual */}
              {subBilling === 'monthly' ? (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Quincena de Pago
                  </label>
                  <select
                    value={subPeriod}
                    onChange={e => setSubPeriod(e.target.value as PaymentPeriod)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="1st_fortnight">1ª Quincena (Mitad de mes)</option>
                    <option value="2nd_fortnight">2ª Quincena (Fin de mes)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Mes de Cobro / Renovación
                  </label>
                  <select
                    value={subMonth}
                    onChange={e => setSubMonth(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    {MONTHS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              )}

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
    </div>
  );
};
