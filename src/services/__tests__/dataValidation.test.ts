import { describe, it, expect } from 'vitest';
import { parseBackupText, validateFinanceData } from '../dataValidation';
import { generateId } from '../idService';
import { parsePurchaseDate } from '../financeCalculations';
import { initialFinanceData } from '../defaultData';

describe('dataValidation: importación de respaldos (punto 9)', () => {
  it('acepta un respaldo válido y completa colecciones faltantes', () => {
    const r = validateFinanceData({
      mode: 'single',
      dolarRate: 4000,
      billeteraItems: [{ id: 'acc-1', nombre: 'Nu', moneda: 'COP', saldo: '1500' }]
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.billeteraItems[0].saldo).toBe(1500); // cadena numérica normalizada
    expect(r.data.creditCards).toEqual([]);
    expect(r.data.people.length).toBeGreaterThan(0);
  });

  it('acepta el estado inicial exportado tal cual', () => {
    const r = parseBackupText(JSON.stringify(initialFinanceData));
    expect(r.ok).toBe(true);
  });

  it('rechaza JSON mal formado', () => {
    const r = parseBackupText('{ esto no es json');
    expect(r.ok).toBe(false);
  });

  it('rechaza un archivo que no es un respaldo de la app', () => {
    const r = validateFinanceData({ foo: 1 });
    expect(r.ok).toBe(false);
  });

  it('rechaza una colección que no es lista', () => {
    const r = validateFinanceData({ billeteraItems: 'x' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('Billetera');
  });

  it('rechaza registros sin id o con montos no numéricos', () => {
    expect(validateFinanceData({ billeteraItems: [{ nombre: 'A', saldo: 1 }] }).ok).toBe(false);
    expect(validateFinanceData({ billeteraItems: [{ id: 'a', nombre: 'A', saldo: 'abc' }] }).ok).toBe(false);
  });

  it('rechaza compras de tarjeta con monto inválido', () => {
    const r = validateFinanceData({
      creditCards: [{ id: 'cc', name: 'Visa', creditLimit: 1, purchases: [{ id: 'p', amount: 'x' }] }]
    });
    expect(r.ok).toBe(false);
  });

  it('corrige tasa del dólar inválida con advertencia', () => {
    const r = validateFinanceData({ mode: 'single', dolarRate: -5 });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.dolarRate).toBe(initialFinanceData.dolarRate);
      expect(r.warnings.length).toBe(1);
    }
  });
});

describe('idService', () => {
  it('genera ids distintos en el mismo milisegundo', () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateId('p', 1727500000000)));
    expect(ids.size).toBe(50);
  });

  it('conserva el timestamp para fechar registros sin fecha', () => {
    const d = parsePurchaseDate(undefined, generateId('p', 1727500000000));
    expect(d?.getTime()).toBe(1727500000000);
  });
});
