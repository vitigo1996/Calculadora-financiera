import React from 'react';
import { Wallet, Receipt, PieChart } from 'lucide-react';

export type TabType = 'billetera' | 'presupuesto' | 'portafolio';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'billetera', label: 'Movimientos', icon: Wallet },
    { id: 'presupuesto', label: 'Presupuesto', icon: Receipt },
    { id: 'portafolio', label: 'Portafolio', icon: PieChart },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1.5 safe-area-pb transition-colors shadow-sm">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-blue-100 dark:bg-blue-500/20' : 'bg-transparent'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
