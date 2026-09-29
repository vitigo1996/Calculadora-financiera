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
