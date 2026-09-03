import { useEffect, useMemo, useState } from 'react';
import { Globe } from 'lucide-react';
import type { DimensionId, MeasurementType, ShapeType, WorldSizeConfig } from './types';
import { calculateWorldSize } from './engine/calculator';
import { DEFAULT_VERSION_ID } from './engine/versions';
import { Panel } from '../../shared/components/ui/Panel';
import { WorldSizeOptions } from './components/WorldSizeOptions';
import { DimensionSlider } from './components/DimensionSlider';
import { DimensionCard } from './components/DimensionCard';
import { TotalSummaryCard } from './components/TotalSummaryCard';

const INITIAL_CONFIG: WorldSizeConfig = {
  version: DEFAULT_VERSION_ID,
  measurement: 'radius',
  shape: 'square',
  includeEntitiesAndPoi: false,
  radii: {
    overworld: 10000,
    nether: 1250,
    end: 10000,
  },
};

function parseInitialConfig(): WorldSizeConfig {
  let fromUrl: Partial<WorldSizeConfig> = {};
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.toString().length > 0) {
      const v = params.get('v');
      const m = params.get('m') as MeasurementType | null;
      const s = params.get('s') as ShapeType | null;
      const ow = Number(params.get('ow'));
      const ne = Number(params.get('ne'));
      const end = Number(params.get('end'));
      const poi = params.get('poi') === 'true';

      const customRadii: Partial<Record<DimensionId, number>> = {};
      if (ow > 0) customRadii.overworld = ow;
      if (ne > 0) customRadii.nether = ne;
      if (end > 0) customRadii.end = end;

      fromUrl = {
        ...(v ? { version: v } : {}),
        ...(m === 'radius' || m === 'diameter' ? { measurement: m } : {}),
        ...(s === 'square' || s === 'circle' ? { shape: s } : {}),
        ...(params.has('poi') ? { includeEntitiesAndPoi: poi } : {}),
        ...(Object.keys(customRadii).length > 0
          ? { radii: { ...INITIAL_CONFIG.radii, ...customRadii } }
          : {}),
      };
    }
  }

  let saved: Partial<WorldSizeConfig> = {};
  try {
    const raw = localStorage.getItem('configbench.worldsize');
    if (raw) saved = JSON.parse(raw) as Partial<WorldSizeConfig>;
  } catch (e) {
    void e;
  }

  return { ...INITIAL_CONFIG, ...saved, ...fromUrl };
}

export function WorldSizePage() {
  const [config, setConfig] = useState<WorldSizeConfig>(parseInitialConfig);

  const updateConfig = (patch: Partial<WorldSizeConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem('configbench.worldsize', JSON.stringify(next));
      } catch (e) {
        void e;
      }
      return next;
    });
  };

  const updateRadius = (dim: DimensionId, newRadius: number) => {
    setConfig((prev) => {
      const next: WorldSizeConfig = {
        ...prev,
        radii: {
          ...prev.radii,
          [dim]: newRadius,
        },
      };
      try {
        localStorage.setItem('configbench.worldsize', JSON.stringify(next));
      } catch (e) {
        void e;
      }
      return next;
    });
  };

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('v', config.version);
    params.set('m', config.measurement);
    params.set('s', config.shape);
    params.set('ow', String(config.radii.overworld));
    params.set('ne', String(config.radii.nether));
    params.set('end', String(config.radii.end));
    if (config.includeEntitiesAndPoi) {
      params.set('poi', 'true');
    }

    const nextSearch = `?${params.toString()}`;
    if (window.location.search !== nextSearch) {
      window.history.replaceState(null, '', `${window.location.pathname}${nextSearch}`);
    }
  }, [config]);

  const result = useMemo(() => calculateWorldSize(config), [config]);

  return (
    <div className="flex w-full flex-col gap-4 pb-4">
      <Panel
        title="World Size Calculator"
        icon={Globe}
        className="w-full shrink-0"
      >
        <div className="flex flex-col gap-4 p-4">
          <p className="text-xs text-muted">
            Calculate the exact disk footprint, chunk counts, and region file breakdown of your
            Minecraft world before pregeneration.
          </p>

          <WorldSizeOptions config={config} onChange={updateConfig} />
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="flex flex-col gap-3 lg:col-span-5">
          <div className="flex items-center justify-between px-1">
            <span className="font-mc text-xs uppercase tracking-wider text-muted">
              Dimension Boundaries
            </span>
            <span className="font-mono text-[11px] text-muted">
              Measured in {config.measurement}
            </span>
          </div>

          <DimensionSlider
            dimension="overworld"
            radius={config.radii.overworld}
            measurement={config.measurement}
            onChangeRadius={(val) => updateRadius('overworld', val)}
          />

          <DimensionSlider
            dimension="nether"
            radius={config.radii.nether}
            measurement={config.measurement}
            onChangeRadius={(val) => updateRadius('nether', val)}
            overworldRadius={config.radii.overworld}
          />

          <DimensionSlider
            dimension="end"
            radius={config.radii.end}
            measurement={config.measurement}
            onChangeRadius={(val) => updateRadius('end', val)}
          />
        </div>

        <div className="flex flex-col gap-4 lg:col-span-7">
          <TotalSummaryCard result={result} shape={config.shape} />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <DimensionCard
              stats={result.dimensions.overworld}
              shape={config.shape}
              measurement={config.measurement}
            />
            <DimensionCard
              stats={result.dimensions.nether}
              shape={config.shape}
              measurement={config.measurement}
            />
            <DimensionCard
              stats={result.dimensions.end}
              shape={config.shape}
              measurement={config.measurement}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
