import {
  AppFinanceData,
  HousingExpense,
  ObligationItem,
  CreditCardItem,
  SubscriptionItem
} from '../models/finance';

export interface CalculatedSummary {
  ingresos: {
    p1Income: number;
    p2Income: number;
    totalIncome: number;
    ratioYo: number;
    ratioDaniela: number;
    isShared: boolean;
  };
  gastosFijos: {
    viviendaDaniela: number;
    viviendaHogar: number;
    obligacionesDaniela: number;
    firstFortnightHousing: number;
    secondFortnightHousing: number;
    firstFortnightObligations: number;
    secondFortnightObligations: number;
    firstFortnightCards: number;
    secondFortnightCards: number;
    totalMonthlyGastosFijos: number;
  };
  vivienda: {
    totalMonth: number;
    totalYear: number;
    items: HousingExpense[];
  };
  obligaciones: {
    totalMonthly: number;
    totalDebtBalance: number;
    items: ObligationItem[];
  };
  tarjetasCredito: {
    totalCreditLimit: number;
    totalDueThisMonth: number;
    cards: CreditCardItem[];
  };
  suscripciones: {
    items: any[];
    totalMonthly: number;
  };
  presupuesto: {
    m3_saludPension: number;
    m4_vivienda: number;
    m5_tarjetas: number;
    m6_obligaciones: number;
    m7_totalGastos: number;
    m9_mitadDeMes: number;
    m10_finDeMes: number;
    m11_disponible: number;
  };
  portafolio: {
    totalPortafolio: number;
    items: any[];
  };
}

export function calculateSubscriptionMonthlyCost(sub: SubscriptionItem): number {
  const members = Math.max(1, sub.members || 1);
  return (sub.totalPrice || 0) / members;
}

export function calculateCardPurchasesTotal(cc: CreditCardItem): number {
  const allPurchases = cc.purchases || [];
  const paidPurchasesSum = allPurchases.filter(p => p.isPaid).reduce((sum, p) => sum + (p.amount || 0), 0);
  const unpaidPurchasesSum = allPurchases.filter(p => !p.isPaid).reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPayments = (cc.payments || []).reduce((sum, pay) => sum + (pay.amount || 0), 0);

  // Los pagos cubren los registros pagados; solo los registros no pagados menos pagos excedentes cuentan hacia la deuda
  const extraPayments = Math.max(0, totalPayments - paidPurchasesSum);
  return Math.max(0, unpaidPurchasesSum - extraPayments);
}

export function calculateCardPaymentDue(cc: CreditCardItem): number {
  if (cc.minPaymentOverride !== undefined && cc.minPaymentOverride > 0) {
    return cc.minPaymentOverride;
  }
  const totalPurchases = (cc.purchases || []).reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPayments = (cc.payments || []).reduce((sum, pay) => sum + (pay.amount || 0), 0);

  if (totalPurchases === 0) {
    return 0;
  }

  if (cc.billingCutoffAmount !== undefined && cc.billingCutoffAmount > 0) {
    const preCutoffPurchasesSum = (cc.purchases || []).filter(p => !p.isAfterCutoff).reduce((sum, p) => sum + (p.amount || 0), 0);
    if (preCutoffPurchasesSum === 0) {
      return calculateCardPurchasesTotal(cc);
    }
    const paymentsSinceCutoff = Math.max(0, totalPayments - (cc.cutoffBasePayments || 0));
    const effectiveCutoff = Math.min(preCutoffPurchasesSum, cc.billingCutoffAmount);
    const cutoffRemaining = Math.max(0, effectiveCutoff - paymentsSinceCutoff);
    if (cutoffRemaining > 0) {
      return cutoffRemaining;
    }
    // Si la deuda facturada en el corte ya se pagó en su totalidad, continuar con lo que siga activo en la deuda
    return calculateCardPurchasesTotal(cc);
  }

  return calculateCardPurchasesTotal(cc);
}

export function calculateAllFinances(data: AppFinanceData): CalculatedSummary {
  const activePeople = (data.people || []).filter((p, idx) => idx === 0 ? true : (p.enabled && (p.monthlyIncome || 0) > 0));
  const isShared = data.mode === 'shared' && activePeople.length > 1;
  const p1 = activePeople[0] || { name: 'Yo', monthlyIncome: 0, healthPensionRate: 0.08, enabled: true };
  const p2 = activePeople[1] || { name: 'Persona 2', monthlyIncome: 0, healthPensionRate: 0.0, enabled: false };

  const totalIncome = activePeople.reduce((sum, p) => sum + (p.monthlyIncome || 0), 0);
  const p1Income = p1.monthlyIncome || 0;
  const p2Income = p2.monthlyIncome || 0;

  const splitMethod = data.expenseSplitMethod || 'proportional';

  // Calculate H4 (p1 ratio / aporte proporcional de Yo)
  let h4 = 1.0;
  let i4 = 0.0;

  if (isShared && activePeople.length >= 2) {
    if (splitMethod === 'equal') {
      h4 = 1.0 / activePeople.length;
      i4 = 1.0 / activePeople.length;
    } else if (splitMethod === 'equal_remaining') {
      const avgIncome = totalIncome / activePeople.length;
      h4 = totalIncome > 0 ? Math.max(0, Math.min(1, 0.5 + (p1Income - avgIncome) / (totalIncome || 1))) : 0.5;
      i4 = Math.max(0, 1.0 - h4);
    } else {
      h4 = totalIncome > 0 ? p1Income / totalIncome : 1.0;
      i4 = totalIncome > 0 ? p2Income / totalIncome : 0.0;
    }
  }

  // M3: Salud / Pensión (Deducciones de ley sobre ingreso de Yo)
  const m3_saludPension = p1Income * (p1.healthPensionRate || 0.08);

  // 1. Vivienda (Dinámica sumando cada registro según su quincena y distribución)
  let m4_vivienda = 0;
  let viviendaDaniela = 0;
  let viviendaHogar = 0;
  let mitadDeMesHousing = 0;
  let finDeMesHousing = 0;

  (data.housingExpenses || []).forEach(item => {
    const itemAmount = item.totalAmount || 0;
    const isItemShared = item.isShared !== false && isShared;
    const myShare = isItemShared ? itemAmount * h4 : itemAmount;
    const partnerShare = isItemShared ? itemAmount * i4 : 0;

    m4_vivienda += myShare;
    viviendaDaniela += partnerShare;
    viviendaHogar += itemAmount;

    const isMitad = item.paymentDay !== undefined ? item.paymentDay >= 16 : item.period === '2nd_fortnight';
    if (isMitad) {
      mitadDeMesHousing += myShare;
    } else {
      finDeMesHousing += myShare;
    }
  });

  // 2. Obligaciones (Dinámica sumando cuota mensual de cada registro según su quincena y distribución)
  let m6_obligaciones = 0;
  let obligacionesDaniela = 0;
  let mitadDeMesObligations = 0;
  let finDeMesObligations = 0;

  (data.obligations || []).forEach(ob => {
    const monthlyVal = ob.davidAmount !== undefined && ob.davidAmount !== ob.totalAmount && ob.totalDebtBalance
      ? ob.davidAmount
      : ob.totalAmount;
    const obAmount = monthlyVal || 0;
    const isObShared = ob.isShared !== false && isShared;
    const myShare = isObShared ? obAmount * h4 : obAmount;
    const partnerShare = isObShared ? obAmount * i4 : 0;

    m6_obligaciones += myShare;
    obligacionesDaniela += partnerShare;

    const isMitad = ob.paymentDay !== undefined ? ob.paymentDay >= 16 : ob.period === '2nd_fortnight';
    if (isMitad) {
      mitadDeMesObligations += myShare;
    } else {
      finDeMesObligations += myShare;
    }
  });

  // 3. Tarjetas de Crédito (Dinámica sumando pago de cada tarjeta registrada)
  let m5_tarjetas = 0;
  let mitadDeMesCards = 0;
  let finDeMesCards = 0;

  (data.creditCards || []).forEach(cc => {
    const dueAmount = calculateCardPaymentDue(cc) || 0;

    m5_tarjetas += dueAmount;

    const isMitad = cc.paymentDay !== undefined ? cc.paymentDay >= 16 : cc.period === '2nd_fortnight';
    if (isMitad) {
      mitadDeMesCards += dueAmount;
    } else {
      finDeMesCards += dueAmount;
    }
  });

  // 4. Suscripciones
  const processedSubs = (data.subscriptions || []).map(sub => ({
    id: sub.id,
    name: sub.name,
    totalPrice: sub.totalPrice,
    members: sub.members,
    billing: sub.billing,
    monthlyCost: calculateSubscriptionMonthlyCost(sub),
    active: sub.active
  }));
  const totalMonthlySubs = processedSubs.reduce((sum, s) => sum + s.monthlyCost, 0);

  // M7: Total Gastos del Mes (Deducciones de ley excluidas de presupuesto según requerimiento)
  const m7_totalGastos = m4_vivienda + m6_obligaciones + m5_tarjetas;

  // M9: Mitad de mes (Vencimientos del 16 al último día del mes, pagados con la quincena del 15)
  const m9_mitadDeMes = mitadDeMesHousing + mitadDeMesObligations + mitadDeMesCards;

  // M10: Fin de mes (Vencimientos del 1 al 15, pagados con la quincena de fin de mes)
  const m10_finDeMes = finDeMesHousing + finDeMesObligations + finDeMesCards;

  // M11: Disponible del Mes
  const m11_disponible = p1Income - m7_totalGastos;

  // Portafolio Dinámico
  const distinctPalette = [
    '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'
  ];

  const rawPortItems = data.portfolioItems || [];
  const baseCurrency = data.baseCurrency || 'COP';
  const dolarRate = data.dolarRate || 3600;

  const calculatedPortItems = rawPortItems.map((item, idx) => {
    const itemMoneda = item.moneda || 'COP';
    const valorCOP = convertToBase(item.saldo || 0, itemMoneda, baseCurrency, dolarRate);
    return {
      id: item.id,
      label: item.nombre,
      moneda: itemMoneda,
      saldoOriginal: item.saldo,
      valorCOP,
      icon: item.icon,
      color: item.color || distinctPalette[idx % distinctPalette.length]
    };
  });

  const totalPortafolio = calculatedPortItems.reduce((sum, item) => sum + item.valorCOP, 0);

  const portfolioItemsWithPercentages = calculatedPortItems.map(item => {
    const percentage = totalPortafolio > 0 ? (item.valorCOP / totalPortafolio) * 100 : 0;
    return {
      ...item,
      percentage
    };
  });

  // Totales de vivienda
  const totalHousingMonth = (data.housingExpenses || []).reduce((acc, h) => acc + (h.totalAmount || 0), 0);
  const totalHousingYear = totalHousingMonth * 12;

  // Totales de obligaciones
  const totalMonthlyObligations = (data.obligations || []).reduce((acc, ob) => acc + (ob.totalAmount || 0), 0);
  const totalDebtBalance = (data.obligations || []).reduce((acc, ob) => acc + (ob.totalDebtBalance || 0), 0);

  // Totales de tarjetas
  const totalCreditLimit = (data.creditCards || []).reduce((acc, c) => acc + (c.creditLimit || 0), 0);
  const totalCreditCardDue = m5_tarjetas;

  return {
    ingresos: {
      p1Income,
      p2Income,
      totalIncome,
      ratioYo: h4,
      ratioDaniela: i4,
      isShared
    },
    gastosFijos: {
      viviendaDaniela,
      viviendaHogar,
      obligacionesDaniela,
      firstFortnightHousing: finDeMesHousing,
      secondFortnightHousing: mitadDeMesHousing,
      firstFortnightObligations: finDeMesObligations,
      secondFortnightObligations: mitadDeMesObligations,
      firstFortnightCards: finDeMesCards,
      secondFortnightCards: mitadDeMesCards,
      totalMonthlyGastosFijos: m4_vivienda + m6_obligaciones
    },
    vivienda: {
      totalMonth: totalHousingMonth,
      totalYear: totalHousingYear,
      items: data.housingExpenses || []
    },
    obligaciones: {
      totalMonthly: totalMonthlyObligations,
      totalDebtBalance,
      items: data.obligations || []
    },
    tarjetasCredito: {
      totalCreditLimit,
      totalDueThisMonth: totalCreditCardDue,
      cards: data.creditCards || []
    },
    suscripciones: {
      items: processedSubs,
      totalMonthly: totalMonthlySubs
    },
    presupuesto: {
      m3_saludPension,
      m4_vivienda,
      m5_tarjetas,
      m6_obligaciones,
      m7_totalGastos,
      m9_mitadDeMes,
      m10_finDeMes,
      m11_disponible
    },
    portafolio: {
      totalPortafolio,
      items: portfolioItemsWithPercentages
    }
  };
}

export function convertToBase(
  amount: number,
  itemCurrency: 'COP' | 'USD' = 'COP',
  baseCurrency: 'COP' | 'USD' = 'COP',
  dolarRate: number = 3600
): number {
  if (itemCurrency === baseCurrency) return amount;
  if (itemCurrency === 'USD' && baseCurrency === 'COP') return amount * dolarRate;
  if (itemCurrency === 'COP' && baseCurrency === 'USD') return dolarRate > 0 ? amount / dolarRate : 0;
  return amount;
}

export function formatWithEquivalence(
  amount: number,
  itemCurrency: 'COP' | 'USD' = 'COP',
  baseCurrency: 'COP' | 'USD' = 'COP',
  dolarRate: number = 3600
) {
  const isDifferent = itemCurrency !== baseCurrency;
  const equivalent = convertToBase(amount, itemCurrency, baseCurrency, dolarRate);
  return {
    isDifferent,
    itemCurrency,
    baseCurrency,
    equivalentAmount: equivalent,
    formattedOriginal: formatCurrency(amount, itemCurrency),
    formattedEquivalent: formatCurrency(equivalent, baseCurrency)
  };
}

export function formatCurrency(amount: number, currency: 'COP' | 'USD' = 'COP'): string {
  if (currency === 'USD') {
    return `$${amount.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
  return `$${Math.round(amount || 0).toLocaleString('es-CO')}`;
}
