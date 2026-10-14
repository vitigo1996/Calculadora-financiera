import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, calculateCardPaymentDue } from '../../services/financeCalculations';
import { GastosFijosView } from '../gastos_fijos/GastosFijosView';
import {
  Receipt,
  ShieldCheck,
  Home,
  CreditCard,
  Layers,
  Calendar
} from 'lucide-react';

export const PresupuestoView: React.FC = () => {
  const { data, summary } = useFinance();
  const pres = summary.presupuesto;

  // Submenu: Presupuesto | Gastos
  const [subView, setSubView] = useState<'presupuesto' | 'gastos'>('presupuesto');
  const [infoModalTitle, setInfoModalTitle] = useState<string | null>(null);

  // Determinar los ítems a pagar según su fecha límite de pago
  const isShared = summary.ingresos.isShared;
  const ratioYo = summary.ingresos.ratioYo;

  // 1. Vivienda
  const housingItems = (data.housingExpenses || []).map(h => {
    const isItemShared = h.isShared !== false && isShared;
    const amount = isItemShared ? (h.totalAmount || 0) * ratioYo : (h.totalAmount || 0);
    return {
      id: h.id,
      name: h.name,
      type: 'Vivienda',
      paymentDay: h.paymentDay,
      amount,
      icon: Home
    };
  });

  // 2. Obligaciones
  const obligationItems = (data.obligations || []).map(ob => {
    const monthlyVal = ob.davidAmount !== undefined && ob.davidAmount !== ob.totalAmount && ob.totalDebtBalance
      ? ob.davidAmount
      : ob.totalAmount;
    const isObShared = ob.isShared !== false && isShared;
    const amount = isObShared ? (monthlyVal || 0) * ratioYo : (monthlyVal || 0);
    return {
      id: ob.id,
      name: ob.name,
      type: 'Obligación',
      paymentDay: ob.paymentDay,
      amount,
      icon: Layers
    };
  });

  // 3. Tarjetas
  const cardItems = (data.creditCards || []).map(cc => {
    const amount = calculateCardPaymentDue(cc);
    return {
      id: cc.id,
      name: cc.name,
      type: 'Tarjeta',
      paymentDay: cc.paymentDay,
      amount,
      icon: CreditCard
    };
  });

  const allPayableItems = [...housingItems, ...obligationItems, ...cardItems];

  // Primera mitad del mes (Día 1 a 15) y Segunda mitad (Día 16 a 31)
  const firstHalfItems = allPayableItems
    .filter(item => (item.paymentDay || 1) <= 15)
    .sort((a, b) => (a.paymentDay || 1) - (b.paymentDay || 1));

  const secondHalfItems = allPayableItems
    .filter(item => (item.paymentDay || 1) > 15)
    .sort((a, b) => (a.paymentDay || 1) - (b.paymentDay || 1));

  const totalFirstHalf = firstHalfItems.reduce((sum, item) => sum + item.amount, 0);
  const totalSecondHalf = secondHalfItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6 pb-2 animate-fadeIn">
      {/* Menú Superior de 2 opciones: Presupuesto | Gastos */}
      <div className="sticky top-0 z-30 bg-slate-50 dark:bg-slate-900 pt-1 pb-2.5 -mx-3.5 px-3.5 flex items-center justify-center border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="bg-slate-200/80 dark:bg-slate-800 p-1 rounded-2xl flex items-center gap-1 shadow-inner border border-slate-300/80 dark:border-slate-700/60 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSubView('presupuesto')}
            className={`flex-1 sm:px-8 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              subView === 'presupuesto'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4" /> Presupuesto
          </button>
          <button
            type="button"
            onClick={() => setSubView('gastos')}
            className={`flex-1 sm:px-8 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              subView === 'gastos'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Home className="w-4 h-4" /> Gastos
          </button>
        </div>
      </div>

      {subView === 'gastos' ? (
        <GastosFijosView hideHeader={true} />
      ) : (
        <div className="space-y-6">
          {/* Primera Tabla: Lista de Gastos Presupuestados */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="p-4 bg-slate-100 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40 shadow-xs flex-shrink-0">
                  <Receipt className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-800 dark:text-white text-sm tracking-wide uppercase">
                    Resumen de Gastos
                  </span>
                  <button
                    type="button"
                    onClick={() => setInfoModalTitle('Resumen de Gastos')}
                    className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xs"
                    title="Más información"
                  >
                    !
                  </button>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {/* 1. Deducciones de ley */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="font-bold text-slate-900 dark:text-white">Deducciones de ley</span>
                </div>
                <span className="font-bold text-blue-700 dark:text-blue-400 font-mono">
                  {formatCurrency(pres.m3_saludPension)}
                </span>
              </div>

              {/* 2. Vivienda */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Home className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="font-bold text-slate-900 dark:text-white">Vivienda</span>
                </div>
                <span className="font-bold text-blue-700 dark:text-blue-400 font-mono">
                  {formatCurrency(pres.m4_vivienda)}
                </span>
              </div>

              {/* 3. Obligaciones */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="font-bold text-slate-900 dark:text-white">Obligaciones</span>
                </div>
                <span className="font-bold text-blue-700 dark:text-blue-400 font-mono">
                  {formatCurrency(pres.m6_obligaciones)}
                </span>
              </div>

              {/* 4. Tarjetas */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="font-bold text-slate-900 dark:text-white">Tarjetas</span>
                </div>
                <span className="font-bold text-blue-700 dark:text-blue-400 font-mono">
                  {formatCurrency(pres.m5_tarjetas)}
                </span>
              </div>
            </div>

            {/* Línea que muestra el total del gasto */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
              <span className="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-white">
                Total Gastos
              </span>
              <span className="font-mono font-black text-sm text-blue-700 dark:text-blue-400">
                {formatCurrency(pres.m7_totalGastos)}
              </span>
            </div>
          </div>

          {/* Segunda Tabla: Distribución por momento del mes (Primera vs Segunda Mitad) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="p-4 bg-slate-100 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40 shadow-xs flex-shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-800 dark:text-white text-sm tracking-wide uppercase">
                    Distribución de Pagos
                  </span>
                  <button
                    type="button"
                    onClick={() => setInfoModalTitle('Distribución de Pagos')}
                    className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xs"
                    title="Más información"
                  >
                    !
                  </button>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {/* Bloque 1: Primera Mitad del Mes (Días 1 - 15) */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                      Primera Mitad (Día 1 - 15)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50">
                      {firstHalfItems.length} {firstHalfItems.length === 1 ? 'pago' : 'pagos'}
                    </span>
                  </div>
                  <span className="font-mono font-black text-sm text-blue-700 dark:text-blue-400">
                    {formatCurrency(totalFirstHalf)}
                  </span>
                </div>

                {firstHalfItems.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 py-1">
                    No hay pagos registrados para la primera mitad del mes.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {firstHalfItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/60 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-800 dark:text-white block truncate">
                                {item.name}
                              </span>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                                <span>{item.type}</span>
                                <span>•</span>
                                <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">
                                  {item.paymentDay ? `Día ${item.paymentDay}` : 'Sin fecha fija'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-slate-900 dark:text-white flex-shrink-0 ml-2">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bloque 2: Segunda Mitad del Mes (Días 16 - 31) */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                      Segunda Mitad (Día 16 - 31)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50">
                      {secondHalfItems.length} {secondHalfItems.length === 1 ? 'pago' : 'pagos'}
                    </span>
                  </div>
                  <span className="font-mono font-black text-sm text-blue-700 dark:text-blue-400">
                    {formatCurrency(totalSecondHalf)}
                  </span>
                </div>

                {secondHalfItems.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 py-1">
                    No hay pagos registrados para la segunda mitad del mes.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {secondHalfItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/60 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-800 dark:text-white block truncate">
                                {item.name}
                              </span>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                                <span>{item.type}</span>
                                <span>•</span>
                                <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">
                                  {item.paymentDay ? `Día ${item.paymentDay}` : 'Sin fecha fija'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-slate-900 dark:text-white flex-shrink-0 ml-2">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Informativo al presionar ! */}
      {infoModalTitle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scaleUp text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl font-black font-mono border border-blue-200 dark:border-blue-800/60 shadow-xs">
              !
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {infoModalTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Habrá información a detalle más adelante.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setInfoModalTitle(null)}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-2xl transition-all shadow-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
