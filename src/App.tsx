import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/ui/Navbar';
import { BottomNav, TabType } from './components/ui/BottomNav';
import { BilleteraView } from './features/billetera/BilleteraView';
import { GastosFijosView } from './features/gastos_fijos/GastosFijosView';
import { CreditosSuscripcionesView } from './features/creditos_suscripciones/CreditosSuscripcionesView';
import { PresupuestoView } from './features/presupuesto/PresupuestoView';
import { PortafolioView } from './features/portafolio/PortafolioView';
import { SettingsView } from './features/settings/SettingsView';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('billetera');

  const renderActiveView = () => {
    switch (activeTab) {
      case 'billetera':
        return <BilleteraView />;
      case 'gastos_fijos':
        return <GastosFijosView />;
      case 'creditos_suscripciones':
        return <CreditosSuscripcionesView />;
      case 'presupuesto':
        return <PresupuestoView />;
      case 'portafolio':
        return <PortafolioView />;
      case 'ajustes':
        return <SettingsView />;
      default:
        return <BilleteraView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 pt-6">
        {renderActiveView()}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
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
