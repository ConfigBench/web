import { useEffect, useRef, useState } from 'react';
import { ArrowRightLeft, Copy, Dices, Eclipse, GripVertical, MoveHorizontal, Palette, Shuffle, Trash } from 'lucide-react';
import { cn } from '../../../shared/lib/cn';
import { getBrightness, getRandomColor, hexToRGB, invertRgbColor, rgbToHex } from '../engine/colors';
import { disperseColors, sortColors } from '../engine/rgbUtils';
import { GRADIENT_TYPES, type GradientType } from '../engine/gradients';
import type { ColorStop } from '../engine/defaults';
import { useRgbStore } from './rgbContexts';
import ShowAllGradientsButton from './ShowAllGradientsButton';
import Dropdown from '../../../shared/components/ui/Dropdown';

const HEX_RE_SHADOW = /^#?[0-9A-F]{0,8}$/i;
const HEX_RE_TEXT = /^#?[0-9A-F]{0,6}$/i;

function moveItem(array: ColorStop[], fromIndex: number, toIndex: number): ColorStop[] {
  const arr = array.map((c) => ({ ...c }));
  const positions = arr.map((item) => item.pos);
  const [moved] = arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, moved);
  for (let i = 0; i < arr.length; i++) arr[i].pos = positions[i];
  return arr;
}

interface ColorListProps {
  id?: string;
  shadow?: boolean;
  colors?: ColorStop[];
  gradientType?: GradientType;
  textLength?: number;
  onColorsChange?: (colors: ColorStop[]) => void;
  onGradientTypeChange?: (type: GradientType) => void;
}

export default function ColorList({ id = 'text', shadow = false, colors, gradientType, textLength, onColorsChange, onGradientTypeChange }: ColorListProps) {
  const { store, update } = useRgbStore();
  const [opened, setOpened] = useState(-1);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const list = colors ?? (shadow ? (store.shadowColors ?? []) : store.colors);
  const resolvedTextLength = textLength ?? Array.from(store.text).length;
  const resolvedType = gradientType ?? store.gradientType;

  const setList = (next: ColorStop[]) => {
    if (onColorsChange) onColorsChange(next);
    else if (shadow) update({ shadowColors: next });
    else update({ colors: next });
  };

  useEffect(() => {
    if (opened < 0) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(`#colorlist${id}-popup`) && !target.closest(`#colorlistcolors${id}`)) setOpened(-1);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [opened, id]);

  const changeCount = (count: number) => {
    let amount = Math.min(count, resolvedTextLength);
    if (amount < 1) amount = 1;
    const next: ColorStop[] = [];
    for (let i = 0; i < amount; i++) {
      next.push(list[i] ?? { hex: getRandomColor(), pos: 0 });
    }
    setList(disperseColors(next));
  };

  return (
    <div id={`colorlist${id}`} className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <h3 className="flex flex-1 items-center gap-2 text-[15px] font-semibold text-[#cdd6f4]">
          <Palette size={17} /> Colors{shadow ? ' (shadow)' : ''}
        </h3>
        <div className="mc-input flex items-center overflow-hidden rounded-md">
          <button type="button" onClick={() => changeCount(list.length - 1)} className="px-2.5 py-1.5 text-[#a6adc8] transition-colors hover:text-[#cdd6f4]">
            −
          </button>
          <span className="w-8 text-center font-mono text-[13px] text-[#cdd6f4]">{list.length}</span>
          <button type="button" onClick={() => changeCount(list.length + 1)} className="px-2.5 py-1.5 text-[#a6adc8] transition-colors hover:text-[#cdd6f4]">
            +
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          title="Randomize"
          onClick={() => setList(list.map((c) => ({ hex: getRandomColor(), pos: c.pos })))}
          className="mc-icon-btn rounded-none p-1.5"
        >
          <Dices size={16} />
        </button>
        {shadow && (
          <button
            type="button"
            title="Copy from text colors"
            onClick={() => setList(store.colors.map((c) => ({ ...c })))}
            className="mc-icon-btn rounded-none p-1.5"
          >
            <Copy size={16} />
          </button>
        )}
        <button
          type="button"
          title="Shuffle"
          disabled={list.length < 3}
          onClick={() => {
            const shuffled = [...list].sort(() => Math.random() - 0.5);
            setList(shuffled.map((c, i) => ({ hex: c.hex, pos: list[i].pos })));
          }}
          className="mc-icon-btn rounded-none p-1.5 disabled:opacity-40"
        >
          <Shuffle size={16} />
        </button>
        <button
          type="button"
          title="Disperse"
          onClick={() => update({ disperse: !store.disperse })}
          className={cn(
            'mc-icon-btn rounded-none p-1.5',
            store.disperse && '!border-[var(--accent)] !bg-[var(--accent)]/20 !text-[var(--accent)]',
          )}
        >
          <MoveHorizontal size={16} />
        </button>
        <button
          type="button"
          title="Invert"
          onClick={() =>
            setList(list.map((c) => ({ ...c, hex: `#${rgbToHex(invertRgbColor(hexToRGB(c.hex)))}` })))
          }
          className="mc-icon-btn rounded-none p-1.5"
        >
          <Eclipse size={16} />
        </button>
        <button
          type="button"
          title="Reverse"
          onClick={() => setList([...list].reverse().map((c) => ({ hex: c.hex, pos: 100 - c.pos })))}
          className="mc-icon-btn rounded-none p-1.5"
        >
          <ArrowRightLeft size={16} />
        </button>
        <button
          type="button"
          title="Duplicate"
          disabled={list.length >= resolvedTextLength || list.length === 0}
          onClick={() => setList([...list, ...list])}
          className="mc-icon-btn rounded-none p-1.5"
        >
          <Copy size={16} />
        </button>
        <div className="ml-auto flex items-center gap-1">
          <Dropdown
            ariaLabel="Gradient Type"
            value={resolvedType}
            onChange={(v) => {
              const type = v as GradientType;
              if (onGradientTypeChange) onGradientTypeChange(type);
              else update({ gradientType: type });
            }}
            options={GRADIENT_TYPES.map((type) => ({ value: type, label: type }))}
            className="h-9 w-28"
            align="right"
          />
          <ShowAllGradientsButton />
        </div>
      </div>

      <div className="relative flex flex-col" id={`colorlistcolors${id}`}>
        {list.map((color, i) => (
          <div
            key={`${i}/${list.length}`}
            className={cn(
              'relative flex items-center gap-1 py-1 transition-all duration-150',
              draggedIndex === i && 'scale-[0.98] opacity-40',
            )}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setDragOverIndex(i)}
            onDrop={() => {
              if (draggedIndex === null || draggedIndex === i) return;
              setList(moveItem(list, draggedIndex, i));
              setDraggedIndex(null);
              setDragOverIndex(null);
            }}
            onDragEnd={() => {
              setDraggedIndex(null);
              setDragOverIndex(null);
            }}
          >
            {dragOverIndex === i && draggedIndex !== null && (
              <div
                className={cn(
                  'pointer-events-none absolute right-0 left-0 z-10 h-0.5 rounded-full bg-[var(--accent)]',
                  draggedIndex >= i ? '-top-0.5' : '-bottom-0.5',
                )}
              />
            )}
            <label htmlFor={`colorlist${id}-color-${i + 1}-input`} className="w-7 text-center font-mono text-[13px] text-[#a6adc8]">
              {i + 1}
            </label>
            <button
              type="button"
              draggable
              onDragStart={() => setDraggedIndex(i)}
              aria-label={`Reorder color ${i + 1}`}
              className="cursor-grab rounded-md p-1 text-[#a6adc8] transition-colors hover:text-[#cdd6f4] active:cursor-grabbing"
            >
              <GripVertical size={16} />
            </button>
            <input
              id={`colorlist${id}-color-${i + 1}-input`}
              className={cn(
                'mc-input min-w-20 flex-1 rounded-md px-2.5 py-1.5 font-mono text-[13px]',
                getBrightness(hexToRGB(color.hex)) < 126 ? 'text-[#cdd6f4]' : 'text-black',
              )}
              style={{ background: color.hex }}
              value={color.hex}
              onFocus={() => setOpened(i)}
              onChange={(e) => {
                let hex = e.target.value.trim();
                if (!hex.startsWith('#')) hex = '#' + hex;
                const valid = shadow ? HEX_RE_SHADOW : HEX_RE_TEXT;
                if (!valid.test(hex)) return;
                const next = list.slice();
                next[i] = { ...next[i], hex };
                setList(sortColors(next));
              }}
            />
            <button
              type="button"
              aria-label={`Remove color ${i + 1}`}
              onClick={() => setList(list.slice(0, i).concat(list.slice(i + 1)))}
              className="mc-icon-btn danger rounded-md p-1.5"
            >
              <Trash size={16} />
            </button>
          </div>
        ))}

        {opened >= 0 && list[opened] && (
          <div
            ref={popupRef}
            id={`colorlist${id}-popup`}
            className="absolute top-full left-10 z-20 mt-1 flex flex-col gap-2 rounded-none border border-line bg-panel p-2 shadow-lg"
          >
            <input
              type="color"
              value={list[opened].hex.slice(0, 7)}
              onChange={(e) => {
                const next = list.slice();
                next[opened] = { ...next[opened], hex: e.target.value };
                setList(sortColors(next));
              }}
              className="h-10 w-full cursor-pointer rounded"
              aria-label="Pick color"
            />
            <label className="flex items-center justify-between gap-2 text-[13px] text-[#a6adc8]">
              Position (%)
              <input
                type="number"
                min={0}
                max={100}
                value={Math.round(list[opened].pos)}
                onChange={(e) => {
                  const pos = Math.min(100, Math.max(0, Number(e.target.value)));
                  const next = list.slice();
                  next[opened] = { ...next[opened], pos: Math.round(pos * 1000) / 1000 };
                  setList(sortColors(next));
                }}
                className="mc-input w-16 rounded px-1.5 py-1.5 text-[13px]"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
