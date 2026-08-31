export type PaymentPeriod = '1st_fortnight' | '2nd_fortnight';

export interface PersonProfile {
  id: string;
  name: string;
  monthlyIncome: number;
  healthPensionRate: number; // 0.08 default
  enabled: boolean;
}

export interface HousingExpense {
  id: string;
  name: string;
  referenceCode?: string;
  period: PaymentPeriod;
  totalAmount: number;
}

export interface SubscriptionItem {
  id: string;
  name: string;
  totalPrice: number;
  members: number;
  billing: 'monthly' | 'yearly';
  active: boolean;
}

export interface CreditCardItem {
  id: string;
  name: string;
  creditLimit: number;
  period: PaymentPeriod;
  purchases: { id: string; concept: string; amount: number }[];
  minPaymentOverride?: number;
}

export interface ObligationItem {
  id: string;
  name: string;
  period: PaymentPeriod;
  totalAmount: number;
  person1Amount: number;
  person2Amount: number;
  totalDebtBalance?: number;
}

export interface InvestmentAsset {
  id: string;
  name: string;
  type: string;
  currency: 'COP' | 'USD';
  balance: number;
  institution: string;
}

export interface AnnualExpense {
  id: string;
  name: string;
  estimatedAmount?: number;
}

export interface AppFinanceData {
  currencyRateUSD: number; // Dólar TRM
  mode: 'single' | 'shared'; // Solo o Compartido
  people: [PersonProfile, PersonProfile];
  housingExpenses: HousingExpense[];
  subscriptions: SubscriptionItem[];
  creditCards: CreditCardItem[];
  obligations: ObligationItem[];
  portfolio: InvestmentAsset[];
  deudaAutofinanciera: number;
  annualExpenses: AnnualExpense[];
  lastUpdated: string;
}
