import { useState } from 'react';
import { Check, Copy, Flame, Sparkles, Trees } from 'lucide-react';
import type { DimensionId, DimensionStats, MeasurementType, ShapeType } from '../types';
import { DimensionVisualizer } from './DimensionVisualizer';
import { formatNumberWithCommas, generateChunkyCommands } from '../engine/calculator';

interface DimensionCardProps {
  stats: DimensionStats;
  shape: ShapeType;
  measurement: MeasurementType;
}

const DIMENSION_CONFIG: Record<
  DimensionId,
  {
    name: string;
    icon: typeof Trees;
    accentColor: string;
    fillColor: string;
    borderTone: string;
    badgeBg: string;
  }
> = {
  overworld: {
    name: 'Overworld',
    icon: Trees,
    accentColor: '#10b981',
    fillColor: 'rgba(16, 185, 129, 0.12)',
    borderTone: 'border-[#10b981]/30',
    badgeBg: 'bg-[#10b981]/15 text-[#10b981]',
  },
  nether: {
    name: 'Nether',
    icon: Flame,
    accentColor: '#ef4444',
    fillColor: 'rgba(239, 68, 68, 0.12)',
    borderTone: 'border-[#ef4444]/30',
    badgeBg: 'bg-[#ef4444]/15 text-[#ef4444]',
  },
  end: {
    name: 'The End',
    icon: Sparkles,
    accentColor: '#a855f7',
    fillColor: 'rgba(168, 85, 247, 0.12)',
    borderTone: 'border-[#a855f7]/30',
    badgeBg: 'bg-[#a855f7]/15 text-[#a855f7]',
  },
};

export function DimensionCard({ stats, shape, measurement }: DimensionCardProps) {
  const [copied, setCopied] = useState(false);
  const info = DIMENSION_CONFIG[stats.dimension];
  const Icon = info.icon;

  const handleCopyChunky = async () => {
    const commands = generateChunkyCommands(stats.dimension, stats.radius, shape);
    try {
      await navigator.clipboard.writeText(commands.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      void e;
    }
  };

  return (
    <div
      className={`flex flex-col rounded-none border ${info.borderTone} bg-[#15151f] p-4 transition-colors`}
    >
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-none ${info.badgeBg}`}>
            <Icon size={16} />
          </div>
          <span className="font-mc text-sm text-text">{info.name}</span>
        </div>
        <button
          type="button"
          onClick={handleCopyChunky}
          title="Copy Chunky pregen commands for this dimension"
          data-active={copied}
          className="mc-icon-btn h-7 w-[108px] justify-center rounded-none px-2 text-[11px]"
        >
          <span key={copied ? 'check' : 'copy'} className="pop-in flex items-center gap-1.5">
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Chunky Cmds'}
          </span>
        </button>
      </div>

      <div className="my-3 flex items-baseline justify-between">
        <span className="text-[12px] uppercase tracking-wider text-muted">Estimated Size</span>
        <span
          className="font-mc text-2xl font-bold tracking-wide"
          style={{ color: info.accentColor }}
        >
          {stats.formattedSize}
        </span>
      </div>

      <DimensionVisualizer
        radius={stats.radius}
        shape={shape}
        color={info.accentColor}
        fillColor={info.fillColor}
        measurement={measurement}
      />

      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3 font-mono text-[11px]">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase text-muted">Radius</span>
          <span className="font-semibold text-text">
            {formatNumberWithCommas(stats.radius)} blocks
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase text-muted">Diameter</span>
          <span className="font-semibold text-text">
            {formatNumberWithCommas(stats.diameter)} blocks
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase text-muted">Chunks</span>
          <span className="font-semibold text-text">
            {formatNumberWithCommas(stats.chunks)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase text-muted">Region Files</span>
          <span className="font-semibold text-text">
            {formatNumberWithCommas(stats.regionFiles)} .mca
          </span>
        </div>
      </div>
    </div>
  );
}
