import { describe, it, expect } from 'vitest';
import { applyNewMovement, revertMovement } from '../movementService';
import { calculateAllFinances } from '../financeCalculations';
import { AppFinanceData } from '../../models/finance';
import { initialFinanceData } from '../defaultData';

/** Datos base: cuentas COP y USD, portafolio, tarjeta con corte, deuda y obligación. */
const makeData = (): AppFinanceData => ({
  ...initialFinanceData,
  dolarRate: 4000,
  billeteraItems: [
    { id: 'acc-cop', nombre: 'Cuenta COP', moneda: 'COP', saldo: 1_000_000 },
    { id: 'acc-usd', nombre: 'Cuenta USD', moneda: 'USD', saldo: 500 }
  ],
  portfolioItems: [{ id: 'port-1', nombre: 'Inversión', moneda: 'COP', saldo: 2_000_000 }],
  deudaItems: [{ id: 'deuda-1', nombre: 'Préstamo', moneda: 'COP', monto: 100_000, tipo: 'por_pagar' }],
  obligations: [{ id: 'ob-1', name: 'Crédito', totalAmount: 50_000, totalDebtBalance: 300_000, moneda: 'COP' }],
  creditCards: [{
    id: 'cc-1', name: 'Visa', creditLimit: 5_000_000, moneda: 'COP',
    purchases: [{ id: 'p-1', concept: 'Compra', amount: 400_000 }],
    payments: [{ id: 'pay-old', amount: 100_000, date: '2026-10-01T00:00:00.000Z' }],
    billingCutoffAmount: 300_000, billingCutoffDate: '2026-10-15T00:00:00.000Z', cutoffBasePayments: 100_000
  }],
  expenseMovements: []
});

const t0 = new Date('2026-11-20T10:00:00.000Z');
const lastId = (d: AppFinanceData) => d.expenseMovements![0].id;
const bal = (d: AppFinanceData, id: string) =>
  [...d.billeteraItems, ...d.portfolioItems].find(a => a.id === id)!.saldo;

describe('movementService: crear y eliminar restaura el estado', () => {
  it('transferencia a Portafolio se revierte en ambas cuentas (punto 1)', () => {
    const base = makeData();
    const after = applyNewMovement(base, {
      type: 'transfer', name: 'Ahorro', amount: 200_000,
      sourceAccountId: 'billetera:acc-cop', destinationType: 'portfolio', destinationId: 'port-1'
    }, t0);
    expect(bal(after, 'acc-cop')).toBe(800_000);
    expect(bal(after, 'port-1')).toBe(2_200_000);
    const reverted = revertMovement(after, lastId(after));
    expect(bal(reverted, 'acc-cop')).toBe(1_000_000);
    expect(bal(reverted, 'port-1')).toBe(2_000_000);
  });

  it('transferencia USD→COP revierte el monto convertido (punto 2)', () => {
    const base = makeData();
    const after = applyNewMovement(base, {
      type: 'transfer', name: 'Cambio', amount: 100,
      sourceAccountId: 'billetera:acc-usd', destinationType: 'account', destinationId: 'acc-cop'
    }, t0);
    expect(bal(after, 'acc-usd')).toBe(400);
    expect(bal(after, 'acc-cop')).toBe(1_400_000);
    const reverted = revertMovement(after, lastId(after));
    expect(bal(reverted, 'acc-usd')).toBe(500);
    expect(bal(reverted, 'acc-cop')).toBe(1_000_000);
  });

  it('gasto mayor al saldo no genera dinero al eliminarse (punto 3)', () => {
    const base = makeData();
    const after = applyNewMovement(base, {
      type: 'expense', name: 'Grande', amount: 1_500_000, sourceAccountId: 'billetera:acc-cop'
    }, t0);
    expect(bal(after, 'acc-cop')).toBe(0);
    const reverted = revertMovement(after, lastId(after));
    expect(bal(reverted, 'acc-cop')).toBe(1_000_000);
  });

  it('abono a deuda mayor al saldo de la deuda se revierte exacto (punto 3)', () => {
    const base = makeData();
    const after = applyNewMovement(base, {
      type: 'expense', name: 'Pago deuda', amount: 150_000,
      sourceAccountId: 'billetera:acc-cop', destinationType: 'deuda', destinationId: 'deuda-1'
    }, t0);
    expect(after.deudaItems[0].monto).toBe(0);
    const reverted = revertMovement(after, lastId(after));
    expect(reverted.deudaItems[0].monto).toBe(100_000);
    expect(bal(reverted, 'acc-cop')).toBe(1_000_000);
  });

  it('pago a tarjeta elimina solo su abono y restaura el corte (punto 4)', () => {
    const base = makeData();
    const after = applyNewMovement(base, {
      type: 'expense', name: 'Pago Visa', amount: 300_000,
      sourceAccountId: 'billetera:acc-cop', destinationType: 'card', destinationId: 'cc-1'
    }, t0);
    const cardAfter = after.creditCards[0];
    expect(cardAfter.payments).toHaveLength(2);
    expect(cardAfter.billingCutoffAmount).toBeUndefined(); // el pago cubrió el corte
    const reverted = revertMovement(after, lastId(after));
    const card = reverted.creditCards[0];
    expect(card.payments).toEqual(base.creditCards[0].payments); // el abono antiguo queda intacto
    expect(card.billingCutoffAmount).toBe(300_000);
    expect(card.cutoffBasePayments).toBe(100_000);
  });

  it('movimiento desde cuenta USD queda registrado en USD (punto 6)', () => {
    const after = applyNewMovement(makeData(), {
      type: 'expense', name: 'Netflix', amount: 10, moneda: 'COP', sourceAccountId: 'billetera:acc-usd'
    }, t0);
    expect(after.expenseMovements![0].moneda).toBe('USD');
  });

  it('pago a tarjeta COP desde cuenta USD se abona convertido', () => {
    const after = applyNewMovement(makeData(), {
      type: 'expense', name: 'Pago', amount: 25,
      sourceAccountId: 'billetera:acc-usd', destinationType: 'card', destinationId: 'cc-1'
    }, t0);
    expect(after.creditCards[0].payments![0].amount).toBe(100_000);
  });

  it('registro antiguo (sin trazabilidad) hacia Portafolio también se revierte', () => {
    const base = makeData();
    const legacy: AppFinanceData = {
      ...base,
      billeteraItems: base.billeteraItems.map(b => (b.id === 'acc-cop' ? { ...b, saldo: 800_000 } : b)),
      portfolioItems: [{ ...base.portfolioItems[0], saldo: 2_200_000 }],
      expenseMovements: [{
        id: 'mov-legacy', type: 'transfer', name: 'Ahorro', amount: 200_000, moneda: 'COP',
        sourceAccountId: 'billetera:acc-cop', sourceAccountName: 'Cuenta COP',
        destinationType: 'portfolio', destinationId: 'port-1', destinationName: 'Inversión',
        date: '2026-11-01T00:00:00.000Z'
      }]
    };
    const reverted = revertMovement(legacy, 'mov-legacy');
    expect(bal(reverted, 'acc-cop')).toBe(1_000_000);
    expect(bal(reverted, 'port-1')).toBe(2_000_000);
  });
});

describe('calculateAllFinances: conversión a moneda base (punto 5)', () => {
  it('suma gastos en USD convertidos a COP', () => {
    const data: AppFinanceData = {
      ...initialFinanceData,
      dolarRate: 4000,
      housingExpenses: [
        { id: 'h1', name: 'Arriendo', totalAmount: 1_000_000, moneda: 'COP', isShared: false },
        { id: 'h2', name: 'Hosting', totalAmount: 10, moneda: 'USD', isShared: false }
      ]
    };
    const s = calculateAllFinances(data);
    expect(s.presupuesto.m4_vivienda).toBe(1_040_000);
    expect(s.vivienda.totalMonth).toBe(1_040_000);
  });
});
