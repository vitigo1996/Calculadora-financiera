export type PaymentPeriod = '1st_fortnight' | '2nd_fortnight';

export interface PersonProfile {
  id: string;
  name: string;
  monthlyIncome: number;
  healthPensionRate: number; // 0.08
  enabled: boolean;
}

export interface BilleteraSaldos {
  dolar: number; // C2
  etoroUSD: number; // C3
  plentiUSD: number; // C4
  efectivoCOP: number; // C5
  bancolombiaCOP: number; // C6
}

export interface DeudasBilletera {
  autofinancieraMonto: number; // C18: 24166570
  multas: string; // B22
  soatTecno: string; // B23
  declaracion: string; // B24
}

export interface HousingExpense {
  id: string;
  name: string;
  referenceCode?: string;
  period: PaymentPeriod;
  totalAmount: number; // G7, G8, G9
}

export interface ObligationItem {
  id: string;
  name: string;
  period: PaymentPeriod;
  totalAmount: number; // G12, G13
  davidAmount?: number; // H12, H13
  danielaAmount?: number; // I12, I13
  totalDebtBalance?: number;
}

export interface CreditCardItem {
  id: string;
  name: string; // Nu, Falabella, Addi
  period: PaymentPeriod;
  creditLimit: number; // Cupo total
  minPaymentOverride?: number; // Pago mínimo
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

export interface PortfolioItem {
  id: string;
  name: string; // ETF, USDt, Nu, Comfama, Bancolombia
  category: string; // Emergencia, Casa, Ahorro, Inversión
  currency: 'COP' | 'USD';
  balance: number;
}

export interface AppFinanceData {
  mode: 'single' | 'shared';
  people: [PersonProfile, PersonProfile];
  billetera: BilleteraSaldos;
  deudas: DeudasBilletera;
  housingExpenses: HousingExpense[];
  obligations: ObligationItem[];
  creditCards: CreditCardItem[];
  subscriptions: SubscriptionItem[];
  portfolioExtras: {
    nuEmergenciaCOP: number; // L16: 24001919
    comfamaCasaCOP: number; // L17: 2812407
    bancolombiaAhorroCOP: number; // L18: 0
  };
  lastUpdated: string;
}
