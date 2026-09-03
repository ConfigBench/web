import type {
  ClickAction,
  ClickNode,
  DecorationNode,
  DecorationType,
  FontNode,
  GradientNode,
  HeadNode,
  HexColor,
  HoverAction,
  HoverNode,
  KeybindNode,
  LocalizedNode,
  MiniMessageColor,
  MiniMessageNode,
  MiniMessageParseError,
  MiniMessageParseResult,
  NbtNode,
  OpenTagToken,
  PrideNode,
  RootNode,
  ScoreNode,
  SelectorNode,
  SpriteNode,
  StyleChangeNode,
  TransitionNode,
  VariableNode,
} from '../../types/minimessage'
import type { MiniMessageToken } from '../../types/minimessage'
import { tokenize } from './tokenizer'

const NAMED_COLORS = new Set([
  'black',
  'dark_blue',
  'dark_green',
  'dark_aqua',
  'dark_red',
  'dark_purple',
  'gold',
  'gray',
  'dark_gray',
  'blue',
  'green',
  'aqua',
  'red',
  'light_purple',
  'yellow',
  'white',
])

const DECORATIONS = new Set([
  'bold',
  'italic',
  'underlined',
  'strikethrough',
  'obfuscated',
])

const VOID_TAGS = new Set([
  'key',
  'lang',
  'translate',
  'tr',
  'lang_or',
  'translate_or',
  'tr_or',
  'selector',
  'nbt',
  'score',
  'sprite',
  'head',
  'reset',
  'newline',
  'br',
  'bold',
  'italic',
  'underlined',
  'strikethrough',
  'obfuscated',
])

const CONTAINER_TYPES = new Set([
  'color',
  'gradient',
  'rainbow',
  'decoration',
  'hover',
  'click',
  'insertion',
  'font',
  'shadow',
  'pride',
  'transition',
])

export function parse(tokens: MiniMessageToken[]): MiniMessageParseResult {
  const errors: MiniMessageParseError[] = []
  const root: RootNode = { type: 'root', children: [] }
  const stack: { node: MiniMessageNode; name: string }[] = []

  type ContainerNode = MiniMessageNode & { children: MiniMessageNode[] }

  const currentChildren = (): MiniMessageNode[] => {
    const top = stack[stack.length - 1]
    return top ? (top.node as ContainerNode).children : root.children
  }

  for (const token of tokens) {
    switch (token.kind) {
      case 'text':
        currentChildren().push({ type: 'text', value: token.value })
        break
      case 'escape':
        currentChildren().push({ type: 'escape', value: token.value })
        break
      case 'open-tag': {
        const node = mkNode(token, errors)
        if (node === null) break
        currentChildren().push(node)
        if (CONTAINER_TYPES.has(node.type)) {
          const resolved = DECORATION_ALIASES[token.name] ?? token.name
          stack.push({ node, name: resolved })
        }
        break
      }
      case 'close-tag': {
        const rawName = token.name.replace(/^!/, '')
        const name = DECORATION_ALIASES[rawName] ?? rawName
        let idx = -1
        for (let k = stack.length - 1; k >= 0; k--) {
          if (stack[k].name === name) {
            idx = k
            break
          }
        }
        if (idx === -1) {
          if (VOID_TAGS.has(name) || VOID_TAGS.has(rawName)) break
          errors.push({ message: `Unmatched closing tag </${token.name}>`, range: token.range })
        } else {
          stack.length = idx
        }
        break
      }
      case 'error':
        errors.push({ message: token.message, range: token.range })
        break
    }
  }

  if (stack.length > 0) {
    errors.push({ message: `${stack.length} tag(s) not closed`, range: { start: 0, end: 0 } })
  }

  return { node: root, errors }
}

const DECORATION_ALIASES: Record<string, string> = {
  b: 'bold',
  i: 'italic',
  u: 'underlined',
  st: 'strikethrough',
  obf: 'obfuscated',
  r: 'reset',
}

function mkNode(
  token: OpenTagToken,
  errors: MiniMessageParseError[],
): MiniMessageNode | null {
  const { name: rawName, args, selfClosing } = token
  const name = DECORATION_ALIASES[rawName] ?? rawName

  if (name.startsWith('#')) {
    return { type: 'color', color: name as HexColor, children: [] }
  }

  const styleChange = (part: Partial<StyleChangeNode>): StyleChangeNode | null => {
    if (selfClosing) return { type: 'style-change', ...part }
    return null
  }

  if (name === 'reset') {
    if (selfClosing) return { type: 'style-change', reset: true }
    return { type: 'reset', hard: args[0] === '!', children: [] }
  }
  if (name === 'color') {
    const c = normalizeColor(args[0] ?? '#ffffff')
    return styleChange({ color: c }) ?? { type: 'color', color: c, children: [] }
  }
  if (name === 'shadow') {
    const c = normalizeColor(args[0] ?? '#000000')
    return styleChange({ shadowColor: c }) ?? { type: 'shadow', color: c, children: [] }
  }
  if (DECORATIONS.has(name)) {
    const deco = name as DecorationType
    return styleChange({ decoration: deco }) ?? {
      type: 'decoration',
      decoration: deco,
      children: [],
    } satisfies DecorationNode
  }
  if (NAMED_COLORS.has(name)) {
    return styleChange({ color: name }) ?? { type: 'color', color: name, children: [] }
  }

  switch (name) {
    case 'gradient':
      return {
        type: 'gradient',
        stops: args.length > 0 ? args : ['#ffffff', '#000000'],
        children: [],
      } satisfies GradientNode
    case 'rainbow':
      return { type: 'rainbow', children: [] }
    case 'pride':
      return { type: 'pride', flag: args[0] ?? undefined, children: [] } satisfies PrideNode
    case 'transition': {
      const phaseArg = args[args.length - 1]
      const phaseNum = phaseArg ? Number(phaseArg) : NaN
      const hasPhase =
        args.length >= 2 && Number.isFinite(phaseNum) && phaseNum >= 0 && phaseNum <= 1
      const stops = hasPhase ? args.slice(0, -1) : args
      return {
        type: 'transition',
        stops: stops.length > 0 ? stops : ['#ffffff', '#000000'],
        phase: hasPhase ? phaseNum : 0.5,
        children: [],
      } satisfies TransitionNode
    }
    case 'font':
      return { type: 'font', font: stripQuotes(args[0] ?? ''), children: [] } satisfies FontNode
    case 'newline':
    case 'br':
      return { type: 'newline' }
    case 'hover': {
      const action = parseHoverAction(args, token, errors)
      return action ? ({ type: 'hover', action, children: [] } satisfies HoverNode) : null
    }
    case 'click': {
      const action = parseClickAction(args, token, errors)
      return action ? ({ type: 'click', action, children: [] } satisfies ClickNode) : null
    }
    case 'insertion':
      return { type: 'insertion', value: stripQuotes(args[0] ?? ''), children: [] }
    case 'key':
      return { type: 'keybind', key: stripQuotes(args[0] ?? '') } satisfies KeybindNode
    case 'lang':
    case 'translate':
    case 'tr':
      return {
        type: 'localized',
        key: stripQuotes(args[0] ?? ''),
        fallback: args[1] ? stripQuotes(args[1]) : undefined,
      } satisfies LocalizedNode
    case 'lang_or':
    case 'translate_or':
    case 'tr_or':
      return {
        type: 'localized',
        key: stripQuotes(args[0] ?? ''),
        fallback: stripQuotes(args[1] ?? ''),
      } satisfies LocalizedNode
    case 'selector':
      return { type: 'selector', selector: stripQuotes(args[0] ?? '') } satisfies SelectorNode
    case 'nbt':
      return { type: 'nbt', value: args.join(':') } satisfies NbtNode
    case 'score':
      return { type: 'score', value: args.join(':') } satisfies ScoreNode
    case 'sprite':
      return { type: 'sprite', value: args.join(':') } satisfies SpriteNode
    case 'head':
      return { type: 'head', value: args.join(':') || '' } satisfies HeadNode
    default: {
      return { type: 'variable', name, children: [] } satisfies VariableNode
    }
  }
}

function normalizeColor(value: string): MiniMessageColor {
  const v = value.trim()
  if (v.startsWith('#')) return v as HexColor
  if (NAMED_COLORS.has(v)) return v
  return v as HexColor
}

function parseHoverAction(
  args: string[],
  token: OpenTagToken,
  errors: MiniMessageParseError[],
): HoverAction | null {
  const kind = args[0] ?? 'show_text'
  const raw = stripQuotes(args.slice(1).join(':') ?? '')
  if (kind === 'show_item') {
    return { kind: 'show_item', item: raw }
  }
  if (kind === 'show_entity') {
    return { kind: 'show_entity', entity: raw }
  }
  if (kind === 'show_text') {
    return { kind: 'show_text', content: parseContent(raw) }
  }
  errors.push({ message: `Unknown hover action <${kind}>`, range: token.range })
  return null
}

function parseClickAction(
  args: string[],
  token: OpenTagToken,
  errors: MiniMessageParseError[],
): ClickAction | null {
  const kind = args[0]
  const value = stripQuotes(args.slice(1).join(':') ?? '')
  const valid: ClickAction['kind'][] = [
    'open_url',
    'run_command',
    'suggest_command',
    'change_page',
    'copy_to_clipboard',
  ]
  if (valid.includes(kind as ClickAction['kind'])) {
    return { kind: kind as ClickAction['kind'], value }
  }
  errors.push({ message: `Unknown click action <${kind}>`, range: token.range })
  return null
}

function stripQuotes(value: string): string {
  if (value.length < 2) return value
  const first = value[0]
  const last = value[value.length - 1]
  if ((first === "'" && last === "'") || (first === '"' && last === '"')) {
    return value.slice(1, -1)
  }
  return value
}

function parseContent(source: string): MiniMessageNode[] {
  return source ? parse(tokenize(source)).node.children : []
}
