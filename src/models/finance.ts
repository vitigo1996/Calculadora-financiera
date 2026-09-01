export type PaymentPeriod = '1st_fortnight' | '2nd_fortnight';

export type ExpenseSplitMethod = 'proportional' | 'equal' | 'equal_remaining';

export interface PersonProfile {
  id: string;
  name: string;
  monthlyIncome: number;
  healthPensionRate: number;
  enabled: boolean;
  moneda?: 'COP' | 'USD';
}

export interface BilleteraAccountItem {
  id: string;
  nombre: string;
  moneda: 'COP' | 'USD';
  saldo: number;
  icon?: string;
}

export interface DeudaItem {
  id: string;
  nombre: string;
  monto?: number;
  moneda: 'COP' | 'USD';
  tipo: 'por_cobrar' | 'por_pagar'; // por_cobrar = me deben, por_pagar = debo
  icon?: string;
}

export interface PortfolioAccountItem {
  id: string;
  nombre: string;
  moneda: 'COP' | 'USD';
  saldo: number;
  icon?: string;
  color?: string;
}

export interface HousingExpense {
  id: string;
  name: string;
  referenceCode?: string;
  period: PaymentPeriod;
  totalAmount: number;
  moneda?: 'COP' | 'USD';
  isShared?: boolean;
  icon?: string;
}

export interface ObligationItem {
  id: string;
  name: string;
  period: PaymentPeriod;
  totalAmount: number;
  davidAmount?: number;
  danielaAmount?: number;
  totalDebtBalance?: number;
  moneda?: 'COP' | 'USD';
  isShared?: boolean;
  icon?: string;
}

export interface CreditCardPurchase {
  id: string;
  concept: string;
  amount: number;
  moneda?: 'COP' | 'USD';
  date?: string;
  isAfterCutoff?: boolean;
  isPaid?: boolean;
}

export interface CreditCardItem {
  id: string;
  name: string;
  period: PaymentPeriod;
  creditLimit: number;
  moneda?: 'COP' | 'USD';
  minPaymentOverride?: number;
  billingCutoffAmount?: number; // Saldo congelado al hacer corte
  billingCutoffDate?: string;
  purchases: CreditCardPurchase[];
}

export interface SubscriptionItem {
  id: string;
  name: string;
  totalPrice: number;
  members: number;
  billing: 'monthly' | 'yearly';
  period?: PaymentPeriod;
  billingMonth?: string;
  moneda?: 'COP' | 'USD';
  active: boolean;
  icon?: string;
}

export interface ExpenseMovement {
  id: string;
  type?: 'expense' | 'income' | 'transfer';
  name: string;
  amount: number;
  moneda: 'COP' | 'USD';
  sourceAccountId: string;
  sourceAccountName: string;
  destinationType?: 'none' | 'card' | 'obligation' | 'account';
  destinationId?: string;
  destinationName?: string;
  date: string;
}

export interface AppFinanceData {
  mode: 'single' | 'shared';
  baseCurrency?: 'COP' | 'USD';
  expenseSplitMethod?: ExpenseSplitMethod;
  people: PersonProfile[];
  dolarRate: number; // Tasa USD/COP
  dolarRateLiveUpdated?: string;
  billeteraItems: BilleteraAccountItem[];
  expenseMovements?: ExpenseMovement[];
  deudaItems: DeudaItem[];
  portfolioItems: PortfolioAccountItem[];
  housingExpenses: HousingExpense[];
  obligations: ObligationItem[];
  creditCards: CreditCardItem[];
  subscriptions: SubscriptionItem[];
  portfolioExtras?: {
    nuEmergenciaCOP: number;
    comfamaCasaCOP: number;
    bancolombiaAhorroCOP: number;
  };
  lastUpdated: string;
}
