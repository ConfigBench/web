import { useMemo } from 'react';
import type { MeasurementType, ShapeType } from '../types';

interface DimensionVisualizerProps {
  radius: number;
  shape: ShapeType;
  color: string;
  fillColor: string;
  measurement: MeasurementType;
}

function formatCompactBlocks(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
  return String(val);
}

export function DimensionVisualizer({
  radius,
  shape,
  color,
  fillColor,
  measurement,
}: DimensionVisualizerProps) {
  const displayValue = measurement === 'diameter' ? radius * 2 : radius;

  const normalizedSize = useMemo(() => {
    if (radius <= 0) return 0;
    const clamped = Math.min(Math.max(radius, 500), 100_000);
    const minPx = 28;
    const maxPx = 118;
    const ratio = Math.log10(clamped / 500) / Math.log10(100_000 / 500);
    return Math.round(minPx + ratio * (maxPx - minPx));
  }, [radius]);

  const half = normalizedSize / 2;
  const center = 70;

  return (
    <div className="relative flex h-48 w-full flex-col items-center justify-center rounded-none border border-line bg-[#090910]/70 p-2">
      <svg
        viewBox="0 0 140 140"
        className="h-32 w-32 select-none overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <pattern id="radar-grid" width="14" height="14" patternUnits="userSpaceOnUse">
            <path
              d="M 14 0 L 0 0 0 14"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="0.75"
            />
          </pattern>
        </defs>

        <rect x="0" y="0" width="140" height="140" fill="url(#radar-grid)" />

        <line
          x1="0"
          y1={center}
          x2="140"
          y2={center}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
          strokeDasharray="2 2"
        />
        <line
          x1={center}
          y1="0"
          x2={center}
          y2="140"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
          strokeDasharray="2 2"
        />

        {normalizedSize > 0 && (
          <>
            {shape === 'circle' ? (
              <circle
                cx={center}
                cy={center}
                r={half}
                fill={fillColor}
                stroke={color}
                strokeWidth="1.5"
                className="transition-all duration-200"
              />
            ) : (
              <rect
                x={center - half}
                y={center - half}
                width={normalizedSize}
                height={normalizedSize}
                fill={fillColor}
                stroke={color}
                strokeWidth="1.5"
                className="transition-all duration-200"
              />
            )}
          </>
        )}

        <circle cx={center} cy={center} r="2" fill={color} />
      </svg>

      <div className="mt-1 flex flex-col items-center">
        <div className="flex items-center gap-1 font-mono text-[11px] font-medium tracking-tight text-text">
          <span className="text-[#6c7086]">⊢</span>
          <span style={{ color }}>{formatCompactBlocks(displayValue)} blocks</span>
          <span className="text-[#6c7086]">⊣</span>
        </div>
        <span className="text-[9px] uppercase tracking-wider text-muted">
          {measurement} ({shape})
        </span>
      </div>
    </div>
  );
}
