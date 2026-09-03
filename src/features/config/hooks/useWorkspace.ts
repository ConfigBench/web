import { useMemo } from 'react'
import { discover } from '../engine/discovery'
import { DEFAULT_FILES } from '../engine/discovery/defaultFiles'
import type { ConfigFile, MiniStringEntry, WorkspaceState } from '../types/discovery'
import { usePersistedState } from './usePersistedState'

function fileId(): string {
  return `file-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function createFile(name = 'config.yml'): ConfigFile {
  return { id: fileId(), name, content: '# Paste any config here.\n' }
}

export interface WorkspaceActions {
  updateFile: (id: string, content: string) => void
  addFile: () => void
  removeFile: (id: string) => void
  renameFile: (id: string, name: string) => void
  selectFile: (id: string) => void
  selectEntry: (id: string | null) => void
}

const INITIAL_STATE: WorkspaceState = {
  files: DEFAULT_FILES,
  activeFileId: DEFAULT_FILES[0].id,
  selectedEntryId: null,
}

export function useWorkspace() {
  const [state, setState] = usePersistedState<WorkspaceState>(INITIAL_STATE)

  const discovery = useMemo(
    () => discover(state.files.map((file) => ({ id: file.id, name: file.name, content: file.content }))),
    [state.files],
  )

  const actions: WorkspaceActions = {
    updateFile: (id, content) =>
      setState((s) => ({ ...s, files: s.files.map((f) => (f.id === id ? { ...f, content } : f)) })),
    addFile: () =>
      setState((s) => {
        const file = createFile()
        return { ...s, files: [...s.files, file], activeFileId: file.id }
      }),
    removeFile: (id) =>
      setState((s) => {
        const files = s.files.filter((f) => f.id !== id)
        const activeFileId = s.activeFileId === id ? (files[0]?.id ?? '') : s.activeFileId
        return { ...s, files, activeFileId }
      }),
    renameFile: (id, name) =>
      setState((s) => ({
        ...s,
        files: s.files.map((f) => (f.id === id ? { ...f, name } : f)),
      })),
    selectFile: (id) => setState((s) => ({ ...s, activeFileId: id })),
    selectEntry: (id) => setState((s) => ({ ...s, selectedEntryId: id })),
  }

  const findEntryAt = useMemo(() => {
    return (fileId: string, line: number): MiniStringEntry | null =>
      discovery.entries.find((e) => e.fileId === fileId && e.line === line) ?? null
  }, [discovery.entries])

  const findEntryById = useMemo(() => {
    return (id: string | null): MiniStringEntry | null =>
      id ? discovery.entries.find((e) => e.id === id) ?? null : null
  }, [discovery.entries])

  return {
    state,
    discovery,
    findEntryAt,
    findEntryById,
    actions,
  }
}
