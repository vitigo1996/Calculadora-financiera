import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { formatCurrency, convertToBase } from '../../services/financeCalculations';
import { PersonProfile, ExpenseSplitMethod } from '../../models/finance';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  User,
  Users,
  Sun,
  Moon,
  Coins,
  Sliders,
  RefreshCw,
  ChevronRight,
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

  // Pantalla activa: 'main', 'perfil', 'ingreso_familiar', 'distribucion'
  const [activeScreen, setActiveScreen] = useState<'main' | 'perfil' | 'ingreso_familiar' | 'distribucion'>('main');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Contribuidores actuales (mínimo 1)
  const currentPeople = (data.people && data.people.length > 0)
    ? data.people
    : [{ id: 'p-1', name: 'Yo', monthlyIncome: 0, healthPensionRate: 0.08, enabled: true }];

  const personCount = Math.min(4, Math.max(1, currentPeople.length));
  const splitMethod: ExpenseSplitMethod = data.expenseSplitMethod || 'proportional';

  // Cambio en número de aportantes
  const handlePersonCountChange = (count: number) => {
    const validCount = Math.min(4, Math.max(1, count));
    const updated = [...currentPeople];
    if (validCount > updated.length) {
      for (let i = updated.length; i < validCount; i++) {
        updated.push({
          id: `p-${Date.now()}-${i + 1}`,
          name: `Persona ${i + 1}`,
          monthlyIncome: 0,
          healthPensionRate: 0.0,
          enabled: true
        });
      }
    } else if (validCount < updated.length) {
      updated.splice(validCount);
    }
    updatePeople(updated);
  };

  // Actualizar campo de persona
  const handleUpdatePerson = (index: number, field: keyof PersonProfile, value: any) => {
    const updated = [...currentPeople];
    if (!updated[index]) return;
    updated[index] = { ...updated[index], [field]: value };
    updatePeople(updated);
  };

  // Calcular total de ingreso familiar
  const totalCombinedIncome = currentPeople.reduce((sum, p) => sum + (p.monthlyIncome || 0), 0);

  // ==========================================
  // SUB-VISTA: PERFIL (Diseño unificado de filas)
  // ==========================================
  if (activeScreen === 'perfil') {
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

        {/* Tarjeta de Perfil replicando el diseño del menú de ajustes */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors divide-y divide-slate-200 dark:divide-slate-800">
          {/* Fila 1: Nombre */}
          <div className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-600 text-white border-2 border-indigo-400 dark:border-indigo-400 flex items-center justify-center shadow-xs flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-800 dark:text-white text-sm">
                Nombre
              </span>
            </div>

            <input
              type="text"
              value={currentPeople[0]?.name || ''}
              onChange={e => handleUpdatePerson(0, 'name', e.target.value)}
              placeholder="Mi Nombre"
              className="w-48 sm:w-64 text-right bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Fila 2: Ingreso */}
          <div className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40 shadow-xs flex-shrink-0">
                <Coins className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-800 dark:text-white text-sm">
                Ingreso
              </span>
            </div>

            <input
              type="number"
              value={currentPeople[0]?.monthlyIncome || ''}
              onChange={e => handleUpdatePerson(0, 'monthlyIncome', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-48 sm:w-64 text-right bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // SUB-VISTA: INGRESO FAMILIAR
  // ==========================================
  if (activeScreen === 'ingreso_familiar') {
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

        {/* Tarjeta de Ingreso Familiar con el mismo diseño */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden transition-colors divide-y divide-slate-200 dark:divide-slate-800">
          {/* Fila: Número de Aportantes */}
          <div className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-600 text-white border-2 border-indigo-400 dark:border-indigo-400 flex items-center justify-center shadow-xs flex-shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-800 dark:text-white text-sm">
                Número de Aportantes
              </span>
            </div>

            <select
              value={personCount}
              onChange={e => handlePersonCountChange(parseInt(e.target.value))}
              className="px-3 py-2 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-300/80 dark:border-slate-700 shadow-sm focus:outline-none cursor-pointer"
            >
              <option value={1}>1 Aportante</option>
              <option value={2}>2 Aportantes</option>
              <option value={3}>3 Aportantes</option>
              <option value={4}>4 Aportantes</option>
            </select>
          </div>

          {/* Si es mayor a 1: Método de Reparto + Aportantes Adicionales */}
          {personCount > 1 && (
            <>
              {/* Fila: Método de Reparto */}
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40 shadow-xs flex-shrink-0">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-800 dark:text-white text-sm">
                    Método de Reparto
                  </span>
                </div>

                <select
                  value={splitMethod}
                  onChange={e => updateExpenseSplitMethod(e.target.value as ExpenseSplitMethod)}
                  className="px-3 py-2 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-300/80 dark:border-slate-700 shadow-sm focus:outline-none cursor-pointer max-w-[170px]"
                >
                  <option value="proportional">Proporcional (%)</option>
                  <option value="equal">50 / 50 Equitativo</option>
                  <option value="equal_remaining">Excedente Libre</option>
                </select>
              </div>

              {/* Aportantes adicionales (Persona 2, 3, etc. - sin mostrar el aporte mío) */}
              {currentPeople.slice(1).map((person, sliceIdx) => {
                const actualIdx = sliceIdx + 1;
                const defaultName = `Persona ${actualIdx + 1}`;

                return (
                  <React.Fragment key={person.id || actualIdx}>
                    {/* Fila Nombre Aportante */}
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40 shadow-xs flex-shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white text-sm">
                          Nombre (Aportante {actualIdx + 1})
                        </span>
                      </div>

                      <input
                        type="text"
                        value={person.name}
                        onChange={e => handleUpdatePerson(actualIdx, 'name', e.target.value)}
                        placeholder={defaultName}
                        className="w-44 sm:w-60 text-right bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>

                    {/* Fila Ingreso Aportante */}
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40 shadow-xs flex-shrink-0">
                          <Coins className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white text-sm">
                          Ingreso (Aportante {actualIdx + 1})
                        </span>
                      </div>

                      <input
                        type="number"
                        value={person.monthlyIncome || ''}
                        onChange={e => handleUpdatePerson(actualIdx, 'monthlyIncome', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-44 sm:w-60 text-right bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </React.Fragment>
                );
              })}
            </>
          )}
        </div>
      </div>
    );
  }

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
        
        {/* 1. PERFIL */}
        <button
          type="button"
          onClick={() => setActiveScreen('perfil')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-600 text-white border-2 border-indigo-400 dark:border-indigo-400 flex items-center justify-center shadow-xs flex-shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Perfil</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {currentPeople[0]?.name || 'Mi Perfil'} • {formatCurrency(currentPeople[0]?.monthlyIncome || 0)}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white transition-colors" />
        </button>

        {/* 2. MODO VISUAL */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40 shadow-xs flex-shrink-0">
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Modo Visual</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {theme === 'dark' ? 'Tema oscuro activo' : 'Tema claro activo'}
              </p>
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

        {/* 3. MONEDA BASE */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40 shadow-xs flex-shrink-0">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Moneda Base</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Moneda de cálculo principal
              </p>
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

        {/* 4. INGRESO FAMILIAR */}
        <button
          type="button"
          onClick={() => setActiveScreen('ingreso_familiar')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-600 text-white border-2 border-indigo-400 dark:border-indigo-400 flex items-center justify-center shadow-xs flex-shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Ingreso Familiar</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {personCount} {personCount === 1 ? 'aportante' : 'aportantes'} • {splitMethod === 'proportional' ? 'Proporcional' : splitMethod === 'equal' ? '50/50' : 'Excedente'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white transition-colors" />
        </button>

        {/* 5. DISTRIBUCIÓN (Movido desde Portafolio) */}
        <button
          type="button"
          onClick={() => setActiveScreen('distribucion')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-600 text-white border-2 border-indigo-400 dark:border-indigo-400 flex items-center justify-center shadow-xs flex-shrink-0">
              <PieChartIcon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Distribución</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Gráficas de disponible y activos
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white transition-colors" />
        </button>

        {/* 6. TOTAL INGRESO FAMILIAR (Al final del menú general) */}
        <div className="p-4 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-600 text-white border-2 border-indigo-400 dark:border-indigo-400 flex items-center justify-center shadow-xs flex-shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Total Ingreso Familiar</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Suma total de aportes
              </p>
            </div>
          </div>

          <span className="font-mono font-black text-sm sm:text-base text-blue-700 dark:text-blue-300">
            {formatCurrency(totalCombinedIncome)}
          </span>
        </div>

        {/* 7. RESTABLECER TODO DE FÁBRICA */}
        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="w-full p-4 flex items-center justify-between hover:bg-rose-50/50 dark:hover:bg-rose-950/30 transition-colors text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-900/40 shadow-xs flex-shrink-0">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-rose-600 dark:text-rose-400 text-sm">Restablecer todo de fábrica</h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Borrar todos los datos y reiniciar la aplicación
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-300 dark:text-rose-600 group-hover:text-rose-500 transition-colors" />
        </button>

      </div>

      {/* Modal de confirmación para restablecer datos */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Restablecer Datos"
        message="¿Estás seguro de restablecer todos los datos a la configuración inicial en blanco? Esta acción no se puede deshacer."
        confirmText="Sí, restablecer"
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
