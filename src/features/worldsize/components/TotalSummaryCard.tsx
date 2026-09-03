import { useState } from 'react';
import { Check, Clock, Copy, HardDrive, Terminal } from 'lucide-react';
import type { ShapeType, WorldSizeResult } from '../types';
import {
  formatDuration,
  formatNumberWithCommas,
  generateChunkyCommands,
  generateWorldBorderCommand,
} from '../engine/calculator';

interface TotalSummaryCardProps {
  result: WorldSizeResult;
  shape: ShapeType;
}

export function TotalSummaryCard({ result, shape }: TotalSummaryCardProps) {
  const [copiedAll, setCopiedAll] = useState(false);
  const [showCommands, setShowCommands] = useState(false);

  const allChunkyCommands = [
    '# Overworld',
    ...generateChunkyCommands('overworld', result.dimensions.overworld.radius, shape),
    '',
    '# Nether',
    ...generateChunkyCommands('nether', result.dimensions.nether.radius, shape),
    '',
    '# The End',
    ...generateChunkyCommands('end', result.dimensions.end.radius, shape),
  ];

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(allChunkyCommands.join('\n'));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (e) {
      void e;
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-none border border-line bg-[#15151f] p-4">
      <div className="flex flex-col items-center justify-center border-b border-line pb-4 text-center">
        <span className="text-xs uppercase tracking-wider text-muted">
          Total Estimated Storage
        </span>
        <span className="font-mc text-4xl font-bold text-[var(--accent)] sm:text-5xl">
          {result.formattedTotalSize}
        </span>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 font-mono text-xs text-muted">
          <span>
            <strong className="text-text">{formatNumberWithCommas(result.totalChunks)}</strong>{' '}
            total chunks
          </span>
          <span>•</span>
          <span>
            <strong className="text-text">
              {formatNumberWithCommas(result.totalRegionFiles)}
            </strong>{' '}
            region files (.mca)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-none border border-line bg-[#101018] p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none bg-[var(--accent)]/15 text-[var(--accent)]">
            <HardDrive size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-muted">
              Recommended SSD Capacity
            </span>
            <span className="font-mc text-lg text-text">
              {result.recommendedDiskGB} GB SSD
            </span>
            <span className="text-[10px] text-muted">
              Includes overhead for OS, backups, runtime logs, and player builds.
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-none border border-line bg-[#101018] p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none bg-blue-500/15 text-blue-400">
            <Clock size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-muted">
              Estimated Chunky Duration
            </span>
            <div className="flex items-center gap-2 font-mono text-xs text-text">
              <span>{formatDuration(result.estimatedPregenSeconds.fast)} (Fast CPU)</span>
              <span className="text-muted">/</span>
              <span>{formatDuration(result.estimatedPregenSeconds.normal)} (Normal)</span>
            </div>
            <span className="text-[10px] text-muted">
              Based on generation speeds of 200–450 chunks/sec on modern Paper/Purpur.
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-none border border-line bg-[#090910] p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-[var(--accent)]" />
            <span className="font-mc text-xs text-text">Chunky Commands</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCommands((v) => !v)}
              className="text-[11px] text-muted hover:text-text"
            >
              {showCommands ? 'Hide Script' : 'View Script'}
            </button>
            <button
              type="button"
              onClick={handleCopyAll}
              data-active={copiedAll}
              className="mc-icon-btn h-7 w-[154px] justify-center rounded-none px-2.5 text-xs"
            >
              <span key={copiedAll ? 'check' : 'copy'} className="pop-in flex items-center gap-1.5">
                {copiedAll ? <Check size={13} /> : <Copy size={13} />}
                {copiedAll ? 'Copied All' : 'Copy All Commands'}
              </span>
            </button>
          </div>
        </div>

        {showCommands && (
          <pre className="mt-2 max-h-48 overflow-x-auto rounded-none border border-line/60 bg-[#0d0d17] p-2.5 font-mono text-[11px] text-[#a6adc8]">
            {allChunkyCommands.join('\n')}
            {'\n\n'}# Vanilla WorldBorder{'\n'}
            {generateWorldBorderCommand(result.dimensions.overworld.radius)}
          </pre>
        )}
      </div>
    </div>
  );
}
