import { useCallback, useContext } from 'react';
import { Bold, Eraser, Italic, Strikethrough, Underline, Wand2 } from 'lucide-react';
import { FONT_LABELS } from '../engine/fonts';
import { FORMAT_KEYS, type FormatKey, type FormatSegment, type Formatting } from '../engine/defaults';
import { useRgbStore, SelectionContext } from './rgbContexts';
import Dropdown from '../../../shared/components/ui/Dropdown';

function getIntervalsInRange(
  start: number,
  end: number,
  formattingList: FormatSegment[],
  baseFormatting: Formatting,
): Formatting[] {
  const boundaries = new Set<number>([start, end]);
  for (const s of formattingList) {
    boundaries.add(s.start);
    boundaries.add(s.end);
  }
  const points = Array.from(boundaries).sort((a, b) => a - b);
  const intervals: Formatting[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (a >= b || b <= start || a >= end) continue;
    const covering = formattingList.find((s) => s.start <= a && s.end >= b);
    intervals.push(covering ? { ...baseFormatting, ...covering } : { ...baseFormatting });
  }
  return intervals;
}

function computeSelectionFormatting(
  selection: { start: number; end: number } | undefined,
  textLength: number,
  formattingList: FormatSegment[],
  baseFormatting: Formatting,
): Formatting {
  const isEntireSelected = selection && selection.start === 0 && selection.end === textLength;
  if (!selection || selection.start === selection.end || isEntireSelected) return baseFormatting;

  const intervals = getIntervalsInRange(selection.start, selection.end, formattingList, baseFormatting);
  const result: Formatting = {};
  for (const k of FORMAT_KEYS) {
    result[k] = intervals.length === 0 ? baseFormatting[k] : intervals.every((iv) => iv[k]);
  }
  const firstFont = intervals[0]?.font;
  result.font = intervals.every((iv) => iv.font === firstFont) ? firstFont : undefined;
  return result;
}

function mergeSegments(segments: FormatSegment[]): FormatSegment[] {
  const merged: FormatSegment[] = [];
  for (const seg of [...segments].sort((a, b) => a.start - b.start)) {
    const last = merged[merged.length - 1];
    if (
      last &&
      last.end === seg.start &&
      FORMAT_KEYS.every((k) => last[k] === seg[k]) &&
      last.font === seg.font
    ) {
      last.end = seg.end;
    } else {
      merged.push({ ...seg });
    }
  }
  return merged;
}

function pruneAndMerge(segments: FormatSegment[], base: Formatting): FormatSegment[] {
  const cleaned = segments
    .map((fmt) => {
      const next: FormatSegment = { start: fmt.start, end: fmt.end };
      for (const k of FORMAT_KEYS) {
        if (fmt[k] !== undefined && fmt[k] !== base[k]) next[k] = fmt[k];
      }
      if (fmt.font !== undefined && fmt.font !== base.font) next.font = fmt.font;
      return next;
    })
    .filter((fmt) => FORMAT_KEYS.some((k) => fmt[k] !== undefined) || fmt.font !== undefined);
  return mergeSegments(cleaned);
}

const BUTTONS: Array<{ key: FormatKey; label: string; icon: typeof Bold; code: string }> = [
  { key: 'bold', label: 'Bold', icon: Bold, code: 'l' },
  { key: 'italic', label: 'Italic', icon: Italic, code: 'o' },
  { key: 'underline', label: 'Underline', icon: Underline, code: 'n' },
  { key: 'strikethrough', label: 'Strikethrough', icon: Strikethrough, code: 'm' },
  { key: 'obfuscate', label: 'Obfuscate', icon: Wand2, code: 'k' },
];

export default function Formatting() {
  const { store, update } = useRgbStore();
  const selection = useContext(SelectionContext);

  const textLength = Array.from(store.text).length;
  const formatting = computeSelectionFormatting(selection, textLength, store.formatting, store.baseFormatting);

  const updateSelectionFormatting = useCallback(
    (transform: (fmt: Formatting) => void, clearAll = false) => {
      const len = Array.from(store.text).length;
      const entire = selection && selection.start === 0 && selection.end === len;
      if (!selection || selection.start === selection.end || entire) {
        const oldBase = { ...store.baseFormatting };
        const nextBase = { ...store.baseFormatting };
        transform(nextBase);
        const changedKeys: string[] = [];
        for (const k of FORMAT_KEYS) if (nextBase[k] !== oldBase[k]) changedKeys.push(k);
        if (nextBase.font !== oldBase.font) changedKeys.push('font');

        update({
          baseFormatting: nextBase,
          formatting:
            changedKeys.length > 0
              ? pruneAndMerge(
                  store.formatting.map((seg) => {
                    const next = { ...seg };
                    for (const key of changedKeys) delete next[key as FormatKey];
                    return next;
                  }),
                  nextBase,
                )
              : store.formatting,
        });
        if (clearAll) update({ formatting: [] });
        return;
      }

      const { start, end } = selection;
      const boundaries = new Set<number>([start, end]);
      for (const s of store.formatting) {
        boundaries.add(s.start);
        boundaries.add(s.end);
      }
      const points = Array.from(boundaries).sort((a, b) => a - b);
      const newSegments: FormatSegment[] = [];
      for (let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];
        if (a >= b) continue;
        const covering = store.formatting.find((s) => s.start <= a && s.end >= b);
        const fmt = covering ? { ...store.baseFormatting, ...covering } : { ...store.baseFormatting };
        if (a < end && b > start) transform(fmt);
        const isDefault =
          FORMAT_KEYS.every((k) => fmt[k] === store.baseFormatting[k]) && fmt.font === store.baseFormatting.font;
        if (!isDefault) newSegments.push({ ...fmt, start: a, end: b });
      }
      update({ formatting: mergeSegments(newSegments) });
    },
    [selection, store, update],
  );

  const toggleFlag = (flag: FormatKey) => {
    const current = computeSelectionFormatting(selection, textLength, store.formatting, store.baseFormatting);
    const target = !current[flag];
    updateSelectionFormatting((fmt) => {
      fmt[flag] = target;
    });
  };

  const setFont = (value: string) => {
    updateSelectionFormatting((fmt) => {
      fmt.font = value === 'default' ? undefined : value;
    });
  };

  const clearFormatting = () => {
    updateSelectionFormatting((fmt) => {
      for (const k of FORMAT_KEYS) fmt[k] = false;
      fmt.font = undefined;
    }, true);
  };

  const codeLabel = (key: FormatKey, code: string) => {
    if (store.colorFormat.char) return ` - ${store.colorFormat.char}${code}`;
    const wrapper = store.colorFormat[key];
    return wrapper ? ` - ${wrapper.replace('$t', '')}` : '';
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5" id="formatting">
      <Dropdown
        ariaLabel="Font"
        value={formatting.font || 'default'}
        onChange={setFont}
        options={Object.entries(FONT_LABELS).map(([key, label]) => ({ value: key, label }))}
        className="h-9 w-40"
      />
      {BUTTONS.map(({ key, label, icon: Icon, code }) => (
        <button
          key={key}
          type="button"
          aria-pressed={!!formatting[key]}
          title={`${label}${codeLabel(key, code)}`}
          onClick={() => toggleFlag(key)}
          data-active={!!formatting[key]}
          className="mc-icon-btn h-9 w-9 rounded-none p-0"
        >
          <Icon size={16} />
        </button>
      ))}
      <button
        type="button"
        id="clear"
        title="Clear Formatting"
        onClick={clearFormatting}
        className="mc-icon-btn h-9 w-9 rounded-none p-0"
      >
        <Eraser size={16} />
      </button>
    </div>
  );
}
