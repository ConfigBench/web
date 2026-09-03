import {
  calculateChunks,
  calculateDimensionStats,
  calculateRegionFiles,
  calculateWorldSize,
  formatBytes,
  formatDuration,
  generateChunkyCommands,
  generateWorldBorderCommand,
  normalizeInputToRadius,
} from '../calculator';
import { MINECRAFT_VERSIONS } from '../versions';
import type { WorldSizeConfig } from '../../types';

describe('calculateChunks', () => {
  it('returns 0 for non-positive radius', () => {
    expect(calculateChunks(0, 'square')).toBe(0);
    expect(calculateChunks(-50, 'square')).toBe(0);
    expect(calculateChunks(0, 'circle')).toBe(0);
  });

  it('calculates square chunks accurately', () => {
    expect(calculateChunks(8, 'square')).toBe(1);
    expect(calculateChunks(16, 'square')).toBe(4);
    expect(calculateChunks(10000, 'square')).toBe(1562500);
  });

  it('calculates circular chunks with pi/4 ratio', () => {
    const square = calculateChunks(10000, 'square');
    const circle = calculateChunks(10000, 'circle');
    expect(circle).toBe(Math.round(square * (Math.PI / 4)));
    expect(circle).toBeLessThan(square);
  });
});

describe('calculateRegionFiles', () => {
  it('calculates region file counts for square and circle', () => {
    expect(calculateRegionFiles(256, 'square')).toBe(1);
    expect(calculateRegionFiles(512, 'square')).toBe(4);
    expect(calculateRegionFiles(10000, 'square')).toBe(1600);
    expect(calculateRegionFiles(10000, 'circle')).toBe(1257);
  });
});

describe('formatBytes', () => {
  it('formats byte quantities correctly', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(500)).toBe('500 B');
    expect(formatBytes(1024)).toBe('1.00 KB');
    expect(formatBytes(1024 * 1024 * 50)).toBe('50.00 MB');
    expect(formatBytes(1024 * 1024 * 1024 * 21.2)).toBe('21.20 GB');
    expect(formatBytes(1024 * 1024 * 1024 * 1024 * 2.5)).toBe('2.50 TB');
  });
});

describe('formatDuration', () => {
  it('formats seconds into readable strings', () => {
    expect(formatDuration(45)).toBe('45s');
    expect(formatDuration(150)).toBe('2m 30s');
    expect(formatDuration(3665)).toBe('1h 1m');
    expect(formatDuration(90000)).toBe('1d 1h');
  });
});

describe('normalizeInputToRadius', () => {
  it('converts diameter and radius inputs', () => {
    expect(normalizeInputToRadius(10000, 'radius')).toBe(10000);
    expect(normalizeInputToRadius(20000, 'diameter')).toBe(10000);
    expect(normalizeInputToRadius(-10, 'radius')).toBe(0);
  });
});

describe('calculateDimensionStats and calculateWorldSize', () => {
  it('calculates dimension stats for 1.21 Overworld', () => {
    const stats = calculateDimensionStats('overworld', 10000, 'square', '1.21', false);
    expect(stats.chunks).toBe(1562500);
    expect(stats.gigabytes).toBeGreaterThan(16);
    expect(stats.gigabytes).toBeLessThan(18);
  });

  it('calculates total world size across all dimensions', () => {
    const config: WorldSizeConfig = {
      version: '1.21',
      measurement: 'radius',
      shape: 'square',
      includeEntitiesAndPoi: false,
      radii: {
        overworld: 10000,
        nether: 1250,
        end: 10000,
      },
    };

    const result = calculateWorldSize(config);
    expect(result.totalChunks).toBe(1562500 + 24414 + 1562500);
    expect(result.totalGigabytes).toBeGreaterThan(20);
    expect(result.recommendedDiskGB).toBeGreaterThan(result.totalGigabytes);
    expect(result.estimatedPregenSeconds.normal).toBeGreaterThan(0);
  });

  it('applies entity and poi overhead when enabled for 1.14+', () => {
    const withoutPoi = calculateDimensionStats('overworld', 5000, 'square', '1.21', false);
    const withPoi = calculateDimensionStats('overworld', 5000, 'square', '1.21', true);
    expect(withPoi.bytes).toBeGreaterThan(withoutPoi.bytes);
    expect(withPoi.bytes / withoutPoi.bytes).toBeCloseTo(1.08, 2);
  });
});

describe('command generation', () => {
  it('generates proper Chunky and WorldBorder commands', () => {
    const chunkyOverworld = generateChunkyCommands('overworld', 10000, 'square');
    expect(chunkyOverworld).toEqual([
      '/chunky world world',
      '/chunky shape square',
      '/chunky radius 10000',
      '/chunky start',
    ]);

    const chunkyNether = generateChunkyCommands('nether', 1250, 'circle');
    expect(chunkyNether).toEqual([
      '/chunky world world_nether',
      '/chunky shape circle',
      '/chunky radius 1250',
      '/chunky start',
    ]);

    const border = generateWorldBorderCommand(5000);
    expect(border).toBe('/worldborder set 10000');
  });
});

describe('MINECRAFT_VERSIONS', () => {
  it('contains comprehensive versions from 1.0 to 26.2', () => {
    expect(MINECRAFT_VERSIONS.length).toBeGreaterThanOrEqual(23);
    const drop262 = MINECRAFT_VERSIONS.find((v) => v.id === '26.2');
    const modern = MINECRAFT_VERSIONS.find((v) => v.id === '1.21');
    const legacy = MINECRAFT_VERSIONS.find((v) => v.id === '1.0');
    expect(drop262).toBeDefined();
    expect(modern).toBeDefined();
    expect(legacy).toBeDefined();
    expect(drop262?.height).toBe(384);
    expect(modern?.height).toBe(384);
    expect(legacy?.height).toBe(128);
  });
});
