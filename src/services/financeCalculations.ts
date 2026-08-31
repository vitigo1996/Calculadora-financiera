import { AppFinanceData, SubscriptionItem, CreditCardItem } from '../models/finance';

export interface FinanceSummary {
  mode: 'single' | 'shared';
  dolarRate: number;
  p1: {
    name: string;
    income: number;
    ratio: number;
    healthPension: number;
    housingTotal: number;
    cardsTotal: number;
    obligationsTotal: number;
    totalGastos: number;
    mitadDeMes: number;
    finDeMes: number;
    disponible: number;
  };
  p2: {
    name: string;
    income: number;
    ratio: number;
    enabled: boolean;
  };
  subscriptionsTotal: number;
  portfolio: {
    totalPortafolio: number;
    items: {
      id: string;
      name: string;
      institution: string;
      currency: string;
      balance: number;
      valorCOP: number;
      percentage: number;
      color: string;
    }[];
  };
}

export function calculateSubscriptionMonthlyCost(sub: SubscriptionItem): number {
  if (!sub.active) return 0;
  const base = sub.totalPrice / (sub.members > 0 ? sub.members : 1);
  return sub.billing === 'yearly' ? base / 12 : base;
}

export function calculateCreditCardPayment(cc: CreditCardItem): number {
  if (cc.minPaymentOverride !== undefined) {
    return cc.minPaymentOverride;
  }
  if (cc.purchases && cc.purchases.length > 0) {
    return cc.purchases.reduce((sum, p) => sum + p.amount, 0);
  }
  return 0;
}

export function calculateFinanceSummary(data: AppFinanceData): FinanceSummary {
  const isShared = data.mode === 'shared' && data.people[1]?.enabled;
  const p1 = data.people[0];
  const p2 = data.people[1];

  const p1Income = p1.monthlyIncome;
  const p2Income = isShared ? p2.monthlyIncome : 0;
  const totalIncome = p1Income + p2Income;

  const p1Ratio = totalIncome > 0 ? (isShared ? p1Income / totalIncome : 1.0) : 1.0;
  const p2Ratio = totalIncome > 0 ? (isShared ? p2Income / totalIncome : 0.0) : 0.0;

  // M3: Salud / Pensión = H3 * 0.08
  const healthPension = p1Income * (p1.healthPensionRate || 0.08);

  // Vivienda (Filas 7 a 9)
  // H7: Servicios * H4
  const servicios = data.housingExpenses.find(h => h.referenceCode === '3628') || data.housingExpenses[0];
  const internet = data.housingExpenses.find(h => h.referenceCode === '07409278') || data.housingExpenses[1];
  const arriendo = data.housingExpenses.find(h => h.name.toLowerCase().includes('arriendo')) || data.housingExpenses[2];

  const h7_servicios = (servicios?.totalAmount || 0) * p1Ratio;
  const h8_internet = (internet?.totalAmount || 0) * p1Ratio;
  const h9_arriendo = (arriendo?.totalAmount || 0) * p1Ratio;

  // M4: Vivienda = SUM(H7:H9)
  const housingTotal = h7_servicios + h8_internet + h9_arriendo;

  // Tarjetas de Crédito (Filas 16 a 18)
  const nuCard = data.creditCards.find(c => c.name.toLowerCase().includes('nu'));
  const falabellaCard = data.creditCards.find(c => c.name.toLowerCase().includes('falabella'));
  const addiCard = data.creditCards.find(c => c.name.toLowerCase().includes('addi'));

  const h16_nu = nuCard ? calculateCreditCardPayment(nuCard) : 0;
  const h17_falabella = falabellaCard ? calculateCreditCardPayment(falabellaCard) : 0;
  const h18_addi = addiCard ? calculateCreditCardPayment(addiCard) : 0;

  // M5: Tarjetas = SUM(H16:H18)
  const cardsTotal = h16_nu + h17_falabella + h18_addi;

  // Obligaciones (Filas 12 a 13)
  const carro = data.obligations.find(o => o.name.toLowerCase().includes('carro'));
  const icetex = data.obligations.find(o => o.name.toLowerCase().includes('icetex'));

  const h12_carro = isShared ? (carro ? carro.totalAmount * p1Ratio : 0) : (carro ? carro.totalAmount : 0);
  const h13_icetex = icetex ? icetex.person1Amount : 0;

  // M6: Obligaciones = SUM(H12:H13)
  const obligationsTotal = h12_carro + h13_icetex;

  // M7: Total Gastos = SUM(M3:M6)
  const totalGastos = healthPension + housingTotal + cardsTotal + obligationsTotal;

  // M9: Mitad de mes = H7 + H8 + H17 + H18 + H12 + H13 + (M3/2)
  const mitadDeMes = h7_servicios + h8_internet + h17_falabella + h18_addi + h12_carro + h13_icetex + (healthPension / 2);

  // M10: Fin de mes = H9 + H16 + (M3/2)
  const finDeMes = h9_arriendo + h16_nu + (healthPension / 2);

  // M11: Disponible = H3 - SUM(M3:M6)
  const disponible = p1Income - totalGastos;

  // Subscripciones total
  const subscriptionsTotal = data.subscriptions.reduce((sum, sub) => sum + calculateSubscriptionMonthlyCost(sub), 0);

  // Portafolio (Filas 14 a 18 de columnas K, L, M, N)
  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899', '#84cc16'];
  let totalPortafolio = 0;

  const portfolioItems = data.portfolio.map((asset, idx) => {
    let valorCOP = asset.balance;
    if (asset.currency === 'USD') {
      valorCOP = asset.balance * data.currencyRateUSD;
    }
    totalPortafolio += valorCOP;
    return {
      id: asset.id,
      name: asset.name,
      institution: asset.institution,
      currency: asset.currency,
      balance: asset.balance,
      valorCOP,
      percentage: 0,
      color: colors[idx % colors.length]
    };
  });

  const portfolioWithPercentage = portfolioItems.map(item => ({
    ...item,
    percentage: totalPortafolio > 0 ? (item.valorCOP / totalPortafolio) * 100 : 0
  }));

  return {
    mode: data.mode,
    dolarRate: data.currencyRateUSD,
    p1: {
      name: p1.name,
      income: p1Income,
      ratio: p1Ratio,
      healthPension,
      housingTotal,
      cardsTotal,
      obligationsTotal,
      totalGastos,
      mitadDeMes,
      finDeMes,
      disponible
    },
    p2: {
      name: p2.name,
      income: p2Income,
      ratio: p2Ratio,
      enabled: isShared
    },
    subscriptionsTotal,
    portfolio: {
      totalPortafolio,
      items: portfolioWithPercentage
    }
  };
}

export function formatCurrency(amount: number, currency: 'COP' | 'USD' = 'COP'): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(amount);
  }
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(amount);
}
