import { Activity, Circle, Compass, FileCode2, Globe, Palette, Shirt, SquareActivity } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type ToolCategory =
  | 'Server & Config'
  | 'Text & Formatting'
  | 'World & Building'
  | 'Player & Cosmetics'

export interface ToolDef {
  to: string
  label: string
  category: ToolCategory
  icon: LucideIcon
  description: string
  tags: string[]
}

export const TOOL_CATEGORIES: readonly ToolCategory[] = [
  'Server & Config',
  'Text & Formatting',
  'World & Building',
  'Player & Cosmetics',
] as const

export const TOOLS: ToolDef[] = [
  {
    to: '/tools/config',
    label: 'Config',
    category: 'Server & Config',
    icon: FileCode2,
    description: 'Paste any plugin config and watch every MiniMessage string render live as it would in-game.',
    tags: ['yaml', 'minimessage', 'adventure', 'messages', 'plugin', 'json'],
  },
  {
    to: '/tools/world-size',
    label: 'World Size',
    category: 'Server & Config',
    icon: Globe,
    description: 'Calculate world disk storage, chunk counts, and Chunky pregeneration specs across all Minecraft versions.',
    tags: ['storage', 'disk', 'chunks', 'mca', 'region', 'pregeneration', 'chunky'],
  },
  {
    to: '/tools/status',
    label: 'Server Status',
    category: 'Server & Config',
    icon: Activity,
    description: 'Query Java and Bedrock servers to inspect live player count, latency, and formatted in-game MOTD.',
    tags: ['ping', 'players', 'motd', 'latency', 'java', 'bedrock', 'server'],
  },
  {
    to: '/tools/rgb',
    label: 'RGB Gradient',
    category: 'Text & Formatting',
    icon: Palette,
    description: 'Create hex-gradient text for chat, MOTD, TAB and GUIs — six color spaces, every output format.',
    tags: ['hex', 'gradient', 'chat', 'motd', 'color', 'formatting', 'decode'],
  },
  {
    to: '/tools/tab',
    label: 'Animated TAB',
    category: 'Text & Formatting',
    icon: SquareActivity,
    description: 'Animate your TAB header with scrolling or bouncing gradients and export ready-to-use YAML.',
    tags: ['tab', 'animation', 'header', 'footer', 'yaml', 'bouncing'],
  },
  {
    to: '/tools/skins',
    label: 'Skin Viewer',
    category: 'Player & Cosmetics',
    icon: Shirt,
    description: 'Inspect, render, and download Minecraft skins — 3D isometric heads, full body models, and raw texture sheets.',
    tags: ['skin', 'player', 'stealer', 'texture', 'avatar', 'body', 'uuid'],
  },
  {
    to: '/tools/circle',
    label: 'Circle Generator',
    category: 'World & Building',
    icon: Circle,
    description: 'Generate pixel-perfect blueprints for Minecraft circles, ovals, spheres, and domes with layer guides.',
    tags: ['circle', 'sphere', 'dome', 'oval', 'voxel', 'blueprint', 'building', 'blocks'],
  },
  {
    to: '/tools/coords',
    label: 'Coordinates',
    category: 'World & Building',
    icon: Compass,
    description: 'Convert Block, Chunk, and Region coordinates with live Overworld ↔ Nether portal linking.',
    tags: ['nether', 'portal', 'coords', 'chunk', 'region', '8:1', 'teleport', 'tp'],
  },
]
