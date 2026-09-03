import { useState, type KeyboardEvent } from 'react';

interface CoordNumberInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  accentColor?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function CoordNumberInput({
  label,
  value,
  onChange,
  accentColor,
  placeholder,
  disabled = false,
}: CoordNumberInputProps) {
  const [prevValue, setPrevValue] = useState(value);
  const [text, setText] = useState(() => String(value));
  const [isFocused, setIsFocused] = useState(false);

  if (!isFocused && prevValue !== value) {
    setPrevValue(value);
    setText(String(value));
  }

  const handleChange = (raw: string) => {
    setText(raw);
    if (raw === '' || raw === '-') return;

    const parsed = parseInt(raw, 10);
    if (!Number.isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (text === '' || text === '-') {
      setText('0');
      setPrevValue(0);
      onChange(0);
      return;
    }
    const parsed = parseInt(text, 10);
    if (Number.isNaN(parsed)) {
      setText('0');
      setPrevValue(0);
      onChange(0);
    } else {
      setText(String(parsed));
      setPrevValue(parsed);
      onChange(parsed);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const current = parseInt(text, 10) || 0;
      const next = current + 1;
      setText(String(next));
      onChange(next);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const current = parseInt(text, 10) || 0;
      const next = current - 1;
      setText(String(next));
      onChange(next);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-1">
      <div className="flex items-center justify-between">
        <span
          className="font-mono text-[11px] font-bold uppercase"
          style={{ color: accentColor ?? 'inherit' }}
        >
          {label}
        </span>
      </div>
      <input
        type="text"
        inputMode="numeric"
        disabled={disabled}
        value={text}
        onFocus={() => setIsFocused(true)}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="mc-input h-8 w-full px-2.5 font-mono text-xs font-semibold text-text disabled:opacity-50"
      />
    </div>
  );
}
