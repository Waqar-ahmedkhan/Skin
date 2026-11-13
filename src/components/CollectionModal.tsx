import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, Plus, X } from 'lucide-react'
import { products } from '@/data/products'
import { useCart } from '@/lib/cart'
import { scrollToId, setScrollLocked } from '@/lib/scroll'
import { formatPrice } from '@/lib/utils'

interface CollectionModalProps {
  open: boolean
  onClose: () => void
  onSelect: (index: number) => void
}

export function CollectionModal({ open, onClose, onSelect }: CollectionModalProps) {
  const cart = useCart()

  useEffect(() => {
    if (!open) return
    setScrollLocked(true)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      setScrollLocked(false)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[65] overflow-y-auto bg-cream"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          role="dialog"
          aria-modal="true"
          aria-label="The Aroma Farmacy collection"
        >
          <div className="mx-auto min-h-full max-w-[1320px] px-5 pb-20 pt-6 lg:px-10">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h2 className="mt-3 font-serif text-[clamp(3rem,7vw,6rem)] font-light leading-[0.88] tracking-[-0.02em]">
                  Six ways to
                  <br />
                  <em className="italic">feel soft.</em>
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close collection"
                className="grid size-11 shrink-0 place-items-center rounded-full border border-ink/20 transition-colors hover:bg-ink hover:text-cream"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            <div className="mt-10 h-px w-full bg-ink/12" />

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product, index) => (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.06 * index, ease: [0.22, 1, 0.36, 1] }}
                  className="group flex flex-col rounded-2xl border border-ink/10 p-6 transition-colors duration-500 hover:border-ink/25"
                  style={{
                    background: `linear-gradient(160deg, ${product.palette.backdrop[0]} 0%, ${product.palette.backdrop[1]} 100%)`,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <p className="eyebrow text-ink/40">{product.index}</p>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-ink/40">{product.size}</p>
                  </div>

                  <div className="my-6 flex items-center justify-center">
                    {product.kind === 'serum' ? (
                      <div className="relative flex h-28 w-16 flex-col items-center justify-end transition-transform duration-700 group-hover:-translate-y-1 group-hover:rotate-2" aria-hidden>
                        {/* Slim pipette bulb + champagne collar */}
                        <span
                          className="h-5 w-3.5 rounded-t-full"
                          style={{ background: product.palette.cap }}
                        />
                        <span className="h-2.5 w-5 rounded-t-[2px] bg-[#DFC9AA]" />
                        {/* Fluted optical glass body */}
                        <div
                          className="relative h-[74px] w-12 rounded-b-[10px] rounded-t-[14px] border border-white/60 shadow-[0_20px_38px_-22px_rgb(48_39_34/0.55)]"
                          style={{
                            background: `linear-gradient(145deg, rgba(255,253,249,0.72) 0%, ${product.palette.bodyLight} 40%, ${product.palette.body} 100%)`,
                          }}
                        >
                          <span className="absolute inset-x-2 inset-y-2 rounded-[4px] bg-white/15" />
                        </div>
                      </div>
                    ) : (
                      <div className="relative flex h-28 w-20 flex-col items-center justify-end transition-transform duration-700 group-hover:-translate-y-1 group-hover:rotate-2" aria-hidden>
                        {/* Flared squeeze-tube silhouette */}
                        <div
                          className="relative h-[86px] w-[72px] shadow-[0_20px_38px_-22px_rgb(48_39_34/0.55)]"
                          style={{
                            clipPath: 'polygon(6% 0%, 94% 0%, 74% 100%, 26% 100%)',
                            borderRadius: '4px 4px 18px 18px',
                            background: `linear-gradient(135deg, ${product.palette.bodyLight} 0%, ${product.palette.body} 48%, ${product.palette.bodyDeep} 100%)`,
                          }}
                        >
                          <span className="absolute inset-x-0 top-0 h-2.5 bg-black/10" />
                          <span className="absolute left-[22%] top-2 h-14 w-2 -rotate-12 rounded-full bg-white/30 blur-[2px]" />
                        </div>
                        <span
                          className="h-5 w-8 rounded-b-[4px] border-t border-black/10"
                          style={{ background: product.palette.cap }}
                        />
                      </div>
                    )}
                  </div>

                  <h3 className="font-serif text-[27px] font-light leading-[0.95]">{product.name}</h3>
                  <p className="mt-1.5 text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                    {product.category} · {product.finishLabel}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="font-serif text-[18px]">{formatPrice(product.price)}</p>
                    <button
                      type="button"
                      onClick={() => cart.add(product.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-ink hover:text-cream"
                    >
                      <Plus size={11} />
                      Add
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelect(index)
                      onClose()
                      scrollToId('showcase')
                    }}
                    className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-xs font-medium text-ink-soft transition-colors hover:text-ink"
                  >
                    View in 3D <ArrowUpRight size={11} />
                  </button>
                </motion.article>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
