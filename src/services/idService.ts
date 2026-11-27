/**
 * Genera un id único con prefijo: `<prefijo>-<timestamp>-<aleatorio>`.
 * Se conserva el timestamp al inicio porque parsePurchaseDate lo usa como
 * respaldo para fechar registros sin fecha; el sufijo evita colisiones
 * cuando se crean varios registros en el mismo milisegundo.
 */
export function generateId(prefix: string, now: number = Date.now()): string {
  const random =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${now}-${random}`;
}
