import { AppFinanceData } from '../models/finance';

export const initialFinanceData: AppFinanceData = {
  mode: 'shared',
  people: [
    {
      id: 'p-1',
      name: 'David',
      monthlyIncome: 4400000,
      healthPensionRate: 0.08,
      enabled: true
    },
    {
      id: 'p-2',
      name: 'Daniela',
      monthlyIncome: 8500000,
      healthPensionRate: 0.0,
      enabled: true
    }
  ],
  dolarRate: 3600,
  billeteraItems: [
    {
      id: 'acc-etoro',
      nombre: 'Etoro',
      moneda: 'USD',
      saldo: 5037.0
    },
    {
      id: 'acc-plenti',
      nombre: 'Plenti',
      moneda: 'USD',
      saldo: 1500.0
    },
    {
      id: 'acc-efectivo',
      nombre: 'Efectivo',
      moneda: 'COP',
      saldo: 130000.0
    },
    {
      id: 'acc-bancolombia',
      nombre: 'Bancolombia',
      moneda: 'COP',
      saldo: 350000.0
    }
  ],
  deudaItems: [
    {
      id: 'deuda-auto',
      nombre: 'Autofinanciera',
      monto: 24166570.0
    },
    {
      id: 'deuda-multas',
      nombre: 'Multas',
      monto: 0
    },
    {
      id: 'deuda-soat',
      nombre: 'Soat y Tecno',
      monto: 0
    },
    {
      id: 'deuda-declaracion',
      nombre: 'Declaracion',
      monto: 0
    }
  ],
  housingExpenses: [
    {
      id: 'house-1',
      name: 'Servicios (3628)',
      referenceCode: '3628',
      period: '1st_fortnight',
      totalAmount: 251239.0
    },
    {
      id: 'house-2',
      name: 'Internet (07409278)',
      referenceCode: '07409278',
      period: '1st_fortnight',
      totalAmount: 91521.0
    },
    {
      id: 'house-3',
      name: 'Arriendo',
      period: '2nd_fortnight',
      totalAmount: 1367600.0
    }
  ],
  obligations: [
    {
      id: 'ob-1',
      name: 'Carro',
      period: '1st_fortnight',
      totalAmount: 1521807.0,
      davidAmount: 519000.0,
      danielaAmount: 1521807.0
    },
    {
      id: 'ob-2',
      name: 'Icetex',
      period: '1st_fortnight',
      totalAmount: 3471648.0,
      davidAmount: 49719.0,
      danielaAmount: 0.0,
      totalDebtBalance: 3471648.0
    }
  ],
  creditCards: [
    {
      id: 'cc-1',
      name: 'Nu',
      period: '2nd_fortnight',
      creditLimit: 5000000,
      purchases: [
        { id: 'p-1', concept: 'Compra 1', amount: 233378 },
        { id: 'p-2', concept: 'Compra Mayor', amount: 982900 },
        { id: 'p-3', concept: 'Servicios Streaming', amount: 19200 },
        { id: 'p-4', concept: 'Restaurante', amount: 25500 },
        { id: 'p-5', concept: 'App', amount: 20000 },
        { id: 'p-6', concept: 'Farmacia', amount: 16500 },
        { id: 'p-7', concept: 'Ropa', amount: 129900 },
        { id: 'p-8', concept: 'Supermercado', amount: 226586 },
        { id: 'p-9', concept: 'Combustible', amount: 82207 },
        { id: 'p-10', concept: 'Varios', amount: 51900 }
      ]
    },
    {
      id: 'cc-2',
      name: 'Falabella',
      period: '1st_fortnight',
      creditLimit: 4400000,
      purchases: []
    },
    {
      id: 'cc-3',
      name: 'Addi',
      period: '1st_fortnight',
      creditLimit: 8000000,
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
  portfolioExtras: {
    nuEmergenciaCOP: 24001919.0,
    comfamaCasaCOP: 2812407.0,
    bancolombiaAhorroCOP: 0.0
  },
  lastUpdated: new Date().toISOString()
};
