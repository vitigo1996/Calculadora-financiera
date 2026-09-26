import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import { IngresoFamiliarModal } from '../../components/modals/IngresoFamiliarModal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import {
  Settings,
  Sun,
  Moon,
  Coins,
  Users,
  RefreshCw,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export const AjustesView: React.FC = () => {
  const { baseCurrency, setBaseCurrency, resetToDefault } = useFinance();
  const { theme, toggleTheme } = useTheme();

  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn pb-4">
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-300 dark:border-slate-800 shadow-sm transition-colors flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800/50 shadow-sm">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white text-base">Ajustes</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Personaliza y gestiona tu aplicación</p>
          </div>
        </div>
      </div>

      {/* Sección 1: Preferencias Visuales y Moneda */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors divide-y divide-slate-200 dark:divide-slate-800">
        {/* Modo Visual */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40 shadow-sm">
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

        {/* Moneda Base */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40 shadow-sm">
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
      </div>

      {/* Sección 2: Configuración Financiera */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <button
          type="button"
          onClick={() => setShowFamilyModal(true)}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800/50 shadow-sm">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Ingreso Familiar</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Aportantes y división proporcional
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Sección 3: Zona de Peligro / Restablecer */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/40 shadow-sm overflow-hidden transition-colors p-4 space-y-3">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
          <ShieldAlert className="w-4 h-4" />
          <h4 className="font-bold text-xs uppercase tracking-wider">Zona de Peligro</h4>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Esta acción eliminará todos los registros y restablecerá la aplicación a su estado inicial.
        </p>
        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="w-full py-3 px-4 rounded-2xl border border-rose-300 dark:border-rose-800 bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Restablecer a Valores de Fábrica
        </button>
      </div>

      {/* Modals */}
      <IngresoFamiliarModal
        isOpen={showFamilyModal}
        onClose={() => setShowFamilyModal(false)}
      />

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
