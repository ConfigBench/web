import { lazy, Suspense } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { ThemeProvider } from './shared/theme/ThemeProvider'
import { Header } from './shared/components/layout/Header'
import { Footer } from './shared/components/layout/Footer'
import { HomePage } from './features/home/HomePage'
import { ToolsPage } from './features/home/ToolsPage'
import { NotFoundPage } from './features/home/NotFoundPage'
import { useDocumentTitle } from './shared/lib/useDocumentTitle'

const ConfigPage = lazy(() =>
  import('./features/config/ConfigPage').then((m) => ({ default: m.ConfigPage })),
)
const RgbPage = lazy(() =>
  import('./features/rgb/RgbPage').then((m) => ({ default: m.RgbPage })),
)
const AnimTabPage = lazy(() =>
  import('./features/rgb/AnimTabPage').then((m) => ({ default: m.AnimTabPage })),
)
const ShapePage = lazy(() =>
  import('./features/shapes/ShapePage').then((m) => ({ default: m.ShapePage })),
)
const WorldSizePage = lazy(() =>
  import('./features/worldsize/WorldSizePage').then((m) => ({ default: m.WorldSizePage })),
)
const CoordinatePage = lazy(() =>
  import('./features/coordinates/CoordinatePage').then((m) => ({ default: m.CoordinatePage })),
)
const StatusPage = lazy(() =>
  import('./features/status/StatusPage').then((m) => ({ default: m.StatusPage })),
)
const SkinPage = lazy(() =>
  import('./features/skins/SkinPage').then((m) => ({ default: m.SkinPage })),
)

function RouteFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex items-center gap-2 text-[12px] text-[#6c7086]">
        <span className="inline-block h-3 w-3 animate-spin rounded-none border-2 border-line border-t-[var(--accent)]" />
        Loading…
      </div>
    </div>
  )
}

const VIEWPORT_LOCKED_ROUTES = new Set(['/tools/config', '/tools/circle'])

function App() {
  const location = useLocation()
  const isHome = location.pathname === '/' || location.pathname === '/tools'
  const isViewportLocked = VIEWPORT_LOCKED_ROUTES.has(location.pathname)
  useDocumentTitle(location.pathname)
  return (
    <ThemeProvider>
      <div className="relative flex h-screen w-screen flex-col text-[#cdd6f4]">
        {isHome ? <div className="bg-scene" aria-hidden="true" /> : null}
        <Header />
        <main className="min-h-0 flex-1 overflow-y-auto p-4">
          <Suspense fallback={<RouteFallback />}>
            <div
              key={location.pathname}
              className={`page-enter ${isViewportLocked ? 'min-h-full lg:h-full' : 'min-h-full'}`}
            >
              <Routes location={location}>
                <Route path="/" element={<HomePage />} />
                <Route path="/tools" element={<ToolsPage />} />
                <Route path="/tools/config" element={<ConfigPage />} />
                <Route path="/tools/rgb" element={<RgbPage />} />
                <Route path="/tools/tab" element={<AnimTabPage />} />
                <Route path="/tools/circle" element={<ShapePage />} />
                <Route path="/tools/world-size" element={<WorldSizePage />} />
                <Route path="/tools/coords" element={<CoordinatePage />} />
                <Route path="/tools/status" element={<StatusPage />} />
                <Route path="/tools/skins" element={<SkinPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </Suspense>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}

export default App
