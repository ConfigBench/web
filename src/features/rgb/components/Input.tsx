import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { Eye, Pencil } from 'lucide-react';
import { cn } from '../../../shared/lib/cn';
import { generateOutput } from '../engine/rgbUtils';
import { useRgbStore } from './rgbContexts';
import RgbPreview from './RgbPreview';
import Formatting from './Formatting';
import Dropdown from '../../../shared/components/ui/Dropdown';
import { PreviewStyleContext, SelectionSetterContext } from './rgbContexts';
import { PREVIEW_STYLES, type PreviewStyle } from './previewStyles';

const SCENES = [
  '/scene_dark_1.jpg',
  '/scene_dark_2.jpg',
  '/scene_dark_3.jpg',
  '/scene_dark_4.jpg',
  '/scene_dark_5.jpg',
  '/scene_dark_6.jpg',
  '/scene_light_1.jpg',
  '/scene_light_2.jpg',
];

function useScene(): string {
  const [scene] = useState(() => SCENES[Math.floor(Math.random() * SCENES.length)]);
  return scene;
}

interface InputProps {
  children?: ReactNode;
  readOnly?: boolean;
  className?: string;
  previewClass?: string;
  rawEdit?: boolean;
  style?: CSSProperties;
}

function InputField({ children, readOnly, className, previewClass, rawEdit = false, style }: InputProps) {
  const { store, update } = useRgbStore();
  const setSelection = useContext(SelectionSetterContext);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartIndex = useRef(0);
  const overlayRef = useRef<HTMLParagraphElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const indexFromXY = useCallback((clientX: number, clientY: number): number => {
    const spans = overlayRef.current?.querySelectorAll<HTMLElement>('.char-span');
    if (!spans || spans.length === 0) return 0;

    let maxBottom = -Infinity;
    let minTop = Infinity;
    const entries: Array<{ index: number; rect: DOMRect; distY: number; isNewline: boolean }> = [];
    spans.forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      maxBottom = Math.max(maxBottom, rect.bottom);
      minTop = Math.min(minTop, rect.top);
      const distY = Math.max(0, rect.top - clientY, clientY - rect.bottom);
      const dataText = el.getAttribute('data-text');
      entries.push({ index, rect, distY, isNewline: dataText === '\n' || dataText === '\r' });
    });

    if (clientY > maxBottom + 10) return spans.length;
    if (clientY < minTop - 10) return 0;

    const minDistY = Math.min(...entries.map((e) => e.distY));
    const line = entries.filter((e) => e.distY <= minDistY + 5).sort((a, b) => a.rect.left - b.rect.left);
    for (const item of line) {
      if (item.isNewline) {
        if (clientX < item.rect.right) return item.index;
      } else if (clientX < item.rect.left + item.rect.width / 2) {
        return item.index;
      }
    }
    const last = line[line.length - 1];
    return last ? (last.isNewline ? last.index : last.index + 1) : spans.length;
  }, []);

  const place = useCallback(
    (start: number, end: number) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(start, end);
      setSelection?.({ start, end });
    },
    [setSelection],
  );

  const syncSelection = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    setSelection?.({ start: el.selectionStart ?? 0, end: el.selectionEnd ?? el.selectionStart ?? 0 });
  }, [setSelection]);

  return (
    <div
      className={cn('relative cursor-text break-all caret-white', className)}
      style={style}
      onPointerDown={(e) => {
        if (rawEdit || readOnly || e.button !== 0) return;
        e.preventDefault();
        const target = indexFromXY(e.clientX, e.clientY);
        setIsDragging(true);
        dragStartIndex.current = target;
        place(target, target);
      }}
      onPointerMove={(e) => {
        if (!isDragging || rawEdit || readOnly) return;
        const target = indexFromXY(e.clientX, e.clientY);
        place(Math.min(dragStartIndex.current, target), Math.max(dragStartIndex.current, target));
      }}
      onPointerUp={() => setIsDragging(false)}
      onDoubleClick={(e) => {
        if (rawEdit || readOnly) return;
        e.preventDefault();
        const target = indexFromXY(e.clientX, e.clientY);
        let start = target;
        while (start > 0 && !/\s/.test(store.text[start - 1])) start--;
        let end = target;
        while (end < store.text.length && !/\s/.test(store.text[end])) end++;
        place(start, end);
      }}
    >
      <p
        ref={overlayRef}
        id="input-overlay"
        className={cn('whitespace-pre-wrap select-none', previewClass)}
        style={{ visibility: rawEdit ? 'hidden' : 'visible' }}
      >
        {children}
      </p>
      {!readOnly && (
        <textarea
          ref={textareaRef}
          id="input"
          spellCheck={false}
          className={cn(
            'absolute inset-0 resize-none whitespace-pre-wrap border-none bg-transparent outline-none selection:bg-[var(--accent)]/40 selection:text-white',
            previewClass,
            rawEdit
              ? 'pointer-events-auto caret-[var(--accent)] text-white opacity-100'
              : 'pointer-events-none text-transparent opacity-0',
          )}
          value={store.text}
          onScroll={(e) => {
            const el = e.currentTarget;
            if (overlayRef.current) {
              overlayRef.current.scrollLeft = el.scrollLeft;
              overlayRef.current.scrollTop = el.scrollTop;
            }
          }}
          onChange={(e) => {
            const value = e.target.value;
            update({ text: value });
            setSelection?.({ start: e.target.selectionStart ?? 0, end: e.target.selectionStart ?? 0 });
          }}
          onSelect={syncSelection}
          onKeyUp={syncSelection}
          onKeyDown={syncSelection}
          onMouseUp={syncSelection}
        />
      )}
    </div>
  );
}

function ChatSection({ readOnly, rawEdit, playerName }: { readOnly?: boolean; rawEdit: boolean; playerName: string }) {
  return (
    <div
      className="absolute bottom-24 min-h-8 w-3/4 overflow-y-auto bg-black/50 px-2 py-0.5 text-2xl"
      style={{ maxHeight: 'calc(100% - 7rem)' }}
    >
      {!readOnly && <p className="!text-white">{`<${playerName}>`} Type here!</p>}
      <InputField readOnly={readOnly} rawEdit={rawEdit}>
        {readOnly && <span className="mr-2 !text-white">{`<${playerName}>`}</span>}
        <SlotInput />
      </InputField>
    </div>
  );
}

function SlotInput() {
  return <RgbPreview />;
}

function TabSection({ readOnly, rawEdit, style }: { readOnly?: boolean; rawEdit: boolean; style: PreviewStyle }) {
  return (
    <div className="w-3/4 max-h-64 min-h-8 overflow-auto bg-black/50 py-1 px-1 text-2xl">
      {style === 'tab-header' && (
        <InputField readOnly={readOnly} rawEdit={rawEdit} previewClass="text-center pb-1">
          <SlotInput />
        </InputField>
      )}
      <div className="flex h-5 gap-0.5 overflow-hidden bg-[#aaaaaa]/20 pr-0.5 text-left text-2xl">
        <img width={20} height={20} className="aspect-square" src="/branding_icon_bg_8x8.png" alt="" style={{ imageRendering: 'pixelated' }} />
        <p className="-mt-0.5 flex-1 leading-none !text-white">ConfigBench</p>
        <img width={25} height={20} src="/minecraft_ping_5.png" alt="" style={{ imageRendering: 'pixelated' }} />
      </div>
      {style === 'tab-player' && (
        <div className="flex gap-0.5 overflow-hidden bg-[#aaaaaa]/20 pr-0.5 text-left text-2xl">
          <img width={20} height={20} className="aspect-square" src="/branding_icon_bg_8x8.png" alt="" style={{ imageRendering: 'pixelated' }} />
          <InputField readOnly={readOnly} rawEdit={rawEdit} className="-mb-0.5 flex-1 leading-none">
            <SlotInput />
          </InputField>
          <img width={25} height={20} src="/minecraft_ping_5.png" alt="" style={{ imageRendering: 'pixelated' }} />
        </div>
      )}
      {style === 'tab-footer' && (
        <InputField readOnly={readOnly} rawEdit={rawEdit} previewClass="text-center pt-1">
          <SlotInput />
        </InputField>
      )}
    </div>
  );
}

function GuiSection({ readOnly, rawEdit, style }: { readOnly?: boolean; rawEdit: boolean; style: PreviewStyle }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-4 backdrop-blur-[2px]">
      <div className="relative w-3/5 max-w-md">
        <img src="/minecraft_chest.png" alt="" className="w-full!" style={{ imageRendering: 'pixelated' }} width={176} height={168} />
        <div className="absolute inset-0 text-xs sm:text-sm md:text-base lg:text-2xl [&_*]:!text-shadow-none">
          {style === 'gui-chest' ? (
            <InputField
              readOnly={readOnly}
              rawEdit={rawEdit}
              previewClass="whitespace-nowrap overflow-hidden"
              className="absolute top-[calc(4/168*100%)] left-[calc(8/176*100%)] w-[calc(160/176*100%)]"
            >
              <SlotInput />
            </InputField>
          ) : (
            <p className="absolute top-[calc(4/168*100%)] left-[calc(8/176*100%)] !text-[#404040]">ConfigBench</p>
          )}
          <img
            src="/minecraft_cyan_dye.png"
            alt=""
            className="absolute top-[calc(18/168*100%)] left-[calc(9/176*100%)] h-[calc(13/168*100%)] w-[calc(13/176*100%)]"
            style={{ imageRendering: 'pixelated' }}
            width={16}
            height={16}
          />
          <p className="absolute top-[calc(72/168*100%)] left-[calc(8/176*100%)] !text-[#404040]">ConfigBench</p>
          {(style === 'gui-item-name' || style === 'gui-item-lore') && (
            <div className="absolute top-[calc(28/168*100%)] left-[calc(20/176*100%)] z-10 whitespace-nowrap bg-[#100010]/95 p-1">
              {style === 'gui-item-lore' && <p className="!text-white">Cyan Dye</p>}
              <InputField readOnly={readOnly} rawEdit={rawEdit} previewClass="whitespace-nowrap">
                <SlotInput />
              </InputField>
              <div aria-hidden className="pointer-events-none absolute inset-0">
                <span className="absolute top-full left-0 h-0.5 w-full bg-[#100010]/95" />
                <span className="absolute bottom-full left-0 h-0.5 w-full bg-[#100010]/95" />
                <span className="absolute top-0 left-full h-full w-0.5 bg-[#100010]/95" />
                <span className="absolute top-0 right-full h-full w-0.5 bg-[#100010]/95" />
                <span className="absolute top-[calc(100%-2px)] left-0.5 h-0.5 w-[calc(100%-4px)] bg-[#28007f]/50" />
                <span className="absolute bottom-[calc(100%-2px)] left-0.5 h-0.5 w-[calc(100%-4px)] bg-[#5000ff]/50" />
                <span className="absolute top-0.5 left-[calc(100%-2px)] h-[calc(100%-4px)] w-0.5 bg-linear-to-b from-[#5000ff]/50 to-[#28007f]/50" />
                <span className="absolute top-0.5 right-[calc(100%-2px)] h-[calc(100%-4px)] w-0.5 bg-linear-to-b from-[#5000ff]/50 to-[#28007f]/50" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MotdSection({ readOnly, rawEdit }: { readOnly?: boolean; rawEdit: boolean }) {
  const scene = useScene();
  return (
    <div className="font-mc relative flex w-full justify-center overflow-hidden p-4">
      <img src={scene} alt="" className="absolute inset-0 h-full w-full scale-105 object-cover blur-sm" />
      <div className="relative z-10 flex w-full max-w-2xl items-start gap-2 border border-white/10 p-1" style={{ background: 'rgba(0,0,0,0.45)' }}>
        <img src="/branding_icon_bg_64x64.png" width={64} height={64} alt="" className="h-full w-auto" style={{ imageRendering: 'pixelated' }} />
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="font-mc truncate leading-none text-white" style={{ textShadow: '2px 2px 0 #3f3f3f' }}>
              Minecraft Server
            </span>
            <div className="font-mc flex shrink-0 items-center gap-1 text-sm leading-none sm:text-base">
              <span style={{ color: '#AAAAAA', textShadow: '2px 2px 0 #2a2a2a' }}>
                42<span style={{ color: '#555555' }}>/</span>100
              </span>
              <img src="/minecraft_ping_5.png" width={20} height={16} alt="" className="mx-1" style={{ imageRendering: 'pixelated' }} />
            </div>
          </div>
          <InputField readOnly={readOnly} rawEdit={rawEdit} className="-mb-0.5 flex-1 leading-none">
            <SlotInput />
          </InputField>
        </div>
      </div>
    </div>
  );
}

interface InputOuterProps {
  children?: ReactNode;
  readOnly?: boolean;
  playerName?: string;
}

export default function Input({ children, readOnly, playerName = 'ConfigBench' }: InputOuterProps) {
  const { store } = useRgbStore();
  const [rawEdit, setRawEdit] = useState(false);
  const { value: previewStyle, set: setPreviewStyle } = useContext(PreviewStyleContext);
  useEffect(() => {
    const el = document.getElementById('input') as HTMLTextAreaElement | null;
    if (!el) return;
    el.focus();
    el.setSelectionRange(store.text.length, store.text.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewStyle]);

  const scene = useScene();

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {!readOnly && <Formatting />}
        <div className="ml-auto flex items-center gap-1.5">
          {!readOnly && (
            <button
              type="button"
              onClick={() => setRawEdit((r) => !r)}
              title={rawEdit ? 'View Formatted Preview' : 'Raw Edit Mode'}
              className="mc-icon-btn h-9 w-9 rounded-none p-0"
              data-active={rawEdit}
            >
              {rawEdit ? <Eye size={17} /> : <Pencil size={17} />}
            </button>
          )}
          <Dropdown
            ariaLabel="Preview style"
            value={previewStyle}
            onChange={(v) => setPreviewStyle(v as PreviewStyle)}
            options={PREVIEW_STYLES.map((s) => ({ value: s.value, label: s.label }))}
            className="h-9 w-52"
            align="right"
          />
        </div>
      </div>
      <label htmlFor="input" className="relative mt-2 mb-4 flex flex-col items-start">
        {previewStyle === 'motd' && <MotdSection readOnly={readOnly} rawEdit={rawEdit} />}
        {previewStyle !== 'default' && previewStyle !== 'motd' && (
          <div className="font-mc relative w-full break-all" style={{ textShadow: '2px 2px 0 #373737' }}>
            <img src={scene} alt="" className="w-full rounded" />
            <p className="absolute bottom-1 left-1 h-8 w-[calc(100%-0.5rem)] overflow-auto bg-black/50 px-1 py-0.5 text-2xl whitespace-nowrap !text-white">
              {generateOutput(store)}
            </p>
            <div
              className={cn(
                'absolute flex w-full flex-col text-2xl',
                (previewStyle === 'chat' || previewStyle.startsWith('gui')) && 'bottom-0 h-full overflow-auto',
                previewStyle.startsWith('tab') && 'top-5 max-h-64 min-h-8 items-center justify-center px-2 text-center',
              )}
            >
              {previewStyle.startsWith('tab') && <TabSection readOnly={readOnly} rawEdit={rawEdit} style={previewStyle} />}
              {previewStyle === 'chat' && <ChatSection readOnly={readOnly} rawEdit={rawEdit} playerName={playerName} />}
              {previewStyle.startsWith('gui') && <GuiSection readOnly={readOnly} rawEdit={rawEdit} style={previewStyle} />}
            </div>
          </div>
        )}
        {previewStyle === 'default' && (
          <InputField
            readOnly={readOnly}
            rawEdit={rawEdit}
            className="mc-input font-mc w-full text-3xl md:text-4xl xl:text-5xl focus-within:border-[var(--accent)]"
            previewClass="p-3"
          >
            {children ?? <SlotInput />}
          </InputField>
        )}
      </label>
    </>
  );
}
