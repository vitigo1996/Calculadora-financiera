import { AppFinanceData, BilleteraAccountItem, DeudaItem, PortfolioAccountItem } from '../models/finance';
import { initialFinanceData } from './defaultData';
import * as XLSX from 'xlsx';

const STORAGE_KEY = 'app_finanzas_data_v6';

export const StorageService = {
  loadData(): AppFinanceData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed) {
          if (Array.isArray(parsed.deudaItems)) {
            parsed.deudaItems = parsed.deudaItems.map((d: any) => ({
              ...d,
              moneda: d.moneda || 'COP',
              tipo: d.tipo || 'por_pagar'
            }));
          }
          if (!Array.isArray(parsed.portfolioItems) || parsed.portfolioItems.length === 0) {
            parsed.portfolioItems = initialFinanceData.portfolioItems;
          }
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

    // Sheet: Billetera
    const billeteraRows = [
      { Concepto: 'Tasa Dolar TRM (USD/COP)', Valor: data.dolarRate, Moneda: 'COP' },
      ...data.billeteraItems.map(b => ({
        Concepto: b.nombre,
        Valor: b.saldo,
        Moneda: b.moneda
      }))
    ];
    const wsBilletera = XLSX.utils.json_to_sheet(billeteraRows);
    XLSX.utils.book_append_sheet(wb, wsBilletera, 'Billetera');

    // Sheet: Deudas
    const deudasRows = data.deudaItems.map(d => ({
      Concepto: d.nombre,
      Tipo: d.tipo === 'por_cobrar' ? 'Me Deben' : 'Debo',
      Monto: d.monto || 0,
      Moneda: d.moneda || 'COP'
    }));
    const wsDeudas = XLSX.utils.json_to_sheet(deudasRows);
    XLSX.utils.book_append_sheet(wb, wsDeudas, 'Deudas');

    // Sheet: Portafolio
    const portRows = (data.portfolioItems || []).map(p => ({
      Activo: p.nombre,
      Saldo: p.saldo,
      Moneda: p.moneda
    }));
    const wsPort = XLSX.utils.json_to_sheet(portRows);
    XLSX.utils.book_append_sheet(wb, wsPort, 'Portafolio');

    XLSX.writeFile(wb, `Finanzas_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
};
