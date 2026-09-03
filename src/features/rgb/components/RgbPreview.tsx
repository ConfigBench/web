import { useContext, useMemo, type ReactNode } from 'react';
import { hexToRGB } from '../engine/colors';
import { ColorGradient, type GradientType } from '../engine/gradients';
import { getShadowColors, sortColors, applyFont } from '../engine/rgbUtils';
import { FORMAT_KEYS, type FormatSegment, type Formatting } from '../engine/defaults';
import { useRgbStore, SelectionContext } from './rgbContexts';
import { formattingClasses, toCSS } from './previewUtils';
import { cn } from '../../../shared/lib/cn';

interface RgbPreviewProps {
  override?: {
    text: string;
    colors: { hex: string; pos: number }[];
    shadowColors: { hex: string; pos: number }[] | null;
    colorLength: number;
    gradientType: GradientType;
    formatting: FormatSegment[];
    baseFormatting: Formatting;
  };
  shadowLength?: number;
  showSelection?: boolean;
}

export default function RgbPreview({ override, shadowLength = 4, showSelection = true }: RgbPreviewProps) {
  const { store } = useRgbStore();
  const selection = useContext(SelectionContext);

  const text = override?.text ?? store.text;
  const colors = override?.colors ?? store.colors;
  const colorLength = Math.max(1, Math.floor(override?.colorLength ?? store.colorLength));
  const gradientType = override?.gradientType ?? store.gradientType;
  const formattingList = override?.formatting ?? store.formatting;
  const baseFormatting = override?.baseFormatting ?? store.baseFormatting;
  const shadowColors = override?.shadowColors ?? (store.shadowColors ? getShadowColors(store) : null);

  const rendered = useMemo(() => {
    if (!text || text.trim() === '') return null;
    if (colors.length < 1) return null;

    const chars = Array.from(text);
    const bucketCount = Math.max(1, Math.ceil(chars.length / colorLength));
    const gradient = new ColorGradient(
      sortColors(colors).map((c) => ({ rgb: hexToRGB(c.hex), pos: c.pos })),
      bucketCount,
      gradientType,
    );
    const shadowGradient = shadowColors
      ? new ColorGradient(sortColors(shadowColors).map((c) => ({ rgb: hexToRGB(c.hex), pos: c.pos })), bucketCount)
      : null;
    const gradientColors = Array.from({ length: bucketCount }, () => gradient.next());
    const shadowColorsSampled = shadowGradient
      ? Array.from({ length: bucketCount }, () => shadowGradient.next())
      : null;

    const cursorIndex =
      showSelection && selection && selection.start === selection.end ? selection.start : -1;

    const spans: ReactNode[] = [];
    chars.forEach((char, index) => {
      if (index === cursorIndex) {
        spans.push(<span key="custom-cursor" className="custom-cursor" />);
      }
      const fmt = { ...baseFormatting };
      for (const segment of formattingList) {
        if (segment.start <= index && index < segment.end) {
          for (const key of FORMAT_KEYS) {
            if (segment[key] !== undefined) fmt[key] = segment[key];
          }
          if (segment.font !== undefined) fmt.font = segment.font;
        }
      }

      const bucketIndex = Math.min(Math.floor(index / colorLength), bucketCount - 1);
      const rgb = gradientColors[bucketIndex];
      const rgbCSS = toCSS(rgb);
      const rgbShadow = shadowColorsSampled?.[bucketIndex];
      const rgbShadowCSS = rgbShadow ? toCSS(rgbShadow) : null;

      let segmentText = char;
      if (fmt.font) segmentText = applyFont(segmentText, fmt.font);

      const isSelected =
        selection &&
        selection.start !== selection.end &&
        index >= selection.start &&
        index < selection.end;

      const isNewline = segmentText === '\n' || segmentText === '\r';

      spans.push(
        <span
          key={`char${index}`}
          style={{
            color: rgbCSS,
            ...(rgbShadowCSS && { textShadow: `${shadowLength}px ${shadowLength}px 0 ${rgbShadowCSS}` }),
          }}
          className={cn(
            'char-span',
            isNewline && 'inline!',
            isSelected && showSelection && 'bg-[var(--accent)]/40 !text-white',
            formattingClasses(fmt),
          )}
          data-text={segmentText}
        >
          {isNewline ? (
            <>
              {'\u00A0'}
              <br />
            </>
          ) : segmentText === ' ' ? (
            '\u00A0'
          ) : (
            segmentText
          )}
        </span>,
      );
    });

    if (cursorIndex === chars.length) {
      spans.push(<span key="custom-cursor" className="custom-cursor" />);
    }
    return spans;
  }, [text, colors, colorLength, gradientType, formattingList, baseFormatting, shadowColors, selection, shadowLength, showSelection]);

  if (!rendered) {
    return <span className="text-[#a6adc8]/25 font-mc">ConfigBench</span>;
  }
  return rendered;
}
