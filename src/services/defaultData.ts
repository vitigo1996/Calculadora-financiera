import { AppFinanceData } from '../models/finance';

export const initialFinanceData: AppFinanceData = {
  currencyRateUSD: 3600, // Dólar TRM
  mode: 'shared', // 'single' o 'shared'
  people: [
    {
      id: 'person-1',
      name: 'David',
      monthlyIncome: 4400000,
      healthPensionRate: 0.08,
      enabled: true
    },
    {
      id: 'person-2',
      name: 'Daniela',
      monthlyIncome: 8500000,
      healthPensionRate: 0.0,
      enabled: true
    }
  ],
  housingExpenses: [
    {
      id: 'house-1',
      name: 'Servicios (3628)',
      referenceCode: '3628',
      period: '1st_fortnight',
      totalAmount: 251239
    },
    {
      id: 'house-2',
      name: 'Internet (07409278)',
      referenceCode: '07409278',
      period: '1st_fortnight',
      totalAmount: 91521
    },
    {
      id: 'house-3',
      name: 'Arriendo',
      period: '2nd_fortnight',
      totalAmount: 1367600
    }
  ],
  obligations: [
    {
      id: 'ob-1',
      name: 'Carro',
      period: '1st_fortnight',
      totalAmount: 1521807,
      person1Amount: 519000, // G12 * H4
      person2Amount: 1521807
    },
    {
      id: 'ob-2',
      name: 'Icetex',
      period: '1st_fortnight',
      totalAmount: 49719,
      person1Amount: 49719,
      person2Amount: 0,
      totalDebtBalance: 3471648
    }
  ],
  creditCards: [
    {
      id: 'cc-1',
      name: 'Nu',
      creditLimit: 5000000,
      period: '2nd_fortnight',
      purchases: [
        { id: 'p-1', concept: 'Gasto Nu 1', amount: 233378 },
        { id: 'p-2', concept: 'Gasto Nu 2', amount: 982900 },
        { id: 'p-3', concept: 'Gasto Nu 3', amount: 19200 },
        { id: 'p-4', concept: 'Gasto Nu 4', amount: 25500 },
        { id: 'p-5', concept: 'Gasto Nu 5', amount: 20000 },
        { id: 'p-6', concept: 'Gasto Nu 6', amount: 16500 },
        { id: 'p-7', concept: 'Gasto Nu 7', amount: 129900 },
        { id: 'p-8', concept: 'Gasto Nu 8', amount: 226586 },
        { id: 'p-9', concept: 'Gasto Nu 9', amount: 82207 },
        { id: 'p-10', concept: 'Gasto Nu 10', amount: 51900 }
      ]
    },
    {
      id: 'cc-2',
      name: 'Falabella',
      creditLimit: 4400000,
      period: '1st_fortnight',
      purchases: []
    },
    {
      id: 'cc-3',
      name: 'Addi',
      creditLimit: 8000000,
      period: '1st_fortnight',
      minPaymentOverride: 41650,
      purchases: [
        { id: 'p-addi', concept: 'Deuda Addi', amount: 124950 }
      ]
    }
  ],
  subscriptions: [
    {
      id: 'sub-1',
      name: 'Nintendo',
      totalPrice: 369900,
      members: 8,
      billing: 'yearly',
      active: true
    },
    {
      id: 'sub-2',
      name: 'Spotify',
      totalPrice: 30500,
      members: 6,
      billing: 'monthly',
      active: true
    },
    {
      id: 'sub-3',
      name: 'Netflix',
      totalPrice: 18900,
      members: 1,
      billing: 'monthly',
      active: true
    },
    {
      id: 'sub-4',
      name: 'Crunchyroll',
      totalPrice: 19900,
      members: 1,
      billing: 'monthly',
      active: true
    },
    {
      id: 'sub-5',
      name: 'Gemini',
      totalPrice: 20000,
      members: 1,
      billing: 'monthly',
      active: true
    },
    {
      id: 'sub-6',
      name: 'Datos',
      totalPrice: 43250,
      members: 1,
      billing: 'monthly',
      active: true
    },
    {
      id: 'sub-7',
      name: 'Action Black',
      totalPrice: 224900,
      members: 1,
      billing: 'monthly',
      active: true
    }
  ],
  deudaAutofinanciera: 24166570,
  portfolio: [
    {
      id: 'port-1',
      name: 'ETF',
      institution: 'Etoro',
      type: 'Inversión',
      currency: 'USD',
      balance: 5037 // C3
    },
    {
      id: 'port-2',
      name: 'USDt',
      institution: 'Plenti',
      type: 'Cripto / Dólar',
      currency: 'USD',
      balance: 1500 // C4
    },
    {
      id: 'port-3',
      name: 'Nu',
      institution: 'Emergencia',
      type: 'Emergencia',
      currency: 'COP',
      balance: 24001919 // L16
    },
    {
      id: 'port-4',
      name: 'Comfama',
      institution: 'Casa',
      type: 'Ahorro Casa',
      currency: 'COP',
      balance: 2812407 // L17
    },
    {
      id: 'port-5',
      name: 'Bancolombia',
      institution: 'Ahorro',
      type: 'Ahorro',
      currency: 'COP',
      balance: 350000 // C6
    },
    {
      id: 'port-6',
      name: 'Efectivo',
      institution: 'Efectivo',
      type: 'Efectivo',
      currency: 'COP',
      balance: 130000 // C5
    }
  ],
  annualExpenses: [
    { id: 'ann-1', name: 'Multas' },
    { id: 'ann-2', name: 'Soat y Tecno' },
    { id: 'ann-3', name: 'Declaracion' }
  ],
  lastUpdated: new Date().toISOString()
};
