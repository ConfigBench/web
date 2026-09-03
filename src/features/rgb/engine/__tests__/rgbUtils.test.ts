import { combinedDefaults } from '../defaults';
import { disperseColors, generateOutput, isDispersed, sortColors } from '../rgbUtils';
import type { RgbOptions } from '../rgbUtils';

const base: RgbOptions = {
  ...(combinedDefaults as unknown as RgbOptions),
  text: 'abc',
  colors: [
    { hex: '#ff0000', pos: 0 },
    { hex: '#00ff00', pos: 100 },
  ],
};

describe('generateOutput', () => {
  it('emits a single MiniMessage gradient tag for dispersed stops', () => {
    const out = generateOutput({ ...base, colorFormat: { color: 'MiniMessage' } });
    expect(out).toBe('<gradient:#ff0000:#00ff00>abc</gradient>');
  });

  it('renders legacy &# format per bucket', () => {
    const out = generateOutput({ ...base, colorFormat: { color: '&#$1$2$3$4$5$6$f$c', char: '&' } });
    expect(out).toBe('&#FF0000a&#808000b&#00FF00c');
  });

  it('renders JSON with text extras and colors', () => {
    const out = generateOutput({ ...base, colorFormat: { color: 'JSON' } });
    const parsed = JSON.parse(out) as { text: string; extra: Array<{ text: string; color: string }> };
    expect(parsed.text).toBe('');
    expect(parsed.extra.map((e) => e.text).join('')).toBe('abc');
    expect(parsed.extra[0].color).toBe('#FF0000');
    expect(parsed.extra[2].color).toBe('#00FF00');
  });

  it('applies base formatting wrappers in MiniMessage mode', () => {
    const out = generateOutput({
      ...base,
      colorFormat: { color: 'MiniMessage', bold: '<b>$t</b>' },
      baseFormatting: { bold: true },
    });
    expect(out).toBe('<b><gradient:#ff0000:#00ff00>abc</gradient></b>');
  });

  it('lowercases hex when lowercase is set', () => {
    const out = generateOutput({
      ...base,
      colors: [
        { hex: '#FF0000', pos: 0 },
        { hex: '#00FF00', pos: 100 },
      ],
      colorFormat: { color: '&#$1$2$3$4$5$6$f$c', char: '&' },
      lowercase: true,
    });
    expect(out).toBe('&#ff0000a&#808000b&#00ff00c');
  });

  it('produces custom shadow segments in MiniMessage mode', () => {
    const out = generateOutput({
      ...base,
      colorFormat: { color: 'MiniMessage' },
      shadowColors: [
        { hex: '#111111', pos: 0 },
        { hex: '#111111', pos: 100 },
      ],
    });
    expect(out).toContain('<shadow:#111111:1>');
  });

  it('respects colorLength buckets', () => {
    const out = generateOutput({
      ...base,
      text: 'abcd',
      colorLength: 2,
      colorFormat: { color: '&#$1$2$3$4$5$6$f$c', char: '&' },
    });
    expect(out).toBe('&#FF0000ab&#00FF00cd');
  });
});

describe('color helpers', () => {
  it('sorts colors by position', () => {
    const sorted = sortColors([
      { hex: '#00ff00', pos: 100 },
      { hex: '#ff0000', pos: 0 },
    ]);
    expect(sorted[0].hex).toBe('#ff0000');
  });

  it('disperses evenly and detects dispersion', () => {
    const dispersed = disperseColors([
      { hex: '#ff0000', pos: 0 },
      { hex: '#ffff00', pos: 10 },
      { hex: '#00ff00', pos: 100 },
    ]);
    expect(dispersed.map((c) => c.pos)).toEqual([0, 50, 100]);
    expect(isDispersed(dispersed)).toBe(true);
    expect(isDispersed([{ hex: '#ff0000', pos: 0 }, { hex: '#00ff00', pos: 100 }])).toBe(true);
  });
});
