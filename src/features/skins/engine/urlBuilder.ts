import type { SkinFormat, SkinRenderPart, SkinVariation } from '../types';

const BASE_URL = 'https://mineskin.eu';

export function buildRenderUrl(
  part: SkinRenderPart,
  target: string,
  size = 100,
  format: SkinFormat = 'png',
): string {
  const cleanTarget = target.trim();
  if (!cleanTarget) return '';

  const ext = format === 'svg' ? '.svg' : '.png';
  const clampedSize = Math.max(16, Math.min(512, Math.round(size)));

  switch (part) {
    case 'avatar':
      return `${BASE_URL}/avatar/${cleanTarget}/${clampedSize}${ext}`;
    case 'helm':
      return `${BASE_URL}/helm/${cleanTarget}/${clampedSize}${ext}`;
    case 'bust':
      return `${BASE_URL}/bust/${cleanTarget}/${clampedSize}${ext}`;
    case 'armor_bust':
      return `${BASE_URL}/armor/bust/${cleanTarget}/${clampedSize}${ext}`;
    case 'body':
      return `${BASE_URL}/body/${cleanTarget}/${clampedSize}${ext}`;
    case 'armor_body':
      return `${BASE_URL}/armor/body/${cleanTarget}/${clampedSize}${ext}`;
    case 'head':
      return `${BASE_URL}/head/${cleanTarget}/${clampedSize}${ext}`;
    case 'headhelm':
      return `${BASE_URL}/headhelm/${cleanTarget}/${clampedSize}${ext}`;
    case 'skin':
      return `${BASE_URL}/skin/${cleanTarget}`;
    case 'download':
      return `${BASE_URL}/download/${cleanTarget}`;
  }
}

export function getAllSkinVariations(
  target: string,
  size = 100,
  format: SkinFormat = 'png',
): SkinVariation[] {
  const cleanTarget = target.trim() || 'Notch';

  return [
    {
      id: 'helm',
      name: 'Head (With Overlay)',
      category: 'head',
      hasOverlay: true,
      url: buildRenderUrl('helm', cleanTarget, size, format),
      supportsSvg: true,
    },
    {
      id: 'avatar',
      name: 'Head (Flat)',
      category: 'head',
      hasOverlay: false,
      url: buildRenderUrl('avatar', cleanTarget, size, format),
      supportsSvg: true,
    },
    {
      id: 'headhelm',
      name: 'Isometric Head (With Overlay)',
      category: 'isometric',
      hasOverlay: true,
      url: buildRenderUrl('headhelm', cleanTarget, size, format),
      supportsSvg: true,
    },
    {
      id: 'head',
      name: 'Isometric Head (Flat)',
      category: 'isometric',
      hasOverlay: false,
      url: buildRenderUrl('head', cleanTarget, size, format),
      supportsSvg: true,
    },
    {
      id: 'armor_bust',
      name: 'Bust / Chest (With Overlay)',
      category: 'chest',
      hasOverlay: true,
      url: buildRenderUrl('armor_bust', cleanTarget, size, format),
      supportsSvg: true,
    },
    {
      id: 'bust',
      name: 'Bust / Chest (Flat)',
      category: 'chest',
      hasOverlay: false,
      url: buildRenderUrl('bust', cleanTarget, size, format),
      supportsSvg: true,
    },
    {
      id: 'armor_body',
      name: 'Full Body (With Overlay)',
      category: 'body',
      hasOverlay: true,
      url: buildRenderUrl('armor_body', cleanTarget, size, format),
      supportsSvg: true,
    },
    {
      id: 'body',
      name: 'Full Body (Flat)',
      category: 'body',
      hasOverlay: false,
      url: buildRenderUrl('body', cleanTarget, size, format),
      supportsSvg: true,
    },
    {
      id: 'skin',
      name: 'Raw Texture Sheet',
      category: 'texture',
      hasOverlay: true,
      url: buildRenderUrl('skin', cleanTarget, size, 'png'),
      supportsSvg: false,
    },
  ];
}

export function isValidMinecraftIdentifier(input: string): boolean {
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_]{3,16}$/.test(trimmed)) return true;
  if (/^[0-9a-fA-F]{32}$/.test(trimmed)) return true;
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(trimmed)) {
    return true;
  }
  return false;
}
