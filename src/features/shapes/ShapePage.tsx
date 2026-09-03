import { useEffect, useMemo, useState } from 'react';
import { Shapes } from 'lucide-react';
import type { ShapeConfig, ShapeMode } from './types';
import { calculateStats, generateShapeGrid, getTotalLayers } from './engine/rasterize';
import { ShapeCanvas } from './components/ShapeCanvas';
import { ShapeControls } from './components/ShapeControls';
import { Panel } from '../../shared/components/ui/Panel';

const INITIAL_CONFIG: ShapeConfig = {
  mode: 'circle',
  diameter: 60,
  width: 20,
  height: 20,
  layer: 0,
  filled: false,
  showGrid: true,
  ghostPreviousLayer: false,
  zoom: 1,
  anchor: {
    enabled: false,
    x: 0,
    y: 64,
    z: 0,
    layer: 0,
    preset: 'center',
    customGridX: null,
    customGridY: null,
  },
};

function parseInitialConfig(): ShapeConfig {
  let fromUrl: Partial<ShapeConfig> = {};
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.toString().length > 0) {
      const mode = params.get('mode') as ShapeMode | null;
      const d = Number(params.get('d'));
      const w = Number(params.get('w'));
      const h = Number(params.get('h'));
      const layer = Number(params.get('layer'));
      const filled = params.get('filled') === 'true';
      const ax = params.get('ax');
      const ay = params.get('ay');
      const az = params.get('az');
      const al = Number(params.get('al'));

      fromUrl = {
        ...(mode && ['circle', 'oval', 'sphere', 'dome'].includes(mode) ? { mode } : {}),
        ...(d > 0 ? { diameter: d } : {}),
        ...(w > 0 ? { width: w } : {}),
        ...(h > 0 ? { height: h } : {}),
        ...(layer >= 0 ? { layer } : {}),
        ...(params.has('filled') ? { filled } : {}),
        ...(ax !== null || ay !== null || az !== null
          ? {
              anchor: {
                enabled: true,
                x: Number(ax) || 0,
                y: Number(ay) || 64,
                z: Number(az) || 0,
                layer: al >= 0 ? al : 0,
                preset: 'center',
                customGridX: null,
                customGridY: null,
              },
            }
          : {}),
      };
    }
  }

  let saved: Partial<ShapeConfig> = {};
  try {
    const raw = localStorage.getItem('configbench.shapes');
    if (raw) saved = JSON.parse(raw) as Partial<ShapeConfig>;
  } catch (e) {
    void e;
  }

  return { ...INITIAL_CONFIG, ...saved, ...fromUrl };
}

export function ShapePage() {
  const [config, setConfig] = useState<ShapeConfig>(parseInitialConfig);
  const [isPickingAnchor, setIsPickingAnchor] = useState(false);

  const handlePickAnchor = (gx: number, gy: number) => {
    setIsPickingAnchor(false);
    updateConfig({
      anchor: {
        ...config.anchor,
        enabled: true,
        layer: config.layer,
        preset: 'custom',
        customGridX: gx,
        customGridY: gy,
      },
    });
  };

  const [placedMap, setPlacedMap] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem('configbench.placed_shapes');
      if (saved) return JSON.parse(saved) as Record<string, string[]>;
    } catch (e) {
      void e;
    }
    return {};
  });

  const updateConfig = (patch: Partial<ShapeConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem('configbench.shapes', JSON.stringify(next));
      } catch (e) {
        void e;
      }
      return next;
    });
  };

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('mode', config.mode);
    if (config.mode === 'oval') {
      params.set('w', String(config.width));
      params.set('h', String(config.height));
    } else {
      params.set('d', String(config.diameter));
      if (config.mode === 'sphere' || config.mode === 'dome') {
        params.set('layer', String(config.layer));
      }
    }
    if (config.filled) params.set('filled', 'true');
    if (config.anchor.enabled) {
      params.set('ax', String(config.anchor.x));
      params.set('ay', String(config.anchor.y));
      params.set('az', String(config.anchor.z));
      if (config.mode === 'sphere' || config.mode === 'dome') {
        params.set('al', String(config.anchor.layer));
      }
    }

    const nextSearch = params.toString() ? `?${params.toString()}` : '';
    if (window.location.search !== nextSearch) {
      window.history.replaceState(null, '', `${window.location.pathname}${nextSearch}`);
    }
  }, [config]);

  const totalLayers = useMemo(() => getTotalLayers(config.mode, config.diameter), [config.mode, config.diameter]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (config.mode === 'sphere' || config.mode === 'dome') {
        if (e.key === 'ArrowUp' || e.key === ']') {
          e.preventDefault();
          updateConfig({ layer: Math.min(totalLayers - 1, config.layer + 1) });
        } else if (e.key === 'ArrowDown' || e.key === '[') {
          e.preventDefault();
          updateConfig({ layer: Math.max(0, config.layer - 1) });
        }
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [config.mode, config.layer, totalLayers]);

  const grid = useMemo(() => generateShapeGrid(config), [config]);

  const ghostGrid = useMemo(() => {
    if (!config.ghostPreviousLayer || (config.mode !== 'sphere' && config.mode !== 'dome') || config.layer <= 0) {
      return null;
    }
    return generateShapeGrid({ ...config, layer: config.layer - 1 });
  }, [config]);

  const stats = useMemo(() => calculateStats(config, grid), [config, grid]);

  const progressKey = useMemo(() => {
    const dimKey = config.mode === 'oval' ? `${config.width}x${config.height}` : `${config.diameter}`;
    const fillKey = config.filled ? 'f' : 'o';
    const layerKey = config.mode === 'sphere' || config.mode === 'dome' ? `:L${config.layer}` : '';
    return `${config.mode}:${dimKey}:${fillKey}${layerKey}`;
  }, [config.mode, config.width, config.height, config.diameter, config.filled, config.layer]);

  const placed = useMemo(() => new Set(placedMap[progressKey] ?? []), [placedMap, progressKey]);

  const togglePlaced = (coord: string) => {
    setPlacedMap((prev) => {
      const list = prev[progressKey] ? [...prev[progressKey]] : [];
      const idx = list.indexOf(coord);
      if (idx !== -1) list.splice(idx, 1);
      else list.push(coord);
      const next = { ...prev, [progressKey]: list };
      try {
        localStorage.setItem('configbench.placed_shapes', JSON.stringify(next));
      } catch (e) {
        void e;
      }
      return next;
    });
  };

  const clearPlaced = () => {
    setPlacedMap((prev) => {
      const next = { ...prev };
      delete next[progressKey];
      try {
        localStorage.setItem('configbench.placed_shapes', JSON.stringify(next));
      } catch (e) {
        void e;
      }
      return next;
    });
  };

  const title =
    config.mode === 'oval'
      ? `Oval (${config.width} × ${config.height})`
      : config.mode === 'sphere'
        ? `Sphere (d=${config.diameter}, Layer ${config.layer + 1}/${totalLayers})`
        : config.mode === 'dome'
          ? `Dome (d=${config.diameter}, Layer ${config.layer + 1}/${totalLayers})`
          : `Circle (d=${config.diameter})`;

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-3 lg:flex-row">
      <div className="mc-grid flex min-h-[560px] min-w-0 flex-1 flex-col lg:min-h-0">
        <Panel title={title} icon={Shapes} className="h-full overflow-hidden">
          <ShapeCanvas
            grid={grid}
            ghostGrid={ghostGrid}
            mode={config.mode}
            diameter={config.diameter}
            width={config.width}
            height={config.height}
            layer={config.layer}
            showGrid={config.showGrid}
            zoom={config.zoom}
            onZoomChange={(zoom) => updateConfig({ zoom })}
            placed={placed}
            onTogglePlaced={togglePlaced}
            onClearPlaced={clearPlaced}
            anchor={config.anchor}
            isPickingAnchor={isPickingAnchor}
            onPickAnchor={handlePickAnchor}
          />
        </Panel>
      </div>

      <div className="w-full shrink-0 overflow-y-auto lg:max-h-full lg:w-80 xl:w-96">
        <ShapeControls
          config={config}
          onChange={updateConfig}
          stats={stats}
          totalLayers={totalLayers}
          isPickingAnchor={isPickingAnchor}
          onTogglePickAnchor={() => setIsPickingAnchor((v) => !v)}
        />
      </div>
    </div>
  );
}
