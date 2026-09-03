import { useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { EditorPane, type RevealTarget } from './components/editor/EditorPane'
import { PreviewPane } from './components/canvas/PreviewPane'
import { useWorkspace } from './hooks/useWorkspace'
import { resolveSource } from './engine/discovery/resolvePreview'
import type { MiniStringEntry } from './types/discovery'
import type { ResolvedComponent } from './types/minimessage'

interface Caret {
  fileId: string
  line: number
}

export function ConfigPage() {
  const { state, discovery, findEntryAt, findEntryById, actions } = useWorkspace()
  const [caret, setCaret] = useState<Caret | null>(null)
  const [reveal, setReveal] = useState<RevealTarget | null>(null)

  const [lastValid, setLastValid] = useState<MiniStringEntry | null>(null)

  const currentEntry = useMemo(() => {
    const caretEntry =
      caret && caret.fileId === state.activeFileId ? findEntryAt(caret.fileId, caret.line) : null
    if (caretEntry) return caretEntry
    if (lastValid && lastValid.fileId === state.activeFileId) return lastValid
    return findEntryById(state.selectedEntryId)
  }, [caret, state.activeFileId, lastValid, findEntryAt, findEntryById, state.selectedEntryId])

  const treeByFile = useMemo(() => {
    const map = new Map<string, unknown>()
    state.files.forEach((file, i) => {
      const tree = discovery.trees[i]
      if (tree !== undefined) map.set(file.id, tree)
    })
    return map
  }, [state.files, discovery.trees])

  const previews = useMemo(() => {
    const map = new Map<string, ResolvedComponent[]>()
    for (const entry of discovery.entries) {
      map.set(entry.id, resolveSource(treeByFile.get(entry.fileId) ?? {}, entry.source))
    }
    return map
  }, [discovery.entries, treeByFile])

  const handleSelectEntry = (id: string) => {
    const entry = findEntryById(id)
    if (entry) {
      const line = entry.line ?? 1
      setCaret({ fileId: entry.fileId, line })
      setReveal({ fileId: entry.fileId, line, seq: Date.now() })
      setLastValid(entry)
    }
    actions.selectEntry(id)
  }

  const handleCaretChange = (fileId: string, line: number) => {
    setCaret({ fileId, line })
    const entry = findEntryAt(fileId, line)
    if (entry) setLastValid(entry)
  }

  const [split, setSplit] = useState(50)
  const [isWide, setIsWide] = useState(() => window.matchMedia('(min-width: 1024px)').matches)
  const splitRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => setIsWide(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const onDividerDown = (e: RPointerEvent<HTMLDivElement>) => {
    dragging.current = true
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onDividerMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !splitRef.current) return
    const rect = splitRef.current.getBoundingClientRect()
    const pct = ((e.clientX - rect.left) / rect.width) * 100
    setSplit(Math.max(28, Math.min(72, pct)))
  }
  const onDividerUp = () => {
    dragging.current = false
  }

  return (
    <div ref={splitRef} className="flex h-full min-h-0 flex-col lg:flex-row">
      <div
        className="min-h-[460px] min-w-0 lg:min-h-0 lg:shrink-0"
        style={{ width: isWide ? `${split}%` : '100%' }}
      >
        <EditorPane
          className="h-full min-h-[460px] lg:min-h-0"
          files={state.files}
          activeFileId={state.activeFileId}
          errors={discovery.errors}
          totalErrors={discovery.totalErrors}
          revealTarget={reveal}
          onRevealError={(fileId, line) => {
            actions.selectFile(fileId)
            setReveal({ fileId, line, seq: Date.now() })
          }}
          onCaretChange={handleCaretChange}
          onChangeFile={actions.updateFile}
          onSelectFile={actions.selectFile}
          onAddFile={actions.addFile}
          onRemoveFile={actions.removeFile}
          onRenameFile={actions.renameFile}
        />
      </div>

      <div
        onPointerDown={onDividerDown}
        onPointerMove={onDividerMove}
        onPointerUp={onDividerUp}
        title="Drag to resize"
        className="group hidden w-2 shrink-0 cursor-col-resize items-center justify-center lg:flex"
      >
        <div className="h-10 w-0.5 rounded-full bg-line transition-colors duration-150 group-hover:bg-[#585b70] group-active:bg-[var(--accent)]" />
      </div>

      <div className="min-h-[460px] min-w-0 lg:min-h-0 lg:flex-1">
        <PreviewPane
          className="h-full min-h-[460px] lg:min-h-0"
          entries={discovery.entries}
          previews={previews}
          activeId={currentEntry?.id ?? null}
          activeFileId={state.activeFileId}
          activeFileName={state.files.find((f) => f.id === state.activeFileId)?.name ?? ''}
          errorCount={discovery.totalErrors}
          onSelect={handleSelectEntry}
        />
      </div>
    </div>
  )
}
