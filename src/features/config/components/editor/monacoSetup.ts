import { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

const env = { getWorker: () => new editorWorker() }
;(self as unknown as { MonacoEnvironment: typeof env }).MonacoEnvironment = env

loader.config({ monaco })

export { monaco }
