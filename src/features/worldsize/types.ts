export type DimensionId = 'overworld' | 'nether' | 'end';

export type ShapeType = 'square' | 'circle';

export type MeasurementType = 'radius' | 'diameter';

export interface VersionInfo {
  id: string;
  name: string;
  era: string;
  height: number;
  chunkSizes: Record<DimensionId, number>;
}

export interface WorldSizeConfig {
  version: string;
  measurement: MeasurementType;
  shape: ShapeType;
  includeEntitiesAndPoi: boolean;
  radii: Record<DimensionId, number>;
}

export interface DimensionStats {
  dimension: DimensionId;
  radius: number;
  diameter: number;
  chunks: number;
  regionFiles: number;
  bytes: number;
  kilobytes: number;
  megabytes: number;
  gigabytes: number;
  formattedSize: string;
}

export interface WorldSizeResult {
  dimensions: Record<DimensionId, DimensionStats>;
  totalChunks: number;
  totalRegionFiles: number;
  totalBytes: number;
  totalGigabytes: number;
  formattedTotalSize: string;
  recommendedDiskGB: number;
  estimatedPregenSeconds: {
    slow: number;
    normal: number;
    fast: number;
  };
}
