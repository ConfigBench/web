import { Circle, Database, Square } from 'lucide-react';
import type { WorldSizeConfig } from '../types';
import { MINECRAFT_VERSIONS, getVersionInfo } from '../engine/versions';

interface WorldSizeOptionsProps {
  config: WorldSizeConfig;
  onChange: (patch: Partial<WorldSizeConfig>) => void;
}

const WORLD_PRESETS = [
  { name: 'Small (5k)', radii: { overworld: 5000, nether: 1000, end: 5000 } },
  { name: 'Standard (10k)', radii: { overworld: 10000, nether: 1250, end: 10000 } },
  { name: 'Large SMP (20k)', radii: { overworld: 20000, nether: 2500, end: 15000 } },
  { name: 'Massive (50k)', radii: { overworld: 50000, nether: 6250, end: 25000 } },
];

export function WorldSizeOptions({ config, onChange }: WorldSizeOptionsProps) {
  const currentVersionNum = Number.parseFloat(config.version);
  const supportsPoi = currentVersionNum >= 1.14;

  return (
    <div className="flex flex-col gap-4 rounded-none border border-line bg-[#15151f] p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="mc-version-select" className="text-[11px] uppercase tracking-wider text-muted">
            Minecraft Version
          </label>
          <select
            id="mc-version-select"
            value={config.version}
            onChange={(e) => onChange({ version: e.target.value })}
            className="mc-select h-9 px-2 font-mono text-xs text-text"
          >
            {MINECRAFT_VERSIONS.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1 font-mono text-[10px] text-muted">
            <span>Height:</span>
            <span className="font-semibold text-text">
              {getVersionInfo(config.version).height} blocks
            </span>
            <span>
              ({getVersionInfo(config.version).height === 384
                ? 'Y: -64 to 320'
                : getVersionInfo(config.version).height === 256
                  ? 'Y: 0 to 256'
                  : 'Y: 0 to 128'})
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted">Measurement</span>
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => onChange({ measurement: 'radius' })}
              className={`mc-btn flex h-9 items-center justify-center gap-1 text-xs ${
                config.measurement === 'radius'
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'text-muted'
              }`}
            >
              Radius
            </button>
            <button
              type="button"
              onClick={() => onChange({ measurement: 'diameter' })}
              className={`mc-btn flex h-9 items-center justify-center gap-1 text-xs ${
                config.measurement === 'diameter'
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'text-muted'
              }`}
            >
              Diameter
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted">Shape</span>
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => onChange({ shape: 'square' })}
              className={`mc-btn flex h-9 items-center justify-center gap-1.5 text-xs ${
                config.shape === 'square'
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'text-muted'
              }`}
            >
              <Square size={13} />
              Square
            </button>
            <button
              type="button"
              onClick={() => onChange({ shape: 'circle' })}
              className={`mc-btn flex h-9 items-center justify-center gap-1.5 text-xs ${
                config.shape === 'circle'
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'text-muted'
              }`}
            >
              <Circle size={13} />
              Circle
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] text-muted">Presets:</span>
          {WORLD_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => onChange({ radii: p.radii })}
              className="mc-btn px-2 py-1 text-[11px] text-muted hover:text-text"
            >
              {p.name}
            </button>
          ))}
        </div>

        {supportsPoi && (
          <label className="flex cursor-pointer items-center gap-2 text-[11px] text-muted hover:text-text">
            <input
              type="checkbox"
              checked={config.includeEntitiesAndPoi}
              onChange={(e) => onChange({ includeEntitiesAndPoi: e.target.checked })}
              className="rounded-none border-line accent-[var(--accent)]"
            />
            <span className="flex items-center gap-1">
              <Database size={12} />
              Include Entities & POI (+8%)
            </span>
          </label>
        )}
      </div>
    </div>
  );
}
