import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { getRandomColor, rgbToHex } from '../engine/colors';
import { ColorGradient, type GradientType } from '../engine/gradients';
import { getRGBColorStop, getShadowColors, sortColors } from '../engine/rgbUtils';
import type { ColorStop } from '../engine/defaults';
import { useRgbStore } from './rgbContexts';

function generateGradientCSS(colors: ColorStop[], gradientType: GradientType, samples = 20): string {
  if (colors.length < 2) return colors[0]?.hex ?? 'transparent';
  if (gradientType === 'rgb') {
    return `linear-gradient(to right, ${sortColors(colors).map((c) => `${c.hex} ${c.pos}%`).join(', ')})`;
  }
  const gradient = new ColorGradient(sortColors(colors).map(getRGBColorStop), samples, gradientType);
  const sampled: string[] = [];
  for (let i = 0; i < samples; i++) {
    sampled.push(`#${rgbToHex(gradient.next())} ${((i / (samples - 1)) * 100).toFixed(1)}%`);
  }
  return `linear-gradient(to right, ${sampled.join(', ')})`;
}

interface ColorMapProps {
  id?: string;
  shadow?: boolean;
  colors?: ColorStop[];
  gradientType?: GradientType;
  onColorsChange?: (colors: ColorStop[]) => void;
}

export default function ColorMap({ id = 'text', shadow = false, colors, gradientType, onColorsChange }: ColorMapProps) {
  const { store, update } = useRgbStore();
  const list = colors ?? (shadow ? getShadowColors(store) : store.colors);
  const resolvedType = gradientType ?? store.gradientType;
  const [hoverPos, setHoverPos] = useState<number | null>(null);
  const dragIndex = useRef<number | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const setList = useCallback(
    (next: ColorStop[]) => {
      if (onColorsChange) onColorsChange(next);
      else if (shadow) update({ shadowColors: next });
      else update({ colors: next });
    },
    [onColorsChange, shadow, update],
  );

  const posFromEvent = (clientX: number): number => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return Math.round(((clientX - rect.left) / rect.width) * 1000) / 10;
  };

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (dragIndex.current === null) return;
      const pos = Math.min(100, Math.max(0, posFromEvent(e.clientX)));
      const next = list.slice();
      next[dragIndex.current] = { ...next[dragIndex.current], pos: Math.round(pos * 1000) / 1000 };
      setList(next);
    };
    const up = () => {
      if (dragIndex.current !== null) {
        dragIndex.current = null;
        setList(sortColors(list));
      }
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    return () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };
  }, [list, setList]);

  if (store.disperse && !colors && !shadow) return null;

  return (
    <div
      ref={barRef}
      id={`colormap${id}`}
      className="relative my-5 h-2.5 w-full rounded-full transition-all"
      style={{ background: generateGradientCSS(list, resolvedType) }}
      onMouseDown={(e) => {
        if (e.target !== e.currentTarget) return;
        const pos = Math.round(posFromEvent(e.clientX) * 1000) / 1000;
        if (list.find((c) => c.pos === pos)) return;
        setList(sortColors([...list, { hex: getRandomColor(), pos }]));
      }}
      onMouseMove={(e) => {
        if (e.target !== e.currentTarget) return setHoverPos(null);
        setHoverPos(posFromEvent(e.clientX));
      }}
      onMouseLeave={() => setHoverPos(null)}
    >
      {hoverPos !== null && !list.find((c) => c.pos === hoverPos) && (
        <div
          className="pointer-events-none absolute -ml-3.5 -mt-2 flex h-6 w-6 items-center justify-center rounded-full bg-panel shadow"
          style={{ left: `${hoverPos}%` }}
        >
          <Plus size={15} />
        </div>
      )}
      {list.map((color, i) => (
        <div
          key={`${i}/${list.length}`}
          className="absolute -ml-3.5 -mt-2 h-6 w-6 cursor-grab rounded-full border border-white/30 shadow-md transition-transform hover:scale-125 active:cursor-grabbing"
          style={{ background: color.hex, left: `${color.pos}%` }}
          title={`${color.pos}%`}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            dragIndex.current = i;
          }}
        />
      ))}
    </div>
  );
}
