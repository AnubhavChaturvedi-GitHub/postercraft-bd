import type { ExportFormat, ExportOptions } from '../types'

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return loadImage(dataUrl).then((img) => ({
    width: img.naturalWidth,
    height: img.naturalHeight,
  }))
}

function renderComposite(
  bgImg: HTMLImageElement,
  logoImg: HTMLImageElement,
  logoX: number,
  logoY: number,
  logoWidth: number,
  logoHeight: number,
  scale: number = 1,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bgImg.naturalWidth * scale)
  canvas.height = Math.round(bgImg.naturalHeight * scale)
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height)
  ctx.drawImage(
    logoImg,
    Math.round(logoX * scale),
    Math.round(logoY * scale),
    Math.round(logoWidth * scale),
    Math.round(logoHeight * scale),
  )

  return canvas
}

function getMimeType(format: ExportFormat): string {
  switch (format) {
    case 'jpeg': return 'image/jpeg'
    case 'webp': return 'image/webp'
    default: return 'image/png'
  }
}

export async function exportPoster(
  data: {
    backgroundDataUrl: string
    logoDataUrl: string
    logoX: number
    logoY: number
    logoWidth: number
    logoHeight: number
  },
  options: ExportOptions = { format: 'png', quality: 92, fileName: 'poster.png' },
): Promise<{ dataUrl: string; width: number; height: number; sizeBytes: number }> {
  const bgImg = await loadImage(data.backgroundDataUrl)
  const logoImg = await loadImage(data.logoDataUrl)

  const canvas = renderComposite(bgImg, logoImg, data.logoX, data.logoY, data.logoWidth, data.logoHeight)

  const mime = getMimeType(options.format)
  const dataUrl = canvas.toDataURL(mime, options.quality / 100)

  const base64 = dataUrl.split(',')[1]
  const sizeBytes = Math.round(base64.length * 0.75)

  return {
    dataUrl,
    width: canvas.width,
    height: canvas.height,
    sizeBytes,
  }
}

export async function generatePreview(
  data: {
    backgroundDataUrl: string
    logoDataUrl: string
    logoX: number
    logoY: number
    logoWidth: number
    logoHeight: number
  },
  maxDimension: number = 400,
): Promise<{ dataUrl: string; width: number; height: number }> {
  const bgImg = await loadImage(data.backgroundDataUrl)
  const logoImg = await loadImage(data.logoDataUrl)

  const scale = Math.min(1, maxDimension / Math.max(bgImg.naturalWidth, bgImg.naturalHeight))

  const canvas = renderComposite(bgImg, logoImg, data.logoX, data.logoY, data.logoWidth, data.logoHeight, scale)

  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.85),
    width: canvas.width,
    height: canvas.height,
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function downloadImage(dataUrl: string, fileName: string) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
