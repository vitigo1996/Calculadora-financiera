import { AppFinanceData } from '../models/finance';

export const initialFinanceData: AppFinanceData = {
  mode: 'shared',
  people: [
    {
      id: 'p-1',
      name: 'David',
      monthlyIncome: 4400000, // H3
      healthPensionRate: 0.08,
      enabled: true
    },
    {
      id: 'p-2',
      name: 'Daniela',
      monthlyIncome: 8500000, // I3
      healthPensionRate: 0.0,
      enabled: true
    }
  ],
  billetera: {
    dolar: 3600, // C2 (Dólar TRM)
    etoroUSD: 5037.0, // C3 (Etoro)
    plentiUSD: 1500.0, // C4 (Plenti)
    efectivoCOP: 130000.0, // C5 (Efectivo)
    bancolombiaCOP: 350000.0 // C6 (Bancolombia)
  },
  deudas: {
    autofinancieraMonto: 24166570.0, // B18, C18
    multas: 'Multas y Contingencias', // B22
    soatTecno: 'SOAT y Tecnomecánica', // B23
    declaracion: 'Declaración de Renta' // B24
  },
  housingExpenses: [
    {
      id: 'house-1',
      name: 'Servicios (3628)',
      referenceCode: '3628',
      period: '1st_fortnight',
      totalAmount: 251239.0 // G7
    },
    {
      id: 'house-2',
      name: 'Internet (07409278)',
      referenceCode: '07409278',
      period: '1st_fortnight',
      totalAmount: 91521.0 // G8
    },
    {
      id: 'house-3',
      name: 'Arriendo',
      period: '2nd_fortnight',
      totalAmount: 1367600.0 // G9
    }
  ],
  obligations: [
    {
      id: 'ob-1',
      name: 'Carro',
      period: '1st_fortnight',
      totalAmount: 1521807.0, // G12
      davidAmount: 519000.0, // H12 = G12 * H4
      danielaAmount: 1521807.0 // I12
    },
    {
      id: 'ob-2',
      name: 'Icetex',
      period: '1st_fortnight',
      totalAmount: 3471648.0, // G13 (saldo deuda)
      davidAmount: 49719.0, // H13 (pago David)
      danielaAmount: 0.0, // I13
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
      minPaymentOverride: 41650, // H18
      purchases: [
        { id: 'p-addi', concept: 'Deuda Addi', amount: 124950 } // G18
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
    nuEmergenciaCOP: 24001919.0, // L16 / M16
    comfamaCasaCOP: 2812407.0, // L17 / M17
    bancolombiaAhorroCOP: 0.0 // L18 / M18
  },
  lastUpdated: new Date().toISOString()
};
