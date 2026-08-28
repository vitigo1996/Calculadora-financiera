import { AppFinanceData } from '../models/finance';

export const initialFinanceData: AppFinanceData = {
  currencyRateUSD: 3600, // Tasa Dólar / COP configurable
  people: [
    {
      id: 'person-1',
      name: 'David',
      monthlyIncome: 4400000,
      healthPensionRate: 0.08,
      color: '#10b981' // emerald
    },
    {
      id: 'person-2',
      name: 'Daniela',
      monthlyIncome: 8500000,
      healthPensionRate: 0.0,
      color: '#6366f1' // indigo
    }
  ],
  housingExpenses: [
    {
      id: 'house-1',
      name: 'Servicios',
      referenceCode: '3628',
      period: '1st_fortnight',
      totalAmount: 251239,
      splitType: 'proportional'
    },
    {
      id: 'house-2',
      name: 'Internet',
      referenceCode: '07409278',
      period: '1st_fortnight',
      totalAmount: 91521,
      splitType: 'proportional'
    },
    {
      id: 'house-3',
      name: 'Arriendo',
      referenceCode: 'Inmobiliaria',
      period: '2nd_fortnight',
      totalAmount: 1367600,
      splitType: 'proportional'
    }
  ],
  subscriptions: [
    {
      id: 'sub-1',
      name: 'Nintendo Familiar',
      totalPrice: 369900,
      members: 8,
      billing: 'yearly',
      active: true,
      category: 'Entretenimiento'
    },
    {
      id: 'sub-2',
      name: 'Spotify Familiar',
      totalPrice: 30500,
      members: 6,
      billing: 'monthly',
      active: true,
      category: 'Música'
    },
    {
      id: 'sub-3',
      name: 'Netflix',
      totalPrice: 18900,
      members: 1,
      billing: 'monthly',
      active: true,
      category: 'Streaming'
    },
    {
      id: 'sub-4',
      name: 'Crunchyroll',
      totalPrice: 19900,
      members: 1,
      billing: 'monthly',
      active: true,
      category: 'Anime'
    },
    {
      id: 'sub-5',
      name: 'Gemini Advanced AI',
      totalPrice: 20000,
      members: 1,
      billing: 'monthly',
      active: true,
      category: 'Productividad'
    },
    {
      id: 'sub-6',
      name: 'Plan de Datos Móvil',
      totalPrice: 43250,
      members: 1,
      billing: 'monthly',
      active: true,
      category: 'Telefonía'
    },
    {
      id: 'sub-7',
      name: 'Gimnasio Action Black',
      totalPrice: 224900,
      members: 1,
      billing: 'monthly',
      active: true,
      category: 'Salud y Deporte'
    }
  ],
  creditCards: [
    {
      id: 'cc-1',
      name: 'Tarjeta Nu',
      creditLimit: 5000000,
      period: '2nd_fortnight',
      purchases: [
        { id: 'p-1', concept: 'Compra 1', amount: 233378 },
        { id: 'p-2', concept: 'Compra Mayor', amount: 982900 },
        { id: 'p-3', concept: 'Servicios Streaming', amount: 19200 },
        { id: 'p-4', concept: 'Restaurante', amount: 25500 },
        { id: 'p-5', concept: 'Suscripción App', amount: 20000 },
        { id: 'p-6', concept: 'Farmacia', amount: 16500 },
        { id: 'p-7', concept: 'Ropa / Calzado', amount: 129900 },
        { id: 'p-8', concept: 'Supermercado', amount: 226586 },
        { id: 'p-9', concept: 'Combustible', amount: 82207 },
        { id: 'p-10', concept: 'Varios', amount: 51900 }
      ]
    },
    {
      id: 'cc-2',
      name: 'Tarjeta Falabella',
      creditLimit: 4400000,
      period: '1st_fortnight',
      purchases: []
    },
    {
      id: 'cc-3',
      name: 'Addi Crédito',
      creditLimit: 8000000,
      period: '1st_fortnight',
      minPaymentOverride: 41650,
      purchases: [
        { id: 'p-addi', concept: 'Financiamiento Cuotas', amount: 124950 }
      ]
    }
  ],
  obligations: [
    {
      id: 'ob-1',
      name: 'Cuota Carro',
      period: '1st_fortnight',
      totalAmount: 1521807,
      person1Amount: 519000, // Aporte según proporción o cuota acordada
      person2Amount: 1521807,
      notes: 'Vehículo familiar'
    },
    {
      id: 'ob-2',
      name: 'Crédito Icetex',
      period: '1st_fortnight',
      totalAmount: 49719,
      person1Amount: 49719,
      person2Amount: 0,
      totalDebtBalance: 3471648,
      notes: 'Crédito Educativo'
    },
    {
      id: 'ob-3',
      name: 'Autofinanciera',
      period: '1st_fortnight',
      totalAmount: 0,
      person1Amount: 0,
      person2Amount: 0,
      totalDebtBalance: 24166570,
      notes: 'Plan vehículo / Deuda a capital'
    }
  ],
  portfolio: [
    {
      id: 'asset-1',
      name: 'eToro (Inversiones Globales)',
      type: 'ETF',
      currency: 'USD',
      balance: 5037,
      institution: 'eToro Broker'
    },
    {
      id: 'asset-2',
      name: 'Plenti (Dólar Digital)',
      type: 'Crypto',
      currency: 'USD',
      balance: 1500,
      institution: 'Plenti USDt'
    },
    {
      id: 'asset-3',
      name: 'Nu Cajita (Fondo Emergencia)',
      type: 'Emergencia',
      currency: 'COP',
      balance: 24001919,
      institution: 'Nu Bank'
    },
    {
      id: 'asset-4',
      name: 'Comfama (Ahorro Vivienda / Cesantías)',
      type: 'Vivienda',
      currency: 'COP',
      balance: 2812407,
      institution: 'Comfama'
    },
    {
      id: 'asset-5',
      name: 'Bancolombia Cuenta Principal',
      type: 'Ahorro',
      currency: 'COP',
      balance: 350000,
      institution: 'Bancolombia'
    },
    {
      id: 'asset-6',
      name: 'Efectivo Disponible',
      type: 'Efectivo',
      currency: 'COP',
      balance: 130000,
      institution: 'Efectivo'
    }
  ],
  annualExpenses: [
    {
      id: 'ann-1',
      name: 'SOAT y Tecnomecánica',
      estimatedAmount: 950000,
      dueMonth: 10,
      notes: 'Revisión anual obligatoria'
    },
    {
      id: 'ann-2',
      name: 'Declaración de Renta',
      estimatedAmount: 400000,
      dueMonth: 8,
      notes: 'Impuestos DIAN y honorarios contables'
    },
    {
      id: 'ann-3',
      name: 'Multas y Contingencias',
      estimatedAmount: 200000,
      dueMonth: 12,
      notes: 'Fondo de imprevistos vehicular'
    }
  ],
  lastUpdated: new Date().toISOString()
};
