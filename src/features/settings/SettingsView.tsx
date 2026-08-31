import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import { StorageService } from '../../services/storageService';
import { formatCurrency } from '../../services/financeCalculations';
import {
  Settings,
  User,
  Users,
  DollarSign,
  Download,
  RefreshCw,
  Save,
  CheckCircle2,
  FileSpreadsheet,
  Sun,
  Moon,
  Globe
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { data, setMode, updatePeople, resetToDefault, isFetchingRate, refreshLiveDolarRate } = useFinance();
  const { theme, setTheme } = useTheme();
  const [p1, p2] = data.people;

  const [mode, setLocalMode] = useState<'single' | 'shared'>(data.mode);
  const [p1Name, setP1Name] = useState(p1.name);
  const [p1Income, setP1Income] = useState(p1.monthlyIncome.toString());
  const [p1Rate, setP1Rate] = useState((p1.healthPensionRate * 100).toString());

  const [p2Name, setP2Name] = useState(p2.name);
  const [p2Income, setP2Income] = useState(p2.monthlyIncome.toString());

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const inc1 = parseFloat(p1Income) || 0;
    const rate1 = (parseFloat(p1Rate) || 0) / 100;
    const inc2 = parseFloat(p2Income) || 0;

    setMode(mode);
    updatePeople([
      { ...p1, name: p1Name, monthlyIncome: inc1, healthPensionRate: rate1, enabled: true },
      { ...p2, name: p2Name, monthlyIncome: inc2, enabled: mode === 'shared' }
    ]);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-600 dark:text-slate-300" /> Configuración & Ajustes
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Personalización de tema visual, ingresos, miembros del hogar y copias de seguridad
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-blue-100 dark:bg-blue-950/50 border border-blue-300 dark:border-blue-500/30 text-blue-800 dark:text-blue-400 p-3.5 rounded-2xl flex items-center gap-2 text-xs font-semibold animate-scaleUp">
          <CheckCircle2 className="w-4 h-4" /> ¡Configuración guardada exitosamente!
        </div>
      )}

      {/* Selector de Tema Visual: Claro u Oscuro */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-300 dark:border-slate-800 shadow-sm transition-colors">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-3">
          Tema de la Aplicación
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
              theme === 'light'
                ? 'bg-blue-50 border-blue-400 text-slate-800 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-500 hover:border-slate-400'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              theme === 'light' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}>
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs block">Modo Claro</span>
              <span className="text-[11px] text-slate-500">Visual limpio y contrastado</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
              theme === 'dark'
                ? 'bg-slate-800 border-blue-500 text-white shadow-sm'
                : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-500 hover:border-slate-400'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              theme === 'dark' ? 'bg-blue-950 text-blue-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}>
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs block">Modo Oscuro</span>
              <span className="text-[11px] text-slate-400">Descanso visual elegante</span>
            </div>
          </button>
        </div>
      </div>

      {/* Formulario de Ingresos & Hogar */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-300 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
        {/* Selector de Modo */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-2">
            Tipo de Presupuesto
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setLocalMode('single')}
              className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                mode === 'single'
                  ? 'bg-blue-50 dark:bg-blue-500/15 border-blue-400 dark:border-blue-500 text-slate-800 dark:text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-500 hover:border-slate-400'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                mode === 'single' ? 'bg-blue-100 dark:bg-blue-500 text-blue-800 dark:text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}>
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm block">Estoy solo (Individual)</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Todos los gastos asumidos por una sola persona</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setLocalMode('shared')}
              className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                mode === 'shared'
                  ? 'bg-blue-50 dark:bg-blue-500/15 border-blue-400 dark:border-blue-500 text-slate-800 dark:text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800 text-slate-500 hover:border-slate-400'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                mode === 'shared' ? 'bg-blue-100 dark:bg-blue-500 text-blue-800 dark:text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}>
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm block">Pareja / Compartido</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Reparto proporcional según sueldos (David & Daniela)</span>
              </div>
            </button>
          </div>
        </div>

        {/* Persona 1 */}
        <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-300 dark:border-slate-800 space-y-3">
          <span className="text-xs font-bold text-blue-700 dark:text-blue-400 block">Titular Principal</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Nombre</label>
              <input
                type="text"
                value={p1Name}
                onChange={e => setP1Name(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Ingreso Mensual (COP)</label>
              <input
                type="number"
                value={p1Income}
                onChange={e => setP1Income(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">% Salud & Pensión</label>
              <input
                type="number"
                step="0.5"
                value={p1Rate}
                onChange={e => setP1Rate(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>
          </div>
        </div>

        {/* Persona 2 */}
        {mode === 'shared' && (
          <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-300 dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Pareja / Co-aportante</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Nombre</label>
                <input
                  type="text"
                  value={p2Name}
                  onChange={e => setP2Name(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Ingreso Mensual (COP)</label>
                <input
                  type="number"
                  value={p2Income}
                  onChange={e => setP2Income(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Tasa Dólar TRM en Vivo (Informativa y Oficial) */}
        <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-300 dark:border-slate-800 flex items-center justify-between">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Tasa de Cambio TRM en Vivo (USD / COP)
            </label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Actualizada automáticamente desde internet
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-blue-700 dark:text-blue-400">
              COP {formatCurrency(data.dolarRate || 3600, 'COP')}
            </span>
            <button
              type="button"
              onClick={refreshLiveDolarRate}
              disabled={isFetchingRate}
              title="Actualizar TRM"
              className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingRate ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
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
              if (confirm('¿Deseas restaurar todos los datos iniciales de tu hoja de cálculo original?')) {
                resetToDefault();
              }
            }}
            className="bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 p-4 rounded-2xl flex items-center gap-3 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs block text-slate-800 dark:text-white">Restablecer Datos Originales</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Valores iniciales de David y Daniela</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
