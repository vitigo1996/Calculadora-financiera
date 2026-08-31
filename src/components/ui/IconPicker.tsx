import React from 'react';
import {
  Wallet,
  Building2,
  Coins,
  TrendingUp,
  PiggyBank,
  CreditCard,
  Landmark,
  CircleDollarSign,
  DollarSign,
  Banknote,
  Vault,
  LineChart,
  CandlestickChart,
  Briefcase,
  Globe,
  Bitcoin,
  Gem,
  Sparkles,
  Layers,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Coffee,
  Car,
  Home,
  Plane,
  Receipt,
  ShieldAlert,
  FileText,
  AlertCircle,
  Scale,
  Smartphone,
  Key
} from 'lucide-react';

export const ICON_LIBRARY: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'wallet', label: 'Billetera', icon: Wallet },
  { id: 'building', label: 'Banco', icon: Building2 },
  { id: 'landmark', label: 'Institución', icon: Landmark },
  { id: 'vault', label: 'Bóveda / Reserva', icon: Vault },
  { id: 'coins', label: 'Monedas / USDt', icon: Coins },
  { id: 'trending_up', label: 'Inversión / ETF', icon: TrendingUp },
  { id: 'line_chart', label: 'Acciones / Trading', icon: LineChart },
  { id: 'candlestick', label: 'Bolsa', icon: CandlestickChart },
  { id: 'briefcase', label: 'Portafolio', icon: Briefcase },
  { id: 'globe', label: 'Global / Forex', icon: Globe },
  { id: 'bitcoin', label: 'Criptomonedas', icon: Bitcoin },
  { id: 'gem', label: 'Activo Valioso', icon: Gem },
  { id: 'sparkles', label: 'Digital / Especial', icon: Sparkles },
  { id: 'piggy_bank', label: 'Alcancía / Ahorro', icon: PiggyBank },
  { id: 'credit_card', label: 'Tarjeta', icon: CreditCard },
  { id: 'dollar_sign', label: 'Dólares', icon: DollarSign },
  { id: 'circle_dollar', label: 'Divisas', icon: CircleDollarSign },
  { id: 'banknote', label: 'Efectivo', icon: Banknote },
  { id: 'shield_check', label: 'Emergencia / Seguro', icon: ShieldCheck },
  { id: 'shield_alert', label: 'Deuda / Riesgo', icon: ShieldAlert },
  { id: 'file_text', label: 'Contrato / Factura', icon: FileText },
  { id: 'receipt', label: 'Recibo', icon: Receipt },
  { id: 'car', label: 'Vehículo / Auto', icon: Car },
  { id: 'home', label: 'Vivienda / Casa', icon: Home },
  { id: 'plane', label: 'Viajes / Ahorro', icon: Plane },
  { id: 'shopping_bag', label: 'Compras', icon: ShoppingBag },
  { id: 'shopping_cart', label: 'Supermercado', icon: ShoppingCart },
  { id: 'coffee', label: 'Gastos Personales', icon: Coffee },
  { id: 'smartphone', label: 'App / Neobanco', icon: Smartphone },
  { id: 'scale', label: 'Legal / Impuestos', icon: Scale },
  { id: 'key', label: 'Patrimonio', icon: Key },
  { id: 'layers', label: 'Fondos Múltiples', icon: Layers },
];

export function getIconComponent(iconId?: string): React.ComponentType<{ className?: string }> {
  if (!iconId) return Wallet;
  const found = ICON_LIBRARY.find(i => i.id === iconId);
  return found ? found.icon : Wallet;
}

interface IconPickerProps {
  selectedIconId?: string;
  onSelectIcon: (iconId: string) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ selectedIconId = 'wallet', onSelectIcon }) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
        Selecciona un Ícono
      </label>
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
        {ICON_LIBRARY.map(item => {
          const Icon = item.icon;
          const isSelected = selectedIconId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectIcon(item.id)}
              title={item.label}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-emerald-500 text-white shadow-md scale-110 ring-2 ring-emerald-400'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:scale-105'
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
