import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Wrench } from 'lucide-react'
import { LogoMark } from './LogoMark'
import Dropdown from '../ui/Dropdown'
import { TOOLS } from '../../tools'

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const activeTool = TOOLS.find((t) => location.pathname.startsWith(t.to))

  return (
    <header className="page-enter relative z-50 flex h-14 shrink-0 items-center justify-between border-b border-line bg-surface/40 px-4 backdrop-blur-lg">
      <NavLink to="/" className="group flex items-center gap-3">
        <LogoMark className="h-9 w-9 transition-transform duration-200 group-hover:scale-105 group-active:scale-95" />
        <span className="font-mc text-xl leading-none text-[var(--accent)] [text-shadow:1px_1px_0_rgba(0,0,0,0.7)]">
          ConfigBench
        </span>
      </NavLink>

      <Dropdown
        ariaLabel="Tools"
        value={activeTool?.to ?? ''}
        placeholder="Tools"
        staticLabel
        hoverOpen
        triggerIcon={<Wrench size={14} />}
        onChange={(to) => navigate(to)}
        options={TOOLS.map(({ to, label, icon: Icon }) => ({
          value: to,
          label,
          icon: <Icon size={16} />,
        }))}
        className="h-9 w-44"
        align="right"
        highlight
      />
    </header>
  )
}
