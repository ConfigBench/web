import {
  blockToChunk,
  calculateDualCoordinates,
  calculatePortalLinking,
  chunkToBlock,
  chunkToRegion,
  generateTpCommand,
  netherToOverworld,
  overworldToNether,
  regionToBlock,
} from '../converter';

describe('blockToChunk', () => {
  it('converts positive origin and boundaries', () => {
    const origin = blockToChunk(0, 64, 0);
    expect(origin.x).toBe(0);
    expect(origin.y).toBe(4);
    expect(origin.z).toBe(0);
    expect(origin.inChunkX).toBe(0);
    expect(origin.inChunkZ).toBe(0);

    const edge = blockToChunk(15, 64, 15);
    expect(edge.x).toBe(0);
    expect(edge.z).toBe(0);
    expect(edge.inChunkX).toBe(15);
    expect(edge.inChunkZ).toBe(15);

    const next = blockToChunk(16, 64, 16);
    expect(next.x).toBe(1);
    expect(next.z).toBe(1);
    expect(next.inChunkX).toBe(0);
    expect(next.inChunkZ).toBe(0);
  });

  it('accurately floors negative coordinates per Minecraft mechanics', () => {
    const negOne = blockToChunk(-1, 64, -1);
    expect(negOne.x).toBe(-1);
    expect(negOne.z).toBe(-1);
    expect(negOne.inChunkX).toBe(15);
    expect(negOne.inChunkZ).toBe(15);

    const negSixteen = blockToChunk(-16, 64, -16);
    expect(negSixteen.x).toBe(-1);
    expect(negSixteen.z).toBe(-1);
    expect(negSixteen.inChunkX).toBe(0);
    expect(negSixteen.inChunkZ).toBe(0);

    const negSeventeen = blockToChunk(-17, 64, -17);
    expect(negSeventeen.x).toBe(-2);
    expect(negSeventeen.z).toBe(-2);
    expect(negSeventeen.inChunkX).toBe(15);
    expect(negSeventeen.inChunkZ).toBe(15);
  });
});

describe('chunkToRegion', () => {
  it('identifies region coordinates and MCA filenames', () => {
    const r0 = chunkToRegion(0, 0, 'overworld');
    expect(r0.x).toBe(0);
    expect(r0.z).toBe(0);
    expect(r0.inRegionChunkX).toBe(0);
    expect(r0.inRegionChunkZ).toBe(0);
    expect(r0.filename).toBe('r.0.0.mca');
    expect(r0.serverPath).toBe('world/region/r.0.0.mca');

    const rEnd = chunkToRegion(31, 31, 'overworld');
    expect(rEnd.x).toBe(0);
    expect(rEnd.z).toBe(0);
    expect(rEnd.inRegionChunkX).toBe(31);
    expect(rEnd.inRegionChunkZ).toBe(31);

    const rNext = chunkToRegion(32, 32, 'overworld');
    expect(rNext.x).toBe(1);
    expect(rNext.z).toBe(1);
    expect(rNext.inRegionChunkX).toBe(0);
    expect(rNext.inRegionChunkZ).toBe(0);
    expect(rNext.filename).toBe('r.1.1.mca');
  });

  it('handles negative region boundaries', () => {
    const negChunk = chunkToRegion(-1, -1, 'overworld');
    expect(negChunk.x).toBe(-1);
    expect(negChunk.z).toBe(-1);
    expect(negChunk.inRegionChunkX).toBe(31);
    expect(negChunk.inRegionChunkZ).toBe(31);
    expect(negChunk.filename).toBe('r.-1.-1.mca');

    const negBoundary = chunkToRegion(-32, -32, 'overworld');
    expect(negBoundary.x).toBe(-1);
    expect(negBoundary.z).toBe(-1);
    expect(negBoundary.inRegionChunkX).toBe(0);
    expect(negBoundary.inRegionChunkZ).toBe(0);

    const negNext = chunkToRegion(-33, -33, 'overworld');
    expect(negNext.x).toBe(-2);
    expect(negNext.z).toBe(-2);
    expect(negNext.inRegionChunkX).toBe(31);
    expect(negNext.inRegionChunkZ).toBe(31);
    expect(negNext.filename).toBe('r.-2.-2.mca');
  });

  it('formats Nether region paths correctly', () => {
    const nether = chunkToRegion(5, 5, 'nether');
    expect(nether.serverPath).toBe('world_nether/DIM-1/region/r.0.0.mca');
    expect(nether.singleplayerPath).toBe('saves/<world>/DIM-1/region/r.0.0.mca');
  });
});

describe('chunkToBlock and regionToBlock', () => {
  it('reconstructs block coordinates from chunk offsets', () => {
    const block = chunkToBlock(10, 4, -5, 7, 0, 12);
    expect(block.x).toBe(10 * 16 + 7);
    expect(block.y).toBe(64);
    expect(block.z).toBe(-5 * 16 + 12);
  });

  it('reconstructs block coordinates from region offsets', () => {
    const block = regionToBlock(1, -2, 4, 10, 8, 2, 70);
    const chunkX = 1 * 32 + 4;
    const chunkZ = -2 * 32 + 10;
    expect(block.x).toBe(chunkX * 16 + 8);
    expect(block.y).toBe(70);
    expect(block.z).toBe(chunkZ * 16 + 2);
  });
});

describe('overworldToNether and netherToOverworld', () => {
  it('converts with 8:1 scale ratio', () => {
    const ow = { x: 800, y: 64, z: -1600 };
    const nether = overworldToNether(ow);
    expect(nether.x).toBe(100);
    expect(nether.y).toBe(64);
    expect(nether.z).toBe(-200);

    const backToOw = netherToOverworld(nether);
    expect(backToOw.x).toBe(800);
    expect(backToOw.y).toBe(64);
    expect(backToOw.z).toBe(-1600);
  });

  it('properly floors negative coordinates across 8:1 conversion', () => {
    const ow = { x: -1, y: 64, z: -9 };
    const nether = overworldToNether(ow);
    expect(nether.x).toBe(-1);
    expect(nether.z).toBe(-2);
  });
});

describe('generateTpCommand', () => {
  it('creates commands with correct dimension selectors', () => {
    const owCmd = generateTpCommand('overworld', { x: 100, y: 70, z: -50 });
    expect(owCmd).toBe('/tp @s 100 70 -50');

    const netherCmd = generateTpCommand('nether', { x: 12, y: 70, z: -6 });
    expect(netherCmd).toBe('/execute in minecraft:the_nether run tp @s 12 70 -6');
  });
});

describe('calculateDualCoordinates', () => {
  it('calculates both dimensions synchronously from Overworld', () => {
    const res = calculateDualCoordinates('overworld', { x: 1600, y: 64, z: 3200 });
    expect(res.overworld.block.x).toBe(1600);
    expect(res.overworld.chunk.x).toBe(100);
    expect(res.overworld.region.filename).toBe('r.3.6.mca');

    expect(res.nether.block.x).toBe(200);
    expect(res.nether.chunk.x).toBe(12);
    expect(res.nether.region.filename).toBe('r.0.0.mca');

    expect(res.portalLinking.netherSearchBox.minX).toBe(200 - 128);
    expect(res.portalLinking.netherSearchBox.maxX).toBe(200 + 128);
  });

  it('calculates both dimensions synchronously from Nether', () => {
    const res = calculateDualCoordinates('nether', { x: 50, y: 64, z: -100 });
    expect(res.nether.block.x).toBe(50);
    expect(res.overworld.block.x).toBe(400);
    expect(res.overworld.chunk.x).toBe(25);
  });

  it('calculates portal linking search radius', () => {
    const linking = calculatePortalLinking({ x: 800, y: 64, z: 800 }, { x: 100, y: 64, z: 100 });
    expect(linking.netherSearchBox.minX).toBe(100 - 128);
    expect(linking.netherSearchBox.maxX).toBe(100 + 128);
    expect(linking.overworldSearchBox.minZ).toBe(800 - 128);
    expect(linking.overworldSearchBox.maxZ).toBe(800 + 128);
  });
});
