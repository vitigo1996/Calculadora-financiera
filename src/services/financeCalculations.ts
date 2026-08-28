import { AppFinanceData, HousingExpense, SubscriptionItem, CreditCardItem, ObligationItem, InvestmentAsset } from '../models/finance';

export interface FinanceSummary {
  p1: {
    name: string;
    grossIncome: number;
    healthPension: number;
    netIncome: number;
    ratio: number;
    housingShare: number;
    obligationsShare: number;
    creditCardsShare: number;
    subscriptionsShare: number;
    totalExpenses: number;
    fortnight1Need: number;
    fortnight2Need: number;
    availableCash: number;
    savingsRatePercent: number;
  };
  p2: {
    name: string;
    grossIncome: number;
    healthPension: number;
    netIncome: number;
    ratio: number;
    housingShare: number;
    obligationsShare: number;
    creditCardsShare: number;
    totalExpenses: number;
  };
  household: {
    totalGrossIncome: number;
    totalExpenses: number;
    totalAvailableCash: number;
    fortnight1Total: number;
    fortnight2Total: number;
  };
  portfolio: {
    totalNetWorthCOP: number;
    totalUSD: number;
    totalCOP: number;
    emergencyFundCOP: number;
    emergencyFundMonths: number;
    distribution: { name: string; type: string; balanceCOP: number; percentage: number; color: string }[];
  };
}

export function calculateSubscriptionMonthlyCost(sub: SubscriptionItem): number {
  if (!sub.active) return 0;
  const base = sub.totalPrice / (sub.members > 0 ? sub.members : 1);
  return sub.billing === 'yearly' ? base / 12 : base;
}

export function calculateCreditCardDebt(cc: CreditCardItem): number {
  if (cc.purchases && cc.purchases.length > 0) {
    return cc.purchases.reduce((sum, p) => sum + p.amount, 0);
  }
  return 0;
}

export function calculateCreditCardPayment(cc: CreditCardItem): number {
  if (cc.minPaymentOverride !== undefined) {
    return cc.minPaymentOverride;
  }
  return calculateCreditCardDebt(cc);
}

export function calculateFinanceSummary(data: AppFinanceData): FinanceSummary {
  const [p1, p2] = data.people;
  const totalGrossIncome = p1.monthlyIncome + p2.monthlyIncome;
  const p1Ratio = totalGrossIncome > 0 ? p1.monthlyIncome / totalGrossIncome : 0.5;
  const p2Ratio = totalGrossIncome > 0 ? p2.monthlyIncome / totalGrossIncome : 0.5;

  const p1HealthPension = p1.monthlyIncome * p1.healthPensionRate;
  const p2HealthPension = p2.monthlyIncome * p2.healthPensionRate;

  // Vivienda Breakdown
  let p1HousingTotal = 0;
  let p2HousingTotal = 0;
  let p1Housing1st = 0;
  let p1Housing2nd = 0;
  let householdHousing1st = 0;
  let householdHousing2nd = 0;

  data.housingExpenses.forEach(exp => {
    let p1Share = 0;
    let p2Share = 0;

    if (exp.splitType === 'proportional') {
      p1Share = exp.totalAmount * p1Ratio;
      p2Share = exp.totalAmount * p2Ratio;
    } else if (exp.splitType === 'equal') {
      p1Share = exp.totalAmount * 0.5;
      p2Share = exp.totalAmount * 0.5;
    } else if (exp.splitType === 'individual_1') {
      p1Share = exp.totalAmount;
      p2Share = 0;
    } else if (exp.splitType === 'individual_2') {
      p1Share = 0;
      p2Share = exp.totalAmount;
    } else if (exp.splitType === 'custom' && exp.customSplitPercent !== undefined) {
      p1Share = exp.totalAmount * (exp.customSplitPercent / 100);
      p2Share = exp.totalAmount * ((100 - exp.customSplitPercent) / 100);
    }

    p1HousingTotal += p1Share;
    p2HousingTotal += p2Share;

    if (exp.period === '1st_fortnight') {
      p1Housing1st += p1Share;
      householdHousing1st += exp.totalAmount;
    } else if (exp.period === '2nd_fortnight') {
      p1Housing2nd += p1Share;
      householdHousing2nd += exp.totalAmount;
    } else {
      p1Housing1st += p1Share / 2;
      p1Housing2nd += p1Share / 2;
      householdHousing1st += exp.totalAmount / 2;
      householdHousing2nd += exp.totalAmount / 2;
    }
  });

  // Suscripciones
  let p1SubscriptionsTotal = 0;
  data.subscriptions.forEach(sub => {
    p1SubscriptionsTotal += calculateSubscriptionMonthlyCost(sub);
  });

  // Tarjetas de Crédito
  let p1Cards1st = 0;
  let p1Cards2nd = 0;
  let householdCards1st = 0;
  let householdCards2nd = 0;

  data.creditCards.forEach(cc => {
    const payment = calculateCreditCardPayment(cc);
    if (cc.period === '1st_fortnight') {
      p1Cards1st += payment;
      householdCards1st += payment;
    } else if (cc.period === '2nd_fortnight') {
      p1Cards2nd += payment;
      householdCards2nd += payment;
    } else {
      p1Cards1st += payment / 2;
      p1Cards2nd += payment / 2;
      householdCards1st += payment / 2;
      householdCards2nd += payment / 2;
    }
  });

  const p1CardsTotal = p1Cards1st + p1Cards2nd;

  // Obligaciones
  let p1ObligationsTotal = 0;
  let p2ObligationsTotal = 0;
  let p1Obligations1st = 0;
  let p1Obligations2nd = 0;
  let householdObligations1st = 0;
  let householdObligations2nd = 0;

  data.obligations.forEach(ob => {
    p1ObligationsTotal += ob.person1Amount;
    p2ObligationsTotal += ob.person2Amount;

    if (ob.period === '1st_fortnight') {
      p1Obligations1st += ob.person1Amount;
      householdObligations1st += (ob.person1Amount + ob.person2Amount);
    } else if (ob.period === '2nd_fortnight') {
      p1Obligations2nd += ob.person1Amount;
      householdObligations2nd += (ob.person1Amount + ob.person2Amount);
    } else {
      p1Obligations1st += ob.person1Amount / 2;
      p1Obligations2nd += ob.person1Amount / 2;
      householdObligations1st += (ob.person1Amount + ob.person2Amount) / 2;
      householdObligations2nd += (ob.person1Amount + ob.person2Amount) / 2;
    }
  });

  // Fortnight Totals for P1
  // Salud/Pensión dividida en dos quincenas
  const p1HealthFortnight = p1HealthPension / 2;
  const p1Fortnight1Need = p1Housing1st + p1Obligations1st + p1Cards1st + p1HealthFortnight + (p1SubscriptionsTotal / 2);
  const p1Fortnight2Need = p1Housing2nd + p1Obligations2nd + p1Cards2nd + p1HealthFortnight + (p1SubscriptionsTotal / 2);

  const p1TotalExpenses = p1HealthPension + p1HousingTotal + p1CardsTotal + p1ObligationsTotal + p1SubscriptionsTotal;
  const p1NetIncome = p1.monthlyIncome - p1HealthPension;
  const p1AvailableCash = p1.monthlyIncome - p1TotalExpenses;
  const p1SavingsRate = p1.monthlyIncome > 0 ? (p1AvailableCash / p1.monthlyIncome) * 100 : 0;

  // P2
  const p2TotalExpenses = p2HealthPension + p2HousingTotal + p2ObligationsTotal;
  const p2NetIncome = p2.monthlyIncome - p2HealthPension;

  // Household
  const householdExpenses = p1TotalExpenses + p2TotalExpenses;
  const householdAvailable = totalGrossIncome - householdExpenses;
  const householdFortnight1 = householdHousing1st + householdCards1st + householdObligations1st + (p1HealthPension + p2HealthPension) / 2;
  const householdFortnight2 = householdHousing2nd + householdCards2nd + householdObligations2nd + (p1HealthPension + p2HealthPension) / 2;

  // Portfolio & Net Worth
  let totalNetWorthCOP = 0;
  let totalUSD = 0;
  let totalCOP = 0;
  let emergencyFundCOP = 0;

  const colorPalette = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16'];

  const assetListWithCOP = data.portfolio.map((asset, idx) => {
    let balanceCOP = 0;
    if (asset.currency === 'USD') {
      balanceCOP = asset.balance * data.currencyRateUSD;
      totalUSD += asset.balance;
    } else {
      balanceCOP = asset.balance;
      totalCOP += asset.balance;
    }
    totalNetWorthCOP += balanceCOP;

    if (asset.type === 'Emergencia') {
      emergencyFundCOP += balanceCOP;
    }

    return {
      name: asset.name,
      type: asset.type,
      balanceCOP,
      color: colorPalette[idx % colorPalette.length]
    };
  });

  const distribution = assetListWithCOP.map(item => ({
    ...item,
    percentage: totalNetWorthCOP > 0 ? (item.balanceCOP / totalNetWorthCOP) * 100 : 0
  }));

  // Emergency Fund Months Coverage (based on P1 expenses or household)
  const monthlyBurnRate = p1TotalExpenses > 0 ? p1TotalExpenses : 1;
  const emergencyFundMonths = emergencyFundCOP / monthlyBurnRate;

  return {
    p1: {
      name: p1.name,
      grossIncome: p1.monthlyIncome,
      healthPension: p1HealthPension,
      netIncome: p1NetIncome,
      ratio: p1Ratio,
      housingShare: p1HousingTotal,
      obligationsShare: p1ObligationsTotal,
      creditCardsShare: p1CardsTotal,
      subscriptionsShare: p1SubscriptionsTotal,
      totalExpenses: p1TotalExpenses,
      fortnight1Need: p1Fortnight1Need,
      fortnight2Need: p1Fortnight2Need,
      availableCash: p1AvailableCash,
      savingsRatePercent: p1SavingsRate
    },
    p2: {
      name: p2.name,
      grossIncome: p2.monthlyIncome,
      healthPension: p2HealthPension,
      netIncome: p2NetIncome,
      ratio: p2Ratio,
      housingShare: p2HousingTotal,
      obligationsShare: p2ObligationsTotal,
      creditCardsShare: 0,
      totalExpenses: p2TotalExpenses
    },
    household: {
      totalGrossIncome,
      totalExpenses: householdExpenses,
      totalAvailableCash: householdAvailable,
      fortnight1Total: householdFortnight1,
      fortnight2Total: householdFortnight2
    },
    portfolio: {
      totalNetWorthCOP,
      totalUSD,
      totalCOP,
      emergencyFundCOP,
      emergencyFundMonths,
      distribution
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
