import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppFinanceData, PersonProfile, HousingExpense, SubscriptionItem, CreditCardItem, ObligationItem, InvestmentAsset, AnnualExpense } from '../models/finance';
import { StorageService } from '../services/storageService';
import { calculateFinanceSummary, FinanceSummary } from '../services/financeCalculations';

interface FinanceContextType {
  data: AppFinanceData;
  summary: FinanceSummary;
  updatePeople: (people: [PersonProfile, PersonProfile]) => void;
  updateCurrencyRate: (rate: number) => void;
  // Housing
  addHousingExpense: (expense: Omit<HousingExpense, 'id'>) => void;
  updateHousingExpense: (id: string, expense: Partial<HousingExpense>) => void;
  deleteHousingExpense: (id: string) => void;
  // Subscriptions
  addSubscription: (sub: Omit<SubscriptionItem, 'id'>) => void;
  updateSubscription: (id: string, sub: Partial<SubscriptionItem>) => void;
  deleteSubscription: (id: string) => void;
  toggleSubscription: (id: string) => void;
  // Credit Cards
  addCreditCard: (cc: Omit<CreditCardItem, 'id'>) => void;
  updateCreditCard: (id: string, cc: Partial<CreditCardItem>) => void;
  deleteCreditCard: (id: string) => void;
  addCardPurchase: (cardId: string, purchase: { concept: string; amount: number }) => void;
  deleteCardPurchase: (cardId: string, purchaseId: string) => void;
  // Obligations
  addObligation: (ob: Omit<ObligationItem, 'id'>) => void;
  updateObligation: (id: string, ob: Partial<ObligationItem>) => void;
  deleteObligation: (id: string) => void;
  // Portfolio
  addAsset: (asset: Omit<InvestmentAsset, 'id'>) => void;
  updateAsset: (id: string, asset: Partial<InvestmentAsset>) => void;
  deleteAsset: (id: string) => void;
  // Annual Expenses
  addAnnualExpense: (exp: Omit<AnnualExpense, 'id'>) => void;
  updateAnnualExpense: (id: string, exp: Partial<AnnualExpense>) => void;
  deleteAnnualExpense: (id: string) => void;
  // Global actions
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

  const updatePeople = (people: [PersonProfile, PersonProfile]) => {
    setData(prev => ({ ...prev, people }));
  };

  const updateCurrencyRate = (rate: number) => {
    setData(prev => ({ ...prev, currencyRateUSD: rate }));
  };

  // Housing Actions
  const addHousingExpense = (expense: Omit<HousingExpense, 'id'>) => {
    const newItem: HousingExpense = { ...expense, id: `house-${Date.now()}` };
    setData(prev => ({ ...prev, housingExpenses: [...prev.housingExpenses, newItem] }));
  };

  const updateHousingExpense = (id: string, updated: Partial<HousingExpense>) => {
    setData(prev => ({
      ...prev,
      housingExpenses: prev.housingExpenses.map(h => h.id === id ? { ...h, ...updated } : h)
    }));
  };

  const deleteHousingExpense = (id: string) => {
    setData(prev => ({
      ...prev,
      housingExpenses: prev.housingExpenses.filter(h => h.id !== id)
    }));
  };

  // Subscription Actions
  const addSubscription = (sub: Omit<SubscriptionItem, 'id'>) => {
    const newItem: SubscriptionItem = { ...sub, id: `sub-${Date.now()}` };
    setData(prev => ({ ...prev, subscriptions: [...prev.subscriptions, newItem] }));
  };

  const updateSubscription = (id: string, updated: Partial<SubscriptionItem>) => {
    setData(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.map(s => s.id === id ? { ...s, ...updated } : s)
    }));
  };

  const deleteSubscription = (id: string) => {
    setData(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.filter(s => s.id !== id)
    }));
  };

  const toggleSubscription = (id: string) => {
    setData(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.map(s => s.id === id ? { ...s, active: !s.active } : s)
    }));
  };

  // Credit Card Actions
  const addCreditCard = (cc: Omit<CreditCardItem, 'id'>) => {
    const newItem: CreditCardItem = { ...cc, id: `cc-${Date.now()}` };
    setData(prev => ({ ...prev, creditCards: [...prev.creditCards, newItem] }));
  };

  const updateCreditCard = (id: string, updated: Partial<CreditCardItem>) => {
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.map(c => c.id === id ? { ...c, ...updated } : c)
    }));
  };

  const deleteCreditCard = (id: string) => {
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.filter(c => c.id !== id)
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

  // Obligation Actions
  const addObligation = (ob: Omit<ObligationItem, 'id'>) => {
    const newItem: ObligationItem = { ...ob, id: `ob-${Date.now()}` };
    setData(prev => ({ ...prev, obligations: [...prev.obligations, newItem] }));
  };

  const updateObligation = (id: string, updated: Partial<ObligationItem>) => {
    setData(prev => ({
      ...prev,
      obligations: prev.obligations.map(o => o.id === id ? { ...o, ...updated } : o)
    }));
  };

  const deleteObligation = (id: string) => {
    setData(prev => ({
      ...prev,
      obligations: prev.obligations.filter(o => o.id !== id)
    }));
  };

  // Portfolio Actions
  const addAsset = (asset: Omit<InvestmentAsset, 'id'>) => {
    const newItem: InvestmentAsset = { ...asset, id: `asset-${Date.now()}` };
    setData(prev => ({ ...prev, portfolio: [...prev.portfolio, newItem] }));
  };

  const updateAsset = (id: string, updated: Partial<InvestmentAsset>) => {
    setData(prev => ({
      ...prev,
      portfolio: prev.portfolio.map(a => a.id === id ? { ...a, ...updated } : a)
    }));
  };

  const deleteAsset = (id: string) => {
    setData(prev => ({
      ...prev,
      portfolio: prev.portfolio.filter(a => a.id !== id)
    }));
  };

  // Annual Expenses Actions
  const addAnnualExpense = (exp: Omit<AnnualExpense, 'id'>) => {
    const newItem: AnnualExpense = { ...exp, id: `ann-${Date.now()}` };
    setData(prev => ({ ...prev, annualExpenses: [...prev.annualExpenses, newItem] }));
  };

  const updateAnnualExpense = (id: string, updated: Partial<AnnualExpense>) => {
    setData(prev => ({
      ...prev,
      annualExpenses: prev.annualExpenses.map(a => a.id === id ? { ...a, ...updated } : a)
    }));
  };

  const deleteAnnualExpense = (id: string) => {
    setData(prev => ({
      ...prev,
      annualExpenses: prev.annualExpenses.filter(a => a.id !== id)
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
      updatePeople,
      updateCurrencyRate,
      addHousingExpense,
      updateHousingExpense,
      deleteHousingExpense,
      addSubscription,
      updateSubscription,
      deleteSubscription,
      toggleSubscription,
      addCreditCard,
      updateCreditCard,
      deleteCreditCard,
      addCardPurchase,
      deleteCardPurchase,
      addObligation,
      updateObligation,
      deleteObligation,
      addAsset,
      updateAsset,
      deleteAsset,
      addAnnualExpense,
      updateAnnualExpense,
      deleteAnnualExpense,
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
