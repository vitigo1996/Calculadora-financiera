import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AppFinanceData,
  PersonProfile,
  HousingExpense,
  SubscriptionItem,
  CreditCardItem,
  CreditCardPayment,
  ObligationItem,
  BilleteraAccountItem,
  DeudaItem,
  PortfolioAccountItem,
  ExpenseSplitMethod,
  PaymentPeriod,
  ExpenseMovement
} from '../models/finance';
import { StorageService } from '../services/storageService';
import { CurrencyService } from '../services/currencyService';
import { calculateAllFinances, CalculatedSummary, calculateCardPurchasesTotal, formatCurrency } from '../services/financeCalculations';

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
  addExpenseMovement: (movement: { type?: 'expense' | 'income' | 'transfer'; name: string; amount: number; moneda: 'COP' | 'USD'; sourceAccountId: string; destinationType?: 'none' | 'card' | 'obligation' | 'account' | 'deuda' | 'portfolio'; destinationId?: string; destinationName?: string }) => void;
  deleteExpenseMovement: (id: string) => void;
  clearExpenseMovements: () => void;
  addDeudaItem: (item: { nombre: string; monto?: number; moneda: 'COP' | 'USD'; tipo: 'por_cobrar' | 'por_pagar'; icon?: string }) => void;
  updateDeudaItem: (id: string, updated: Partial<DeudaItem>) => void;
  deleteDeudaItem: (id: string) => void;
  moveDeudaItem: (index: number, direction: 'up' | 'down') => void;
  addPortfolioItem: (item: { nombre: string; moneda: 'COP' | 'USD'; saldo: number; icon?: string; color?: string }) => void;
  updatePortfolioItem: (id: string, updated: Partial<PortfolioAccountItem>) => void;
  deletePortfolioItem: (id: string) => void;
  movePortfolioItem: (index: number, direction: 'up' | 'down') => void;
  addCreditCard: (item: { name: string; period: PaymentPeriod; creditLimit: number; moneda?: 'COP' | 'USD' }) => void;
  updateCreditCard: (id: string, updated: Partial<CreditCardItem>) => void;
  deleteCreditCard: (id: string) => void;
  moveCreditCard: (index: number, direction: 'up' | 'down') => void;
  performCardCutoff: (cardId: string) => void;
  payCardCutoff: (cardId: string) => void;
  cancelCardCutoff: (cardId: string) => void;
  clearCardPurchases: (cardId: string) => void;
  clearCardPurchasesVisual: (cardId: string) => void;
  addCardPurchase: (cardId: string, purchase: { concept: string; amount: number; moneda?: 'COP' | 'USD' }) => void;
  updateCardPurchase: (cardId: string, purchaseId: string, updated: { concept: string; amount: number; moneda?: 'COP' | 'USD' }) => void;
  cancelCardPurchase: (cardId: string, purchaseId: string) => void;
  deleteCardPurchaseRecord: (cardId: string, purchaseId: string) => void;
  deleteCardPurchase: (cardId: string, purchaseId: string) => void;
  moveCardPurchase: (cardId: string, fromIndex: number, toIndex: number) => void;
  addHousingExpense: (item: { name: string; period: PaymentPeriod; totalAmount: number; moneda?: 'COP' | 'USD'; isShared?: boolean; icon?: string }) => void;
  updateHousingExpense: (id: string, updated: Partial<HousingExpense>) => void;
  deleteHousingExpense: (id: string) => void;
  moveHousingExpense: (index: number, direction: 'up' | 'down') => void;
  toggleHousingShared: (id: string) => void;
  addObligation: (item: { name: string; period: PaymentPeriod; totalAmount: number; totalDebtBalance?: number; moneda?: 'COP' | 'USD'; isShared?: boolean; icon?: string }) => void;
  updateObligation: (id: string, updated: Partial<ObligationItem>) => void;
  deleteObligation: (id: string) => void;
  moveObligation: (index: number, direction: 'up' | 'down') => void;
  toggleObligationShared: (id: string) => void;
  addSubscription: (item: { name: string; totalPrice: number; members: number; billing: 'monthly' | 'yearly'; period?: PaymentPeriod; billingMonth?: string; moneda?: 'COP' | 'USD'; icon?: string }) => void;
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

  const addExpenseMovement = (movement: {
    type?: 'expense' | 'income' | 'transfer';
    name: string;
    amount: number;
    moneda: 'COP' | 'USD';
    sourceAccountId: string;
    destinationType?: 'none' | 'card' | 'obligation' | 'account' | 'deuda' | 'portfolio';
    destinationId?: string;
    destinationName?: string;
  }) => {
    setData(prev => {
      const type = movement.type || 'expense';
      const isIncome = type === 'income';
      const isTransfer = type === 'transfer';

      // Determine Source Account (Billetera or Portfolio)
      const rawSourceId = movement.sourceAccountId.replace('portfolio:', '').replace('billetera:', '');
      const isSourcePortfolio = movement.sourceAccountId.startsWith('portfolio:') ||
        (!prev.billeteraItems.some(b => b.id === movement.sourceAccountId) && prev.portfolioItems.some(p => p.id === rawSourceId));

      const sourceBilletera = prev.billeteraItems.find(b => b.id === rawSourceId || b.id === movement.sourceAccountId);
      const sourcePortfolio = prev.portfolioItems.find(p => p.id === rawSourceId || p.id === movement.sourceAccountId);
      const sourceAccountName = isSourcePortfolio
        ? (sourcePortfolio ? sourcePortfolio.nombre : 'Portafolio')
        : (sourceBilletera ? sourceBilletera.nombre : 'Billetera');
      const sourceMoneda: 'COP' | 'USD' = (isSourcePortfolio ? sourcePortfolio?.moneda : sourceBilletera?.moneda) || 'COP';

      // Determine Destination Account for Transfer
      let destinationName = movement.destinationName;
      let isDestPortfolio = false;
      let rawDestId = movement.destinationId ? movement.destinationId.replace('portfolio:', '').replace('billetera:', '') : '';
      let destObj: { id: string; nombre: string; saldo: number; moneda?: 'COP' | 'USD' } | undefined = undefined;

      if (isTransfer && movement.destinationId) {
        isDestPortfolio = movement.destinationId.startsWith('portfolio:') ||
          (!prev.billeteraItems.some(b => b.id === movement.destinationId) && prev.portfolioItems.some(p => p.id === rawDestId));

        if (isDestPortfolio) {
          destObj = prev.portfolioItems.find(p => p.id === rawDestId || p.id === movement.destinationId);
          destinationName = destObj ? destObj.nombre : 'Portafolio';
        } else {
          destObj = prev.billeteraItems.find(b => b.id === rawDestId || b.id === movement.destinationId);
          destinationName = destObj ? destObj.nombre : 'Cuenta destino';
        }
      }

      const destMoneda: 'COP' | 'USD' = destObj?.moneda || 'COP';
      const rate = prev.dolarRate || 3600;

      // Calcular monto convertido a transferir en la cuenta destino si las monedas difieren
      let destTransferAmount = movement.amount;
      if (isTransfer && sourceMoneda !== destMoneda) {
        if (sourceMoneda === 'USD' && destMoneda === 'COP') {
          destTransferAmount = movement.amount * rate;
        } else if (sourceMoneda === 'COP' && destMoneda === 'USD') {
          destTransferAmount = rate > 0 ? movement.amount / rate : 0;
        }
      }

      const newMovement: ExpenseMovement = {
        id: `mov-${Date.now()}`,
        type,
        name: movement.name.trim(),
        amount: movement.amount,
        moneda: movement.moneda || sourceMoneda,
        sourceAccountId: movement.sourceAccountId,
        sourceAccountName,
        destinationType: isIncome
          ? (movement.destinationType === 'deuda' ? 'deuda' : undefined)
          : (isTransfer ? (isDestPortfolio ? 'portfolio' : 'account') : (movement.destinationType || 'none')),
        destinationId: isIncome ? (movement.destinationType === 'deuda' ? movement.destinationId : undefined) : movement.destinationId,
        destinationName: isIncome
          ? (movement.destinationType === 'deuda' ? destinationName : undefined)
          : (isTransfer && sourceMoneda !== destMoneda
              ? `${destinationName} (Recibe: ${formatCurrency(destTransferAmount, destMoneda)})`
              : destinationName),
        date: new Date().toISOString()
      };

      // 1. Actualizar saldo en la cuenta de Billetera
      let updatedBilletera = (prev.billeteraItems || []).map(acc => {
        if (!isSourcePortfolio && (acc.id === rawSourceId || acc.id === movement.sourceAccountId)) {
          if (isIncome) {
            return { ...acc, saldo: acc.saldo + movement.amount };
          } else {
            return { ...acc, saldo: Math.max(0, acc.saldo - movement.amount) };
          }
        }
        if (isTransfer && !isDestPortfolio && (acc.id === rawDestId || acc.id === movement.destinationId)) {
          return { ...acc, saldo: acc.saldo + destTransferAmount };
        }
        return acc;
      });

      // 2. Actualizar saldo en Portafolio
      let updatedPortfolio = (prev.portfolioItems || []).map(port => {
        if (isSourcePortfolio && (port.id === rawSourceId || port.id === movement.sourceAccountId)) {
          if (isIncome) {
            return { ...port, saldo: port.saldo + movement.amount };
          } else {
            return { ...port, saldo: Math.max(0, port.saldo - movement.amount) };
          }
        }
        if (isTransfer && isDestPortfolio && (port.id === rawDestId || port.id === movement.destinationId)) {
          return { ...port, saldo: port.saldo + destTransferAmount };
        }
        return port;
      });

      // 3. Si es Gasto y el destino es Tarjeta de Crédito, registrar el abono/pago a la tarjeta
      let updatedCreditCards = prev.creditCards;
      if (!isIncome && !isTransfer && movement.destinationType === 'card' && movement.destinationId) {
        updatedCreditCards = (prev.creditCards || []).map(c => {
          if (c.id === movement.destinationId) {
            const newPayment: CreditCardPayment = {
              id: `pay-${Date.now()}`,
              amount: movement.amount,
              date: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
              concept: movement.name.trim() || 'Abono / Pago',
              sourceAccountName
            };
            const updatedPayments = [newPayment, ...(c.payments || [])];
            const totalPayments = updatedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

            let newCutoffAmount = c.billingCutoffAmount;
            let newCutoffDate = c.billingCutoffDate;
            let newCutoffBasePayments = c.cutoffBasePayments;

            // Si hay corte activo y los pagos cubren el monto facturado, se quita el corte
            if (c.billingCutoffAmount !== undefined) {
              const paymentsSinceCutoff = Math.max(0, totalPayments - (c.cutoffBasePayments || 0));
              if (paymentsSinceCutoff >= c.billingCutoffAmount) {
                newCutoffAmount = undefined;
                newCutoffDate = undefined;
                newCutoffBasePayments = undefined;
              }
            }

            return {
              ...c,
              billingCutoffAmount: newCutoffAmount,
              billingCutoffDate: newCutoffDate,
              cutoffBasePayments: newCutoffBasePayments,
              payments: updatedPayments,
              purchases: newCutoffAmount === undefined ? (c.purchases || []).map(p => ({ ...p, isAfterCutoff: false })) : c.purchases
            };
          }
          return c;
        });
      }

      // 4. Si el destino es Deuda / Obligación, restar al saldo adeudado
      let updatedDeudas = prev.deudaItems;
      let updatedObligations = prev.obligations;

      // Descontar si es Gasto hacia una deuda por pagar / obligación
      if (!isIncome && !isTransfer && (movement.destinationType === 'deuda' || movement.destinationType === 'obligation') && movement.destinationId) {
        const destId = movement.destinationId;
        const rawId = destId.startsWith('d-') ? destId.replace('d-', '') : (destId.startsWith('o-') ? destId.replace('o-', '') : destId);
        
        updatedDeudas = (prev.deudaItems || []).map(d => {
          if (d.id === destId || d.id === rawId) {
            return {
              ...d,
              monto: Math.max(0, (d.monto || 0) - movement.amount)
            };
          }
          return d;
        });

        updatedObligations = (prev.obligations || []).map(ob => {
          if ((ob.id === destId || ob.id === rawId) && ob.totalDebtBalance !== undefined) {
            return {
              ...ob,
              totalDebtBalance: Math.max(0, ob.totalDebtBalance - movement.amount)
            };
          }
          return ob;
        });
      }

      // Descontar si es Ingreso proveniente de una deuda a mi favor (por_cobrar)
      if (isIncome && movement.destinationType === 'deuda' && movement.destinationId) {
        const debtId = movement.destinationId;
        updatedDeudas = (prev.deudaItems || []).map(d => {
          if (d.id === debtId) {
            return {
              ...d,
              monto: Math.max(0, (d.monto || 0) - movement.amount)
            };
          }
          return d;
        });
      }

      return {
        ...prev,
        billeteraItems: updatedBilletera,
        portfolioItems: updatedPortfolio,
        creditCards: updatedCreditCards,
        deudaItems: updatedDeudas,
        obligations: updatedObligations,
        expenseMovements: [newMovement, ...(prev.expenseMovements || [])]
      };
    });
  };

  const deleteExpenseMovement = (id: string) => {
    setData(prev => ({
      ...prev,
      expenseMovements: (prev.expenseMovements || []).filter(m => m.id !== id)
    }));
  };

  const clearExpenseMovements = () => {
    setData(prev => ({
      ...prev,
      expenseMovements: []
    }));
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

  const addPortfolioItem = (item: { nombre: string; moneda: 'COP' | 'USD'; saldo: number; icon?: string; color?: string }) => {
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

  const addCreditCard = (card: { name: string; period: PaymentPeriod; creditLimit: number; moneda?: 'COP' | 'USD'; minPaymentOverride?: number }) => {
    const newCard: CreditCardItem = {
      id: `cc-${Date.now()}`,
      name: card.name,
      period: card.period,
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

  // Realizar Corte de Tarjeta
  const performCardCutoff = (cardId: string) => {
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.map(c => {
        if (c.id === cardId) {
          const currentTotal = calculateCardPurchasesTotal(c);
          const currentPaymentsTotal = (c.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
          return {
            ...c,
            billingCutoffAmount: currentTotal,
            billingCutoffDate: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
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
          const remainingPurchases = (c.purchases || [])
            .filter(p => p.isAfterCutoff === true)
            .map(p => ({ ...p, isAfterCutoff: false }));
          return {
            ...c,
            billingCutoffAmount: undefined,
            billingCutoffDate: undefined,
            cutoffBasePayments: undefined,
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
            purchases: [],
            payments: []
          };
        }
        return c;
      })
    }));
  };

  // Add Card Purchase (inserted at TOP)
  const addCardPurchase = (cardId: string, purchase: { concept: string; amount: number; moneda?: 'COP' | 'USD' }) => {
    const targetCard = data.creditCards.find(c => c.id === cardId);
    const hasActiveCutoff = targetCard?.billingCutoffAmount !== undefined;

    const newP = {
      id: `p-${Date.now()}`,
      ...purchase,
      moneda: purchase.moneda || targetCard?.moneda || 'COP',
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

  // Editar Compra (modifica concepto y monto)
  const updateCardPurchase = (
    cardId: string,
    purchaseId: string,
    updated: { concept: string; amount: number; moneda?: 'COP' | 'USD' }
  ) => {
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.map(c => {
        if (c.id === cardId) {
          const oldPurchase = (c.purchases || []).find(p => p.id === purchaseId);
          const diff = oldPurchase ? updated.amount - oldPurchase.amount : 0;
          let newCutoff = c.billingCutoffAmount;
          if (newCutoff !== undefined && oldPurchase && !oldPurchase.isAfterCutoff) {
            newCutoff = Math.max(0, newCutoff + diff);
          }
          return {
            ...c,
            billingCutoffAmount: newCutoff,
            purchases: (c.purchases || []).map(p =>
              p.id === purchaseId
                ? { ...p, concept: updated.concept.trim(), amount: updated.amount, moneda: updated.moneda || p.moneda }
                : p
            )
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
          let newCutoff = c.billingCutoffAmount;
          if (targetPurchase && newCutoff !== undefined && !targetPurchase.isAfterCutoff) {
            newCutoff = Math.max(0, newCutoff - targetPurchase.amount);
          }
          return {
            ...c,
            billingCutoffAmount: newCutoff,
            purchases: (c.purchases || []).filter(p => p.id !== purchaseId)
          };
        }
        return c;
      })
    }));
  };

  // Eliminar Registro (Quitar el registro sin alterar el saldo neto de la tarjeta, absorbiendo pagos realizados)
  const deleteCardPurchaseRecord = (cardId: string, purchaseId: string) => {
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.map(c => {
        if (c.id === cardId) {
          const targetPurchase = (c.purchases || []).find(p => p.id === purchaseId);
          if (!targetPurchase) return c;

          let amountToRetire = targetPurchase.amount;
          const updatedPayments: CreditCardPayment[] = [];

          // Consumir pagos aplicados a este registro para que no descuenten de compras futuras
          for (const pay of (c.payments || [])) {
            if (amountToRetire <= 0) {
              updatedPayments.push(pay);
            } else if (pay.amount <= amountToRetire) {
              amountToRetire -= pay.amount;
            } else {
              updatedPayments.push({
                ...pay,
                amount: pay.amount - amountToRetire
              });
              amountToRetire = 0;
            }
          }

          const totalRetired = targetPurchase.amount - amountToRetire;

          let newCutoff = c.billingCutoffAmount;
          let newBase = c.cutoffBasePayments;
          if (newCutoff !== undefined) {
            if (!targetPurchase.isAfterCutoff) {
              newCutoff = Math.max(0, newCutoff - totalRetired);
            }
            if (newBase !== undefined) {
              newBase = Math.max(0, newBase - totalRetired);
            }
          }

          return {
            ...c,
            billingCutoffAmount: newCutoff,
            cutoffBasePayments: newBase,
            payments: updatedPayments,
            purchases: (c.purchases || []).filter(p => p.id !== purchaseId)
          };
        }
        return c;
      })
    }));
  };

  const deleteCardPurchase = cancelCardPurchase;

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
  const addHousingExpense = (item: { name: string; period: PaymentPeriod; totalAmount: number; moneda?: 'COP' | 'USD'; isShared?: boolean; icon?: string }) => {
    const newH: HousingExpense = {
      id: `house-${Date.now()}`,
      isShared: item.isShared !== undefined ? item.isShared : true,
      moneda: item.moneda || 'COP',
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

  const toggleHousingShared = (id: string) => {
    setData(prev => ({
      ...prev,
      housingExpenses: prev.housingExpenses.map(h =>
        h.id === id ? { ...h, isShared: h.isShared === false ? true : false } : h
      )
    }));
  };

  // Obligations CRUD
  const addObligation = (item: { name: string; period: PaymentPeriod; totalAmount: number; totalDebtBalance?: number; moneda?: 'COP' | 'USD'; isShared?: boolean; icon?: string }) => {
    const newOb: ObligationItem = {
      id: `ob-${Date.now()}`,
      isShared: item.isShared !== undefined ? item.isShared : true,
      moneda: item.moneda || 'COP',
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
      id: `sub-${Date.now()}`,
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
        addExpenseMovement,
        deleteExpenseMovement,
        clearExpenseMovements,
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
        clearCardPurchases,
        clearCardPurchasesVisual,
        addCardPurchase,
        updateCardPurchase,
        cancelCardPurchase,
        deleteCardPurchaseRecord,
        deleteCardPurchase,
        moveCardPurchase,
        addHousingExpense,
        updateHousingExpense,
        deleteHousingExpense,
        moveHousingExpense,
        toggleHousingShared,
        addObligation,
        updateObligation,
        deleteObligation,
        moveObligation,
        toggleObligationShared,
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
