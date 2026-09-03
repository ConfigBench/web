import type {
  DimensionId,
  DimensionStats,
  MeasurementType,
  ShapeType,
  WorldSizeConfig,
  WorldSizeResult,
} from '../types';
import { getVersionInfo } from './versions';

export function calculateChunks(radius: number, shape: ShapeType): number {
  if (radius <= 0) return 0;
  const diameter = radius * 2;
  const axisChunks = diameter / 16;
  const squareChunks = axisChunks * axisChunks;
  if (shape === 'circle') {
    return Math.round(squareChunks * (Math.PI / 4));
  }
  return Math.round(squareChunks);
}

export function calculateRegionFiles(radius: number, shape: ShapeType): number {
  if (radius <= 0) return 0;
  const diameter = radius * 2;
  const axisRegions = Math.ceil(diameter / 512);
  const squareRegions = axisRegions * axisRegions;
  if (shape === 'circle') {
    return Math.max(1, Math.round(squareRegions * (Math.PI / 4)));
  }
  return squareRegions;
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const dm = 2;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  if (i >= sizes.length) return `${(bytes / Math.pow(k, sizes.length - 1)).toFixed(dm)} PB`;
  if (i <= 0) return `${bytes} B`;
  return `${(bytes / Math.pow(k, i)).toFixed(dm)} ${sizes[i]}`;
}

export function formatNumberWithCommas(value: number): string {
  return value.toLocaleString('en-US');
}

export function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${Math.round(totalSeconds)}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  if (minutes < 60) return `${minutes}m ${seconds}s`;
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  if (hours < 24) return `${hours}h ${remMinutes}m`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return `${days}d ${remHours}h`;
}

export function calculateDimensionStats(
  dimension: DimensionId,
  radius: number,
  shape: ShapeType,
  versionId: string,
  includeEntitiesAndPoi: boolean,
): DimensionStats {
  const version = getVersionInfo(versionId);
  const chunks = calculateChunks(radius, shape);
  const regionFiles = calculateRegionFiles(radius, shape);
  let kibPerChunk = version.chunkSizes[dimension];
  if (includeEntitiesAndPoi && Number.parseFloat(version.id) >= 1.14) {
    kibPerChunk *= 1.08;
  }
  const kilobytes = chunks * kibPerChunk;
  const bytes = kilobytes * 1024;
  const megabytes = kilobytes / 1024;
  const gigabytes = megabytes / 1024;

  return {
    dimension,
    radius,
    diameter: radius * 2,
    chunks,
    regionFiles,
    bytes,
    kilobytes,
    megabytes,
    gigabytes,
    formattedSize: formatBytes(bytes),
  };
}

export function calculateWorldSize(config: WorldSizeConfig): WorldSizeResult {
  const overworld = calculateDimensionStats(
    'overworld',
    config.radii.overworld,
    config.shape,
    config.version,
    config.includeEntitiesAndPoi,
  );
  const nether = calculateDimensionStats(
    'nether',
    config.radii.nether,
    config.shape,
    config.version,
    config.includeEntitiesAndPoi,
  );
  const end = calculateDimensionStats(
    'end',
    config.radii.end,
    config.shape,
    config.version,
    config.includeEntitiesAndPoi,
  );

  const totalChunks = overworld.chunks + nether.chunks + end.chunks;
  const totalRegionFiles = overworld.regionFiles + nether.regionFiles + end.regionFiles;
  const totalBytes = overworld.bytes + nether.bytes + end.bytes;
  const totalGigabytes = totalBytes / (1024 * 1024 * 1024);
  const recommendedDiskGB = Math.max(20, Math.ceil(totalGigabytes * 1.5));

  const estimatedPregenSeconds = {
    fast: totalChunks > 0 ? Math.ceil(totalChunks / 450) : 0,
    normal: totalChunks > 0 ? Math.ceil(totalChunks / 200) : 0,
    slow: totalChunks > 0 ? Math.ceil(totalChunks / 75) : 0,
  };

  return {
    dimensions: {
      overworld,
      nether,
      end,
    },
    totalChunks,
    totalRegionFiles,
    totalBytes,
    totalGigabytes,
    formattedTotalSize: formatBytes(totalBytes),
    recommendedDiskGB,
    estimatedPregenSeconds,
  };
}

export function normalizeInputToRadius(
  value: number,
  measurement: MeasurementType,
): number {
  if (value <= 0 || !Number.isFinite(value)) return 0;
  return measurement === 'diameter' ? Math.round(value / 2) : Math.round(value);
}

export function formatRadiusForDisplay(
  radius: number,
  measurement: MeasurementType,
): number {
  return measurement === 'diameter' ? radius * 2 : radius;
}

export function getChunkyWorldName(dimension: DimensionId): string {
  switch (dimension) {
    case 'nether':
      return 'world_nether';
    case 'end':
      return 'world_the_end';
    case 'overworld':
    default:
      return 'world';
  }
}

export function generateChunkyCommands(
  dimension: DimensionId,
  radius: number,
  shape: ShapeType,
): string[] {
  const worldName = getChunkyWorldName(dimension);
  return [
    `/chunky world ${worldName}`,
    `/chunky shape ${shape}`,
    `/chunky radius ${radius}`,
    `/chunky start`,
  ];
}

export function generateWorldBorderCommand(radius: number): string {
  return `/worldborder set ${radius * 2}`;
}
