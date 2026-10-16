import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { ThemeProvider } from './context/ThemeContext';
import { BottomNav, TabType } from './components/ui/BottomNav';
import { BilleteraView } from './features/billetera/BilleteraView';
import { PresupuestoView } from './features/presupuesto/PresupuestoView';
import { PortafolioView } from './features/portafolio/PortafolioView';
import { AjustesView } from './features/ajustes/AjustesView';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('billetera');

  // Detección reactiva de teclado y campos de texto para permitir desplazamiento cómodo
  React.useEffect(() => {
    const handleViewportChange = () => {
      const vh = window.innerHeight;
      const currentH = window.visualViewport ? window.visualViewport.height : vh;
      const diff = vh - currentH;
      const isKeyboardOpen = diff > 130;

      document.documentElement.classList.toggle('keyboard-active', isKeyboardOpen);
      if (isKeyboardOpen) {
        document.documentElement.style.setProperty('--keyboard-inset', `${diff}px`);
      } else {
        document.documentElement.style.removeProperty('--keyboard-inset');
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
    }

    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        document.documentElement.classList.add('input-focused');
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 220);
      }
    };

    const onFocusOut = () => {
      setTimeout(() => {
        const active = document.activeElement as HTMLElement;
        if (!active || (active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA' && !active.isContentEditable)) {
          document.documentElement.classList.remove('input-focused');
        }
      }, 150);
    };

    window.addEventListener('focusin', onFocusIn);
    window.addEventListener('focusout', onFocusOut);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.visualViewport.removeEventListener('scroll', handleViewportChange);
      }
      window.removeEventListener('focusin', onFocusIn);
      window.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'billetera':
        return <BilleteraView />;
      case 'presupuesto':
        return <PresupuestoView />;
      case 'portafolio':
        return <PortafolioView />;
      case 'ajustes':
        return <AjustesView />;
      default:
        return <BilleteraView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-200/80 dark:bg-slate-950 flex justify-center selection:bg-blue-600 selection:text-white transition-colors duration-200">
      <div className="w-full max-w-md min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col shadow-2xl relative md:border-x md:border-slate-300/80 md:dark:border-slate-800">
        <main className="flex-1 w-full px-3.5 pt-3 pb-24 overflow-x-clip">
          {renderActiveView()}
        </main>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <FinanceProvider>
        <AppContent />
      </FinanceProvider>
    </ThemeProvider>
  );
};

export default App;
