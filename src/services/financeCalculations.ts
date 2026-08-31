import { AppFinanceData, SubscriptionItem, CreditCardItem } from '../models/finance';

export interface CalculatedSummary {
  mode: 'single' | 'shared';
  dolar: number; // C2
  etoroUSD: number; // C3
  plentiUSD: number; // C4
  efectivoCOP: number; // C5
  bancolombiaCOP: number; // C6

  // Ingresos (Filas 2-4)
  p1: {
    name: string;
    income: number; // H3
    ratio: number; // H4
    healthPension: number; // M3: H3 * 0.08
  };
  p2: {
    name: string;
    income: number; // I3
    ratio: number; // I4
    enabled: boolean;
  };
  totalIncome: number; // H3 + I3

  // Vivienda (Filas 7-9)
  vivienda: {
    servicios: { total: number; david: number; daniela: number; ref: string; period: string };
    internet: { total: number; david: number; daniela: number; ref: string; period: string };
    arriendo: { total: number; david: number; daniela: number; period: string };
    totalDavid: number; // M4 = SUM(H7:H9)
    totalDaniela: number;
    totalHogar: number;
  };

  // Obligaciones (Filas 12-13)
  obligaciones: {
    carro: { total: number; david: number; daniela: number; period: string };
    icetex: { totalDebt: number; david: number; daniela: number; period: string };
    totalDavid: number; // M6 = SUM(H12:H13)
    totalDaniela: number;
  };

  // Tarjetas de Crédito (Filas 16-18)
  tarjetas: {
    nu: { deuda: number; pagoMinimo: number; cupoTotal: number; cupoDisponible: number; period: string };
    falabella: { deuda: number; pagoMinimo: number; cupoTotal: number; cupoDisponible: number; period: string };
    addi: { deuda: number; pagoMinimo: number; cupoTotal: number; cupoDisponible: number; period: string };
    totalPagoDavid: number; // M5 = SUM(H16:H18)
  };

  // Suscripciones (Filas 8-15 B, C)
  suscripciones: {
    items: { id: string; name: string; totalPrice: number; members: number; billing: string; monthlyCost: number; active: boolean }[];
    totalMonthly: number;
  };

  // Presupuesto (Columnas K y M, Filas 3-11)
  presupuesto: {
    m3_saludPension: number; // =H3*0.08
    m4_vivienda: number; // =SUM(H7:H9)
    m5_tarjetas: number; // =SUM(H16:H18)
    m6_obligaciones: number; // =SUM(H12:H13)
    m7_totalGastos: number; // =SUM(M3:M6)
    m9_mitadDeMes: number; // =H7+H8+H17+H18+H12+H13+(M3/2)
    m10_finDeMes: number; // =H9+H16+(M3/2)
    m11_disponible: number; // =H3-SUM(M3:M6)
  };

  // Portafolio (Filas 13-18 K, L, M, N)
  portafolio: {
    etoroCOP: number; // M14 = C2 * C3
    plentiCOP: number; // M15 = C2 * C4
    nuEmergenciaCOP: number; // M16 = L16
    comfamaCasaCOP: number; // M17 = L17
    bancolombiaAhorroCOP: number; // M18 = L18
    totalPortafolio: number; // SUM(M14:M18)
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

  // Deudas adicionales y contingencias (Filas 18, 22-24)
  deudas: {
    autofinancieraMonto: number; // C18
    multas: string; // B22
    soatTecno: string; // B23
    declaracion: string; // B24
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
  const isShared = data.mode === 'shared' && data.people[1]?.enabled;
  const p1 = data.people[0];
  const p2 = data.people[1];

  const h3 = p1.monthlyIncome;
  const i3 = isShared ? p2.monthlyIncome : 0;
  const totalIncome = h3 + i3;

  // H4, I4 Proportions
  const h4 = totalIncome > 0 ? (isShared ? h3 / totalIncome : 1.0) : 1.0;
  const i4 = totalIncome > 0 ? (isShared ? i3 / totalIncome : 0.0) : 0.0;

  // M3: Salud / Pension = H3 * 0.08
  const m3_saludPension = h3 * (p1.healthPensionRate || 0.08);

  // Vivienda (Filas 7-9)
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

  // M4: =SUM(H7:H9)
  const m4_vivienda = h7 + h8 + h9;
  const viviendaDaniela = i7 + i8 + i9;
  const viviendaHogar = g7 + g8 + g9;

  // Obligaciones (Filas 12-13)
  const carroObj = data.obligations.find(o => o.name.toLowerCase().includes('carro'));
  const icetexObj = data.obligations.find(o => o.name.toLowerCase().includes('icetex'));

  const g12 = carroObj?.totalAmount || 1521807;
  const h12 = isShared ? g12 * h4 : g12;
  const i12 = g12; // Daniela en Excel: =1521807

  const g13 = icetexObj?.totalAmount || 3471648;
  const h13 = icetexObj?.davidAmount !== undefined ? icetexObj.davidAmount : 49719;
  const i13 = icetexObj?.danielaAmount !== undefined ? icetexObj.danielaAmount : 0;

  // M6: =SUM(H12:H13)
  const m6_obligaciones = h12 + h13;
  const obligacionesDaniela = i12 + i13;

  // Tarjetas de Crédito (Filas 16-18)
  const nuObj = data.creditCards.find(c => c.name.toLowerCase().includes('nu'));
  const falaObj = data.creditCards.find(c => c.name.toLowerCase().includes('falabella'));
  const addiObj = data.creditCards.find(c => c.name.toLowerCase().includes('addi'));

  // Nu: G16 = H16 = suma de compras
  const nuPurchasesSum = nuObj ? calculateCardPurchasesTotal(nuObj) : 0;
  const g16 = nuPurchasesSum;
  const h16 = nuPurchasesSum;
  const nuCupo = nuObj?.creditLimit || 5000000;
  const i16 = nuCupo - g16; // Cupo disponible

  // Falabella: G17 = 0, H17 = G17, I17 = 4400000 - G17
  const falaPurchasesSum = falaObj ? calculateCardPurchasesTotal(falaObj) : 0;
  const g17 = falaPurchasesSum;
  const h17 = falaPurchasesSum;
  const falaCupo = falaObj?.creditLimit || 4400000;
  const i17 = falaCupo - g17;

  // Addi: G18 = 124950 (deuda), H18 = 41650 (pago mínimo), I18 = 8000000 - G18
  const addiPurchasesSum = addiObj ? calculateCardPurchasesTotal(addiObj) : 124950;
  const g18 = addiPurchasesSum;
  const h18 = addiObj?.minPaymentOverride !== undefined ? addiObj.minPaymentOverride : 41650;
  const addiCupo = addiObj?.creditLimit || 8000000;
  const i18 = addiCupo - g18;

  // M5: =SUM(H16:H18)
  const m5_tarjetas = h16 + h17 + h18;

  // M7: Total Gastos = SUM(M3:M6)
  const m7_totalGastos = m3_saludPension + m4_vivienda + m5_tarjetas + m6_obligaciones;

  // M9: Mitad de mes = H7+H8+H17+H18+H12+H13+(M3/2)
  const m9_mitadDeMes = h7 + h8 + h17 + h18 + h12 + h13 + (m3_saludPension / 2);

  // M10: Fin de mes = H9+H16+(M3/2)
  const m10_finDeMes = h9 + h16 + (m3_saludPension / 2);

  // M11: Disponible = H3-SUM(M3:M6)
  const m11_disponible = h3 - m7_totalGastos;

  // Suscripciones
  const subItems = data.subscriptions.map(s => ({
    id: s.id,
    name: s.name,
    totalPrice: s.totalPrice,
    members: s.members,
    billing: s.billing,
    monthlyCost: calculateSubscriptionMonthlyCost(s),
    active: s.active
  }));
  const totalSubMonthly = subItems.reduce((acc, s) => acc + (s.active ? s.monthlyCost : 0), 0);

  // Portafolio (Filas 14-18)
  const c2 = data.billetera.dolar;
  const c3 = data.billetera.etoroUSD;
  const c4 = data.billetera.plentiUSD;

  const m14 = c2 * c3; // ETF
  const m15 = c2 * c4; // USDt
  const m16 = data.portfolioExtras.nuEmergenciaCOP; // Nu Emergencia
  const m17 = data.portfolioExtras.comfamaCasaCOP; // Comfama Casa
  const m18 = data.portfolioExtras.bancolombiaAhorroCOP; // Bancolombia

  const totalPortafolio = m14 + m15 + m16 + m17 + m18;

  const portItems = [
    {
      key: 'etoro',
      label: 'ETF',
      category: 'Inversión Global (eToro)',
      valorCOP: m14,
      valorOriginal: `${c3.toLocaleString('en-US')} USD`,
      percentage: totalPortafolio > 0 ? (m14 / totalPortafolio) * 100 : 0,
      color: '#10b981'
    },
    {
      key: 'plenti',
      label: 'USDt',
      category: 'Dólar Digital (Plenti)',
      valorCOP: m15,
      valorOriginal: `${c4.toLocaleString('en-US')} USD`,
      percentage: totalPortafolio > 0 ? (m15 / totalPortafolio) * 100 : 0,
      color: '#3b82f6'
    },
    {
      key: 'nu',
      label: 'Nu',
      category: 'Emergencia',
      valorCOP: m16,
      percentage: totalPortafolio > 0 ? (m16 / totalPortafolio) * 100 : 0,
      color: '#8b5cf6'
    },
    {
      key: 'comfama',
      label: 'Comfama',
      category: 'Casa',
      valorCOP: m17,
      percentage: totalPortafolio > 0 ? (m17 / totalPortafolio) * 100 : 0,
      color: '#f59e0b'
    },
    {
      key: 'bancolombia',
      label: 'Bancolombia',
      category: 'Ahorro',
      valorCOP: m18,
      percentage: totalPortafolio > 0 ? (m18 / totalPortafolio) * 100 : 0,
      color: '#06b6d4'
    }
  ];

  return {
    mode: data.mode,
    dolar: c2,
    etoroUSD: c3,
    plentiUSD: c4,
    efectivoCOP: data.billetera.efectivoCOP,
    bancolombiaCOP: data.billetera.bancolombiaCOP,
    p1: {
      name: p1.name,
      income: h3,
      ratio: h4,
      healthPension: m3_saludPension
    },
    p2: {
      name: p2.name,
      income: i3,
      ratio: i4,
      enabled: isShared
    },
    totalIncome,
    vivienda: {
      servicios: { total: g7, david: h7, daniela: i7, ref: servObj?.referenceCode || '3628', period: '1ª Quincena' },
      internet: { total: g8, david: h8, daniela: i8, ref: netObj?.referenceCode || '07409278', period: '1ª Quincena' },
      arriendo: { total: g9, david: h9, daniela: i9, period: '2ª Quincena' },
      totalDavid: m4_vivienda,
      totalDaniela: viviendaDaniela,
      totalHogar: viviendaHogar
    },
    obligaciones: {
      carro: { total: g12, david: h12, daniela: i12, period: '1ª Quincena' },
      icetex: { totalDebt: g13, david: h13, daniela: i13, period: '1ª Quincena' },
      totalDavid: m6_obligaciones,
      totalDaniela: obligacionesDaniela
    },
    tarjetas: {
      nu: { deuda: g16, pagoMinimo: h16, cupoTotal: nuCupo, cupoDisponible: i16, period: '2ª Quincena' },
      falabella: { deuda: g17, pagoMinimo: h17, cupoTotal: falaCupo, cupoDisponible: i17, period: '1ª Quincena' },
      addi: { deuda: g18, pagoMinimo: h18, cupoTotal: addiCupo, cupoDisponible: i18, period: '1ª Quincena' },
      totalPagoDavid: m5_tarjetas
    },
    suscripciones: {
      items: subItems,
      totalMonthly: totalSubMonthly
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
      etoroCOP: m14,
      plentiCOP: m15,
      nuEmergenciaCOP: m16,
      comfamaCasaCOP: m17,
      bancolombiaAhorroCOP: m18,
      totalPortafolio,
      items: portItems
    },
    deudas: {
      autofinancieraMonto: data.deudas.autofinancieraMonto,
      multas: data.deudas.multas,
      soatTecno: data.deudas.soatTecno,
      declaracion: data.deudas.declaracion
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
