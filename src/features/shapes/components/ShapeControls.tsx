import { ChevronLeft, ChevronRight, Circle, Compass, Crosshair, Globe, Maximize2 } from 'lucide-react';
import type { AnchorPreset, ShapeConfig, ShapeMode, ShapeStats } from '../types';
import { Panel } from '../../../shared/components/ui/Panel';
import { ShapeStatsCard } from './ShapeStats';
import { NumberInput } from './NumberInput';

interface ShapeControlsProps {
  config: ShapeConfig;
  onChange: (patch: Partial<ShapeConfig>) => void;
  stats: ShapeStats;
  totalLayers: number;
  isPickingAnchor: boolean;
  onTogglePickAnchor: () => void;
}

function DomeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 18h18" />
      <path d="M5 18c0-6.627 3.134-12 7-12s7 5.373 7 12" />
    </svg>
  );
}

const SHAPE_MODES: Array<{ mode: ShapeMode; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { mode: 'circle', label: 'Circle', icon: Circle },
  { mode: 'oval', label: 'Oval', icon: Maximize2 },
  { mode: 'sphere', label: 'Sphere', icon: Globe },
  { mode: 'dome', label: 'Dome', icon: DomeIcon },
];

const ANCHOR_PRESETS: Array<{ preset: AnchorPreset; label: string }> = [
  { preset: 'center', label: 'Center' },
  { preset: 'north', label: 'North (Top)' },
  { preset: 'south', label: 'South (Bottom)' },
  { preset: 'west', label: 'West (Left)' },
  { preset: 'east', label: 'East (Right)' },
];

export function ShapeControls({
  config,
  onChange,
  stats,
  totalLayers,
  isPickingAnchor,
  onTogglePickAnchor,
}: ShapeControlsProps) {
  const { mode, diameter, width, height, layer, filled, showGrid, ghostPreviousLayer, zoom, anchor } = config;

  const handleDimensionChange = (patch: Partial<ShapeConfig>) => {
    if (
      anchor.preset === 'custom' &&
      (patch.diameter !== undefined || patch.width !== undefined || patch.height !== undefined)
    ) {
      onChange({
        ...patch,
        anchor: {
          ...anchor,
          preset: 'center',
          customGridX: null,
          customGridY: null,
        },
      });
    } else {
      onChange(patch);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Panel title="Shape Mode" className="overflow-visible">
        <div className="grid grid-cols-4 gap-1.5 p-3">
          {SHAPE_MODES.map(({ mode: m, label, icon: Icon }) => {
            const isActive = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() =>
                  onChange({
                    mode: m,
                    layer: 0,
                    anchor: {
                      ...anchor,
                      layer: 0,
                      preset: 'center',
                      customGridX: null,
                      customGridY: null,
                    },
                  })
                }
                data-active={isActive}
                className="mc-btn flex flex-col items-center justify-center gap-1.5 rounded-none px-2 py-3 text-xs transition-colors hover:text-[#cdd6f4] data-[active='true']:border-[var(--accent)] data-[active='true']:text-[var(--accent)] data-[active='true']:shadow-[0_0_8px_color-mix(in_srgb,var(--accent)_25%,transparent)]"
              >
                <Icon className="h-4 w-4" />
                <span className="font-mc text-[12px]">{label}</span>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel title="Configuration">
        <div className="flex flex-col gap-4 p-4 text-xs text-[#a6adc8]">
          {mode === 'oval' ? (
            <>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#cdd6f4]">Width</span>
                  <NumberInput
                    min={1}
                    max={256}
                    value={width}
                    onChange={(v) => handleDimensionChange({ width: v })}
                    className="h-7 w-16"
                  />
                </div>
                <input
                  type="range"
                  min={1}
                  max={256}
                  value={width}
                  onChange={(e) => handleDimensionChange({ width: Number(e.target.value) })}
                  className="h-2 w-full cursor-pointer accent-[var(--accent)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#cdd6f4]">Height</span>
                  <NumberInput
                    min={1}
                    max={256}
                    value={height}
                    onChange={(v) => handleDimensionChange({ height: v })}
                    className="h-7 w-16"
                  />
                </div>
                <input
                  type="range"
                  min={1}
                  max={256}
                  value={height}
                  onChange={(e) => handleDimensionChange({ height: Number(e.target.value) })}
                  className="h-2 w-full cursor-pointer accent-[var(--accent)]"
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#cdd6f4]">Diameter</span>
                <NumberInput
                  min={1}
                  max={256}
                  value={diameter}
                  onChange={(v) => handleDimensionChange({ diameter: v })}
                  className="h-7 w-16"
                />
              </div>
              <input
                type="range"
                min={1}
                max={256}
                value={diameter}
                onChange={(e) => handleDimensionChange({ diameter: Number(e.target.value) })}
                className="h-2 w-full cursor-pointer accent-[var(--accent)]"
              />
            </div>
          )}

          {mode === 'sphere' || mode === 'dome' ? (
            <div className="flex flex-col gap-2 border-t border-line/60 pt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={layer <= 0}
                    onClick={() => handleDimensionChange({ layer: Math.max(0, layer - 1) })}
                    title="Previous layer (ArrowDown / [)"
                    className="mc-icon-btn h-6 w-6 rounded-none p-0 text-[#cdd6f4]"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <span className="font-medium text-[#cdd6f4]">
                    Layer {layer + 1} / {totalLayers}
                  </span>
                  <button
                    type="button"
                    disabled={layer >= totalLayers - 1}
                    onClick={() => handleDimensionChange({ layer: Math.min(totalLayers - 1, layer + 1) })}
                    title="Next layer (ArrowUp / ])"
                    className="mc-icon-btn h-6 w-6 rounded-none p-0 text-[#cdd6f4]"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
                <span className="font-mono text-[11px] text-[#6c7086]">Y={layer}</span>
              </div>
              <input
                type="range"
                min={0}
                max={Math.max(0, totalLayers - 1)}
                value={layer}
                onChange={(e) => handleDimensionChange({ layer: Number(e.target.value) })}
                className="h-2 w-full cursor-pointer accent-[var(--accent)]"
              />

              <label className="mt-1 flex cursor-pointer items-center justify-between text-xs">
                <span className="text-[#a6adc8]">Show Layer Below (Ghost)</span>
                <input
                  type="checkbox"
                  checked={ghostPreviousLayer}
                  onChange={(e) => onChange({ ghostPreviousLayer: e.target.checked })}
                />
              </label>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-line/60 pt-3">
            <label className="flex cursor-pointer items-center justify-between">
              <span className="text-[#cdd6f4]">Filled</span>
              <input
                type="checkbox"
                checked={filled}
                onChange={(e) => onChange({ filled: e.target.checked })}
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between">
              <span className="text-[#cdd6f4]">Grid Lines</span>
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => onChange({ showGrid: e.target.checked })}
              />
            </label>

            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[#cdd6f4]">Zoom</span>
                <span className="font-mono text-[11px] text-[#6c7086]">{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={5}
                step={0.05}
                value={zoom}
                onChange={(e) => onChange({ zoom: Number(e.target.value) })}
                className="h-2 w-full cursor-pointer accent-[var(--accent)]"
              />
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="World Anchor (F3)" icon={Compass}>
        <div className="flex flex-col gap-3 p-4 text-xs text-[#a6adc8]">
          <label className="flex cursor-pointer items-center justify-between">
            <span className="text-[#cdd6f4]">Show World Coordinates</span>
            <input
              type="checkbox"
              checked={anchor.enabled}
              onChange={(e) => onChange({ anchor: { ...anchor, enabled: e.target.checked } })}
            />
          </label>

          {anchor.enabled ? (
            <div className="flex flex-col gap-3 border-t border-line/60 pt-2">
              <span className="text-[11px] leading-snug text-[#6c7086]">
                Pick the reference block on the blueprint and enter its in-game F3 coordinate.
              </span>

              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-medium text-[#cdd6f4]">Anchor Block Location:</span>
                <div className="grid grid-cols-3 gap-1">
                  {ANCHOR_PRESETS.map(({ preset: p, label }) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => onChange({ anchor: { ...anchor, preset: p, layer } })}
                      data-active={anchor.preset === p}
                      className="mc-btn rounded-none px-1.5 py-1 text-[10px] text-[#a6adc8] hover:text-[#cdd6f4] data-[active='true']:border-[var(--accent)] data-[active='true']:text-[var(--accent)]"
                    >
                      {label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={onTogglePickAnchor}
                    data-active={isPickingAnchor || anchor.preset === 'custom'}
                    className="mc-btn flex items-center justify-center gap-1 rounded-none px-1.5 py-1 text-[10px] text-[#a6adc8] hover:text-[#cdd6f4] data-[active='true']:border-[var(--accent)] data-[active='true']:text-[var(--accent)]"
                  >
                    <Crosshair size={11} className={isPickingAnchor ? 'animate-spin text-[var(--accent)]' : ''} />
                    {isPickingAnchor ? 'Click Block...' : 'Pick on Canvas'}
                  </button>
                </div>

                {(mode === 'sphere' || mode === 'dome') ? (
                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    <span className="text-[#6c7086]">
                      Anchor sits on <strong className="text-[#cdd6f4]">Layer {anchor.layer + 1}</strong>
                    </span>
                    {anchor.layer !== layer ? (
                      <button
                        type="button"
                        onClick={() => onChange({ anchor: { ...anchor, layer } })}
                        className="mc-btn rounded-none px-1.5 py-0.5 text-[10px] text-[var(--accent)]"
                      >
                        Move to Layer {layer + 1}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                <span className="text-[11px] font-medium text-[#cdd6f4]">In-Game Coordinate for Anchor:</span>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] text-[#6c7086]">X</span>
                    <NumberInput
                      value={anchor.x}
                      allowNegative
                      onChange={(v) => onChange({ anchor: { ...anchor, x: v } })}
                      className="h-7 w-full"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] text-[#6c7086]">Y</span>
                    <NumberInput
                      value={anchor.y}
                      allowNegative
                      onChange={(v) => onChange({ anchor: { ...anchor, y: v } })}
                      className="h-7 w-full"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] text-[#6c7086]">Z</span>
                    <NumberInput
                      value={anchor.z}
                      allowNegative
                      onChange={(v) => onChange({ anchor: { ...anchor, z: v } })}
                      className="h-7 w-full"
                    />
                  </label>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </Panel>

      <ShapeStatsCard stats={stats} mode={mode} />
    </div>
  );
}
