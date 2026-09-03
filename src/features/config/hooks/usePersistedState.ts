import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import LZString from 'lz-string'

const STORAGE_KEY = 'configbench.workspace'
const MAX_SAFE_CHARS = 4_500_000

function encode(value: unknown): string {
  return LZString.compressToUTF16(JSON.stringify(value))
}

function readStore<T>(): T | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const text = LZString.decompressFromUTF16(raw)
    return text ? (JSON.parse(text) as T) : null
  } catch {
    return null
  }
}

function writeStore(value: unknown): void {
  try {
    const payload = encode(value)
    if (payload.length > MAX_SAFE_CHARS) return
    window.localStorage.setItem(STORAGE_KEY, payload)
  } catch (e) {
    void e
  }
}

export function usePersistedState<T>(defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readStore<T>() ?? defaultValue)

  const latest = useRef(value)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    latest.current = value
  })

  const flush = useCallback(() => {
    if (timer.current) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
    writeStore(latest.current)
  }, [])

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(flush, 350)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [value, flush])

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    const onClose = () => flush()
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', onClose)
    window.addEventListener('beforeunload', onClose)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', onClose)
      window.removeEventListener('beforeunload', onClose)
    }
  }, [flush])

  return [value, setValue]
}
