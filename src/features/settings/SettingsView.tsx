import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { StorageService } from '../../services/storageService';
import { formatCurrency, convertToBase } from '../../services/financeCalculations';
import { PersonProfile, ExpenseSplitMethod } from '../../models/finance';
import {
  Settings as SettingsIcon,
  Users,
  Download,
  RefreshCw,
  Save,
  CheckCircle2,
  FileSpreadsheet,
  Percent,
  Sliders
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { data, baseCurrency, updatePeople, updateExpenseSplitMethod, resetToDefault } = useFinance();
  const dolarRate = data.dolarRate || 3600;

  // Number of contributors dropdown: 1 to 4 max
  const [personCount, setPersonCount] = useState<number>(Math.min(4, Math.max(1, data.people?.length || 2)));

  // Dynamic people list
  const [localPeople, setLocalPeople] = useState<PersonProfile[]>(() => {
    if (data.people && data.people.length > 0) {
      return data.people.slice(0, 4);
    }
    return [
      { id: 'p-1', name: 'Yo', monthlyIncome: 4400000, healthPensionRate: 0.08, enabled: true, moneda: 'COP' },
      { id: 'p-2', name: 'Persona 2', monthlyIncome: 8500000, healthPensionRate: 0.0, enabled: true, moneda: 'COP' }
    ];
  });

  // Expense split method
  const [splitMethod, setLocalSplitMethod] = useState<ExpenseSplitMethod>(data.expenseSplitMethod || 'proportional');

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Handle changing number of people (1 to 4)
  const handlePersonCountChange = (count: number) => {
    const validCount = Math.min(4, Math.max(1, count));
    setPersonCount(validCount);
    setLocalPeople(prev => {
      const updated = [...prev];
      if (validCount > updated.length) {
        for (let i = updated.length; i < validCount; i++) {
          updated.push({
            id: `p-${Date.now()}-${i + 1}`,
            name: `Persona ${i + 1}`,
            monthlyIncome: 0,
            healthPensionRate: 0.0,
            enabled: true,
            moneda: baseCurrency
          });
        }
      } else if (validCount < updated.length) {
        return updated.slice(0, validCount);
      }
      return updated;
    });
  };

  // Update specific person field
  const updatePersonField = (index: number, field: keyof PersonProfile, value: any) => {
    setLocalPeople(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Calculate real-time total income converted to base currency
  const totalCombinedIncome = localPeople.reduce((sum, p) => {
    const pInBase = convertToBase(p.monthlyIncome || 0, p.moneda || 'COP', baseCurrency, dolarRate);
    return sum + pInBase;
  }, 0);

  // Calculate real-time percentage according to selected split method
  const getPersonRatio = (person: PersonProfile) => {
    if (localPeople.length <= 1) return 100;
    const pIncomeInBase = convertToBase(person.monthlyIncome || 0, person.moneda || 'COP', baseCurrency, dolarRate);

    if (splitMethod === 'equal') {
      return 100 / localPeople.length;
    }
    if (splitMethod === 'equal_remaining') {
      const avg = totalCombinedIncome / localPeople.length;
      const ratio = totalCombinedIncome > 0
        ? Math.max(0, Math.min(1, 0.5 + (pIncomeInBase - avg) / (totalCombinedIncome || 1))) * 100
        : 100 / localPeople.length;
      return ratio;
    }
    // 'proportional' (default)
    return totalCombinedIncome > 0 ? (pIncomeInBase / totalCombinedIncome) * 100 : 0;
  };

  // Save changes
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePeople(localPeople);
    updateExpenseSplitMethod(splitMethod);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Ajustes
        </h2>
      </div>

      {savedSuccess && (
        <div className="bg-blue-100 dark:bg-blue-950/50 border border-blue-300 dark:border-blue-500/30 text-blue-800 dark:text-blue-400 p-3.5 rounded-2xl flex items-center gap-2 text-xs font-semibold animate-scaleUp">
          <CheckCircle2 className="w-4 h-4" /> ¡Ajustes guardados exitosamente!
        </div>
      )}

      {/* Formulario de Aportantes */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-300 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
        {/* 1. Selector de Ingresos Familiares (1 a 4 personas) */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-2 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Ingresos Familiares
          </label>
          <select
            value={personCount}
            onChange={e => handlePersonCountChange(parseInt(e.target.value))}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
          >
            <option value={1}>1 Persona</option>
            <option value={2}>2 Personas</option>
            <option value={3}>3 Personas</option>
            <option value={4}>4 Personas</option>
          </select>
        </div>

        {/* 2. Lista de Personas: Nombre, Moneda, Ingreso y Porcentaje */}
        <div className="space-y-3">
          {localPeople.map((person, idx) => {
            const ratio = getPersonRatio(person);
            const defaultName = idx === 0 ? 'Yo' : `Persona ${idx + 1}`;
            const pMoneda = person.moneda || 'COP';

            return (
              <div
                key={person.id || idx}
                className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-300 dark:border-slate-800 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                  {/* Nombre */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={person.name}
                      onChange={e => updatePersonField(idx, 'name', e.target.value)}
                      placeholder={defaultName}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Moneda */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      Moneda
                    </label>
                    <select
                      value={pMoneda}
                      onChange={e => updatePersonField(idx, 'moneda', e.target.value as 'COP' | 'USD')}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="COP">Pesos ($)</option>
                      <option value="USD">Dólares ($)</option>
                    </select>
                  </div>

                  {/* Ingreso Mensual */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      Ingreso Mensual
                    </label>
                    <input
                      type="number"
                      value={person.monthlyIncome}
                      onChange={e => updatePersonField(idx, 'monthlyIncome', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                      required
                    />
                  </div>

                  {/* Porcentaje calculado */}
                  <div className="bg-blue-100/80 dark:bg-blue-950/70 px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-800/40 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Porcentaje:
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

        {/* 3. Sección Inferior: Ingreso Total (izquierda) y Método de Reparto (derecha) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Izquierda: Ingreso Total */}
          <div className="bg-blue-50/70 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-800/50 flex flex-col justify-center">
            <span className="text-xs text-blue-700 dark:text-blue-300 font-bold block mb-1">
              Ingreso Total
            </span>
            <span className="font-mono font-black text-lg text-blue-700 dark:text-blue-400">
              {formatCurrency(totalCombinedIncome, baseCurrency)}
            </span>
          </div>

          {/* Derecha: Método para Compartir Gastos */}
          <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-300 dark:border-slate-800 flex flex-col justify-center">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Método de Reparto
            </label>
            <select
              value={splitMethod}
              onChange={e => setLocalSplitMethod(e.target.value as ExpenseSplitMethod)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="proportional">Proporcional a Ingresos (% según gana cada uno)</option>
              <option value="equal">50 / 50 Equitativo (Partes iguales)</option>
              <option value="equal_remaining">Excedente Libre Equitativo (Mismo dinero libre al final)</option>
            </select>
          </div>
        </div>

        {/* Botón Guardar Cambios */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-3.5 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Guardar Ajustes
        </button>
      </form>

      {/* Zona de Mantenimiento / Backup */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-300 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Exportación & Mantenimiento
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => StorageService.exportJSON(data)}
            className="w-full py-3 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Descargar Copia de Seguridad (.json)
          </button>

          <button
            onClick={() => {
              if (confirm('¿Restablecer todos los datos a la configuración inicial por defecto?')) {
                resetToDefault();
              }
            }}
            className="w-full py-3 px-4 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Restablecer Valores de Fábrica
          </button>
        </div>
      </div>
    </div>
  );
};
