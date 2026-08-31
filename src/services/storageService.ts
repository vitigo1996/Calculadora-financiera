import { AppFinanceData } from '../models/finance';
import { initialFinanceData } from './defaultData';
import { calculateSubscriptionMonthlyCost } from './financeCalculations';
import * as XLSX from 'xlsx';

const STORAGE_KEY = 'app_finanzas_data_v3';

export const StorageService = {
  loadData(): AppFinanceData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
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
    a.download = `Finanzas_Billetera_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  exportExcel(data: AppFinanceData): void {
    const wb = XLSX.utils.book_new();

    // Sheet: Billetera
    const billeteraRows = [
      { Concepto: 'Dolar (TRM)', Valor: data.billetera.dolar, Moneda: 'COP' },
      { Concepto: 'Etoro', Valor: data.billetera.etoroUSD, Moneda: 'USD' },
      { Concepto: 'Plenti', Valor: data.billetera.plentiUSD, Moneda: 'USD' },
      { Concepto: 'Efectivo', Valor: data.billetera.efectivoCOP, Moneda: 'COP' },
      { Concepto: 'Bancolombia', Valor: data.billetera.bancolombiaCOP, Moneda: 'COP' },
      { Concepto: 'Deuda Autofinanciera', Valor: data.deudas.autofinancieraMonto, Moneda: 'COP' }
    ];
    const wsBilletera = XLSX.utils.json_to_sheet(billeteraRows);
    XLSX.utils.book_append_sheet(wb, wsBilletera, 'Billetera');

    // Sheet: Vivienda
    const wsHousing = XLSX.utils.json_to_sheet(data.housingExpenses);
    XLSX.utils.book_append_sheet(wb, wsHousing, 'Vivienda');

    // Sheet: Suscripciones
    const wsSub = XLSX.utils.json_to_sheet(data.subscriptions);
    XLSX.utils.book_append_sheet(wb, wsSub, 'Suscripciones');

    XLSX.writeFile(wb, `Finanzas_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
};
