import { AppFinanceData } from '../models/finance';

export const initialFinanceData: AppFinanceData = {
  lastUpdated: new Date().toISOString(),
  mode: 'single',
  baseCurrency: 'COP',
  expenseSplitMethod: 'proportional',
  people: [
    {
      id: 'p-1',
      name: 'Yo',
      monthlyIncome: 0,
      healthPensionRate: 0.08,
      enabled: true
    }
  ],
  dolarRate: 3600,
  billeteraItems: [],
  deudaItems: [],
  portfolioItems: [],
  housingExpenses: [],
  obligations: [],
  creditCards: [],
  subscriptions: [],
  expenseMovements: []
};
