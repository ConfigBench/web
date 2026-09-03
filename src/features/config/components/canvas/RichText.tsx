import { useState, type CSSProperties } from 'react'
import type { HoverAction, MiniMessageNode, ResolvedComponent, ResolvedStyle } from '../../types/minimessage'
import { cn } from '../../../../shared/lib/cn'

interface RichTextProps {
  components: ResolvedComponent[]
  className?: string
  textShadow?: boolean
}

export function RichText({ components, className, textShadow = true }: RichTextProps) {
  return (
    <span className={className}>
      {components.map((component, i) => (
        <Run key={i} component={component} textShadow={textShadow} />
      ))}
    </span>
  )
}

function Run({
  component,
  textShadow,
}: {
  component: ResolvedComponent
  textShadow: boolean
}) {
  const { text, style, hover, click } = component
  const [hovered, setHovered] = useState(false)

  let hoverTitle: string | null = null
  if (hover) {
    hoverTitle =
      hover.kind === 'show_text'
        ? hover.content.map(nodeText).join('')
        : `${hover.kind}: ${hoverTarget(hover)}`
  }

  const clickTitle = click ? `${click.kind}: ${click.value}` : null

  const interactive = Boolean(hover || click)

  const handleClick = () => {
    if (!click) return
    if (click.kind === 'copy_to_clipboard') {
      void navigator.clipboard?.writeText(click.value)
    } else if (click.kind === 'open_url') {
      window.open(click.value, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <span
      className={cn(
        'font-mc',
        interactive && 'cursor-pointer',
        style.obfuscated && 'select-none blur-[1px]',
        hovered && interactive && 'underline decoration-1 underline-offset-2',
      )}
      style={buildStyle(style, textShadow)}
      title={[hoverTitle, clickTitle].filter(Boolean).join(' — ') || undefined}
      onMouseEnter={() => interactive && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      {text}
    </span>
  )
}

function hoverTarget(hover: HoverAction): string {
  if ('item' in hover) return hover.item
  if ('entity' in hover) return hover.entity
  return ''
}

function buildStyle(style: ResolvedStyle, textShadow: boolean): CSSProperties {
  const decoration = [
    style.underlined ? 'underline' : null,
    style.strikethrough ? 'line-through' : null,
  ]
    .filter(Boolean)
    .join(' ')

  const shadowColor = style.shadowColor ?? 'rgba(0,0,0,0.7)'

  return {
    color: style.color ?? undefined,
    fontWeight: style.bold ? 700 : undefined,
    fontStyle: style.italic ? 'italic' : undefined,
    textDecoration: decoration || undefined,
    textShadow: textShadow && !style.obfuscated ? `1px 1px 0 ${shadowColor}` : undefined,
  }
}

function nodeText(node: MiniMessageNode): string {
  if (node.type === 'text' || node.type === 'escape') return node.value
  if (node.type === 'newline') return '\n'
  return 'children' in node ? node.children.map(nodeText).join('') : ''
}
