import type {
  GradientNode,
  MiniMessageNode,
  PrideNode,
  RainbowNode,
  ResolvedComponent,
  ResolvedStyle,
  TransitionNode,
} from '../../types/minimessage'

export interface ResolveOptions {
  steps?: number
}

const DEFAULT_STYLE: ResolvedStyle = {
  color: null,
  bold: false,
  italic: false,
  underlined: false,
  strikethrough: false,
  obfuscated: false,
  insertion: null,
  shadowColor: null,
}

export function resolve(node: MiniMessageNode, options: ResolveOptions = {}): ResolvedComponent[] {
  const out: ResolvedComponent[] = []
  const children = (node as { children?: MiniMessageNode[] }).children ?? [node]
  walkChildren(children, DEFAULT_STYLE, null, null, out, options)
  return out
}

function walkChildren(
  children: MiniMessageNode[],
  initialStyle: ResolvedStyle,
  hover: ResolvedComponent['hover'],
  click: ResolvedComponent['click'],
  out: ResolvedComponent[],
  options: ResolveOptions,
): void {
  let style = initialStyle
  let currentHover = hover
  let currentClick = click

  for (const child of children) {
    switch (child.type) {
      case 'reset':
        style = DEFAULT_STYLE
        currentHover = null
        currentClick = null
        break
      case 'style-change':
        if (child.reset) {
          style = DEFAULT_STYLE
          currentHover = null
          currentClick = null
        }
        if (child.color) style = { ...style, color: child.color }
        if (child.shadowColor) style = { ...style, shadowColor: child.shadowColor }
        if (child.decoration) style = { ...style, [child.decoration]: true }
        break
      case 'newline':
        out.push({ text: '\n', style, hover: currentHover, click: currentClick })
        break
      case 'text':
        if (child.value) out.push({ text: child.value, style, hover: currentHover, click: currentClick })
        break
      case 'escape':
        if (child.value) out.push({ text: child.value, style, hover: currentHover, click: currentClick })
        break
      case 'color':
        walkChildren(child.children, { ...style, color: child.color }, currentHover, currentClick, out, options)
        break
      case 'decoration':
        walkChildren(
          child.children,
          { ...style, [child.decoration]: true },
          currentHover,
          currentClick,
          out,
          options,
        )
        break
      case 'insertion':
        walkChildren(
          child.children,
          { ...style, insertion: child.value },
          currentHover,
          currentClick,
          out,
          options,
        )
        break
      case 'hover':
        walkChildren(child.children, style, child.action, currentClick, out, options)
        break
      case 'click':
        walkChildren(child.children, style, currentHover, child.action, out, options)
        break
      case 'gradient':
        emitGradient(child, style, currentHover, currentClick, out, options)
        break
      case 'rainbow':
        emitRainbow(child, style, currentHover, currentClick, out, options)
        break
      case 'pride':
        emitPride(child, style, currentHover, currentClick, out, options)
        break
      case 'transition':
        emitTransition(child, style, currentHover, currentClick, out)
        break
      case 'font':
        walkChildren(child.children, style, currentHover, currentClick, out, options)
        break
      case 'shadow':
        walkChildren(
          child.children,
          { ...style, shadowColor: child.color },
          currentHover,
          currentClick,
          out,
          options,
        )
        break
      case 'keybind':
        pushMuted(`[key:${child.key}]`, out, style, currentHover, currentClick)
        break
      case 'localized':
        pushMuted(
          child.fallback ? child.fallback : `[lang:${child.key}]`,
          out,
          style,
          currentHover,
          currentClick,
        )
        break
      case 'selector':
        pushMuted(`[selector:${child.selector}]`, out, style, currentHover, currentClick)
        break
      case 'nbt':
        pushMuted(`[nbt:${child.value}]`, out, style, currentHover, currentClick)
        break
      case 'score':
        pushMuted(`[score:${child.value}]`, out, style, currentHover, currentClick)
        break
      case 'sprite':
        pushMuted(`[sprite:${child.value}]`, out, style, currentHover, currentClick)
        break
      case 'head':
        pushMuted(`[head:${child.value}]`, out, style, currentHover, currentClick)
        break
      case 'variable': {
        if (child.children && child.children.length > 0) {
          walkChildren(child.children, style, currentHover, currentClick, out, options)
        } else if (child.name) {
          out.push({
            text: `<${child.name}>`,
            style: { ...style, italic: true, color: '#a6adc8' },
            hover: currentHover,
            click: currentClick,
          })
        }
        break
      }
    }
  }
}

function collectText(node: MiniMessageNode): string {
  switch (node.type) {
    case 'text':
    case 'escape':
      return node.value
    case 'newline':
      return '\n'
    case 'variable':
      return childText(node)
    case 'keybind':
      return `[key:${node.key}]`
    case 'localized':
      return node.fallback ? node.fallback : `[lang:${node.key}]`
    case 'selector':
      return `[selector:${node.selector}]`
    case 'nbt':
      return `[nbt:${node.value}]`
    case 'score':
      return `[score:${node.value}]`
    case 'sprite':
      return `[sprite:${node.value}]`
    case 'head':
      return `[head:${node.value}]`
    default:
      return 'children' in node && node.children ? node.children.map(collectText).join('') : ''
  }
}

function childText(node: { name: string; children?: MiniMessageNode[] }): string {
  return node.children && node.children.length > 0
    ? node.children.map(collectText).join('')
    : `<${node.name}>`
}

function pushMuted(
  text: string,
  out: ResolvedComponent[],
  style: ResolvedStyle,
  hover: ResolvedComponent['hover'],
  click: ResolvedComponent['click'],
): void {
  out.push({
    text,
    style: { ...style, italic: true, color: '#a6adc8' },
    hover,
    click,
  })
}

function emitGradient(
  node: GradientNode,
  style: ResolvedStyle,
  hover: ResolvedComponent['hover'],
  click: ResolvedComponent['click'],
  out: ResolvedComponent[],
  options: ResolveOptions,
): void {
  const text = node.children.map(collectText).join('')
  if (!text) return
  const stops = node.stops.length > 1 ? node.stops : ['#000000', '#ffffff']
  const steps = Math.min(options.steps ?? 16, Math.max(stops.length * 2, text.length))
  const perStep = text.length / steps
  for (let i = 0; i < steps; i++) {
    const ratio = steps === 1 ? 0 : i / (steps - 1)
    const color = sampleGradient(stops, ratio)
    const slice = text.slice(Math.floor(i * perStep), Math.floor((i + 1) * perStep))
    if (slice) out.push({ text: slice, style: { ...style, color }, hover, click })
  }
}

function sampleGradient(stops: string[], ratio: number): string {
  const n = stops.length
  if (n === 0) return '#ffffff'
  if (n === 1) return hexToCss(stops[0])
  const scaled = ratio * (n - 1)
  const index = Math.min(n - 2, Math.floor(scaled))
  const local = scaled - index
  return mixColors(stops[index], stops[index + 1], local)
}

function mixColors(from: string, to: string, t: number): string {
  const a = hexToRgb(from)
  const b = hexToRgb(to)
  return rgbToHex([
    lerp(a[0], b[0], t),
    lerp(a[1], b[1], t),
    lerp(a[2], b[2], t),
  ])
}

function hexToCss(hex: string): string {
  return hex.startsWith('#') ? hex : `#${hex}`
}

function emitRainbow(
  node: RainbowNode,
  style: ResolvedStyle,
  hover: ResolvedComponent['hover'],
  click: ResolvedComponent['click'],
  out: ResolvedComponent[],
  options: ResolveOptions,
): void {
  const text = node.children.map(collectText).join('')
  if (!text) return
  const steps = Math.min(options.steps ?? 8, Math.max(2, text.length))
  const perStep = text.length / steps
  for (let i = 0; i < steps; i++) {
    const hue = (i / steps) * 360
    const slice = text.slice(Math.floor(i * perStep), Math.floor((i + 1) * perStep))
    if (slice) out.push({ text: slice, style: { ...style, color: hslToHex(hue, 100, 50) }, hover, click })
  }
}

function emitPride(
  node: PrideNode,
  style: ResolvedStyle,
  hover: ResolvedComponent['hover'],
  click: ResolvedComponent['click'],
  out: ResolvedComponent[],
  options: ResolveOptions,
): void {
  const text = node.children.map(collectText).join('')
  if (!text) return
  const palette = pridePalette(node.flag)
  const steps = Math.min(options.steps ?? 12, Math.max(palette.length * 2, text.length))
  const perStep = text.length / steps
  for (let i = 0; i < steps; i++) {
    const ratio = steps === 1 ? 0 : i / (steps - 1)
    const color = sampleGradient(palette, ratio)
    const slice = text.slice(Math.floor(i * perStep), Math.floor((i + 1) * perStep))
    if (slice) out.push({ text: slice, style: { ...style, color }, hover, click })
  }
}

function emitTransition(
  node: TransitionNode,
  style: ResolvedStyle,
  hover: ResolvedComponent['hover'],
  click: ResolvedComponent['click'],
  out: ResolvedComponent[],
): void {
  const text = node.children.map(collectText).join('')
  if (!text) return
  const stops = node.stops.length > 1 ? node.stops : ['#000000', '#ffffff']
  const color = sampleGradient(stops, node.phase)
  out.push({ text, style: { ...style, color }, hover, click })
}

const PRIDE_PALETTES: Record<string, string[]> = {
  rainbow: ['#ff0018', '#ffa52c', '#ffff41', '#008018', '#0000f9', '#86007d'],
  trans: ['#5bcefa', '#f5a9b8', '#ffffff', '#f5a9b8', '#5bcefa'],
  transgender: ['#5bcefa', '#f5a9b8', '#ffffff', '#f5a9b8', '#5bcefa'],
  lesbian: ['#d52d00', '#ff9a56', '#ffffff', '#d162a4', '#a30262'],
  bisexual: ['#d60070', '#d60070', '#744ca8', '#0038a8', '#0038a8'],
  nonbinary: ['#fcf42a', '#ffffff', '#9c59d1', '#000000'],
  pansexual: ['#ff218c', '#ffd800', '#1fc3f3'],
}

function pridePalette(flag?: string): string[] {
  return (flag ? PRIDE_PALETTES[flag] : undefined) ?? PRIDE_PALETTES.rainbow
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace('#', '')
  if (m.length !== 6) return [255, 255, 255]
  return [
    parseInt(m.slice(0, 2), 16),
    parseInt(m.slice(2, 4), 16),
    parseInt(m.slice(4, 6), 16),
  ]
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t)
}

function hslToHex(h: number, s: number, l: number): string {
  const s1 = s / 100
  const l1 = l / 100
  const c = (1 - Math.abs(2 * l1 - 1)) * s1
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l1 - c / 2
  let rgb: [number, number, number]
  if (h < 60) {
    rgb = [c, x, 0]
  } else if (h < 120) {
    rgb = [x, c, 0]
  } else if (h < 180) {
    rgb = [0, c, x]
  } else if (h < 240) {
    rgb = [0, x, c]
  } else if (h < 300) {
    rgb = [x, 0, c]
  } else {
    rgb = [c, 0, x]
  }
  return rgbToHex(rgb.map((v) => Math.round((v + m) * 255)) as [number, number, number])
}

