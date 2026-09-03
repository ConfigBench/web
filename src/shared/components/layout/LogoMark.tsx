import { cn } from '../../lib/cn'

interface LogoMarkProps {
  className?: string
}

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <img
      src="/configbench.png"
      alt="ConfigBench logo"
      className={cn('rounded-none object-contain [image-rendering:pixelated]', className)}
    />
  )
}
