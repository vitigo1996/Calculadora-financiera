import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { formatCurrency } from '../../services/financeCalculations';
import { PersonProfile, ExpenseSplitMethod } from '../../models/finance';
import {
  Sun,
  Moon,
  Coins,
  Sliders,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Wallet
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
  const [isIngresosExpanded, setIsIngresosExpanded] = useState(false);

  // Asegurar 4 aportantes fijos
  const getPerson = (index: number): PersonProfile => {
    if (data.people && data.people[index]) {
      return data.people[index];
    }
    return {
      id: `p-${index + 1}`,
      name: index === 0 ? 'Yo' : `Persona ${index + 1}`,
      monthlyIncome: 0,
      healthPensionRate: index === 0 ? 0.08 : 0,
      enabled: index === 0
    };
  };

  const peopleList: PersonProfile[] = [
    getPerson(0),
    getPerson(1),
    getPerson(2),
    getPerson(3)
  ];

  const splitMethod: ExpenseSplitMethod = data.expenseSplitMethod || 'proportional';

  // Actualizar ingreso de aportante
  const handleUpdateIncome = (index: number, incomeValue: number) => {
    const updated = [...peopleList];
    const prevPerson = updated[index];
    const isPrimary = index === 0;
    const isEnabled = isPrimary ? true : incomeValue > 0;

    updated[index] = {
      ...prevPerson,
      monthlyIncome: incomeValue,
      enabled: isEnabled
    };

    updatePeople(updated);
  };

  // Calcular total de ingreso familiar
  const totalCombinedIncome = peopleList.reduce((sum, p) => sum + (p.monthlyIncome || 0), 0);

  // ==========================================
  // VISTA PRINCIPAL: MENÚ GENERAL DE AJUSTES
  // ==========================================
  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      {/* Contenedor Principal Unificado con divisiones idénticas */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors divide-y divide-slate-200 dark:divide-slate-800">
        
        {/* 1. MODO VISUAL */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40 shadow-xs flex-shrink-0">
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Modo Visual</h4>
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

        {/* 2. MONEDA BASE */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40 shadow-xs flex-shrink-0">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Moneda Base</h4>
            </div>
          </div>

          <CustomSelect
            value={baseCurrency}
            onChange={(val) => setBaseCurrency(val as 'COP' | 'USD')}
            options={[
              { value: 'COP', label: 'COP ($)' },
              { value: 'USD', label: 'USD ($)' }
            ]}
            fullWidth={false}
            align="right"
            className="w-28"
          />
        </div>

        {/* 3. INGRESOS (BOTÓN CON SUBMENÚ DINÁMICO) */}
        <div className="transition-colors">
          <button
            type="button"
            onClick={() => setIsIngresosExpanded(!isIngresosExpanded)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40 shadow-xs flex-shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">Ingresos</h4>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white transition-colors">
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isIngresosExpanded ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Submenú desplegable de los 4 ingresos */}
          {isIngresosExpanded && (
            <div className="bg-slate-50/70 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 divide-y divide-slate-200/70 dark:divide-slate-800/70 animate-fadeIn">
              {[0, 1, 2, 3].map((idx) => {
                const person = peopleList[idx];
                const label = idx === 0 ? 'Yo' : `Persona ${idx + 1}`;

                return (
                  <div key={idx} className="px-4 py-3 flex items-center justify-between gap-3">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 text-xs truncate">
                      {label}
                    </span>

                    <input
                      type="number"
                      value={person.monthlyIncome === 0 ? '' : person.monthlyIncome}
                      onChange={e => handleUpdateIncome(idx, parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-32 sm:w-44 text-right bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-colors flex-shrink-0"
                    />
                  </div>
                );
              })}

              {/* Total al final del submenú desplegado */}
              <div className="px-4 py-3.5 bg-blue-50/60 dark:bg-blue-950/30 flex items-center justify-between gap-3">
                <span className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">
                  Ingreso Total
                </span>
                <span className="font-mono font-black text-sm text-blue-700 dark:text-blue-300">
                  {formatCurrency(totalCombinedIncome)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 4. MÉTODO DE REPARTO */}
        <div className="p-4 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40 shadow-xs flex-shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-slate-800 dark:text-white text-sm leading-tight">
                <span>Método de</span>
                <span className="block">Reparto</span>
              </h4>
            </div>
          </div>

          <CustomSelect
            value={splitMethod}
            onChange={(val) => updateExpenseSplitMethod(val as ExpenseSplitMethod)}
            options={[
              { value: 'proportional', label: 'Proporcional (%)' },
              { value: 'equal', label: '50 / 50 Equitativo' },
              { value: 'equal_remaining', label: 'Excedente Libre' }
            ]}
            fullWidth={false}
            align="right"
            className="w-40 sm:w-48"
          />
        </div>

        {/* 5. RESTABLECER */}
        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="w-full p-4 flex items-center justify-between hover:bg-rose-50/50 dark:hover:bg-rose-950/30 transition-colors text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40 shadow-xs flex-shrink-0">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-rose-600 dark:text-rose-400 text-sm">Restablecer</h4>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white transition-colors" />
        </button>

      </div>

      {/* Modal de confirmación para restablecer datos */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Restablecer"
        message="¿Estás seguro de restablecer? Esta acción no se puede deshacer."
        confirmText="Restablecer"
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
