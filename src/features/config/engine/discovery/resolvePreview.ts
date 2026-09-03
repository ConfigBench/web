import { parseMiniMessage } from '../minimessage'
import type { ResolvedComponent } from '../../types/minimessage'

const TOKEN_SECTIONS = new Set(['variables', 'tokens', 'placeholders', 'formats', 'format'])

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function collectVariables(tree: unknown, out: Record<string, string> = {}): Record<string, string> {
  if (!isPlainObject(tree)) return out
  for (const [key, value] of Object.entries(tree)) {
    if (isPlainObject(value) && TOKEN_SECTIONS.has(key.toLowerCase())) {
      collectVariables(value, out)
    } else if (TOKEN_SECTIONS.has(key.toLowerCase()) && typeof value === 'string') {
      out[key] = value
    }
  }
  return out
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function substituteVariables(source: string, variables: Record<string, string>): string {
  const names = Object.keys(variables)
  if (names.length === 0) return source
  const re = new RegExp(`<(${names.map(escapeRegex).join('|')})>`, 'g')
  return source.replace(re, (whole, name: string) => {
    const value = variables[name]
    return value === whole ? whole : value
  })
}

const previewCache = new Map<string, ResolvedComponent[]>()

export function resolveSource(tree: unknown, source: string): ResolvedComponent[] {
  const substituted = substituteVariables(source, collectVariables(tree))
  const cached = previewCache.get(substituted)
  if (cached) return cached

  const components = parseMiniMessage(substituted).components
  if (previewCache.size > 2000) previewCache.clear()
  previewCache.set(substituted, components)
  return components
}
