import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  // Recalcular posición del desplegable evitando que se corte
  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();

    // Si el botón se sale de la pantalla, cerramos el menú
    if (rect.bottom < -50 || rect.top > window.innerHeight + 50) {
      setIsOpen(false);
      return;
    }

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    // Si no hay espacio suficiente hacia abajo (menos de 220px) y hay más espacio arriba, abrir hacia arriba
    const openUpwards = spaceBelow < 220 && spaceAbove > spaceBelow;

    const style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 99999,
    };

    if (openUpwards) {
      style.bottom = `${window.innerHeight - rect.top + 6}px`;
      style.maxHeight = `${Math.min(260, Math.max(120, spaceAbove - 16))}px`;
    } else {
      style.top = `${rect.bottom + 6}px`;
      style.maxHeight = `${Math.min(260, Math.max(120, spaceBelow - 16))}px`;
    }

    if (fullWidth) {
      style.left = `${Math.max(8, rect.left)}px`;
      style.width = `${rect.width}px`;
      style.maxWidth = `calc(100vw - 16px)`;
    } else {
      if (align === 'right') {
        const rightOffset = window.innerWidth - rect.right;
        style.right = `${Math.max(8, rightOffset)}px`;
        style.minWidth = `${rect.width}px`;
        style.maxWidth = `calc(100vw - 16px)`;
      } else {
        style.left = `${Math.max(8, rect.left)}px`;
        style.minWidth = `${rect.width}px`;
        style.maxWidth = `calc(100vw - 16px)`;
      }
    }

    setMenuStyle(style);
  }, [align, fullWidth]);

  // Actualizar posición al abrir
  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, updatePosition]);

  // Manejar scroll y resize para mantener el menú alineado
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, updatePosition]);

  // Cerrar al hacer clic fuera o presionar Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
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
        ref={buttonRef}
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

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={menuStyle}
            className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-1.5 space-y-1 animate-scaleUp overflow-y-auto overscroll-contain scrollbar-thin ${dropdownClassName}`}
          >
            {groupedOptions.map((g, gIdx) => (
              <div
                key={gIdx}
                className={
                  gIdx > 0 && g.group
                    ? 'pt-2 mt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-1'
                    : 'space-y-1'
                }
              >
                {g.group && (
                  <div className="px-1.5 pt-1 pb-0.5">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/90 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/70 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0" />
                      <span className="text-[11px] font-black uppercase tracking-wider text-blue-900 dark:text-blue-200">
                        {g.group}
                      </span>
                    </div>
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
                      className={`w-full px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors text-left ${
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
          </div>,
          document.body
        )}
    </div>
  );
};
