import type { Formatting } from '../engine/defaults';
import { cn } from '../../../shared/lib/cn';

export function toCSS(rgb?: number[]): string {
  return `rgba(${rgb?.slice(0, 3).join(',') || '0,0,0'}, ${rgb?.[3] !== undefined ? rgb[3] / 255 : 1})`;
}

export function formattingClasses(formatting?: Formatting) {
  return cn(
    'font-mc',
    formatting?.bold && 'font-mc-bold',
    formatting?.italic && 'font-mc-italic',
    formatting?.bold && formatting?.italic && 'font-mc-bold-italic',
    formatting?.underline && 'underline',
    formatting?.strikethrough && 'line-through',
    formatting?.underline && formatting?.strikethrough && 'underline line-through',
    formatting?.obfuscate && 'obfuscate',
  );
}
