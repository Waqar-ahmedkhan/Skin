import { useState } from 'react'
import {
  AnimatePresence,
  motion,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { Plus } from 'lucide-react'
import { products } from '@/data/products'
import { useCart } from '@/lib/cart'
import { cn, formatPrice, smoothstep } from '@/lib/utils'

interface ShowcaseUIProps {
  active: number
  setActive: (index: number) => void
  scanP: MotionValue<number>
  showP: MotionValue<number>
  onExplore: () => void
  inert?: boolean
}

export function ShowcaseUI({
  active,
  setActive,
  scanP,
  showP,
  onExplore,
  inert,
}: ShowcaseUIProps) {
  const cart = useCart()
  const [expanded, setExpanded] = useState(false)
  const product = products[active]

  const opacity = useTransform(
    [scanP],
    ([p]: number[]) => smoothstep(0.98, 1, p),
  )
  const railOpacity = useTransform([showP], ([p]: number[]) => smoothstep(0.03, 0.12, p))
  const cardOpacity = useTransform([showP], ([p]: number[]) =>
    smoothstep(0.12, 0.22, p) * (1 - smoothstep(0.7, 0.79, p)),
  )
  const finalOpacity = useTransform([showP], ([p]: number[]) => smoothstep(0.76, 0.86, p))

  const total = products.reduce((sum, item) => sum + item.price, 0)

  return (
    <motion.div
      style={{ opacity }}
      className="pointer-events-none fixed inset-0 z-30"
      inert={inert}
      aria-hidden={inert || undefined}
    >
      {/* spotlight quick view tucked cleanly bottom-right */}
      <motion.div
        style={{ opacity: cardOpacity }}
        className="absolute bottom-[82px] right-5 hidden w-[268px] md:block lg:right-10"
      >
        <div className="pointer-events-auto relative overflow-hidden rounded-2xl border border-ink/15 bg-cream/95 p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="mt-2 font-serif text-[32px] font-light leading-[1.05]">
                    {product.name}
                  </h3>
                </div>
                <span className="font-serif text-[13px] italic text-ink-soft">{product.index}</span>
              </div>

              <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                {product.size} — {product.finishLabel}
              </p>

              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="mt-4 border-t border-ink/10 pt-4 text-[11.5px] leading-[1.75] text-ink-soft">
                      {product.description}
                    </p>
                    <ul className="mt-3 space-y-1.5">
                      {product.ingredients.map((ingredient) => (
                        <li key={ingredient} className="flex items-center gap-2 text-[10.5px] text-ink-soft">
                          <span className="size-1 rounded-full bg-ink/25" aria-hidden />
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="eyebrow text-ink/35">Texture</span>
                      <span className="h-px flex-1 bg-ink/10" />
                      <span className="text-[10.5px] text-ink-soft">{product.finishLabel}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setExpanded((value) => !value)}
                  aria-expanded={expanded}
                  className="min-h-11 text-xs font-medium text-ink-soft underline-offset-4 transition-colors hover:text-ink hover:underline"
                >
                  {expanded ? 'Less' : 'Details'}
                </button>
                <p className="font-serif text-[17px]">{formatPrice(product.price)}</p>
              </div>

              <button
                type="button"
                onClick={() => cart.add(product.id)}
                className="pill-btn pill-btn-solid mt-3 h-10 w-full justify-center text-[10px]"
              >
                <Plus size={12} strokeWidth={1.8} />
                Add to bag
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* mobile spotlight */}
      <motion.div
        style={{ opacity: cardOpacity }}
        className="absolute inset-x-4 bottom-[104px] md:hidden"
      >
        <div className="pointer-events-auto rounded-2xl border border-ink/15 bg-cream/95 p-4">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="mt-1 font-serif text-[26px] font-light leading-none">{product.name}</h3>
            </div>
            <p className="text-[12px]">{formatPrice(product.price)}</p>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-[11px] font-medium text-ink-soft">
              {product.size} · {product.finishLabel}
            </p>
            <button
              type="button"
              onClick={() => cart.add(product.id)}
              aria-label={`Add ${product.name} to bag`}
              className="pill-btn pill-btn-solid min-h-11 shrink-0"
            >
              <Plus size={14} aria-hidden />
              Add to bag
            </button>
          </div>
        </div>
      </motion.div>

      {/* final call to action */}
      <motion.div
        style={{ opacity: finalOpacity }}
        className="absolute inset-x-0 bottom-[104px] flex flex-col items-center gap-3 px-5 sm:flex-row sm:justify-center"
      >
        <button
          type="button"
          onClick={onExplore}
          className="pill-btn pill-btn-solid pointer-events-auto h-11 px-6"
        >
          Explore Collection
        </button>
        <button
          type="button"
          onClick={() => products.forEach((item) => cart.add(item.id))}
          className="pill-btn pointer-events-auto h-11 px-6"
        >
          Add the full set — {formatPrice(total)}
        </button>
      </motion.div>

      {/* collection rail */}
      <motion.div
        style={{ opacity: railOpacity }}
        className="absolute inset-x-0 bottom-0 px-5 pb-5 lg:px-10"
      >
        <div className="flex items-center justify-between gap-4 border-t border-ink/10 pt-4">
          <div className="no-scrollbar flex flex-1 items-center gap-4 overflow-x-auto sm:gap-7">
            {products.map((item, index) => (
              <button
                key={item.id}
                type="button"
                data-ui
                aria-pressed={index === active}
                onClick={() => setActive(index)}
                className={cn(
                  'pointer-events-auto flex min-h-11 shrink-0 items-center gap-2 rounded-full px-3 transition-colors',
                  index === active ? 'bg-cream text-ink' : 'text-ink-soft hover:bg-cream/60',
                )}
              >
                <span
                  className="size-2.5 rounded-full border border-ink/15"
                  style={{ backgroundColor: item.palette.body }}
                  aria-hidden
                />
                <span className="whitespace-nowrap text-[11px] font-medium">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
