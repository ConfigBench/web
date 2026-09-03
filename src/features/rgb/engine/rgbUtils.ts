import type { ColorFormat, ColorStop, FormatKey, FormatSegment, Formatting } from './defaults';
import { FORMAT_KEYS } from './defaults';
import { hexToRGB, rgbToHex } from './colors';
import { ColorGradient, type GradientType, type RGBColorStop } from './gradients';
import { FONT_MAPPINGS } from './fonts';

export type { ColorFormat, ColorStop, FormatSegment, Formatting, FormatKey };

export type RgbOptions = {
  text: string;
  colors: ColorStop[];
  shadowColors: null | ColorStop[];
  colorLength: number;
  gradientType: GradientType;
  colorFormat: ColorFormat;
  formatting: FormatSegment[];
  baseFormatting: Formatting;
  prefixSuffix: string;
  customFormat: boolean;
  trimSpaces: boolean;
  disperse: boolean;
  lowercase: boolean;
  version: number;
};

export function segmentText(text: string, colorLength?: number): string[] {
  let len = colorLength ?? 1;
  if (!len || len < 1) len = 1;
  const out: string[] = [];
  const arr = Array.from(text);
  for (let i = 0; i < arr.length; i += len) out.push(arr.slice(i, i + len).join(''));
  return out;
}

export function formatNewlines(text: string, newline?: string): string {
  return text.replace(/\\n|\r?\n/g, newline !== undefined ? newline : '\\n');
}

export function isFormattingEqual(a: Formatting | null, b: Formatting | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    !!a.bold === !!b.bold &&
    !!a.italic === !!b.italic &&
    !!a.underline === !!b.underline &&
    !!a.strikethrough === !!b.strikethrough &&
    !!a.obfuscate === !!b.obfuscate &&
    a.font === b.font
  );
}

export function applyFont(text: string, fontName: string | undefined): string {
  if (!fontName) return text;
  const map = FONT_MAPPINGS[fontName];
  if (!map) return text;
  return Array.from(text)
    .map((char) => map[char] ?? char)
    .join('');
}

export function buildFormatCodes(formatting: Formatting, options: RgbOptions): string {
  let codes = '';
  if (options.colorFormat.color.includes('$f') && options.colorFormat.char) {
    const char = options.colorFormat.char;
    if (formatting.bold) codes += char + 'l';
    if (formatting.italic) codes += char + 'o';
    if (formatting.underline) codes += char + 'n';
    if (formatting.strikethrough) codes += char + 'm';
    if (formatting.obfuscate) codes += char + 'k';
  }
  return codes;
}

export function renderFormatPreviewLabel(format: ColorFormat, formatting: Formatting, options: RgbOptions): string {
  return format.color
    .replace('$1', 'r')
    .replace('$2', 'r')
    .replace('$3', 'g')
    .replace('$4', 'g')
    .replace('$5', 'b')
    .replace('$6', 'b')
    .replace('$f', buildFormatCodes(formatting, options))
    .replace('$c', '');
}

export function calculateDispersedPosition(length: number, index: number): number {
  return Math.round((100 / (length - 1)) * index * 1000) / 1000;
}

export function isDispersed(colors: ColorStop[]): boolean {
  return colors.every((color, i) => Math.abs(color.pos - calculateDispersedPosition(colors.length, i)) < 0.001);
}

export function disperseColors(colors: ColorStop[]): ColorStop[] {
  if (colors.length <= 1) return colors.slice(0).map((color) => ({ ...color, pos: 0 }));
  return colors.slice(0).map((color, i) => ({ ...color, pos: calculateDispersedPosition(colors.length, i) }));
}

export function sortColors(colors: ColorStop[]): ColorStop[] {
  return [...colors].sort((a, b) => a.pos - b.pos);
}

export function getShadowColors(options: Pick<RgbOptions, 'colors' | 'shadowColors'>): ColorStop[] {
  if (!options.shadowColors) {
    return options.colors.map((color) => {
      const shadowRGB = hexToRGB(color.hex).map((c) => c * 0.25);
      return { ...color, hex: `#${rgbToHex(shadowRGB)}` };
    });
  }
  return options.shadowColors;
}

export function getRGBColorStop(color: ColorStop): RGBColorStop {
  return { rgb: hexToRGB(color.hex), pos: color.pos };
}

export function getFormattingAtOffset(charIndex: number, options: RgbOptions): Formatting {
  const covering = options.formatting?.find((s) => s.start <= charIndex && s.end > charIndex);
  return covering ? { ...options.baseFormatting, ...covering } : { ...options.baseFormatting };
}

function applyFormatWrappers(output: string, format: ColorFormat, formatting: Formatting): string {
  let out = output;
  if (format.bold && formatting.bold) out = format.bold.replace('$t', out);
  if (format.italic && formatting.italic) out = format.italic.replace('$t', out);
  if (format.underline && formatting.underline) out = format.underline.replace('$t', out);
  if (format.strikethrough && formatting.strikethrough) out = format.strikethrough.replace('$t', out);
  if (format.obfuscate && formatting.obfuscate) out = format.obfuscate.replace('$t', out);
  return out;
}

export function renderTemplateSegment(
  hexWithoutHash: string,
  text: string,
  formatting: Formatting,
  options: RgbOptions,
  skipColor = false,
): string {
  let out = options.colorFormat.color;
  if (skipColor) {
    if (out.includes('$f$c')) out = '$f$c';
    else if (out.includes('$c')) out = '$c';
  }
  for (let n = 1; n <= 6; n++) out = out.replace(`$${n}`, hexWithoutHash.charAt(n - 1));
  out = out.replace('$f', buildFormatCodes(formatting, options));
  if (options.lowercase) out = out.toLowerCase();

  let segText = formatNewlines(text, options.colorFormat.newline);
  if (formatting.font) segText = applyFont(segText, formatting.font);
  out = out.replace('$c', segText);

  if (options.formatting && options.formatting.length > 0) {
    out = applyFormatWrappers(out, options.colorFormat, formatting);
  }
  return out;
}

export function applyWrappers(output: string, options: RgbOptions): string {
  let out = output;
  if (!options.formatting || options.formatting.length === 0) {
    out = applyFormatWrappers(out, options.colorFormat, options.baseFormatting);
  }
  if (options.prefixSuffix) out = options.prefixSuffix.replace(/\$t/g, out);
  return out;
}

type ShadowSegment = { text: string; hex: string; opacity: number; start: number; end: number };

function buildShadowSegments(options: RgbOptions, shadowColors: ColorStop[]): ShadowSegment[] {
  const segments = segmentText(options.text, options.colorLength);
  if (!segments.length || !shadowColors) return [];
  const shadowGradient = new ColorGradient(
    shadowColors.map(getRGBColorStop),
    segments.length,
    options.gradientType,
  );
  let cursor = 0;
  return segments.map((text) => {
    const shadow = shadowGradient.next();
    const start = cursor;
    const end = cursor + text.length;
    cursor = end;
    return {
      text,
      start,
      end,
      hex: `#${rgbToHex(shadow.slice(0, 3))}`,
      opacity: shadow[3] !== undefined ? shadow[3] / 255 : 1,
    };
  });
}

function applySelectiveFormattingToText(text: string, offset: number, options: RgbOptions): string {
  const chars = Array.from(text);
  let currentFmt: Formatting | undefined;
  let buffer = '';
  let out = '';

  const flush = () => {
    if (!buffer) return;
    if (!currentFmt) {
      out += formatNewlines(buffer, options.colorFormat.newline);
      buffer = '';
      return;
    }
    let formatted = formatNewlines(buffer, options.colorFormat.newline);
    if (currentFmt.font) formatted = applyFont(formatted, currentFmt.font);
    if (options.colorFormat.color === 'MiniMessage' && options.formatting && options.formatting.length > 0) {
      if (currentFmt.bold) formatted = `<b>${formatted}</b>`;
      if (currentFmt.italic) formatted = `<i>${formatted}</i>`;
      if (currentFmt.underline) formatted = `<u>${formatted}</u>`;
      if (currentFmt.strikethrough) formatted = `<st>${formatted}</st>`;
      if (currentFmt.obfuscate) formatted = `<obf>${formatted}</obf>`;
    }
    out += formatted;
    buffer = '';
  };

  let charOffset = offset;
  for (const ch of chars) {
    const covering = options.formatting?.find((s) => s.start <= charOffset && s.end > charOffset);
    const fmt = covering ? { ...options.baseFormatting, ...covering } : { ...options.baseFormatting };
    const fmtChanged =
      !currentFmt ||
      FORMAT_KEYS.some((k) => currentFmt?.[k] !== fmt[k]) ||
      currentFmt?.font !== fmt.font;
    if (fmtChanged) {
      flush();
      currentFmt = fmt;
    }
    buffer += ch;
    charOffset += ch.length;
  }
  flush();
  return out;
}

function buildShadowContent(shadowSegments: ShadowSegment[], start: number, end: number, options: RgbOptions): string {
  let currentHex: string | undefined;
  let currentOpacity: number | undefined;
  let buffer = '';
  let out = '';
  let bufferStartOffset = 0;

  const flush = () => {
    if (!buffer || !currentHex) return;
    const formatted = applySelectiveFormattingToText(buffer, bufferStartOffset, options);
    out += `<shadow:${currentHex}:${currentOpacity ?? 1}>${formatted}</shadow>`;
    buffer = '';
  };

  for (const seg of shadowSegments) {
    if (seg.end <= start || seg.start >= end) continue;
    const sliceStart = Math.max(start, seg.start) - seg.start;
    const sliceEnd = Math.min(end, seg.end) - seg.start;
    const slice = seg.text.slice(sliceStart, sliceEnd);
    if (!slice) continue;

    const sliceGlobalStart = Math.max(start, seg.start);
    if (currentHex && (currentHex !== seg.hex || currentOpacity !== seg.opacity)) flush();
    if (!buffer) bufferStartOffset = sliceGlobalStart;
    currentHex = seg.hex;
    currentOpacity = Math.round(seg.opacity * 1000) / 1000;
    buffer += slice;
  }
  flush();
  return out;
}

function normalizeShadowRGB(rgb: number[]): number[] {
  const norm = rgb.map((c) => Math.round((c / 255) * 100) / 100);
  if (norm[3] === undefined) norm.push(1);
  return norm;
}

function buildShadowGradient(options: RgbOptions): ColorGradient | undefined {
  if (!options.shadowColors) return undefined;
  return new ColorGradient(
    options.shadowColors.map(getRGBColorStop),
    options.text.length / (options.colorLength ?? 1),
    options.gradientType,
  );
}

type JsonExtra = {
  text: string;
  color?: string;
  shadow_color?: number[];
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  strikethrough?: boolean;
  obfuscated?: boolean;
};

function buildJsonFormatting(
  segment: string,
  colorHexWithHash: string,
  formatting: Formatting,
  options: RgbOptions,
  rgbShadow?: number[],
): JsonExtra {
  let textVal = formatNewlines(segment, options.colorFormat.newline);
  if (formatting.font) textVal = applyFont(textVal, formatting.font);
  const extra: JsonExtra = { text: textVal, color: colorHexWithHash };
  if (formatting.bold) extra.bold = true;
  if (formatting.italic) extra.italic = true;
  if (formatting.underline) extra.underlined = true;
  if (formatting.strikethrough) extra.strikethrough = true;
  if (formatting.obfuscate) extra.obfuscated = true;
  if (rgbShadow) extra.shadow_color = normalizeShadowRGB(rgbShadow);
  return extra;
}

function buildJsonExtraList(
  segments: string[],
  colorProvider: () => string,
  shadowProvider: () => number[] | undefined,
  options: RgbOptions,
): JsonExtra[] {
  const extra: JsonExtra[] = [];
  let charIndex = 0;
  for (const segment of segments) {
    const color = colorProvider();
    const shadow = shadowProvider();
    if (options.trimSpaces && segment.trim() === '') {
      extra.push({ text: formatNewlines(segment, options.colorFormat.newline) });
      charIndex += segment.length;
      continue;
    }
    const fmt = getFormattingAtOffset(charIndex, options);
    extra.push(buildJsonFormatting(segment, color, fmt, options, shadow));
    charIndex += segment.length;
  }
  return extra;
}

function renderJsonGradient(colors: ColorStop[], options: RgbOptions): string {
  const gradient = new ColorGradient(
    colors.map(getRGBColorStop),
    options.text.length / (options.colorLength ?? 1),
    options.gradientType,
  );
  const shadowGradient = buildShadowGradient(options);
  const segments = segmentText(options.text, options.colorLength);
  const hexProvider = () => {
    const hex = '#' + rgbToHex(gradient.next());
    return options.lowercase ? hex.toLowerCase() : hex;
  };
  const extra = buildJsonExtraList(
    segments,
    hexProvider,
    () => (shadowGradient ? shadowGradient.next() : undefined),
    options,
  );
  return JSON.stringify({ text: '', extra });
}

function renderTemplateGradient(colors: ColorStop[], options: RgbOptions): string {
  const gradient = new ColorGradient(
    colors.map(getRGBColorStop),
    options.text.length / (options.colorLength ?? 1),
    options.gradientType,
  );
  const segments = segmentText(options.text, options.colorLength);
  let charIndex = 0;
  let out = '';
  let previousHex: string | null = null;
  let previousFmt: Formatting | null = null;

  for (const segment of segments) {
    if (options.trimSpaces && segment.trim() === '') {
      out += formatNewlines(segment, options.colorFormat.newline);
      gradient.next();
      charIndex += segment.length;
      continue;
    }
    const hex = rgbToHex(gradient.next());
    const fmt = getFormattingAtOffset(charIndex, options);
    const skipColor =
      previousHex !== null && hex === previousHex && isFormattingEqual(fmt, previousFmt);
    out += renderTemplateSegment(hex, segment, fmt, options, skipColor);
    previousHex = hex;
    previousFmt = fmt;
    charIndex += segment.length;
  }
  return out;
}

function renderMiniMessageGradient(
  colors: ColorStop[],
  options: RgbOptions,
  shadowColors: ColorStop[] | null,
): string {
  const shadowSegments =
    shadowColors && shadowColors.length > 0 ? buildShadowSegments(options, shadowColors) : undefined;

  const buildShadowRange = (start: number, end: number) => {
    if (!shadowSegments || !shadowSegments.length) {
      return applySelectiveFormattingToText(options.text.substring(start, end), start, options);
    }
    return (
      buildShadowContent(shadowSegments, start, end, options) ||
      applySelectiveFormattingToText(options.text.substring(start, end), start, options)
    );
  };

  const renderUnevenGradient = (text: string) => {
    if (isDispersed(colors)) return null;
    const copy = [...colors];
    if (copy[0].pos !== 0) copy.unshift({ ...copy[0], pos: 0 });
    if (copy[copy.length - 1].pos !== 100) copy.push({ ...copy[copy.length - 1], pos: 100 });

    let out = '';
    for (let i = 0; i < copy.length - 1; i++) {
      let currentColor = copy[i];
      let nextColor = copy[i + 1];
      if (currentColor.pos > nextColor.pos) {
        const swap = currentColor;
        currentColor = nextColor;
        nextColor = swap;
      }
      const numSteps = text.length;
      const lowerRange = Math.round((copy[i].pos / 100) * numSteps);
      const upperRange = Math.round((copy[i + 1].pos / 100) * numSteps);
      if (lowerRange === upperRange) continue;
      const innerText = buildShadowRange(lowerRange, upperRange);
      out += `<gradient:${currentColor.hex}:${nextColor.hex}>${innerText}</gradient>`;
    }
    return out;
  };

  const lc = (hex: string) => (options.lowercase ? hex.toLowerCase() : hex);

  if (colors.length === 1) {
    const inner = buildShadowRange(0, options.text.length);
    return `<color:${lc(colors[0].hex)}>${inner}</color>`;
  }

  const unevenOut = renderUnevenGradient(options.text);
  if (unevenOut !== null) return unevenOut;

  const hexes = colors.map((c) => lc(c.hex)).join(':');
  const inner = buildShadowRange(0, options.text.length);
  return `<gradient:${hexes}>${inner}</gradient>`;
}

function renderSingleColorOutput(singleHex: string, options: RgbOptions): string {
  if (options.colorFormat.color === 'JSON') {
    const shadowGradient = buildShadowGradient(options);
    const segments = segmentText(options.text, options.colorLength);
    const extra = buildJsonExtraList(
      segments,
      () => singleHex,
      () => shadowGradient?.next(),
      options,
    );
    return JSON.stringify({ text: '', extra });
  }
  if (options.formatting && options.formatting.length > 0) {
    return renderTemplateGradient([{ hex: singleHex, pos: 0 }], options);
  }
  if (options.trimSpaces && options.text.trim() === '') {
    return formatNewlines(options.text, options.colorFormat.newline);
  }
  const hex = singleHex.replace(/^#/, '');
  return renderTemplateSegment(hex, options.text, options.baseFormatting, options);
}

export function generateOutput(rgbOptions: RgbOptions): string {
  const colors = sortColors(rgbOptions.colors);
  const shadowColors = rgbOptions.shadowColors ? sortColors(rgbOptions.shadowColors) : null;

  if (colors.length === 1) {
    if (rgbOptions.colorFormat.color === 'MiniMessage') {
      return applyWrappers(renderMiniMessageGradient(colors, rgbOptions, shadowColors), rgbOptions);
    }
    return applyWrappers(renderSingleColorOutput(colors[0].hex, rgbOptions), rgbOptions);
  }

  let output: string;
  if (rgbOptions.colorFormat.color === 'MiniMessage') {
    output = renderMiniMessageGradient(colors, rgbOptions, shadowColors);
  } else if (rgbOptions.colorFormat.color === 'JSON') {
    output = renderJsonGradient(colors, rgbOptions);
  } else {
    output = renderTemplateGradient(colors, rgbOptions);
  }
  return applyWrappers(output, rgbOptions);
}
