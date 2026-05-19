import { useState, useEffect, useCallback } from 'react'
import type { LogoImage, BackgroundImage, ExportFormat, ExportOptions } from '../types'
import { generatePreview, exportPoster, formatFileSize } from '../utils/imageProcessing'
import './ExportDialog.css'

interface Props {
  open: boolean
  background: BackgroundImage | null
  logo: LogoImage | null
  onExport: (options: ExportOptions) => Promise<void>
  onClose: () => void
}

export default function ExportDialog({ open, background, logo, onExport, onClose }: Props) {
  const [format, setFormat] = useState<ExportFormat>('png')
  const [quality, setQuality] = useState(92)
  const [fileName, setFileName] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [estimatedSize, setEstimatedSize] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (!open || !background || !logo) return
    setFileName(`poster-${background.name}`)
    setFormat('png')
    setQuality(92)
    setPreviewUrl(null)
    setEstimatedSize('')

    generatePreview({
      backgroundDataUrl: background.dataUrl,
      logoDataUrl: logo.dataUrl,
      logoX: logo.x,
      logoY: logo.y,
      logoWidth: logo.displayWidth,
      logoHeight: logo.displayHeight,
    }).then((preview) => {
      setPreviewUrl(preview.dataUrl)
    })
  }, [open, background, logo])

  const updateEstimatedSize = useCallback(async (fmt: ExportFormat, q: number) => {
    if (!background || !logo) return
    const result = await exportPoster(
      {
        backgroundDataUrl: background.dataUrl,
        logoDataUrl: logo.dataUrl,
        logoX: logo.x,
        logoY: logo.y,
        logoWidth: logo.displayWidth,
        logoHeight: logo.displayHeight,
      },
      { format: fmt, quality: q, fileName: 'estimate' },
    )
    setEstimatedSize(formatFileSize(result.sizeBytes))
  }, [background, logo])

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => updateEstimatedSize(format, quality), 300)
    return () => clearTimeout(timer)
  }, [format, quality, open, updateEstimatedSize])

  const handleExport = useCallback(async () => {
    setIsExporting(true)
    try {
      await onExport({ format, quality, fileName })
    } finally {
      setIsExporting(false)
    }
  }, [format, quality, fileName, onExport])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isExporting) onClose()
  }

  const getExtension = () => {
    switch (format) {
      case 'jpeg': return '.jpg'
      case 'webp': return '.webp'
      default: return '.png'
    }
  }

  if (!open) return null

  return (
    <div className="export-overlay" onMouseDown={handleBackdropClick}>
      <div className="export-dialog">
        <div className="export-dialog-header">
          <h2>Export Poster</h2>
          <button className="export-close" onClick={onClose} disabled={isExporting}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="export-dialog-body">
          <div className="export-preview-section">
            <div className="export-preview-frame">
              {previewUrl ? (
                <img src={previewUrl} alt="Poster preview" className="export-preview-img" />
              ) : (
                <div className="export-preview-placeholder">Generating preview...</div>
              )}
            </div>
          </div>

          <div className="export-settings">
            <div className="export-field">
              <label className="export-label">File Name</label>
              <div className="export-filename-row">
                <input
                  className="export-input"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="poster-name"
                  disabled={isExporting}
                />
                <span className="export-ext">{getExtension()}</span>
              </div>
            </div>

            <div className="export-field">
              <label className="export-label">Format</label>
              <div className="export-format-row">
                {(['png', 'jpeg', 'webp'] as ExportFormat[]).map((f) => (
                  <button
                    key={f}
                    className={`export-format-btn ${format === f ? 'active' : ''}`}
                    onClick={() => setFormat(f)}
                    disabled={isExporting}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {format !== 'png' && (
              <div className="export-field">
                <div className="export-quality-header">
                  <label className="export-label">Quality</label>
                  <span className="export-quality-value">{quality}%</span>
                </div>
                <input
                  type="range"
                  className="export-slider"
                  min={10}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  disabled={isExporting}
                />
              </div>
            )}

            <div className="export-field export-size-row">
              <span className="export-label">Estimated Size</span>
              <span className="export-size-value">{estimatedSize || 'Calculating...'}</span>
            </div>

            <div className="export-info">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
                <path d="M7 4.5V7.5M7 9.5V9.51" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <span>Export resolution: {background ? `${background.name}` : '—'} (full quality)</span>
            </div>
          </div>
        </div>

        <div className="export-dialog-footer">
          <button className="export-btn-cancel" onClick={onClose} disabled={isExporting}>
            Cancel
          </button>
          <button className="export-btn-download" onClick={handleExport} disabled={!previewUrl || isExporting}>
            {isExporting ? (
              <>
                <div className="export-spinner-sm" />
                Exporting...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 11V13C2 13.552 2.448 14 3 14H13C13.552 14 14 13.552 14 13V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M8 2V10M8 10L5 7M8 10L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Download
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
