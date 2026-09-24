import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { ShapeMode, ShapeStats } from '../types';
import { Panel } from '../../../shared/components/ui/Panel';

interface ShapeStatsCardProps {
  stats: ShapeStats;
  mode: ShapeMode;
}

export function ShapeStatsCard({ stats, mode }: ShapeStatsCardProps) {
  const [copied, setCopied] = useState(false);

  const copyStats = async () => {
    const lines: string[] = [];
    lines.push(`Minecraft ${mode.toUpperCase()} Blueprint`);
    if (mode === 'oval') {
      lines.push(`Dimensions: ${stats.width ?? 0} × ${stats.height ?? 0}`);
    } else {
      lines.push(`Diameter: ${stats.diameter ?? 0}`);
      lines.push(`Radius: ${stats.radius}`);
    }
    lines.push(`Circumference: ${stats.circumference}`);
    lines.push(
      `Layer Blocks: ${stats.blockCount.toLocaleString()} (${stats.layerStacks.stacks} stacks + ${stats.layerStacks.remainder})`,
    );
    if (mode === 'sphere' || mode === 'dome') {
      lines.push(
        `Total Blocks: ${stats.totalBlockCount.toLocaleString()} (${stats.totalStacks.stacks} stacks + ${stats.totalStacks.remainder} · ${stats.totalStacks.shulkers} shulkers)`,
      );
    }
    lines.push(`Generated on ConfigBench (https://configbench.com)`);

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      void e;
    }
  };

  return (
    <Panel
      title="Stats"
      actions={
        <button
          type="button"
          onClick={copyStats}
          title="Copy stats to clipboard"
          data-active={copied}
          className="mc-icon-btn h-7 rounded-none px-2 text-xs text-muted hover:text-text"
        >
          {copied ? <Check size={12} className="text-[var(--accent)]" /> : <Copy size={12} />}
          <span className="ml-1 text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-3 p-4">
        <div className="flex flex-col">
          <span className="text-[11px] text-dim">Blocks (Layer)</span>
          <span className="font-mc text-xl text-text">{stats.blockCount.toLocaleString()}</span>
          <span className="font-mono text-[10px] text-dim">
            {stats.layerStacks.stacks > 0
              ? `${stats.layerStacks.stacks} st + ${stats.layerStacks.remainder}`
              : `${stats.layerStacks.remainder} blocks`}
          </span>
        </div>

        {mode === 'sphere' || mode === 'dome' ? (
          <div className="flex flex-col">
            <span className="text-[11px] text-dim">Total Blocks</span>
            <span className="font-mc text-xl text-[var(--accent)]">{stats.totalBlockCount.toLocaleString()}</span>
            <span className="font-mono text-[10px] text-dim">
              {stats.totalStacks.stacks} st + {stats.totalStacks.remainder}{' '}
              <span className="text-muted">({stats.totalStacks.shulkers} sb)</span>
            </span>
          </div>
        ) : null}

        {mode === 'oval' ? (
          <>
            <div className="flex flex-col">
              <span className="text-[11px] text-dim">Width</span>
              <span className="font-mc text-sm text-text">{stats.width}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-dim">Height</span>
              <span className="font-mc text-sm text-text">{stats.height}</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col">
              <span className="text-[11px] text-dim">Diameter</span>
              <span className="font-mc text-sm text-text">{stats.diameter}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-dim">Radius</span>
              <span className="font-mc text-sm text-text">{stats.radius.toFixed(1)}</span>
            </div>
          </>
        )}

        <div className="flex flex-col">
          <span className="text-[11px] text-dim">Circumference</span>
          <span className="font-mc text-sm text-text">{stats.circumference.toFixed(1)}</span>
        </div>
      </div>
    </Panel>
  );
}
