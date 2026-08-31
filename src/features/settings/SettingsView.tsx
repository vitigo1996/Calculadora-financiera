import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { StorageService } from '../../services/storageService';
import { formatCurrency } from '../../services/financeCalculations';
import {
  Settings,
  User,
  Users,
  DollarSign,
  Download,
  Upload,
  RefreshCw,
  Save,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { data, setMode, updatePeople, updateBilletera, resetToDefault, importData } = useFinance();
  const [p1, p2] = data.people;

  const [mode, setLocalMode] = useState<'single' | 'shared'>(data.mode);
  const [p1Name, setP1Name] = useState(p1.name);
  const [p1Income, setP1Income] = useState(p1.monthlyIncome.toString());
  const [p1Rate, setP1Rate] = useState((p1.healthPensionRate * 100).toString());

  const [p2Name, setP2Name] = useState(p2.name);
  const [p2Income, setP2Income] = useState(p2.monthlyIncome.toString());

  const [usdRate, setUsdRate] = useState(data.billetera.dolar.toString());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const inc1 = parseFloat(p1Income) || 0;
    const rate1 = (parseFloat(p1Rate) || 0) / 100;
    const inc2 = parseFloat(p2Income) || 0;
    const usd = parseFloat(usdRate) || 3600;

    setMode(mode);
    updatePeople([
      { ...p1, name: p1Name, monthlyIncome: inc1, healthPensionRate: rate1, enabled: true },
      { ...p2, name: p2Name, monthlyIncome: inc2, enabled: mode === 'shared' }
    ]);
    updateBilletera({ dolar: usd });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-300" /> Configuración & Ajustes
        </h2>
        <p className="text-xs text-slate-400">
          Configuración de ingresos (Individual / Compartido), sueldos, tasa de cambio y respaldos
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-2xl flex items-center gap-2 text-xs font-semibold animate-scaleUp">
          <CheckCircle2 className="w-4 h-4" /> ¡Configuración guardada exitosamente!
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSave} className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
        {/* Selector de Modo */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
            Tipo de Aporte / Ingresos
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setLocalMode('single')}
              className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                mode === 'single'
                  ? 'bg-emerald-500/15 border-emerald-500 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                mode === 'single' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm block">Estoy solo (Individual)</span>
                <span className="text-xs text-slate-400">100% de gastos asumidos por una sola persona</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setLocalMode('shared')}
              className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                mode === 'shared'
                  ? 'bg-emerald-500/15 border-emerald-500 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                mode === 'shared' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm block">Pareja / Compartido</span>
                <span className="text-xs text-slate-400">Reparto proporcional según sueldos (David & Daniela)</span>
              </div>
            </button>
          </div>
        </div>

        {/* Persona 1 */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
          <span className="text-xs font-bold text-emerald-400 block">Persona 1 (Titular Principal - H3)</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Nombre</label>
              <input
                type="text"
                value={p1Name}
                onChange={e => setP1Name(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Ingreso Mensual (COP)</label>
              <input
                type="number"
                value={p1Income}
                onChange={e => setP1Income(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">% Salud & Pensión</label>
              <input
                type="number"
                step="0.5"
                value={p1Rate}
                onChange={e => setP1Rate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
            </div>
          </div>
        </div>

        {/* Persona 2 */}
        {mode === 'shared' && (
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-indigo-400 block">Persona 2 (Pareja / Co-aportante - I3)</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Nombre</label>
                <input
                  type="text"
                  value={p2Name}
                  onChange={e => setP2Name(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Ingreso Mensual (COP)</label>
                <input
                  type="number"
                  value={p2Income}
                  onChange={e => setP2Income(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Dólar TRM */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
          <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Tasa de Cambio Dólar / COP (C2)
          </label>
          <input
            type="number"
            value={usdRate}
            onChange={e => setUsdRate(e.target.value)}
            placeholder="3600"
            className="w-full sm:w-64 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Guardar Ajustes
        </button>
      </form>

      {/* Exportar / Restablecer */}
      <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Download className="w-4 h-4 text-blue-400" /> Exportar Datos & Copias de Seguridad
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => StorageService.exportExcel(data)}
            className="bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 p-4 rounded-2xl flex items-center gap-3 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs block text-white">Descargar en Excel (.xlsx)</span>
              <span className="text-[11px] text-slate-400">Exporta las tablas actuales</span>
            </div>
          </button>

          <button
            onClick={() => {
              if (confirm('¿Deseas restaurar todos los datos iniciales de tu hoja de cálculo original?')) {
                resetToDefault();
              }
            }}
            className="bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 p-4 rounded-2xl flex items-center gap-3 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs block text-white">Restablecer al Excel original</span>
              <span className="text-[11px] text-slate-400">Valores iniciales de David y Daniela</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
