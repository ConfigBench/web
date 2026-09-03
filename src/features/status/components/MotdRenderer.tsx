import { useMemo } from 'react';
import { parseMinecraftFormatting, type SpanSegment } from '../engine/motdParser';

interface MotdRendererProps {
  raw: string;
  clean: string;
  html?: string;
  className?: string;
}

export function MotdRenderer({ raw, clean, className = '' }: MotdRendererProps) {
  const parsedLines: SpanSegment[][] = useMemo(() => {
    const textToParse = raw || clean;
    if (textToParse && (textToParse.includes('§') || textToParse.includes('&'))) {
      return parseMinecraftFormatting(textToParse);
    }
    return clean ? clean.split(/\r?\n/).map((line) => [{ text: line, color: '#ffffff' }]) : [];
  }, [raw, clean]);

  if (parsedLines.length === 0) {
    return (
      <div className={`font-mc text-sm text-muted italic ${className}`}>
        A Minecraft Server
      </div>
    );
  }

  return (
    <div
      className={`font-mc flex flex-col gap-0.5 text-sm leading-relaxed whitespace-pre-wrap [text-shadow:1px_1px_0_rgba(0,0,0,0.8)] ${className}`}
    >
      {parsedLines.map((line, lineIdx) => (
        <div key={lineIdx} className="min-h-[1.25rem] truncate">
          {line.map((seg, segIdx) => (
            <span
              key={segIdx}
              style={{
                color: seg.color,
                fontWeight: seg.bold ? 'bold' : 'normal',
                fontStyle: seg.italic ? 'italic' : 'normal',
                textDecoration: `${seg.underlined ? 'underline ' : ''}${
                  seg.strikethrough ? 'line-through' : ''
                }`.trim() || undefined,
              }}
            >
              {seg.text}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
