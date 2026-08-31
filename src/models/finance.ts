export type PaymentPeriod = '1st_fortnight' | '2nd_fortnight';

export interface PersonProfile {
  id: string;
  name: string;
  monthlyIncome: number;
  healthPensionRate: number; // 0.08
  enabled: boolean;
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
  icon?: string;
}

export interface HousingExpense {
  id: string;
  name: string;
  referenceCode?: string;
  period: PaymentPeriod;
  totalAmount: number;
}

export interface ObligationItem {
  id: string;
  name: string;
  period: PaymentPeriod;
  totalAmount: number;
  davidAmount?: number;
  danielaAmount?: number;
  totalDebtBalance?: number;
}

export interface CreditCardItem {
  id: string;
  name: string;
  period: PaymentPeriod;
  creditLimit: number;
  minPaymentOverride?: number;
  purchases: { id: string; concept: string; amount: number }[];
}

export interface SubscriptionItem {
  id: string;
  name: string;
  totalPrice: number;
  members: number;
  billing: 'monthly' | 'yearly';
  active: boolean;
}

export interface AppFinanceData {
  mode: 'single' | 'shared';
  people: [PersonProfile, PersonProfile];
  dolarRate: number; // Tasa USD/COP
  billeteraItems: BilleteraAccountItem[];
  deudaItems: DeudaItem[];
  housingExpenses: HousingExpense[];
  obligations: ObligationItem[];
  creditCards: CreditCardItem[];
  subscriptions: SubscriptionItem[];
  portfolioExtras: {
    nuEmergenciaCOP: number;
    comfamaCasaCOP: number;
    bancolombiaAhorroCOP: number;
  };
  lastUpdated: string;
}
