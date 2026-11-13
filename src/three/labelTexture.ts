import * as THREE from 'three'
import type { Product } from '@/data/products'

const cache = new Map<string, THREE.CanvasTexture>()

export function invalidateLabelCache() {
  cache.clear()
}

const hexToRgba = (hex: string, alpha: number) => {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function toLinear(c: number) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function relativeLuminance(hex: string) {
  const h = hex.replace('#', '')
  const r = toLinear(parseInt(h.slice(0, 2), 16) / 255)
  const g = toLinear(parseInt(h.slice(2, 4), 16) / 255)
  const b = toLinear(parseInt(h.slice(4, 6), 16) / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function drawSpaced(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  spacing: number,
) {
  const chars = Array.from(text)
  const widths = chars.map((c) => ctx.measureText(c).width + spacing)
  const total = widths.reduce((a, b) => a + b, 0) - spacing
  let x = cx - total / 2
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], x, y)
    x += widths[i]
  }
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

function drawDroplet(ctx: CanvasRenderingContext2D, cx: number, topY: number, size: number) {
  ctx.beginPath()
  ctx.moveTo(cx, topY)
  ctx.bezierCurveTo(
    cx - size * 0.85,
    topY + size * 0.95,
    cx - size * 0.78,
    topY + size * 1.55,
    cx,
    topY + size * 1.55,
  )
  ctx.bezierCurveTo(
    cx + size * 0.78,
    topY + size * 1.55,
    cx + size * 0.85,
    topY + size * 0.95,
    cx,
    topY,
  )
  ctx.closePath()
  ctx.fill()
}

function drawBackLabel(
  ctx: CanvasRenderingContext2D,
  product: Product,
  bx: number,
  inkColor: string,
  compact: boolean,
) {
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  const topY = compact ? 135 : 300
  const maxW = compact ? 440 : 490

  // HOW TO USE
  ctx.fillStyle = hexToRgba(inkColor, 0.72)
  ctx.font = `600 ${compact ? 18 : 22}px "Manrope", sans-serif`
  drawSpaced(ctx, 'HOW TO USE', bx, topY, 4)

  ctx.fillStyle = hexToRgba(inkColor, 0.96)
  ctx.font = `500 ${compact ? 22 : 28}px "Manrope", sans-serif`
  const storyLines = wrapLines(ctx, product.story, maxW).slice(0, 3)
  storyLines.forEach((line, i) => {
    ctx.fillText(line, bx, topY + (compact ? 36 : 44) + i * (compact ? 28 : 38))
  })

  // Divider
  const ingTop = topY + (compact ? 148 : 208)
  ctx.strokeStyle = hexToRgba(inkColor, 0.35)
  ctx.lineWidth = 1.8
  ctx.beginPath()
  ctx.moveTo(bx - 56, ingTop - 38)
  ctx.lineTo(bx + 56, ingTop - 38)
  ctx.stroke()

  // INGREDIENTS
  ctx.fillStyle = hexToRgba(inkColor, 0.75)
  ctx.font = `600 ${compact ? 18 : 22}px "Manrope", sans-serif`
  drawSpaced(ctx, 'INGREDIENTS', bx, ingTop, 4)

  ctx.fillStyle = hexToRgba(inkColor, 0.98)
  ctx.font = `600 ${compact ? 24 : 31}px "Manrope", sans-serif`
  product.ingredientDetails.forEach((ing, i) => {
    ctx.fillText(`${ing.name} · ${ing.percent}`, bx, ingTop + (compact ? 40 : 50) + i * (compact ? 34 : 44))
  })

  // Clean certification marks + volume
  const footerY = compact ? 500 : 940
  ctx.strokeStyle = hexToRgba(inkColor, 0.8)
  ctx.lineWidth = 2.2
  const marksX = [-84, -46, -8]
  marksX.forEach((dx, idx) => {
    ctx.beginPath()
    ctx.arc(bx + dx, footerY - 8, 11, 0, Math.PI * 2)
    ctx.stroke()
    if (idx === 2) {
      ctx.beginPath()
      ctx.moveTo(bx + dx - 7, footerY - 15)
      ctx.lineTo(bx + dx + 7, footerY - 1)
      ctx.stroke()
    }
  })

  ctx.fillStyle = hexToRgba(inkColor, 0.95)
  ctx.font = `600 ${compact ? 21 : 27}px "Manrope", sans-serif`
  ctx.fillText(product.size, bx + 64, footerY)

  // Minimal barcode block
  const barY = footerY + (compact ? 24 : 36)
  const barW = 160
  const barH = compact ? 42 : 62
  ctx.fillStyle = hexToRgba(inkColor, 0.94)
  ctx.fillRect(bx - barW / 2 - 10, barY, barW + 20, barH + 16)
  ctx.fillStyle = '#FFFFFF'
  let xCursor = bx - barW / 2
  const widths = [3, 2, 5, 2, 4, 6, 2, 3, 5, 2, 3, 6, 2, 4, 3, 5, 2, 3, 4, 2]
  widths.forEach((w, idx) => {
    if (idx % 2 === 0 && xCursor + w < bx + barW / 2) {
      ctx.fillRect(xCursor, barY + 8, w, barH)
    }
    xCursor += w + 3.8
  })
}

/**
 * Paints the 360° wrap texture:
 * - Front center at x = W * 0.25 (+Z)
 * - Back center at x = W * 0.75 (-Z) with authentic How-To-Use, Ingredients,
 *   marks, and barcode for the 180°/360° Back-Side Scanner.
 */
export function makeLabelTexture(product: Product): THREE.CanvasTexture {
  const cached = cache.get(product.id)
  if (cached) return cached

  const isSerum = product.kind === 'serum'
  const W = 2048
  // Artwork retains its front/back coordinates as the tube profile changes.
  const H = isSerum ? 680 : 1408
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  const { ink, bodyDeep, body } = product.palette
  const frontX = W * 0.25
  const backX = W * 0.75

  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  if (!isSerum) {
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, body)
    grad.addColorStop(0.75, body)
    grad.addColorStop(1, new THREE.Color(body).lerp(new THREE.Color(bodyDeep), 0.3).getStyle())
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    const printColor = relativeLuminance(body) > 0.26 ? ink : '#FFFFFF'

    // FRONT FACE (x = 0.25 * W) — matching clean Aroma Farmacy pack hierarchy
    ctx.fillStyle = hexToRgba(printColor, 0.98)
    drawDroplet(ctx, frontX, 348, 25)

    ctx.fillStyle = printColor
    ctx.font = '400 80px "Bad Script", cursive'
    ctx.strokeStyle = printColor
    ctx.lineWidth = 1.3
    ctx.lineJoin = 'round'
    ctx.strokeText('Aroma Farmacy', frontX, 590, 560)
    ctx.fillText('Aroma Farmacy', frontX, 590, 560)

    ctx.fillStyle = hexToRgba(printColor, 0.96)
    ctx.font = '600 35px "Manrope", sans-serif'
    drawSpaced(ctx, product.category.toUpperCase(), frontX, 672, 8)

    ctx.strokeStyle = hexToRgba(printColor, 0.7)
    ctx.lineWidth = 2.4
    ctx.beginPath()
    ctx.moveTo(frontX - 46, 722)
    ctx.lineTo(frontX + 46, 722)
    ctx.stroke()

    ctx.fillStyle = hexToRgba(printColor, 0.92)
    ctx.font = '500 25px "Manrope", sans-serif'
    drawSpaced(ctx, 'FRAGRANCE-FREE', frontX, 784, 6)

    ctx.fillStyle = hexToRgba(printColor, 0.78)
    ctx.font = '600 20px "Manrope", sans-serif'
    drawSpaced(ctx, product.volume.toUpperCase(), frontX, 1080, 4)

    // BACK FACE (x = 0.75 * W)
    drawBackLabel(ctx, product, backX, printColor, false)
  } else {
    ctx.clearRect(0, 0, W, H)

    // Crisp dark espresso ink for transparent optical glass over pale botanical serum
    const glassInk = '#2A1F18'
    // FRONT ON GLASS (x = 0.25 * W)
    ctx.fillStyle = hexToRgba(glassInk, 0.94)
    drawDroplet(ctx, frontX, 96, 18)

    ctx.fillStyle = glassInk
    ctx.font = '400 52px "Bad Script", cursive'
    ctx.fillText('Aroma Farmacy', frontX, 256, 440)

    ctx.fillStyle = hexToRgba(glassInk, 0.94)
    ctx.font = '600 28px "Manrope", sans-serif'
    drawSpaced(ctx, product.name.toUpperCase(), frontX, 330, 8)

    ctx.strokeStyle = hexToRgba(glassInk, 0.52)
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(frontX - 46, 372)
    ctx.lineTo(frontX + 46, 372)
    ctx.stroke()

    ctx.fillStyle = hexToRgba(glassInk, 0.84)
    ctx.font = '500 20px "Manrope", sans-serif'
    drawSpaced(ctx, product.category.toUpperCase(), frontX, 424, 5)

    ctx.fillStyle = hexToRgba(glassInk, 0.76)
    ctx.font = '600 18px "Manrope", sans-serif'
    drawSpaced(ctx, product.volume.toUpperCase(), frontX, 502, 4)

    // BACK ON GLASS (x = 0.75 * W)
    drawBackLabel(ctx, product, backX, glassInk, true)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.wrapS = THREE.RepeatWrapping
  texture.needsUpdate = true
  cache.set(product.id, texture)
  return texture
}
