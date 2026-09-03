import { useState } from 'react';
import { Check, Copy, Download, Grid, Image as ImageIcon, Loader2 } from 'lucide-react';
import { buildRenderUrl } from '../engine/urlBuilder';
import { cn } from '../../../shared/lib/cn';

interface TextureViewerProps {
  target: string;
  onToast: (title: string, description?: string, tone?: 'green' | 'red') => void;
}

export function TextureViewer({ target, onToast }: TextureViewerProps) {
  const [showGrid, setShowGrid] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const textureUrl = buildRenderUrl('skin', target);
  const downloadUrl = buildRenderUrl('download', target);

  const handleCopyImage = async () => {
    try {
      const res = await fetch(textureUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 1500);
      onToast('Texture Copied!', 'Copied raw 64x64 texture to clipboard.', 'green');
    } catch {
      onToast('Copy Failed', 'Unable to copy raw image to clipboard.', 'red');
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `${target.toLowerCase()}-skin.png`;
      a.click();
      URL.revokeObjectURL(objectUrl);
      onToast('Downloaded!', `Saved ${a.download}`, 'green');
    } catch {
      window.open(downloadUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-none border border-line bg-[#15151f] p-4">
      <div className="flex items-center justify-between border-b border-line pb-2.5">
        <div className="flex items-center gap-2">
          <ImageIcon size={16} className="text-[var(--accent)]" />
          <span className="font-mc text-sm text-[#cdd6f4]">Raw Skin Texture Sheet</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowGrid((v) => !v)}
            data-active={showGrid}
            className={cn(
              'mc-btn flex h-7 items-center gap-1 rounded-none px-2 text-[11px] text-[#a6adc8] hover:text-[#cdd6f4]',
              showGrid && '!border-[var(--accent)] !text-[var(--accent)]',
            )}
          >
            <Grid size={12} />
            <span>Pixel Grid</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="relative flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-none border border-line/60 bg-[#0c0c14] p-2">
          {!imgLoaded && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0c0c14] text-[#6c7086]">
              <Loader2 size={18} className="animate-spin text-[var(--accent)]" />
            </div>
          )}
          {hasError ? (
            <div className="flex flex-col items-center justify-center gap-1 text-[#6c7086]">
              <ImageIcon size={20} />
              <span className="text-[10px]">Unavailable</span>
            </div>
          ) : (
            <div className="relative">
              <img
                key={textureUrl}
                src={textureUrl}
                alt={`${target} raw texture sheet`}
                onLoad={() => setImgLoaded(true)}
                onError={() => {
                  setImgLoaded(true);
                  setHasError(true);
                }}
                className="h-28 w-28 object-contain [image-rendering:pixelated]"
              />
              {showGrid && (
                <div
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:7px_7px]"
                />
              )}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between gap-3 text-xs text-[#a6adc8]">
          <div className="flex flex-col gap-1 leading-relaxed">
            <span className="font-semibold text-[#cdd6f4]">Minecraft 1.8+ Standard 64×64 Texture</span>
            <p className="text-[11px] text-[#6c7086]">
              Standard skin file containing both 1st and 2nd layers for head, body, arms, and legs. Ready to apply directly in the Minecraft Launcher, Minecraft.net profile, or server texture assets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading || hasError}
              className="mc-btn flex h-8 items-center gap-1.5 rounded-none border-[var(--accent)]/50 bg-[#1e1e2b] px-3 text-xs font-semibold text-[var(--accent)] hover:border-[var(--accent)]"
            >
              {downloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              <span>Download Minecraft Skin</span>
            </button>

            <button
              type="button"
              onClick={handleCopyImage}
              data-active={copiedImage}
              className="mc-icon-btn h-8 rounded-none px-2.5 text-xs text-[#a6adc8] hover:text-[#cdd6f4]"
            >
              <span key={copiedImage ? 'check' : 'copy'} className="pop-in flex items-center gap-1.5">
                {copiedImage ? <Check size={13} className="text-[var(--accent)]" /> : <Copy size={13} />}
                <span>{copiedImage ? 'Copied' : 'Copy Image'}</span>
              </span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
