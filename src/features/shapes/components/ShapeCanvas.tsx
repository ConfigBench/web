import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent, type WheelEvent as RWheelEvent } from 'react';
import { Check, Compass, Crosshair, Download, Eye, Maximize2, RotateCcw } from 'lucide-react';
import type { ShapeMode, WorldAnchor } from '../types';
import { calculateWorldCoords, getAnchorGridPoint } from '../engine/rasterize';
import { useTheme } from '../../../shared/theme/useTheme';
import { THEMES } from '../../../shared/theme/theme';
import { cn } from '../../../shared/lib/cn';

interface ShapeCanvasProps {
  grid: boolean[][];
  ghostGrid?: boolean[][] | null;
  mode: ShapeMode;
  diameter: number;
  width: number;
  height: number;
  layer: number;
  showGrid: boolean;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  placed: Set<string>;
  onTogglePlaced: (coord: string) => void;
  onClearPlaced: () => void;
  anchor: WorldAnchor;
  isPickingAnchor?: boolean;
  onPickAnchor?: (gx: number, gy: number) => void;
}

export function ShapeCanvas({
  grid,
  ghostGrid,
  mode,
  diameter,
  width,
  height,
  layer,
  showGrid,
  zoom,
  onZoomChange,
  placed,
  onTogglePlaced,
  onClearPlaced,
  anchor,
  isPickingAnchor = false,
  onPickAnchor,
}: ShapeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { accent } = useTheme();
  const accentColor = THEMES.find((t) => t.id === accent)?.color ?? '#6ee7a0';

  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({
          w: Math.round(entry.contentRect.width),
          h: Math.round(entry.contentRect.height),
        });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isPointerDown = useRef(false);
  const pointerStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasDragged = useRef(false);

  const gridH = grid.length;
  const gridW = grid[0]?.length ?? 0;

  const fitToScreen = useCallback(() => {
    if (!containerRef.current || gridW === 0 || gridH === 0) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const padding = 48;
    const availW = Math.max(100, clientWidth - padding);
    const availH = Math.max(100, clientHeight - padding);

    const baseCell = 16;
    const fitZoom = Math.min(availW / (gridW * baseCell), availH / (gridH * baseCell), 2.5);
    const clampedZoom = Math.max(0.2, Math.min(5, fitZoom));

    onZoomChange(Math.round(clampedZoom * 20) / 20);
    setPan({ x: 0, y: 0 });
  }, [gridW, gridH, onZoomChange]);

  const prevDimensions = useRef({ gridW, gridH, mode });
  useEffect(() => {
    if (
      prevDimensions.current.gridW !== gridW ||
      prevDimensions.current.gridH !== gridH ||
      prevDimensions.current.mode !== mode
    ) {
      prevDimensions.current = { gridW, gridH, mode };
      fitToScreen();
    }
  }, [gridW, gridH, mode, fitToScreen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || gridW === 0 || gridH === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const widthPx = canvas.clientWidth;
    const heightPx = canvas.clientHeight;

    if (canvas.width !== widthPx * dpr || canvas.height !== heightPx * dpr) {
      canvas.width = widthPx * dpr;
      canvas.height = heightPx * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, widthPx, heightPx);

    const baseCell = 16;
    const cellSize = baseCell * zoom;
    const totalW = gridW * cellSize;
    const totalH = gridH * cellSize;

    const originX = Math.round(widthPx / 2 - totalW / 2 + pan.x);
    const originY = Math.round(heightPx / 2 - totalH / 2 + pan.y);

    ctx.fillStyle = '#11111a';
    ctx.fillRect(originX, originY, totalW, totalH);

    const centerX = Math.floor(gridW / 2);
    const centerY = Math.floor(gridH / 2);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.fillRect(originX + centerX * cellSize, originY, cellSize, totalH);
    ctx.fillRect(originX, originY + centerY * cellSize, totalW, cellSize);

    if (showGrid && cellSize >= 4) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= gridW; x++) {
        const lineX = Math.floor(originX + x * cellSize) + 0.5;
        ctx.moveTo(lineX, originY);
        ctx.lineTo(lineX, originY + totalH);
      }
      for (let y = 0; y <= gridH; y++) {
        const lineY = Math.floor(originY + y * cellSize) + 0.5;
        ctx.moveTo(originX, lineY);
        ctx.lineTo(originX + totalW, lineY);
      }
      ctx.stroke();
    }

    if (ghostGrid && ghostGrid.length === gridH) {
      for (let y = 0; y < gridH; y++) {
        const row = ghostGrid[y];
        for (let x = 0; x < gridW; x++) {
          if (!row[x] || grid[y][x]) continue;
          const bx = originX + x * cellSize;
          const by = originY + y * cellSize;

          ctx.fillStyle = 'rgba(70, 95, 130, 0.5)';
          ctx.fillRect(bx, by, cellSize, cellSize);

          ctx.fillStyle = 'rgba(180, 215, 255, 0.3)';
          ctx.fillRect(bx, by, cellSize, Math.max(1, Math.round(cellSize * 0.12)));
          ctx.fillRect(bx, by, Math.max(1, Math.round(cellSize * 0.12)), cellSize);

          ctx.strokeStyle = 'rgba(140, 190, 245, 0.7)';
          ctx.lineWidth = 1;
          ctx.strokeRect(bx + 0.5, by + 0.5, cellSize - 1, cellSize - 1);

          if (cellSize >= 10) {
            ctx.strokeStyle = 'rgba(140, 190, 245, 0.35)';
            ctx.beginPath();
            ctx.moveTo(bx + 2, by + 2);
            ctx.lineTo(bx + cellSize - 2, by + cellSize - 2);
            ctx.stroke();
          }
        }
      }
    }

    const is3D = mode === 'sphere' || mode === 'dome';
    const isAnchorLayer = !is3D || anchor.layer === layer;
    const anchorPoint = anchor.enabled && isAnchorLayer ? getAnchorGridPoint(grid, anchor) : null;

    for (let y = 0; y < gridH; y++) {
      const row = grid[y];
      for (let x = 0; x < gridW; x++) {
        if (!row[x]) continue;
        const isAnchorBlock = anchorPoint && anchorPoint.gx === x && anchorPoint.gy === y;

        const bx = originX + x * cellSize;
        const by = originY + y * cellSize;
        const key = `${x},${y}`;
        const isPlaced = placed.has(key);

        if (isPlaced) {
          ctx.fillStyle = '#3c404f';
          ctx.fillRect(bx, by, cellSize, cellSize);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.fillRect(bx, by, cellSize, Math.max(1, Math.round(cellSize * 0.12)));
          ctx.fillRect(bx, by, Math.max(1, Math.round(cellSize * 0.12)), cellSize);

          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.fillRect(bx, by + cellSize - Math.max(1, Math.round(cellSize * 0.15)), cellSize, Math.max(1, Math.round(cellSize * 0.15)));
          ctx.fillRect(bx + cellSize - Math.max(1, Math.round(cellSize * 0.15)), by, Math.max(1, Math.round(cellSize * 0.15)), cellSize);

          if (cellSize >= 10) {
            ctx.fillStyle = accentColor;
            const dotSize = Math.max(2, Math.round(cellSize * 0.3));
            ctx.fillRect(
              Math.round(bx + (cellSize - dotSize) / 2),
              Math.round(by + (cellSize - dotSize) / 2),
              dotSize,
              dotSize,
            );
          }
        } else {
          ctx.fillStyle = accentColor;
          ctx.fillRect(bx, by, cellSize, cellSize);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
          ctx.fillRect(bx, by, cellSize, Math.max(1, Math.round(cellSize * 0.14)));
          ctx.fillRect(bx, by, Math.max(1, Math.round(cellSize * 0.14)), cellSize);

          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.fillRect(bx, by + cellSize - Math.max(1, Math.round(cellSize * 0.18)), cellSize, Math.max(1, Math.round(cellSize * 0.18)));
          ctx.fillRect(bx + cellSize - Math.max(1, Math.round(cellSize * 0.18)), by, Math.max(1, Math.round(cellSize * 0.18)), cellSize);
        }

        if (isAnchorBlock) {
          ctx.strokeStyle = '#ffd83d';
          ctx.lineWidth = Math.max(2, Math.round(cellSize * 0.15));
          ctx.strokeRect(bx + 1, by + 1, cellSize - 2, cellSize - 2);

          if (cellSize >= 8) {
            ctx.fillStyle = '#ffd83d';
            const dotSize = Math.max(3, Math.round(cellSize * 0.35));
            ctx.fillRect(
              Math.round(bx + (cellSize - dotSize) / 2),
              Math.round(by + (cellSize - dotSize) / 2),
              dotSize,
              dotSize,
            );
          }
        }
      }
    }

    if (hoveredCell && hoveredCell.x >= 0 && hoveredCell.x < gridW && hoveredCell.y >= 0 && hoveredCell.y < gridH) {
      if (grid[hoveredCell.y][hoveredCell.x]) {
        const hx = originX + hoveredCell.x * cellSize;
        const hy = originY + hoveredCell.y * cellSize;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(hx, hy, cellSize, cellSize);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(hx + 0.5, hy + 0.5, cellSize - 1, cellSize - 1);
      }
    }

    ctx.restore();
  }, [grid, ghostGrid, gridW, gridH, pan, zoom, showGrid, placed, hoveredCell, containerSize.w, containerSize.h, accentColor, anchor, layer, mode]);

  const onPointerDown = (e: RPointerEvent<HTMLCanvasElement>) => {
    isPointerDown.current = true;
    hasDragged.current = false;
    pointerStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...pan };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: RPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isPointerDown.current) {
      const dx = e.clientX - pointerStart.current.x;
      const dy = e.clientY - pointerStart.current.y;
      if (Math.hypot(dx, dy) > 3) {
        hasDragged.current = true;
        setPan({
          x: panStart.current.x + dx,
          y: panStart.current.y + dy,
        });
      }
    }

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const baseCell = 16;
    const cellSize = baseCell * zoom;
    const totalW = gridW * cellSize;
    const totalH = gridH * cellSize;
    const originX = rect.width / 2 - totalW / 2 + pan.x;
    const originY = rect.height / 2 - totalH / 2 + pan.y;

    const gx = Math.floor((mouseX - originX) / cellSize);
    const gy = Math.floor((mouseY - originY) / cellSize);

    if (gx >= 0 && gx < gridW && gy >= 0 && gy < gridH && grid[gy]?.[gx]) {
      setHoveredCell({ x: gx, y: gy });
    } else {
      setHoveredCell(null);
    }
  };

  const onPointerUp = (e: RPointerEvent<HTMLCanvasElement>) => {
    isPointerDown.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {
      void err;
    }

    if (!hasDragged.current && hoveredCell) {
      const { x, y } = hoveredCell;
      if (isPickingAnchor && onPickAnchor) {
        onPickAnchor(x, y);
        return;
      }
      if (grid[y]?.[x]) {
        onTogglePlaced(`${x},${y}`);
      }
    }
  };

  const onWheel = (e: RWheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const nextZoom = Math.max(0.1, Math.min(5, Math.round(zoom * zoomFactor * 20) / 20));
    onZoomChange(nextZoom);
  };

  const downloadPNG = () => {
    if (gridW === 0 || gridH === 0) return;
    const exportCanvas = document.createElement('canvas');
    const scale = Math.max(12, Math.min(32, Math.floor(1024 / Math.max(gridW, gridH))));
    exportCanvas.width = gridW * scale;
    exportCanvas.height = gridH * scale;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0d0d17';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        if (!grid[y][x]) continue;
        const bx = x * scale;
        const by = y * scale;

        ctx.fillStyle = accentColor;
        ctx.fillRect(bx, by, scale, scale);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.fillRect(bx, by, scale, Math.max(1, Math.round(scale * 0.14)));
        ctx.fillRect(bx, by, Math.max(1, Math.round(scale * 0.14)), scale);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(bx, by + scale - Math.max(1, Math.round(scale * 0.18)), scale, Math.max(1, Math.round(scale * 0.18)));
        ctx.fillRect(bx + scale - Math.max(1, Math.round(scale * 0.18)), by, Math.max(1, Math.round(scale * 0.18)), scale);
      }
    }

    const filename =
      mode === 'oval'
        ? `minecraft-oval-${width}x${height}.png`
        : mode === 'sphere' || mode === 'dome'
          ? `minecraft-${mode}-${diameter}-layer-${layer + 1}.png`
          : `minecraft-circle-${diameter}.png`;

    const a = document.createElement('a');
    a.download = filename;
    a.href = exportCanvas.toDataURL('image/png');
    a.click();
  };

  const placedCount = placed.size;

  const hoveredInfo = useMemo(() => {
    if (!hoveredCell || !grid[hoveredCell.y]?.[hoveredCell.x]) return null;
    return calculateWorldCoords(hoveredCell.x, hoveredCell.y, grid, layer, anchor, mode);
  }, [hoveredCell, grid, layer, anchor, mode]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-surface/60">
      <div ref={containerRef} className="relative min-h-0 flex-1 overflow-hidden">
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onWheel={onWheel}
          className={cn(
            'h-full w-full touch-none',
            isPickingAnchor ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing',
          )}
        />
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-line bg-panel px-3 py-2.5">
        <div className="flex items-center gap-3 text-xs text-[#a6adc8]">
          {isPickingAnchor ? (
            <span className="flex items-center gap-1.5 font-mono text-xs text-[#ffd83d] animate-pulse">
              <Crosshair size={13} className="text-[#ffd83d]" />
              Click any block on the blueprint to set as Anchor
            </span>
          ) : hoveredInfo ? (
            <span className="flex items-center gap-1.5 font-mono text-xs text-[var(--accent)]">
              <Compass size={13} className="shrink-0 text-[var(--accent)]" />
              {anchor.enabled ? (
                <span>
                  In-Game: <strong className="text-[#cdd6f4]">X: {hoveredInfo.worldX}</strong>,{' '}
                  <strong className="text-[#cdd6f4]">Y: {hoveredInfo.worldY}</strong>,{' '}
                  <strong className="text-[#cdd6f4]">Z: {hoveredInfo.worldZ}</strong>{' '}
                  <span className="text-[#6c7086]">
                    (dx: {hoveredInfo.dx >= 0 ? `+${hoveredInfo.dx}` : hoveredInfo.dx}, dz:{' '}
                    {hoveredInfo.dz >= 0 ? `+${hoveredInfo.dz}` : hoveredInfo.dz}
                    {(mode === 'sphere' || mode === 'dome') && anchor.layer !== layer
                      ? ` · Anchor on Layer ${anchor.layer + 1}`
                      : ''}
                    )
                  </span>
                </span>
              ) : (
                <span>
                  Offset:{' '}
                  <strong className="text-[#cdd6f4]">
                    X: {hoveredInfo.dx >= 0 ? `+${hoveredInfo.dx}` : hoveredInfo.dx}
                  </strong>
                  ,{' '}
                  <strong className="text-[#cdd6f4]">
                    Z: {hoveredInfo.dz >= 0 ? `+${hoveredInfo.dz}` : hoveredInfo.dz}
                  </strong>{' '}
                  <span className="text-[#6c7086]">
                    ({Math.round(Math.hypot(hoveredInfo.dx, hoveredInfo.dz) * 10) / 10} blocks from center)
                  </span>
                </span>
              )}
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Eye size={13} className="text-[var(--accent)]" />
              <span className="hidden sm:inline">Tip: Click blocks to mark them as placed while you build</span>
              <span className="sm:hidden">Click to mark placed</span>
            </span>
          )}

          {placedCount > 0 ? (
            <span className="flex items-center gap-1 rounded-none border border-line bg-surface px-2 py-0.5 text-[11px] text-[#cdd6f4]">
              <Check size={12} className="text-[var(--accent)]" />
              Placed: {placedCount}
              <button
                type="button"
                onClick={onClearPlaced}
                className="ml-1.5 text-[#f38ba8] hover:underline"
                title="Reset placed blocks"
              >
                Clear
              </button>
            </span>
          ) : null}

          {ghostGrid ? (
            <span className="hidden items-center gap-1.5 rounded-none border border-line bg-surface px-2 py-0.5 text-[11px] text-[#8fd4ff] sm:flex">
              <span className="inline-block h-2.5 w-2.5 rounded-none border border-[rgba(140,190,245,0.8)] bg-[rgba(70,95,130,0.8)]" />
              Layer Below (Ghost)
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={fitToScreen}
            title="Reset View / Fit to Screen"
            className="mc-icon-btn h-8 rounded-none px-2.5 text-xs text-[#a6adc8] hover:text-[#cdd6f4]"
          >
            <Maximize2 size={13} />
            <span className="ml-1 hidden md:inline">Fit View</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setPan({ x: 0, y: 0 });
              onZoomChange(1);
            }}
            title="Reset to 100% Zoom"
            className="mc-icon-btn h-8 rounded-none px-2.5 text-xs text-[#a6adc8] hover:text-[#cdd6f4]"
          >
            <RotateCcw size={13} />
            <span className="ml-1 hidden md:inline">100%</span>
          </button>
          <button
            type="button"
            onClick={downloadPNG}
            title="Download blueprint as PNG"
            className="mc-btn flex h-8 items-center gap-1.5 rounded-none border-[var(--accent)]/40 bg-surface px-3 text-xs text-[var(--accent)] transition-colors hover:border-[var(--accent)]"
          >
            <Download size={13} />
            Download PNG
          </button>
        </div>
      </div>
    </div>
  );
}
