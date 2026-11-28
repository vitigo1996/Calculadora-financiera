import { AppFinanceData } from '../models/finance';
import { initialFinanceData } from './defaultData';

/** Resultado de validar un respaldo importado. */
export type ValidationResult =
  | { ok: true; data: AppFinanceData; warnings: string[] }
  | { ok: false; error: string };

/**
 * Esquema mínimo por colección:
 * - label: nombre legible para mensajes de error.
 * - text: campos de texto obligatorios (además de `id`).
 * - numbers: campos numéricos; si vienen deben ser números finitos (se aceptan cadenas numéricas).
 */
const COLLECTIONS: Record<string, { label: string; text: string[]; numbers: string[] }> = {
  people: { label: 'Aportantes', text: ['name'], numbers: ['monthlyIncome', 'healthPensionRate'] },
  billeteraItems: { label: 'Billetera', text: ['nombre'], numbers: ['saldo'] },
  deudaItems: { label: 'Deudas', text: ['nombre'], numbers: ['monto'] },
  portfolioItems: { label: 'Portafolio', text: ['nombre'], numbers: ['saldo'] },
  housingExpenses: { label: 'Vivienda', text: ['name'], numbers: ['totalAmount', 'paymentDay'] },
  obligations: { label: 'Obligaciones', text: ['name'], numbers: ['totalAmount', 'totalDebtBalance', 'paymentDay'] },
  creditCards: { label: 'Tarjetas', text: ['name'], numbers: ['creditLimit', 'paymentDay', 'cutoffDay', 'installments'] },
  subscriptions: { label: 'Suscripciones', text: ['name'], numbers: ['totalPrice', 'members'] },
  expenseMovements: { label: 'Registro', text: ['name', 'sourceAccountId'], numbers: ['amount'] }
};

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Convierte a número finito; devuelve undefined si no es convertible. */
const toFiniteNumber = (v: unknown): number | undefined => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
};

/** Valida y normaliza los números de un registro. Devuelve el registro o un mensaje de error. */
function normalizeItem(
  item: unknown,
  index: number,
  schema: { label: string; text: string[]; numbers: string[] }
): { item: Record<string, unknown> } | { error: string } {
  const pos = `${schema.label} #${index + 1}`;
  if (!isObject(item)) return { error: `${pos}: no es un registro válido.` };
  if (typeof item.id !== 'string' || !item.id) return { error: `${pos}: falta el identificador (id).` };
  for (const f of schema.text) {
    if (typeof item[f] !== 'string') return { error: `${pos}: el campo "${f}" debe ser texto.` };
  }
  const out: Record<string, unknown> = { ...item };
  for (const f of schema.numbers) {
    if (item[f] === undefined || item[f] === null) continue;
    const n = toFiniteNumber(item[f]);
    if (n === undefined) return { error: `${pos}: el campo "${f}" debe ser numérico.` };
    out[f] = n;
  }
  return { item: out };
}

/**
 * Valida un objeto (p. ej. JSON importado) contra la estructura de AppFinanceData.
 * - Rechaza estructuras inválidas con un mensaje claro (no se modifica nada).
 * - Completa colecciones faltantes con valores vacíos y normaliza números.
 */
export function validateFinanceData(raw: unknown): ValidationResult {
  if (!isObject(raw)) return { ok: false, error: 'El archivo no contiene un respaldo válido.' };

  const knownKeys = Object.keys(COLLECTIONS).concat(['mode', 'dolarRate', 'baseCurrency']);
  if (!knownKeys.some(k => k in raw)) {
    return { ok: false, error: 'El archivo no corresponde a un respaldo de Mis Finanzas.' };
  }

  const warnings: string[] = [];
  const result: Record<string, unknown> = { ...initialFinanceData, ...raw };

  for (const [key, schema] of Object.entries(COLLECTIONS)) {
    const value = raw[key];
    if (value === undefined || value === null) {
      result[key] = [];
      continue;
    }
    if (!Array.isArray(value)) return { ok: false, error: `${schema.label}: se esperaba una lista.` };
    const items: Record<string, unknown>[] = [];
    for (let i = 0; i < value.length; i++) {
      const r = normalizeItem(value[i], i, schema);
      if ('error' in r) return { ok: false, error: r.error };
      items.push(r.item);
    }
    result[key] = items;
  }

  // Las tarjetas deben tener listas de compras/abonos válidas
  for (const card of result.creditCards as Record<string, unknown>[]) {
    for (const listKey of ['purchases', 'payments'] as const) {
      const list = card[listKey];
      if (list === undefined || list === null) {
        card[listKey] = listKey === 'purchases' ? [] : undefined;
        continue;
      }
      if (!Array.isArray(list)) return { ok: false, error: `Tarjeta "${card.name}": "${listKey}" debe ser una lista.` };
      for (const entry of list) {
        if (!isObject(entry) || toFiniteNumber(entry.amount) === undefined) {
          return { ok: false, error: `Tarjeta "${card.name}": hay un registro con monto inválido.` };
        }
        entry.amount = toFiniteNumber(entry.amount);
      }
    }
  }

  // Campos generales
  if (result.mode !== 'single' && result.mode !== 'shared') {
    result.mode = 'single';
    warnings.push('Modo desconocido: se usó "individual".');
  }
  if (result.baseCurrency !== 'COP' && result.baseCurrency !== 'USD') result.baseCurrency = 'COP';
  const rate = toFiniteNumber(result.dolarRate);
  if (rate === undefined || rate <= 0) {
    result.dolarRate = initialFinanceData.dolarRate;
    warnings.push('Tasa del dólar inválida: se usó el valor por defecto.');
  } else {
    result.dolarRate = rate;
  }
  if ((result.people as unknown[]).length === 0) result.people = initialFinanceData.people;
  if (typeof result.lastUpdated !== 'string') result.lastUpdated = new Date().toISOString();

  return { ok: true, data: result as unknown as AppFinanceData, warnings };
}

/** Interpreta el texto de un archivo de respaldo JSON y lo valida. */
export function parseBackupText(text: string): ValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'El archivo no es un JSON válido.' };
  }
  return validateFinanceData(parsed);
}
