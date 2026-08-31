import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AppFinanceData,
  PersonProfile,
  HousingExpense,
  SubscriptionItem,
  CreditCardItem,
  ObligationItem,
  BilleteraAccountItem,
  DeudaItem
} from '../models/finance';
import { StorageService } from '../services/storageService';
import { CurrencyService } from '../services/currencyService';
import { calculateAllFinances, CalculatedSummary } from '../services/financeCalculations';

interface FinanceContextType {
  data: AppFinanceData;
  summary: CalculatedSummary;
  isFetchingRate: boolean;
  refreshLiveDolarRate: () => Promise<boolean>;
  setMode: (mode: 'single' | 'shared') => void;
  updatePeople: (people: PersonProfile[]) => void;
  updateDolarRate: (rate: number) => void;
  addBilleteraItem: (item: { nombre: string; moneda: 'COP' | 'USD'; saldo: number; icon?: string }) => void;
  updateBilleteraItem: (id: string, updated: Partial<BilleteraAccountItem>) => void;
  deleteBilleteraItem: (id: string) => void;
  addDeudaItem: (item: { nombre: string; monto?: number; moneda: 'COP' | 'USD'; tipo: 'por_cobrar' | 'por_pagar'; icon?: string }) => void;
  updateDeudaItem: (id: string, updated: Partial<DeudaItem>) => void;
  deleteDeudaItem: (id: string) => void;
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
  const [isFetchingRate, setIsFetchingRate] = useState(false);

  // Auto-fetch live dollar on load if internet is available
  const refreshLiveDolarRate = useCallback(async () => {
    setIsFetchingRate(true);
    try {
      const liveRate = await CurrencyService.fetchLiveUsdRate();
      if (liveRate && liveRate > 0) {
        setData(prev => ({
          ...prev,
          dolarRate: liveRate,
          dolarRateLiveUpdated: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
        }));
        setIsFetchingRate(false);
        return true;
      }
    } catch (e) {
      console.warn('Error fetching live USD TRM', e);
    }
    setIsFetchingRate(false);
    return false;
  }, []);

  useEffect(() => {
    refreshLiveDolarRate();
  }, [refreshLiveDolarRate]);

  useEffect(() => {
    StorageService.saveData(data);
  }, [data]);

  const summary = calculateAllFinances(data);

  const setMode = (mode: 'single' | 'shared') => {
    setData(prev => ({
      ...prev,
      mode
    }));
  };

  const updatePeople = (people: PersonProfile[]) => {
    setData(prev => ({
      ...prev,
      people,
      mode: people.length > 1 ? 'shared' : 'single'
    }));
  };

  const updateDolarRate = (rate: number) => {
    setData(prev => ({ ...prev, dolarRate: rate }));
  };

  const addBilleteraItem = (item: { nombre: string; moneda: 'COP' | 'USD'; saldo: number; icon?: string }) => {
    const newItem: BilleteraAccountItem = {
      id: `acc-${Date.now()}`,
      ...item
    };
    setData(prev => ({
      ...prev,
      billeteraItems: [...prev.billeteraItems, newItem]
    }));
  };

  const updateBilleteraItem = (id: string, updated: Partial<BilleteraAccountItem>) => {
    setData(prev => ({
      ...prev,
      billeteraItems: prev.billeteraItems.map(b => (b.id === id ? { ...b, ...updated } : b))
    }));
  };

  const deleteBilleteraItem = (id: string) => {
    setData(prev => ({
      ...prev,
      billeteraItems: prev.billeteraItems.filter(b => b.id !== id)
    }));
  };

  const addDeudaItem = (item: { nombre: string; monto?: number; moneda: 'COP' | 'USD'; tipo: 'por_cobrar' | 'por_pagar'; icon?: string }) => {
    const newItem: DeudaItem = {
      id: `deuda-${Date.now()}`,
      ...item
    };
    setData(prev => ({
      ...prev,
      deudaItems: [...prev.deudaItems, newItem]
    }));
  };

  const updateDeudaItem = (id: string, updated: Partial<DeudaItem>) => {
    setData(prev => ({
      ...prev,
      deudaItems: prev.deudaItems.map(d => (d.id === id ? { ...d, ...updated } : d))
    }));
  };

  const deleteDeudaItem = (id: string) => {
    setData(prev => ({
      ...prev,
      deudaItems: prev.deudaItems.filter(d => d.id !== id)
    }));
  };

  const updateHousingExpense = (id: string, updated: Partial<HousingExpense>) => {
    setData(prev => ({
      ...prev,
      housingExpenses: prev.housingExpenses.map(h => (h.id === id ? { ...h, ...updated } : h))
    }));
  };

  const updateObligation = (id: string, updated: Partial<ObligationItem>) => {
    setData(prev => ({
      ...prev,
      obligations: prev.obligations.map(o => (o.id === id ? { ...o, ...updated } : o))
    }));
  };

  const addCardPurchase = (cardId: string, purchase: { concept: string; amount: number }) => {
    const newP = { id: `p-${Date.now()}`, ...purchase };
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.map(c => (c.id === cardId ? { ...c, purchases: [...c.purchases, newP] } : c))
    }));
  };

  const deleteCardPurchase = (cardId: string, purchaseId: string) => {
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.map(c =>
        c.id === cardId ? { ...c, purchases: c.purchases.filter(p => p.id !== purchaseId) } : c
      )
    }));
  };

  const updateCreditCard = (id: string, updated: Partial<CreditCardItem>) => {
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.map(c => (c.id === id ? { ...c, ...updated } : c))
    }));
  };

  const toggleSubscription = (id: string) => {
    setData(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.map(s => (s.id === id ? { ...s, active: !s.active } : s))
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
    <FinanceContext.Provider
      value={{
        data,
        summary,
        isFetchingRate,
        refreshLiveDolarRate,
        setMode,
        updatePeople,
        updateDolarRate,
        addBilleteraItem,
        updateBilleteraItem,
        deleteBilleteraItem,
        addDeudaItem,
        updateDeudaItem,
        deleteDeudaItem,
        updateHousingExpense,
        updateObligation,
        addCardPurchase,
        deleteCardPurchase,
        updateCreditCard,
        toggleSubscription,
        updatePortfolioExtras,
        resetToDefault,
        importData
      }}
    >
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
