import { AppFinanceData } from '../models/finance';
import { initialFinanceData } from './defaultData';
import { calculateSubscriptionMonthlyCost } from './financeCalculations';
import * as XLSX from 'xlsx';

const STORAGE_KEY = 'app_finanzas_data_v2';

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
    a.download = `Finanzas_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  exportExcel(data: AppFinanceData): void {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Personas & Ingresos
    const peopleData = data.people.map(p => ({
      Nombre: p.name,
      'Ingreso Mensual (COP)': p.monthlyIncome,
      'Tasa Salud/Pensión (%)': p.healthPensionRate * 100,
      'Deducción Salud/Pensión (COP)': p.monthlyIncome * p.healthPensionRate,
      'Ingreso Neto (COP)': p.monthlyIncome * (1 - p.healthPensionRate)
    }));
    const wsPeople = XLSX.utils.json_to_sheet(peopleData);
    XLSX.utils.book_append_sheet(wb, wsPeople, 'Ingresos');

    // Sheet 2: Vivienda
    const housingData = data.housingExpenses.map(h => ({
      Concepto: h.name,
      'Código Referencia': h.referenceCode || '',
      Quincena: h.period === '1st_fortnight' ? '1ra (Mitad de mes)' : '2da (Fin de mes)',
      'Monto Total (COP)': h.totalAmount
    }));
    const wsHousing = XLSX.utils.json_to_sheet(housingData);
    XLSX.utils.book_append_sheet(wb, wsHousing, 'Vivienda');

    // Sheet 3: Tarjetas de Crédito
    const ccRows: any[] = [];
    data.creditCards.forEach(cc => {
      if (cc.purchases && cc.purchases.length > 0) {
        cc.purchases.forEach(p => {
          ccRows.push({
            Tarjeta: cc.name,
            Cupo: cc.creditLimit,
            Concepto: p.concept,
            Valor: p.amount,
            Quincena: cc.period === '1st_fortnight' ? '1ra' : '2da'
          });
        });
      } else {
        ccRows.push({
          Tarjeta: cc.name,
          Cupo: cc.creditLimit,
          Concepto: 'Sin compras activas',
          Valor: 0,
          Quincena: cc.period === '1st_fortnight' ? '1ra' : '2da'
        });
      }
    });
    const wsCC = XLSX.utils.json_to_sheet(ccRows);
    XLSX.utils.book_append_sheet(wb, wsCC, 'Tarjetas');

    // Sheet 4: Suscripciones
    const subData = data.subscriptions.map(s => ({
      Servicio: s.name,
      'Costo Total Factura': s.totalPrice,
      'Número de Miembros': s.members,
      Facturación: s.billing === 'yearly' ? 'Anual' : 'Mensual',
      'Costo Mensual Personal': calculateSubscriptionMonthlyCost(s),
      Activa: s.active ? 'Sí' : 'No'
    }));
    const wsSub = XLSX.utils.json_to_sheet(subData);
    XLSX.utils.book_append_sheet(wb, wsSub, 'Suscripciones');

    // Sheet 5: Portafolio
    const portData = data.portfolio.map(a => ({
      Activo: a.name,
      Tipo: a.type,
      Moneda: a.currency,
      Saldo: a.balance,
      'Saldo en COP': a.currency === 'USD' ? a.balance * data.currencyRateUSD : a.balance,
      Institución: a.institution
    }));
    const wsPort = XLSX.utils.json_to_sheet(portData);
    XLSX.utils.book_append_sheet(wb, wsPort, 'Portafolio');

    XLSX.writeFile(wb, `Finanzas_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
};
