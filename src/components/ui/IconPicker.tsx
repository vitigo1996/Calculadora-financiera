import React from 'react';
import {
  Wallet,
  Building2,
  CreditCard,
  Banknote,
  PiggyBank,
  TrendingUp,
  LineChart,
  Bitcoin,
  ShieldCheck,
  ShoppingCart,
  Utensils,
  Coffee,
  Pizza,
  Wine,
  Home,
  Zap,
  Droplet,
  Wifi,
  Hammer,
  Car,
  Fuel,
  Bus,
  Plane,
  Navigation,
  PartyPopper,
  Gamepad2,
  Film,
  Tv,
  Music,
  Ticket,
  ShoppingBag,
  Dumbbell,
  HeartPulse,
  Sparkles,
  Gift,
  GraduationCap,
  PawPrint,
  ShieldAlert,
  Scale,
  AlertCircle,
  Briefcase,
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
    title: 'Finanzas & Dinero',
    items: [
      { id: 'wallet', label: 'Billetera', icon: Wallet },
      { id: 'building', label: 'Banco', icon: Building2 },
      { id: 'credit_card', label: 'Tarjeta', icon: CreditCard },
      { id: 'banknote', label: 'Efectivo', icon: Banknote },
      { id: 'ahorro', label: 'Ahorro', icon: PiggyBank },
      { id: 'inversion', label: 'Inversión', icon: TrendingUp },
      { id: 'etf', label: 'ETF', icon: LineChart },
      { id: 'bitcoin', label: 'Cripto', icon: Bitcoin },
      { id: 'shield_check', label: 'Emergencia', icon: ShieldCheck },
    ]
  },
  {
    title: 'Alimentación & Salidas',
    items: [
      { id: 'shopping_cart', label: 'Mercado', icon: ShoppingCart },
      { id: 'utensils', label: 'Restaurante', icon: Utensils },
      { id: 'coffee', label: 'Café & Snacks', icon: Coffee },
      { id: 'pizza', label: 'Comida Rápida', icon: Pizza },
      { id: 'wine', label: 'Bar & Licores', icon: Wine },
    ]
  },
  {
    title: 'Hogar & Servicios',
    items: [
      { id: 'home', label: 'Vivienda', icon: Home },
      { id: 'zap', label: 'Energía / Luz', icon: Zap },
      { id: 'droplet', label: 'Agua', icon: Droplet },
      { id: 'wifi', label: 'Internet', icon: Wifi },
      { id: 'hammer', label: 'Mantenimiento', icon: Hammer },
    ]
  },
  {
    title: 'Transporte & Viajes',
    items: [
      { id: 'car', label: 'Vehículo', icon: Car },
      { id: 'fuel', label: 'Gasolina', icon: Fuel },
      { id: 'bus', label: 'Transporte', icon: Bus },
      { id: 'navigation', label: 'Taxi / Apps', icon: Navigation },
      { id: 'plane', label: 'Viajes', icon: Plane },
    ]
  },
  {
    title: 'Entretenimiento & Ocio',
    items: [
      { id: 'diversion', label: 'Diversión', icon: PartyPopper },
      { id: 'juegos', label: 'Juegos', icon: Gamepad2 },
      { id: 'film', label: 'Cine & Streaming', icon: Film },
      { id: 'tv', label: 'Suscripciones', icon: Tv },
      { id: 'music', label: 'Música', icon: Music },
      { id: 'ticket', label: 'Eventos', icon: Ticket },
    ]
  },
  {
    title: 'Estilo de Vida & Bienestar',
    items: [
      { id: 'shopping_bag', label: 'Compras & Ropa', icon: ShoppingBag },
      { id: 'regalo', label: 'Regalo', icon: Gift },
      { id: 'dumbbell', label: 'Gimnasio / Deporte', icon: Dumbbell },
      { id: 'heart_pulse', label: 'Salud', icon: HeartPulse },
      { id: 'sparkles', label: 'Cuidado Personal', icon: Sparkles },
      { id: 'graduation_cap', label: 'Educación', icon: GraduationCap },
      { id: 'paw_print', label: 'Mascotas', icon: PawPrint },
    ]
  },
  {
    title: 'Obligaciones & Deudas',
    items: [
      { id: 'shield_alert', label: 'Deuda', icon: ShieldAlert },
      { id: 'scale', label: 'Impuestos', icon: Scale },
      { id: 'alert_circle', label: 'Multas / Otros', icon: AlertCircle },
      { id: 'briefcase', label: 'Trabajo / Nómina', icon: Briefcase },
    ]
  }
];

export function getIconComponent(iconId?: string): React.ComponentType<{ className?: string }> {
  if (!iconId) return Wallet;
  // Compatibility map for old ids if present
  if (iconId === 'piggy_bank') return PiggyBank;
  if (iconId === 'line_chart' || iconId === 'candlestick') return TrendingUp;
  if (iconId === 'coins' || iconId === 'circle_dollar' || iconId === 'dollar_sign') return Banknote;
  if (iconId === 'file_text' || iconId === 'receipt') return ShieldAlert;

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
    <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1 pr-2 scrollbar-thin">
      {ICON_CATEGORIES.map((cat, idx) => (
        <div key={idx} className="space-y-2">
          <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 sticky top-0 bg-white/95 dark:bg-slate-900/95 py-1 z-10 backdrop-blur-sm">
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
                  <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-white/20 text-white' : 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border border-slate-200/80 dark:border-slate-800'}`}>
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
  title = 'Seleccionar Categoría'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 pb-64 sm:pb-8 flex justify-center items-start sm:items-center modal-backdrop-scroll">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-5 max-w-md w-full shadow-2xl animate-scaleUp max-h-[85vh] flex flex-col my-auto modal-card-scroll">
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
          <div className="p-1.5 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
            <IconComponent className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-white">{iconLabel}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
      </button>
    </div>
  );
};
