export type ShapeMode = 'circle' | 'oval' | 'sphere' | 'dome';

export type AnchorPreset = 'center' | 'north' | 'south' | 'west' | 'east' | 'custom';

export interface WorldAnchor {
  enabled: boolean;
  x: number;
  y: number;
  z: number;
  layer: number;
  preset: AnchorPreset;
  customGridX: number | null;
  customGridY: number | null;
}

export interface ShapeConfig {
  mode: ShapeMode;
  diameter: number;
  width: number;
  height: number;
  layer: number;
  filled: boolean;
  showGrid: boolean;
  ghostPreviousLayer: boolean;
  zoom: number;
  anchor: WorldAnchor;
}

export interface StackBreakdown {
  stacks: number;
  remainder: number;
  shulkers: number;
}

export interface ShapeStats {
  blockCount: number;
  totalBlockCount: number;
  layerStacks: StackBreakdown;
  totalStacks: StackBreakdown;
  diameter?: number;
  width?: number;
  height?: number;
  radius: number;
  circumference: number;
}
