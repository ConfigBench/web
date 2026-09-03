import { useCallback, useEffect, useRef, useState } from 'react'
import { Bug, Heart, Info, Mail, ShieldCheck, Star, X } from 'lucide-react'
import { ThemePicker } from './ThemePicker'

const PROJECT_URLS = {
  github: 'https://github.com/ConfigBench/web',
  sponsor: 'https://github.com/sponsors/ConfigBench',
  issues: 'https://github.com/ConfigBench/web/issues',
  license: 'https://github.com/ConfigBench/web/blob/main/LICENSE',
} as const

const CONTACT_EMAIL = 'hello@softgrid.dev'

const SUPPORT_LINKS = [
  { icon: Star, label: 'Star on GitHub', href: PROJECT_URLS.github, external: true },
  { icon: Heart, label: 'Sponsor', href: PROJECT_URLS.sponsor, external: true },
  { icon: Bug, label: 'Report a bug', href: PROJECT_URLS.issues, external: true },
] as const

const DISCLAIMER = 'Not affiliated with Adventure (Kyori), PaperMC, or Mojang.'

const EXIT_MS = 140

export function Footer() {
  const [aboutOpen, setAboutOpen] = useState(false)
  const [aboutMounted, setAboutMounted] = useState(false)
  const exitTimer = useRef(0)

  const openAbout = useCallback(() => {
    window.clearTimeout(exitTimer.current)
    setAboutOpen(true)
    setAboutMounted(true)
  }, [])

  const closeAbout = useCallback(() => {
    setAboutOpen(false)
    window.clearTimeout(exitTimer.current)
    exitTimer.current = window.setTimeout(() => setAboutMounted(false), EXIT_MS)
  }, [])

  useEffect(() => () => window.clearTimeout(exitTimer.current), [])

  return (
    <>
      <footer className="flex h-auto shrink-0 flex-col gap-1.5 border-t border-line bg-surface/40 px-4 py-2.5 backdrop-blur-lg sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <p className="min-w-0 text-[11px] leading-snug text-[#6c7086]">
            ConfigBench is a product of{' '}
            <a
              href="https://softgrid.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#a6adc8] transition-colors duration-150 hover:text-[var(--accent)]"
            >
              SoftGrid
            </a>
            . © 2026 SoftGrid.
          </p>
          <span className="hidden h-3 w-px bg-line sm:block" />
          <p className="min-w-0 text-[11px] leading-snug text-[#6c7086]">{DISCLAIMER}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {SUPPORT_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="mc-btn flex items-center gap-1.5 rounded-none px-2.5 py-1.5 text-xs text-[#a6adc8] hover:text-[var(--accent)]"
            >
              <link.icon size={13} />
              <span className="hidden md:inline">{link.label}</span>
            </a>
          ))}
          <button
            type="button"
            onClick={openAbout}
            className="mc-btn flex items-center gap-1.5 rounded-none px-2.5 py-1.5 text-xs text-[#a6adc8] hover:text-[var(--accent)]"
          >
            <Info size={13} />
            <span className="hidden md:inline">About</span>
          </button>
          <div className="ml-2 border-l border-line pl-2">
            <ThemePicker />
          </div>
        </div>
      </footer>

      {aboutMounted ? <AboutModal open={aboutOpen} onClose={closeAbout} /> : null}
    </>
  )
}

function AboutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const modalEl = modalRef.current
    if (!modalEl) return

    const focusables = modalEl.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    const first = focusables[0]
    const last = focusables[focusables.length - 1]

    first?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last?.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first?.focus()
          }
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm ${
        open ? 'fade-in' : 'fade-out'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="About ConfigBench"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`w-full max-w-md overflow-hidden rounded-lg border border-line bg-surface shadow-2xl ${
          open ? 'modal-in' : 'modal-out'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-line bg-panel px-4 py-3">
          <h2 className="font-mc text-[15px] text-[#cdd6f4]">About ConfigBench</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="mc-icon-btn h-7 w-7 rounded-none p-0">
            <X size={14} />
          </button>
        </header>

        <div className="space-y-3 px-4 py-4 text-[13px] leading-relaxed text-[#a6adc8]">
          <p className="flex items-start gap-2.5">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" />
            <span>
              <span className="font-semibold text-[#cdd6f4]">ConfigBench</span> is the modern browser workbench for
              Minecraft players, creators, and server owners — fast, free, and client-side. Everything runs in your
              browser; nothing is uploaded.
            </span>
          </p>

          <p className="text-[12px] text-[#6c7086]">{DISCLAIMER}</p>

          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="flex items-center gap-2.5 transition-colors duration-150 hover:text-[var(--accent)]"
          >
            <Mail size={15} className="shrink-0 text-[#6c7086]" />
            <span className="min-w-0 truncate text-[12px]">{CONTACT_EMAIL}</span>
          </a>

          <div className="flex items-center justify-between border-t border-line pt-3">
            <a
              href={PROJECT_URLS.license}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#6c7086] transition-colors duration-150 hover:text-[var(--accent)]"
            >
              AGPL-3.0 License
            </a>
            <button
              type="button"
              onClick={onClose}
              className="mc-btn rounded-none px-3 py-1.5 text-[12px] text-[#a6adc8] hover:text-[var(--accent)]"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
