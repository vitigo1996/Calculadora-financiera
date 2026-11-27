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
  PaymentPeriod,
  ExpenseMovement
} from '../models/finance';
import { StorageService } from '../services/storageService';
import { generateId } from '../services/idService';
import { validateFinanceData } from '../services/dataValidation';
import { CurrencyService } from '../services/currencyService';
import { calculateAllFinances, CalculatedSummary, calculateCardPurchasesTotal } from '../services/financeCalculations';
import { applyNewMovement, revertMovement, NewMovementInput } from '../services/movementService';

interface FinanceContextType {
  data: AppFinanceData;
  summary: CalculatedSummary;
  baseCurrency: 'COP' | 'USD';
  isFetchingRate: boolean;
  setBaseCurrency: (currency: 'COP' | 'USD') => void;
  refreshLiveDolarRate: () => Promise<boolean>;
  setMode: (mode: 'single' | 'shared') => void;
  updatePeople: (people: PersonProfile[]) => void;
  updateExpenseSplitMethod: (method: ExpenseSplitMethod) => void;
  updateDolarRate: (rate: number) => void;
  addBilleteraItem: (item: { nombre: string; moneda: 'COP' | 'USD'; saldo: number; icon?: string }) => void;
  updateBilleteraItem: (id: string, updated: Partial<BilleteraAccountItem>) => void;
  deleteBilleteraItem: (id: string) => void;
  moveBilleteraItem: (index: number, direction: 'up' | 'down') => void;
  reorderBilleteraItems: (fromIndex: number, toIndex: number) => void;
  addExpenseMovement: (movement: NewMovementInput) => void;
  updateExpenseMovement: (id: string, updated: Partial<ExpenseMovement>) => void;
  deleteExpenseMovement: (id: string) => void;
  reorderExpenseMovements: (fromIndex: number, toIndex: number) => void;
  clearExpenseMovements: () => void;
  addDeudaItem: (item: { nombre: string; monto?: number; moneda: 'COP' | 'USD'; tipo: 'por_cobrar' | 'por_pagar'; icon?: string }) => void;
  updateDeudaItem: (id: string, updated: Partial<DeudaItem>) => void;
  deleteDeudaItem: (id: string) => void;
  moveDeudaItem: (index: number, direction: 'up' | 'down') => void;
  reorderDeudaItems: (fromIndex: number, toIndex: number) => void;
  addPortfolioItem: (item: { nombre: string; moneda: 'COP' | 'USD'; saldo: number; icon?: string; color?: string }) => void;
  updatePortfolioItem: (id: string, updated: Partial<PortfolioAccountItem>) => void;
  deletePortfolioItem: (id: string) => void;
  movePortfolioItem: (index: number, direction: 'up' | 'down') => void;
  reorderPortfolioItems: (fromIndex: number, toIndex: number) => void;
  addCreditCard: (item: { name: string; period?: PaymentPeriod; paymentDay?: number; cutoffDay?: number; creditLimit: number; moneda?: 'COP' | 'USD'; minPaymentOverride?: number }) => void;
  updateCreditCard: (id: string, updated: Partial<CreditCardItem>) => void;
  deleteCreditCard: (id: string) => void;
  moveCreditCard: (index: number, direction: 'up' | 'down') => void;
  reorderCreditCards: (fromIndex: number, toIndex: number) => void;
  performCardCutoff: (cardId: string) => void;
  payCardCutoff: (cardId: string) => void;
  cancelCardCutoff: (cardId: string) => void;
  clearCardPurchases: (cardId: string) => void;
  clearCardPurchasesVisual: (cardId: string) => void;
  addCardPurchase: (cardId: string, purchase: { concept: string; amount: number; moneda?: 'COP' | 'USD'; icon?: string }) => void;
  updateCardPurchase: (cardId: string, purchaseId: string, updated: { concept: string; amount: number; moneda?: 'COP' | 'USD'; icon?: string }) => void;
  cancelCardPurchase: (cardId: string, purchaseId: string) => void;
  deleteCardPurchaseRecord: (cardId: string, purchaseId: string) => void;
  deleteCardPurchase: (cardId: string, purchaseId: string) => void;
  toggleCardPurchasePaid: (cardId: string, purchaseId: string) => void;
  moveCardPurchase: (cardId: string, fromIndex: number, toIndex: number) => void;
  addHousingExpense: (item: { name: string; period?: PaymentPeriod; paymentDay?: number; totalAmount: number; moneda?: 'COP' | 'USD'; isShared?: boolean; icon?: string }) => void;
  updateHousingExpense: (id: string, updated: Partial<HousingExpense>) => void;
  deleteHousingExpense: (id: string) => void;
  moveHousingExpense: (index: number, direction: 'up' | 'down') => void;
  reorderHousingExpenses: (fromIndex: number, toIndex: number) => void;
  toggleHousingShared: (id: string) => void;
  addObligation: (item: { name: string; period?: PaymentPeriod; paymentDay?: number; totalAmount: number; totalDebtBalance?: number; moneda?: 'COP' | 'USD'; isShared?: boolean; icon?: string }) => void;
  updateObligation: (id: string, updated: Partial<ObligationItem>) => void;
  deleteObligation: (id: string) => void;
  moveObligation: (index: number, direction: 'up' | 'down') => void;
  reorderObligations: (fromIndex: number, toIndex: number) => void;
  toggleObligationShared: (id: string) => void;
  addSubscription: (item: { name: string; totalPrice: number; members: number; billing: 'monthly' | 'yearly'; period?: PaymentPeriod; paymentDay?: number; billingMonth?: string; moneda?: 'COP' | 'USD'; icon?: string }) => void;
  updateSubscription: (id: string, updated: Partial<SubscriptionItem>) => void;
  deleteSubscription: (id: string) => void;
  moveSubscription: (index: number, direction: 'up' | 'down') => void;
  reorderSubscriptions: (fromIndex: number, toIndex: number) => void;
  toggleSubscription: (id: string) => void;
  resetToDefault: () => void;
  importData: (imported: unknown) => { ok: true; warnings: string[] } | { ok: false; error: string };
  storageError: boolean;
  hideBalances: boolean;
  setHideBalances: (hide: boolean) => void;
  toggleHideBalances: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppFinanceData>(() => StorageService.loadData());
  const [isFetchingRate, setIsFetchingRate] = useState(false);
  const [hideBalances, setHideBalancesState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('app_hide_balances');
      return saved === 'true';
    } catch (e) {
      return false;
    }
  });

  const setHideBalances = (hide: boolean) => {
    setHideBalancesState(hide);
    try {
      localStorage.setItem('app_hide_balances', hide ? 'true' : 'false');
    } catch {
      // Almacenamiento no disponible (modo privado o bloqueado): se ignora sin afectar la app
    }
  };

  const toggleHideBalances = () => {
    setHideBalancesState(prev => {
      const next = !prev;
      try {
        localStorage.setItem('app_hide_balances', next ? 'true' : 'false');
      } catch {
      // Almacenamiento no disponible (modo privado o bloqueado): se ignora sin afectar la app
    }
      return next;
    });
  };

  const baseCurrency: 'COP' | 'USD' = data.baseCurrency || 'COP';

  const setBaseCurrency = (currency: 'COP' | 'USD') => {
    setData(prev => ({
      ...prev,
      baseCurrency: currency
    }));
  };

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

  // Persistir en cada cambio; si falla (p. ej. almacenamiento lleno) se expone el error a la UI
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    setStorageError(!StorageService.saveData(data));
  }, [data]);

  const summary = calculateAllFinances(data);

  const setMode = (mode: 'single' | 'shared') => {
    setData(prev => ({
      ...prev,
      mode
    }));
  };

  const updatePeople = (people: PersonProfile[]) => {
    const activeContributors = people.filter((p, idx) => idx === 0 ? true : (p.enabled && (p.monthlyIncome || 0) > 0));
    setData(prev => ({
      ...prev,
      people,
      mode: activeContributors.length > 1 ? 'shared' : 'single'
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
      id: generateId('acc'),
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

  const reorderArray = <T,>(list: T[], fromIndex: number, toIndex: number): T[] => {
    if (fromIndex < 0 || fromIndex >= list.length || toIndex < 0 || toIndex >= list.length || fromIndex === toIndex) {
      return list;
    }
    const result = [...list];
    const [removed] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, removed);
    return result;
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

  const reorderBilleteraItems = (fromIndex: number, toIndex: number) => {
    setData(prev => ({
      ...prev,
      billeteraItems: reorderArray(prev.billeteraItems, fromIndex, toIndex)
    }));
  };

  // Registrar movimiento: la lógica de saldos vive en movementService (función pura y probada)
  const addExpenseMovement = (movement: NewMovementInput) => {
    setData(prev => applyNewMovement(prev, movement));
  };

  const updateExpenseMovement = (id: string, updated: Partial<ExpenseMovement>) => {
    setData(prev => ({
      ...prev,
      expenseMovements: (prev.expenseMovements || []).map(m =>
        m.id === id ? { ...m, ...updated } : m
      )
    }));
  };

  // Eliminar movimiento revirtiendo exactamente su efecto sobre saldos, tarjetas y deudas
  const deleteExpenseMovement = (id: string) => {
    setData(prev => revertMovement(prev, id));
  };

  const reorderExpenseMovements = (fromIndex: number, toIndex: number) => {
    setData(prev => {
      const list = [...(prev.expenseMovements || [])];
      if (fromIndex < 0 || fromIndex >= list.length || toIndex < 0 || toIndex >= list.length) return prev;
      const [moved] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, moved);
      return {
        ...prev,
        expenseMovements: list
      };
    });
  };

  const clearExpenseMovements = () => {
    setData(prev => ({
      ...prev,
      expenseMovements: []
    }));
  };

  const addDeudaItem = (item: { nombre: string; monto?: number; moneda: 'COP' | 'USD'; tipo: 'por_cobrar' | 'por_pagar'; icon?: string }) => {
    const newItem: DeudaItem = {
      id: generateId('deuda'),
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

  const reorderDeudaItems = (fromIndex: number, toIndex: number) => {
    setData(prev => ({
      ...prev,
      deudaItems: reorderArray(prev.deudaItems, fromIndex, toIndex)
    }));
  };

  const addPortfolioItem = (item: { nombre: string; moneda: 'COP' | 'USD'; saldo: number; icon?: string; color?: string }) => {
    const newItem: PortfolioAccountItem = {
      id: generateId('port'),
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

  const reorderPortfolioItems = (fromIndex: number, toIndex: number) => {
    setData(prev => ({
      ...prev,
      portfolioItems: reorderArray(prev.portfolioItems || [], fromIndex, toIndex)
    }));
  };

  const addCreditCard = (card: { name: string; period?: PaymentPeriod; paymentDay?: number; cutoffDay?: number; creditLimit: number; moneda?: 'COP' | 'USD'; minPaymentOverride?: number }) => {
    const newCard: CreditCardItem = {
      id: generateId('cc'),
      name: card.name,
      period: card.period || '1st_fortnight',
      paymentDay: card.paymentDay,
      cutoffDay: card.cutoffDay,
      creditLimit: card.creditLimit,
      moneda: card.moneda || 'COP',
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

  const reorderCreditCards = (fromIndex: number, toIndex: number) => {
    setData(prev => ({
      ...prev,
      creditCards: reorderArray(prev.creditCards, fromIndex, toIndex)
    }));
  };

  // Realizar Corte de Tarjeta
  const performCardCutoff = (cardId: string) => {
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.map(c => {
        if (c.id === cardId) {
          const currentTotal = calculateCardPurchasesTotal(c);
          const currentPaymentsTotal = (c.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
          const nowIso = new Date().toISOString();
          return {
            ...c,
            billingCutoffAmount: currentTotal,
            billingCutoffDate: nowIso,
            lastCutoffDate: nowIso,
            cutoffBasePayments: currentPaymentsTotal,
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
          return {
            ...c,
            billingCutoffAmount: undefined,
            billingCutoffDate: undefined,
            cutoffBasePayments: undefined
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
            lastCutoffDate: undefined,
            cutoffBasePayments: undefined,
            purchases: (c.purchases || []).map(p => ({ ...p, isAfterCutoff: false }))
          };
        }
        return c;
      })
    }));
  };

  // Limpiar Registro de Tarjeta (Borra los registros de compras y pagos)
  const clearCardPurchases = (cardId: string) => {
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.map(c => {
        if (c.id === cardId) {
          return {
            ...c,
            billingCutoffAmount: undefined,
            billingCutoffDate: undefined,
            lastCutoffDate: undefined,
            purchases: [],
            payments: []
          };
        }
        return c;
      })
    }));
  };

  // Add Card Purchase (inserted at TOP)
  const addCardPurchase = (cardId: string, purchase: { concept: string; amount: number; moneda?: 'COP' | 'USD'; icon?: string }) => {
    const targetCard = data.creditCards.find(c => c.id === cardId);
    const hasActiveCutoff = targetCard?.billingCutoffAmount !== undefined;

    const newP = {
      id: generateId('p'),
      ...purchase,
      moneda: purchase.moneda || targetCard?.moneda || 'COP',
      date: new Date().toISOString(),
      icon: purchase.icon,
      isAfterCutoff: hasActiveCutoff
    };

    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.map(c =>
        c.id === cardId ? { ...c, purchases: [newP, ...c.purchases] } : c
      )
    }));
  };

  // Editar Compra (modifica concepto y monto)
  const updateCardPurchase = (
    cardId: string,
    purchaseId: string,
    updated: { concept: string; amount: number; moneda?: 'COP' | 'USD'; icon?: string }
  ) => {
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.map(c => {
        if (c.id === cardId) {
          const oldPurchase = (c.purchases || []).find(p => p.id === purchaseId);
          const updatedPurchases = (c.purchases || []).map(p =>
            p.id === purchaseId
              ? { ...p, concept: updated.concept.trim(), amount: updated.amount, moneda: updated.moneda || p.moneda, icon: updated.icon !== undefined ? updated.icon : p.icon }
              : p
          );
          let newCutoff = c.billingCutoffAmount;
          let newCutoffDate = c.billingCutoffDate;
          let newBase = c.cutoffBasePayments;

          if (newCutoff !== undefined && oldPurchase && !oldPurchase.isAfterCutoff) {
            const preCutoffSum = updatedPurchases.filter(p => !p.isAfterCutoff).reduce((sum, p) => sum + (p.amount || 0), 0);
            newCutoff = Math.max(0, preCutoffSum - (newBase || 0));
            if (newCutoff <= 0) {
              newCutoff = undefined;
              newCutoffDate = undefined;
              newBase = undefined;
            }
          }
          return {
            ...c,
            billingCutoffAmount: newCutoff,
            billingCutoffDate: newCutoffDate,
            cutoffBasePayments: newBase,
            purchases: updatedPurchases
          };
        }
        return c;
      })
    }));
  };

  // Cancelar Compra (Anular la compra y restaurar el cupo / disminuir deuda)
  const cancelCardPurchase = (cardId: string, purchaseId: string) => {
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.map(c => {
        if (c.id === cardId) {
          const targetPurchase = (c.purchases || []).find(p => p.id === purchaseId);
          const remainingPurchases = (c.purchases || []).filter(p => p.id !== purchaseId);
          let newCutoff = c.billingCutoffAmount;
          let newCutoffDate = c.billingCutoffDate;
          let newBase = c.cutoffBasePayments;

          if (targetPurchase && newCutoff !== undefined && !targetPurchase.isAfterCutoff) {
            const remainingPreCutoff = remainingPurchases.filter(p => !p.isAfterCutoff);
            const preCutoffSum = remainingPreCutoff.reduce((sum, p) => sum + (p.amount || 0), 0);
            if (remainingPreCutoff.length === 0 || preCutoffSum <= 0) {
              newCutoff = undefined;
              newCutoffDate = undefined;
              newBase = undefined;
            } else {
              newCutoff = Math.max(0, preCutoffSum - (newBase || 0));
              if (newCutoff <= 0) {
                newCutoff = undefined;
                newCutoffDate = undefined;
                newBase = undefined;
              }
            }
          }
          return {
            ...c,
            billingCutoffAmount: newCutoff,
            billingCutoffDate: newCutoffDate,
            cutoffBasePayments: newBase,
            purchases: remainingPurchases
          };
        }
        return c;
      })
    }));
  };

  // Eliminar Registro (Anular la compra y restaurar el cupo disponible / disminuir deuda)
  const deleteCardPurchaseRecord = cancelCardPurchase;

  const deleteCardPurchase = cancelCardPurchase;

  const toggleCardPurchasePaid = (cardId: string, purchaseId: string) => {
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.map(c => {
        if (c.id === cardId) {
          return {
            ...c,
            purchases: (c.purchases || []).map(p =>
              p.id === purchaseId ? { ...p, isPaid: !p.isPaid } : p
            )
          };
        }
        return c;
      })
    }));
  };

  const moveCardPurchase = (cardId: string, fromIndex: number, toIndex: number) => {
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.map(c => {
        if (c.id === cardId) {
          const list = [...(c.purchases || [])];
          if (fromIndex < 0 || fromIndex >= list.length || toIndex < 0 || toIndex >= list.length) {
            return c;
          }
          const [movedItem] = list.splice(fromIndex, 1);
          list.splice(toIndex, 0, movedItem);
          return { ...c, purchases: list };
        }
        return c;
      })
    }));
  };

  const clearCardPurchasesVisual = (cardId: string) => {
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.map(c => {
        if (c.id === cardId) {
          return {
            ...c,
            purchases: (c.purchases || []).map(p => ({ ...p, hidden: true }))
          };
        }
        return c;
      })
    }));
  };

  // Housing CRUD
  const addHousingExpense = (item: { name: string; period?: PaymentPeriod; paymentDay?: number; totalAmount: number; moneda?: 'COP' | 'USD'; isShared?: boolean; icon?: string }) => {
    const newH: HousingExpense = {
      id: generateId('house'),
      isShared: item.isShared !== undefined ? item.isShared : true,
      moneda: item.moneda || 'COP',
      period: item.period || '1st_fortnight',
      paymentDay: item.paymentDay,
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

  const reorderHousingExpenses = (fromIndex: number, toIndex: number) => {
    setData(prev => ({
      ...prev,
      housingExpenses: reorderArray(prev.housingExpenses, fromIndex, toIndex)
    }));
  };

  const toggleHousingShared = (id: string) => {
    setData(prev => ({
      ...prev,
      housingExpenses: prev.housingExpenses.map(h =>
        h.id === id ? { ...h, isShared: h.isShared === false ? true : false } : h
      )
    }));
  };

  // Obligations CRUD
  const addObligation = (item: { name: string; period?: PaymentPeriod; paymentDay?: number; totalAmount: number; totalDebtBalance?: number; moneda?: 'COP' | 'USD'; isShared?: boolean; icon?: string }) => {
    const newOb: ObligationItem = {
      id: generateId('ob'),
      isShared: item.isShared !== undefined ? item.isShared : true,
      moneda: item.moneda || 'COP',
      period: item.period || '1st_fortnight',
      paymentDay: item.paymentDay,
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

  const reorderObligations = (fromIndex: number, toIndex: number) => {
    setData(prev => ({
      ...prev,
      obligations: reorderArray(prev.obligations, fromIndex, toIndex)
    }));
  };

  const toggleObligationShared = (id: string) => {
    setData(prev => ({
      ...prev,
      obligations: prev.obligations.map(o =>
        o.id === id ? { ...o, isShared: o.isShared === false ? true : false } : o
      )
    }));
  };

  // Subscriptions CRUD
  const addSubscription = (item: { name: string; totalPrice: number; members: number; billing: 'monthly' | 'yearly'; period?: PaymentPeriod; billingMonth?: string; moneda?: 'COP' | 'USD'; icon?: string }) => {
    const newSub: SubscriptionItem = {
      id: generateId('sub'),
      active: true,
      period: item.period || '1st_fortnight',
      billingMonth: item.billingMonth,
      moneda: item.moneda || 'COP',
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

  const reorderSubscriptions = (fromIndex: number, toIndex: number) => {
    setData(prev => ({
      ...prev,
      subscriptions: reorderArray(prev.subscriptions || [], fromIndex, toIndex)
    }));
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

  // Importar respaldo: se valida antes de reemplazar los datos actuales
  const importData = (imported: unknown): { ok: true; warnings: string[] } | { ok: false; error: string } => {
    const result = validateFinanceData(imported);
    if (!result.ok) return result;
    setData(result.data);
    return { ok: true, warnings: result.warnings };
  };

  return (
    <FinanceContext.Provider
      value={{
        data,
        summary,
        baseCurrency,
        isFetchingRate,
        setBaseCurrency,
        refreshLiveDolarRate,
        setMode,
        updatePeople,
        updateExpenseSplitMethod,
        updateDolarRate,
        addBilleteraItem,
        updateBilleteraItem,
        deleteBilleteraItem,
        moveBilleteraItem,
        reorderBilleteraItems,
        addExpenseMovement,
        updateExpenseMovement,
        deleteExpenseMovement,
        reorderExpenseMovements,
        clearExpenseMovements,
        addDeudaItem,
        updateDeudaItem,
        deleteDeudaItem,
        moveDeudaItem,
        reorderDeudaItems,
        addPortfolioItem,
        updatePortfolioItem,
        deletePortfolioItem,
        movePortfolioItem,
        reorderPortfolioItems,
        addCreditCard,
        updateCreditCard,
        deleteCreditCard,
        moveCreditCard,
        reorderCreditCards,
        performCardCutoff,
        payCardCutoff,
        cancelCardCutoff,
        clearCardPurchases,
        clearCardPurchasesVisual,
        addCardPurchase,
        updateCardPurchase,
        cancelCardPurchase,
        deleteCardPurchaseRecord,
        deleteCardPurchase,
        toggleCardPurchasePaid,
        moveCardPurchase,
        addHousingExpense,
        updateHousingExpense,
        deleteHousingExpense,
        moveHousingExpense,
        reorderHousingExpenses,
        toggleHousingShared,
        addObligation,
        updateObligation,
        deleteObligation,
        moveObligation,
        reorderObligations,
        toggleObligationShared,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        moveSubscription,
        reorderSubscriptions,
        toggleSubscription,
        resetToDefault,
        importData,
        storageError,
        hideBalances,
        setHideBalances,
        toggleHideBalances
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
