import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Compass, Search, Wrench, X } from 'lucide-react'
import { TOOL_CATEGORIES, TOOLS, type ToolCategory, type ToolDef } from '../../shared/tools'
import { cn } from '../../shared/lib/cn'

type CategoryFilter = 'All' | ToolCategory

export function ToolsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCat = searchParams.get('category') as ToolCategory | null
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>(
    initialCat && TOOL_CATEGORIES.includes(initialCat) ? initialCat : 'All',
  )
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase()
      if (activeTag === 'input' || activeTag === 'textarea') return

      if (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const nextParams = new URLSearchParams()
    if (query.trim()) nextParams.set('q', query.trim())
    if (selectedCategory !== 'All') nextParams.set('category', selectedCategory)

    const nextStr = nextParams.toString() ? `?${nextParams.toString()}` : ''
    if (window.location.search !== nextStr) {
      setSearchParams(nextParams, { replace: true })
    }
  }, [query, selectedCategory, setSearchParams])

  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase()
    return TOOLS.filter((tool) => {
      if (selectedCategory !== 'All' && tool.category !== selectedCategory) {
        return false
      }
      if (!q) return true
      return (
        tool.label.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    })
  }, [query, selectedCategory])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: TOOLS.length }
    for (const cat of TOOL_CATEGORIES) {
      counts[cat] = TOOLS.filter((t) => t.category === cat).length
    }
    return counts
  }, [])

  const isBrowsingAll = !query.trim() && selectedCategory === 'All'

  return (
    <div className="relative flex min-h-full flex-col items-center px-4 py-8 text-center sm:px-6">
      <div className="page-enter flex flex-col items-center" style={{ animationDelay: '0ms' }}>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
          <Wrench size={14} />
          <span>Workbench Directory</span>
        </div>
        <h1 className="mt-2 font-mc text-3xl text-[#cdd6f4] sm:text-4xl">All Tools</h1>
        <p className="font-mc mt-2 max-w-lg text-[13px] leading-relaxed text-[#a6adc8] sm:text-[14px]">
          Search or filter across our suite of client-side Minecraft creation and configuration tools.
        </p>
      </div>

      <div className="page-enter relative mt-6 w-full max-w-2xl" style={{ animationDelay: '60ms' }}>
        <div className="mc-input flex h-11 items-center gap-2.5 rounded-none px-3 shadow-inner">
          <Search size={16} className="shrink-0 text-[#6c7086]" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setQuery('')
                searchInputRef.current?.blur()
              }
            }}
            placeholder="Search tools, formats, or keywords... (press '/' to focus)"
            className="min-w-0 flex-1 bg-transparent font-mono text-xs text-[#cdd6f4] outline-none placeholder:text-[#6c7086]"
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery('')
                searchInputRef.current?.focus()
              }}
              className="mc-icon-btn h-6 w-6 rounded-none p-0 text-[#a6adc8] hover:text-[#cdd6f4]"
            >
              <X size={12} />
            </button>
          ) : (
            <kbd className="hidden shrink-0 rounded-none border border-line bg-[#1e1e2b] px-1.5 py-0.5 font-mono text-[10px] text-[#6c7086] sm:inline-block">
              /
            </kbd>
          )}
        </div>

        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
          {(['All', ...TOOL_CATEGORIES] as const).map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                data-active={isSelected}
                className={cn(
                  'mc-btn flex items-center gap-1.5 rounded-none px-2.5 py-1 text-xs text-[#a6adc8] transition-colors hover:text-[#cdd6f4]',
                  isSelected && '!border-[var(--accent)] !text-[var(--accent)]',
                )}
              >
                <span>{cat}</span>
                <span className="font-mono text-[10px] opacity-70">({categoryCounts[cat] ?? 0})</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="relative mt-8 w-full max-w-6xl">
        {filteredTools.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-none border border-line/60 bg-surface/50 p-8 text-center">
            <Compass size={28} className="text-[#6c7086]" />
            <p className="font-mc text-base text-[#cdd6f4]">No matching tools found</p>
            <p className="max-w-md text-xs text-[#a6adc8]">
              No tools match <span className="font-mono text-[var(--accent)]">"{query}"</span>. Try searching for formats like{' '}
              <button
                type="button"
                onClick={() => setQuery('yaml')}
                className="font-mono text-[var(--accent)] hover:underline"
              >
                yaml
              </button>
              ,{' '}
              <button
                type="button"
                onClick={() => setQuery('portal')}
                className="font-mono text-[var(--accent)] hover:underline"
              >
                portal
              </button>
              , or{' '}
              <button
                type="button"
                onClick={() => setQuery('gradient')}
                className="font-mono text-[var(--accent)] hover:underline"
              >
                gradient
              </button>
              .
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setSelectedCategory('All')
              }}
              className="mc-btn mt-2 rounded-none px-3 py-1.5 text-xs text-[var(--accent)]"
            >
              Clear Filter
            </button>
          </div>
        ) : isBrowsingAll ? (
          <div className="flex flex-col gap-8 text-left">
            {TOOL_CATEGORIES.map((cat) => {
              const categoryTools = TOOLS.filter((t) => t.category === cat)
              if (categoryTools.length === 0) return null

              return (
                <section key={cat} className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 border-b border-line/60 pb-2">
                    <span className="h-1.5 w-1.5 rounded-none bg-[var(--accent)]" />
                    <h2 className="font-mc text-sm tracking-wide text-[#cdd6f4] uppercase">{cat}</h2>
                    <span className="font-mono text-[10px] text-[#6c7086]">({categoryTools.length})</span>
                  </div>

                  <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                    {categoryTools.map((tool) => (
                      <ToolCard key={tool.to} tool={tool} />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        ) : (
          <div className="grid gap-3.5 text-left sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.to} tool={tool} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ToolCard({ tool }: { tool: ToolDef }) {
  const Icon = tool.icon

  return (
    <Link
      to={tool.to}
      className="mc-btn group flex flex-col justify-between gap-3 rounded-none p-4 text-left transition-colors duration-150 hover:border-[var(--accent)]/70 hover:text-[#cdd6f4]"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="mc-icon-btn h-9 w-9 rounded-none text-[var(--accent)] transition-transform duration-150 group-hover:scale-110">
            <Icon size={18} />
          </span>
          <div className="flex items-center gap-1.5">
            <span className="rounded-none border border-line bg-[#1e1e2b] px-1.5 py-0.5 font-mono text-[9px] text-[#6c7086] uppercase">
              {tool.category}
            </span>
            <ArrowRight
              size={14}
              className="text-[#6c7086] opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-[var(--accent)] group-hover:opacity-100"
            />
          </div>
        </div>

        <span className="font-mc text-[16px] text-[#cdd6f4]">{tool.label}</span>
        <p className="text-[12px] leading-relaxed text-[#a6adc8]">{tool.description}</p>
      </div>

      <div className="flex flex-wrap gap-1 border-t border-line/40 pt-2 font-mono text-[10px] text-[#6c7086]">
        {tool.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="bg-black/20 px-1 py-0.5 text-[#6c7086]">
            #{tag}
          </span>
        ))}
      </div>
    </Link>
  )
}
