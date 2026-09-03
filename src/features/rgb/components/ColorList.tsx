import { useState } from 'react';
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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const list = colors ?? (shadow ? (store.shadowColors ?? []) : store.colors);
  const resolvedTextLength = textLength ?? Array.from(store.text).length;
  const resolvedType = gradientType ?? store.gradientType;

  const setList = (next: ColorStop[]) => {
    if (onColorsChange) onColorsChange(next);
    else if (shadow) update({ shadowColors: next });
    else update({ colors: next });
  };

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

      <div className="relative flex flex-col gap-1.5" id={`colorlistcolors${id}`}>
        {list.map((color, i) => (
          <div
            key={`${i}/${list.length}`}
            className={cn(
              'relative flex items-center gap-1.5 rounded border border-transparent px-1 py-1 transition-all duration-150 hover:border-line/40',
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
            <span className="w-5 text-center font-mono text-xs text-[#a6adc8]">
              {i + 1}
            </span>
            <button
              type="button"
              draggable
              onDragStart={() => setDraggedIndex(i)}
              aria-label={`Reorder color ${i + 1}`}
              className="cursor-grab rounded p-1 text-[#a6adc8] transition-colors hover:text-[#cdd6f4] active:cursor-grabbing"
            >
              <GripVertical size={16} />
            </button>
            <label
              title="Click to open color spectrum picker"
              className="group relative flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded border border-line bg-[#11111b] overflow-hidden shadow-sm transition-all hover:scale-105 hover:border-[var(--accent)]"
            >
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #777 25%, transparent 25%), linear-gradient(-45deg, #777 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #777 75%), linear-gradient(-45deg, transparent 75%, #777 75%)',
                  backgroundSize: '8px 8px',
                  backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                }}
              />
              <div
                className="absolute inset-0 rounded-[3px] transition-colors"
                style={{ backgroundColor: color.hex.slice(0, 7) }}
              />
              <Palette
                size={12}
                className={cn(
                  'pointer-events-none z-10 opacity-0 transition-opacity group-hover:opacity-90',
                  getBrightness(hexToRGB(color.hex.slice(0, 7))) < 126 ? 'text-white' : 'text-black',
                )}
              />
              <input
                type="color"
                value={color.hex.slice(0, 7)}
                onChange={(e) => {
                  const base = e.target.value;
                  const alpha = shadow && color.hex.length === 9 ? color.hex.slice(7) : '';
                  const next = list.slice();
                  next[i] = { ...next[i], hex: base + alpha };
                  setList(sortColors(next));
                }}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label={`Pick color ${i + 1}`}
              />
            </label>
            <input
              id={`colorlist${id}-color-${i + 1}-input`}
              type="text"
              spellCheck={false}
              value={color.hex}
              onChange={(e) => {
                let hex = e.target.value.trim();
                if (!hex.startsWith('#')) hex = '#' + hex;
                const valid = shadow ? HEX_RE_SHADOW : HEX_RE_TEXT;
                if (!valid.test(hex)) return;
                const next = list.slice();
                next[i] = { ...next[i], hex };
                setList(sortColors(next));
              }}
              className="mc-input min-w-0 flex-1 rounded px-2.5 py-1.5 font-mono text-[13px] text-[#cdd6f4]"
              placeholder="#ffffff"
            />
            <div
              className="flex items-center gap-1 shrink-0"
              title={store.disperse ? 'Position auto-spaced (toggle Disperse in toolbar to customize)' : 'Stop position percentage (0-100%)'}
            >
              <input
                type="number"
                min={0}
                max={100}
                value={Math.round(color.pos)}
                onChange={(e) => {
                  const pos = Math.min(100, Math.max(0, Number(e.target.value)));
                  const next = list.slice();
                  next[i] = { ...next[i], pos: Math.round(pos * 1000) / 1000 };
                  if (store.disperse) update({ disperse: false });
                  setList(sortColors(next));
                }}
                className={cn(
                  'mc-input w-12 rounded px-1 py-1.5 text-center font-mono text-[12px]',
                  store.disperse ? 'opacity-60 text-[#a6adc8]' : 'text-[#cdd6f4]',
                )}
                aria-label={`Position of color ${i + 1}`}
              />
              <span className="text-[11px] font-mono text-[#a6adc8] select-none">%</span>
            </div>
            <button
              type="button"
              aria-label={`Remove color ${i + 1}`}
              disabled={list.length <= 1}
              onClick={() => setList(list.slice(0, i).concat(list.slice(i + 1)))}
              className="mc-icon-btn danger rounded p-1.5 disabled:opacity-30 disabled:pointer-events-none"
            >
              <Trash size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
