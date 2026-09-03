import { useEffect } from 'react'
import { TOOLS } from '../tools'

const TITLES: Record<string, string> = {
  '/': 'ConfigBench',
  '/tools': 'Tools · ConfigBench',
  ...Object.fromEntries(TOOLS.map((tool) => [tool.to, `${tool.label} · ConfigBench`])),
}

export function useDocumentTitle(pathname: string): void {
  useEffect(() => {
    document.title = TITLES[pathname] ?? 'Not found · ConfigBench'
  }, [pathname])
}
