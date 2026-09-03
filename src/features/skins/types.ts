export type SkinRenderPart =
  | 'avatar'
  | 'helm'
  | 'bust'
  | 'armor_bust'
  | 'body'
  | 'armor_body'
  | 'head'
  | 'headhelm'
  | 'skin'
  | 'download';

export type SkinFormat = 'png' | 'svg';

export type SkinLayerFilter = 'all' | 'overlay' | 'flat';

export type SkinRenderCategory = 'head' | 'chest' | 'body' | 'isometric' | 'texture';

export interface SkinVariation {
  id: SkinRenderPart;
  name: string;
  category: SkinRenderCategory;
  hasOverlay: boolean;
  url: string;
  supportsSvg: boolean;
}
