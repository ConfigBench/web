import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { combinedDefaults, type ColorStop } from '../engine/defaults';
import type { GradientType } from '../engine/gradients';
import { RgbStoreContext } from '../components/rgbContexts';

const STORE_KEY = 'configbench.rgb';
const PRESETS_KEY = 'configbench.rgb.presets';

export type CombinedStore = {
  version: number;
  text: string;
  colors: ColorStop[];
  shadowColors: ColorStop[] | null;
  colorLength: number;
  gradientType: GradientType;
  colorFormat: (typeof combinedDefaults)['colorFormat'];
  formatting: (typeof combinedDefaults)['formatting'];
  baseFormatting: (typeof combinedDefaults)['baseFormatting'];
  prefixSuffix: string;
  customFormat: boolean;
  trimSpaces: boolean;
  disperse: boolean;
  lowercase: boolean;
  name: string;
  type: number;
  speed: number;
  length: number;
  outputFormat: string;
};

export type RgbPreset = Partial<CombinedStore>;

export interface Toast {
  id: number;
  title: string;
  description?: string;
  tone: 'green' | 'red' | 'orange';
}

export interface RgbStoreContextValue {
  store: CombinedStore;
  update: (patch: Partial<CombinedStore>) => void;
  errors: string[];
  toasts: Toast[];
  pushToast: (title: string, description: string | undefined, tone: Toast['tone']) => void;
  dismissToast: (id: number) => void;
  presets: RgbPreset[];
  savePreset: () => void;
  deletePreset: (index: number) => void;
  loadPreset: (json: string) => boolean;
  exportPresetUrl: () => string;
}

function parseParams(params: URLSearchParams): { values: Partial<CombinedStore>; errors: string[] } {
  const values: Record<string, unknown> = {};
  const errors: string[] = [];
  for (const [key, raw] of params) {
    if (!(key in combinedDefaults)) continue;
    try {
      const fallback = combinedDefaults[key as keyof typeof combinedDefaults];
      if (typeof fallback === 'object') values[key] = JSON.parse(raw);
      else if (typeof fallback === 'boolean') values[key] = raw === 'true';
      else if (typeof fallback === 'number') {
        if (Number.isNaN(Number(raw))) {
          errors.push(`Invalid number for ${key}: ${raw}`);
          continue;
        }
        values[key] = Number(raw);
      } else values[key] = raw;
    } catch (err) {
      errors.push(`Error parsing ${key}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return { values: values as Partial<CombinedStore>, errors };
}

function loadInitialStore(): { store: CombinedStore; errors: string[] } {
  const errors: string[] = [];
  let saved: Partial<CombinedStore> = {};
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) saved = JSON.parse(raw) as Partial<CombinedStore>;
  } catch (err) {
    errors.push(`Failed to load saved settings: ${err instanceof Error ? err.message : String(err)}`);
  }

  let fromUrl: Partial<CombinedStore> = {};
  if (typeof window !== 'undefined') {
    const parsed = parseParams(new URLSearchParams(window.location.search));
    fromUrl = parsed.values;
    errors.push(...parsed.errors);
  }

  const merged = {
    ...structuredClone(combinedDefaults),
    ...saved,
    ...fromUrl,
  } as CombinedStore;
  for (const key of ['colorLength', 'speed', 'length'] as const) {
    const value = merged[key];
    if (typeof value === 'number' && value < 1) merged[key] = 1;
  }
  return { store: merged, errors };
}

function prunePreset(store: CombinedStore): RgbPreset {
  const preset: Record<string, unknown> = structuredClone(store);
  delete preset.version;
  for (const key of Object.keys(preset)) {
    if (JSON.stringify(preset[key]) === JSON.stringify(combinedDefaults[key as keyof typeof combinedDefaults])) {
      delete preset[key];
    }
  }
  return preset as RgbPreset;
}

function loadPresets(): RgbPreset[] {
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    return raw ? (JSON.parse(raw) as RgbPreset[]) : [];
  } catch {
    return [];
  }
}

function persistPresets(presets: RgbPreset[]): void {
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
  } catch (e) {
    void e;
  }
}

let toastId = 0;

export function RgbStoreProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(loadInitialStore);
  const [store, setStore] = useState<CombinedStore>(initial.store);
  const [errors] = useState(initial.errors);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [presets, setPresets] = useState<RgbPreset[]>(loadPresets);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(store));
      } catch (e) {
        void e;
      }
    }, 350);
    return () => window.clearTimeout(id);
  }, [store]);

  const pushToast = useCallback((title: string, description: string | undefined, tone: Toast['tone']) => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, title, description, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((toast) => toast.id !== id)), 3500);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo<RgbStoreContextValue>(() => {
    const update = (patch: Partial<CombinedStore>) => setStore((s) => ({ ...s, ...patch }));
    return {
      store,
      update,
      errors,
      toasts,
      pushToast,
      dismissToast,
      presets,
      savePreset: () => {
        const preset = prunePreset(store);
        const next = presets.some((p) => JSON.stringify(p) === JSON.stringify(preset))
          ? presets
          : [...presets, preset];
        setPresets(next);
        persistPresets(next);
      },
      deletePreset: (index) => {
        const next = presets.filter((_, i) => i !== index);
        setPresets(next);
        persistPresets(next);
      },
      loadPreset: (json) => {
        try {
          const parsed = JSON.parse(json) as RgbPreset;
          const colors = parsed.colors;
          if (Array.isArray(colors) && colors.length > 0 && typeof colors[0] === 'string') {
            parsed.colors = (colors as unknown as string[]).map((color, i) => ({
              hex: color,
              pos: (100 / (colors.length - 1)) * i,
            }));
          }
          setStore((s) => ({ ...s, ...parsed, version: combinedDefaults.version }));
          return true;
        } catch {
          return false;
        }
      },
      exportPresetUrl: () => {
        const url = new URL(window.location.href);
        url.search = '';
        const preset = prunePreset(store);
        for (const [key, val] of Object.entries(preset)) {
          if (val === undefined || val === null) continue;
          url.searchParams.set(key, typeof val === 'object' ? JSON.stringify(val) : String(val));
        }
        window.history.pushState({}, '', url.href);
        return url.href;
      },
    };
  }, [store, errors, toasts, presets, pushToast, dismissToast]);

  return <RgbStoreContext.Provider value={value}>{children}</RgbStoreContext.Provider>;
}
