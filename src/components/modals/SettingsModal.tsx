import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import { IngresoFamiliarModal } from './IngresoFamiliarModal';
import { ConfirmModal } from '../ui/ConfirmModal';
import {
  Sun,
  Moon,
  Coins,
  Users,
  RefreshCw,
  X,
  Settings
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { baseCurrency, setBaseCurrency, resetToDefault } = useFinance();
  const { theme, toggleTheme } = useTheme();

  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-white dark:bg-slate-900 border-t sm:border border-slate-300 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800/50 shadow-sm">
                <Settings className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                Ajustes de Aplicación
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3.5">
            {/* 1. Selector de Tema (Claro / Oscuro) */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/70 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Modo Visual
              </span>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 shadow-sm transition-all"
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

            {/* 2. Selector de Moneda Base */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/70 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Moneda Base
                </span>
              </div>
              <select
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value as 'COP' | 'USD')}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 shadow-sm focus:outline-none cursor-pointer"
              >
                <option value="COP">COP ($)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>

            {/* 3. Botón de Ajustes: Ingreso Familiar */}
            <button
              type="button"
              onClick={() => setShowFamilyModal(true)}
              className="w-full py-3 px-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" /> Ingreso Familiar
            </button>

            {/* 4. Restablecimiento de Fábrica */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2.5 px-3 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Restablecer Fábrica
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pop-up Modal de Ingreso Familiar */}
      <IngresoFamiliarModal
        isOpen={showFamilyModal}
        onClose={() => setShowFamilyModal(false)}
      />

      {/* Pop-up Modal de Confirmación para Restablecer Fábrica */}
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
          onClose();
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </>
  );
};
