import type { ShapeConfig, ShapeMode, ShapeStats, StackBreakdown, WorldAnchor } from '../types';

export function generateCircleGrid(diameter: number, filled: boolean): boolean[][] {
  const d = Math.max(1, Math.floor(diameter));
  const grid: boolean[][] = Array.from({ length: d }, () => Array(d).fill(false));
  const radius = d / 2;
  const center = radius - 0.5;

  for (let y = 0; y < d; y++) {
    for (let x = 0; x < d; x++) {
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (filled) {
        if (dist <= radius) grid[y][x] = true;
      } else {
        if (dist <= radius && dist > radius - 1) grid[y][x] = true;
      }
    }
  }
  return grid;
}

export function generateOvalGrid(width: number, height: number, filled: boolean): boolean[][] {
  const w = Math.max(1, Math.floor(width));
  const h = Math.max(1, Math.floor(height));
  const grid: boolean[][] = Array.from({ length: h }, () => Array(w).fill(false));
  const rx = w / 2;
  const ry = h / 2;
  const cx = rx - 0.5;
  const cy = ry - 0.5;

  const isInside = (x: number, y: number): boolean => {
    const nx = (x - cx) / rx;
    const ny = (y - cy) / ry;
    return nx * nx + ny * ny <= 1;
  };

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (isInside(x, y)) {
        if (
          filled ||
          !isInside(x - 1, y) ||
          !isInside(x + 1, y) ||
          !isInside(x, y - 1) ||
          !isInside(x, y + 1)
        ) {
          grid[y][x] = true;
        }
      }
    }
  }
  return grid;
}

export function generateSphereLayerGrid(diameter: number, layer: number, filled: boolean): boolean[][] {
  const d = Math.max(1, Math.floor(diameter));
  const radius = d / 2;
  const center = radius - 0.5;
  const z = layer - center;
  const radSq = radius * radius - z * z;
  if (radSq <= 0) return Array.from({ length: d }, () => Array(d).fill(false));

  const layerRadius = Math.sqrt(radSq);
  const grid: boolean[][] = Array.from({ length: d }, () => Array(d).fill(false));

  for (let y = 0; y < d; y++) {
    for (let x = 0; x < d; x++) {
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (filled) {
        if (dist <= layerRadius) grid[y][x] = true;
      } else {
        const innerRadSq = (radius - 1) * (radius - 1) - z * z;
        const innerRadius = innerRadSq > 0 ? Math.sqrt(innerRadSq) : 0;
        if (dist <= layerRadius && dist > innerRadius) grid[y][x] = true;
      }
    }
  }
  return grid;
}

export function generateDomeLayerGrid(diameter: number, layer: number, filled: boolean): boolean[][] {
  const d = Math.max(1, Math.floor(diameter));
  return generateSphereLayerGrid(d, layer, filled);
}

export function generateShapeGrid(config: Pick<ShapeConfig, 'mode' | 'diameter' | 'width' | 'height' | 'layer' | 'filled'>): boolean[][] {
  switch (config.mode) {
    case 'circle':
      return generateCircleGrid(config.diameter, config.filled);
    case 'oval':
      return generateOvalGrid(config.width, config.height, config.filled);
    case 'sphere':
      return generateSphereLayerGrid(config.diameter, Math.min(config.layer, config.diameter - 1), config.filled);
    case 'dome': {
      const total = Math.ceil(config.diameter / 2);
      return generateDomeLayerGrid(config.diameter, Math.min(config.layer, total - 1), config.filled);
    }
  }
}

export function countGridBlocks(grid: boolean[][]): number {
  let count = 0;
  for (let y = 0; y < grid.length; y++) {
    const row = grid[y];
    for (let x = 0; x < row.length; x++) {
      if (row[x]) count++;
    }
  }
  return count;
}

export function getTotalLayers(mode: ShapeMode, diameter: number): number {
  const d = Math.max(1, Math.floor(diameter));
  if (mode === 'sphere') return d;
  if (mode === 'dome') return Math.ceil(d / 2);
  return 1;
}

const blockCountCache = new Map<string, number>();

export function calculateTotal3DBlocks(mode: ShapeMode, diameter: number, filled: boolean, activeLayerBlocks: number): number {
  const d = Math.max(1, Math.floor(diameter));
  if (mode === 'circle' || mode === 'oval') return activeLayerBlocks;

  const cacheKey = `${mode}:${d}:${filled}`;
  const cached = blockCountCache.get(cacheKey);
  if (cached !== undefined) return cached;

  let total = 0;
  if (mode === 'sphere') {
    const half = Math.ceil(d / 2);
    for (let layer = 0; layer < half; layer++) {
      const count = countGridBlocks(generateSphereLayerGrid(d, layer, filled));
      const opposite = d - 1 - layer;
      if (layer === opposite) {
        total += count;
      } else {
        total += count * 2;
      }
    }
  } else if (mode === 'dome') {
    const totalLayers = Math.ceil(d / 2);
    for (let layer = 0; layer < totalLayers; layer++) {
      total += countGridBlocks(generateDomeLayerGrid(d, layer, filled));
    }
  } else {
    total = activeLayerBlocks;
  }

  if (blockCountCache.size > 200) blockCountCache.clear();
  blockCountCache.set(cacheKey, total);
  return total;
}

export function calculateCircumference(width: number, height: number): number {
  if (width === height) return Math.PI * width;
  const a = width / 2;
  const b = height / 2;
  return Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
}

export function calculateStacks(count: number): StackBreakdown {
  const stacks = Math.floor(count / 64);
  const remainder = count % 64;
  const shulkers = Math.round((count / (64 * 27)) * 10) / 10;
  return { stacks, remainder, shulkers };
}

export function getAnchorGridPoint(
  grid: boolean[][],
  anchor: WorldAnchor,
): { gx: number; gy: number } {
  const gridH = grid.length;
  const gridW = grid[0]?.length ?? 0;
  const cx = Math.floor(gridW / 2);
  const cy = Math.floor(gridH / 2);

  if (gridW === 0 || gridH === 0) return { gx: 0, gy: 0 };

  switch (anchor.preset) {
    case 'center':
      return { gx: cx, gy: cy };
    case 'north': {
      for (let y = 0; y < gridH; y++) {
        if (grid[y]?.[cx]) return { gx: cx, gy: y };
      }
      for (let y = 0; y < gridH; y++) {
        for (let x = 0; x < gridW; x++) {
          if (grid[y][x]) return { gx: x, gy: y };
        }
      }
      return { gx: cx, gy: 0 };
    }
    case 'south': {
      for (let y = gridH - 1; y >= 0; y--) {
        if (grid[y]?.[cx]) return { gx: cx, gy: y };
      }
      for (let y = gridH - 1; y >= 0; y--) {
        for (let x = 0; x < gridW; x++) {
          if (grid[y][x]) return { gx: x, gy: y };
        }
      }
      return { gx: cx, gy: Math.max(0, gridH - 1) };
    }
    case 'west': {
      for (let x = 0; x < gridW; x++) {
        if (grid[cy]?.[x]) return { gx: x, gy: cy };
      }
      for (let x = 0; x < gridW; x++) {
        for (let y = 0; y < gridH; y++) {
          if (grid[y][x]) return { gx: x, gy: y };
        }
      }
      return { gx: 0, gy: cy };
    }
    case 'east': {
      for (let x = gridW - 1; x >= 0; x--) {
        if (grid[cy]?.[x]) return { gx: x, gy: cy };
      }
      for (let x = gridW - 1; x >= 0; x--) {
        for (let y = 0; y < gridH; y++) {
          if (grid[y][x]) return { gx: x, gy: y };
        }
      }
      return { gx: Math.max(0, gridW - 1), gy: cy };
    }
    case 'custom': {
      if (
        anchor.customGridX !== null &&
        anchor.customGridY !== null &&
        grid[anchor.customGridY]?.[anchor.customGridX]
      ) {
        return { gx: anchor.customGridX, gy: anchor.customGridY };
      }
      return { gx: cx, gy: cy };
    }
  }
}

export function calculateWorldCoords(
  gridX: number,
  gridY: number,
  grid: boolean[][],
  layer: number,
  anchor: WorldAnchor,
  mode: ShapeMode,
): { worldX: number; worldY: number; worldZ: number; dx: number; dz: number } {
  const { gx: anchorGx, gy: anchorGy } = getAnchorGridPoint(grid, anchor);
  const dx = gridX - anchorGx;
  const dz = gridY - anchorGy;
  const worldX = anchor.x + dx;
  const worldZ = anchor.z + dz;
  const deltaY = mode === 'sphere' || mode === 'dome' ? layer - anchor.layer : 0;
  const worldY = anchor.y + deltaY;
  return { worldX, worldY, worldZ, dx, dz };
}

export function calculateStats(
  config: Pick<ShapeConfig, 'mode' | 'diameter' | 'width' | 'height' | 'filled'>,
  grid: boolean[][],
): ShapeStats {
  const blockCount = countGridBlocks(grid);
  const isOval = config.mode === 'oval';
  const width = isOval ? config.width : config.diameter;
  const height = isOval ? config.height : config.diameter;
  const totalBlockCount = calculateTotal3DBlocks(config.mode, config.diameter, config.filled, blockCount);

  return {
    blockCount,
    totalBlockCount,
    layerStacks: calculateStacks(blockCount),
    totalStacks: calculateStacks(totalBlockCount),
    diameter: isOval ? undefined : config.diameter,
    width: isOval ? config.width : undefined,
    height: isOval ? config.height : undefined,
    radius: isOval ? Math.round((Math.max(width, height) / 2) * 10) / 10 : Math.round((config.diameter / 2) * 10) / 10,
    circumference: Math.round(calculateCircumference(width, height) * 10) / 10,
  };
}
