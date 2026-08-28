export type SplitType = 'proportional' | 'equal' | 'individual_1' | 'individual_2' | 'custom';
export type PaymentPeriod = '1st_fortnight' | '2nd_fortnight' | 'monthly';

export interface PersonProfile {
  id: string;
  name: string;
  monthlyIncome: number;
  healthPensionRate: number; // e.g. 0.08 (8%)
  color: string;
}

export interface HousingExpense {
  id: string;
  name: string;
  referenceCode?: string;
  period: PaymentPeriod;
  totalAmount: number;
  splitType: SplitType;
  customSplitPercent?: number; // % for person 1
}

export interface SubscriptionItem {
  id: string;
  name: string;
  totalPrice: number;
  members: number;
  billing: 'monthly' | 'yearly';
  active: boolean;
  category?: string;
  notes?: string;
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
  notes?: string;
}

export interface InvestmentAsset {
  id: string;
  name: string;
  type: 'ETF' | 'Crypto' | 'Emergencia' | 'Vivienda' | 'Ahorro' | 'Efectivo' | 'Acciones';
  currency: 'COP' | 'USD';
  balance: number;
  institution: string;
  targetPercent?: number;
}

export interface AnnualExpense {
  id: string;
  name: string;
  estimatedAmount: number;
  dueMonth: number; // 1-12
  notes?: string;
}

export interface AppFinanceData {
  currencyRateUSD: number; // USD to COP
  people: [PersonProfile, PersonProfile];
  housingExpenses: HousingExpense[];
  subscriptions: SubscriptionItem[];
  creditCards: CreditCardItem[];
  obligations: ObligationItem[];
  portfolio: InvestmentAsset[];
  annualExpenses: AnnualExpense[];
  lastUpdated: string;
}
