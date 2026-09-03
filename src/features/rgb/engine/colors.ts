export type RGB = [number, number, number];
export type RGBA = [number, number, number, number];

interface HSL {
  h: number;
  s: number;
  l: number;
}
interface Lab {
  l: number;
  a: number;
  b: number;
}
interface Lch {
  l: number;
  c: number;
  h: number;
}
interface Oklab {
  l: number;
  a: number;
  b: number;
}

const clampByte = (c: number) => Math.round(Math.min(255, Math.max(0, c)));

function hexChar(c: number): string {
  const s = '0123456789ABCDEF';
  const i = clampByte(c);
  return s.charAt((i - (i % 16)) / 16) + s.charAt(i % 16);
}

export function rgbToHex(color: number[]): string {
  return hexChar(color[0]) + hexChar(color[1]) + hexChar(color[2]);
}

export function hexToRGB(hex: string): RGB | RGBA {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3 || clean.length === 4
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  if (full.length === 8) {
    return [r, g, b, parseInt(full.substring(6, 8), 16)];
  }
  return [r, g, b];
}

export function getBrightness(color: number[]): number {
  return Math.sqrt(
    color[0] * color[0] * 0.299 +
      color[1] * color[1] * 0.587 +
      color[2] * color[2] * 0.114,
  );
}

export function getRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
  return color;
}

export function invertRgbColor(color: number[]): RGB {
  return [255 - color[0], 255 - color[1], 255 - color[2]];
}

export function rgbToHsl(rgb: number[]): HSL {
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    if (max === r) h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / delta + 2) / 6;
    else h = ((r - g) / delta + 4) / 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;
  if (s === 0) return [clampByte(l * 255), clampByte(l * 255), clampByte(l * 255)];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t: number) => {
    let x = t;
    if (x < 0) x += 1;
    if (x > 1) x -= 1;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };
  return [clampByte(channel(h + 1 / 3) * 255), clampByte(channel(h) * 255), clampByte(channel(h - 1 / 3) * 255)];
}

function linearize(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}
function delinearize(v: number): number {
  const c = v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055;
  return clampByte(c * 255);
}

function rgbToXyz(rgb: number[]): [number, number, number] {
  const r = linearize(rgb[0]);
  const g = linearize(rgb[1]);
  const b = linearize(rgb[2]);
  return [
    r * 0.4124564 + g * 0.3575761 + b * 0.1804375,
    r * 0.2126729 + g * 0.7151522 + b * 0.072175,
    r * 0.0193339 + g * 0.119192 + b * 0.9503041,
  ];
}

function xyzToRgb(xyz: [number, number, number]): RGB {
  const [x, y, z] = xyz;
  const r = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
  const g = x * -0.969266 + y * 1.8760108 + z * 0.041556;
  const b = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;
  return [delinearize(r), delinearize(g), delinearize(b)];
}

const WHITE_XYZ: [number, number, number] = [0.95047, 1.0, 1.08883];

function fLab(t: number): number {
  return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
}
function fLabInv(t: number): number {
  return t > 0.2068966 ? t ** 3 : (t - 16 / 116) / 7.787;
}

export function rgbToCielab(rgb: number[]): Lab {
  const [x, y, z] = rgbToXyz(rgb);
  const fx = fLab(x / WHITE_XYZ[0]);
  const fy = fLab(y / WHITE_XYZ[1]);
  const fz = fLab(z / WHITE_XYZ[2]);
  return { l: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

export function cielabToRgb(lab: Lab): RGB {
  const fy = (lab.l + 16) / 116;
  const fx = fy + lab.a / 500;
  const fz = fy - lab.b / 200;
  const x = WHITE_XYZ[0] * fLabInv(fx);
  const y = WHITE_XYZ[1] * fLabInv(fy);
  const z = WHITE_XYZ[2] * fLabInv(fz);
  return xyzToRgb([x, y, z]);
}

export function cielabToLch(lab: Lab): Lch {
  const c = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  let h = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: lab.l, c, h };
}

export function lchToCielab(lch: Lch): Lab {
  const rad = (lch.h * Math.PI) / 180;
  return { l: lch.l, a: Math.cos(rad) * lch.c, b: Math.sin(rad) * lch.c };
}

export function rgbToLuvLCh(rgb: number[]): Lch {
  return cielabToLch(rgbToCielab(rgb));
}

export function luvLChToRgb(lch: Lch): RGB {
  return cielabToRgb(lchToCielab(lch));
}

function lrgbToOklab(r: number, g: number, b: number): Oklab {
  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return {
    l: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

function oklabToLrgb(lab: Oklab): [number, number, number] {
  const l_ = lab.l + 0.3963377774 * lab.a + 0.2158037573 * lab.b;
  const m_ = lab.l - 0.1055613458 * lab.a - 0.0638541728 * lab.b;
  const s_ = lab.l - 0.0894841775 * lab.a - 1.291485548 * lab.b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

export function rgbToOklab(rgb: number[]): Oklab {
  return lrgbToOklab(linearize(rgb[0]), linearize(rgb[1]), linearize(rgb[2]));
}

export function oklabToRgb(lab: Oklab): RGB {
  const [r, g, b] = oklabToLrgb(lab);
  return [delinearize(r), delinearize(g), delinearize(b)];
}

export function rgbToOklch(rgb: number[]): Lch {
  const lab = rgbToOklab(rgb);
  const c = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  let h = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: lab.l * 100, c: c * 100, h };
}

export function oklchToRgb(lch: Lch): RGB {
  const rad = (lch.h * Math.PI) / 180;
  return oklabToRgb({ l: lch.l / 100, a: (Math.cos(rad) * lch.c) / 100, b: (Math.sin(rad) * lch.c) / 100 });
}
