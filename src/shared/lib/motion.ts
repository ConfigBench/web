type MotionExit = 'menu' | 'modal' | 'toast'

const FALLBACK: Record<MotionExit, number> = { menu: 110, modal: 140, toast: 140 }
const cache = new Map<MotionExit, number>()

export function motionExitMs(kind: MotionExit): number {
  const cached = cache.get(kind)
  if (cached !== undefined) return cached
  const resolved = readDuration(`--motion-exit-${kind}`) ?? FALLBACK[kind]
  cache.set(kind, resolved)
  return resolved
}

function readDuration(variable: string): number | null {
  if (typeof window === 'undefined') return null
  const raw = getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
  if (!raw) return null
  const value = Number.parseFloat(raw)
  if (Number.isNaN(value)) return null
  return raw.endsWith('ms') ? value : value * 1000
}
