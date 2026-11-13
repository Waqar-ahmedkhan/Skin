import type { ProductKind } from '@/data/products'

/** Native geometry bounds; tests check these against the generated packaging. */
export const productBounds = {
  tube: { minY: -1.32, maxY: 1.1025 },
  serum: { minY: -1.32, maxY: 1.068 },
}

export function getModelPresentation(kind: ProductKind) {
  const target = productBounds.tube
  const source = productBounds[kind]
  const scale = (target.maxY - target.minY) / (source.maxY - source.minY)

  return { scale, y: target.minY - source.minY * scale }
}

/** One viewport fit is used in every chapter, independent of selected product. */
export function getPresentationSize(isMobile: boolean, height: number) {
  if (isMobile) return { scale: 0.8, y: 0.08 }
  if (height <= 740) return { scale: 0.7, y: 0.1 }
  if (height <= 850) return { scale: 0.76, y: 0.14 }

  return { scale: 0.82, y: 0.18 }
}
