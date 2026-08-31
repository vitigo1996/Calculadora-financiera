import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppFinanceData, PersonProfile, HousingExpense, SubscriptionItem, CreditCardItem, ObligationItem, InvestmentAsset } from '../models/finance';
import { StorageService } from '../services/storageService';
import { calculateFinanceSummary, FinanceSummary } from '../services/financeCalculations';

interface FinanceContextType {
  data: AppFinanceData;
  summary: FinanceSummary;
  setMode: (mode: 'single' | 'shared') => void;
  updatePeople: (people: [PersonProfile, PersonProfile]) => void;
  updateCurrencyRate: (rate: number) => void;
  updateDeudaAutofinanciera: (amount: number) => void;
  // Housing
  updateHousingExpense: (id: string, expense: Partial<HousingExpense>) => void;
  // Subscriptions
  updateSubscription: (id: string, sub: Partial<SubscriptionItem>) => void;
  toggleSubscription: (id: string) => void;
  // Credit Cards
  addCardPurchase: (cardId: string, purchase: { concept: string; amount: number }) => void;
  deleteCardPurchase: (cardId: string, purchaseId: string) => void;
  updateCreditCard: (id: string, updated: Partial<CreditCardItem>) => void;
  // Obligations
  updateObligation: (id: string, ob: Partial<ObligationItem>) => void;
  // Portfolio
  updateAsset: (id: string, asset: Partial<InvestmentAsset>) => void;
  // Global
  resetToDefault: () => void;
  importData: (imported: AppFinanceData) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppFinanceData>(() => StorageService.loadData());

  useEffect(() => {
    StorageService.saveData(data);
  }, [data]);

  const summary = calculateFinanceSummary(data);

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

  const updateCurrencyRate = (rate: number) => {
    setData(prev => ({ ...prev, currencyRateUSD: rate }));
  };

  const updateDeudaAutofinanciera = (amount: number) => {
    setData(prev => ({ ...prev, deudaAutofinanciera: amount }));
  };

  const updateHousingExpense = (id: string, updated: Partial<HousingExpense>) => {
    setData(prev => ({
      ...prev,
      housingExpenses: prev.housingExpenses.map(h => h.id === id ? { ...h, ...updated } : h)
    }));
  };

  const updateSubscription = (id: string, updated: Partial<SubscriptionItem>) => {
    setData(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.map(s => s.id === id ? { ...s, ...updated } : s)
    }));
  };

  const toggleSubscription = (id: string) => {
    setData(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.map(s => s.id === id ? { ...s, active: !s.active } : s)
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

  const updateObligation = (id: string, updated: Partial<ObligationItem>) => {
    setData(prev => ({
      ...prev,
      obligations: prev.obligations.map(o => o.id === id ? { ...o, ...updated } : o)
    }));
  };

  const updateAsset = (id: string, updated: Partial<InvestmentAsset>) => {
    setData(prev => ({
      ...prev,
      portfolio: prev.portfolio.map(a => a.id === id ? { ...a, ...updated } : a)
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
      updateCurrencyRate,
      updateDeudaAutofinanciera,
      updateHousingExpense,
      updateSubscription,
      toggleSubscription,
      addCardPurchase,
      deleteCardPurchase,
      updateCreditCard,
      updateObligation,
      updateAsset,
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
