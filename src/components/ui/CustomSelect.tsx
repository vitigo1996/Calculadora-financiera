import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface CustomSelectOption {
  value: string | number;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  group?: string;
}

export interface CustomSelectProps {
  value: string | number;
  onChange: (value: any) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string; // Container wrapper classes
  buttonClassName?: string; // Button trigger classes override/extension
  dropdownClassName?: string;
  align?: 'left' | 'right';
  fullWidth?: boolean;
  size?: 'sm' | 'md';
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  disabled = false,
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  align = 'left',
  fullWidth = true,
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find(opt => String(opt.value) === String(value));
  const SelectedIcon = selectedOption?.icon;

  // Group options if any option has a group
  const hasGroups = options.some(opt => Boolean(opt.group));
  const groupedOptions: { group?: string; items: CustomSelectOption[] }[] = [];

  if (hasGroups) {
    const groupMap = new Map<string, CustomSelectOption[]>();
    const ungrouped: CustomSelectOption[] = [];

    options.forEach(opt => {
      if (opt.group) {
        if (!groupMap.has(opt.group)) {
          groupMap.set(opt.group, []);
        }
        groupMap.get(opt.group)!.push(opt);
      } else {
        ungrouped.push(opt);
      }
    });

    if (ungrouped.length > 0) {
      groupedOptions.push({ items: ungrouped });
    }
    groupMap.forEach((items, group) => {
      groupedOptions.push({ group, items });
    });
  } else {
    groupedOptions.push({ items: options });
  }

  const py = size === 'sm' ? 'py-1.5 px-3' : 'py-2.5 px-4';
  const textStyle = size === 'sm' ? 'text-xs' : 'text-xs';

  return (
    <div
      ref={containerRef}
      className={`relative ${fullWidth ? 'w-full' : 'inline-block'} ${className}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full rounded-2xl ${textStyle} font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 shadow-xs flex items-center justify-between hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${py} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 text-left">
          {SelectedIcon && (
            <SelectedIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-1.5 ${
            isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden p-1.5 space-y-1 animate-scaleUp max-h-60 overflow-y-auto scrollbar-thin ${
            fullWidth ? 'w-full min-w-full' : 'min-w-[150px]'
          } ${align === 'right' ? 'right-0' : 'left-0'} ${dropdownClassName}`}
        >
          {groupedOptions.map((g, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {g.group && (
                <div className="px-3 pt-1.5 pb-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {g.group}
                </div>
              )}
              {g.items.map(opt => {
                const isSelected = String(opt.value) === String(value);
                const OptIcon = opt.icon;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors text-left ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {OptIcon && (
                        <OptIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      )}
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
