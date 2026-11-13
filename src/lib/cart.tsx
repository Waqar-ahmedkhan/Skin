import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { products } from '@/data/products'
import { setScrollLocked } from '@/lib/scroll'

export interface CartLine {
  id: string
  qty: number
}

interface CartContextValue {
  lines: CartLine[]
  count: number
  subtotal: number
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  add: (id: string) => void
  remove: (id: string) => void
  setQty: (id: string, qty: number) => void
  lastAdded: string | null
}

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = 'aroma-farmacy-bag-v1'
const LEGACY_STORAGE_KEY = 'softly-bag-v1'

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw) as CartLine[]
      return parsed.filter((l) => products.some((p) => p.id === l.id) && l.qty > 0)
    } catch {
      return []
    }
  })
  const [isOpen, setIsOpen] = useState(false)
  const [lastAdded, setLastAdded] = useState<string | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      /* ignore quota errors */
    }
  }, [lines])

  useEffect(() => {
    setScrollLocked(isOpen)
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  useEffect(() => {
    if (!lastAdded) return
    const t = window.setTimeout(() => setLastAdded(null), 1800)
    return () => window.clearTimeout(t)
  }, [lastAdded])

  const add = useCallback((id: string) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.id === id)
      if (existing) return prev.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l))
      return [...prev, { id, qty: 1 }]
    })
    setLastAdded(id)
  }, [])

  const remove = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id))
  }, [])

  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.id !== id)
        : prev.map((l) => (l.id === id ? { ...l, qty } : l)),
    )
  }, [])

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0)
    const subtotal = lines.reduce((n, l) => {
      const p = products.find((x) => x.id === l.id)
      return n + (p?.price ?? 0) * l.qty
    }, 0)
    return {
      lines,
      count,
      subtotal,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((v) => !v),
      add,
      remove,
      setQty,
      lastAdded,
    }
  }, [lines, isOpen, add, remove, setQty, lastAdded])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
