import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Shirt } from 'lucide-react';
import type { SkinFormat, SkinLayerFilter } from './types';
import { getAllSkinVariations, isValidMinecraftIdentifier } from './engine/urlBuilder';
import { Panel } from '../../shared/components/ui/Panel';
import { SkinInspectorForm } from './components/SkinInspectorForm';
import { SkinPreviewCard } from './components/SkinPreviewCard';
import { TextureViewer } from './components/TextureViewer';
import { Skin3DViewer } from './components/Skin3DViewer';
import { ToastContainer, type ToastItem } from '../../shared/components/ui/ToastContainer';

const STORAGE_KEY = 'configbench.skin_history';

function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function SkinPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTarget = searchParams.get('u') || 'Notch';
  const initialFormat = (searchParams.get('format') as SkinFormat) || 'png';
  const initialLayer = (searchParams.get('layer') as SkinLayerFilter) || 'all';

  const [target, setTarget] = useState(initialTarget);
  const [format, setFormat] = useState<SkinFormat>(initialFormat);
  const [layerFilter, setLayerFilter] = useState<SkinLayerFilter>(initialLayer);
  const [history, setHistory] = useState<string[]>(loadHistory);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(0);

  const pushToast = (title: string, description?: string, tone: 'green' | 'red' = 'green') => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, title, description, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  };

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSearch = (newTarget: string) => {
    const clean = newTarget.trim();
    if (!clean || !isValidMinecraftIdentifier(clean)) {
      pushToast('Invalid Username/UUID', 'Please enter a valid Minecraft username (3–16 chars) or UUID.', 'red');
      return;
    }
    setTarget(clean);
    setHistory((prev) => {
      const next = [clean, ...prev.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 10);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        return next;
      }
      return next;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      return;
    }
    pushToast('History Cleared', undefined, 'green');
  };

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('u', target);
    if (format !== 'png') params.set('format', format);
    if (layerFilter !== 'all') params.set('layer', layerFilter);

    const nextSearch = `?${params.toString()}`;
    if (window.location.search !== nextSearch) {
      setSearchParams(params, { replace: true });
    }
  }, [target, format, layerFilter, setSearchParams]);

  const variations = useMemo(() => getAllSkinVariations(target, 100, format), [target, format]);

  const filteredVariations = useMemo(() => {
    if (layerFilter === 'all') return variations.filter((v) => v.category !== 'texture');
    if (layerFilter === 'overlay') return variations.filter((v) => v.hasOverlay && v.category !== 'texture');
    return variations.filter((v) => !v.hasOverlay && v.category !== 'texture');
  }, [variations, layerFilter]);

  return (
    <div className="flex w-full flex-col gap-4 max-w-6xl mx-auto pb-4">
      <Panel title="Minecraft Skin Viewer" icon={Shirt} className="w-full shrink-0">
        <div className="flex flex-col gap-3 p-4">
          <p className="text-xs text-muted max-w-2xl">
            Inspect, render, and download any Minecraft player skin in real time. Generate 2D avatars, 3D isometric heads, full body models with armor layers, and raw texture sheets.
          </p>

          <SkinInspectorForm
            target={target}
            format={format}
            layerFilter={layerFilter}
            history={history}
            onSearch={handleSearch}
            onFormatChange={setFormat}
            onLayerFilterChange={setLayerFilter}
            onClearHistory={handleClearHistory}
          />
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-5">
          <Skin3DViewer target={target} />
          <TextureViewer target={target} onToast={pushToast} />
        </div>

        <div className="flex flex-col gap-3 lg:col-span-7">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-none bg-[var(--accent)]" />
              <h3 className="font-mc text-sm uppercase tracking-wider text-[#cdd6f4]">
                2D & Isometric Variations ({filteredVariations.length})
              </h3>
            </div>
            <span className="font-mono text-xs text-muted">
              Target: <strong className="text-text">{target}</strong> · {format.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredVariations.map((variation) => (
              <SkinPreviewCard
                key={variation.id}
                variation={variation}
                target={target}
                onToast={pushToast}
              />
            ))}
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
