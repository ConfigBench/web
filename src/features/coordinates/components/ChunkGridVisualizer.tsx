interface ChunkGridVisualizerProps {
  inChunkX: number;
  inChunkZ: number;
  inRegionChunkX: number;
  inRegionChunkZ: number;
  accentColor: string;
}

export function ChunkGridVisualizer({
  inChunkX,
  inChunkZ,
  inRegionChunkX,
  inRegionChunkZ,
  accentColor,
}: ChunkGridVisualizerProps) {
  const chunkBlockX = Math.max(0, Math.min(15, inChunkX));
  const chunkBlockZ = Math.max(0, Math.min(15, inChunkZ));

  const regionChunkX = Math.max(0, Math.min(31, inRegionChunkX));
  const regionChunkZ = Math.max(0, Math.min(31, inRegionChunkZ));

  return (
    <div className="grid grid-cols-2 gap-3 rounded-none border border-line/60 bg-[#090910] p-2.5">
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex items-center justify-between w-full px-1">
          <span className="text-[10px] uppercase tracking-wider text-muted">
            In-Chunk (16×16)
          </span>
          <span className="font-mono text-[10px] font-semibold" style={{ color: accentColor }}>
            [{chunkBlockX}, {chunkBlockZ}]
          </span>
        </div>

        <div className="relative flex h-24 w-24 items-center justify-center border border-line/40 bg-[#101018]">
          <svg viewBox="0 0 16 16" className="h-full w-full select-none" aria-hidden="true">
            <defs>
              <pattern id="chunk-grid" width="1" height="1" patternUnits="userSpaceOnUse">
                <rect width="1" height="1" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.08" />
              </pattern>
            </defs>
            <rect width="16" height="16" fill="url(#chunk-grid)" />
            <rect
              x={chunkBlockX}
              y={chunkBlockZ}
              width="1"
              height="1"
              fill={accentColor}
              className="transition-all duration-150"
            />
          </svg>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <div className="flex items-center justify-between w-full px-1">
          <span className="text-[10px] uppercase tracking-wider text-muted">
            In-Region (32×32)
          </span>
          <span className="font-mono text-[10px] font-semibold" style={{ color: accentColor }}>
            [{regionChunkX}, {regionChunkZ}]
          </span>
        </div>

        <div className="relative flex h-24 w-24 items-center justify-center border border-line/40 bg-[#101018]">
          <svg viewBox="0 0 32 32" className="h-full w-full select-none" aria-hidden="true">
            <defs>
              <pattern id="region-grid" width="1" height="1" patternUnits="userSpaceOnUse">
                <rect width="1" height="1" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.08" />
              </pattern>
            </defs>
            <rect width="32" height="32" fill="url(#region-grid)" />
            <rect
              x={regionChunkX}
              y={regionChunkZ}
              width="1"
              height="1"
              fill={accentColor}
              className="transition-all duration-150"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
