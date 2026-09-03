import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface PanelProps {
  title?: ReactNode
  icon?: LucideIcon
  actions?: ReactNode
  className?: string
  children: ReactNode
}

export function Panel({ title, icon: Icon, actions, className, children }: PanelProps) {
  return (
    <section
      className={cn(
        'flex min-h-0 flex-col overflow-hidden rounded-none border border-white/5 bg-surface/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(0,0,0,0.4)] backdrop-blur-md',
        className,
      )}
    >
      {title || actions ? (
        <header className="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-line bg-panel px-3">
          {title ? (
            <h2 className="flex items-center gap-2 text-[13px] font-medium text-[#a6adc8]">
              {Icon ? (
                <Icon size={13} className="shrink-0 text-[var(--accent)]" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-none bg-[var(--accent)]" />
              )}
              {title}
            </h2>
          ) : null}
          {actions}
        </header>
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  )
}
