export const scanSpring = { stiffness: 180, damping: 28, mass: 0.6 }

export const scanTiming = {
  turnStart: 0.08,
  turnEnd: 0.22,
  start: 0.24,
  end: 0.82,
  returnStart: 0.88,
  returnEnd: 0.97,
  windowStart: 0.2,
  windowEnd: 0.92,
}

/** One shared timeline for the model, scan line, and ingredient checks. */
export function getScanState(progress: number, total: number, ingredientCount: number) {
  const position = Math.max(0, Math.min(1, progress)) * total
  const index = Math.min(total - 1, Math.floor(position))
  const local = position - index
  const pass = Math.max(0, Math.min(1, (local - scanTiming.start) / (scanTiming.end - scanTiming.start)))
  // Scroll division can land a few floating-point units below an exact boundary.
  const checked = Math.min(ingredientCount, Math.floor(pass * ingredientCount + 1e-8))

  return { index, local, pass, checked, complete: checked === ingredientCount }
}
