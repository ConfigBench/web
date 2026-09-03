import { Link } from 'react-router-dom'
import { Compass, Home } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="relative flex min-h-full flex-col items-center justify-center gap-7 px-6 py-8 text-center">
      <div className="page-enter relative" style={{ animationDelay: '0ms' }}>
        <p className="font-mc text-8xl leading-none text-[#2b2b3b]">404</p>
      </div>

      <div className="page-enter relative" style={{ animationDelay: '70ms' }}>
        <h1 className="font-mc text-2xl text-[var(--accent)]">It seems like you are lost.</h1>
        <p className="mt-3 max-w-md text-[14px] leading-relaxed text-[#a6adc8]">
          This page doesn't exist — it may have been moved, or never created at all.
        </p>
        <p className="mt-3 font-mono text-[11px] tracking-wide text-[#585b70]">X: 0&ensp;Y: 64&ensp;Z: 404</p>
      </div>

      <div className="page-enter relative flex flex-wrap items-center justify-center gap-2" style={{ animationDelay: '140ms' }}>
        <Link
          to="/"
          className="mc-btn flex items-center gap-2 rounded-none px-4 py-2 text-[13px] text-[#a6adc8] hover:text-[var(--accent)]"
        >
          <Home size={15} />
          Let's go home
        </Link>
        <Link
          to="/tools/config"
          className="mc-btn flex items-center gap-2 rounded-none px-4 py-2 text-[13px] text-[#a6adc8] hover:text-[var(--accent)]"
        >
          <Compass size={15} />
          Open the tools
        </Link>
      </div>
    </div>
  )
}
