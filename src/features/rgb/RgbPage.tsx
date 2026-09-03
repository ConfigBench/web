import { useCallback, useContext, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Check, Copy, Droplet, Palette, Save, Settings, Sparkles, Terminal, Type, WandSparkles } from 'lucide-react';
import { colorFormats } from './engine/defaults';
import { generateOutput, renderFormatPreviewLabel } from './engine/rgbUtils';
import { obfuscateText } from './engine/obfuscator';
import { RgbStoreProvider } from './hooks/useRgbStore';
import { useRgbStore, ShowAllGradientsContext, PreviewStyleContext } from './components/rgbContexts';
import { SelectionProvider } from './components/SelectionProvider';
import type { PreviewStyle } from './components/previewStyles';
import Dropdown from '../../shared/components/ui/Dropdown';
import { Toasts } from './components/Toasts';
import Input from './components/Input';
import ColorMap from './components/ColorMap';
import ColorList from './components/ColorList';
import Options from './components/Options';
import CustomFormat from './components/CustomFormat';
import Decode from './components/Decode';
import Presets from './components/Presets';
import RgbPreview from './components/RgbPreview';
import AllGradientsPreview from './components/AllGradientsPreview';
import { Panel } from '../../shared/components/ui/Panel';
import { DragHandle } from '../../shared/components/ui/DragHandle';

type Tab = 'colors' | 'options' | 'decode' | 'presets';

const TABS: Array<{ key: Tab; label: string; icon: typeof Palette }> = [
  { key: 'colors', label: 'Colors', icon: Palette },
  { key: 'options', label: 'Options', icon: Settings },
  { key: 'decode', label: 'Decode', icon: Sparkles },
  { key: 'presets', label: 'Presets', icon: Save },
];

function ErrorBanner() {
  const { errors } = useRgbStore();
  if (errors.length === 0) return null;
  return (
    <div className="rounded-none border border-[#f38ba8]/40 bg-[#f38ba8]/10 p-2 text-xs text-[#f38ba8]">
      {errors.slice(0, 3).map((error, i) => (
        <p key={i}>Error loading settings: {error}</p>
      ))}
      {errors.length > 3 && <p className="opacity-70">+{errors.length - 3} more…</p>}
    </div>
  );
}

function ObfuscationLayer({ enabled }: { enabled: boolean }) {
  const { store } = useRgbStore();

  useEffect(() => {
    const restoreAll = () => {
      document.querySelectorAll<HTMLElement>('#input-overlay span[data-text]').forEach((el) => {
        const dataText = el.getAttribute('data-text') ?? '';
        if (dataText === '\n' || dataText === '\r') return;
        if (el.textContent !== dataText) el.textContent = dataText;
      });
    };

    if (!enabled) {
      restoreAll();
      return;
    }

    let raf = 0;
    const tick = () => {
      document.querySelectorAll<HTMLElement>('#input-overlay span[data-text]').forEach((el) => {
        const dataText = el.getAttribute('data-text') ?? '';
        if (dataText === '\n' || dataText === '\r') return;
        if (el.classList.contains('obfuscate')) el.textContent = obfuscateText(dataText);
        else if (el.textContent !== dataText) el.textContent = dataText;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      restoreAll();
    };
  }, [enabled, store.text, store.formatting, store.baseFormatting]);

  return null;
}

function OutputDock() {
  const { store, update, pushToast } = useRgbStore();
  const [copied, setCopied] = useState(false);
  const output = useMemo(() => generateOutput(store), [store]);
  const colorFormatIndex = Math.max(
    0,
    colorFormats.findIndex((f) => f.color === store.colorFormat?.color),
  );

  const copy = () => {
    navigator.clipboard
      .writeText(output)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
        pushToast('Copied to clipboard!', 'The text has been copied to your clipboard successfully.', 'green');
      })
      .catch((err: unknown) =>
        pushToast('Failed to copy to clipboard!', err instanceof Error ? err.message : String(err), 'red'),
      );
  };

  return (
    <Panel
      title="Output"
      icon={Terminal}
      actions={
        <div className="flex items-center gap-1">
          <Dropdown
            ariaLabel="Color Format"
            value={store.customFormat ? 'custom' : String(colorFormatIndex)}
            onChange={(v) => {
              if (v === 'custom') update({ customFormat: true });
              else update({ customFormat: false, colorFormat: colorFormats[Number(v)] });
            }}
            options={[
              ...colorFormats.map((format, i) => ({
                value: String(i),
                label: renderFormatPreviewLabel(format, store.baseFormatting, store),
              })),
              { value: 'custom', label: 'Custom Format' },
            ]}
            className="h-8 w-44"
            align="right"
          />
          <button
            type="button"
            id="lowercase"
            title="Lowercase Hex Codes"
            data-active={store.lowercase}
            onClick={() => update({ lowercase: !store.lowercase })}
            className="mc-icon-btn h-8 rounded-none px-2 font-mono text-[11px]"
          >
            {store.lowercase ? 'aBc' : 'ABC'}
          </button>
          <button
            type="button"
            onClick={copy}
            title="Copy to clipboard"
            data-active={copied}
            className="mc-icon-btn h-8 w-[92px] justify-center rounded-none px-2 text-xs"
          >
            <span key={copied ? 'check' : 'copy'} className="pop-in flex items-center gap-1.5">
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </span>
          </button>
        </div>
      }
    >
      <textarea
        id="output"
        readOnly
        value={output}
        onClick={copy}
        title="Click to copy"
        className="mc-output font-mc h-64 w-full resize-none p-3 text-sm leading-relaxed whitespace-pre-wrap text-[#cdd6f4] outline-none"
      />
    </Panel>
  );
}

function SidePanel({ tab }: { tab: Tab }) {
  const { store, update } = useRgbStore();

  if (tab === 'colors') {
    return (
      <Panel title="Colors" icon={Palette} className="max-h-[calc(100vh-6rem)]">
        <div className="flex min-h-0 flex-1 flex-col p-4">
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pr-1">
            <ColorList />
            {store.shadowColors && (
              <div className="mt-4 border-t border-line pt-4">
                <ColorList shadow />
              </div>
            )}
          </div>
          {(store.colorFormat.color === 'MiniMessage' || store.colorFormat.color === 'JSON' || store.shadowColors) && (
            <button
              type="button"
              id="textshadowtoggle"
              className="mc-icon-btn mt-4 shrink-0 justify-start rounded-none px-2.5 py-2 text-[13px]"
              data-active={!!store.shadowColors}
              onClick={() =>
                update({
                  shadowColors: store.shadowColors
                    ? null
                    : (store.shadowColors ?? store.colors.map((c) => ({ ...c }))),
                })
              }
            >
              <Droplet size={14} />
              Custom Text Shadow
            </button>
          )}
        </div>
      </Panel>
    );
  }
  if (tab === 'options') {
    return (
      <Panel title="Advanced Options" icon={Settings} className="max-h-[calc(100vh-6rem)]">
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
          <Options />
          {store.customFormat && (
            <div className="flex flex-col gap-3 border-t border-line pt-4">
              <h4 className="flex items-center gap-2 text-[13px] font-semibold text-[#cdd6f4]">
                <Settings size={14} className="text-[var(--accent)]" />
                Format Options
                <span className="truncate font-mono text-[11px] font-normal text-[#6c7086]">
                  {renderFormatPreviewLabel(store.colorFormat, store.baseFormatting, store)}
                </span>
              </h4>
              <CustomFormat />
            </div>
          )}
        </div>
      </Panel>
    );
  }
  if (tab === 'decode') {
    return (
      <Panel title="Decode" icon={WandSparkles} className="max-h-[calc(100vh-6rem)]">
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
          <Decode />
        </div>
      </Panel>
    );
  }
  return (
    <Panel title="Presets" icon={Save} className="max-h-[calc(100vh-6rem)]">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
        <Presets />
      </div>
    </Panel>
  );
}


function RgbTool() {
  const { store } = useRgbStore();
  const showAllGradients = useContext(ShowAllGradientsContext);
  const [activeTab, setActiveTab] = useState<Tab>('colors');
  const [sideWidth, setSideWidth] = useState(320);
  const layoutRef = useRef<HTMLDivElement>(null);

  const hasObfuscate = store.baseFormatting.obfuscate || store.formatting.some((s) => s.obfuscate);

  const dragSide = useCallback(
    (clientX: number) => {
      const rect = layoutRef.current?.getBoundingClientRect();
      if (!rect) return;
      setSideWidth(Math.min(560, Math.max(240, clientX - rect.left)));
    },
    [],
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-3">
      <ErrorBanner />

      <div ref={layoutRef} className="flex flex-col lg:flex-row">
        <nav className="order-1 flex shrink-0 flex-row gap-1.5 rounded-none border border-line bg-panel p-1.5 lg:sticky lg:top-0 lg:flex-col lg:self-start">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              title={label}
              aria-label={label}
              className="mc-icon-btn h-10 w-10 rounded-none p-0"
              data-active={activeTab === key}
            >
              <Icon size={18} />
            </button>
          ))}
          {store.customFormat && (
            <button
              type="button"
              onClick={() => setActiveTab('options')}
              title="Custom format active"
              aria-label="Custom format active"
              className="mc-icon-btn h-10 w-10 rounded-none p-0"
              data-active
            >
              <Settings size={18} />
            </button>
          )}
        </nav>

        <div
          className="order-3 w-full shrink-0 lg:order-2 lg:sticky lg:top-0 lg:w-[var(--side-w)] lg:self-start"
          style={{ '--side-w': `${sideWidth}px` } as CSSProperties}
        >
          <SidePanel tab={activeTab} />
        </div>
        <div className="order-4 hidden shrink-0 lg:order-3 lg:block">
          <DragHandle orientation="vertical" onDrag={dragSide} />
        </div>

        <div className="mc-grid order-2 flex min-w-0 flex-1 flex-col lg:order-4">
          <Panel title="Gradient Text" icon={Type} className="relative z-10 overflow-visible">
            <div className="flex flex-col p-4">
              <Input>
                <ObfuscationLayer enabled={hasObfuscate} />
                {showAllGradients.value ? <AllGradientsInput /> : <RgbPreviewDefault />}
              </Input>
              <ColorMap />
              {store.shadowColors && <ColorMap shadow />}
            </div>
          </Panel>

          <OutputDock />
        </div>
      </div>
    </div>
  );
}

function RgbPreviewDefault() {
  return <RgbPreview />;
}

function AllGradientsInput() {
  return <AllGradientsPreview showSelection />;
}

export function RgbPage() {
  const [previewStyle, setPreviewStyle] = useState<PreviewStyle>('default');
  const [showAll, setShowAll] = useState(false);
  return (
    <RgbStoreProvider>
      <SelectionProvider>
        <PreviewStyleContext.Provider value={{ value: previewStyle, set: setPreviewStyle }}>
          <ShowAllGradientsContext.Provider value={{ value: showAll, set: setShowAll }}>
            <RgbTool />
            <Toasts />
          </ShowAllGradientsContext.Provider>
        </PreviewStyleContext.Provider>
      </SelectionProvider>
    </RgbStoreProvider>
  );
}
