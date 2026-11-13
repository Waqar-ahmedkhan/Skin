import { ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ArrowButton({
  onClick,
  label,
  direction,
  className,
}: {
  onClick: () => void
  label: string
  direction: 'prev' | 'next'
  className?: string
}) {
  const Icon = direction === 'prev' ? ArrowLeft : ArrowRight
  return (
    <button
      type="button"
      data-ui
      onClick={onClick}
      aria-label={label}
      className={cn(
        'pointer-events-auto grid size-10 place-items-center rounded-full border border-ink/25 text-ink transition-all duration-500 hover:border-ink hover:bg-ink hover:text-cream active:scale-95',
        className,
      )}
    >
      <Icon size={15} strokeWidth={1.5} />
    </button>
  )
}
