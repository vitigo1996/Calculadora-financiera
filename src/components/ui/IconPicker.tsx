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
  Key,
  X,
  ChevronRight
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
    title: 'Bienes & Hogar',
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
    title: 'Deudas & Obligaciones',
    items: [
      { id: 'shield_alert', label: 'Deuda', icon: ShieldAlert },
      { id: 'file_text', label: 'Factura', icon: FileText },
      { id: 'receipt', label: 'Recibo', icon: Receipt },
      { id: 'scale', label: 'Impuestos', icon: Scale },
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

export function getIconLabel(iconId?: string): string {
  if (!iconId) return 'Billetera';
  for (const cat of ICON_CATEGORIES) {
    const found = cat.items.find(i => i.id === iconId);
    if (found) return found.label;
  }
  return 'Ícono';
}

interface IconPickerProps {
  selectedIconId?: string;
  onSelectIcon: (iconId: string) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ selectedIconId = 'wallet', onSelectIcon }) => {
  return (
    <div className="space-y-3 max-h-[60vh] overflow-y-auto p-1 pr-2">
      {ICON_CATEGORIES.map((cat, idx) => (
        <div key={idx} className="space-y-1.5">
          <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 sticky top-0 bg-white/95 dark:bg-slate-900/95 py-1 z-10 backdrop-blur-sm">
            {cat.title}
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {cat.items.map(item => {
              const Icon = item.icon;
              const isSelected = selectedIconId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectIcon(item.id)}
                  className={`p-2.5 rounded-2xl border flex items-center gap-2.5 transition-all text-left ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-400/50 scale-[1.02]'
                      : 'bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-white/20' : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800'}`}>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                  </div>
                  <span className="text-xs font-semibold truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIconId?: string;
  onSelectIcon: (iconId: string) => void;
  title?: string;
}

export const IconPickerModal: React.FC<IconPickerModalProps> = ({
  isOpen,
  onClose,
  selectedIconId = 'wallet',
  onSelectIcon,
  title = 'Seleccionar Ícono'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-5 max-w-md w-full shadow-2xl animate-scaleUp max-h-[85vh] flex flex-col my-auto">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <IconPicker
            selectedIconId={selectedIconId}
            onSelectIcon={(iconId) => {
              onSelectIcon(iconId);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
};

interface IconPickerTriggerProps {
  selectedIconId?: string;
  onClick: () => void;
  label?: string;
}

export const IconPickerTrigger: React.FC<IconPickerTriggerProps> = ({
  selectedIconId = 'wallet',
  onClick,
  label = 'Ícono'
}) => {
  const IconComponent = getIconComponent(selectedIconId);
  const iconLabel = getIconLabel(selectedIconId);

  return (
    <div>
      {label && (
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={onClick}
        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 hover:border-blue-500 rounded-2xl p-2.5 flex items-center justify-between transition-all group"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 shadow-sm group-hover:scale-105 transition-transform">
            <IconComponent className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="text-xs font-bold text-slate-800 dark:text-white block">{iconLabel}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Toca para cambiar ícono</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
      </button>
    </div>
  );
};
