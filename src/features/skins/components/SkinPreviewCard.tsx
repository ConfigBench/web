import { useState } from 'react';
import { Check, Copy, Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import type { SkinVariation } from '../types';

interface SkinPreviewCardProps {
  variation: SkinVariation;
  target: string;
  onToast: (title: string, description?: string, tone?: 'green' | 'red') => void;
}

export function SkinPreviewCard({ variation, target, onToast }: SkinPreviewCardProps) {
  const [copiedImage, setCopiedImage] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleCopyImage = async () => {
    try {
      const res = await fetch(variation.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 1500);
      onToast('Image Copied!', 'Copied render directly to clipboard.', 'green');
    } catch {
      onToast('Copy Failed', 'Unable to copy image directly to clipboard.', 'red');
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(variation.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ext = variation.url.endsWith('.svg') ? 'svg' : 'png';
      a.href = objectUrl;
      a.download = `${target.toLowerCase()}-${variation.id}.${ext}`;
      a.click();
      URL.revokeObjectURL(objectUrl);
      onToast('Downloaded!', `Saved ${a.download}`, 'green');
    } catch {
      onToast('Download Failed', 'Failed to fetch image for download.', 'red');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-none border border-line bg-[#15151f] p-3 transition-colors hover:border-line/80">
      <div className="flex items-center justify-between border-b border-line/50 pb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="h-1.5 w-1.5 rounded-none bg-[var(--accent)] shrink-0" />
          <span className="font-mc text-xs text-[#cdd6f4] truncate" title={variation.name}>
            {variation.name}
          </span>
        </div>
        <span className="rounded-none border border-line bg-[#0e0e17] px-1.5 py-0.5 font-mono text-[9px] text-[#6c7086] uppercase shrink-0">
          {variation.hasOverlay ? 'Layer 2' : 'Base'}
        </span>
      </div>

      <div className="relative my-3 flex min-h-36 items-center justify-center overflow-hidden rounded-none border border-line/40 bg-[#0a0a12] p-2">
        {!imgLoaded && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a12] text-[#6c7086]">
            <Loader2 size={18} className="animate-spin text-[var(--accent)]" />
          </div>
        )}
        {hasError ? (
          <div className="flex flex-col items-center justify-center gap-1 text-[#6c7086]">
            <ImageIcon size={24} />
            <span className="text-[10px]">Render unavailable</span>
          </div>
        ) : (
          <img
            key={variation.url}
            src={variation.url}
            alt={`${target} ${variation.name}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              setImgLoaded(true);
              setHasError(true);
            }}
            className="max-h-32 max-w-full object-contain [image-rendering:pixelated] transition-transform duration-150 hover:scale-105"
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-1 border-t border-line/50 pt-2">
        <button
          type="button"
          onClick={handleCopyImage}
          title="Copy render image to clipboard"
          data-active={copiedImage}
          className="mc-icon-btn h-7 w-[78px] shrink-0 justify-center rounded-none px-2 text-[11px]"
        >
          <span key={copiedImage ? 'check' : 'copy'} className="pop-in flex items-center gap-1 whitespace-nowrap">
            {copiedImage ? <Check size={12} className="text-[var(--accent)]" /> : <Copy size={12} />}
            <span>{copiedImage ? 'Copied' : 'Copy'}</span>
          </span>
        </button>

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading || hasError}
          title="Download render"
          className="mc-btn flex h-7 items-center justify-center gap-1 rounded-none px-2.5 text-[11px] text-[var(--accent)] disabled:opacity-50"
        >
          {downloading ? (
            <Loader2 size={11} className="animate-spin" />
          ) : (
            <Download size={11} />
          )}
          <span>Download</span>
        </button>
      </div>
    </div>
  );
}
