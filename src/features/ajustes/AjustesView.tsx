import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { formatCurrency, convertToBase } from '../../services/financeCalculations';
import { PersonProfile, ExpenseSplitMethod } from '../../models/finance';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  Sun,
  Moon,
  Coins,
  Sliders,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Wallet,
  PieChart as PieChartIcon
} from 'lucide-react';

// Colores predefinidos para la gráfica de barras de Disponible
const PRESET_BAR_COLORS = [
  '#2563eb', '#059669', '#d97706', '#9333ea',
  '#0284c7', '#16a34a', '#ea580c', '#7c3aed',
  '#06b6d4', '#65a30d', '#f43f5e', '#db2777'
];

export const AjustesView: React.FC = () => {
  const {
    data,
    summary,
    updatePeople,
    updateExpenseSplitMethod,
    baseCurrency,
    setBaseCurrency,
    resetToDefault
  } = useFinance();
  const { theme, toggleTheme } = useTheme();

  // Pantalla activa: 'main', 'distribucion'
  const [activeScreen, setActiveScreen] = useState<'main' | 'distribucion'>('main');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isIngresosExpanded, setIsIngresosExpanded] = useState(false);

  // Asegurar 4 aportantes fijos
  const getPerson = (index: number): PersonProfile => {
    if (data.people && data.people[index]) {
      return data.people[index];
    }
    return {
      id: `p-${index + 1}`,
      name: index === 0 ? 'Yo' : `Aportante ${index + 1}`,
      monthlyIncome: 0,
      healthPensionRate: index === 0 ? 0.08 : 0,
      enabled: index === 0
    };
  };

  const peopleList: PersonProfile[] = [
    getPerson(0),
    getPerson(1),
    getPerson(2),
    getPerson(3)
  ];

  const splitMethod: ExpenseSplitMethod = data.expenseSplitMethod || 'proportional';

  // Actualizar ingreso de aportante
  const handleUpdateIncome = (index: number, incomeValue: number) => {
    const updated = [...peopleList];
    const prevPerson = updated[index];
    const isPrimary = index === 0;
    const isEnabled = isPrimary ? true : incomeValue > 0;

    updated[index] = {
      ...prevPerson,
      monthlyIncome: incomeValue,
      enabled: isEnabled
    };

    updatePeople(updated);
  };

  // Calcular total de ingreso familiar
  const totalCombinedIncome = peopleList.reduce((sum, p) => sum + (p.monthlyIncome || 0), 0);

  // ==========================================
  // SUB-VISTA: DISTRIBUCIÓN (Gráficas de Disponible y Activos)
  // ==========================================
  if (activeScreen === 'distribucion') {
    const billeteraList = data.billeteraItems || [];
    const totalDisponibleCOP = billeteraList.reduce(
      (sum, b) => sum + convertToBase(b.saldo || 0, b.moneda || 'COP', 'COP', data.dolarRate || 3600),
      0
    );
    const port = summary.portafolio;

    return (
      <div className="space-y-4 animate-fadeIn pb-24">
        {/* Botón Volver */}
        <button
          onClick={() => setActiveScreen('main')}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Ajustes</span>
        </button>

        {/* 1. Gráfica de Barras Horizontales: DISPONIBLE (Billeteras) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-300 dark:border-slate-800 shadow-sm transition-colors space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Disponible
            </span>
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-white">
              Total: {formatCurrency(totalDisponibleCOP, 'COP')}
            </span>
          </div>

          {billeteraList.length === 0 ? (
            <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-xs">
              No tienes cuentas de billetera registradas.
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              {billeteraList.map((item, idx) => {
                const valCOP = convertToBase(item.saldo || 0, item.moneda || 'COP', 'COP', data.dolarRate || 3600);
                const percentage = totalDisponibleCOP > 0 ? (valCOP / totalDisponibleCOP) * 100 : 0;
                const barColor = PRESET_BAR_COLORS[idx % PRESET_BAR_COLORS.length];

                return (
                  <div key={item.id} className="space-y-1.5">
                    {/* Fila Superior: Nombre y Porcentaje */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 dark:text-white truncate max-w-[70%]">
                        {item.nombre}
                      </span>
                      <span
                        className="font-bold text-[11px] font-mono px-2 py-0.5 rounded-lg text-white whitespace-nowrap shadow-xs min-w-[46px] text-center"
                        style={{ backgroundColor: barColor }}
                      >
                        {percentage.toFixed(1)}%
                      </span>
                    </div>

                    {/* Barra Horizontal Proporcional */}
                    <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-500 shadow-xs"
                        style={{
                          width: `${Math.max(percentage, 2)}%`,
                          backgroundColor: barColor
                        }}
                      />
                    </div>

                    {/* Texto pequeño debajo de la barra horizontal con el valor */}
                    <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>{formatCurrency(item.saldo, item.moneda || 'COP')}</span>
                      {item.moneda === 'USD' && (
                        <span className="text-[10px]">≈ {formatCurrency(valCOP, 'COP')}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. Gráfica de Anillo: ACTIVOS (Portafolio) */}
        {port.items.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-300 dark:border-slate-800 text-center text-slate-400 dark:text-slate-500 text-xs">
            No hay datos para mostrar activos. Agrega activos en la pestaña Portafolio.
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-300 dark:border-slate-800 shadow-sm transition-colors space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Activos
              </span>
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-white">
                Total: {formatCurrency(port.totalPortafolio, 'COP')}
              </span>
            </div>

            {/* Gráfica Donut */}
            <div className="h-52 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={port.items}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="valorCOP"
                    nameKey="label"
                  >
                    {port.items.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={1.5} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${formatCurrency(Number(value), 'COP')}`, `${name}`]}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '16px',
                      padding: '10px 14px',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.4)'
                    }}
                    itemStyle={{ color: '#60a5fa', fontSize: '13px', fontWeight: 'bold' }}
                    labelStyle={{ color: '#f8fafc', fontSize: '13px', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Lista de Leyenda de Activos */}
            <div className="space-y-2 pt-1">
              {port.items.map((item: any, i: number) => (
                <div
                  key={item.id || i}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-3.5 h-3.5 rounded-lg shadow-xs flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-bold text-slate-800 dark:text-white truncate">
                      {item.label}
                    </span>
                  </div>
                  <div className="text-right font-mono flex-shrink-0">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {formatCurrency(item.valorCOP, 'COP')}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VISTA PRINCIPAL: MENÚ GENERAL DE AJUSTES
  // ==========================================
  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      {/* Contenedor Principal Unificado con divisiones idénticas */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors divide-y divide-slate-200 dark:divide-slate-800">
        
        {/* 1. MODO VISUAL */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40 shadow-xs flex-shrink-0">
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Modo Visual</h4>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-300/80 dark:border-slate-700 shadow-sm transition-all"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-600" />
                <span>Oscuro</span>
              </>
            )}
          </button>
        </div>

        {/* 2. MONEDA BASE */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40 shadow-xs flex-shrink-0">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Moneda Base</h4>
            </div>
          </div>

          <select
            value={baseCurrency}
            onChange={(e) => setBaseCurrency(e.target.value as 'COP' | 'USD')}
            className="px-3 py-2 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-300/80 dark:border-slate-700 shadow-sm focus:outline-none cursor-pointer"
          >
            <option value="COP">COP ($)</option>
            <option value="USD">USD ($)</option>
          </select>
        </div>

        {/* 3. DISTRIBUCIÓN */}
        <button
          type="button"
          onClick={() => setActiveScreen('distribucion')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40 shadow-xs flex-shrink-0">
              <PieChartIcon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Distribución</h4>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white transition-colors" />
        </button>

        {/* 4. MÉTODO DE REPARTO */}
        <div className="p-4 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40 shadow-xs flex-shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">Método de Reparto</h4>
            </div>
          </div>

          <select
            value={splitMethod}
            onChange={e => updateExpenseSplitMethod(e.target.value as ExpenseSplitMethod)}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-300/80 dark:border-slate-700 shadow-sm focus:outline-none cursor-pointer max-w-[130px] sm:max-w-[160px] truncate flex-shrink-0"
          >
            <option value="proportional">Proporcional (%)</option>
            <option value="equal">50 / 50 Equitativo</option>
            <option value="equal_remaining">Excedente Libre</option>
          </select>
        </div>

        {/* 5. INGRESOS (BOTÓN CON SUBMENÚ DINÁMICO) */}
        <div className="transition-colors">
          <button
            type="button"
            onClick={() => setIsIngresosExpanded(!isIngresosExpanded)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40 shadow-xs flex-shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">Ingresos</h4>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white transition-colors">
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isIngresosExpanded ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Submenú desplegable de los 4 ingresos */}
          {isIngresosExpanded && (
            <div className="bg-slate-50/70 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 divide-y divide-slate-200/70 dark:divide-slate-800/70 animate-fadeIn">
              {[0, 1, 2, 3].map((idx) => {
                const person = peopleList[idx];
                const aportanteNum = idx + 1;

                return (
                  <div key={idx} className="px-4 py-3 flex items-center justify-between gap-3">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 text-xs truncate">
                      Ingreso {aportanteNum}
                    </span>

                    <input
                      type="number"
                      value={person.monthlyIncome === 0 ? '' : person.monthlyIncome}
                      onChange={e => handleUpdateIncome(idx, parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-32 sm:w-44 text-right bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-colors flex-shrink-0"
                    />
                  </div>
                );
              })}

              {/* Total al final del submenú desplegado */}
              <div className="px-4 py-3.5 bg-blue-50/60 dark:bg-blue-950/30 flex items-center justify-between gap-3">
                <span className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">
                  Ingreso Total
                </span>
                <span className="font-mono font-black text-sm text-blue-700 dark:text-blue-300">
                  {formatCurrency(totalCombinedIncome)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 6. RESTABLECER */}
        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="w-full p-4 flex items-center justify-between hover:bg-rose-50/50 dark:hover:bg-rose-950/30 transition-colors text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40 shadow-xs flex-shrink-0">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-rose-600 dark:text-rose-400 text-sm">Restablecer</h4>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white transition-colors" />
        </button>

      </div>

      {/* Modal de confirmación para restablecer datos */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Restablecer"
        message="¿Estás seguro de restablecer? Esta acción no se puede deshacer."
        confirmText="Restablecer"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={() => {
          resetToDefault();
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
