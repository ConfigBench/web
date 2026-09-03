import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import Editor, { type BeforeMount, type OnMount } from '@monaco-editor/react'
import { ChevronDown, ChevronUp, FilePlus, FolderOpen, ListX, X } from 'lucide-react'
import { useTheme } from '../../../../shared/theme/useTheme'
import { THEMES } from '../../../../shared/theme/theme'
import type { ConfigFile, ConfigParseError } from '../../types/discovery'
import { cn } from '../../../../shared/lib/cn'
import { Panel } from '../../../../shared/components/ui/Panel'
import './monacoSetup'

type MonacoNamespace = Parameters<OnMount>[1]

function applyAccentTheme(monaco: MonacoNamespace, accent: string): void {
  monaco.editor.defineTheme('adventure-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6c7086', fontStyle: 'italic' },
      { token: 'string', foreground: accent.slice(1) },
      { token: 'number', foreground: 'fab387' },
      { token: 'keyword', foreground: accent.slice(1) },
    ],
    colors: {
      'editor.background': '#0d0d17',
      'editor.foreground': '#cdd6f4',
      'editorLineNumber.foreground': '#585b70',
      'editorLineNumber.activeForeground': '#a6adc8',
      'editor.lineHighlightBackground': '#15151f',
      'editorCursor.foreground': accent,
      'editor.selectionBackground': `${accent}22`,
      'editorIndentGuide.background1': '#2b2b3b',
      'editorGutter.background': '#0d0d17',
      'scrollbarSlider.background': '#2b2b3b80',
      'scrollbarSlider.hoverBackground': '#45475a',
      'scrollbarSlider.activeBackground': '#585b70',
    },
  })
}

export interface RevealTarget {
  fileId: string
  line: number
  seq: number
}

interface EditorPaneProps {
  files: ConfigFile[]
  activeFileId: string
  errors: ConfigParseError[]
  totalErrors?: number
  revealTarget: RevealTarget | null
  onRevealError: (fileId: string, line: number) => void
  onCaretChange: (fileId: string, line: number) => void
  onChangeFile: (id: string, content: string) => void
  onSelectFile: (id: string) => void
  onAddFile: () => void
  onRemoveFile: (id: string) => void
  onRenameFile: (id: string, name: string) => void
  className?: string
}

export function EditorPane({
  files,
  activeFileId,
  errors,
  totalErrors,
  revealTarget,
  onRevealError,
  onCaretChange,
  onChangeFile,
  onSelectFile,
  onAddFile,
  onRemoveFile,
  onRenameFile,
  className,
}: EditorPaneProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null)
  const active = files.find((f) => f.id === activeFileId) ?? files[0]

  const { accent } = useTheme()
  const accentColor = THEMES.find((t) => t.id === accent)?.color ?? THEMES[0].color
  const accentRef = useRef(accentColor)

  const beforeMount: BeforeMount = useCallback(
    (monaco) => {
      applyAccentTheme(monaco, accentRef.current)
    },
    [],
  )

  useEffect(() => {
    const monaco = monacoRef.current
    if (monaco) {
      applyAccentTheme(monaco, accentColor)
      monaco.editor.setTheme('adventure-dark')
    }
  }, [accentColor])

  const onMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
    const fileId = active?.id ?? ''
    editor.onDidChangeCursorPosition((e) => {
      onCaretChange(fileId, e.position.lineNumber)
    })
    editor.focus()
  }

  useEffect(() => {
    const editor = editorRef.current
    const monaco = monacoRef.current
    if (!editor || !revealTarget || revealTarget.fileId !== active?.id) return
    editor.revealLineInCenter(revealTarget.line, monaco?.editor.ScrollType.Smooth)
    editor.setPosition({ lineNumber: revealTarget.line, column: 1 })
    editor.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealTarget])

  useEffect(() => {
    const editor = editorRef.current
    const monaco = monacoRef.current
    const model = editor?.getModel()
    if (!editor || !monaco || !model || !active) return

    const fileErrors = errors.filter((e) => (e.file ? e.file === active.name : true))
    const markers = fileErrors
      .filter((e) => e.line != null)
      .map((e) => ({
        severity: monaco.MarkerSeverity.Error,
        message: e.message,
        startLineNumber: e.line as number,
        startColumn: 1,
        endLineNumber: e.line as number,
        endColumn: model.getLineLength(e.line as number) + 1,
      }))

    monaco.editor.setModelMarkers(model, 'adventure', markers)
  }, [errors, active, activeFileId])

  const errorCount = totalErrors ?? errors.length
  const truncated = errorCount > errors.length

  const [problemsOpen, setProblemsOpen] = useState(errorCount > 0)
  const [panelHeight, setPanelHeight] = useState(200)
  const dragRef = useRef<{ startY: number; startH: number } | null>(null)

  const onDragStart = (e: RPointerEvent<HTMLDivElement>) => {
    dragRef.current = { startY: e.clientY, startH: panelHeight }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onDragMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return
    const delta = dragRef.current.startY - e.clientY
    setPanelHeight(Math.max(80, Math.min(500, dragRef.current.startH + delta)))
  }
  const onDragEnd = () => {
    dragRef.current = null
  }

  const handleErrorClick = (e: ConfigParseError) => {
    const file = e.file ? files.find((f) => f.name === e.file) : active
    if (!file) return
    const line = e.line ?? 1
    onRevealError(file.id, line)
  }

  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const startRename = (file: ConfigFile) => {
    setRenamingId(file.id)
    setRenameValue(file.name)
  }
  const commitRename = () => {
    const next = renameValue.trim()
    if (renamingId && next) onRenameFile(renamingId, next)
    setRenamingId(null)
  }
  const cancelRename = () => setRenamingId(null)

  return (
    <Panel
      className={className}
      title="Workspace"
      icon={FolderOpen}
      actions={
        <span
          className={`mc-btn rounded-none px-1.5 py-0.5 text-[10px] ${
            errorCount > 0 ? 'text-[#f38ba8]' : 'text-[var(--accent)]'
          }`}
        >
          {errorCount > 0 ? `${errorCount} issue${errorCount > 1 ? 's' : ''}` : 'valid'}
        </span>
      }
    >
      <div
        className={cn(
          'flex shrink-0 items-center gap-0 overflow-x-auto border-b border-line bg-night/30 backdrop-blur-sm',
          files.length > 0 && 'px-1',
        )}
      >
        {files.map((file) => {
          const isActive = file.id === activeFileId
          return (
            <div
              key={file.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                if (renamingId !== file.id) onSelectFile(file.id)
              }}
              onDoubleClick={() => startRename(file)}
              title="Double-click to rename"
              className={cn(
                'group flex shrink-0 cursor-pointer items-center gap-1 border-r border-b-2 border-line px-3 py-2 text-[12px] transition-colors duration-150',
                isActive
                  ? 'border-b-[var(--accent)] text-[#cdd6f4]'
                  : 'border-b-transparent text-[#6c7086] hover:text-[#a6adc8]',
              )}
            >
              {renamingId === file.id ? (
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename()
                    else if (e.key === 'Escape') cancelRename()
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-24 min-w-0 rounded-sm border border-[var(--accent)] bg-night px-1 py-0.5 text-[12px] text-[#cdd6f4] outline-none"
                />
              ) : (
                <span className="truncate">{file.name}</span>
              )}
              {renamingId !== file.id ? (
                <button
                  type="button"
                  aria-label={`Close ${file.name}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveFile(file.id)
                  }}
                  className="mc-btn rounded-none p-0.5 text-[#6c7086] transition-colors duration-150 hover:text-[#f38ba8]"
                >
                  <X size={12} />
                </button>
              ) : null}
            </div>
          )
        })}
        <button
          type="button"
          title="Add config file"
          onClick={onAddFile}
          className={cn(
            'mc-btn flex h-6 w-6 shrink-0 items-center justify-center rounded-none text-[#6c7086] hover:text-[var(--accent)]',
            files.length > 0 && 'ml-1',
          )}
        >
          <FilePlus size={14} />
        </button>
      </div>

      <div className="min-h-0 flex-1">
        {active ? (
          <Editor
            key={active.id}
            language="yaml"
            theme="adventure-dark"
            value={active.content}
            onChange={(next) => {
              if (active) onChangeFile(active.id, next ?? '')
            }}
            onMount={onMount}
            beforeMount={beforeMount}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineHeight: 21,
              fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Consolas, monospace",
              wordWrap: 'on',
              wordWrapColumn: 100,
              wrappingIndent: 'indent',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              lineNumbers: 'on',
              stickyScroll: { enabled: false },
              renderLineHighlight: 'gutter',
              scrollbar: { vertical: 'auto' },
              padding: { top: 12, bottom: 12 },
            }}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2.5 px-6 text-center">
            <p className="text-[13px] text-[#cdd6f4]">No file open.</p>
            <p className="max-w-[320px] text-[12px] leading-relaxed text-[#6c7086]">
              Add a config file to start, then paste any YAML and watch each MiniMessage render live.
            </p>
            <button
              type="button"
              onClick={onAddFile}
              className="mc-btn mt-1 flex items-center gap-1.5 rounded-none px-3 py-1.5 text-[12px] text-[#a6adc8] hover:text-[var(--accent)]"
            >
              <FilePlus size={14} />
              New file
            </button>
          </div>
        )}
      </div>

      {errorCount > 0 || problemsOpen ? (
        <div className="shrink-0 border-t border-line bg-surface/60 backdrop-blur-md">
          <div
            className="group flex h-1.5 shrink-0 cursor-row-resize items-center justify-center"
            onPointerDown={onDragStart}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
            title="Drag to resize"
          >
            <div className="h-0.5 w-12 rounded-full bg-line opacity-60 transition-all duration-150 group-hover:bg-[#585b70] group-hover:opacity-100" />
          </div>

          <button
            type="button"
            onClick={() => setProblemsOpen((o) => !o)}
            aria-expanded={problemsOpen}
            className="group flex h-6 w-full shrink-0 items-center justify-between px-2.5 text-[11px] transition-colors duration-150 hover:bg-hover"
          >
            <span className="flex items-center gap-1.5 text-[#a6adc8]">
              <ListX size={12} className="text-[#f38ba8]" />
              Problems
              {errorCount > 0 ? ` · ${errorCount}` : ''}
              {truncated ? ` (showing ${errors.length})` : ''}
            </span>
            {problemsOpen ? (
              <ChevronDown size={13} className="text-[#6c7086] transition-colors duration-150 group-hover:text-[#cdd6f4]" />
            ) : (
              <ChevronUp size={13} className="text-[#6c7086] transition-colors duration-150 group-hover:text-[#cdd6f4]" />
            )}
          </button>

          <div
            className={`grid transition-[grid-template-rows] duration-200 ease-out ${
              problemsOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="flex flex-col" style={{ height: panelHeight }}>
                <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto">
                  {errors.length === 0 ? (
                    <li className="px-2.5 py-1.5 text-[11px] text-[#6c7086]">No errors.</li>
                  ) : (
                    errors.map((e, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => handleErrorClick(e)}
                          className="flex w-full items-baseline gap-2 px-2.5 py-1.5 text-left text-[11px] transition-colors duration-150 hover:bg-line/60"
                        >
                          <span className="shrink-0 font-mono text-[10px] text-[#6c7086]">
                            {e.file}
                            {e.line != null ? `:${e.line}` : ''}
                          </span>
                          <span className="min-w-0 truncate text-[#cdd6f4]">{e.message}</span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Panel>
  )
}
