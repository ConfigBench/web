export interface MiniStringEntry {
  id: string
  fileId: string
  path: string
  line: number | null
  source: string
}

export interface ConfigFile {
  id: string
  name: string
  content: string
}

export interface ConfigParseError {
  message: string
  file?: string
  line?: number
}

export interface WorkspaceState {
  files: ConfigFile[]
  activeFileId: string
  selectedEntryId: string | null
}

export interface DiscoveryResult {
  entries: MiniStringEntry[]
  errors: ConfigParseError[]
  totalErrors: number
  trees: unknown[]
}
