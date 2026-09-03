import type { MiniMessageToken, SourceRange } from '../../types/minimessage'

export function tokenize(source: string): MiniMessageToken[] {
  const tokens: MiniMessageToken[] = []
  const n = source.length
  let text = ''
  let i = 0

  const flushText = (end: number) => {
    if (text.length > 0) {
      tokens.push({
        kind: 'text',
        value: text,
        range: { start: end - text.length, end },
      })
      text = ''
    }
  }

  while (i < n) {
    const ch = source[i]

    if (ch === '\\' && i + 1 < n) {
      flushText(i)
      tokens.push({ kind: 'escape', value: source[i + 1], range: { start: i, end: i + 2 } })
      i += 2
      continue
    }

    if (ch === '<') {
      const tag = readTag(source, i)
      if (tag) {
        flushText(i)
        tokens.push(tag.token)
        i = tag.end
        continue
      }
    }

    text += ch
    i++
  }

  flushText(n)
  return tokens
}

function readTag(source: string, start: number): { token: MiniMessageToken; end: number } | null {
  let i = start + 1
  let quote: string | null = null
  for (; i < source.length; i++) {
    const c = source[i]
    if (quote) {
      if (c === quote) quote = null
      continue
    }
    if (c === "'" || c === '"') {
      quote = c
      continue
    }
    if (c === '>') break
  }
  if (i >= source.length) return null

  const inner = source.slice(start + 1, i)
  const end = i + 1
  const range: SourceRange = { start, end }

  if (inner.startsWith('!')) {
    const body = inner.slice(1)
    const colon = body.indexOf(':')
    const name = colon === -1 ? body : body.slice(0, colon)
    const args = colon === -1 ? [] : body.slice(colon + 1).split(':')
    return { token: { kind: 'open-tag', name, args, selfClosing: true, range }, end }
  }
  if (inner.startsWith('/')) {
    return { token: { kind: 'close-tag', name: inner.slice(1), range }, end }
  }

  const colon = inner.indexOf(':')
  const name = colon === -1 ? inner : inner.slice(0, colon)
  const args = colon === -1 ? [] : inner.slice(colon + 1).split(':')
  return { token: { kind: 'open-tag', name, args, range }, end }
}
