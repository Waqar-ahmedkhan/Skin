import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt))

export const wrapIndex = (index: number, length: number) =>
  ((index % length) + length) % length

export const signedOffset = (index: number, active: number, length: number) => {
  let d = index - active
  d = ((d + length / 2) % length + length) % length
  return d - length / 2
}

export const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(value)
