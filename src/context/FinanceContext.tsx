import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppFinanceData, PersonProfile, HousingExpense, SubscriptionItem, CreditCardItem, ObligationItem, BilleteraSaldos } from '../models/finance';
import { StorageService } from '../services/storageService';
import { calculateAllFinances, CalculatedSummary } from '../services/financeCalculations';

interface FinanceContextType {
  data: AppFinanceData;
  summary: CalculatedSummary;
  setMode: (mode: 'single' | 'shared') => void;
  updatePeople: (people: [PersonProfile, PersonProfile]) => void;
  updateBilletera: (billetera: Partial<BilleteraSaldos>) => void;
  updateAutofinanciera: (amount: number) => void;
  updateHousingExpense: (id: string, updated: Partial<HousingExpense>) => void;
  updateObligation: (id: string, updated: Partial<ObligationItem>) => void;
  addCardPurchase: (cardId: string, purchase: { concept: string; amount: number }) => void;
  deleteCardPurchase: (cardId: string, purchaseId: string) => void;
  updateCreditCard: (id: string, updated: Partial<CreditCardItem>) => void;
  toggleSubscription: (id: string) => void;
  updatePortfolioExtras: (extras: Partial<AppFinanceData['portfolioExtras']>) => void;
  resetToDefault: () => void;
  importData: (imported: AppFinanceData) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppFinanceData>(() => StorageService.loadData());

  useEffect(() => {
    StorageService.saveData(data);
  }, [data]);

  const summary = calculateAllFinances(data);

  const setMode = (mode: 'single' | 'shared') => {
    setData(prev => ({
      ...prev,
      mode,
      people: [
        prev.people[0],
        { ...prev.people[1], enabled: mode === 'shared' }
      ]
    }));
  };

  const updatePeople = (people: [PersonProfile, PersonProfile]) => {
    setData(prev => ({ ...prev, people }));
  };

  const updateBilletera = (billetera: Partial<BilleteraSaldos>) => {
    setData(prev => ({
      ...prev,
      billetera: { ...prev.billetera, ...billetera }
    }));
  };

  const updateAutofinanciera = (amount: number) => {
    setData(prev => ({
      ...prev,
      deudas: { ...prev.deudas, autofinancieraMonto: amount }
    }));
  };

  const updateHousingExpense = (id: string, updated: Partial<HousingExpense>) => {
    setData(prev => ({
      ...prev,
      housingExpenses: prev.housingExpenses.map(h => h.id === id ? { ...h, ...updated } : h)
    }));
  };

  const updateObligation = (id: string, updated: Partial<ObligationItem>) => {
    setData(prev => ({
      ...prev,
      obligations: prev.obligations.map(o => o.id === id ? { ...o, ...updated } : o)
    }));
  };

  const addCardPurchase = (cardId: string, purchase: { concept: string; amount: number }) => {
    const newP = { id: `p-${Date.now()}`, ...purchase };
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.map(c => c.id === cardId ? { ...c, purchases: [...c.purchases, newP] } : c)
    }));
  };

  const deleteCardPurchase = (cardId: string, purchaseId: string) => {
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.map(c => c.id === cardId ? { ...c, purchases: c.purchases.filter(p => p.id !== purchaseId) } : c)
    }));
  };

  const updateCreditCard = (id: string, updated: Partial<CreditCardItem>) => {
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.map(c => c.id === id ? { ...c, ...updated } : c)
    }));
  };

  const toggleSubscription = (id: string) => {
    setData(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.map(s => s.id === id ? { ...s, active: !s.active } : s)
    }));
  };

  const updatePortfolioExtras = (extras: Partial<AppFinanceData['portfolioExtras']>) => {
    setData(prev => ({
      ...prev,
      portfolioExtras: { ...prev.portfolioExtras, ...extras }
    }));
  };

  const resetToDefault = () => {
    const def = StorageService.resetData();
    setData(def);
  };

  const importData = (imported: AppFinanceData) => {
    setData(imported);
  };

  return (
    <FinanceContext.Provider value={{
      data,
      summary,
      setMode,
      updatePeople,
      updateBilletera,
      updateAutofinanciera,
      updateHousingExpense,
      updateObligation,
      addCardPurchase,
      deleteCardPurchase,
      updateCreditCard,
      toggleSubscription,
      updatePortfolioExtras,
      resetToDefault,
      importData
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
