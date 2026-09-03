import type {
  BlockCoords,
  ChunkCoords,
  DimensionCoordinateSet,
  DimensionType,
  DualCoordinateResult,
  PortalLinkingInfo,
  RegionCoords,
} from '../types';

export function blockToChunk(x: number, y: number, z: number): ChunkCoords {
  const safeX = Number.isFinite(x) ? Math.round(x) : 0;
  const safeY = Number.isFinite(y) ? Math.round(y) : 0;
  const safeZ = Number.isFinite(z) ? Math.round(z) : 0;

  const chunkX = Math.floor(safeX / 16);
  const chunkY = Math.floor(safeY / 16);
  const chunkZ = Math.floor(safeZ / 16);

  const inChunkX = ((safeX % 16) + 16) % 16;
  const inChunkY = ((safeY % 16) + 16) % 16;
  const inChunkZ = ((safeZ % 16) + 16) % 16;

  return {
    x: chunkX,
    y: chunkY,
    z: chunkZ,
    inChunkX,
    inChunkY,
    inChunkZ,
  };
}

export function chunkToRegion(
  chunkX: number,
  chunkZ: number,
  dimension: DimensionType,
): RegionCoords {
  const safeChunkX = Number.isFinite(chunkX) ? Math.round(chunkX) : 0;
  const safeChunkZ = Number.isFinite(chunkZ) ? Math.round(chunkZ) : 0;

  const regionX = Math.floor(safeChunkX / 32);
  const regionZ = Math.floor(safeChunkZ / 32);

  const inRegionChunkX = ((safeChunkX % 32) + 32) % 32;
  const inRegionChunkZ = ((safeChunkZ % 32) + 32) % 32;

  const filename = `r.${regionX}.${regionZ}.mca`;
  const serverPath =
    dimension === 'overworld'
      ? `world/region/${filename}`
      : `world_nether/DIM-1/region/${filename}`;
  const singleplayerPath =
    dimension === 'overworld'
      ? `saves/<world>/region/${filename}`
      : `saves/<world>/DIM-1/region/${filename}`;

  return {
    x: regionX,
    z: regionZ,
    filename,
    serverPath,
    singleplayerPath,
    inRegionChunkX,
    inRegionChunkZ,
  };
}

export function chunkToBlock(
  chunkX: number,
  chunkY: number,
  chunkZ: number,
  inChunkX = 0,
  inChunkY = 0,
  inChunkZ = 0,
): BlockCoords {
  return {
    x: chunkX * 16 + inChunkX,
    y: chunkY * 16 + inChunkY,
    z: chunkZ * 16 + inChunkZ,
  };
}

export function regionToBlock(
  regionX: number,
  regionZ: number,
  inRegionChunkX = 0,
  inRegionChunkZ = 0,
  inChunkX = 0,
  inChunkZ = 0,
  y = 64,
): BlockCoords {
  const chunkX = regionX * 32 + inRegionChunkX;
  const chunkZ = regionZ * 32 + inRegionChunkZ;
  return {
    x: chunkX * 16 + inChunkX,
    y,
    z: chunkZ * 16 + inChunkZ,
  };
}

export function overworldToNether(block: BlockCoords): BlockCoords {
  return {
    x: Math.floor(block.x / 8),
    y: block.y,
    z: Math.floor(block.z / 8),
  };
}

export function netherToOverworld(block: BlockCoords): BlockCoords {
  return {
    x: block.x * 8,
    y: block.y,
    z: block.z * 8,
  };
}

export function generateTpCommand(dimension: DimensionType, block: BlockCoords): string {
  if (dimension === 'nether') {
    return `/execute in minecraft:the_nether run tp @s ${block.x} ${block.y} ${block.z}`;
  }
  return `/tp @s ${block.x} ${block.y} ${block.z}`;
}

export function buildDimensionCoordinateSet(
  dimension: DimensionType,
  block: BlockCoords,
): DimensionCoordinateSet {
  const chunk = blockToChunk(block.x, block.y, block.z);
  const region = chunkToRegion(chunk.x, chunk.z, dimension);
  const tpCommand = generateTpCommand(dimension, block);

  return {
    dimension,
    block,
    chunk,
    region,
    tpCommand,
  };
}

export function calculatePortalLinking(
  overworldBlock: BlockCoords,
  netherBlock: BlockCoords,
): PortalLinkingInfo {
  return {
    netherSearchBox: {
      minX: netherBlock.x - 128,
      maxX: netherBlock.x + 128,
      minZ: netherBlock.z - 128,
      maxZ: netherBlock.z + 128,
    },
    overworldSearchBox: {
      minX: overworldBlock.x - 128,
      maxX: overworldBlock.x + 128,
      minZ: overworldBlock.z - 128,
      maxZ: overworldBlock.z + 128,
    },
  };
}

export function calculateDualCoordinates(
  sourceDimension: DimensionType,
  block: BlockCoords,
): DualCoordinateResult {
  const overworldBlock =
    sourceDimension === 'overworld' ? block : netherToOverworld(block);
  const netherBlock =
    sourceDimension === 'nether' ? block : overworldToNether(block);

  const overworld = buildDimensionCoordinateSet('overworld', overworldBlock);
  const nether = buildDimensionCoordinateSet('nether', netherBlock);
  const portalLinking = calculatePortalLinking(overworldBlock, netherBlock);

  return {
    overworld,
    nether,
    portalLinking,
  };
}
