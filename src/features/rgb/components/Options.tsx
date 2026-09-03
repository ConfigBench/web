import { useRgbStore } from './rgbContexts';

export default function Options() {
  const { store, update } = useRgbStore();
  const isMiniMessage = store.colorFormat.color === 'MiniMessage';

  return (
    <div id="options" className="flex flex-col gap-3">
      <label htmlFor="prefixsuffix" className="flex flex-col gap-1.5 text-[13px] text-[#a6adc8]">
        Prefix/Suffix
        <input
          id="prefixsuffix"
          value={store.prefixSuffix}
          placeholder="/nick $t"
          onChange={(e) => update({ prefixSuffix: e.target.value })}
          className="w-full mc-input rounded-none px-2.5 py-1.5 text-[13px]"
        />
        <span className="text-[11px] leading-snug text-[#6c7086]">
          Wraps the output — put <span className="font-mono">$t</span> where the gradient text should go (e.g.{' '}
          <span className="font-mono">/nick $t</span>). Without <span className="font-mono">$t</span>, the output is
          replaced by this string.
        </span>
      </label>
      {!isMiniMessage && (
        <label htmlFor="colorLength" className="flex flex-col gap-1.5 text-[13px] text-[#a6adc8]">
          Characters per color
          <input
            id="colorLength"
            type="number"
            min={1}
            max={Math.max(1, Math.floor(store.text.length / store.colors.length))}
            value={store.colorLength}
            onChange={(e) => update({ colorLength: Math.max(1, Number(e.target.value) || 1) })}
            className="w-24 mc-input rounded-none px-2.5 py-1.5 text-[13px]"
          />
        </label>
      )}
      {!isMiniMessage && (
        <label className="flex items-start gap-2.5 text-[13px] text-[#a6adc8]">
          <input
            type="checkbox"
            checked={store.trimSpaces}
            onChange={(e) => update({ trimSpaces: e.target.checked })}
            className="mt-1 accent-[var(--accent)]"
          />
          <span>
            Trim colors from spaces
            <span className="block text-[11px] text-[#6c7086]">
              Turn this off if you're using empty underlines / strikethroughs
            </span>
          </span>
        </label>
      )}
    </div>
  );
}
