import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import { StorageService } from '../../services/storageService';
import { IngresoFamiliarModal } from '../modals/IngresoFamiliarModal';
import {
  TrendingUp,
  Sun,
  Moon,
  RefreshCw,
  Settings,
  Users,
  X,
  Download
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { data, resetToDefault } = useFinance();
  const { theme, toggleTheme } = useTheme();

  // Settings menu popover state
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  // Family Income modal state
  const [showFamilyModal, setShowFamilyModal] = useState(false);

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
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-300/80 dark:border-slate-800 px-4 py-3 transition-colors shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center shadow-sm">
              <TrendingUp className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-tight">
                Finanzas Personales
              </h1>
            </div>
          </div>

          {/* Botón de Ajustes en la parte superior derecha */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              title="Ajustes y Configuración"
              className={`p-2.5 rounded-2xl border transition-all shadow-sm flex items-center gap-2 ${
                showSettingsMenu
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-300/80 dark:border-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Settings className={`w-4 h-4 ${showSettingsMenu ? 'animate-spin-slow' : ''}`} />
            </button>

            {/* Menú Desplegable de Ajustes */}
            {showSettingsMenu && (
              <div className="absolute right-0 top-full mt-2.5 z-50 w-72 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-4 shadow-2xl space-y-3 animate-scaleUp">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Preferencias
                  </span>
                  <button
                    onClick={() => setShowSettingsMenu(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 1. Cambio de Tema (letras y contraste 100% nítidos) */}
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/70 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Tema visual
                  </span>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 shadow-sm transition-all"
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

                {/* 2. Botón de Ajustes: Ingreso Familiar */}
                <button
                  onClick={() => {
                    setShowSettingsMenu(false);
                    setShowFamilyModal(true);
                  }}
                  className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Users className="w-3.5 h-3.5" /> Ingreso Familiar
                </button>

                {/* 5. Opciones de Exportación y Restablecimiento de Fábrica */}
                <div className="pt-1 space-y-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => {
                      StorageService.exportJSON(data);
                      setShowSettingsMenu(false);
                    }}
                    className="w-full py-2.5 px-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Descargar Copia (.json)
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('¿Restablecer todos los datos a la configuración inicial por defecto?')) {
                        resetToDefault();
                        setShowSettingsMenu(false);
                      }
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

      {/* Pop-up Modal de Ingreso Familiar y Exportación */}
      <IngresoFamiliarModal
        isOpen={showFamilyModal}
        onClose={() => setShowFamilyModal(false)}
      />
    </>
  );
};
