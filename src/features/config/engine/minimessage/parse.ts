import type { MiniMessageParseResult, ResolvedComponent } from '../../types/minimessage'
import { legacyToMiniMessage } from './legacy'
import { resolvePlaceholders } from './papi'
import { tokenize } from './tokenizer'
import { parse } from './parser'
import { resolve } from './resolver'

export interface MiniMessageResult extends MiniMessageParseResult {
  components: ResolvedComponent[]
}

export interface ParseMiniMessageOptions {
  convertLegacy?: boolean
  placeholders?: Record<string, string>
  gradientSteps?: number
}

export function parseMiniMessage(
  source: string,
  options: ParseMiniMessageOptions = {},
): MiniMessageResult {
  let input = source
  if (options.convertLegacy !== false) {
    input = legacyToMiniMessage(input)
  }
  input = resolvePlaceholders(input, options.placeholders)

  const tokens = tokenize(input)
  const ast = parse(tokens)
  const components = resolve(ast.node, { steps: options.gradientSteps })
  return { ...ast, components }
}
