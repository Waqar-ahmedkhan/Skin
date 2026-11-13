import { motion, useTransform, type MotionValue } from 'motion/react'
import { ArrowUpRight, Check, Plus } from 'lucide-react'

import { products } from '@/data/products'
import { useCart } from '@/lib/cart'
import { scrollToScannerProduct } from '@/lib/scroll'
import { cn, formatPrice, smoothstep } from '@/lib/utils'
import { ArrowButton } from './ui'

interface HeroUIProps {
  active: number
  setActive: (index: number) => void
  next: () => void
  prev: () => void
  heroP: MotionValue<number>
  inert?: boolean
}

export function HeroUI({ active, setActive, next, prev, heroP, inert }: HeroUIProps) {
  const cart = useCart()
  const opacity = useTransform(heroP, p => 1 - smoothstep(0.72, 0.9, p))
  const product = products[active]
  const isAdded = cart.lastAdded === product.id
  const AddIcon = isAdded ? Check : Plus
  const addLabel = isAdded ? 'Added to bag' : `Shop the ${product.kind === 'serum' ? 'serum' : 'balm'}`
  const ringRadius = 24
  const circumference = 2 * Math.PI * ringRadius
  const ringOffset = circumference * (1 - product.moistureScore / 100)

  return (
    <motion.section
      style={{ opacity }}
      className="hero-composition pointer-events-none fixed inset-0 z-30"
      inert={inert}
      aria-hidden={inert || undefined}
      aria-label={`${product.name} introduction`}
    >
      <div className="hero-product-guides" aria-hidden />
      <p className="hero-copy-left">{product.notes}</p>
      <div className="hero-copy-right">
        <p>{product.category}</p>
        <p className="mt-1">{product.size}</p>
      </div>

      <div className="hero-actions">
        <div className="mb-4 flex items-baseline justify-center gap-3">
          <span className="font-serif text-[24px] leading-tight">{product.name}</span>
          <span className="text-xs tabular-nums text-ink-soft">{formatPrice(product.price)}</span>
        </div>
        <div className="flex justify-center gap-2.5">
          <button
            type="button"
            data-ui
            onClick={() => cart.add(product.id)}
            className="hero-action-solid pointer-events-auto"
          >
            <AddIcon size={14} strokeWidth={1.6} aria-hidden />
            {addLabel}
          </button>
          <button
            type="button"
            data-ui
            onClick={() => scrollToScannerProduct(active, products.length)}
            className="hero-action-outline pointer-events-auto"
          >
            See what’s inside
            <ArrowUpRight size={14} strokeWidth={1.6} aria-hidden />
          </button>
        </div>
      </div>

      <div className="hero-moisture">
        <div className="relative grid size-[58px] shrink-0 place-items-center">
          <svg viewBox="0 0 60 60" className="size-full -rotate-90" aria-hidden>
            <circle cx="30" cy="30" r={ringRadius} fill="none" stroke="rgb(48 39 34 / 0.12)" strokeWidth="4" />
            <circle
              cx="30" cy="30" r={ringRadius} fill="none" stroke="currentColor" strokeWidth="4"
              strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={ringOffset}
            />
          </svg>
          <span className="absolute text-xl font-medium tabular-nums">{product.moistureScore}</span>
        </div>
        <div>
          <p className="text-xs font-medium">Moisture lock</p>
          <p className="mt-1 text-[10px] text-ink-soft">{product.moistureScore} out of 100</p>
          <p className="mt-1.5 rounded-full bg-ivory px-2 py-1 text-[9px]">Lasts {product.moistureHours} hrs</p>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 px-5 pb-4 lg:px-10">
        <div className="flex items-center justify-between gap-4">
          <p className="hidden text-xs tabular-nums text-ink-soft sm:block">{product.index} / {String(products.length).padStart(2, '0')}</p>
          <div className="flex items-center gap-1" role="group" aria-label="Choose a product">
            {products.map((item, index) => (
              <button
                key={item.id}
                type="button"
                data-ui
                aria-pressed={index === active}
                aria-label={`${item.index} ${item.name}`}
                onClick={() => setActive(index)}
                className="product-swatch pointer-events-auto grid h-11 w-6 place-items-center sm:w-11"
              >
                <span
                  className={cn('product-swatch-color', index === active && 'is-active')}
                  style={{ backgroundColor: item.palette.body }}
                />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <ArrowButton onClick={prev} direction="prev" label="Previous product" />
            <ArrowButton onClick={next} direction="next" label="Next product" />
          </div>
        </div>
      </div>
    </motion.section>
  )
}
