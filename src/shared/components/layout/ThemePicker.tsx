import { useCallback, useEffect, useRef, useState } from 'react'
import { useTheme } from '../../theme/useTheme'
import { THEMES } from '../../theme/theme'
import { cn } from '../../lib/cn'

const EXIT_MS = 110

export function ThemePicker() {
  const { accent, setAccent } = useTheme()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const exitTimer = useRef(0)
  const ref = useRef<HTMLDivElement>(null)
  const current = THEMES.find((t) => t.id === accent) ?? THEMES[0]

  const openPicker = useCallback(() => {
    window.clearTimeout(exitTimer.current)
    setOpen(true)
    setMounted(true)
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    window.clearTimeout(exitTimer.current)
    exitTimer.current = window.setTimeout(() => setMounted(false), EXIT_MS)
  }, [])

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
      window.clearTimeout(exitTimer.current)
    }
  }, [close])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Accent color"
        aria-expanded={open}
        title="Accent color"
        onClick={() => (open ? close() : openPicker())}
        className="mc-btn flex h-7 w-7 items-center justify-center rounded-none"
      >
        <span
          className="h-3.5 w-3.5 rounded-none border border-black/30"
          style={{ background: current.color }}
        />
      </button>

      {mounted ? (
        <div
          className={cn(
            'absolute bottom-9 right-0 z-50 flex items-center gap-1.5 rounded-none border border-line bg-panel p-2 shadow-2xl',
            open ? 'menu-in' : 'menu-out',
          )}
        >
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              aria-label={theme.name}
              title={theme.name}
              onClick={() => {
                setAccent(theme.id)
                close()
              }}
              className={cn(
                'h-4 w-4 rounded-none border border-black/30 transition-transform duration-150 hover:scale-110',
                theme.id === accent && 'ring-2 ring-[var(--accent)] ring-offset-1 ring-offset-panel',
              )}
              style={{ background: theme.color }}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
