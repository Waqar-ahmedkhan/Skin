import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { products } from '@/data/products'
import { useCart } from '@/lib/cart'
import { scrollToId } from '@/lib/scroll'
import { formatPrice } from '@/lib/utils'

export function CartDrawer() {
  const cart = useCart()

  return (
    <AnimatePresence>
      {cart.isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={cart.close}
            className="fixed inset-0 z-[55] bg-ink/25 backdrop-blur-[3px]"
            aria-hidden
          />
          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Your bag"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-[60] flex h-full w-[min(430px,100vw)] flex-col border-l border-ink/10 bg-cream"
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-6">
              <div>
                <h2 className="font-serif text-[34px] font-light leading-none">
                  Your bag <span className="text-ink/35">({cart.count})</span>
                </h2>
                <p className="mt-2 text-xs text-ink-soft">Aroma Farmacy</p>
              </div>
              <button
                type="button"
                onClick={cart.close}
                aria-label="Close bag"
                className="grid size-10 place-items-center rounded-full border border-ink/20 transition-colors hover:bg-ink hover:text-cream"
              >
                <X size={15} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
              {cart.lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
                  <span className="grid size-20 place-items-center rounded-full bg-blush/45 text-ink-soft">
                    <ShoppingBag size={26} strokeWidth={1.2} aria-hidden />
                  </span>
                  <div>
                    <p className="font-serif text-[26px] font-light">Nothing here yet.</p>
                    <p className="mt-1 text-[12px] text-ink-soft">Six quiet rituals are waiting.</p>
                  </div>
                  <button
                    type="button"
                    className="pill-btn pointer-events-auto"
                    onClick={() => {
                      cart.close()
                      scrollToId('showcase')
                    }}
                  >
                    Explore the collection
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-ink/8">
                  {cart.lines.map((line) => {
                    const product = products.find((p) => p.id === line.id)
                    if (!product) return null
                    return (
                      <li key={line.id} className="flex gap-4 py-6">
                        <div
                          className="mt-1 size-14 shrink-0 rounded-full border border-ink/10"
                          style={{
                            background: `radial-gradient(circle at 34% 28%, ${product.palette.bodyLight}, ${product.palette.body} 62%, ${product.palette.bodyDeep} 100%)`,
                          }}
                          aria-hidden
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[13px] font-medium">{product.name}</p>
                              <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                                {product.size} · {product.category}
                              </p>
                            </div>
                            <p className="text-[13px] tabular-nums">{formatPrice(product.price * line.qty)}</p>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="inline-flex items-center rounded-full border border-ink/15">
                              <button
                                type="button"
                                onClick={() => cart.setQty(line.id, line.qty - 1)}
                                aria-label={`Decrease ${product.name} quantity`}
                                className="grid size-11 place-items-center rounded-full transition-colors hover:bg-ink/5"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-7 text-center text-[12px] tabular-nums">{line.qty}</span>
                              <button
                                type="button"
                                onClick={() => cart.setQty(line.id, line.qty + 1)}
                                aria-label={`Increase ${product.name} quantity`}
                                className="grid size-11 place-items-center rounded-full transition-colors hover:bg-ink/5"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => cart.remove(line.id)}
                              className="min-h-11 text-[11px] text-ink-soft underline-offset-4 transition-colors hover:text-ink hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {cart.lines.length > 0 && (
              <div className="border-t border-ink/10 px-6 pb-6 pt-5">
                <div className="flex items-baseline justify-between">
                  <p className="eyebrow text-ink/40">Subtotal</p>
                  <p className="font-serif text-[26px] font-light">{formatPrice(cart.subtotal)}</p>
                </div>
                <p className="mt-1 text-[11px] text-ink-soft">Shipping and taxes calculated at checkout.</p>
                <CheckoutButton />
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function CheckoutButton() {
  const [state, setState] = useState<'idle' | 'soon'>('idle')

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={() => {
          setState('soon')
          window.setTimeout(() => setState('idle'), 2600)
        }}
        className="pill-btn pill-btn-solid pointer-events-auto h-12 w-full justify-center"
      >
        {state === 'soon' ? 'Checkout opens soon' : 'Continue to checkout'}
      </button>
      <p aria-live="polite" className="sr-only">
        {state === 'soon' ? 'Checkout is not open in this concept store.' : ''}
      </p>
    </div>
  )
}

export function AddToast() {
  const cart = useCart()
  const product = products.find((p) => p.id === cart.lastAdded)

  return (
    <div className="pointer-events-none fixed inset-x-4 top-20 z-[70] sm:left-auto sm:right-6">
      <AnimatePresence>
        {product && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            role="status"
            className="flex items-center gap-3 rounded-2xl border border-ink/15 bg-cream py-3 pl-3 pr-4 text-xs"
          >
            <span
              className="grid size-8 shrink-0 place-items-center rounded-full text-cream"
              style={{ background: product.palette.ink }}
            >
              <Check size={13} strokeWidth={2} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="font-medium">{product.name}</span>
              <span className="text-ink-soft"> added to bag</span>
            </span>
            <button
              type="button"
              onClick={cart.open}
              className="pointer-events-auto ml-auto min-h-11 whitespace-nowrap px-2 text-xs font-medium underline underline-offset-4"
            >
              View bag
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
