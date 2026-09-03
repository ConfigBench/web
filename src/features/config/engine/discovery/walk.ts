import { LineCounter, isMap, isSeq, isScalar, parseDocument, type Node } from 'yaml'
import type {
  ConfigParseError,
  DiscoveryResult,
  MiniStringEntry,
} from '../../types/discovery'
import { pathToString, type PathSegment } from './path'

export interface FileInput {
  id: string
  name: string
  content: string
}

const MAX_ERRORS = 40

function deNoiseErrors(all: ConfigParseError[]): ConfigParseError[] {
  const sorted = [...all].sort((a, b) => {
    const la = a.line ?? Number.MAX_SAFE_INTEGER
    const lb = b.line ?? Number.MAX_SAFE_INTEGER
    return la - lb
  })
  const seen = new Set<string>()
  const out: ConfigParseError[] = []
  for (const e of sorted) {
    const key = `${e.file ?? ''}:${e.line ?? ''}:${e.message}`
    if (seen.has(key)) continue
    seen.add(key)
    if (out.length >= MAX_ERRORS) break
    out.push(e)
  }
  return out
}

interface FileCacheItem {
  content: string
  name: string
  entries: MiniStringEntry[]
  errors: ConfigParseError[]
  tree: unknown
}

const fileCache = new Map<string, FileCacheItem>()

export function discover(files: FileInput[]): DiscoveryResult {
  const entries: MiniStringEntry[] = []
  const allErrors: ConfigParseError[] = []
  const parsedTrees: unknown[] = []

  const activeIds = new Set(files.map((f) => f.id))
  for (const id of fileCache.keys()) {
    if (!activeIds.has(id)) fileCache.delete(id)
  }

  for (const file of files) {
    const cached = fileCache.get(file.id)
    if (cached && cached.content === file.content && cached.name === file.name) {
      entries.push(...cached.entries)
      allErrors.push(...cached.errors)
      parsedTrees.push(cached.tree)
      continue
    }

    const fileEntries: MiniStringEntry[] = []
    const fileErrors: ConfigParseError[] = []
    const lineCounter = new LineCounter()
    const doc = parseDocument(file.content, { lineCounter, strict: false })

    for (const error of doc.errors) {
      fileErrors.push({
        message: error.message,
        file: file.name,
        line: error.linePos?.[0]?.line ?? error.pos?.[0] ?? undefined,
      })
    }

    let plain: unknown
    try {
      plain = doc.toJS() ?? {}
    } catch {
      plain = {}
      fileErrors.push({ message: 'Failed to parse YAML', file: file.name })
    }

    const root = doc.contents
    if (root) {
      walkNode(root, file, lineCounter, fileEntries)
    }

    fileCache.set(file.id, {
      content: file.content,
      name: file.name,
      entries: fileEntries,
      errors: fileErrors,
      tree: plain,
    })

    entries.push(...fileEntries)
    allErrors.push(...fileErrors)
    parsedTrees.push(plain)
  }

  return {
    entries,
    errors: deNoiseErrors(allErrors),
    totalErrors: allErrors.length,
    trees: parsedTrees,
  }
}

function walkNode(
  node: Node,
  file: FileInput,
  lineCounter: LineCounter,
  entries: MiniStringEntry[],
  segments: PathSegment[] = [],
): void {
  if (isMap(node)) {
    for (const item of node.items) {
      const keyNode = item.key
      const valueNode = item.value
      const key = keyNode && isScalar(keyNode) ? keyNode.value : undefined
      if (key === undefined || key === null) continue
      walkNode(valueNode as Node, file, lineCounter, entries, [...segments, key as PathSegment])
    }
    return
  }

  if (isSeq(node)) {
    node.items.forEach((child, index) => {
      walkNode(child as Node, file, lineCounter, entries, [...segments, index])
    })
    return
  }

  if (isScalar(node)) {
    const value = node.value
    if (typeof value === 'string' && value.trim().length > 0) {
      const line = node.range ? lineCounter.linePos(node.range[0]).line : null
      entries.push({
        id: `${file.id}::${pathToString(segments)}`,
        fileId: file.id,
        path: pathToString(segments),
        line,
        source: value,
      })
    }
  }
}
