import { createContext, useContext } from 'react';
import type { PreviewStyle } from './previewStyles';
import type { RgbStoreContextValue } from '../hooks/useRgbStore';

export interface Selection {
  start: number;
  end: number;
}

export const SelectionContext = createContext<Selection | undefined>(undefined);
export const SelectionSetterContext = createContext<((s: Selection | undefined) => void) | null>(null);
export const PreviewStyleContext = createContext<{ value: PreviewStyle; set: (v: PreviewStyle) => void }>({
  value: 'default',
  set: () => undefined,
});
export const ShowAllGradientsContext = createContext<{ value: boolean; set: (v: boolean) => void }>({
  value: false,
  set: () => undefined,
});
export const RgbStoreContext = createContext<RgbStoreContextValue | null>(null);

export function useRgbStore(): RgbStoreContextValue {
  const ctx = useContext(RgbStoreContext);
  if (!ctx) throw new Error('useRgbStore must be used inside RgbStoreProvider');
  return ctx;
}
