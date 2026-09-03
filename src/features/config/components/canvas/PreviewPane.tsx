import { useMemo } from 'react'
import { MessageSquare } from 'lucide-react'
import type { MiniStringEntry } from '../../types/discovery'
import type { ResolvedComponent } from '../../types/minimessage'
import { Panel } from '../../../../shared/components/ui/Panel'
import { RenderedList } from './RenderedList'

interface PreviewPaneProps {
  entries: MiniStringEntry[]
  previews: Map<string, ResolvedComponent[]>
  activeId: string | null
  activeFileId: string
  activeFileName: string
  errorCount?: number
  onSelect: (id: string) => void
  className?: string
}

export function PreviewPane({
  entries,
  previews,
  activeId,
  activeFileId,
  activeFileName,
  errorCount = 0,
  onSelect,
  className,
}: PreviewPaneProps) {
  const fileEntries = useMemo(
    () => entries.filter((entry) => entry.fileId === activeFileId),
    [entries, activeFileId],
  )

  return (
    <Panel
      className={className}
      title="Rendered"
      icon={MessageSquare}
      actions={
        <span className="truncate font-mono text-[10px] text-[#6c7086]">
          {activeFileName}
          {fileEntries.length > 0 ? ` · ${fileEntries.length} msg` : ''}
        </span>
      }
    >
      <div className="relative min-h-0 flex-1 bg-night/30 backdrop-blur-md">
        <RenderedList
          entries={fileEntries}
          previews={previews}
          activeId={activeId}
          errorCount={errorCount}
          onSelect={onSelect}
        />
      </div>
    </Panel>
  )
}
