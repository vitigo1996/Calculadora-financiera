import React from 'react';
import {
  Banknote,
  CreditCard,
  TrendingUp,
  PiggyBank,
  ArrowLeftRight,
  ShoppingCart,
  Utensils,
  Coffee,
  Bike,
  Key,
  Home,
  Zap,
  Fuel,
  Bus,
  Wrench,
  Ticket,
  Navigation,
  Car,
  Gamepad2,
  Tv,
  PartyPopper,
  Palmtree,
  Sparkles,
  ShoppingBag,
  HeartPulse,
  GraduationCap,
  PawPrint,
  X,
  ChevronRight,
  Sparkle
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
    title: 'Finanzas',
    items: [
      { id: 'pago', label: 'Pago', icon: Banknote },
      { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
      { id: 'inversion', label: 'Inversión', icon: TrendingUp },
      { id: 'ahorro', label: 'Ahorro', icon: PiggyBank },
      { id: 'transferencia', label: 'Transferencia', icon: ArrowLeftRight },
    ]
  },
  {
    title: 'Alimentación',
    items: [
      { id: 'mercado', label: 'Mercado', icon: ShoppingCart },
      { id: 'restaurante', label: 'Restaurante', icon: Utensils },
      { id: 'bebidas', label: 'Bebidas', icon: Coffee },
      { id: 'domicilio', label: 'Domicilio', icon: Bike },
    ]
  },
  {
    title: 'Hogar',
    items: [
      { id: 'arriendo', label: 'Arriendo', icon: Key },
      { id: 'hipoteca', label: 'Hipoteca', icon: Home },
      { id: 'servicios', label: 'Servicios', icon: Zap },
    ]
  },
  {
    title: 'Transporte',
    items: [
      { id: 'gasolina', label: 'Gasolina', icon: Fuel },
      { id: 'publico', label: 'Público', icon: Bus },
      { id: 'mantenimiento', label: 'Mantenimiento', icon: Wrench },
      { id: 'tiquetes', label: 'Tiquetes', icon: Ticket },
      { id: 'apps', label: 'Apps', icon: Navigation },
      { id: 'parqueadero', label: 'Parqueadero', icon: Car },
    ]
  },
  {
    title: 'Entretenimiento',
    items: [
      { id: 'juegos', label: 'Juegos', icon: Gamepad2 },
      { id: 'suscripciones', label: 'Suscripciones', icon: Tv },
      { id: 'eventos', label: 'Eventos', icon: PartyPopper },
      { id: 'paseos', label: 'Paseos', icon: Palmtree },
      { id: 'salidas', label: 'Salidas', icon: Sparkles },
    ]
  },
  {
    title: 'General',
    items: [
      { id: 'compras', label: 'Compras', icon: ShoppingBag },
      { id: 'salud', label: 'Salud', icon: HeartPulse },
      { id: 'educacion', label: 'Educación', icon: GraduationCap },
      { id: 'mascota', label: 'Mascota', icon: PawPrint },
    ]
  }
];

// Flat list of all current icon items
export const ALL_ICON_ITEMS: IconItem[] = ICON_CATEGORIES.flatMap(cat => cat.items);

// Normalization / alias map for legacy saved icons
const LEGACY_ICON_ALIAS_MAP: Record<string, string> = {
  // Finanzas
  wallet: 'pago',
  building: 'hipoteca',
  credit_card: 'tarjeta',
  banknote: 'pago',
  coins: 'pago',
  circle_dollar: 'pago',
  dollar_sign: 'pago',
  etf: 'inversion',
  line_chart: 'inversion',
  candlestick: 'inversion',
  bitcoin: 'inversion',
  shield_check: 'ahorro',
  piggy_bank: 'ahorro',
  layers: 'transferencia',

  // Alimentación
  shopping_cart: 'mercado',
  utensils: 'restaurante',
  coffee: 'bebidas',
  pizza: 'domicilio',
  wine: 'bebidas',

  // Hogar
  home: 'hipoteca',
  zap: 'servicios',
  droplet: 'servicios',
  wifi: 'servicios',
  hammer: 'mantenimiento',

  // Transporte
  car: 'parqueadero',
  fuel: 'gasolina',
  bus: 'publico',
  navigation: 'apps',
  plane: 'tiquetes',

  // Entretenimiento
  diversion: 'eventos',
  film: 'suscripciones',
  tv: 'suscripciones',
  music: 'eventos',
  ticket: 'tiquetes',

  // General & Obligaciones
  shopping_bag: 'compras',
  regalo: 'compras',
  dumbbell: 'salud',
  heart_pulse: 'salud',
  sparkles: 'salidas',
  graduation_cap: 'educacion',
  paw_print: 'mascota',
  shield_alert: 'pago',
  scale: 'pago',
  alert_circle: 'pago',
  briefcase: 'pago',
  file_text: 'pago',
  receipt: 'pago'
};

export function normalizeIconId(iconId?: string): string {
  if (!iconId) return 'pago';
  const clean = iconId.toLowerCase().trim();
  if (ALL_ICON_ITEMS.some(i => i.id === clean)) {
    return clean;
  }
  return LEGACY_ICON_ALIAS_MAP[clean] || 'pago';
}

export function getIconComponent(iconId?: string): React.ComponentType<{ className?: string }> {
  const normalizedId = normalizeIconId(iconId);
  const found = ALL_ICON_ITEMS.find(i => i.id === normalizedId);
  return found ? found.icon : Banknote;
}

export function getIconLabel(iconId?: string): string {
  const normalizedId = normalizeIconId(iconId);
  const found = ALL_ICON_ITEMS.find(i => i.id === normalizedId);
  return found ? found.label : 'Categoría';
}

interface IconPickerProps {
  selectedIconId?: string;
  onSelectIcon: (iconId: string) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ selectedIconId = 'pago', onSelectIcon }) => {
  const activeNormalized = normalizeIconId(selectedIconId);

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
              const isSelected = activeNormalized === item.id;
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
  selectedIconId = 'pago',
  onSelectIcon,
  title = 'Seleccionar Categoría'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 pb-8 sm:p-6 flex justify-center items-start sm:items-center modal-backdrop-scroll">
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
  selectedIconId = 'pago',
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
