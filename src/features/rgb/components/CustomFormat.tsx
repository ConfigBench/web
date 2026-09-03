import { useRgbStore } from './rgbContexts';

const FIELDS = [
  { key: 'bold', label: 'Bold', placeholder: '<bold>$t</bold>' },
  { key: 'italic', label: 'Italic', placeholder: '<italic>$t</italic>' },
  { key: 'underline', label: 'Underline', placeholder: '<underlined>$t</underlined>' },
  { key: 'strikethrough', label: 'Strikethrough', placeholder: '<strikethrough>$t</strikethrough>' },
  { key: 'obfuscate', label: 'Obfuscate', placeholder: '<obfuscated>$t</obfuscated>' },
] as const;

export default function CustomFormat() {
  const { store, update } = useRgbStore();
  const format = store.colorFormat;
  const hasWrappers = !!(format.bold || format.italic || format.underline || format.strikethrough);

  const patch = (key: string, value: string) =>
    update({ colorFormat: { ...format, [key]: value } });

  return (
    <div id="customformat" className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-2.5">
        <label htmlFor="customformat" className="flex flex-col gap-1.5 text-[13px] text-[#a6adc8]">
          Custom Format
          <input
            id="customformat"
            value={format.color}
            placeholder="&#$1$2$3$4$5$6$f$c"
            onChange={(e) => patch('color', e.target.value)}
            className="mc-input rounded-none px-2.5 py-1.5 font-mono text-xs"
          />
        </label>
        <div className="font-mono text-[11px] leading-relaxed text-[#a6adc8]">
          <p>Placeholders:</p>
          <p>
            $1 = <strong className="text-red-400">R</strong>RGGBB
          </p>
          <p>
            $2 = R<strong className="text-red-400">R</strong>GGBB
          </p>
          <p>
            $3 = RR<strong className="text-green-400">G</strong>GBB
          </p>
          <p>
            $4 = RRG<strong className="text-green-400">G</strong>BB
          </p>
          <p>
            $5 = RRGG<strong className="text-sky-300">B</strong>B
          </p>
          <p>
            $6 = RRGGB<strong className="text-sky-300">B</strong>
          </p>
          {format.char && <p>$f = Formatting</p>}
          <p>$c = Character</p>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {format.char !== undefined && !hasWrappers && (
          <label htmlFor="format-char" className="flex flex-col gap-1.5 text-[13px] text-[#a6adc8]">
            Format Character
            <input
              id="format-char"
              value={format.char}
              placeholder="&"
              onChange={(e) => patch('char', e.target.value)}
              className="mc-input rounded-none px-2.5 py-1.5 font-mono text-xs"
            />
          </label>
        )}
        {!format.char &&
          FIELDS.map(({ key, label, placeholder }) => (
            <label key={key} htmlFor={`format-${key}`} className="flex flex-col gap-1.5 text-[13px] text-[#a6adc8]">
              {label}
              <input
                id={`format-${key}`}
                value={format[key] ?? ''}
                placeholder={placeholder}
                onChange={(e) => patch(key, e.target.value)}
                className="mc-input rounded-none px-2.5 py-1.5 font-mono text-xs"
              />
            </label>
          ))}
        {!format.char && <p className="font-mono text-[11px] text-[#a6adc8]">$t = Output Text</p>}
        <label htmlFor="format-newline" className="flex flex-col gap-1.5 text-[13px] text-[#a6adc8]">
          New Line
          <input
            id="format-newline"
            value={format.newline ?? ''}
            placeholder="&"
            onChange={(e) => patch('newline', e.target.value)}
            className="mc-input rounded-none px-2.5 py-1.5 font-mono text-xs"
          />
        </label>
      </div>
    </div>
  );
}
