import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import {
  Calculator,
  TrendingUp,
  CreditCard,
  ShieldAlert,
  Coins,
  ArrowRight,
  PiggyBank,
  CheckCircle2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const FinancialCalculatorView: React.FC = () => {
  const { summary } = useFinance();
  const [activeTab, setActiveTab] = useState<'loan' | 'compound' | 'capacity'>('loan');

  // 1. Loan Calculator State
  const [loanAmount, setLoanAmount] = useState('20000000');
  const [interestRateYearly, setInterestRateYearly] = useState('16.5'); // EA
  const [loanTermMonths, setLoanTermMonths] = useState('36');

  // 2. Compound Interest State
  const [initialCapital, setInitialCapital] = useState('5000000');
  const [monthlyContribution, setMonthlyContribution] = useState('500000');
  const [annualReturn, setAnnualReturn] = useState('12'); // %
  const [years, setYears] = useState('10');

  // Loan Calculation Engine (Amortización Francesa)
  const calculateLoan = () => {
    const P = parseFloat(loanAmount) || 0;
    const rateEA = (parseFloat(interestRateYearly) || 0) / 100;
    const n = parseInt(loanTermMonths) || 1;

    // Convert EA to Nominal Monthly rate: (1 + EA)^(1/12) - 1
    const r = Math.pow(1 + rateEA, 1 / 12) - 1;

    let monthlyPayment = 0;
    if (r > 0 && n > 0) {
      monthlyPayment = (P * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
    } else if (n > 0) {
      monthlyPayment = P / n;
    }

    const totalPaid = monthlyPayment * n;
    const totalInterest = totalPaid - P;

    return {
      monthlyPayment,
      totalPaid,
      totalInterest,
      monthlyRatePercent: r * 100
    };
  };

  // Compound Interest Calculation Engine
  const calculateCompound = () => {
    const P0 = parseFloat(initialCapital) || 0;
    const PMT = parseFloat(monthlyContribution) || 0;
    const rYear = (parseFloat(annualReturn) || 0) / 100;
    const rMonth = rYear / 12;
    const numYears = parseInt(years) || 1;
    const totalMonths = numYears * 12;

    const chartData = [];
    let currentBalance = P0;
    let totalInvested = P0;

    for (let m = 0; m <= totalMonths; m++) {
      if (m > 0) {
        currentBalance = currentBalance * (1 + rMonth) + PMT;
        totalInvested += PMT;
      }

      if (m % 12 === 0 || m === totalMonths) {
        chartData.push({
          year: `Año ${m / 12}`,
          total: Math.round(currentBalance),
          invested: Math.round(totalInvested),
          interestEarned: Math.round(currentBalance - totalInvested)
        });
      }
    }

    return {
      finalBalance: currentBalance,
      totalInvested,
      totalGains: currentBalance - totalInvested,
      chartData
    };
  };

  const loanResult = calculateLoan();
  const compoundResult = calculateCompound();

  // Capacity calculation
  const netIncome = summary.p1.netIncome;
  const maxSafeMonthlyDebt = netIncome * 0.35; // 35% safe debt ratio
  const currentMonthlyDebt = summary.p1.creditCardsShare + summary.p1.obligationsShare;
  const debtRatio = netIncome > 0 ? (currentMonthlyDebt / netIncome) * 100 : 0;
  const remainingCapacity = Math.max(0, maxSafeMonthlyDebt - currentMonthlyDebt);

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Calculator className="w-5 h-5 text-teal-400" /> Calculadoras & Simulador Financiero
        </h2>
        <p className="text-xs text-slate-400">
          Herramientas matemáticas para proyectar inversiones, simular préstamos y evaluar endeudamiento
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('loan')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'loan'
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Simulador de Crédito
        </button>
        <button
          onClick={() => setActiveTab('compound')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'compound'
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Interés Compuesto
        </button>
        <button
          onClick={() => setActiveTab('capacity')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'capacity'
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Capacidad de Deuda
        </button>
      </div>

      {/* TAB 1: LOAN SIMULATOR */}
      {activeTab === 'loan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-teal-400" /> Parámetros del Crédito
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Monto del Préstamo (COP)</label>
              <input
                type="number"
                value={loanAmount}
                onChange={e => setLoanAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Tasa de Interés (% E.A. Anual)</label>
              <input
                type="number"
                step="0.1"
                value={interestRateYearly}
                onChange={e => setInterestRateYearly(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Tasa mensual equivalente: {loanResult.monthlyRatePercent.toFixed(2)}% M.V.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Plazo (Meses)</label>
              <input
                type="number"
                value={loanTermMonths}
                onChange={e => setLoanTermMonths(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>
          </div>

          <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-white text-sm mb-4">Resultado de la Simulación</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-950/70 p-4 rounded-2xl border border-teal-500/20">
                  <span className="text-xs text-slate-400 block">Cuota Fija Mensual</span>
                  <div className="text-xl sm:text-2xl font-black text-teal-400 mt-1">
                    {formatCurrency(loanResult.monthlyPayment, 'COP')}
                  </div>
                  <span className="text-[10px] text-teal-400/80 block mt-0.5">Por {loanTermMonths} meses</span>
                </div>

                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block">Total Intereses</span>
                  <div className="text-xl sm:text-2xl font-black text-rose-400 mt-1">
                    {formatCurrency(loanResult.totalInterest, 'COP')}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Costo del financiamiento</span>
                </div>

                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block">Desembolso Total</span>
                  <div className="text-xl sm:text-2xl font-black text-white mt-1">
                    {formatCurrency(loanResult.totalPaid, 'COP')}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Capital + Intereses</span>
                </div>
              </div>

              {/* Progress Bar of Capital vs Interest */}
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Capital: {formatCurrency(parseFloat(loanAmount) || 0, 'COP')}</span>
                  <span>Interés: {formatCurrency(loanResult.totalInterest, 'COP')}</span>
                </div>
                <div className="w-full h-3 bg-rose-500 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-teal-400 transition-all duration-500"
                    style={{
                      width: `${loanResult.totalPaid > 0 ? ((parseFloat(loanAmount) || 0) / loanResult.totalPaid) * 100 : 50}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-xs text-slate-400 bg-slate-950/30 p-3 rounded-2xl border border-slate-800/60">
              💡 <strong>Recomendación:</strong> Si haces abonos extraordinarios a capital en los primeros 12 meses, reducirás drásticamente los intereses totales pagados.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPOUND INTEREST */}
      {activeTab === 'compound' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Plan de Inversión
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Capital Inicial (COP)</label>
              <input
                type="number"
                value={initialCapital}
                onChange={e => setInitialCapital(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Aporte Mensual Recurrente (COP)</label>
              <input
                type="number"
                value={monthlyContribution}
                onChange={e => setMonthlyContribution(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Rendimiento Estimado Anual (%)</label>
              <input
                type="number"
                step="0.5"
                value={annualReturn}
                onChange={e => setAnnualReturn(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Horizonte de Tiempo (Años)</label>
              <input
                type="number"
                value={years}
                onChange={e => setYears(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-sm">Proyección de Crecimiento del Patrimonio</h3>
                <span className="text-xs text-emerald-400 font-bold">
                  En {years} años
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-950/70 p-4 rounded-2xl border border-emerald-500/30">
                  <span className="text-xs text-slate-400 block">Patrimonio Final</span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                    {formatCurrency(compoundResult.finalBalance, 'COP')}
                  </div>
                </div>

                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block">Tu Dinero Aportado</span>
                  <div className="text-xl sm:text-2xl font-black text-blue-400 mt-1">
                    {formatCurrency(compoundResult.totalInvested, 'COP')}
                  </div>
                </div>

                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 block">Ganancia por Interés</span>
                  <div className="text-xl sm:text-2xl font-black text-teal-300 mt-1">
                    {formatCurrency(compoundResult.totalGains, 'COP')}
                  </div>
                </div>
              </div>

              {/* Area Chart */}
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={compoundResult.chartData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={10} tickFormatter={val => `$${(val / 1000000).toFixed(0)}M`} />
                    <Tooltip
                      formatter={(val: any) => formatCurrency(Number(val), 'COP')}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="total" name="Patrimonio Total" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" />
                    <Area type="monotone" dataKey="invested" name="Capital Aportado" stroke="#3b82f6" strokeWidth={1.5} fillOpacity={0.1} fill="#3b82f6" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEBT CAPACITY */}
      {activeTab === 'capacity' && (
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Evaluación de Capacidad de Endeudamiento</h3>
              <p className="text-xs text-slate-400">Basado en tus ingresos netos y pagos mensuales actuales</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              debtRatio <= 30
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : debtRatio <= 40
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {debtRatio <= 30 ? 'Nivel Saludable' : debtRatio <= 40 ? 'Nivel Precaución' : 'Nivel Alto'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Ingreso Neto ({summary.p1.name})</span>
              <div className="text-xl font-bold text-white mt-1">
                {formatCurrency(netIncome, 'COP')}
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Tras deducción de salud/pensión</span>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Deuda Mensual Actual</span>
              <div className="text-xl font-bold text-rose-400 mt-1">
                {formatCurrency(currentMonthlyDebt, 'COP')}
              </div>
              <span className="text-[10px] text-rose-400/80 block mt-0.5">
                {debtRatio.toFixed(1)}% de tu ingreso neto
              </span>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Capacidad Libre Máxima</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                {formatCurrency(remainingCapacity, 'COP')} / mes
              </div>
              <span className="text-[10px] text-emerald-400/80 block mt-0.5">Límite prudente (35% máx)</span>
            </div>
          </div>

          {/* Ratio Visual Gauge */}
          <div className="space-y-2 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Compromiso de Cuotas Mensuales</span>
              <span className="font-bold">{debtRatio.toFixed(1)}%</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  debtRatio <= 30 ? 'bg-emerald-500' : debtRatio <= 40 ? 'bg-amber-400' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(debtRatio, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
