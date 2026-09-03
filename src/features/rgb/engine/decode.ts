import type { FormatSegment } from './defaults';

export interface CharFormatting {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  obfuscate?: boolean;
}

export interface LegacyDecodeResult {
  plainText: string;
  colors: Array<{ hex: string; pos: number }>;
  charFormattings: CharFormatting[];
}

function hexToHSL(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 100, s: 100, l: 100 };
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h /= 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function getSignificantPoints(gradient: string[], threshold: number): string[] {
  const hslColors = gradient.map(hexToHSL);
  const differences: Array<{ index: number; change: number }> = [];
  for (let i = 1; i < hslColors.length; i++) {
    const hDiff = Math.abs(hslColors[i].h - hslColors[i - 1].h);
    const sDiff = Math.abs(hslColors[i].s - hslColors[i - 1].s);
    const lDiff = Math.abs(hslColors[i].l - hslColors[i - 1].l);
    differences.push({ index: i, change: hDiff * 2 + sDiff + lDiff });
  }

  const significantPoints = [gradient[0]];
  for (let i = 1; i < differences.length; i++) {
    if (differences[i - 1].change > threshold) {
      significantPoints.push(gradient[differences[i - 1].index]);
    }
  }
  significantPoints.push(gradient[gradient.length - 1]);
  return significantPoints;
}

export function decodeLegacy(rgbtext: string): LegacyDecodeResult | null {
  if (!rgbtext || !rgbtext.trim()) return null;
  const codeRegex =
    /(?:(?:[&§]|\\u00a7)x(?:(?:[&§]|\\u00a7)[0-9A-Fa-f]){6}|(?:&|§)#[0-9A-Fa-f]{6}|[&#§][0-9A-Fa-f]{6}|<span[^>]*style=["']([^"']*)["'][^>]*>|<\/span>|(?:[&§]|\\u00a7)[l-orL-ORkK])/gi;

  const matches = [...rgbtext.matchAll(codeRegex)];
  if (matches.length === 0) return null;

  const colors: Array<{ hex: string; pos: number }> = [];
  const charFormattings: CharFormatting[] = [];
  let plainText = '';

  let currentColor = '#ffffff';
  const currentFmts: CharFormatting = {
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    obfuscate: false,
  };

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const codeStr = match[0];

    if (codeStr.toLowerCase().startsWith('<span')) {
      const styleAttr = match[1] || '';
      const colorMatch = styleAttr.match(/color:\s*(#[0-9a-fA-F]{6})/i);
      if (colorMatch) currentColor = colorMatch[1];
      if (/font-weight:\s*bold/i.test(styleAttr)) currentFmts.bold = true;
      if (/font-style:\s*italic/i.test(styleAttr)) currentFmts.italic = true;
      if (/text-decoration:[^;]*underline/i.test(styleAttr)) currentFmts.underline = true;
      if (/text-decoration:[^;]*line-through/i.test(styleAttr)) currentFmts.strikethrough = true;
    } else if (codeStr.toLowerCase() !== '</span>') {
      const lastChar = codeStr.charAt(codeStr.length - 1).toLowerCase();
      const isFormatCode = /^(?:[&§]|\\u00a7)[l-orL-ORkK]$/i.test(codeStr);
      if (isFormatCode) {
        if (lastChar === 'r') {
          currentColor = '#ffffff';
          currentFmts.bold = false;
          currentFmts.italic = false;
          currentFmts.underline = false;
          currentFmts.strikethrough = false;
          currentFmts.obfuscate = false;
        } else if (lastChar === 'l') currentFmts.bold = true;
        else if (lastChar === 'o') currentFmts.italic = true;
        else if (lastChar === 'n') currentFmts.underline = true;
        else if (lastChar === 'm') currentFmts.strikethrough = true;
        else if (lastChar === 'k') currentFmts.obfuscate = true;
      } else if (codeStr.startsWith('&#') || codeStr.startsWith('§#')) {
        currentColor = '#' + codeStr.slice(2);
      } else if (codeStr.startsWith('#')) {
        currentColor = codeStr;
      } else {
        const hexDigits = codeStr.replace(/(?:[&§]|\\u00a7|x)/gi, '');
        currentColor = '#' + hexDigits;
      }
    }

    const startIdx = match.index + codeStr.length;
    const endIdx = i + 1 < matches.length ? matches[i + 1].index : rgbtext.length;
    const textSegment = rgbtext.substring(startIdx, endIdx);

    for (let c = 0; c < textSegment.length; c++) {
      colors.push({ hex: currentColor.toLowerCase(), pos: 0 });
      charFormattings.push({ ...currentFmts });
    }
    plainText += textSegment;
  }

  const totalLength = colors.length;
  for (let i = 0; i < totalLength; i++) {
    colors[i].pos = totalLength > 1 ? (100 / (totalLength - 1)) * i : 0;
  }

  return { plainText, colors, charFormattings };
}

export function buildFormatSegments(charFormattings: CharFormatting[]): FormatSegment[] {
  const segments: FormatSegment[] = [];
  let currentFmt: CharFormatting | null = null;
  let startIdx = -1;

  const hasFmt = (f: CharFormatting) => !!(f.bold || f.italic || f.underline || f.strikethrough || f.obfuscate);
  const same = (a: CharFormatting, b: CharFormatting) =>
    !!a.bold === !!b.bold &&
    !!a.italic === !!b.italic &&
    !!a.underline === !!b.underline &&
    !!a.strikethrough === !!b.strikethrough &&
    !!a.obfuscate === !!b.obfuscate;

  const push = (from: number, to: number, fmt: CharFormatting) => {
    segments.push({
      start: from,
      end: to,
      ...(fmt.bold && { bold: true }),
      ...(fmt.italic && { italic: true }),
      ...(fmt.underline && { underline: true }),
      ...(fmt.strikethrough && { strikethrough: true }),
      ...(fmt.obfuscate && { obfuscate: true }),
    });
  };

  for (let i = 0; i < charFormattings.length; i++) {
    const fmt = charFormattings[i];
    const isSame = currentFmt && same(currentFmt, fmt);
    if (!isSame) {
      if (currentFmt && hasFmt(currentFmt)) push(startIdx, i, currentFmt);
      startIdx = i;
      currentFmt = fmt;
    }
  }
  if (currentFmt && hasFmt(currentFmt)) push(startIdx, charFormattings.length, currentFmt);
  return segments;
}
