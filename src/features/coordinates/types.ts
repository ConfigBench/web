export type DimensionType = 'overworld' | 'nether';

export interface BlockCoords {
  x: number;
  y: number;
  z: number;
}

export interface ChunkCoords {
  x: number;
  y: number;
  z: number;
  inChunkX: number;
  inChunkY: number;
  inChunkZ: number;
}

export interface RegionCoords {
  x: number;
  z: number;
  filename: string;
  serverPath: string;
  singleplayerPath: string;
  inRegionChunkX: number;
  inRegionChunkZ: number;
}

export interface DimensionCoordinateSet {
  dimension: DimensionType;
  block: BlockCoords;
  chunk: ChunkCoords;
  region: RegionCoords;
  tpCommand: string;
}

export interface PortalLinkingInfo {
  netherSearchBox: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  overworldSearchBox: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
}

export interface DualCoordinateResult {
  overworld: DimensionCoordinateSet;
  nether: DimensionCoordinateSet;
  portalLinking: PortalLinkingInfo;
}
