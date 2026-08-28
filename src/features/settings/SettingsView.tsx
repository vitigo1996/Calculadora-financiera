import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { StorageService } from '../../services/storageService';
import { formatCurrency } from '../../services/financeCalculations';
import {
  Settings,
  Users,
  DollarSign,
  Download,
  Upload,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Save,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { data, updatePeople, updateCurrencyRate, resetToDefault, importData } = useFinance();
  const [p1, p2] = data.people;

  const [p1Name, setP1Name] = useState(p1.name);
  const [p1Income, setP1Income] = useState(p1.monthlyIncome.toString());
  const [p1Rate, setP1Rate] = useState((p1.healthPensionRate * 100).toString());

  const [p2Name, setP2Name] = useState(p2.name);
  const [p2Income, setP2Income] = useState(p2.monthlyIncome.toString());

  const [usdRate, setUsdRate] = useState(data.currencyRateUSD.toString());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfiles = (e: React.FormEvent) => {
    e.preventDefault();
    const inc1 = parseFloat(p1Income) || 0;
    const rate1 = (parseFloat(p1Rate) || 0) / 100;
    const inc2 = parseFloat(p2Income) || 0;
    const usd = parseFloat(usdRate) || 3600;

    updatePeople([
      { ...p1, name: p1Name, monthlyIncome: inc1, healthPensionRate: rate1 },
      { ...p2, name: p2Name, monthlyIncome: inc2 }
    ]);

    updateCurrencyRate(usd);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && json.people && json.housingExpenses) {
          importData(json);
          alert('¡Datos restaurados con éxito desde el archivo de respaldo!');
        } else {
          alert('El archivo no tiene el formato de respaldo de Finanzas válido.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-300" /> Configuración & Respaldos
        </h2>
        <p className="text-xs text-slate-400">
          Personaliza ingresos, sueldos de pareja, tasa de cambio y exporta tus datos
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-2xl flex items-center gap-2 text-xs font-semibold animate-scaleUp">
          <CheckCircle2 className="w-4 h-4" /> ¡Configuración guardada exitosamente!
        </div>
      )}

      {/* Profiles & Income Form */}
      <form onSubmit={handleSaveProfiles} className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" /> Perfiles de Ingresos & Hogar
        </h3>

        {/* Person 1 (David) */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400">Persona 1 (Titular Principal)</span>
            <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
          </div>

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

        {/* Person 2 (Daniela) */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400">Persona 2 (Pareja / Co-aportante)</span>
            <span className="w-3 h-3 rounded-full bg-indigo-400"></span>
          </div>

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

        {/* Exchange Rate */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
          <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Tasa de Cambio Dólar / COP (TRM)
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
          <Save className="w-4 h-4" /> Guardar Cambios de Perfil
        </button>
      </form>

      {/* Export / Import & Backups */}
      <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Download className="w-4 h-4 text-blue-400" /> Exportación & Copias de Seguridad
        </h3>
        <p className="text-xs text-slate-400">
          Tus datos se guardan de forma 100% privada y offline en tu dispositivo. Puedes exportarlos en cualquier momento a Excel o JSON.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Export Excel */}
          <button
            onClick={() => StorageService.exportExcel(data)}
            className="bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 p-4 rounded-2xl flex items-center gap-3 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs block text-white">Descargar en Excel (.xlsx)</span>
              <span className="text-[11px] text-slate-400">Exporta todas tus tablas y gastos</span>
            </div>
          </button>

          {/* Export JSON */}
          <button
            onClick={() => StorageService.exportJSON(data)}
            className="bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/30 text-blue-300 p-4 rounded-2xl flex items-center gap-3 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs block text-white">Copia de Seguridad (.json)</span>
              <span className="text-[11px] text-slate-400">Respaldo completo de la app</span>
            </div>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          {/* Import JSON */}
          <label className="cursor-pointer flex items-center gap-2 text-xs text-slate-300 hover:text-white bg-slate-800 px-4 py-2.5 rounded-2xl border border-slate-700 transition-colors">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Restaurar desde archivo</span>
            <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
          </label>

          {/* Reset button */}
          <button
            onClick={() => {
              if (confirm('¿Deseas restaurar todos los datos iniciales de tu hoja de cálculo original?')) {
                resetToDefault();
              }
            }}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Restaurar datos del Excel original
          </button>
        </div>
      </div>
    </div>
  );
};
