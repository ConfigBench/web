import {
  hslToRgb,
  oklabToRgb,
  oklchToRgb,
  rgbToCielab,
  rgbToHsl,
  rgbToLuvLCh,
  rgbToOklab,
  rgbToOklch,
  cielabToRgb,
  luvLChToRgb,
} from './colors';

export const GRADIENT_TYPES = ['rgb', 'hsl', 'oklab', 'oklch', 'cielab', 'luvLCh'] as const;
export type GradientType = (typeof GRADIENT_TYPES)[number];

export interface RGBColorStop {
  rgb: number[];
  pos: number;
}

interface TwoStopGradient {
  lowerRange: number;
  upperRange: number;
  colorAt(step: number): number[];
}

abstract class BaseTwoStopGradient<T> implements TwoStopGradient {
  protected startColor: T;
  protected endColor: T;
  private startAlpha: number;
  private endAlpha: number;
  lowerRange: number;
  upperRange: number;

  constructor(
    startRgb: number[],
    endRgb: number[],
    startAlpha: number,
    endAlpha: number,
    lowerRange: number,
    upperRange: number,
  ) {
    this.startColor = this.rgbToColorSpace(startRgb);
    this.endColor = this.rgbToColorSpace(endRgb);
    this.startAlpha = startAlpha;
    this.endAlpha = endAlpha;
    this.lowerRange = lowerRange;
    this.upperRange = upperRange;
  }

  protected abstract rgbToColorSpace(rgb: number[]): T;
  protected abstract interpolate(start: T, end: T, factor: number): T;
  protected abstract colorSpaceToRgb(color: T): number[];

  colorAt(step: number): number[] {
    const range = this.upperRange - this.lowerRange;
    const factor = range > 0 ? (step - this.lowerRange) / range : 0;
    const interpolated = this.interpolate(this.startColor, this.endColor, factor);
    const alpha = this.startAlpha + (this.endAlpha - this.startAlpha) * factor;
    return [...this.colorSpaceToRgb(interpolated), Math.round(alpha * 255)];
  }
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

class RgbTwoStop extends BaseTwoStopGradient<number[]> {
  protected rgbToColorSpace(rgb: number[]): number[] {
    return [...rgb];
  }
  protected interpolate(start: number[], end: number[], factor: number): number[] {
    return [lerp(start[0], end[0], factor), lerp(start[1], end[1], factor), lerp(start[2], end[2], factor)];
  }
  protected colorSpaceToRgb(color: number[]): number[] {
    return color.map((c) => Math.round(c));
  }
}

class HslTwoStop extends BaseTwoStopGradient<{ h: number; s: number; l: number }> {
  protected rgbToColorSpace(rgb: number[]) {
    return rgbToHsl(rgb);
  }
  protected interpolate(start: { h: number; s: number; l: number }, end: { h: number; s: number; l: number }, factor: number) {
    let dh = end.h - start.h;
    if (dh > 180) dh -= 360;
    if (dh < -180) dh += 360;
    return { h: (start.h + dh * factor + 360) % 360, s: lerp(start.s, end.s, factor), l: lerp(start.l, end.l, factor) };
  }
  protected colorSpaceToRgb(color: { h: number; s: number; l: number }) {
    return hslToRgb(color);
  }
}

class OklabTwoStop extends BaseTwoStopGradient<{ l: number; a: number; b: number }> {
  protected rgbToColorSpace(rgb: number[]) {
    return rgbToOklab(rgb);
  }
  protected interpolate(start: { l: number; a: number; b: number }, end: { l: number; a: number; b: number }, factor: number) {
    return { l: lerp(start.l, end.l, factor), a: lerp(start.a, end.a, factor), b: lerp(start.b, end.b, factor) };
  }
  protected colorSpaceToRgb(color: { l: number; a: number; b: number }) {
    return oklabToRgb(color);
  }
}

class OklchTwoStop extends BaseTwoStopGradient<{ l: number; c: number; h: number }> {
  protected rgbToColorSpace(rgb: number[]) {
    return rgbToOklch(rgb);
  }
  protected interpolate(start: { l: number; c: number; h: number }, end: { l: number; c: number; h: number }, factor: number) {
    let dh = end.h - start.h;
    if (dh > 180) dh -= 360;
    if (dh < -180) dh += 360;
    return { l: lerp(start.l, end.l, factor), c: lerp(start.c, end.c, factor), h: (start.h + dh * factor + 360) % 360 };
  }
  protected colorSpaceToRgb(color: { l: number; c: number; h: number }) {
    return oklchToRgb(color);
  }
}

class CielabTwoStop extends BaseTwoStopGradient<{ l: number; a: number; b: number }> {
  protected rgbToColorSpace(rgb: number[]) {
    return rgbToCielab(rgb);
  }
  protected interpolate(start: { l: number; a: number; b: number }, end: { l: number; a: number; b: number }, factor: number) {
    return { l: lerp(start.l, end.l, factor), a: lerp(start.a, end.a, factor), b: lerp(start.b, end.b, factor) };
  }
  protected colorSpaceToRgb(color: { l: number; a: number; b: number }) {
    return cielabToRgb(color);
  }
}

class LuvLChTwoStop extends BaseTwoStopGradient<{ l: number; c: number; h: number }> {
  protected rgbToColorSpace(rgb: number[]) {
    return rgbToLuvLCh(rgb);
  }
  protected interpolate(start: { l: number; c: number; h: number }, end: { l: number; c: number; h: number }, factor: number) {
    let dh = end.h - start.h;
    if (dh > 180) dh -= 360;
    if (dh < -180) dh += 360;
    return { l: lerp(start.l, end.l, factor), c: lerp(start.c, end.c, factor), h: (start.h + dh * factor + 360) % 360 };
  }
  protected colorSpaceToRgb(color: { l: number; c: number; h: number }) {
    return luvLChToRgb(color);
  }
}

const TWO_STOP_CLASSES: Record<GradientType, new (...args: ConstructorParameters<typeof BaseTwoStopGradient>) => TwoStopGradient> = {
  rgb: RgbTwoStop,
  hsl: HslTwoStop,
  oklab: OklabTwoStop,
  oklch: OklchTwoStop,
  cielab: CielabTwoStop,
  luvLCh: LuvLChTwoStop,
};

export class ColorGradient {
  protected gradients: TwoStopGradient[] = [];
  protected colors: RGBColorStop[];
  protected steps: number;
  protected step = 0;

  constructor(colors: RGBColorStop[], numSteps: number, type: GradientType = 'rgb') {
    this.colors = colors;
    this.steps = numSteps - 1;
    if (!colors.length) return;

    const padded = [...colors];
    if (padded[0].pos !== 0) padded.unshift({ ...padded[0], pos: 0 });
    if (padded[padded.length - 1].pos !== 100) padded.push({ ...padded[padded.length - 1], pos: 100 });

    for (let i = 0; i < padded.length - 1; i++) {
      let currentColor = padded[i];
      let nextColor = padded[i + 1];
      if (currentColor.pos > nextColor.pos) {
        const temp = currentColor;
        currentColor = nextColor;
        nextColor = temp;
      }
      const lowerRange = Math.round((currentColor.pos / 100) * this.steps);
      const upperRange = Math.round((nextColor.pos / 100) * this.steps);
      if (upperRange < 1 || lowerRange === upperRange) continue;
      this.gradients.push(
        new TWO_STOP_CLASSES[type](
          currentColor.rgb.slice(0, 3),
          nextColor.rgb.slice(0, 3),
          currentColor.rgb[3] !== undefined ? currentColor.rgb[3] / 255 : 1,
          nextColor.rgb[3] !== undefined ? nextColor.rgb[3] / 255 : 1,
          lowerRange,
          upperRange,
        ),
      );
    }
  }

  next(): number[] {
    if (this.steps < 1) return this.colors[0]?.rgb;
    const adjustedStep = Math.round(
      Math.abs(
        ((2 * Math.asin(Math.sin(this.step * (Math.PI / (2 * this.steps))))) / Math.PI) * this.steps,
      ),
    );
    let color: number[] | undefined;
    if (this.gradients.length < 2) {
      color = this.gradients[0]?.colorAt(adjustedStep);
    } else {
      const gradient = this.gradients.find(
        (g) => g.lowerRange <= adjustedStep && g.upperRange >= adjustedStep,
      );
      if (!gradient) return this.colors[0]?.rgb;
      color = gradient.colorAt(adjustedStep);
    }
    this.step++;
    return color;
  }

  rewind(step: number): void {
    this.step = step;
  }
}

export class ColorAnimatedGradient extends ColorGradient {
  constructor(colors: RGBColorStop[], numSteps: number, offset: number, type: GradientType = 'rgb') {
    super(colors, Math.max(2, numSteps), type);
    this.rewind(Math.max(0, offset));
  }
}
