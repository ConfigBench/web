export const PREVIEW_STYLES = [
  { value: 'default', label: 'Default' },
  { value: 'chat', label: 'Minecraft Chat' },
  { value: 'motd', label: 'Minecraft Server MOTD' },
  { value: 'tab-header', label: 'Minecraft Tab Header' },
  { value: 'tab-footer', label: 'Minecraft Tab Footer' },
  { value: 'tab-player', label: 'Minecraft Tab Player' },
  { value: 'gui-chest', label: 'Minecraft GUI Chest' },
  { value: 'gui-item-name', label: 'Minecraft GUI Item Name' },
  { value: 'gui-item-lore', label: 'Minecraft GUI Item Lore' },
] as const;

export type PreviewStyle = (typeof PREVIEW_STYLES)[number]['value'];
