import { useEffect, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import type { MiniStringEntry } from '../../types/discovery'
import type { ResolvedComponent } from '../../types/minimessage'
import { cn } from '../../../../shared/lib/cn'
import { RichText } from './RichText'

interface RenderedListProps {
  entries: MiniStringEntry[]
  previews: Map<string, ResolvedComponent[]>
  activeId: string | null
  errorCount?: number
  onSelect: (id: string) => void
}

const HTML_ENTITIES: Record<string, string> = {
  '\x26': '\x26amp;',
  '\x3c': '\x26lt;',
  '\x3e': '\x26gt;',
  '\x22': '\x26quot;',
  '\x27': '\x26#39;',
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => HTML_ENTITIES[c] ?? c)
}

function highlightMatch(text: string, q: string): string {
  if (!q) return escapeHtml(text)
  const idx = text.toLowerCase().indexOf(q.toLowerCase())
  if (idx === -1) return escapeHtml(text)
  const before = escapeHtml(text.slice(0, idx))
  const match = escapeHtml(text.slice(idx, idx + q.length))
  const after = escapeHtml(text.slice(idx + q.length))
  return `${before}<mark class="rounded-sm bg-[var(--accent)]/25 px-0.5 text-inherit">${match}</mark>${after}`
}

export function RenderedList({ entries, previews, activeId, errorCount = 0, onSelect }: RenderedListProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return entries
    return entries.filter((e) => e.source.toLowerCase().includes(q) || e.path.toLowerCase().includes(q))
  }, [entries, query])

  useEffect(() => {
    const container = document.querySelector<HTMLElement>('[data-rendered-list]')
    if (!container || !activeId) return
    const el = container.querySelector<HTMLElement>(`[data-id="${activeId}"]`)
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [activeId])

  return (
    <div className="flex h-full flex-col" data-rendered-list>
      <div className="flex shrink-0 items-center gap-1.5 border-b border-line px-2 py-1.5">
        <Search size={13} className="shrink-0 text-[#6c7086]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter messages…"
          className="min-w-0 flex-1 bg-transparent text-[12px] text-[#cdd6f4] outline-none placeholder:text-[#6c7086]"
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear"
            onClick={() => setQuery('')}
            className="rounded-sm p-0.5 text-[#6c7086] transition-colors hover:text-[#cdd6f4]"
          >
            <X size={13} />
          </button>
        ) : null}
        <span className="shrink-0 text-[10px] text-[#585b70]">{filtered.length}</span>
      </div>

      <div className="mc-chat min-h-0 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-[13px] text-[#6c7086]">
            {query
              ? 'No messages match that filter.'
              : errorCount > 0
                ? 'This file has issues — fix them (see the error list) to reveal its messages.'
                : 'No rendered messages in this file. Move your caret onto a message line, or click one above.'}
          </div>
        ) : (
          <ul className="divide-y divide-hover">
            {filtered.map((entry) => {
              const isActive = entry.id === activeId
              const resolved = previews.get(entry.id)
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    data-id={entry.id}
                    onClick={() => onSelect(entry.id)}
                    className={cn(
                      'block w-full px-3 py-2 text-left transition-colors duration-150',
                      isActive
                        ? 'border-l-2 border-l-[var(--accent)] bg-hover pl-2'
                        : 'border-l-2 border-l-transparent hover:bg-hover',
                    )}
                  >
                    <div className="font-mc text-[15px] leading-normal text-[#cdd6f4]">
                      {resolved ? <RichText components={resolved} /> : <span className="text-[#6c7086]">{entry.source}</span>}
                    </div>
                    <div
                      className="mt-0.5 truncate text-[10px] text-[#585b70]"
                      dangerouslySetInnerHTML={{ __html: highlightMatch(entry.path, query.trim()) }}
                    />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
