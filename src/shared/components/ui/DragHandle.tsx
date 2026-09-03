import { useEffect, useState } from 'react';
import { MoveHorizontal } from 'lucide-react';
import { cn } from '../../lib/cn';

interface DragHandleProps {
  orientation: 'vertical' | 'horizontal';
  onDrag: (clientPos: number) => void;
  showIcon?: boolean;
}

export function DragHandle({ orientation, onDrag, showIcon = false }: DragHandleProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;
    const move = (e: PointerEvent) => onDrag(orientation === 'vertical' ? e.clientX : e.clientY);
    const up = () => setActive(false);
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    return () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
    };
  }, [active, orientation, onDrag]);

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      onPointerDown={(e) => {
        e.preventDefault();
        setActive(true);
      }}
      className={cn(
        'group relative z-10 shrink-0 bg-transparent transition-colors duration-150',
        orientation === 'vertical' ? 'w-1.5 cursor-col-resize' : 'h-1.5 cursor-row-resize',
        active && 'bg-[var(--accent)]/40',
      )}
    >
      <div
        className={cn(
          'absolute rounded-none bg-line transition-colors duration-150 group-hover:bg-[var(--accent)]/60',
          orientation === 'vertical' ? 'inset-y-3 left-1/2 w-px -translate-x-1/2' : 'inset-x-3 top-1/2 h-px -translate-y-1/2',
        )}
      />
      {showIcon && (
        <MoveHorizontal
          size={10}
          className={cn(
            'absolute text-[#6c7086] opacity-0 transition-opacity duration-150 group-hover:opacity-100',
            orientation === 'vertical' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          )}
        />
      )}
    </div>
  );
}
