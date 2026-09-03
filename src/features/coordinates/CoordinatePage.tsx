import { useEffect, useMemo, useRef, useState } from 'react';
import { Compass, RotateCcw } from 'lucide-react';
import type { BlockCoords, DimensionType } from './types';
import {
  buildDimensionCoordinateSet,
  calculatePortalLinking,
  chunkToBlock,
  netherToOverworld,
  overworldToNether,
  regionToBlock,
} from './engine/converter';
import { Panel } from '../../shared/components/ui/Panel';
import { DimensionCoordinatePanel } from './components/DimensionCoordinatePanel';
import { PortalLinkingCard } from './components/PortalLinkingCard';
import { CoordToasts, type ToastItem } from './components/CoordToasts';

interface SavedState {
  overworld: BlockCoords;
  nether: BlockCoords;
}

const DEFAULT_OW: BlockCoords = { x: 0, y: 64, z: 0 };
const DEFAULT_NE: BlockCoords = { x: 0, y: 64, z: 0 };

function parseInitialCoordinates(): SavedState {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.toString().length > 0) {
      const dim = params.get('dim') as DimensionType | null;
      const x = Number(params.get('x')) || 0;
      const y = Number(params.get('y')) || 64;
      const z = Number(params.get('z')) || 0;

      if (dim === 'nether') {
        const ne = { x, y, z };
        return { overworld: netherToOverworld(ne), nether: ne };
      }
      const ow = { x, y, z };
      return { overworld: ow, nether: overworldToNether(ow) };
    }

    try {
      const raw = localStorage.getItem('configbench.coordinates');
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SavedState>;
        if (parsed.overworld && parsed.nether) {
          return {
            overworld: parsed.overworld,
            nether: parsed.nether,
          };
        }
      }
    } catch (e) {
      void e;
    }
  }

  return { overworld: DEFAULT_OW, nether: DEFAULT_NE };
}

export function CoordinatePage() {
  const [coords, setCoords] = useState<SavedState>(parseInitialCoordinates);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(0);

  const pushToast = (title: string, description?: string, tone: 'green' | 'red' = 'green') => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, title, description, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  };

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateCoordinates = (nextState: SavedState) => {
    setCoords(nextState);
    try {
      localStorage.setItem('configbench.coordinates', JSON.stringify(nextState));
    } catch (e) {
      void e;
    }
  };

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('x', String(coords.overworld.x));
    params.set('y', String(coords.overworld.y));
    params.set('z', String(coords.overworld.z));

    const nextSearch = `?${params.toString()}`;
    if (window.location.search !== nextSearch) {
      window.history.replaceState(null, '', `${window.location.pathname}${nextSearch}`);
    }
  }, [coords.overworld]);

  const overworldSet = useMemo(
    () => buildDimensionCoordinateSet('overworld', coords.overworld),
    [coords.overworld],
  );

  const netherSet = useMemo(
    () => buildDimensionCoordinateSet('nether', coords.nether),
    [coords.nether],
  );

  const portalLinking = useMemo(
    () => calculatePortalLinking(coords.overworld, coords.nether),
    [coords.overworld, coords.nether],
  );

  const dualCoords = useMemo(
    () => ({
      overworld: overworldSet,
      nether: netherSet,
      portalLinking,
    }),
    [overworldSet, netherSet, portalLinking],
  );

  const handleOverworldBlockChange = (axis: 'x' | 'y' | 'z', val: number) => {
    const nextOw = { ...coords.overworld, [axis]: val };
    const nextNe = overworldToNether(nextOw);
    updateCoordinates({ overworld: nextOw, nether: nextNe });
  };

  const handleOverworldChunkChange = (axis: 'x' | 'y' | 'z', val: number) => {
    const nextChunk = { ...overworldSet.chunk, [axis]: val };
    const nextOw = chunkToBlock(
      nextChunk.x,
      nextChunk.y,
      nextChunk.z,
      overworldSet.chunk.inChunkX,
      overworldSet.chunk.inChunkY,
      overworldSet.chunk.inChunkZ,
    );
    const nextNe = overworldToNether(nextOw);
    updateCoordinates({ overworld: nextOw, nether: nextNe });
  };

  const handleOverworldRegionChange = (axis: 'x' | 'z', val: number) => {
    const nextRegion = { ...overworldSet.region, [axis]: val };
    const nextOw = regionToBlock(
      nextRegion.x,
      nextRegion.z,
      overworldSet.region.inRegionChunkX,
      overworldSet.region.inRegionChunkZ,
      overworldSet.chunk.inChunkX,
      overworldSet.chunk.inChunkZ,
      coords.overworld.y,
    );
    const nextNe = overworldToNether(nextOw);
    updateCoordinates({ overworld: nextOw, nether: nextNe });
  };

  const handleNetherBlockChange = (axis: 'x' | 'y' | 'z', val: number) => {
    const nextNe = { ...coords.nether, [axis]: val };
    const nextOw = netherToOverworld(nextNe);
    updateCoordinates({ overworld: nextOw, nether: nextNe });
  };

  const handleNetherChunkChange = (axis: 'x' | 'y' | 'z', val: number) => {
    const nextChunk = { ...netherSet.chunk, [axis]: val };
    const nextNe = chunkToBlock(
      nextChunk.x,
      nextChunk.y,
      nextChunk.z,
      netherSet.chunk.inChunkX,
      netherSet.chunk.inChunkY,
      netherSet.chunk.inChunkZ,
    );
    const nextOw = netherToOverworld(nextNe);
    updateCoordinates({ overworld: nextOw, nether: nextNe });
  };

  const handleNetherRegionChange = (axis: 'x' | 'z', val: number) => {
    const nextRegion = { ...netherSet.region, [axis]: val };
    const nextNe = regionToBlock(
      nextRegion.x,
      nextRegion.z,
      netherSet.region.inRegionChunkX,
      netherSet.region.inRegionChunkZ,
      netherSet.chunk.inChunkX,
      netherSet.chunk.inChunkZ,
      coords.nether.y,
    );
    const nextOw = netherToOverworld(nextNe);
    updateCoordinates({ overworld: nextOw, nether: nextNe });
  };

  const handleReset = () => {
    updateCoordinates({ overworld: DEFAULT_OW, nether: DEFAULT_NE });
    pushToast('Reset to origin', 'Coordinates set back to 0, 64, 0.', 'green');
  };

  return (
    <div className="flex w-full flex-col gap-4 pb-4">
      <Panel title="Coordinate Calculator" icon={Compass} className="w-full shrink-0">
        <div className="flex items-center justify-between p-4">
          <p className="text-xs text-muted max-w-xl">
            Find Block, Chunk, and Region coordinates with live Overworld ↔ Nether 8:1 portal linking.
            Enter any coordinate to calculate all other representations synchronously.
          </p>

          <button
            type="button"
            onClick={handleReset}
            className="mc-btn flex h-8 items-center gap-1.5 px-3 text-xs text-muted hover:text-text"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DimensionCoordinatePanel
          coordSet={overworldSet}
          onBlockChange={handleOverworldBlockChange}
          onChunkChange={handleOverworldChunkChange}
          onRegionChange={handleOverworldRegionChange}
          onCopy={(text, title, desc) => {
            navigator.clipboard.writeText(text);
            pushToast(title, desc);
          }}
        />

        <DimensionCoordinatePanel
          coordSet={netherSet}
          onBlockChange={handleNetherBlockChange}
          onChunkChange={handleNetherChunkChange}
          onRegionChange={handleNetherRegionChange}
          onCopy={(text, title, desc) => {
            navigator.clipboard.writeText(text);
            pushToast(title, desc);
          }}
        />
      </div>

      <PortalLinkingCard result={dualCoords} />
      <CoordToasts toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
