import {
  calculateStacks,
  calculateStats,
  calculateWorldCoords,
  countGridBlocks,
  generateCircleGrid,
  generateDomeLayerGrid,
  generateOvalGrid,
  generateShapeGrid,
  generateSphereLayerGrid,
  getTotalLayers,
} from '../rasterize';

describe('rasterize engine', () => {
  test('matches reference counts for Circle 60', () => {
    const grid = generateCircleGrid(60, false);
    expect(countGridBlocks(grid)).toBe(184);

    const stats = calculateStats({ mode: 'circle', diameter: 60, width: 60, height: 60, filled: false }, grid);
    expect(stats.blockCount).toBe(184);
    expect(stats.diameter).toBe(60);
    expect(stats.radius).toBe(30.0);
    expect(stats.circumference).toBe(188.5);
  });

  test('matches reference counts for Oval 20x20', () => {
    const grid = generateOvalGrid(20, 20, false);
    expect(countGridBlocks(grid)).toBe(56);

    const stats = calculateStats({ mode: 'oval', diameter: 20, width: 20, height: 20, filled: false }, grid);
    expect(stats.blockCount).toBe(56);
    expect(stats.width).toBe(20);
    expect(stats.height).toBe(20);
  });

  test('matches reference counts for Sphere 60', () => {
    const layer16Grid = generateSphereLayerGrid(60, 16, false);
    expect(countGridBlocks(layer16Grid)).toBe(188);

    const stats = calculateStats({ mode: 'sphere', diameter: 60, width: 60, height: 60, filled: false }, layer16Grid);
    expect(stats.blockCount).toBe(188);
    expect(stats.totalBlockCount).toBe(10896);
    expect(getTotalLayers('sphere', 60)).toBe(60);
  });

  test('matches reference counts for Dome 60', () => {
    const layer0Grid = generateDomeLayerGrid(60, 0, false);
    expect(countGridBlocks(layer0Grid)).toBe(88);

    const stats = calculateStats({ mode: 'dome', diameter: 60, width: 60, height: 60, filled: false }, layer0Grid);
    expect(stats.blockCount).toBe(88);
    expect(stats.totalBlockCount).toBe(5448);
    expect(getTotalLayers('dome', 60)).toBe(30);
  });

  test('handles filled mode correctly', () => {
    const outline = generateCircleGrid(20, false);
    const filled = generateCircleGrid(20, true);
    expect(countGridBlocks(filled)).toBeGreaterThan(countGridBlocks(outline));
  });

  test('preserves horizontal and vertical symmetry for even diameters', () => {
    const grid = generateCircleGrid(20, false);
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 20; x++) {
        expect(grid[y][x]).toBe(grid[y][19 - x]);
        expect(grid[y][x]).toBe(grid[19 - y][x]);
      }
    }
  });

  test('preserves horizontal and vertical symmetry for odd diameters', () => {
    const grid = generateCircleGrid(21, false);
    for (let y = 0; y < 21; y++) {
      for (let x = 0; x < 21; x++) {
        expect(grid[y][x]).toBe(grid[y][20 - x]);
        expect(grid[y][x]).toBe(grid[20 - y][x]);
      }
    }
  });

  test('handles minimal diameter boundary conditions', () => {
    const d1 = generateShapeGrid({ mode: 'circle', diameter: 1, width: 1, height: 1, layer: 0, filled: false });
    expect(d1.length).toBe(1);
    expect(countGridBlocks(d1)).toBe(1);

    const d2 = generateShapeGrid({ mode: 'circle', diameter: 2, width: 2, height: 2, layer: 0, filled: false });
    expect(d2.length).toBe(2);
    expect(countGridBlocks(d2)).toBe(4);
  });

  test('correctly calculates stacks and shulker box totals', () => {
    const s1 = calculateStacks(184);
    expect(s1.stacks).toBe(2);
    expect(s1.remainder).toBe(56);
    expect(s1.shulkers).toBe(0.1);

    const s2 = calculateStacks(10896);
    expect(s2.stacks).toBe(170);
    expect(s2.remainder).toBe(16);
    expect(s2.shulkers).toBe(6.3);
  });

  test('correctly calculates in-game world coordinates based on anchor', () => {
    const anchor = {
      enabled: true,
      x: 1000,
      y: 64,
      z: -500,
      layer: 0,
      preset: 'center' as const,
      customGridX: null,
      customGridY: null,
    };
    const grid20 = generateCircleGrid(20, false);
    const coords = calculateWorldCoords(0, 0, grid20, 5, anchor, 'sphere');
    expect(coords.worldX).toBe(990);
    expect(coords.worldZ).toBe(-510);
    expect(coords.worldY).toBe(69);

    const northAnchor = { ...anchor, preset: 'north' as const };
    const northCoords = calculateWorldCoords(10, 0, grid20, 0, northAnchor, 'circle');
    expect(northCoords.worldX).toBe(1000);
    expect(northCoords.worldZ).toBe(-500);
  });
});
