export type DecorationType =
  | 'bold'
  | 'italic'
  | 'underlined'
  | 'strikethrough'
  | 'obfuscated'

export type NamedColor = string
export type HexColor = `#${string}`
export type MiniMessageColor = NamedColor | HexColor

export type HoverActionKind = 'show_text' | 'show_item' | 'show_entity'
export type ClickActionKind =
  | 'open_url'
  | 'run_command'
  | 'suggest_command'
  | 'change_page'
  | 'copy_to_clipboard'

export interface SourceRange {
  start: number
  end: number
}

export interface MiniMessageParseError {
  message: string
  range: SourceRange
}

export interface MiniMessageParseResult {
  node: RootNode
  errors: MiniMessageParseError[]
}

export type MiniMessageToken =
  | TextToken
  | OpenTagToken
  | CloseTagToken
  | EscapeToken
  | ErrorToken

export interface TextToken {
  kind: 'text'
  value: string
  range: SourceRange
}

export interface OpenTagToken {
  kind: 'open-tag'
  name: string
  args: string[]
  selfClosing?: boolean
  range: SourceRange
}

export interface CloseTagToken {
  kind: 'close-tag'
  name: string
  range: SourceRange
}

export interface EscapeToken {
  kind: 'escape'
  value: string
  range: SourceRange
}

export interface ErrorToken {
  kind: 'error'
  message: string
  range: SourceRange
}

export type MiniMessageNode =
  | RootNode
  | TextNode
  | EscapeNode
  | ColorNode
  | GradientNode
  | RainbowNode
  | ResetNode
  | DecorationNode
  | HoverNode
  | ClickNode
  | InsertionNode
  | NewlineNode
  | FontNode
  | ShadowNode
  | PrideNode
  | TransitionNode
  | KeybindNode
  | LocalizedNode
  | SelectorNode
  | NbtNode
  | ScoreNode
  | SpriteNode
  | HeadNode
  | StyleChangeNode
  | VariableNode

export interface StyleChangeNode {
  type: 'style-change'
  color?: MiniMessageColor
  decoration?: DecorationType
  shadowColor?: MiniMessageColor
  reset?: boolean
}

export interface VariableNode {
  type: 'variable'
  name: string
  children: MiniMessageNode[]
}

export interface FontNode {
  type: 'font'
  font: string
  children: MiniMessageNode[]
}

export interface ShadowNode {
  type: 'shadow'
  color: MiniMessageColor
  children: MiniMessageNode[]
}

export interface PrideNode {
  type: 'pride'
  flag?: string
  children: MiniMessageNode[]
}

export interface TransitionNode {
  type: 'transition'
  stops: MiniMessageColor[]
  phase: number
  children: MiniMessageNode[]
}

export interface KeybindNode {
  type: 'keybind'
  key: string
}

export interface LocalizedNode {
  type: 'localized'
  key: string
  fallback?: string
}

export interface SelectorNode {
  type: 'selector'
  selector: string
}

export interface NbtNode {
  type: 'nbt'
  value: string
}

export interface ScoreNode {
  type: 'score'
  value: string
}

export interface SpriteNode {
  type: 'sprite'
  value: string
}

export interface HeadNode {
  type: 'head'
  value: string
}

export interface RootNode {
  type: 'root'
  children: MiniMessageNode[]
}

export interface TextNode {
  type: 'text'
  value: string
}

export interface EscapeNode {
  type: 'escape'
  value: string
}

export interface ColorNode {
  type: 'color'
  color: MiniMessageColor
  children: MiniMessageNode[]
}

export interface GradientNode {
  type: 'gradient'
  stops: MiniMessageColor[]
  children: MiniMessageNode[]
}

export interface RainbowNode {
  type: 'rainbow'
  children: MiniMessageNode[]
}

export interface ResetNode {
  type: 'reset'
  hard: boolean
  children: MiniMessageNode[]
}

export interface DecorationNode {
  type: 'decoration'
  decoration: DecorationType
  children: MiniMessageNode[]
}

export interface HoverNode {
  type: 'hover'
  action: HoverAction
  children: MiniMessageNode[]
}

export type HoverAction =
  | { kind: 'show_text'; content: MiniMessageNode[] }
  | { kind: 'show_item'; item: string }
  | { kind: 'show_entity'; entity: string }

export interface ClickNode {
  type: 'click'
  action: ClickAction
  children: MiniMessageNode[]
}

export type ClickAction =
  | { kind: 'open_url'; value: string }
  | { kind: 'run_command'; value: string }
  | { kind: 'suggest_command'; value: string }
  | { kind: 'change_page'; value: string }
  | { kind: 'copy_to_clipboard'; value: string }

export interface InsertionNode {
  type: 'insertion'
  value: string
  children: MiniMessageNode[]
}

export interface NewlineNode {
  type: 'newline'
}

export interface ResolvedStyle {
  color: MiniMessageColor | null
  bold: boolean
  italic: boolean
  underlined: boolean
  strikethrough: boolean
  obfuscated: boolean
  insertion: string | null
  shadowColor: MiniMessageColor | null
}

export interface ResolvedComponent {
  text: string
  style: ResolvedStyle
  hover: HoverAction | null
  click: ClickAction | null
}
