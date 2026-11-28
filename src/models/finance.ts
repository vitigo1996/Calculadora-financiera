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
  period?: PaymentPeriod;
  paymentDay?: number;
  totalAmount: number;
  moneda?: 'COP' | 'USD';
  isShared?: boolean;
  icon?: string;
}

export interface ObligationItem {
  id: string;
  name: string;
  period?: PaymentPeriod;
  paymentDay?: number;
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
  icon?: string;
  isAfterCutoff?: boolean;
  isPaid?: boolean;
  hidden?: boolean;
}

export interface CreditCardPayment {
  id: string;
  amount: number;
  date: string;
  concept?: string;
  sourceAccountName?: string;
}

export interface CreditCardItem {
  id: string;
  name: string;
  period?: PaymentPeriod;
  paymentDay?: number;
  cutoffDay?: number;
  creditLimit: number;
  moneda?: 'COP' | 'USD';
  minPaymentOverride?: number;
  billingCutoffAmount?: number; // Saldo congelado al hacer corte
  billingCutoffDate?: string;
  lastCutoffDate?: string;
  cutoffBasePayments?: number; // Total acumulado de pagos al momento del corte
  installments?: number;        // Cuotas pendientes de la deuda total al momento de definirlas
  installmentsSetAt?: string;   // Fecha ISO en que se definieron las cuotas (inicia la cuenta regresiva mensual)
  purchases: CreditCardPurchase[];
  payments?: CreditCardPayment[];
}

export interface SubscriptionItem {
  id: string;
  name: string;
  totalPrice: number;
  members: number;
  billing: 'monthly' | 'yearly';
  period?: PaymentPeriod;
  paymentDay?: number;
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
  icon?: string;
  sourceAccountId: string;
  sourceAccountName: string;
  destinationType?: 'none' | 'card' | 'obligation' | 'account' | 'deuda' | 'portfolio';
  destinationId?: string;
  destinationName?: string;
  date: string;
  // --- Trazabilidad para revertir el movimiento con exactitud al eliminarlo ---
  // (opcionales: los registros antiguos no los tienen y se revierten con lógica heredada)
  sourceKind?: 'billetera' | 'portfolio';   // Tipo de cuenta de origen resuelto al crear
  destKind?: 'billetera' | 'portfolio';     // Tipo de cuenta destino (solo transferencias)
  sourceApplied?: number;                   // Monto realmente aplicado al origen (moneda del origen)
  destApplied?: number;                     // Monto realmente aplicado al destino (moneda del destino)
  cardPaymentId?: string;                   // Id del abono creado en la tarjeta destino
  clearedCutoff?: {                         // Corte de tarjeta que este pago cerró (para restaurarlo)
    amount: number;
    date?: string;
    basePayments?: number;
  };
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
