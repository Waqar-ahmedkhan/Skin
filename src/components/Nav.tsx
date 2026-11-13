import { useEffect, useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/cart'
import { scrollToId, scrollToTop } from '@/lib/scroll'
import { cn } from '@/lib/utils'

const links = [
  { label: 'Discover', id: 'hero' },
  { label: 'Formula', id: 'scanner' },
  { label: 'Collection', id: 'showcase' },
]

export function Nav() {
  const cart = useCart()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-30 h-32 bg-gradient-to-b from-cream/75 via-cream/25 to-transparent"
        aria-hidden
      />
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 transition-colors duration-500',
          scrolled ? 'bg-cream/35 backdrop-blur-[10px]' : 'bg-transparent',
        )}
      >
        <div className="mx-auto flex h-[70px] max-w-[1680px] items-center justify-between gap-4 px-5 lg:px-10">
          <button
            type="button"
            data-ui
            onClick={scrollToTop}
            aria-label="Aroma Farmacy — back to top"
            className="pointer-events-auto inline-flex shrink-0 items-center gap-2 whitespace-nowrap font-hand text-[23px] sm:text-[27px] font-normal leading-none tracking-[-0.01em] text-ink"
          >
            <svg width="11" height="15" viewBox="0 0 12 16" fill="currentColor" aria-hidden>
              <path d="M6 0C6 0 0 7.2 0 10.6C0 13.58 2.69 16 6 16C9.31 16 12 13.58 12 10.6C12 7.2 6 0 6 0Z" />
            </svg>
            Aroma Farmacy
          </button>

          <nav aria-label="Primary" className="hidden items-center gap-1 rounded-full border border-ink/10 bg-cream/75 p-1 md:flex">
            {links.map((link) => (
              <button
                key={link.id}
                type="button"
                data-ui
                onClick={() => scrollToId(link.id)}
                className="nav-link pointer-events-auto min-h-10 rounded-full px-4 text-[11px] font-medium text-ink-soft"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              data-ui
              onClick={() => scrollToId('showcase')}
              className="pill-btn pointer-events-auto hidden h-9 px-5 sm:inline-flex"
            >
              Shop
            </button>

            <button
              type="button"
              data-ui
              onClick={cart.toggle}
              aria-label={`Open bag${cart.count > 0 ? `, ${cart.count} items` : ''}`}
              className="pointer-events-auto relative grid size-11 place-items-center rounded-full border border-ink/20 text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-cream"
            >
              <ShoppingBag size={15} strokeWidth={1.5} />
              {cart.count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-ink px-1 text-[9px] font-semibold leading-4 text-cream">
                  {cart.count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
