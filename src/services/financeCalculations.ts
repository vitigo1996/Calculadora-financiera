import { AppFinanceData, SubscriptionItem, CreditCardItem, BilleteraAccountItem } from '../models/finance';

export interface CalculatedSummary {
  mode: 'single' | 'shared';
  dolar: number;
  billeteraItems: BilleteraAccountItem[];

  // Ingresos
  p1: {
    name: string;
    income: number;
    ratio: number;
    healthPension: number;
  };
  p2: {
    name: string;
    income: number;
    ratio: number;
    enabled: boolean;
  };
  totalIncome: number;

  // Vivienda
  vivienda: {
    servicios: { total: number; david: number; daniela: number; ref: string; period: string };
    internet: { total: number; david: number; daniela: number; ref: string; period: string };
    arriendo: { total: number; david: number; daniela: number; period: string };
    totalDavid: number;
    totalDaniela: number;
    totalHogar: number;
  };

  // Obligaciones
  obligaciones: {
    carro: { total: number; david: number; daniela: number; period: string };
    icetex: { totalDebt: number; david: number; daniela: number; period: string };
    totalDavid: number;
    totalDaniela: number;
  };

  // Tarjetas de Crédito
  tarjetas: {
    nu: { deuda: number; pagoMinimo: number; cupoTotal: number; cupoDisponible: number; period: string };
    falabella: { deuda: number; pagoMinimo: number; cupoTotal: number; cupoDisponible: number; period: string };
    addi: { deuda: number; pagoMinimo: number; cupoTotal: number; cupoDisponible: number; period: string };
    totalPagoDavid: number;
  };

  // Suscripciones
  suscripciones: {
    items: { id: string; name: string; totalPrice: number; members: number; billing: string; monthlyCost: number; active: boolean }[];
    totalMonthly: number;
  };

  // Presupuesto
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

  // Portafolio
  portafolio: {
    totalPortafolio: number;
    items: {
      id: string;
      label: string;
      moneda: 'COP' | 'USD';
      saldoOriginal: number;
      valorCOP: number;
      percentage: number;
      icon?: string;
      color: string;
    }[];
  };
}

export function calculateSubscriptionMonthlyCost(sub: SubscriptionItem): number {
  const base = sub.totalPrice / (sub.members > 0 ? sub.members : 1);
  return base;
}

export function calculateCardPurchasesTotal(cc: CreditCardItem): number {
  if (cc.purchases && cc.purchases.length > 0) {
    return cc.purchases.reduce((sum, p) => sum + p.amount, 0);
  }
  return 0;
}

export function calculateCardPaymentDue(cc: CreditCardItem): number {
  if (cc.billingCutoffAmount !== undefined) {
    return cc.billingCutoffAmount;
  }
  if (cc.minPaymentOverride !== undefined && cc.minPaymentOverride > 0) {
    return cc.minPaymentOverride;
  }
  return calculateCardPurchasesTotal(cc);
}

export function calculateAllFinances(data: AppFinanceData): CalculatedSummary {
  const baseCurrency = data.baseCurrency || 'COP';
  const dolarRate = data.dolarRate || 3600;

  const activePeople = (data.people || []).filter(p => p.enabled);
  const isShared = data.mode === 'shared' && activePeople.length > 1;
  const p1 = activePeople[0] || { name: 'Yo', monthlyIncome: 0, healthPensionRate: 0.08, enabled: true };
  const p2 = activePeople[1] || { name: 'Persona 2', monthlyIncome: 0, healthPensionRate: 0.0, enabled: false };

  const totalIncome = activePeople.reduce((sum, p) => {
    const pInBase = convertToBase(p.monthlyIncome || 0, p.moneda || 'COP', baseCurrency, dolarRate);
    return sum + pInBase;
  }, 0);

  const p1IncomeBase = convertToBase(p1.monthlyIncome || 0, p1.moneda || 'COP', baseCurrency, dolarRate);
  const p2IncomeBase = convertToBase(p2.monthlyIncome || 0, p2.moneda || 'COP', baseCurrency, dolarRate);

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
      h4 = totalIncome > 0 ? Math.max(0, Math.min(1, 0.5 + (p1IncomeBase - avgIncome) / (totalIncome || 1))) : 0.5;
      i4 = Math.max(0, 1.0 - h4);
    } else {
      h4 = totalIncome > 0 ? p1IncomeBase / totalIncome : 1.0;
      i4 = totalIncome > 0 ? p2IncomeBase / totalIncome : 0.0;
    }
  }

  // M3: Salud / Pensión (Deducciones de ley sobre ingreso de Yo)
  const m3_saludPension = p1IncomeBase * (p1.healthPensionRate || 0.08);

  // 1. Vivienda (Dinámica sumando cada registro según su quincena y distribución)
  let m4_vivienda = 0;
  let viviendaDaniela = 0;
  let viviendaHogar = 0;
  let firstFortnightHousing = 0;
  let secondFortnightHousing = 0;

  (data.housingExpenses || []).forEach(item => {
    const itemAmountBase = convertToBase(item.totalAmount || 0, item.moneda || 'COP', baseCurrency, dolarRate);
    const isItemShared = item.isShared !== false && isShared;
    const myShare = isItemShared ? itemAmountBase * h4 : itemAmountBase;
    const partnerShare = isItemShared ? itemAmountBase * i4 : 0;

    m4_vivienda += myShare;
    viviendaDaniela += partnerShare;
    viviendaHogar += itemAmountBase;

    if (item.period === '2nd_fortnight') {
      secondFortnightHousing += myShare;
    } else {
      firstFortnightHousing += myShare;
    }
  });

  // 2. Obligaciones (Dinámica sumando cuota mensual de cada registro según su quincena y distribución)
  let m6_obligaciones = 0;
  let obligacionesDaniela = 0;
  let firstFortnightObligations = 0;
  let secondFortnightObligations = 0;

  (data.obligations || []).forEach(ob => {
    const monthlyVal = ob.davidAmount !== undefined && ob.davidAmount !== ob.totalAmount && ob.totalDebtBalance
      ? ob.davidAmount
      : ob.totalAmount;
    const obAmountBase = convertToBase(monthlyVal || 0, ob.moneda || 'COP', baseCurrency, dolarRate);
    const isObShared = ob.isShared !== false && isShared;
    const myShare = isObShared ? obAmountBase * h4 : obAmountBase;
    const partnerShare = isObShared ? obAmountBase * i4 : 0;

    m6_obligaciones += myShare;
    obligacionesDaniela += partnerShare;

    if (ob.period === '2nd_fortnight') {
      secondFortnightObligations += myShare;
    } else {
      firstFortnightObligations += myShare;
    }
  });

  // 3. Tarjetas de Crédito (Dinámica sumando pago de cada tarjeta registrada)
  let m5_tarjetas = 0;
  let firstFortnightCards = 0;
  let secondFortnightCards = 0;

  (data.creditCards || []).forEach(cc => {
    const dueAmount = calculateCardPaymentDue(cc);
    const dueAmountBase = convertToBase(dueAmount || 0, cc.moneda || 'COP', baseCurrency, dolarRate);

    m5_tarjetas += dueAmountBase;

    if (cc.period === '2nd_fortnight') {
      secondFortnightCards += dueAmountBase;
    } else {
      firstFortnightCards += dueAmountBase;
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
  const totalMonthlySubs = processedSubs.reduce((sum, s) => {
    const subCostBase = convertToBase(s.monthlyCost, (data.subscriptions?.find(sub => sub.id === s.id)?.moneda) || 'COP', baseCurrency, dolarRate);
    return sum + subCostBase;
  }, 0);

  // M7: Total Gastos del Mes
  const m7_totalGastos = m3_saludPension + m4_vivienda + m6_obligaciones + m5_tarjetas;

  // M9: Mitad de mes (1ª Quincena)
  const m9_mitadDeMes = (m3_saludPension / 2) + firstFortnightHousing + firstFortnightObligations + firstFortnightCards;

  // M10: Fin de mes (2ª Quincena)
  const m10_finDeMes = (m3_saludPension / 2) + secondFortnightHousing + secondFortnightObligations + secondFortnightCards;

  // M11: Disponible del Mes
  const m11_disponible = p1IncomeBase - m7_totalGastos;

  // Portafolio Dinámico
  const distinctPalette = [
    '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'
  ];

  const rawPortItems = data.portfolioItems || [];
  const calculatedPortItems = rawPortItems.map((item, idx) => {
    const valorBase = convertToBase(item.saldo || 0, item.moneda || 'COP', baseCurrency, dolarRate);
    return {
      id: item.id,
      label: item.nombre,
      moneda: item.moneda,
      saldoOriginal: item.saldo,
      valorCOP: valorBase,
      icon: item.icon,
      color: item.color || distinctPalette[idx % distinctPalette.length]
    };
  });

  const totalPortafolio = calculatedPortItems.reduce((sum, item) => sum + item.valorCOP, 0);

  const portfolioItemsWithPercentages = calculatedPortItems.map(item => ({
    ...item,
    percentage: totalPortafolio > 0 ? (item.valorCOP / totalPortafolio) * 100 : 0
  }));

  // Backward compatibility objects for summary
  const nuObj = data.creditCards.find(c => c.name.toLowerCase().includes('nu'));
  const falaObj = data.creditCards.find(c => c.name.toLowerCase().includes('falabella'));
  const addiObj = data.creditCards.find(c => c.name.toLowerCase().includes('addi'));

  const servObj = data.housingExpenses[0];
  const netObj = data.housingExpenses[1];
  const arrObj = data.housingExpenses[2];

  const carroObj = data.obligations[0];
  const icetexObj = data.obligations[1];

  return {
    mode: data.mode,
    dolar: dolarRate,
    billeteraItems: data.billeteraItems || [],
    p1: {
      name: p1.name,
      income: p1IncomeBase,
      ratio: h4,
      healthPension: m3_saludPension
    },
    p2: {
      name: p2.name,
      income: isShared ? p2IncomeBase : 0,
      ratio: i4,
      enabled: isShared
    },
    totalIncome,
    vivienda: {
      servicios: {
        total: servObj?.totalAmount || 0,
        david: (servObj?.totalAmount || 0) * h4,
        daniela: (servObj?.totalAmount || 0) * i4,
        ref: servObj?.referenceCode || '',
        period: servObj?.period || '1st_fortnight'
      },
      internet: {
        total: netObj?.totalAmount || 0,
        david: (netObj?.totalAmount || 0) * h4,
        daniela: (netObj?.totalAmount || 0) * i4,
        ref: netObj?.referenceCode || '',
        period: netObj?.period || '1st_fortnight'
      },
      arriendo: {
        total: arrObj?.totalAmount || 0,
        david: (arrObj?.totalAmount || 0) * h4,
        daniela: (arrObj?.totalAmount || 0) * i4,
        period: arrObj?.period || '2nd_fortnight'
      },
      totalDavid: m4_vivienda,
      totalDaniela: viviendaDaniela,
      totalHogar: viviendaHogar
    },
    obligaciones: {
      carro: {
        total: carroObj?.totalAmount || 0,
        david: (carroObj?.totalAmount || 0) * h4,
        daniela: (carroObj?.totalAmount || 0) * i4,
        period: carroObj?.period || '1st_fortnight'
      },
      icetex: {
        totalDebt: icetexObj?.totalDebtBalance || 0,
        david: icetexObj?.davidAmount !== undefined ? icetexObj.davidAmount : 0,
        daniela: icetexObj?.danielaAmount !== undefined ? icetexObj.danielaAmount : 0,
        period: icetexObj?.period || '1st_fortnight'
      },
      totalDavid: m6_obligaciones,
      totalDaniela: obligacionesDaniela
    },
    tarjetas: {
      nu: {
        deuda: nuObj ? calculateCardPurchasesTotal(nuObj) : 0,
        pagoMinimo: nuObj ? calculateCardPaymentDue(nuObj) : 0,
        cupoTotal: nuObj?.creditLimit || 0,
        cupoDisponible: nuObj ? nuObj.creditLimit - calculateCardPurchasesTotal(nuObj) : 0,
        period: nuObj?.period || '2nd_fortnight'
      },
      falabella: {
        deuda: falaObj ? calculateCardPurchasesTotal(falaObj) : 0,
        pagoMinimo: falaObj ? calculateCardPaymentDue(falaObj) : 0,
        cupoTotal: falaObj?.creditLimit || 0,
        cupoDisponible: falaObj ? falaObj.creditLimit - calculateCardPurchasesTotal(falaObj) : 0,
        period: falaObj?.period || '1st_fortnight'
      },
      addi: {
        deuda: addiObj ? calculateCardPurchasesTotal(addiObj) : 0,
        pagoMinimo: addiObj ? calculateCardPaymentDue(addiObj) : 0,
        cupoTotal: addiObj?.creditLimit || 0,
        cupoDisponible: addiObj ? addiObj.creditLimit - calculateCardPurchasesTotal(addiObj) : 0,
        period: addiObj?.period || '1st_fortnight'
      },
      totalPagoDavid: m5_tarjetas
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
  return `$${Math.round(amount).toLocaleString('es-CO')}`;
}
