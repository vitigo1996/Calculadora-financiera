import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { StorageService } from '../../services/storageService';
import { formatCurrency } from '../../services/financeCalculations';
import { PersonProfile } from '../../models/finance';
import {
  Settings as SettingsIcon,
  Users,
  Download,
  RefreshCw,
  Save,
  CheckCircle2,
  FileSpreadsheet,
  Percent,
  TrendingUp
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { data, updatePeople, resetToDefault } = useFinance();

  // Number of contributors dropdown: 1 to 5
  const [personCount, setPersonCount] = useState<number>(data.people?.length || 2);

  // Dynamic people list
  const [localPeople, setLocalPeople] = useState<PersonProfile[]>(() => {
    if (data.people && data.people.length > 0) {
      return data.people;
    }
    return [
      { id: 'p-1', name: 'David', monthlyIncome: 4400000, healthPensionRate: 0.08, enabled: true },
      { id: 'p-2', name: 'Daniela', monthlyIncome: 8500000, healthPensionRate: 0.0, enabled: true }
    ];
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Handle changing number of people
  const handlePersonCountChange = (count: number) => {
    setPersonCount(count);
    setLocalPeople(prev => {
      const updated = [...prev];
      if (count > updated.length) {
        for (let i = updated.length; i < count; i++) {
          updated.push({
            id: `p-${Date.now()}-${i + 1}`,
            name: `Persona ${i + 1}`,
            monthlyIncome: 1000000,
            healthPensionRate: 0.0,
            enabled: true
          });
        }
      } else if (count < updated.length) {
        return updated.slice(0, count);
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

  // Save changes
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePeople(localPeople);
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

      {/* Formulario de Aportantes & Presupuesto */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-300 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
        {/* Selector de Cantidad de Personas */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-2 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Cantidad de Personas que Ingresan Dinero
          </label>
          <select
            value={personCount}
            onChange={e => handlePersonCountChange(parseInt(e.target.value))}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
          >
            <option value={1}>1 Persona (Individual / Estoy solo)</option>
            <option value={2}>2 Personas (Pareja / David & Daniela)</option>
            <option value={3}>3 Personas (Familia / Hogar de 3)</option>
            <option value={4}>4 Personas (Hogar de 4)</option>
            <option value={5}>5 Personas (Hogar de 5)</option>
          </select>
        </div>

        {/* Resumen Total Combinado */}
        <div className="bg-blue-50/70 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-800/50 flex items-center justify-between">
          <div>
            <span className="text-xs text-blue-700 dark:text-blue-300 font-semibold block">Ingreso Total Combinado</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Base para el cálculo de porcentaje de aporte</span>
          </div>
          <span className="font-mono font-black text-base sm:text-lg text-blue-700 dark:text-blue-400">
            COP {formatCurrency(totalCombinedIncome, 'COP')}
          </span>
        </div>

        {/* Secciones Dinámicas de Aportantes */}
        <div className="space-y-4">
          {localPeople.map((person, idx) => {
            const ratio = totalCombinedIncome > 0 ? (person.monthlyIncome / totalCombinedIncome) * 100 : 0;

            return (
              <div
                key={person.id || idx}
                className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-300 dark:border-slate-800 space-y-3"
              >
                {/* Header del Aportante con su porcentaje calculado al frente */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Aportante #{idx + 1}: <strong className="text-blue-600 dark:text-blue-400">{person.name || `Persona ${idx + 1}`}</strong>
                  </span>

                  {/* Porcentaje de aporte correspondiente calculado al frente */}
                  <div className="flex items-center gap-1.5 bg-blue-100 dark:bg-blue-950/70 px-2.5 py-1 rounded-xl border border-blue-200 dark:border-blue-800/40">
                    <Percent className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold font-mono text-blue-700 dark:text-blue-300">
                      Aporte: {ratio.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={person.name}
                      onChange={e => updatePersonField(idx, 'name', e.target.value)}
                      placeholder={`Nombre Persona ${idx + 1}`}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      Ingreso Mensual (COP)
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

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      % Salud & Pensión
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={((person.healthPensionRate || 0) * 100).toString()}
                      onChange={e => updatePersonField(idx, 'healthPensionRate', (parseFloat(e.target.value) || 0) / 100)}
                      placeholder="8"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Guardar Ajustes
        </button>
      </form>

      {/* Exportar / Restablecer */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-300 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
        <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
          <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Exportar Datos & Copias de Seguridad
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => StorageService.exportExcel(data)}
            className="bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-500/30 text-blue-800 dark:text-blue-300 p-4 rounded-2xl flex items-center gap-3 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs block text-slate-800 dark:text-white">Descargar en Excel (.xlsx)</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Exporta las tablas actuales</span>
            </div>
          </button>

          <button
            onClick={() => {
              if (confirm('¿Deseas restaurar todos los datos iniciales?')) {
                resetToDefault();
              }
            }}
            className="bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 p-4 rounded-2xl flex items-center gap-3 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs block text-slate-800 dark:text-white">Restablecer Datos</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Valores iniciales de David y Daniela</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
