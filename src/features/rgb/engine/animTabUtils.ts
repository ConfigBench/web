import type { AnimTabStore, Formatting } from './defaults';
import type { RgbOptions } from './rgbUtils';
import { rgbToHex } from './colors';
import { ColorAnimatedGradient } from './gradients';
import {
  applyFont,
  applyWrappers,
  formatNewlines,
  getFormattingAtOffset,
  getRGBColorStop,
  isFormattingEqual,
  renderTemplateSegment,
  sortColors,
  segmentText,
} from './rgbUtils';

export function generateAnimTABFrames(
  rgbOptions: RgbOptions,
  animtabStore: AnimTabStore,
): { OutputArray: string[]; frames: (string | null)[][] } {
  if (rgbOptions.colors.length < 2) return { OutputArray: [], frames: [] };

  const colors = rgbOptions.colors.map(getRGBColorStop);
  const text = rgbOptions.text ?? 'ConfigBench';
  const type = Number(animtabStore.type);

  const length = (text.length * animtabStore.length) / rgbOptions.colorLength;
  const loopAmount = type === 3 ? length : length * 2 - 2;

  const colorFrames: (string | null)[][] = [];
  const textFrames: Array<{ type: 'solid' | 'segments'; text?: string; segments?: string[]; colors: (string | null)[] }> = [];

  for (let n = 0; n < loopAmount; n++) {
    const frameColors: (string | null)[] = [];
    const gradient = new ColorAnimatedGradient(colors, length, n, rgbOptions.gradientType);

    if (type === 4) {
      let hex = rgbToHex(gradient.next());
      if (rgbOptions.lowercase) hex = hex.toLowerCase();
      frameColors.push(hex);
      textFrames.push({ type: 'solid', text, colors: [hex] });
    } else {
      const segments = segmentText(text, rgbOptions.colorLength);
      const segmentColors: (string | null)[] = [];
      for (const segment of segments) {
        if (rgbOptions.trimSpaces && segment.match(/^\s+$/)) {
          segmentColors.push(null);
          frameColors.push(null);
          continue;
        }
        let hex = rgbToHex(gradient.next());
        if (rgbOptions.lowercase) hex = hex.toLowerCase();
        segmentColors.push(hex);
        frameColors.push(hex);
      }
      textFrames.push({ type: 'segments', segments, colors: segmentColors });
    }
    colorFrames.push(frameColors);
  }

  const OutputArray = formatFrames({ colorFrames, textFrames }, rgbOptions, animtabStore);

  let processedOutputArray = OutputArray;
  let processedFrames = colorFrames;
  if (type === 1) {
    processedOutputArray = [...OutputArray].reverse();
    processedFrames = [...colorFrames].reverse();
  } else if (type === 3) {
    processedOutputArray = [...OutputArray].reverse().concat(OutputArray.slice());
    processedFrames = [...colorFrames].reverse().concat(colorFrames.slice());
  }

  return { OutputArray: processedOutputArray, frames: processedFrames };
}

function formatFrames(
  frames: {
    colorFrames?: (string | null)[][];
    textFrames: Array<{ type: 'solid' | 'segments'; text?: string; segments?: string[]; colors: (string | null)[] }>;
  },
  rgbOptions: RgbOptions,
  animtabStore: AnimTabStore,
): string[] {
  const { textFrames } = frames;
  const OutputArray: string[] = [];
  const text = rgbOptions.text ?? 'ConfigBench';

  for (let n = 0; n < textFrames.length; n++) {
    const frame = textFrames[n];
    let output = '';

    if (rgbOptions.colorFormat.color === 'MiniMessage') {
      if (frame.type === 'solid') {
        const hex = frame.colors[0];
        const formatting = getFormattingAtOffset(0, rgbOptions);
        output = `<color:#${hex}>${applyMiniMessageFormatting(text, formatting, rgbOptions)}</color>`;
      } else if (frame.type === 'segments') {
        if (
          rgbOptions.colors.find(
            (color: { pos: number }, i: number) => color.pos != (100 / (rgbOptions.colors.length - 1)) * i,
          )
        ) {
          output = formatMiniMessageCustomPositions(rgbOptions, animtabStore, n);
        } else {
          const animatedColors: string[] = [];
          for (let i = 0; i < rgbOptions.colors.length; i++) {
            const colorStops = rgbOptions.colors.map(getRGBColorStop);
            const length = (text.length * animtabStore.length) / rgbOptions.colorLength;
            const offset = (n + i * (length / rgbOptions.colors.length)) % length;
            const shiftedGradient = new ColorAnimatedGradient(colorStops, length, offset, rgbOptions.gradientType);
            animatedColors.push('#' + rgbToHex(shiftedGradient.next()));
          }
          if (animatedColors.length < 2) animatedColors.push(animatedColors[0]);
          const formatting = getFormattingAtOffset(0, rgbOptions);
          output = `<gradient:${animatedColors.join(':')}>${applyMiniMessageFormatting(text, formatting, rgbOptions)}</gradient>`;
        }
      }
    } else if (frame.type === 'solid') {
      const hex = frame.colors[0];
      if (hex) {
        const formatting = getFormattingAtOffset(0, rgbOptions);
        output = renderTemplateSegment(hex, text, formatting, rgbOptions);
      }
    } else if (frame.type === 'segments') {
      let charIndex = 0;
      let previousHex: string | null = null;
      let previousFormatting: Formatting | null = null;
      for (let i = 0; i < frame.segments!.length; i++) {
        const segment = frame.segments![i];
        const hex = frame.colors[i];

        if (hex === null) {
          const formatting = getFormattingAtOffset(charIndex, rgbOptions);
          let segText = segment;
          if (formatting.font) segText = applyFont(segText, formatting.font);
          output += segText;
          charIndex += segment.length;
          previousHex = null;
          previousFormatting = null;
          continue;
        }

        const formatting = getFormattingAtOffset(charIndex, rgbOptions);
        const skipColor =
          previousHex !== null && hex === previousHex && isFormattingEqual(formatting, previousFormatting);
        output += renderTemplateSegment(hex, segment, formatting, rgbOptions, skipColor);
        previousHex = hex;
        previousFormatting = formatting;
        charIndex += segment.length;
      }
    }

    output = applyWrappers(output, rgbOptions);
    OutputArray.push(output);
  }

  return OutputArray;
}

function applyMiniMessageFormatting(text: string, formatting: Formatting, options: RgbOptions): string {
  if (options.colorFormat.color !== 'MiniMessage') return text;
  let output = formatNewlines(text, options.colorFormat.newline);
  if (formatting.font) output = applyFont(output, formatting.font);
  if (options.formatting && options.formatting.length > 0) {
    if (formatting.obfuscate && options.colorFormat.obfuscate) output = options.colorFormat.obfuscate.replace('$t', output);
    if (formatting.strikethrough && options.colorFormat.strikethrough) output = options.colorFormat.strikethrough.replace('$t', output);
    if (formatting.underline && options.colorFormat.underline) output = options.colorFormat.underline.replace('$t', output);
    if (formatting.italic && options.colorFormat.italic) output = options.colorFormat.italic.replace('$t', output);
    if (formatting.bold && options.colorFormat.bold) output = options.colorFormat.bold.replace('$t', output);
  }
  return output;
}

function formatMiniMessageCustomPositions(
  rgbOptions: RgbOptions,
  animtabStore: AnimTabStore,
  frameIndex: number,
): string {
  const text = rgbOptions.text ?? 'ConfigBench';
  const colors = sortColors(rgbOptions.colors);
  let output = '';

  if (colors[0].pos !== 0) colors.unshift({ hex: colors[0].hex, pos: 0 });
  if (colors[colors.length - 1].pos !== 100) colors.push({ hex: colors[colors.length - 1].hex, pos: 100 });

  const animatedColors = colors.map((color, i) => {
    const colorStops = rgbOptions.colors.map(getRGBColorStop);
    const length = (text.length * animtabStore.length) / rgbOptions.colorLength;
    const offset = (frameIndex + i * (length / colors.length)) % length;
    const shiftedGradient = new ColorAnimatedGradient(colorStops, length, offset, rgbOptions.gradientType);
    return { hex: rgbToHex(shiftedGradient.next()), pos: color.pos };
  });

  for (let i = 0; i < animatedColors.length - 1; i++) {
    let currentColor = animatedColors[i];
    let nextColor = animatedColors[i + 1];
    if (currentColor.pos > nextColor.pos) {
      const swap = currentColor;
      currentColor = nextColor;
      nextColor = swap;
    }
    const numSteps = text.length;
    const lowerRange = Math.round((currentColor.pos / 100) * numSteps);
    const upperRange = Math.round((nextColor.pos / 100) * numSteps);
    if (lowerRange === upperRange) continue;
    const formatting = getFormattingAtOffset(lowerRange, rgbOptions);
    const innerText = applyMiniMessageFormatting(text.substring(lowerRange, upperRange), formatting, rgbOptions);
    output += `<gradient:#${currentColor.hex}:#${nextColor.hex}>${innerText}</gradient>`;
  }

  return output;
}

export function AnimationOutput(rgbOptions: RgbOptions, animtabStore: AnimTabStore): string {
  const AnimFrames = generateAnimTABFrames(rgbOptions, animtabStore);
  let { OutputArray } = AnimFrames;

  let FinalOutput = animtabStore.outputFormat.replace('%name%', animtabStore.name);
  FinalOutput = FinalOutput.replace('%speed%', `${animtabStore.speed}`);

  const outputFormat = FinalOutput.match(/%output:{(.*\$t.*)}%/);
  if (outputFormat) OutputArray = OutputArray.map((output) => outputFormat[1].replace('$t', output));
  FinalOutput = FinalOutput.replace(/%output:{.*\$t.*}%/, OutputArray.join('\n'));
  return FinalOutput;
}
