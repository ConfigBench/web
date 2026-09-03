import { Flame, Link2, Sparkles, Trees } from 'lucide-react';
import type { DimensionId, MeasurementType } from '../types';
import { formatRadiusForDisplay, normalizeInputToRadius } from '../engine/calculator';

interface DimensionSliderProps {
  dimension: DimensionId;
  radius: number;
  measurement: MeasurementType;
  onChangeRadius: (newRadius: number) => void;
  overworldRadius?: number;
}

const DIMENSION_META: Record<
  DimensionId,
  {
    name: string;
    icon: typeof Trees;
    trackColor: string;
    accentColor: string;
    presets: number[];
  }
> = {
  overworld: {
    name: 'Overworld',
    icon: Trees,
    trackColor: 'accent-emerald-500',
    accentColor: '#10b981',
    presets: [5000, 10000, 20000, 50000],
  },
  nether: {
    name: 'Nether',
    icon: Flame,
    trackColor: 'accent-red-500',
    accentColor: '#ef4444',
    presets: [1250, 2500, 5000, 10000],
  },
  end: {
    name: 'The End',
    icon: Sparkles,
    trackColor: 'accent-purple-500',
    accentColor: '#a855f7',
    presets: [5000, 10000, 20000],
  },
};

export function DimensionSlider({
  dimension,
  radius,
  measurement,
  onChangeRadius,
  overworldRadius,
}: DimensionSliderProps) {
  const meta = DIMENSION_META[dimension];
  const Icon = meta.icon;
  const displayVal = formatRadiusForDisplay(radius, measurement);
  const maxLimit = measurement === 'diameter' ? 200000 : 100000;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const num = raw ? parseInt(raw, 10) : 0;
    onChangeRadius(normalizeInputToRadius(num, measurement));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value, 10) || 0;
    onChangeRadius(normalizeInputToRadius(num, measurement));
  };

  const handleSync8to1 = () => {
    if (overworldRadius !== undefined) {
      onChangeRadius(Math.max(16, Math.round(overworldRadius / 8)));
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-none border border-line bg-[#15151f] p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={16} style={{ color: meta.accentColor }} />
          <span className="font-mc text-sm text-text">{meta.name}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="text"
            inputMode="numeric"
            value={displayVal.toLocaleString('en-US')}
            onChange={handleInputChange}
            className="mc-input h-7 w-28 px-2 text-right font-mono text-xs font-semibold text-text"
            aria-label={`${meta.name} size in blocks`}
          />
          <span className="font-mono text-[11px] text-muted">blocks</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={maxLimit}
          step={dimension === 'nether' ? 250 : 500}
          value={displayVal}
          onChange={handleSliderChange}
          className={`h-2 w-full cursor-pointer appearance-none rounded-none bg-[#232333] ${meta.trackColor}`}
          aria-label={`${meta.name} range slider`}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-1 pt-1">
        <div className="flex items-center gap-1">
          {meta.presets.map((preset) => {
            const presetDisplay = formatRadiusForDisplay(preset, measurement);
            const isSelected = radius === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => onChangeRadius(preset)}
                className={`mc-btn px-2 py-0.5 font-mono text-[10px] ${
                  isSelected ? 'border-[var(--accent)] text-[var(--accent)]' : 'text-muted'
                }`}
              >
                {presetDisplay >= 1000 ? `${presetDisplay / 1000}k` : presetDisplay}
              </button>
            );
          })}
        </div>

        {dimension === 'nether' && overworldRadius !== undefined && (
          <button
            type="button"
            onClick={handleSync8to1}
            title="Sync Nether radius to Overworld / 8"
            className="mc-btn flex items-center gap-1 px-2 py-0.5 text-[10px] text-muted hover:text-text"
          >
            <Link2 size={10} />
            <span>Sync 8:1 Overworld</span>
          </button>
        )}
      </div>
    </div>
  );
}
