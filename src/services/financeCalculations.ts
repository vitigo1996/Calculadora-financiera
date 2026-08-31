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
    etoroCOP: number;
    plentiCOP: number;
    nuEmergenciaCOP: number;
    comfamaCasaCOP: number;
    bancolombiaAhorroCOP: number;
    totalPortafolio: number;
    items: {
      key: string;
      label: string;
      category: string;
      valorCOP: number;
      valorOriginal?: string;
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

export function calculateCardPurchasesTotal(cc: CreditCardItem): number {
  if (cc.purchases && cc.purchases.length > 0) {
    return cc.purchases.reduce((sum, p) => sum + p.amount, 0);
  }
  return 0;
}

export function calculateAllFinances(data: AppFinanceData): CalculatedSummary {
  const activePeople = (data.people || []).filter(p => p.enabled);
  const isShared = data.mode === 'shared' && activePeople.length > 1;
  const p1 = activePeople[0] || { name: 'Yo', monthlyIncome: 0, healthPensionRate: 0.08, enabled: true };
  const p2 = activePeople[1] || { name: 'Persona 2', monthlyIncome: 0, healthPensionRate: 0.0, enabled: false };

  const totalIncome = activePeople.reduce((sum, p) => sum + (p.monthlyIncome || 0), 0);
  const splitMethod = data.expenseSplitMethod || 'proportional';

  // Calculate H4 (p1 ratio) and I4 (p2 ratio) based on selected split method
  let h4 = 1.0;
  let i4 = 0.0;

  if (isShared && activePeople.length >= 2) {
    if (splitMethod === 'equal') {
      // 50/50 o 1/N
      h4 = 1.0 / activePeople.length;
      i4 = 1.0 / activePeople.length;
    } else if (splitMethod === 'equal_remaining') {
      // Remanente igual
      const avgIncome = totalIncome / activePeople.length;
      h4 = totalIncome > 0 ? Math.max(0, Math.min(1, 0.5 + (p1.monthlyIncome - avgIncome) / (totalIncome || 1))) : 0.5;
      i4 = Math.max(0, 1.0 - h4);
    } else {
      // 'proportional': Proporcional a ingresos
      h4 = totalIncome > 0 ? p1.monthlyIncome / totalIncome : 1.0;
      i4 = totalIncome > 0 ? p2.monthlyIncome / totalIncome : 0.0;
    }
  }

  // M3: Salud / Pension = H3 * 0.08
  const m3_saludPension = p1.monthlyIncome * (p1.healthPensionRate || 0.08);

  // Vivienda
  const servObj = data.housingExpenses.find(h => h.referenceCode === '3628') || data.housingExpenses[0];
  const netObj = data.housingExpenses.find(h => h.referenceCode === '07409278') || data.housingExpenses[1];
  const arrObj = data.housingExpenses.find(h => h.name.toLowerCase().includes('arriendo')) || data.housingExpenses[2];

  const g7 = servObj?.totalAmount || 0;
  const h7 = g7 * h4;
  const i7 = g7 * i4;

  const g8 = netObj?.totalAmount || 0;
  const h8 = g8 * h4;
  const i8 = g8 * i4;

  const g9 = arrObj?.totalAmount || 0;
  const h9 = g9 * h4;
  const i9 = g9 * i4;

  const m4_vivienda = h7 + h8 + h9;
  const viviendaDaniela = i7 + i8 + i9;
  const viviendaHogar = g7 + g8 + g9;

  // Obligaciones
  const carroObj = data.obligations.find(o => o.name.toLowerCase().includes('carro'));
  const icetexObj = data.obligations.find(o => o.name.toLowerCase().includes('icetex'));

  const g12 = carroObj?.totalAmount || 1521807;
  const h12 = isShared ? g12 * h4 : g12;
  const i12 = g12;

  const g13 = icetexObj?.totalAmount || 3471648;
  const h13 = icetexObj?.davidAmount !== undefined ? icetexObj.davidAmount : 49719;
  const i13 = icetexObj?.danielaAmount !== undefined ? icetexObj.danielaAmount : 0;

  const m6_obligaciones = h12 + h13;
  const obligacionesDaniela = i12 + i13;

  // Tarjetas de Crédito
  const nuObj = data.creditCards.find(c => c.name.toLowerCase().includes('nu'));
  const falaObj = data.creditCards.find(c => c.name.toLowerCase().includes('falabella'));
  const addiObj = data.creditCards.find(c => c.name.toLowerCase().includes('addi'));

  const nuPurchasesSum = nuObj ? calculateCardPurchasesTotal(nuObj) : 0;
  const g16 = nuPurchasesSum;
  const h16 = nuPurchasesSum;
  const nuCupo = nuObj?.creditLimit || 5000000;
  const nuDisponible = nuCupo - g16;

  const falaPurchasesSum = falaObj ? calculateCardPurchasesTotal(falaObj) : 0;
  const g17 = falaPurchasesSum;
  const h17 = falaPurchasesSum;
  const falaCupo = falaObj?.creditLimit || 4400000;
  const falaDisponible = falaCupo - g17;

  const addiPurchasesSum = addiObj ? calculateCardPurchasesTotal(addiObj) : 0;
  const g18_deuda = addiPurchasesSum > 0 ? addiPurchasesSum : 124950;
  const h18_pago = addiObj?.minPaymentOverride || 41650;
  const addiCupo = addiObj?.creditLimit || 8000000;
  const addiDisponible = addiCupo - g18_deuda;

  const m5_tarjetas = h16 + h17 + h18_pago;

  // Suscripciones
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

  // M7: Total Gastos
  const m7_totalGastos = m3_saludPension + m4_vivienda + m5_tarjetas + m6_obligaciones;

  // M9: Mitad de mes (1st fortnight)
  const m9_mitadDeMes = (m3_saludPension / 2) + h7 + h8 + h17 + h18_pago + h12 + h13;

  // M10: Fin de mes (2nd fortnight)
  const m10_finDeMes = (m3_saludPension / 2) + h9 + h16;

  // M11: Disponible
  const m11_disponible = p1.monthlyIncome - m7_totalGastos;

  // Portafolio
  const dolarRate = data.dolarRate || 3600;
  const etoroAccount = data.billeteraItems?.find(b => b.nombre.toLowerCase().includes('etoro'));
  const plentiAccount = data.billeteraItems?.find(b => b.nombre.toLowerCase().includes('plenti'));

  const etoroUSD = etoroAccount ? etoroAccount.saldo : 5037.0;
  const plentiUSD = plentiAccount ? plentiAccount.saldo : 1500.0;

  const etoroCOP = etoroUSD * dolarRate;
  const plentiCOP = plentiUSD * dolarRate;
  const nuEmergenciaCOP = data.portfolioExtras?.nuEmergenciaCOP || 24001919.0;
  const comfamaCasaCOP = data.portfolioExtras?.comfamaCasaCOP || 2812407.0;
  const bancolombiaAhorroCOP = data.portfolioExtras?.bancolombiaAhorroCOP || 0.0;

  const totalPortafolio = etoroCOP + plentiCOP + nuEmergenciaCOP + comfamaCasaCOP + bancolombiaAhorroCOP;

  const portfolioItems = [
    {
      key: 'etoro',
      label: 'Etoro ETF',
      category: 'Inversión USD',
      valorCOP: etoroCOP,
      valorOriginal: `$${etoroUSD.toLocaleString('es-CO')} USD`,
      percentage: totalPortafolio > 0 ? (etoroCOP / totalPortafolio) * 100 : 0,
      color: '#2563eb'
    },
    {
      key: 'nu',
      label: 'Nu Emergencia',
      category: 'Fondo de Emergencia',
      valorCOP: nuEmergenciaCOP,
      percentage: totalPortafolio > 0 ? (nuEmergenciaCOP / totalPortafolio) * 100 : 0,
      color: '#3b82f6'
    },
    {
      key: 'plenti',
      label: 'Plenti USDt',
      category: 'Dólares Digitales',
      valorCOP: plentiCOP,
      valorOriginal: `$${plentiUSD.toLocaleString('es-CO')} USD`,
      percentage: totalPortafolio > 0 ? (plentiCOP / totalPortafolio) * 100 : 0,
      color: '#60a5fa'
    },
    {
      key: 'comfama',
      label: 'Comfama Casa',
      category: 'Ahorro Vivienda',
      valorCOP: comfamaCasaCOP,
      percentage: totalPortafolio > 0 ? (comfamaCasaCOP / totalPortafolio) * 100 : 0,
      color: '#93c5fd'
    },
    {
      key: 'bancolombia',
      label: 'Bancolombia',
      category: 'Ahorro a la mano',
      valorCOP: bancolombiaAhorroCOP,
      percentage: totalPortafolio > 0 ? (bancolombiaAhorroCOP / totalPortafolio) * 100 : 0,
      color: '#64748b'
    }
  ];

  return {
    mode: data.mode,
    dolar: dolarRate,
    billeteraItems: data.billeteraItems || [],
    p1: {
      name: p1.name,
      income: p1.monthlyIncome,
      ratio: h4,
      healthPension: m3_saludPension
    },
    p2: {
      name: p2.name,
      income: isShared ? p2.monthlyIncome : 0,
      ratio: i4,
      enabled: isShared
    },
    totalIncome,
    vivienda: {
      servicios: {
        total: g7,
        david: h7,
        daniela: i7,
        ref: servObj?.referenceCode || '',
        period: servObj?.period || '1st_fortnight'
      },
      internet: {
        total: g8,
        david: h8,
        daniela: i8,
        ref: netObj?.referenceCode || '',
        period: netObj?.period || '1st_fortnight'
      },
      arriendo: {
        total: g9,
        david: h9,
        daniela: i9,
        period: arrObj?.period || '2nd_fortnight'
      },
      totalDavid: m4_vivienda,
      totalDaniela: viviendaDaniela,
      totalHogar: viviendaHogar
    },
    obligaciones: {
      carro: {
        total: g12,
        david: h12,
        daniela: i12,
        period: carroObj?.period || '1st_fortnight'
      },
      icetex: {
        totalDebt: icetexObj?.totalDebtBalance || g13,
        david: h13,
        daniela: i13,
        period: icetexObj?.period || '1st_fortnight'
      },
      totalDavid: m6_obligaciones,
      totalDaniela: obligacionesDaniela
    },
    tarjetas: {
      nu: { deuda: g16, pagoMinimo: h16, cupoTotal: nuCupo, cupoDisponible: nuDisponible, period: nuObj?.period || '2nd_fortnight' },
      falabella: { deuda: g17, pagoMinimo: h17, cupoTotal: falaCupo, cupoDisponible: falaDisponible, period: falaObj?.period || '1st_fortnight' },
      addi: { deuda: g18_deuda, pagoMinimo: h18_pago, cupoTotal: addiCupo, cupoDisponible: addiDisponible, period: addiObj?.period || '1st_fortnight' },
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
      etoroCOP,
      plentiCOP,
      nuEmergenciaCOP,
      comfamaCasaCOP,
      bancolombiaAhorroCOP,
      totalPortafolio,
      items: portfolioItems
    }
  };
}

export function formatCurrency(amount: number, currency: 'COP' | 'USD' = 'COP'): string {
  if (currency === 'USD') {
    return `$${amount.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
  return `$${Math.round(amount).toLocaleString('es-CO')}`;
}
