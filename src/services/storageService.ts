import { AppFinanceData } from '../models/finance';
import { initialFinanceData } from './defaultData';
import { validateFinanceData } from './dataValidation';
import { saveFile } from './fileExportService';

const STORAGE_KEY = 'app_finanzas_data_v7';

/** Fecha local AAAA-MM-DD para nombres de archivo. */
const today = () => new Date().toISOString().slice(0, 10);

/** Convierte una lista de objetos planos a filas (encabezado + valores) para la hoja de cálculo. */
function toRows(rows: Record<string, string | number>[]): (string | number)[][] {
  if (rows.length === 0) return [];
  const headers = Object.keys(rows[0]);
  return [headers, ...rows.map(r => headers.map(h => r[h] ?? ''))];
}

export const StorageService = {
  /** Carga los datos guardados; si están dañados se usan los valores iniciales. */
  loadData(): AppFinanceData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const result = validateFinanceData(JSON.parse(stored));
        if (result.ok) return result.data;
        console.error('Datos guardados inválidos:', result.error);
      }
    } catch (e) {
      console.error('Error loading data from localStorage', e);
    }
    return initialFinanceData;
  },

  /** Guarda los datos. Devuelve false si el almacenamiento falló (p. ej. espacio lleno). */
  saveData(data: AppFinanceData): boolean {
    try {
      const dataToSave = { ...data, lastUpdated: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      return true;
    } catch (e) {
      console.error('Error saving data to localStorage', e);
      return false;
    }
  },

  resetData(): AppFinanceData {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing localStorage', e);
    }
    return initialFinanceData;
  },

  /** Exporta un respaldo completo en JSON (restaurable con "Importar respaldo"). */
  async exportJSON(data: AppFinanceData): Promise<void> {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    await saveFile(blob, `Finanzas_Backup_${today()}.json`, 'Guardar respaldo');
  },

  /** Exporta un resumen en Excel (.xlsx). La librería se carga solo al exportar. */
  async exportExcel(data: AppFinanceData): Promise<void> {
    const { default: writeExcelFile } = await import('write-excel-file/browser');
    const sheets: { sheet: string; data: (string | number)[][] }[] = [];

    // 1. Sheet: Billetera
    const billeteraRows = (data.billeteraItems || []).map(b => ({
      Cuenta: b.nombre,
      Saldo: b.saldo
    }));
    sheets.push({ sheet: 'Billetera', data: toRows(billeteraRows.length > 0 ? billeteraRows : [{ Cuenta: 'Sin cuentas', Saldo: 0 }]) });

    // 2. Sheet: Deudas
    const deudasRows = (data.deudaItems || []).map(d => ({
      Concepto: d.nombre,
      Tipo: d.tipo === 'por_cobrar' ? 'Me Deben' : 'Debo',
      Monto: d.monto || 0
    }));
    sheets.push({ sheet: 'Deudas', data: toRows(deudasRows.length > 0 ? deudasRows : [{ Concepto: 'Sin deudas', Tipo: '', Monto: 0 }]) });

    // 3. Sheet: Portafolio
    const portRows = (data.portfolioItems || []).map(p => ({
      Activo: p.nombre,
      Moneda: p.moneda,
      Saldo: p.saldo
    }));
    sheets.push({ sheet: 'Portafolio', data: toRows(portRows.length > 0 ? portRows : [{ Activo: 'Sin activos', Moneda: 'COP', Saldo: 0 }]) });

    // 4. Sheet: Vivienda
    const viviendaRows = (data.housingExpenses || []).map(h => ({
      Gasto: h.name,
      Periodo: h.period === '1st_fortnight' ? '1ª Quincena' : '2ª Quincena',
      Valor: h.totalAmount
    }));
    sheets.push({ sheet: 'Vivienda', data: toRows(viviendaRows.length > 0 ? viviendaRows : [{ Gasto: 'Sin gastos de vivienda', Periodo: '', Valor: 0 }]) });

    // 5. Sheet: Obligaciones
    const obligacionesRows = (data.obligations || []).map(ob => ({
      Obligacion: ob.name,
      Periodo: ob.period === '1st_fortnight' ? '1ª Quincena' : '2ª Quincena',
      CuotaMensual: ob.totalAmount,
      TotalDeuda: ob.totalDebtBalance || 0
    }));
    sheets.push({ sheet: 'Obligaciones', data: toRows(obligacionesRows.length > 0 ? obligacionesRows : [{ Obligacion: 'Sin obligaciones', Periodo: '', CuotaMensual: 0, TotalDeuda: 0 }]) });

    // 6. Sheet: Suscripciones
    const subsRows = (data.subscriptions || []).map(s => ({
      Suscripcion: s.name,
      Frecuencia: s.billing === 'yearly' ? 'Anual' : 'Mensual',
      Periodo: s.billing === 'yearly' ? (s.billingMonth || 'Anual') : (s.period === '2nd_fortnight' ? '2ª Quincena' : '1ª Quincena'),
      Miembros: s.members || 1,
      PrecioTotal: s.totalPrice
    }));
    sheets.push({ sheet: 'Suscripciones', data: toRows(subsRows.length > 0 ? subsRows : [{ Suscripcion: 'Sin suscripciones', Frecuencia: '', Periodo: '', Miembros: 1, PrecioTotal: 0 }]) });

    // 7. Sheet: Tarjetas
    const tarjetasRows = (data.creditCards || []).map(c => ({
      Tarjeta: c.name,
      Periodo: c.period === '1st_fortnight' ? '1ª Quincena' : '2ª Quincena',
      CupoTotal: c.creditLimit,
      CorteFijado: c.billingCutoffAmount !== undefined ? c.billingCutoffAmount : 'Sin corte'
    }));
    sheets.push({ sheet: 'Tarjetas', data: toRows(tarjetasRows.length > 0 ? tarjetasRows : [{ Tarjeta: 'Sin tarjetas', Periodo: '', CupoTotal: 0, CorteFijado: '' }]) });

    // 8. Sheet: Movimientos
    const movimientosRows = (data.expenseMovements || []).map(m => ({
      Fecha: m.date,
      Tipo: m.type === 'income' ? 'Ingreso' : 'Gasto',
      Concepto: m.name,
      Monto: m.amount,
      CuentaOrigen: m.sourceAccountName,
      Destino: m.destinationType === 'card' ? `Tarjeta ${m.destinationName || ''}` : 'Pagos'
    }));
    sheets.push({ sheet: 'Registro', data: toRows(movimientosRows.length > 0 ? movimientosRows : [{ Fecha: '', Tipo: '', Concepto: 'Sin registros', Monto: 0, CuentaOrigen: '', Destino: '' }]) });

    const blob = await writeExcelFile(sheets).toBlob();
    await saveFile(blob, `Finanzas_Export_${today()}.xlsx`, 'Guardar Excel');
  }
};
