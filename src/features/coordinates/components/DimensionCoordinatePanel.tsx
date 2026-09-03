import { useState } from 'react';
import { Box, Check, Copy, Flame, Folder, Layers, MapPin, Terminal, Trees } from 'lucide-react';
import type { DimensionCoordinateSet } from '../types';
import { CoordNumberInput } from './CoordNumberInput';
import { ChunkGridVisualizer } from './ChunkGridVisualizer';

interface DimensionCoordinatePanelProps {
  coordSet: DimensionCoordinateSet;
  onBlockChange: (axis: 'x' | 'y' | 'z', val: number) => void;
  onChunkChange: (axis: 'x' | 'y' | 'z', val: number) => void;
  onRegionChange: (axis: 'x' | 'z', val: number) => void;
  onCopy: (text: string, title: string, description?: string) => void;
}

export function DimensionCoordinatePanel({
  coordSet,
  onBlockChange,
  onChunkChange,
  onRegionChange,
  onCopy,
}: DimensionCoordinatePanelProps) {
  const [copiedTp, setCopiedTp] = useState(false);
  const [copiedFile, setCopiedFile] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);

  const isNether = coordSet.dimension === 'nether';
  const DimIcon = isNether ? Flame : Trees;
  const accentColor = isNether ? '#ef4444' : '#10b981';
  const borderClass = isNether ? 'border-[#ef4444]/40' : 'border-[#10b981]/40';

  const handleCopy = (
    text: string,
    title: string,
    description: string,
    setter: (v: boolean) => void,
  ) => {
    setter(true);
    setTimeout(() => setter(false), 1200);
    onCopy(text, title, description);
  };

  return (
    <div className={`flex flex-col gap-4 rounded-none border ${borderClass} bg-[#15151f] p-4 transition-all`}>
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-none"
            style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
          >
            <DimIcon size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-mc text-base text-text">
              {isNether ? 'Nether' : 'Overworld'}
            </span>
            <span className="text-[10px] text-muted">
              {isNether ? '1 block = 8 Overworld blocks' : 'Standard 1:1 scale'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            handleCopy(
              coordSet.tpCommand,
              'Teleport Command Copied!',
              coordSet.tpCommand,
              setCopiedTp,
            )
          }
          data-active={copiedTp}
          className="mc-icon-btn h-8 w-[100px] justify-center rounded-none px-2 text-xs"
          title={coordSet.tpCommand}
        >
          <span key={copiedTp ? 'check' : 'copy'} className="pop-in flex items-center gap-1.5">
            {copiedTp ? <Check size={13} /> : <Terminal size={13} />}
            {copiedTp ? 'Copied' : 'Copy /tp'}
          </span>
        </button>
      </div>

      <div className="flex flex-col gap-2 rounded-none border border-line/60 bg-[#101018] p-3">
        <div className="flex items-center gap-1.5 text-xs text-text font-semibold">
          <Box size={14} style={{ color: accentColor }} />
          <span>Block Coordinates</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <CoordNumberInput
            label="X"
            value={coordSet.block.x}
            onChange={(val) => onBlockChange('x', val)}
            accentColor={accentColor}
          />
          <CoordNumberInput
            label="Y"
            value={coordSet.block.y}
            onChange={(val) => onBlockChange('y', val)}
            accentColor={accentColor}
          />
          <CoordNumberInput
            label="Z"
            value={coordSet.block.z}
            onChange={(val) => onBlockChange('z', val)}
            accentColor={accentColor}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-none border border-line/60 bg-[#101018] p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-text font-semibold">
            <Layers size={14} style={{ color: accentColor }} />
            <span>Chunk Coordinates</span>
          </div>
          <span className="font-mono text-[10px] text-muted">
            Offset: [{coordSet.chunk.inChunkX}, {coordSet.chunk.inChunkY}, {coordSet.chunk.inChunkZ}]
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <CoordNumberInput
            label="Chunk X"
            value={coordSet.chunk.x}
            onChange={(val) => onChunkChange('x', val)}
            accentColor={accentColor}
          />
          <CoordNumberInput
            label="Chunk Y"
            value={coordSet.chunk.y}
            onChange={(val) => onChunkChange('y', val)}
            accentColor={accentColor}
          />
          <CoordNumberInput
            label="Chunk Z"
            value={coordSet.chunk.z}
            onChange={(val) => onChunkChange('z', val)}
            accentColor={accentColor}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-none border border-line/60 bg-[#101018] p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-text font-semibold">
            <MapPin size={14} style={{ color: accentColor }} />
            <span>Region File (.mca)</span>
          </div>
          <span className="font-mono text-[10px] text-muted">
            Chunk in Region: [{coordSet.region.inRegionChunkX}, {coordSet.region.inRegionChunkZ}]
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <CoordNumberInput
            label="Region X"
            value={coordSet.region.x}
            onChange={(val) => onRegionChange('x', val)}
            accentColor={accentColor}
          />
          <CoordNumberInput
            label="Region Z"
            value={coordSet.region.z}
            onChange={(val) => onRegionChange('z', val)}
            accentColor={accentColor}
          />
        </div>

        <div className="mt-1 flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between gap-2 rounded-none border border-line/40 bg-[#0c0c14] px-2.5 py-1.5">
            <span className="font-mono text-[11px] text-text font-medium truncate">
              {coordSet.region.filename}
            </span>
            <button
              type="button"
              onClick={() =>
                handleCopy(
                  coordSet.region.filename,
                  'Filename Copied!',
                  coordSet.region.filename,
                  setCopiedFile,
                )
              }
              data-active={copiedFile}
              className="mc-icon-btn h-7 w-[88px] justify-center rounded-none px-1.5 text-[11px] shrink-0"
              title="Copy filename"
            >
              <span key={copiedFile ? 'check' : 'copy'} className="pop-in flex items-center gap-1">
                {copiedFile ? <Check size={12} /> : <Copy size={12} />}
                {copiedFile ? 'Copied' : 'Filename'}
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 rounded-none border border-line/40 bg-[#0c0c14] px-2.5 py-1.5">
            <div className="flex items-center gap-1.5 truncate">
              <Folder size={12} className="text-muted shrink-0" />
              <span className="font-mono text-[10px] text-muted truncate">
                {coordSet.region.serverPath}
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                handleCopy(
                  coordSet.region.serverPath,
                  'Server Path Copied!',
                  coordSet.region.serverPath,
                  setCopiedPath,
                )
              }
              data-active={copiedPath}
              className="mc-icon-btn h-7 w-[98px] justify-center rounded-none px-1.5 text-[11px] shrink-0"
              title="Copy server path"
            >
              <span key={copiedPath ? 'check' : 'copy'} className="pop-in flex items-center gap-1">
                {copiedPath ? <Check size={12} /> : <Copy size={12} />}
                {copiedPath ? 'Copied' : 'Server Path'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <ChunkGridVisualizer
        inChunkX={coordSet.chunk.inChunkX}
        inChunkZ={coordSet.chunk.inChunkZ}
        inRegionChunkX={coordSet.region.inRegionChunkX}
        inRegionChunkZ={coordSet.region.inRegionChunkZ}
        accentColor={accentColor}
      />
    </div>
  );
}
