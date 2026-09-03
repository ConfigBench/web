import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Braces, Check, Copy, Palette, RulerDimensionLine, Settings, SquareActivity, Terminal } from 'lucide-react';
import { cn } from '../../shared/lib/cn';
import { ANIMATION_STYLES } from './engine/defaults';
import { AnimationOutput, generateAnimTABFrames } from './engine/animTabUtils';
import { RgbStoreProvider } from './hooks/useRgbStore';
import { useRgbStore, PreviewStyleContext } from './components/rgbContexts';
import { SelectionProvider } from './components/SelectionProvider';
import Input from './components/Input';
import ColorList from './components/ColorList';
import ColorMap from './components/ColorMap';
import type { PreviewStyle } from './components/previewStyles';
import Dropdown from '../../shared/components/ui/Dropdown';
import { Panel } from '../../shared/components/ui/Panel';
import { DragHandle } from '../../shared/components/ui/DragHandle';
import { Toasts } from './components/Toasts';
import { hexToRGB } from './engine/colors';
import { toCSS, formattingClasses } from './components/previewUtils';
import { getFormattingAtOffset, segmentText } from './engine/rgbUtils';

const STYLE_LABELS: Record<number, string> = {
  [ANIMATION_STYLES.LEFT_TO_RIGHT]: 'Left to Right',
  [ANIMATION_STYLES.RIGHT_TO_LEFT]: 'Right to Left',
  [ANIMATION_STYLES.BOUNCING]: 'Bouncing',
  [ANIMATION_STYLES.FULL_TEXT_CYCLE]: 'Full Text Cycle',
};

function AnimTabPreview() {
  const { store } = useRgbStore();
  const { frames } = useMemo(
    () => generateAnimTABFrames({ ...store, text: store.text || 'ConfigBench' }, store),
    [store],
  );
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    let lastTime = performance.now();
    let raf = 0;
    const tick = (time: number) => {
      if (frames.length && time - lastTime > store.speed) {
        setFrameIndex((i) => (i + 1 >= frames.length ? 0 : i + 1));
        lastTime = time;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [frames.length, store.speed]);

  if (!store.text || store.text.trim() === '') {
    return <span className="text-[#a6adc8]/25 font-mc">ConfigBench</span>;
  }
  const colors = frames[frameIndex % Math.max(1, frames.length)] ?? [];
  const segments = segmentText(store.text, store.colorLength);

  const ranges = segments.map((seg, i) => {
    const start = segments.slice(0, i).reduce((acc, s) => acc + s.length, 0);
    return { text: seg, start, index: i };
  });
  return (
    <>
      {ranges.map(({ text: segmentTextValue, start: segmentStart, index: segmentIndexValue }) => {
        const rawColor = colors[segmentIndexValue];
        const color = rawColor ? `#${rawColor}` : 'inherit';
        const rgbShadow = rawColor ? hexToRGB(rawColor).map((c) => Math.round(c * 0.25)) : null;
        const rgbShadowCSS = rgbShadow ? toCSS(rgbShadow) : null;

        return (
          <span key={`seg-${segmentStart}`} className="contents">
            {Array.from(segmentTextValue).map((char, offset) => {
              const globalIndex = segmentStart + offset;
              const fmt = getFormattingAtOffset(globalIndex, store);
              return (
                <span
                  key={`c${globalIndex}`}
                  className={cn('char-span', formattingClasses(fmt))}
                  style={{
                    color,
                    ...(rgbShadowCSS && { textShadow: '2px 2px 0 ' + rgbShadowCSS }),
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              );
            })}
          </span>
        );
      })}
    </>
  );
}


function SettingsPanel() {
  const { store, update } = useRgbStore();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
      <label className="flex flex-col gap-1.5 text-[13px] text-[#a6adc8]">
        <span className="flex items-center gap-1.5">
          <RulerDimensionLine size={13} /> Gradient Length
        </span>
        <input
          id="length"
          type="number"
          min={1}
          max={Math.max(1, store.text.length)}
          value={store.length}
          onChange={(e) => update({ length: Math.max(1, Number(e.target.value) || 1) })}
          className="mc-input rounded-none px-2.5 py-1.5 text-[13px]"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-[13px] text-[#a6adc8]">
        Speed (ms per frame)
        <input
          id="speed"
          type="number"
          min={50}
          value={store.speed}
          onChange={(e) => update({ speed: Math.max(50, Number(e.target.value) || 50) })}
          className="mc-input rounded-none px-2.5 py-1.5 text-[13px]"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-[13px] text-[#a6adc8]">
        Animation Name
        <input
          id="nameinput"
          value={store.name}
          placeholder="logo"
          onChange={(e) => update({ name: e.target.value })}
          className="mc-input rounded-none px-2.5 py-1.5 text-[13px]"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-[13px] text-[#a6adc8]">
        Animation Style
        <Dropdown
          ariaLabel="Animation Style"
          value={String(store.type)}
          onChange={(v) => update({ type: Number(v) })}
          options={Object.entries(STYLE_LABELS).map(([value, label]) => ({ value, label }))}
          className="h-9"
        />
      </label>
      <p className="text-[11px] leading-snug text-[#6c7086]">
        Gradient Length multiplies how far the gradient scrolls each frame — higher values give a smoother, longer
        animation.
      </p>
    </div>
  );
}

function FormatPanel() {
  const { store, update } = useRgbStore();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
      <label className="flex flex-col gap-1.5 text-[13px] text-[#a6adc8]">
        Animation Name key
        <input
          id="namekey"
          value="%name%"
          readOnly
          className="mc-input rounded-none px-2.5 py-1.5 font-mono text-[13px] text-[#6c7086]"
        />
      </label>
      <textarea
        id="outputformat"
        value={store.outputFormat}
        onChange={(e) => update({ outputFormat: e.target.value })}
        className="mc-input min-h-36 flex-1 resize-none rounded-none p-2.5 font-mono text-xs leading-relaxed"
      />
      <p className="text-[11px] leading-snug text-[#6c7086]">
        Template for the generated config. <span className="font-mono">%name%</span> → animation name,{' '}
        <span className="font-mono">%speed%</span> → interval, <span className="font-mono">%output:{'  - "$t"'}%</span> →
        one line per frame.
      </p>
    </div>
  );
}

type Tab = 'settings' | 'format' | 'colors';

function ColorsPanel() {
  return (
    <div className="flex min-h-0 flex-1 flex-col p-4">
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <ColorList />
      </div>
    </div>
  );
}

function AnimTabTool() {
  const { store, pushToast } = useRgbStore();
  const [activeTab, setActiveTab] = useState<Tab>('settings');
  const [sideWidth, setSideWidth] = useState(320);
  const [copied, setCopied] = useState(false);
  const layoutRef = useRef<HTMLDivElement>(null);
  const output = useMemo(() => AnimationOutput(store, store), [store]);

  const dragSide = useCallback((clientX: number) => {
    const rect = layoutRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSideWidth(Math.min(560, Math.max(240, clientX - rect.left)));
  }, []);

  const copy = () => {
    navigator.clipboard
      .writeText(output)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
        pushToast('Copied to clipboard!', 'The TAB animation YAML has been copied successfully.', 'green');
      })
      .catch((err: unknown) =>
        pushToast('Failed to copy to clipboard!', err instanceof Error ? err.message : String(err), 'red'),
      );
  };
  const copyButton = (
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
  );

  const TABS: Array<{ key: Tab; label: string; icon: typeof Settings }> = [
    { key: 'colors', label: 'Colors', icon: Palette },
    { key: 'settings', label: 'Animation', icon: Settings },
    { key: 'format', label: 'Output Format', icon: Braces },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-3">
      <div ref={layoutRef} className="flex flex-col lg:flex-row">
        <nav className="order-1 flex shrink-0 flex-row gap-1.5 rounded-none border border-line bg-panel p-1.5 lg:sticky lg:top-0 lg:flex-col lg:self-start">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              title={label}
              aria-label={label}
              data-active={activeTab === key}
              className="mc-icon-btn h-10 w-10 rounded-none p-0"
            >
              <Icon size={18} />
            </button>
          ))}
        </nav>

        <div
          className="order-3 w-full shrink-0 lg:order-2 lg:sticky lg:top-0 lg:w-[var(--side-w)] lg:self-start"
          style={{ '--side-w': `${sideWidth}px` } as CSSProperties}
        >
          <Panel
            title={activeTab === 'colors' ? 'Colors' : activeTab === 'settings' ? 'Animation' : 'Output Format'}
            icon={activeTab === 'colors' ? Palette : activeTab === 'settings' ? Settings : Braces}
            className="max-h-[calc(100vh-6rem)]"
          >
            {activeTab === 'colors' ? <ColorsPanel /> : activeTab === 'settings' ? <SettingsPanel /> : <FormatPanel />}
          </Panel>
        </div>
        <div className="order-4 hidden shrink-0 lg:order-3 lg:block">
          <DragHandle orientation="vertical" onDrag={dragSide} />
        </div>

        <div className="mc-grid order-2 flex min-w-0 flex-1 flex-col lg:order-4">
          <Panel title="Animated Preview" icon={SquareActivity} className="relative z-10 overflow-visible">
            <div className="flex flex-col p-4">
              <Input>
                <AnimTabPreview />
              </Input>
              <ColorMap />
            </div>
          </Panel>

          <Panel title="TAB YAML" icon={Terminal} actions={<div className="flex items-center gap-1">{copyButton}</div>}>
            <textarea
              id="output"
              readOnly
              value={output}
              onClick={copy}
              title="Click to copy"
              className="mc-output font-mono h-64 w-full resize-none p-3 text-[13px] leading-relaxed whitespace-pre-wrap text-[#cdd6f4] outline-none"
            />
          </Panel>
        </div>
      </div>
    </div>
  );
}

export function AnimTabPage() {
  const [previewStyle, setPreviewStyle] = useState<PreviewStyle>('default');
  return (
    <RgbStoreProvider>
      <SelectionProvider>
        <PreviewStyleContext.Provider value={{ value: previewStyle, set: setPreviewStyle }}>
          <AnimTabTool />
          <Toasts />
        </PreviewStyleContext.Provider>
      </SelectionProvider>
    </RgbStoreProvider>
  );
}
