import { AppFinanceData } from '../models/finance';
import { initialFinanceData } from './defaultData';
import * as XLSX from 'xlsx';

const STORAGE_KEY = 'app_finanzas_data_v7';

export const StorageService = {
  loadData(): AppFinanceData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed) {
          return {
            ...initialFinanceData,
            ...parsed
          };
        }
      }
    } catch (e) {
      console.error('Error loading data from localStorage', e);
    }
    return initialFinanceData;
  },

  saveData(data: AppFinanceData): void {
    try {
      const dataToSave = { ...data, lastUpdated: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Error saving data to localStorage', e);
    }
  },

  resetData(): AppFinanceData {
    localStorage.removeItem(STORAGE_KEY);
    return initialFinanceData;
  },

  exportJSON(data: AppFinanceData): void {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Finanzas_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  exportExcel(data: AppFinanceData): void {
    const wb = XLSX.utils.book_new();

    // 1. Sheet: Billetera
    const billeteraRows = (data.billeteraItems || []).map(b => ({
      Cuenta: b.nombre,
      Saldo: b.saldo
    }));
    const wsBilletera = XLSX.utils.json_to_sheet(billeteraRows.length > 0 ? billeteraRows : [{ Cuenta: 'Sin cuentas', Saldo: 0 }]);
    XLSX.utils.book_append_sheet(wb, wsBilletera, 'Billetera');

    // 2. Sheet: Deudas
    const deudasRows = (data.deudaItems || []).map(d => ({
      Concepto: d.nombre,
      Tipo: d.tipo === 'por_cobrar' ? 'Me Deben' : 'Debo',
      Monto: d.monto || 0
    }));
    const wsDeudas = XLSX.utils.json_to_sheet(deudasRows.length > 0 ? deudasRows : [{ Concepto: 'Sin deudas', Tipo: '', Monto: 0 }]);
    XLSX.utils.book_append_sheet(wb, wsDeudas, 'Deudas');

    // 3. Sheet: Portafolio
    const portRows = (data.portfolioItems || []).map(p => ({
      Activo: p.nombre,
      Moneda: p.moneda,
      Saldo: p.saldo
    }));
    const wsPort = XLSX.utils.json_to_sheet(portRows.length > 0 ? portRows : [{ Activo: 'Sin activos', Moneda: 'COP', Saldo: 0 }]);
    XLSX.utils.book_append_sheet(wb, wsPort, 'Portafolio');

    // 4. Sheet: Vivienda
    const viviendaRows = (data.housingExpenses || []).map(h => ({
      Gasto: h.name,
      Periodo: h.period === '1st_fortnight' ? '1ª Quincena' : '2ª Quincena',
      Valor: h.totalAmount
    }));
    const wsVivienda = XLSX.utils.json_to_sheet(viviendaRows.length > 0 ? viviendaRows : [{ Gasto: 'Sin gastos de vivienda', Periodo: '', Valor: 0 }]);
    XLSX.utils.book_append_sheet(wb, wsVivienda, 'Vivienda');

    // 5. Sheet: Obligaciones
    const obligacionesRows = (data.obligations || []).map(ob => ({
      Obligacion: ob.name,
      Periodo: ob.period === '1st_fortnight' ? '1ª Quincena' : '2ª Quincena',
      CuotaMensual: ob.totalAmount,
      TotalDeuda: ob.totalDebtBalance || 0
    }));
    const wsObligaciones = XLSX.utils.json_to_sheet(obligacionesRows.length > 0 ? obligacionesRows : [{ Obligacion: 'Sin obligaciones', Periodo: '', CuotaMensual: 0, TotalDeuda: 0 }]);
    XLSX.utils.book_append_sheet(wb, wsObligaciones, 'Obligaciones');

    // 6. Sheet: Suscripciones
    const subsRows = (data.subscriptions || []).map(s => ({
      Suscripcion: s.name,
      Frecuencia: s.billing === 'yearly' ? 'Anual' : 'Mensual',
      Periodo: s.billing === 'yearly' ? (s.billingMonth || 'Anual') : (s.period === '2nd_fortnight' ? '2ª Quincena' : '1ª Quincena'),
      Miembros: s.members || 1,
      PrecioTotal: s.totalPrice
    }));
    const wsSubs = XLSX.utils.json_to_sheet(subsRows.length > 0 ? subsRows : [{ Suscripcion: 'Sin suscripciones', Frecuencia: '', Periodo: '', Miembros: 1, PrecioTotal: 0 }]);
    XLSX.utils.book_append_sheet(wb, wsSubs, 'Suscripciones');

    // 7. Sheet: Tarjetas
    const tarjetasRows = (data.creditCards || []).map(c => ({
      Tarjeta: c.name,
      Periodo: c.period === '1st_fortnight' ? '1ª Quincena' : '2ª Quincena',
      CupoTotal: c.creditLimit,
      CorteFijado: c.billingCutoffAmount !== undefined ? c.billingCutoffAmount : 'Sin corte'
    }));
    const wsTarjetas = XLSX.utils.json_to_sheet(tarjetasRows.length > 0 ? tarjetasRows : [{ Tarjeta: 'Sin tarjetas', Periodo: '', CupoTotal: 0, CorteFijado: '' }]);
    XLSX.utils.book_append_sheet(wb, wsTarjetas, 'Tarjetas');

    // 8. Sheet: Movimientos
    const movimientosRows = (data.expenseMovements || []).map(m => ({
      Fecha: m.date,
      Tipo: m.type === 'income' ? 'Ingreso' : 'Gasto',
      Concepto: m.name,
      Monto: m.amount,
      CuentaOrigen: m.sourceAccountName,
      Destino: m.destinationType === 'card' ? `Tarjeta ${m.destinationName || ''}` : 'Pagos'
    }));
    const wsMovimientos = XLSX.utils.json_to_sheet(movimientosRows.length > 0 ? movimientosRows : [{ Fecha: '', Tipo: '', Concepto: 'Sin registros', Monto: 0, CuentaOrigen: '', Destino: '' }]);
    XLSX.utils.book_append_sheet(wb, wsMovimientos, 'Registro');

    XLSX.writeFile(wb, `Finanzas_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
};
