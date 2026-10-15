import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { PersonProfile, ExpenseSplitMethod } from '../../models/finance';
import { CustomSelect } from '../ui/CustomSelect';
import {
  Users,
  Save,
  CheckCircle2,
  Percent,
  Sliders,
  X
} from 'lucide-react';

interface IngresoFamiliarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IngresoFamiliarModal: React.FC<IngresoFamiliarModalProps> = ({ isOpen, onClose }) => {
  const { data, updatePeople, updateExpenseSplitMethod } = useFinance();

  // Number of contributors dropdown: 1 to 4 max
  const [personCount, setPersonCount] = useState<number>(Math.min(4, Math.max(1, data.people?.length || 2)));

  // Dynamic people list
  const [localPeople, setLocalPeople] = useState<PersonProfile[]>(() => {
    if (data.people && data.people.length > 0) {
      return data.people.slice(0, 4);
    }
    return [
      { id: 'p-1', name: 'Yo', monthlyIncome: 4400000, healthPensionRate: 0.08, enabled: true },
      { id: 'p-2', name: 'Persona 2', monthlyIncome: 8500000, healthPensionRate: 0.0, enabled: true }
    ];
  });

  // Expense split method
  const [splitMethod, setLocalSplitMethod] = useState<ExpenseSplitMethod>(data.expenseSplitMethod || 'proportional');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

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
            enabled: true
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

  // Calculate real-time total income
  const totalCombinedIncome = localPeople.reduce((sum, p) => sum + (p.monthlyIncome || 0), 0);

  // Calculate real-time percentage according to selected split method
  const getPersonRatio = (person: PersonProfile) => {
    if (localPeople.length <= 1) return 100;
    const pIncome = person.monthlyIncome || 0;

    if (splitMethod === 'equal') {
      return 100 / localPeople.length;
    }
    if (splitMethod === 'equal_remaining') {
      const avg = totalCombinedIncome / localPeople.length;
      const ratio = totalCombinedIncome > 0
        ? Math.max(0, Math.min(1, 0.5 + (pIncome - avg) / (totalCombinedIncome || 1))) * 100
        : 100 / localPeople.length;
      return ratio;
    }
    // 'proportional' (default)
    return totalCombinedIncome > 0 ? (pIncome / totalCombinedIncome) * 100 : 0;
  };

  // Save changes
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePeople(localPeople);
    updateExpenseSplitMethod(splitMethod);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto space-y-5 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Ingreso Familiar
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {savedSuccess && (
          <div className="bg-blue-100 dark:bg-blue-950/50 border border-blue-300 dark:border-blue-500/30 text-blue-800 dark:text-blue-400 p-3.5 rounded-2xl flex items-center gap-2 text-xs font-semibold animate-scaleUp">
            <CheckCircle2 className="w-4 h-4" /> ¡Ajustes guardados exitosamente!
          </div>
        )}

        {/* Formulario de Aportantes */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* 1. Selector de Ingresos Familiares (1 a 4 personas) */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Número de Aportantes
            </label>
            <CustomSelect
              value={personCount}
              onChange={val => handlePersonCountChange(Number(val))}
              options={[
                { value: 1, label: '1 Persona' },
                { value: 2, label: '2 Personas' },
                { value: 3, label: '3 Personas' },
                { value: 4, label: '4 Personas' }
              ]}
            />
          </div>

          {/* 2. Lista de Personas: Solo Nombre, Ingreso y Porcentaje */}
          <div className="space-y-3">
            {localPeople.map((person, idx) => {
              const ratio = getPersonRatio(person);
              const defaultName = idx === 0 ? 'Yo' : `Persona ${idx + 1}`;

              return (
                <div
                  key={person.id || idx}
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
                        onChange={e => updatePersonField(idx, 'name', e.target.value)}
                        placeholder={defaultName}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                        required
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
                        onChange={e => updatePersonField(idx, 'monthlyIncome', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                        required
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

          {/* 3. Sección Inferior: Ingreso Total y Método de Reparto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Izquierda: Ingreso Total */}
            <div className="bg-blue-50/70 dark:bg-blue-950/40 p-3.5 rounded-2xl border border-blue-200 dark:border-blue-800/50 flex flex-col justify-center">
              <span className="text-xs text-blue-700 dark:text-blue-300 font-bold block mb-1">
                Ingreso Total Familiar
              </span>
              <span className="font-mono font-black text-lg text-blue-700 dark:text-blue-400">
                {formatCurrency(totalCombinedIncome)}
              </span>
            </div>

            {/* Derecha: Método para Compartir Gastos */}
            <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-2xl border border-slate-300 dark:border-slate-800 flex flex-col justify-center">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Método de Reparto
              </label>
              <CustomSelect
                value={splitMethod}
                onChange={val => setLocalSplitMethod(val as ExpenseSplitMethod)}
                options={[
                  { value: 'proportional', label: 'Proporcional a Ingresos (%)' },
                  { value: 'equal', label: '50 / 50 Equitativo' },
                  { value: 'equal_remaining', label: 'Excedente Libre Equitativo' }
                ]}
              />
            </div>
          </div>

          {/* Botón Guardar Cambios */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs py-3 rounded-2xl transition-colors border border-slate-300/80 dark:border-transparent text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Guardar Ajustes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
