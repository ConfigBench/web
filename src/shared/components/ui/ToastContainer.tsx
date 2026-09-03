import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Check, X } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone?: 'green' | 'red' | 'orange';
}

const EXIT_MS = 140;

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  const [leaving, setLeaving] = useState<Set<number>>(new Set());
  const timers = useRef<Set<number>>(new Set());

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  const dismiss = (id: number) => {
    if (leaving.has(id)) return;
    setLeaving((s) => new Set(s).add(id));
    const timer = window.setTimeout(() => {
      timers.current.delete(timer);
      setLeaving((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
      onDismiss(id);
    }, EXIT_MS);
    timers.current.add(timer);
  };

  if (toasts.length === 0) return null;

  const toneMap = {
    green: { bar: 'bg-[var(--accent)]', icon: Check, iconColor: 'text-[var(--accent)]' },
    red: { bar: 'bg-[#f38ba8]', icon: AlertTriangle, iconColor: 'text-[#f38ba8]' },
    orange: { bar: 'bg-[var(--accent)]', icon: AlertTriangle, iconColor: 'text-[var(--accent)]' },
  };

  return createPortal(
    <div className="fixed right-4 bottom-4 z-50 flex w-[calc(100vw-2rem)] max-w-80 flex-col gap-2">
      {toasts.map((toast) => {
        const toneConfig = toneMap[toast.tone ?? 'green'];
        const isLeaving = leaving.has(toast.id);
        const Icon = toneConfig.icon;

        return (
          <div
            key={toast.id}
            className={cn(
              'mc-btn relative overflow-hidden rounded-none p-0 shadow-lg',
              isLeaving ? 'toast-out' : 'toast-in',
            )}
          >
            <div className="flex items-start gap-2.5 px-3 py-2.5">
              <Icon size={15} className={cn('mt-0.5 shrink-0', toneConfig.iconColor)} />
              <div className="min-w-0 flex-1">
                <p className="font-mc text-[12px] leading-snug text-[#cdd6f4]">{toast.title}</p>
                {toast.description && (
                  <p className="mt-1 text-[11px] leading-relaxed text-[#a6adc8]">{toast.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss"
                className="mc-icon-btn h-5 w-5 shrink-0 rounded-none p-0"
              >
                <X size={10} />
              </button>
            </div>
            <div className={cn('h-0.5 w-full origin-left', toneConfig.bar)} />
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
