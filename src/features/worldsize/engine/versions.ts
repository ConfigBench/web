import type { VersionInfo } from '../types';

export const MINECRAFT_VERSIONS: readonly VersionInfo[] = [
  {
    id: '26.2',
    name: '26.2 - Chaos Cubed',
    era: 'Game Drops',
    height: 384,
    chunkSizes: { overworld: 9.85, nether: 6.45, end: 4.31 },
  },
  {
    id: '26.1.2',
    name: '26.1 - 26.1.2 - Tiny Takeover',
    era: 'Game Drops',
    height: 384,
    chunkSizes: { overworld: 9.82, nether: 6.42, end: 4.31 },
  },
  {
    id: '1.21.11',
    name: '1.21.11 - Mounts of Mayhem',
    era: 'Game Drops',
    height: 384,
    chunkSizes: { overworld: 9.71, nether: 6.31, end: 4.31 },
  },
  {
    id: '1.21',
    name: '1.21 - 1.21.4 - Tricky Trials',
    era: 'Modern',
    height: 384,
    chunkSizes: { overworld: 11.38, nether: 6.33, end: 4.31 },
  },
  {
    id: '1.20',
    name: '1.20 - 1.20.6 - Trails & Tales',
    era: 'Modern',
    height: 384,
    chunkSizes: { overworld: 11.39, nether: 6.35, end: 4.31 },
  },
  {
    id: '1.19',
    name: '1.19 - 1.19.4 - The Wild Update',
    era: 'Modern',
    height: 384,
    chunkSizes: { overworld: 11.42, nether: 6.83, end: 4.31 },
  },
  {
    id: '1.18',
    name: '1.18 - 1.18.2 - Caves & Cliffs: Part II',
    era: 'Caves & Cliffs',
    height: 384,
    chunkSizes: { overworld: 11.72, nether: 7.12, end: 4.31 },
  },
  {
    id: '1.17',
    name: '1.17 - 1.17.1 - Caves & Cliffs: Part I',
    era: 'Caves & Cliffs',
    height: 256,
    chunkSizes: { overworld: 8.35, nether: 6.54, end: 4.29 },
  },
  {
    id: '1.16',
    name: '1.16 - 1.16.5 - Nether Update',
    era: 'Nether Overhaul',
    height: 256,
    chunkSizes: { overworld: 6.79, nether: 7.31, end: 4.30 },
  },
  {
    id: '1.15',
    name: '1.15 - 1.15.2 - Buzzy Bees',
    era: 'Village & Bees',
    height: 256,
    chunkSizes: { overworld: 6.70, nether: 4.10, end: 4.29 },
  },
  {
    id: '1.14',
    name: '1.14 - 1.14.4 - Village & Pillage',
    era: 'Village & Bees',
    height: 256,
    chunkSizes: { overworld: 6.65, nether: 4.08, end: 4.29 },
  },
  {
    id: '1.13',
    name: '1.13 - 1.13.2 - Update Aquatic',
    era: 'Aquatic Era',
    height: 256,
    chunkSizes: { overworld: 6.55, nether: 4.05, end: 4.29 },
  },
  {
    id: '1.12',
    name: '1.12 - 1.12.2 - World of Color',
    era: 'Classic Release',
    height: 256,
    chunkSizes: { overworld: 6.12, nether: 3.99, end: 4.28 },
  },
  {
    id: '1.11',
    name: '1.11 - 1.11.2 - Exploration Update',
    era: 'Classic Release',
    height: 256,
    chunkSizes: { overworld: 6.08, nether: 3.98, end: 4.26 },
  },
  {
    id: '1.10',
    name: '1.10 - 1.10.2 - Frostburn Update',
    era: 'Classic Release',
    height: 256,
    chunkSizes: { overworld: 6.05, nether: 3.98, end: 4.25 },
  },
  {
    id: '1.9',
    name: '1.9 - 1.9.4 - Combat Update',
    era: 'Classic Release',
    height: 256,
    chunkSizes: { overworld: 6.02, nether: 3.98, end: 4.25 },
  },
  {
    id: '1.8',
    name: '1.8 - 1.8.9 - The Bountiful Update',
    era: 'Golden Era',
    height: 256,
    chunkSizes: { overworld: 5.89, nether: 3.98, end: 3.98 },
  },
  {
    id: '1.7',
    name: '1.7.2 - 1.7.10 - Update That Changed The World',
    era: 'Golden Era',
    height: 256,
    chunkSizes: { overworld: 5.82, nether: 3.98, end: 3.98 },
  },
  {
    id: '1.6',
    name: '1.6.1 - 1.6.4 - Horse Update',
    era: 'Early Anvil',
    height: 256,
    chunkSizes: { overworld: 5.40, nether: 3.98, end: 3.98 },
  },
  {
    id: '1.5',
    name: '1.5 - 1.5.2 - Redstone Update',
    era: 'Early Anvil',
    height: 256,
    chunkSizes: { overworld: 5.30, nether: 3.98, end: 3.98 },
  },
  {
    id: '1.4',
    name: '1.4.2 - 1.4.7 - Pretty Scary Update',
    era: 'Early Anvil',
    height: 256,
    chunkSizes: { overworld: 5.25, nether: 3.98, end: 3.98 },
  },
  {
    id: '1.3',
    name: '1.3.1 - 1.3.2 - Integrated Server',
    era: 'Early Anvil',
    height: 256,
    chunkSizes: { overworld: 5.20, nether: 3.98, end: 3.98 },
  },
  {
    id: '1.2',
    name: '1.2.1 - 1.2.5 - Anvil Format Debut',
    era: 'Early Anvil',
    height: 256,
    chunkSizes: { overworld: 5.15, nether: 3.98, end: 3.98 },
  },
  {
    id: '1.1',
    name: '1.1 - Pre-Anvil Era',
    era: 'Legacy McRegion',
    height: 128,
    chunkSizes: { overworld: 4.17, nether: 3.98, end: 3.98 },
  },
  {
    id: '1.0',
    name: '1.0.0 - Full Release',
    era: 'Legacy McRegion',
    height: 128,
    chunkSizes: { overworld: 4.15, nether: 3.98, end: 3.98 },
  },
];

export const DEFAULT_VERSION_ID = '26.2';

export function getVersionInfo(versionId: string): VersionInfo {
  const found = MINECRAFT_VERSIONS.find((v) => v.id === versionId);
  if (found) return found;
  return MINECRAFT_VERSIONS[0];
}
