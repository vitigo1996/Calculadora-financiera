import { describe, it, expect } from 'vitest';
import {
  calculateAllFinances,
  calculateCardPurchasesTotal,
  calculateCardPaymentDue,
  calculateSubscriptionMonthlyCost,
  getCardBillingCycleStartDate,
  isPurchaseBeforeCurrentMonthBillingDate,
  parsePurchaseDate,
  isWithinMonths,
  formatCurrency,
  getPurchaseInstallmentInfo
} from '../financeCalculations';
import { AppFinanceData, CreditCardItem, SubscriptionItem } from '../../models/finance';
import { initialFinanceData } from '../defaultData';

describe('financeCalculations Service', () => {
  describe('formatCurrency', () => {
    it('formats COP correctly with standard thousands separator', () => {
      const formatted = formatCurrency(50000, 'COP');
      expect(formatted).toContain('50.000');
      expect(formatted.startsWith('$')).toBe(true);
    });

    it('formats USD correctly', () => {
      const formatted = formatCurrency(120.5, 'USD');
      expect(formatted).toContain('120');
      expect(formatted.startsWith('$')).toBe(true);
    });
  });

  describe('parsePurchaseDate', () => {
    it('parses standard ISO date string', () => {
      const date = parsePurchaseDate('2026-09-28T14:30:00.000Z');
      expect(date).not.toBeNull();
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(8); // September is 8
      expect(date?.getDate()).toBe(28);
    });

    it('parses slash formats DD/MM/YYYY', () => {
      const date = parsePurchaseDate('28/09/2026');
      expect(date).not.toBeNull();
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(8);
      expect(date?.getDate()).toBe(28);
    });

    it('parses dash formats DD-MM-YYYY', () => {
      const date = parsePurchaseDate('15-10-2026');
      expect(date).not.toBeNull();
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(9); // October is 9
      expect(date?.getDate()).toBe(15);
    });

    it('parses Spanish month formats with or without "de"', () => {
      const date1 = parsePurchaseDate('28 de sept');
      expect(date1).not.toBeNull();
      expect(date1?.getMonth()).toBe(8);
      expect(date1?.getDate()).toBe(28);

      const date2 = parsePurchaseDate('15 de octubre');
      expect(date2).not.toBeNull();
      expect(date2?.getMonth()).toBe(9);
      expect(date2?.getDate()).toBe(15);

      const date3 = parsePurchaseDate('10 nov 2026');
      expect(date3).not.toBeNull();
      expect(date3?.getMonth()).toBe(10);
      expect(date3?.getDate()).toBe(10);
    });

    it('falls back to id timestamp when dateStr is absent', () => {
      // 1727568000000 = September 29, 2024
      const date = parsePurchaseDate(undefined, 'p-1727568000000');
      expect(date).not.toBeNull();
      expect(date?.getTime()).toBe(1727568000000);
    });
  });

  describe('getCardBillingCycleStartDate & isPurchaseBeforeCurrentMonthBillingDate', () => {
    const referenceDate = new Date(2026, 10, 12); // Nov 12, 2026

    it('calculates cycle start on previous month when today < cutoffDay', () => {
      // Today is 12, cutoff is 15 -> cycle start is Oct 15, 2026
      const cycleStart = getCardBillingCycleStartDate(15, referenceDate);
      expect(cycleStart.getFullYear()).toBe(2026);
      expect(cycleStart.getMonth()).toBe(9); // October
      expect(cycleStart.getDate()).toBe(15);
    });

    it('calculates cycle start on current month when today >= cutoffDay', () => {
      // Today is 12, cutoff is 10 -> cycle start is Nov 10, 2026
      const cycleStart = getCardBillingCycleStartDate(10, referenceDate);
      expect(cycleStart.getFullYear()).toBe(2026);
      expect(cycleStart.getMonth()).toBe(10); // November
      expect(cycleStart.getDate()).toBe(10);
    });

    it('marks purchases strictly before cycle start as old (true)', () => {
      // With cutoffDay = 15 and reference = Nov 12 (cycle start = Oct 15):
      // September 28 should be old (true)
      expect(isPurchaseBeforeCurrentMonthBillingDate('2026-09-28', 15, referenceDate)).toBe(true);
      expect(isPurchaseBeforeCurrentMonthBillingDate('28 de sept', 15, referenceDate)).toBe(true);
      expect(isPurchaseBeforeCurrentMonthBillingDate('14 de octubre', 15, referenceDate)).toBe(true);

      // October 15 and onward should be current (false)
      expect(isPurchaseBeforeCurrentMonthBillingDate('15 de octubre', 15, referenceDate)).toBe(false);
      expect(isPurchaseBeforeCurrentMonthBillingDate('20 de octubre', 15, referenceDate)).toBe(false);
      expect(isPurchaseBeforeCurrentMonthBillingDate('12 de noviembre', 15, referenceDate)).toBe(false);
    });

    it('treats missing date as old record when cutoff is set', () => {
      expect(isPurchaseBeforeCurrentMonthBillingDate(undefined, 15, referenceDate)).toBe(true);
    });
  });

  describe('calculateCardPurchasesTotal & calculateCardPaymentDue', () => {
    const sampleCard: CreditCardItem = {
      id: 'c-1',
      name: 'Visa Clásica',
      creditLimit: 5000000,
      cutoffDay: 15,
      paymentDay: 30,
      purchases: [
        { id: 'p-1', concept: 'Cena', amount: 100000 },
        { id: 'p-2', concept: 'Mercado', amount: 250000 }
      ],
      payments: [
        { id: 'pay-1', amount: 50000, date: '2026-11-01' }
      ]
    };

    it('computes total debt as purchases minus payments', () => {
      const totalDebt = calculateCardPurchasesTotal(sampleCard);
      expect(totalDebt).toBe(300000); // 350000 - 50000
    });

    it('respects minPaymentOverride if set', () => {
      const cardWithMin: CreditCardItem = {
        ...sampleCard,
        minPaymentOverride: 75000
      };
      expect(calculateCardPaymentDue(cardWithMin)).toBe(75000);
    });
  });

  describe('calculateSubscriptionMonthlyCost', () => {
    it('computes monthly cost per member', () => {
      const sub: SubscriptionItem = {
        id: 's-1',
        name: 'Spotify Familiar',
        totalPrice: 30000,
        members: 3,
        billing: 'monthly',
        active: true
      };
      expect(calculateSubscriptionMonthlyCost(sub)).toBe(10000);
    });
  });

  describe('calculateAllFinances', () => {
    it('computes summary without errors on initial data', () => {
      const summary = calculateAllFinances(initialFinanceData);
      expect(summary).toBeDefined();
      expect(summary.presupuesto).toBeDefined();
      expect(summary.ingresos).toBeDefined();
      expect(typeof summary.presupuesto.m11_disponible).toBe('number');
    });
  });
});

describe('Cuotas por compra en tarjetas', () => {
  const card = (purchases: CreditCardItem['purchases'], payments: CreditCardItem['payments'] = []): CreditCardItem => ({
    id: 'cc', name: 'Visa', creditLimit: 5_000_000, moneda: 'COP', purchases, payments
  });

  it('el pago del mes es la cuota fija de la compra, no el total', () => {
    const cc = card([{ id: 'p1', concept: 'TV', amount: 1_200_000, installments: 12 }]);
    expect(calculateCardPaymentDue(cc)).toBe(100_000);
  });

  it('suma la cuota de cada compra; la cuota no cambia con lo que falte', () => {
    const cc = card(
      [
        { id: 'p1', concept: 'TV', amount: 1_200_000, installments: 12, paidAmount: 300_000 }, // va en la cuota 4
        { id: 'p2', concept: 'Nevera', amount: 2_400_000, installments: 12 }                  // nueva
      ],
      [{ id: 'pay', amount: 300_000, date: '2026-11-01' }]
    );
    expect(calculateCardPaymentDue(cc)).toBe(300_000);
  });

  it('compra totalmente pagada sale del pago del mes', () => {
    const cc = card([{ id: 'p1', concept: 'TV', amount: 600_000, installments: 6, paidAmount: 600_000 }],
      [{ id: 'pay', amount: 600_000, date: '2026-11-01' }]);
    expect(calculateCardPaymentDue(cc)).toBe(0);
  });

  it('combina cuotas con compras de contado', () => {
    const cc = card([
      { id: 'p1', concept: 'TV', amount: 1_200_000, installments: 12 },
      { id: 'p2', concept: 'Almuerzo', amount: 50_000 }
    ]);
    expect(calculateCardPaymentDue(cc)).toBe(150_000);
  });

  it('el avance de cuotas depende solo de lo pagado', () => {
    const info = getPurchaseInstallmentInfo({ id: 'p', concept: 'TV', amount: 1_200_000, installments: 12, paidAmount: 200_000 });
    expect(info.currentInstallment).toBe(3);
    expect(info.paidInstallments).toBe(2);
    expect(info.remaining).toBe(1_000_000);
  });

  it('la cuota entra al presupuesto mensual', () => {
    const data: AppFinanceData = {
      ...initialFinanceData,
      creditCards: [card([{ id: 'p1', concept: 'TV', amount: 1_200_000, installments: 6 }])]
    };
    expect(calculateAllFinances(data).presupuesto.m5_tarjetas).toBe(200_000);
  });
});
