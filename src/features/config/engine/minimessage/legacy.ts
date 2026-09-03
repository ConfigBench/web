const LEGACY_COLORS: Record<string, string> = {
  '0': 'black',
  '1': 'dark_blue',
  '2': 'dark_green',
  '3': 'dark_aqua',
  '4': 'dark_red',
  '5': 'dark_purple',
  '6': 'gold',
  '7': 'gray',
  '8': 'dark_gray',
  '9': 'blue',
  a: 'green',
  b: 'aqua',
  c: 'red',
  d: 'light_purple',
  e: 'yellow',
  f: 'white',
}

const LEGACY_FORMATS: Record<string, string> = {
  k: 'obfuscated',
  l: 'bold',
  m: 'strikethrough',
  n: 'underlined',
  o: 'italic',
  r: 'reset',
}

const HEX_RE = /^#?([0-9a-f]{6})$/i

export function legacyToMiniMessage(input: string): string {
  let out = ''
  let i = 0
  const n = input.length
  while (i < n) {
    const ch = input[i]
    if ((ch === '&' || ch === '\u00a7') && i + 1 < n) {
      const next = input[i + 1]
      if (next === '#') {
        const hex = input.slice(i + 2, i + 8)
        if (HEX_RE.test(hex)) {
          out += `<#${hex.toLowerCase()}>`
          i += 8
          continue
        }
      }
      const lower = next.toLowerCase()
      const color = LEGACY_COLORS[lower]
      if (color) {
        out += `<${color}>`
        i += 2
        continue
      }
      const format = LEGACY_FORMATS[lower]
      if (format) {
        out += format === 'reset' ? '<reset>' : `<${format}>`
        i += 2
        continue
      }
    }
    out += ch
    i++
  }
  return out
}
