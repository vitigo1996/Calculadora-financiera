import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AppFinanceData,
  PersonProfile,
  HousingExpense,
  SubscriptionItem,
  CreditCardItem,
  ObligationItem,
  BilleteraAccountItem,
  DeudaItem,
  PortfolioAccountItem,
  ExpenseSplitMethod,
  PaymentPeriod
} from '../models/finance';
import { StorageService } from '../services/storageService';
import { CurrencyService } from '../services/currencyService';
import { calculateAllFinances, CalculatedSummary, calculateCardPurchasesTotal } from '../services/financeCalculations';

interface FinanceContextType {
  data: AppFinanceData;
  summary: CalculatedSummary;
  isFetchingRate: boolean;
  refreshLiveDolarRate: () => Promise<boolean>;
  setMode: (mode: 'single' | 'shared') => void;
  updatePeople: (people: PersonProfile[]) => void;
  updateExpenseSplitMethod: (method: ExpenseSplitMethod) => void;
  updateDolarRate: (rate: number) => void;
  addBilleteraItem: (item: { nombre: string; moneda: 'COP' | 'USD'; saldo: number; icon?: string }) => void;
  updateBilleteraItem: (id: string, updated: Partial<BilleteraAccountItem>) => void;
  deleteBilleteraItem: (id: string) => void;
  moveBilleteraItem: (index: number, direction: 'up' | 'down') => void;
  addDeudaItem: (item: { nombre: string; monto?: number; moneda: 'COP' | 'USD'; tipo: 'por_cobrar' | 'por_pagar'; icon?: string }) => void;
  updateDeudaItem: (id: string, updated: Partial<DeudaItem>) => void;
  deleteDeudaItem: (id: string) => void;
  moveDeudaItem: (index: number, direction: 'up' | 'down') => void;
  addPortfolioItem: (item: { nombre: string; moneda: 'COP' | 'USD'; saldo: number; icon?: string }) => void;
  updatePortfolioItem: (id: string, updated: Partial<PortfolioAccountItem>) => void;
  deletePortfolioItem: (id: string) => void;
  movePortfolioItem: (index: number, direction: 'up' | 'down') => void;
  addCreditCard: (card: { name: string; period: PaymentPeriod; creditLimit: number; minPaymentOverride?: number }) => void;
  updateCreditCard: (id: string, updated: Partial<CreditCardItem>) => void;
  deleteCreditCard: (id: string) => void;
  moveCreditCard: (index: number, direction: 'up' | 'down') => void;
  performCardCutoff: (cardId: string) => void;
  payCardCutoff: (cardId: string) => void;
  cancelCardCutoff: (cardId: string) => void;
  addCardPurchase: (cardId: string, purchase: { concept: string; amount: number }) => void;
  deleteCardPurchase: (cardId: string, purchaseId: string) => void;
  addHousingExpense: (item: { name: string; period: PaymentPeriod; totalAmount: number; icon?: string }) => void;
  updateHousingExpense: (id: string, updated: Partial<HousingExpense>) => void;
  deleteHousingExpense: (id: string) => void;
  moveHousingExpense: (index: number, direction: 'up' | 'down') => void;
  addObligation: (item: { name: string; period: PaymentPeriod; totalAmount: number; totalDebtBalance?: number; icon?: string }) => void;
  updateObligation: (id: string, updated: Partial<ObligationItem>) => void;
  deleteObligation: (id: string) => void;
  moveObligation: (index: number, direction: 'up' | 'down') => void;
  addSubscription: (item: { name: string; totalPrice: number; members: number; billing: 'monthly' | 'yearly'; period?: PaymentPeriod; icon?: string }) => void;
  updateSubscription: (id: string, updated: Partial<SubscriptionItem>) => void;
  deleteSubscription: (id: string) => void;
  moveSubscription: (index: number, direction: 'up' | 'down') => void;
  toggleSubscription: (id: string) => void;
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

  const updateExpenseSplitMethod = (method: ExpenseSplitMethod) => {
    setData(prev => ({
      ...prev,
      expenseSplitMethod: method
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
      billeteraItems: [newItem, ...prev.billeteraItems]
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

  const moveBilleteraItem = (index: number, direction: 'up' | 'down') => {
    setData(prev => {
      const list = [...prev.billeteraItems];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...prev, billeteraItems: list };
    });
  };

  const addDeudaItem = (item: { nombre: string; monto?: number; moneda: 'COP' | 'USD'; tipo: 'por_cobrar' | 'por_pagar'; icon?: string }) => {
    const newItem: DeudaItem = {
      id: `deuda-${Date.now()}`,
      ...item
    };
    setData(prev => ({
      ...prev,
      deudaItems: [newItem, ...prev.deudaItems]
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

  const moveDeudaItem = (index: number, direction: 'up' | 'down') => {
    setData(prev => {
      const list = [...prev.deudaItems];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...prev, deudaItems: list };
    });
  };

  const addPortfolioItem = (item: { nombre: string; moneda: 'COP' | 'USD'; saldo: number; icon?: string }) => {
    const newItem: PortfolioAccountItem = {
      id: `port-${Date.now()}`,
      ...item
    };
    setData(prev => ({
      ...prev,
      portfolioItems: [newItem, ...(prev.portfolioItems || [])]
    }));
  };

  const updatePortfolioItem = (id: string, updated: Partial<PortfolioAccountItem>) => {
    setData(prev => ({
      ...prev,
      portfolioItems: (prev.portfolioItems || []).map(p => (p.id === id ? { ...p, ...updated } : p))
    }));
  };

  const deletePortfolioItem = (id: string) => {
    setData(prev => ({
      ...prev,
      portfolioItems: (prev.portfolioItems || []).filter(p => p.id !== id)
    }));
  };

  const movePortfolioItem = (index: number, direction: 'up' | 'down') => {
    setData(prev => {
      const list = [...(prev.portfolioItems || [])];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...prev, portfolioItems: list };
    });
  };

  const addCreditCard = (card: { name: string; period: PaymentPeriod; creditLimit: number; minPaymentOverride?: number }) => {
    const newCard: CreditCardItem = {
      id: `cc-${Date.now()}`,
      name: card.name,
      period: card.period,
      creditLimit: card.creditLimit,
      minPaymentOverride: card.minPaymentOverride,
      purchases: []
    };
    setData(prev => ({
      ...prev,
      creditCards: [newCard, ...prev.creditCards]
    }));
  };

  const updateCreditCard = (id: string, updated: Partial<CreditCardItem>) => {
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.map(c => (c.id === id ? { ...c, ...updated } : c))
    }));
  };

  const deleteCreditCard = (id: string) => {
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.filter(c => c.id !== id)
    }));
  };

  const moveCreditCard = (index: number, direction: 'up' | 'down') => {
    setData(prev => {
      const list = [...prev.creditCards];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...prev, creditCards: list };
    });
  };

  // Realizar Corte de Tarjeta
  const performCardCutoff = (cardId: string) => {
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.map(c => {
        if (c.id === cardId) {
          const currentTotal = calculateCardPurchasesTotal(c);
          return {
            ...c,
            billingCutoffAmount: currentTotal,
            billingCutoffDate: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
            purchases: (c.purchases || []).map(p => ({ ...p, isAfterCutoff: false }))
          };
        }
        return c;
      })
    }));
  };

  // Pagar Corte de Tarjeta
  const payCardCutoff = (cardId: string) => {
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.map(c => {
        if (c.id === cardId) {
          const remainingPurchases = (c.purchases || [])
            .filter(p => p.isAfterCutoff === true)
            .map(p => ({ ...p, isAfterCutoff: false }));
          return {
            ...c,
            billingCutoffAmount: undefined,
            billingCutoffDate: undefined,
            purchases: remainingPurchases
          };
        }
        return c;
      })
    }));
  };

  // Cancelar / Deshacer Corte
  const cancelCardCutoff = (cardId: string) => {
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.map(c => {
        if (c.id === cardId) {
          return {
            ...c,
            billingCutoffAmount: undefined,
            billingCutoffDate: undefined,
            purchases: (c.purchases || []).map(p => ({ ...p, isAfterCutoff: false }))
          };
        }
        return c;
      })
    }));
  };

  // Add Card Purchase (inserted at TOP)
  const addCardPurchase = (cardId: string, purchase: { concept: string; amount: number }) => {
    const targetCard = data.creditCards.find(c => c.id === cardId);
    const hasActiveCutoff = targetCard?.billingCutoffAmount !== undefined;

    const newP = {
      id: `p-${Date.now()}`,
      ...purchase,
      date: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
      isAfterCutoff: hasActiveCutoff
    };

    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.map(c =>
        c.id === cardId ? { ...c, purchases: [newP, ...c.purchases] } : c
      )
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

  // Housing CRUD
  const addHousingExpense = (item: { name: string; period: PaymentPeriod; totalAmount: number; icon?: string }) => {
    const newH: HousingExpense = {
      id: `house-${Date.now()}`,
      ...item
    };
    setData(prev => ({
      ...prev,
      housingExpenses: [newH, ...prev.housingExpenses]
    }));
  };

  const updateHousingExpense = (id: string, updated: Partial<HousingExpense>) => {
    setData(prev => ({
      ...prev,
      housingExpenses: prev.housingExpenses.map(h => (h.id === id ? { ...h, ...updated } : h))
    }));
  };

  const deleteHousingExpense = (id: string) => {
    setData(prev => ({
      ...prev,
      housingExpenses: prev.housingExpenses.filter(h => h.id !== id)
    }));
  };

  const moveHousingExpense = (index: number, direction: 'up' | 'down') => {
    setData(prev => {
      const list = [...prev.housingExpenses];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...prev, housingExpenses: list };
    });
  };

  // Obligations CRUD
  const addObligation = (item: { name: string; period: PaymentPeriod; totalAmount: number; totalDebtBalance?: number; icon?: string }) => {
    const newOb: ObligationItem = {
      id: `ob-${Date.now()}`,
      ...item
    };
    setData(prev => ({
      ...prev,
      obligations: [newOb, ...prev.obligations]
    }));
  };

  const updateObligation = (id: string, updated: Partial<ObligationItem>) => {
    setData(prev => ({
      ...prev,
      obligations: prev.obligations.map(o => (o.id === id ? { ...o, ...updated } : o))
    }));
  };

  const deleteObligation = (id: string) => {
    setData(prev => ({
      ...prev,
      obligations: prev.obligations.filter(o => o.id !== id)
    }));
  };

  const moveObligation = (index: number, direction: 'up' | 'down') => {
    setData(prev => {
      const list = [...prev.obligations];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...prev, obligations: list };
    });
  };

  // Subscriptions CRUD
  const addSubscription = (item: { name: string; totalPrice: number; members: number; billing: 'monthly' | 'yearly'; period?: PaymentPeriod; icon?: string }) => {
    const newSub: SubscriptionItem = {
      id: `sub-${Date.now()}`,
      active: true,
      period: item.period || '1st_fortnight',
      ...item
    };
    setData(prev => ({
      ...prev,
      subscriptions: [newSub, ...prev.subscriptions]
    }));
  };

  const updateSubscription = (id: string, updated: Partial<SubscriptionItem>) => {
    setData(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.map(s => (s.id === id ? { ...s, ...updated } : s))
    }));
  };

  const deleteSubscription = (id: string) => {
    setData(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.filter(s => s.id !== id)
    }));
  };

  const moveSubscription = (index: number, direction: 'up' | 'down') => {
    setData(prev => {
      const list = [...prev.subscriptions];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...prev, subscriptions: list };
    });
  };

  const toggleSubscription = (id: string) => {
    setData(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.map(s => (s.id === id ? { ...s, active: !s.active } : s))
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
        updateExpenseSplitMethod,
        updateDolarRate,
        addBilleteraItem,
        updateBilleteraItem,
        deleteBilleteraItem,
        moveBilleteraItem,
        addDeudaItem,
        updateDeudaItem,
        deleteDeudaItem,
        moveDeudaItem,
        addPortfolioItem,
        updatePortfolioItem,
        deletePortfolioItem,
        movePortfolioItem,
        addCreditCard,
        updateCreditCard,
        deleteCreditCard,
        moveCreditCard,
        performCardCutoff,
        payCardCutoff,
        cancelCardCutoff,
        addCardPurchase,
        deleteCardPurchase,
        addHousingExpense,
        updateHousingExpense,
        deleteHousingExpense,
        moveHousingExpense,
        addObligation,
        updateObligation,
        deleteObligation,
        moveObligation,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        moveSubscription,
        toggleSubscription,
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
