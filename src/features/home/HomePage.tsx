import { Link } from 'react-router-dom'
import { ArrowRight, Compass, FileCode2, Palette, ShieldCheck, Shirt } from 'lucide-react'
import { LogoMark } from '../../shared/components/layout/LogoMark'
import { TOOLS } from '../../shared/tools'

export function HomePage() {
  const serverTools = TOOLS.filter((t) => t.category === 'Server & Config')
  const textTools = TOOLS.filter((t) => t.category === 'Text & Formatting')
  const worldTools = TOOLS.filter((t) => t.category === 'World & Building')
  const playerTools = TOOLS.filter((t) => t.category === 'Player & Cosmetics')

  return (
    <div className="relative flex flex-1 min-h-full flex-col items-center justify-center px-4 py-4 text-center sm:px-6">
      <div className="my-auto flex w-full flex-col items-center pt-2 sm:pt-4">
        <div className="page-enter relative" style={{ animationDelay: '0ms' }}>
          <LogoMark className="h-16 w-16 transition-transform duration-200 hover:scale-105 sm:h-20 sm:w-20" />
        </div>

        <div className="page-enter relative mt-5 max-w-2xl" style={{ animationDelay: '60ms' }}>
          <h1 className="font-mc text-4xl leading-none text-[var(--accent)] sm:text-5xl">ConfigBench</h1>
          <p className="font-mc mt-4 text-[15px] leading-relaxed text-[#a6adc8] sm:text-[16px]">
            The modern browser workbench for Minecraft players, creators, and server owners.
          </p>
        </div>

        <div className="page-enter relative mt-6 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: '120ms' }}>
          <Link
            to="/tools"
            className="mc-btn mc-btn-accent flex items-center gap-2 rounded-none px-5 py-2.5 text-[13px] font-semibold transition-all hover:scale-[1.02]"
          >
            <span>Browse All Tools ({TOOLS.length})</span>
            <ArrowRight size={15} />
          </Link>
          <Link
            to="/tools/config"
            className="mc-btn flex items-center gap-2 rounded-none px-5 py-2.5 text-[13px] text-[#cdd6f4] transition-colors hover:text-[var(--accent)]"
          >
            <FileCode2 size={15} className="text-[var(--accent)]" />
            <span>Open Config Editor</span>
          </Link>
        </div>

        <div className="page-enter relative mt-8 grid w-full max-w-6xl gap-4 text-left sm:mt-10 sm:grid-cols-2 lg:grid-cols-4" style={{ animationDelay: '180ms' }}>
        <div className="mc-btn group flex flex-col justify-between gap-4 rounded-none p-5 transition-colors duration-150 hover:border-[var(--accent)]/50">
          <Link
            to={`/tools?category=${encodeURIComponent('Server & Config')}`}
            className="flex flex-col gap-2.5 text-left focus:outline-none"
          >
            <div className="flex items-center justify-between">
              <span className="mc-icon-btn h-10 w-10 rounded-none text-[var(--accent)] transition-colors group-hover:border-[var(--accent)]">
                <FileCode2 size={19} />
              </span>
              <span className="font-mono text-[10px] text-[#6c7086] uppercase transition-colors group-hover:text-[var(--accent)]">
                {serverTools.length} Tools →
              </span>
            </div>
            <h2 className="font-mc text-[17px] text-[#cdd6f4] transition-colors group-hover:text-[var(--accent)]">
              Server & Config
            </h2>
            <p className="text-[12px] leading-relaxed text-[#a6adc8]">
              Live in-game MiniMessage YAML previews, world pregeneration calculators, and multi-provider server status diagnostics.
            </p>
          </Link>

          <div className="flex flex-col gap-1.5 border-t border-line/50 pt-3">
            {serverTools.map((tool) => (
              <Link
                key={tool.to}
                to={tool.to}
                className="flex items-center justify-between text-xs text-[#a6adc8] transition-colors hover:text-[var(--accent)]"
              >
                <span>{tool.label}</span>
                <ArrowRight size={11} className="opacity-60" />
              </Link>
            ))}
          </div>
        </div>

        <div className="mc-btn group flex flex-col justify-between gap-4 rounded-none p-5 transition-colors duration-150 hover:border-[var(--accent)]/50">
          <Link
            to={`/tools?category=${encodeURIComponent('Text & Formatting')}`}
            className="flex flex-col gap-2.5 text-left focus:outline-none"
          >
            <div className="flex items-center justify-between">
              <span className="mc-icon-btn h-10 w-10 rounded-none text-[var(--accent)] transition-colors group-hover:border-[var(--accent)]">
                <Palette size={19} />
              </span>
              <span className="font-mono text-[10px] text-[#6c7086] uppercase transition-colors group-hover:text-[var(--accent)]">
                {textTools.length} Tools →
              </span>
            </div>
            <h2 className="font-mc text-[17px] text-[#cdd6f4] transition-colors group-hover:text-[var(--accent)]">
              Text & Formatting
            </h2>
            <p className="text-[12px] leading-relaxed text-[#a6adc8]">
              Hex color gradients with 6 blending color spaces, legacy decoders, 27 Unicode fonts, and animated TAB YAML generators.
            </p>
          </Link>

          <div className="flex flex-col gap-1.5 border-t border-line/50 pt-3">
            {textTools.map((tool) => (
              <Link
                key={tool.to}
                to={tool.to}
                className="flex items-center justify-between text-xs text-[#a6adc8] transition-colors hover:text-[var(--accent)]"
              >
                <span>{tool.label}</span>
                <ArrowRight size={11} className="opacity-60" />
              </Link>
            ))}
          </div>
        </div>

        <div className="mc-btn group flex flex-col justify-between gap-4 rounded-none p-5 transition-colors duration-150 hover:border-[var(--accent)]/50">
          <Link
            to={`/tools?category=${encodeURIComponent('World & Building')}`}
            className="flex flex-col gap-2.5 text-left focus:outline-none"
          >
            <div className="flex items-center justify-between">
              <span className="mc-icon-btn h-10 w-10 rounded-none text-[var(--accent)] transition-colors group-hover:border-[var(--accent)]">
                <Compass size={19} />
              </span>
              <span className="font-mono text-[10px] text-[#6c7086] uppercase transition-colors group-hover:text-[var(--accent)]">
                {worldTools.length} Tools →
              </span>
            </div>
            <h2 className="font-mc text-[17px] text-[#cdd6f4] transition-colors group-hover:text-[var(--accent)]">
              World & Building
            </h2>
            <p className="text-[12px] leading-relaxed text-[#a6adc8]">
              Pixel-perfect voxel circle, oval, dome, and sphere blueprints with layer guides and synchronized 8:1 Nether portal converters.
            </p>
          </Link>

          <div className="flex flex-col gap-1.5 border-t border-line/50 pt-3">
            {worldTools.map((tool) => (
              <Link
                key={tool.to}
                to={tool.to}
                className="flex items-center justify-between text-xs text-[#a6adc8] transition-colors hover:text-[var(--accent)]"
              >
                <span>{tool.label}</span>
                <ArrowRight size={11} className="opacity-60" />
              </Link>
            ))}
          </div>
        </div>

        <div className="mc-btn group flex flex-col justify-between gap-4 rounded-none p-5 transition-colors duration-150 hover:border-[var(--accent)]/50">
          <Link
            to={`/tools?category=${encodeURIComponent('Player & Cosmetics')}`}
            className="flex flex-col gap-2.5 text-left focus:outline-none"
          >
            <div className="flex items-center justify-between">
              <span className="mc-icon-btn h-10 w-10 rounded-none text-[var(--accent)] transition-colors group-hover:border-[var(--accent)]">
                <Shirt size={19} />
              </span>
              <span className="font-mono text-[10px] text-[#6c7086] uppercase transition-colors group-hover:text-[var(--accent)]">
                {playerTools.length} Tools →
              </span>
            </div>
            <h2 className="font-mc text-[17px] text-[#cdd6f4] transition-colors group-hover:text-[var(--accent)]">
              Player & Cosmetics
            </h2>
            <p className="text-[12px] leading-relaxed text-[#a6adc8]">
              Interactive 3D WebGL character models, walking animations, armor layer variations, and raw texture sheets.
            </p>
          </Link>

          <div className="flex flex-col gap-1.5 border-t border-line/50 pt-3">
            {playerTools.map((tool) => (
              <Link
                key={tool.to}
                to={tool.to}
                className="flex items-center justify-between text-xs text-[#a6adc8] transition-colors hover:text-[var(--accent)]"
              >
                <span>{tool.label}</span>
                <ArrowRight size={11} className="opacity-60" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="page-enter relative mt-6 flex items-center gap-2 font-mono text-[11px] text-[#6c7086] sm:mt-8" style={{ animationDelay: '240ms' }}>
        <ShieldCheck size={14} className="text-[var(--accent)]" />
        <span>100% Client-Side · Runs entirely in your browser</span>
      </div>
    </div>
  </div>
  )
}
