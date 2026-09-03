const COLOR_MAP: Record<string, string> = {
  '0': '#000000',
  '1': '#0000aa',
  '2': '#00aa00',
  '3': '#00aaaa',
  '4': '#aa0000',
  '5': '#aa00aa',
  '6': '#ffaa00',
  '7': '#aaaaaa',
  '8': '#555555',
  '9': '#5555ff',
  a: '#55ff55',
  b: '#55ffff',
  c: '#ff5555',
  d: '#ff55ff',
  e: '#ffff55',
  f: '#ffffff',
};

export interface SpanSegment {
  text: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  strikethrough?: boolean;
}

export function parseMinecraftFormatting(rawText: string): SpanSegment[][] {
  const lines = rawText.split(/\r?\n/);
  return lines.map((line) => {
    const segments: SpanSegment[] = [];
    let currentColor = '#ffffff';
    let isBold = false;
    let isItalic = false;
    let isUnderline = false;
    let isStrikethrough = false;

    let buffer = '';

    const flush = () => {
      if (buffer) {
        segments.push({
          text: buffer,
          color: currentColor,
          bold: isBold,
          italic: isItalic,
          underlined: isUnderline,
          strikethrough: isStrikethrough,
        });
        buffer = '';
      }
    };

    let i = 0;
    while (i < line.length) {
      if ((line[i] === '§' || line[i] === '&') && i + 1 < line.length) {
        if (line[i + 1] === '#' && i + 7 < line.length) {
          const hexPart = line.slice(i + 2, i + 8);
          if (/^[0-9a-fA-F]{6}$/.test(hexPart)) {
            flush();
            currentColor = `#${hexPart}`;
            isBold = false;
            isItalic = false;
            isUnderline = false;
            isStrikethrough = false;
            i += 8;
            continue;
          }
        }

        if (line[i + 1]?.toLowerCase() === 'x' && i + 13 < line.length) {
          const bungeePattern = /^[§&]x[§&]([0-9a-fA-F])[§&]([0-9a-fA-F])[§&]([0-9a-fA-F])[§&]([0-9a-fA-F])[§&]([0-9a-fA-F])[§&]([0-9a-fA-F])/;
          const match = line.slice(i, i + 14).match(bungeePattern);
          if (match) {
            flush();
            currentColor = `#${match[1]}${match[2]}${match[3]}${match[4]}${match[5]}${match[6]}`;
            isBold = false;
            isItalic = false;
            isUnderline = false;
            isStrikethrough = false;
            i += 14;
            continue;
          }
        }

        const code = line[i + 1].toLowerCase();
        if (code in COLOR_MAP) {
          flush();
          currentColor = COLOR_MAP[code];
          isBold = false;
          isItalic = false;
          isUnderline = false;
          isStrikethrough = false;
          i += 2;
          continue;
        } else if (code === 'l') {
          flush();
          isBold = true;
          i += 2;
          continue;
        } else if (code === 'o') {
          flush();
          isItalic = true;
          i += 2;
          continue;
        } else if (code === 'n') {
          flush();
          isUnderline = true;
          i += 2;
          continue;
        } else if (code === 'm') {
          flush();
          isStrikethrough = true;
          i += 2;
          continue;
        } else if (code === 'r') {
          flush();
          currentColor = '#ffffff';
          isBold = false;
          isItalic = false;
          isUnderline = false;
          isStrikethrough = false;
          i += 2;
          continue;
        }
      }
      buffer += line[i];
      i++;
    }
    flush();
    return segments;
  });
}
