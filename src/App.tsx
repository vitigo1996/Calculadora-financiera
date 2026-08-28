import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { Navbar } from './components/ui/Navbar';
import { BottomNav, TabType } from './components/ui/BottomNav';
import { DashboardView } from './features/dashboard/DashboardView';
import { BudgetView } from './features/budget/BudgetView';
import { CreditCardsView } from './features/cards/CreditCardsView';
import { SubscriptionsView } from './features/subscriptions/SubscriptionsView';
import { PortfolioView } from './features/portfolio/PortfolioView';
import { FinancialCalculatorView } from './features/calculator/FinancialCalculatorView';
import { SettingsView } from './features/settings/SettingsView';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
      case 'budget':
        return <BudgetView />;
      case 'cards':
        return <CreditCardsView />;
      case 'subscriptions':
        return <SubscriptionsView />;
      case 'portfolio':
        return <PortfolioView />;
      case 'calculator':
        return <FinancialCalculatorView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
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
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
};

export default App;
