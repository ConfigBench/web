import { useState, type KeyboardEvent } from 'react';
import { cn } from '../../../shared/lib/cn';

interface NumberInputProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  className?: string;
  placeholder?: string;
  allowNegative?: boolean;
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  className,
  placeholder,
  allowNegative = false,
}: NumberInputProps) {
  const [prevValue, setPrevValue] = useState(value);
  const [text, setText] = useState(() => String(value));
  const [isFocused, setIsFocused] = useState(false);

  if (!isFocused && prevValue !== value) {
    setPrevValue(value);
    setText(String(value));
  }

  const handleChange = (raw: string) => {
    setText(raw);

    if (raw === '' || (allowNegative && raw === '-')) {
      return;
    }

    const parsed = parseInt(raw, 10);
    if (!Number.isNaN(parsed)) {
      let clamped = parsed;
      if (min !== undefined) clamped = Math.max(min, clamped);
      if (max !== undefined) clamped = Math.min(max, clamped);
      onChange(clamped);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (text === '' || text === '-') {
      const fallback = min !== undefined ? min : 0;
      setText(String(fallback));
      setPrevValue(fallback);
      onChange(fallback);
      return;
    }

    const parsed = parseInt(text, 10);
    if (Number.isNaN(parsed)) {
      const fallback = min !== undefined ? min : 0;
      setText(String(fallback));
      setPrevValue(fallback);
      onChange(fallback);
    } else {
      let clamped = parsed;
      if (min !== undefined) clamped = Math.max(min, clamped);
      if (max !== undefined) clamped = Math.min(max, clamped);
      setText(String(clamped));
      setPrevValue(clamped);
      onChange(clamped);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const current = parseInt(text, 10) || 0;
      const next = max !== undefined ? Math.min(max, current + 1) : current + 1;
      setText(String(next));
      setPrevValue(next);
      onChange(next);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const current = parseInt(text, 10) || 0;
      const next = min !== undefined ? Math.max(min, current - 1) : current - 1;
      setText(String(next));
      setPrevValue(next);
      onChange(next);
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={text}
      onFocus={() => setIsFocused(true)}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={cn('mc-input text-center font-mono text-xs', className)}
    />
  );
}
