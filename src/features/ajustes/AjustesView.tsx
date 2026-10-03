import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { formatCurrency } from '../../services/financeCalculations';
import { PersonProfile, ExpenseSplitMethod } from '../../models/finance';
import {
  User,
  Users,
  Sun,
  Moon,
  Coins,
  Sliders,
  Percent,
  RefreshCw
} from 'lucide-react';

export const AjustesView: React.FC = () => {
  const {
    data,
    updatePeople,
    updateExpenseSplitMethod,
    baseCurrency,
    setBaseCurrency,
    resetToDefault
  } = useFinance();
  const { theme, toggleTheme } = useTheme();

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Contribuidores actuales (mínimo 1)
  const currentPeople = (data.people && data.people.length > 0)
    ? data.people
    : [{ id: 'p-1', name: 'Yo', monthlyIncome: 0, healthPensionRate: 0.08, enabled: true }];

  const personCount = Math.min(4, Math.max(1, currentPeople.length));
  const splitMethod: ExpenseSplitMethod = data.expenseSplitMethod || 'proportional';

  // Cambio en número de aportantes
  const handlePersonCountChange = (count: number) => {
    const validCount = Math.min(4, Math.max(1, count));
    const updated = [...currentPeople];
    if (validCount > updated.length) {
      for (let i = updated.length; i < validCount; i++) {
        updated.push({
          id: `p-${Date.now()}-${i + 1}`,
          name: `Persona ${i + 1}`,
          monthlyIncome: 0,
          healthPensionRate: 0.0,
          enabled: true
        });
      }
    } else if (validCount < updated.length) {
      updated.splice(validCount);
    }
    updatePeople(updated);
  };

  // Actualizar campo de persona
  const handleUpdatePerson = (index: number, field: keyof PersonProfile, value: any) => {
    const updated = [...currentPeople];
    if (!updated[index]) return;
    updated[index] = { ...updated[index], [field]: value };
    updatePeople(updated);
  };

  // Calcular total de ingreso familiar
  const totalCombinedIncome = currentPeople.reduce((sum, p) => sum + (p.monthlyIncome || 0), 0);

  // Calcular ratio / porcentaje de aporte según método de reparto
  const getPersonRatio = (person: PersonProfile) => {
    if (currentPeople.length <= 1) return 100;
    const pIncome = person.monthlyIncome || 0;

    if (splitMethod === 'equal') {
      return 100 / currentPeople.length;
    }
    if (splitMethod === 'equal_remaining') {
      const avg = totalCombinedIncome / currentPeople.length;
      const ratio = totalCombinedIncome > 0
        ? Math.max(0, Math.min(1, 0.5 + (pIncome - avg) / (totalCombinedIncome || 1))) * 100
        : 100 / currentPeople.length;
      return ratio;
    }
    return totalCombinedIncome > 0 ? (pIncome / totalCombinedIncome) * 100 : 0;
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      {/* Contenedor Principal Unificado de Ajustes */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors divide-y divide-slate-200 dark:divide-slate-800">
        {/* 1. PERFIL (Nombre e Ingreso Personal) */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-600 text-white border-2 border-indigo-400 dark:border-indigo-400 flex items-center justify-center shadow-xs flex-shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Perfil</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tu información personal e ingreso mensual
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={currentPeople[0]?.name || ''}
                onChange={e => handleUpdatePerson(0, 'name', e.target.value)}
                placeholder="Mi Nombre"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Mi Ingreso Mensual
              </label>
              <input
                type="number"
                value={currentPeople[0]?.monthlyIncome || ''}
                onChange={e => handleUpdatePerson(0, 'monthlyIncome', parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-mono transition-colors"
              />
            </div>
          </div>
        </div>

        {/* 2. MODO VISUAL */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40 shadow-xs flex-shrink-0">
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Modo Visual</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {theme === 'dark' ? 'Tema oscuro activo' : 'Tema claro activo'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-300/80 dark:border-slate-700 shadow-sm transition-all"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-600" />
                <span>Oscuro</span>
              </>
            )}
          </button>
        </div>

        {/* 3. MONEDA BASE */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40 shadow-xs flex-shrink-0">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Moneda Base</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Moneda de cálculo principal
              </p>
            </div>
          </div>

          <select
            value={baseCurrency}
            onChange={(e) => setBaseCurrency(e.target.value as 'COP' | 'USD')}
            className="px-3 py-2 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-300/80 dark:border-slate-700 shadow-sm focus:outline-none cursor-pointer"
          >
            <option value="COP">COP ($)</option>
            <option value="USD">USD ($)</option>
          </select>
        </div>

        {/* 4. INGRESO FAMILIAR (Incorporado directamente con sus submenús a la vista) */}
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-600 text-white border-2 border-indigo-400 dark:border-indigo-400 flex items-center justify-center shadow-xs flex-shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Ingreso Familiar</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Aportantes y división de gastos
              </p>
            </div>
          </div>

          {/* Desplegable de número de aportantes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Número de Aportantes
            </label>
            <select
              value={personCount}
              onChange={e => handlePersonCountChange(parseInt(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value={1}>1 Aportante (Solo Yo)</option>
              <option value={2}>2 Aportantes</option>
              <option value={3}>3 Aportantes</option>
              <option value={4}>4 Aportantes</option>
            </select>
          </div>

          {/* Si es mayor a 1 se desplegarán los espacios para nombre e ingreso de los demás aportantes */}
          {personCount > 1 && (
            <div className="space-y-3 pt-1">
              <div className="space-y-2.5">
                {currentPeople.slice(1).map((person, sliceIdx) => {
                  const actualIdx = sliceIdx + 1;
                  const ratio = getPersonRatio(person);
                  const defaultName = `Persona ${actualIdx + 1}`;

                  return (
                    <div
                      key={person.id || actualIdx}
                      className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-2xl border border-slate-300 dark:border-slate-800 space-y-2.5"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
                        {/* Nombre */}
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                            Nombre
                          </label>
                          <input
                            type="text"
                            value={person.name}
                            onChange={e => handleUpdatePerson(actualIdx, 'name', e.target.value)}
                            placeholder={defaultName}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* Ingreso Mensual */}
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                            Ingreso Mensual
                          </label>
                          <input
                            type="number"
                            value={person.monthlyIncome || ''}
                            onChange={e => handleUpdatePerson(actualIdx, 'monthlyIncome', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>

                        {/* Porcentaje calculado */}
                        <div className="bg-blue-100/80 dark:bg-blue-950/70 px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-800/40 flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                            Aporte:
                          </span>
                          <div className="flex items-center gap-1 font-mono font-bold text-xs text-blue-700 dark:text-blue-300">
                            <Percent className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            {ratio.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Método de Reparto */}
              <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-2xl border border-slate-300 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Método de Reparto
                </label>
                <select
                  value={splitMethod}
                  onChange={e => updateExpenseSplitMethod(e.target.value as ExpenseSplitMethod)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="proportional">Proporcional a Ingresos (%)</option>
                  <option value="equal">50 / 50 Equitativo</option>
                  <option value="equal_remaining">Excedente Libre Equitativo</option>
                </select>
              </div>
            </div>
          )}

          {/* Total de Ingreso Familiar */}
          <div className="bg-blue-50/80 dark:bg-blue-950/50 p-4 rounded-2xl border border-blue-200 dark:border-blue-800/60 flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
              Total Ingreso Familiar
            </span>
            <span className="font-mono font-black text-base sm:text-lg text-blue-700 dark:text-blue-300">
              {formatCurrency(totalCombinedIncome)}
            </span>
          </div>
        </div>
      </div>

      {/* 5. BOTÓN ÚNICO AL FINAL: Restablecer todo de fábrica */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="w-full py-3.5 px-4 rounded-2xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/90 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Restablecer todo de fábrica
        </button>
      </div>

      {/* Modal de confirmación para restablecer datos */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Restablecer Datos"
        message="¿Estás seguro de restablecer todos los datos a la configuración inicial en blanco? Esta acción no se puede deshacer."
        confirmText="Sí, restablecer"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={() => {
          resetToDefault();
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
