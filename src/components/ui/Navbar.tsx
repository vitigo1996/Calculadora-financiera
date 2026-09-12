import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import { StorageService } from '../../services/storageService';
import { IngresoFamiliarModal } from '../modals/IngresoFamiliarModal';
import { ConfirmModal } from './ConfirmModal';
import {
  TrendingUp,
  Sun,
  Moon,
  RefreshCw,
  Settings,
  Users,
  X,
  Coins
} from 'lucide-react';

import { TabType } from './BottomNav';
import { HelpModal } from './HelpModal';

interface NavbarProps {
  activeTab?: TabType;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab = 'billetera' }) => {
  const { baseCurrency, setBaseCurrency, resetToDefault } = useFinance();
  const { theme, toggleTheme } = useTheme();

  // Settings menu popover state
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  // Family Income modal state
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  // Reset confirmation modal state
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  // Help modal state
  const [showHelpModal, setShowHelpModal] = useState(false);

  const getTitle = () => {
    switch (activeTab) {
      case 'billetera':
        return 'BILLETERA';
      case 'creditos_suscripciones':
        return 'TARJETAS';
      case 'presupuesto':
        return 'PRESUPUESTO';
      case 'portafolio':
        return 'PORTAFOLIO';
      default:
        return 'BILLETERA';
    }
  };

  const currentTitle = getTitle();

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
    };
    if (showSettingsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettingsMenu]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Titulo dinámico de la ventana activa + Botón de Ayuda ? */}
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
              {currentTitle}
            </h1>
            <button
              onClick={() => setShowHelpModal(true)}
              className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-300/80 dark:border-slate-700/80 flex items-center justify-center text-xs font-bold transition-all shadow-sm active:scale-95"
              title={`Ayuda sobre ${currentTitle}`}
            >
              ?
            </button>
          </div>

          {/* Settings Menu Icon */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all border border-slate-300/80 dark:border-transparent flex items-center gap-2"
              title="Ajustes y Configuración"
            >
              <Settings className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </button>

            {/* Menu Desplegable de Ajustes */}
            {showSettingsMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 z-50 animate-scaleUp">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                    Ajustes de Aplicación
                  </span>
                  <button
                    onClick={() => setShowSettingsMenu(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 1. Selector de Tema (Claro / Oscuro) */}
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/70 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Modo Visual
                  </span>
                  <button
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
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/70 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
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
                  onClick={() => {
                    setShowSettingsMenu(false);
                    setShowFamilyModal(true);
                  }}
                  className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Users className="w-3.5 h-3.5" /> Ingreso Familiar
                </button>

                {/* 5. Restablecimiento de Fábrica */}
                <div className="pt-1 space-y-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setShowSettingsMenu(false);
                      setShowResetConfirm(true);
                    }}
                    className="w-full py-2.5 px-3 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Restablecer Fábrica
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

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
        }}
        onCancel={() => setShowResetConfirm(false)}
      />

      {/* Pop-up Modal de Ayuda */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title={currentTitle}
      />
    </>
  );
};
