import React from 'react';
import { LayoutDashboard, Receipt, CreditCard, Sparkles, PieChart, Settings } from 'lucide-react';

export type TabType = 'dashboard' | 'budget' | 'cards' | 'subscriptions' | 'portfolio' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Presupuesto', icon: LayoutDashboard },
    { id: 'budget', label: 'Vivienda & Quincenas', icon: Receipt },
    { id: 'cards', label: 'Tarjetas', icon: CreditCard },
    { id: 'subscriptions', label: 'Suscripciones', icon: Sparkles },
    { id: 'portfolio', label: 'Portafolio', icon: PieChart },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 safe-area-pb">
      <div className="max-w-xl mx-auto flex items-center justify-around">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-emerald-400 font-semibold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-emerald-500/15' : 'bg-transparent'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
