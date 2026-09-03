import { useState, type FormEvent } from 'react';
import { History, Layers, Search, User, X } from 'lucide-react';
import type { SkinFormat, SkinLayerFilter } from '../types';
import { isValidMinecraftIdentifier } from '../engine/urlBuilder';
import { cn } from '../../../shared/lib/cn';

interface SkinInspectorFormProps {
  target: string;
  format: SkinFormat;
  layerFilter: SkinLayerFilter;
  history: string[];
  onSearch: (target: string) => void;
  onFormatChange: (format: SkinFormat) => void;
  onLayerFilterChange: (filter: SkinLayerFilter) => void;
  onClearHistory: () => void;
}

export function SkinInspectorForm({
  target,
  format,
  layerFilter,
  history,
  onSearch,
  onFormatChange,
  onLayerFilterChange,
  onClearHistory,
}: SkinInspectorFormProps) {
  const [inputVal, setInputVal] = useState(target);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const clean = inputVal.trim();
    if (!clean) return;
    onSearch(clean);
  };

  const isValid = isValidMinecraftIdentifier(inputVal);

  return (
    <div className="flex flex-col gap-3 rounded-none border border-line bg-[#15151f] p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#6c7086]">
            <User size={15} />
          </div>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Enter Minecraft username or UUID (e.g. Notch)..."
            className="mc-input h-10 w-full pl-9 pr-8 font-mono text-xs text-[#cdd6f4] placeholder:text-[#6c7086]"
          />
          {inputVal && (
            <button
              type="button"
              onClick={() => setInputVal('')}
              className="absolute inset-y-0 right-2.5 flex items-center text-[#6c7086] hover:text-[#cdd6f4]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={!inputVal.trim() || !isValid}
          className="mc-btn flex h-10 items-center justify-center gap-2 px-5 text-xs font-semibold text-[var(--accent)] disabled:opacity-50"
        >
          <Search size={14} />
          <span>Inspect Skin</span>
        </button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/50 pt-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="mr-1 flex items-center gap-1 text-[11px] uppercase text-[#6c7086]">
              <Layers size={11} />
              Layers:
            </span>
            {(['all', 'overlay', 'flat'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => onLayerFilterChange(filter)}
                data-active={layerFilter === filter}
                className={cn(
                  'mc-btn px-2 py-1 text-[11px] capitalize text-[#a6adc8] hover:text-[#cdd6f4]',
                  layerFilter === filter && '!border-[var(--accent)] !text-[var(--accent)]',
                )}
              >
                {filter === 'all' ? 'All Variations' : filter === 'overlay' ? '2nd Layer Only' : 'Flat Only'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 border-l border-line pl-2">
            <span className="mr-1 text-[11px] uppercase text-[#6c7086]">Format:</span>
            {(['png', 'svg'] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => onFormatChange(fmt)}
                data-active={format === fmt}
                className={cn(
                  'mc-btn px-2 py-1 font-mono text-[10px] uppercase text-[#a6adc8] hover:text-[#cdd6f4]',
                  format === fmt && '!border-[var(--accent)] !text-[var(--accent)]',
                )}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="flex items-center gap-1 text-[11px] text-[#6c7086]">
              <History size={11} />
              Recent:
            </span>
            {history.slice(0, 5).map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setInputVal(name);
                  onSearch(name);
                }}
                className="mc-btn px-1.5 py-0.5 font-mono text-[10px] text-[#a6adc8] hover:text-[#cdd6f4]"
              >
                {name}
              </button>
            ))}
            <button
              type="button"
              onClick={onClearHistory}
              title="Clear history"
              className="text-[10px] text-[#f38ba8] hover:underline ml-1"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
