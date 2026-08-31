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

export interface IconItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface IconCategory {
  title: string;
  items: IconItem[];
}

export const ICON_CATEGORIES: IconCategory[] = [
  {
    title: 'Bancos & Cuentas',
    items: [
      { id: 'wallet', label: 'Billetera', icon: Wallet },
      { id: 'building', label: 'Banco', icon: Building2 },
      { id: 'smartphone', label: 'Neobanco', icon: Smartphone },
      { id: 'landmark', label: 'Institución', icon: Landmark },
      { id: 'vault', label: 'Bóveda', icon: Vault },
      { id: 'credit_card', label: 'Tarjeta', icon: CreditCard },
    ]
  },
  {
    title: 'Inversiones & Trading',
    items: [
      { id: 'trending_up', label: 'ETF / Renta', icon: TrendingUp },
      { id: 'line_chart', label: 'Acciones', icon: LineChart },
      { id: 'candlestick', label: 'Trading', icon: CandlestickChart },
      { id: 'briefcase', label: 'Portafolio', icon: Briefcase },
      { id: 'globe', label: 'Global', icon: Globe },
      { id: 'gem', label: 'Patrimonio', icon: Gem },
    ]
  },
  {
    title: 'Cripto & Divisas',
    items: [
      { id: 'coins', label: 'Monedas / USDt', icon: Coins },
      { id: 'bitcoin', label: 'Cripto', icon: Bitcoin },
      { id: 'dollar_sign', label: 'Dólares', icon: DollarSign },
      { id: 'circle_dollar', label: 'Divisas', icon: CircleDollarSign },
      { id: 'sparkles', label: 'Digital', icon: Sparkles },
      { id: 'layers', label: 'Fondos', icon: Layers },
    ]
  },
  {
    title: 'Efectivo & Ahorro',
    items: [
      { id: 'banknote', label: 'Efectivo', icon: Banknote },
      { id: 'piggy_bank', label: 'Alcancía', icon: PiggyBank },
      { id: 'shield_check', label: 'Emergencia', icon: ShieldCheck },
      { id: 'key', label: 'Seguridad', icon: Key },
    ]
  },
  {
    title: 'Bienes, Vehículos & Hogar',
    items: [
      { id: 'car', label: 'Vehículo', icon: Car },
      { id: 'home', label: 'Vivienda', icon: Home },
      { id: 'plane', label: 'Viajes', icon: Plane },
      { id: 'shopping_bag', label: 'Compras', icon: ShoppingBag },
      { id: 'shopping_cart', label: 'Mercado', icon: ShoppingCart },
      { id: 'coffee', label: 'Gastos', icon: Coffee },
    ]
  },
  {
    title: 'Deudas, Facturas & Obligaciones',
    items: [
      { id: 'shield_alert', label: 'Deuda / Riesgo', icon: ShieldAlert },
      { id: 'file_text', label: 'Factura / SOAT', icon: FileText },
      { id: 'receipt', label: 'Recibo', icon: Receipt },
      { id: 'scale', label: 'Impuestos / Renta', icon: Scale },
      { id: 'alert_circle', label: 'Multa', icon: AlertCircle },
    ]
  }
];

export function getIconComponent(iconId?: string): React.ComponentType<{ className?: string }> {
  if (!iconId) return Wallet;
  for (const cat of ICON_CATEGORIES) {
    const found = cat.items.find(i => i.id === iconId);
    if (found) return found.icon;
  }
  return Wallet;
}

interface IconPickerProps {
  selectedIconId?: string;
  onSelectIcon: (iconId: string) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ selectedIconId = 'wallet', onSelectIcon }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
          Ícono de la Categoría
        </label>
        <span className="text-[11px] text-slate-400">Desplaza para ver más</span>
      </div>

      <div className="max-h-56 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
        {ICON_CATEGORIES.map((cat, idx) => (
          <div key={idx} className="space-y-1.5">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 sticky top-0 bg-slate-50/95 dark:bg-slate-950/95 py-0.5 z-10 backdrop-blur-sm">
              {cat.title}
            </h5>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {cat.items.map(item => {
                const Icon = item.icon;
                const isSelected = selectedIconId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectIcon(item.id)}
                    className={`p-2 rounded-xl border flex items-center gap-2 transition-all text-left ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm ring-1 ring-blue-400'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-[11px] font-medium truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
