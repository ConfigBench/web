import { useState } from 'react';
import { Settings, Sparkle } from 'lucide-react';
import { generateOutput } from '../engine/rgbUtils';
import { buildFormatSegments, decodeLegacy, getSignificantPoints } from '../engine/decode';
import { decodeMiniMessage } from '../engine/miniMessageDecode';
import { useRgbStore } from './rgbContexts';

export default function Decode() {
  const { store, update, pushToast } = useRgbStore();
  const [threshold, setThreshold] = useState(50);

  const decodeText = (rgbtext: string, thresholdValue: number) => {
    const miniMessageResult = decodeMiniMessage(rgbtext);
    let text: string;
    let colors: Array<{ hex: string; pos: number }>;
    let charFormattings;

    if (miniMessageResult) {
      text = miniMessageResult.plainText;
      colors = miniMessageResult.charColors;
      charFormattings = miniMessageResult.charFormattings;
    } else {
      const legacyResult = decodeLegacy(rgbtext);
      if (!legacyResult) return;
      text = legacyResult.plainText;
      colors = legacyResult.colors;
      charFormattings = legacyResult.charFormattings;
    }

    if (colors.length === 0) return;
    const colorHexes = colors.map((c) => c.hex);
    const significantPoints = getSignificantPoints(colorHexes, thresholdValue);
    const newColors = significantPoints.map((color) => {
      const pos = colors.find((c) => c.hex === color)?.pos ?? 0;
      return { hex: color, pos };
    });
    update({
      text: text ?? '',
      colors: newColors,
      baseFormatting: { bold: false, italic: false, underline: false, strikethrough: false, obfuscate: false },
      formatting: buildFormatSegments(charFormattings),
    });
    pushToast(
      'RGB Text Decoded!',
      'Successfully decoded the existing RGB text! If this is not what you expected, try changing the threshold value.',
      'green',
    );
  };

  return (
    <div id="decode" className="flex flex-col gap-3">
      <p className="text-[11px] leading-relaxed text-[#6c7086]">
        This feature tries to predict the color points in the gradients and where they are, it is not 100% accurate — save
        your gradients as presets to keep them exact.
      </p>
      <label htmlFor="decode" className="flex flex-col gap-1.5 text-[13px] text-[#a6adc8]">
        Decode
        <textarea
          id="decode"
          placeholder={generateOutput(store)}
          onChange={(e) => decodeText(e.target.value, threshold)}
          className="font-mc h-20 w-full resize-y mc-input rounded-none p-2.5 text-[13px] whitespace-pre-wrap"
        />
        <span className="text-[11px]">Copy-paste an existing RGB text here to edit it</span>
      </label>
      <label htmlFor="threshold" className="flex flex-col gap-1.5 text-[13px] text-[#a6adc8]">
        <span className="flex items-center gap-1.5">
          <Settings size={13} /> Threshold
        </span>
        <input
          id="threshold"
          type="number"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-24 mc-input rounded-none px-2.5 py-1.5 text-[13px]"
        />
        <span className="flex items-center gap-1.5 text-[11px]">
          <Sparkle size={12} /> Try changing this around if you're getting too many colors
        </span>
      </label>
    </div>
  );
}
