import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../../shared/lib/cn';

export interface DropdownOption {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
}

interface DropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  ariaLabel?: string;
  className?: string;
  menuClassName?: string;
  align?: 'left' | 'right';
  bare?: boolean;
  placeholder?: string;
  highlight?: boolean;
  hoverOpen?: boolean;
  staticLabel?: boolean;
  triggerIcon?: ReactNode;
}

const EXIT_MS = 110;
const HOVER_CLOSE_MS = 120;

export default function Dropdown({
  value,
  options,
  onChange,
  ariaLabel,
  className,
  menuClassName,
  align = 'left',
  bare = false,
  placeholder,
  highlight = false,
  hoverOpen = false,
  staticLabel = false,
  triggerIcon,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, options.findIndex((o) => o.value === value)));
  const exitTimer = useRef(0);
  const hoverTimer = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);
  const showLabel = staticLabel ? placeholder : (current?.label ?? placeholder ?? value);

  const openMenu = useCallback(() => {
    window.clearTimeout(exitTimer.current);
    const initialIndex = options.findIndex((o) => o.value === value);
    setActiveIndex(initialIndex >= 0 ? initialIndex : 0);
    setOpen(true);
    setMounted(true);
  }, [options, value]);

  const closeMenu = useCallback(() => {
    setOpen(false);
    window.clearTimeout(exitTimer.current);
    exitTimer.current = window.setTimeout(() => setMounted(false), EXIT_MS);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onOutside = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) closeMenu();
    };
    document.addEventListener('mousedown', onOutside);
    return () => {
      document.removeEventListener('mousedown', onOutside);
    };
  }, [open, closeMenu]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openMenu();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + options.length) % options.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const targetOption = options[activeIndex];
      if (targetOption) {
        onChange(targetOption.value);
        closeMenu();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu();
    }
  };

  useEffect(
    () => () => {
      window.clearTimeout(exitTimer.current);
      window.clearTimeout(hoverTimer.current);
    },
    [],
  );

  const hoverProps = hoverOpen
    ? {
        onMouseEnter: () => {
          window.clearTimeout(hoverTimer.current);
          openMenu();
        },
        onMouseLeave: () => {
          window.clearTimeout(hoverTimer.current);
          hoverTimer.current = window.setTimeout(closeMenu, HOVER_CLOSE_MS);
        },
      }
    : {};

  return (
    <div ref={rootRef} className={cn('relative', className)} {...hoverProps}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onKeyDown={handleKeyDown}
        onClick={() => (open ? closeMenu() : openMenu())}
        className={cn(
          'flex h-full w-full items-center justify-between gap-1.5 rounded-none px-2.5 text-[13px]',
          !bare && 'mc-btn',
          highlight ? 'mc-btn-accent' : 'text-[#a6adc8] hover:text-[#cdd6f4]',
        )}
      >
        {triggerIcon ? (
          <span className="flex shrink-0 items-center gap-1.5">
            {triggerIcon}
            <span className="min-w-0 truncate">{showLabel}</span>
          </span>
        ) : (
          <span className="min-w-0 truncate">{showLabel}</span>
        )}
        <ChevronDown size={13} className={cn('shrink-0 transition-transform duration-150', open && 'rotate-180')} />
      </button>
      {mounted && (
        <div
          role="listbox"
          className={cn(
            'absolute top-full z-40 mt-1 flex max-h-72 min-w-full flex-col overflow-y-auto rounded-none border border-line bg-panel py-1 shadow-lg',
            align === 'right' ? 'right-0' : 'left-0',
            open ? 'menu-in' : 'menu-out',
            menuClassName,
          )}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = index === activeIndex;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                tabIndex={-1}
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  closeMenu();
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  'flex items-center gap-2.5 whitespace-nowrap px-3 py-2 text-left text-[13px] text-[#a6adc8] transition-colors duration-150 hover:bg-[#232333] hover:text-[#cdd6f4]',
                  isHighlighted && 'bg-[#232333] text-[#cdd6f4]',
                  isSelected && 'bg-[var(--accent)]/10 text-[var(--accent)]',
                )}
              >
                {option.icon && <span className="flex w-4 shrink-0 items-center justify-center">{option.icon}</span>}
                <span className="min-w-0 truncate">{option.label}</span>
                {isSelected && <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-none bg-[var(--accent)]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
