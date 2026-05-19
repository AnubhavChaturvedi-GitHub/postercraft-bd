export interface LogoImage {
  dataUrl: string
  fileName: string
  originalWidth: number
  originalHeight: number
  displayWidth: number
  displayHeight: number
  x: number
  y: number
}

export interface BackgroundImage {
  index: number
  dataUrl: string
  thumbnailUrl: string
  name: string
}

export type ProcessingStatus = 'idle' | 'loading' | 'processing' | 'done' | 'error'

export type ExportFormat = 'png' | 'jpeg' | 'webp'

export interface ExportOptions {
  format: ExportFormat
  quality: number
  fileName: string
}
