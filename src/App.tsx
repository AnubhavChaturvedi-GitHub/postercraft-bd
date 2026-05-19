import { useState, useCallback, useRef } from 'react'
import BackgroundSelector from './components/BackgroundSelector'
import LogoUploader from './components/LogoUploader'
import CanvasEditor from './components/CanvasEditor'
import EffectsPanel from './components/EffectsPanel'
import ExportButton from './components/ExportButton'
import ExportDialog from './components/ExportDialog'
import { exportPoster, downloadImage, getImageDimensions } from './utils/imageProcessing'
import type { LogoImage, BackgroundImage, ProcessingStatus, ExportOptions } from './types'
import './App.css'

export default function App() {
  const [background, setBackground] = useState<BackgroundImage | null>(null)
  const [logo, setLogo] = useState<LogoImage | null>(null)
  const [status, setStatus] = useState<ProcessingStatus>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [showExportDialog, setShowExportDialog] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleBackgroundSelect = useCallback((bg: BackgroundImage) => {
    setBackground(bg)
  }, [])

  const handleLogoUpload = useCallback(async (file: File) => {
    setStatus('processing')
    setStatusMessage('Loading logo...')
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
      })

      const dims = await getImageDimensions(dataUrl)

      let displayW = dims.width
      let displayH = dims.height

      if (background) {
        const bgDims = await getImageDimensions(background.dataUrl)

        const maxW = bgDims.width * 0.8
        const maxH = bgDims.height * 0.8

        if (displayW > maxW || displayH > maxH) {
          const scale = Math.min(maxW / displayW, maxH / displayH)
          displayW = Math.round(displayW * scale)
          displayH = Math.round(displayH * scale)
        }

        const centerX = Math.round((bgDims.width - displayW) / 2)
        const centerY = Math.round((bgDims.height - displayH) / 2)

        setLogo({
          dataUrl,
          fileName: file.name,
          originalWidth: dims.width,
          originalHeight: dims.height,
          displayWidth: displayW,
          displayHeight: displayH,
          x: Math.max(0, centerX),
          y: Math.max(0, centerY),
        })
      } else {
        setLogo({
          dataUrl,
          fileName: file.name,
          originalWidth: dims.width,
          originalHeight: dims.height,
          displayWidth: dims.width,
          displayHeight: dims.height,
          x: 0,
          y: 0,
        })
      }
      setStatus('done')
      setStatusMessage('Logo loaded successfully')
    } catch (err) {
      setStatus('error')
      setStatusMessage('Failed to load logo')
      console.error('Logo upload error:', err)
    }
  }, [background])

  const handleBgRemoval = useCallback(async () => {
    if (!logo) return
    setStatus('processing')
    setStatusMessage('Removing background...')
    try {
      const { removeBackground } = await import('@imgly/background-removal')
      const blob = await removeBackground(logo.dataUrl, {
        output: { format: 'image/png', quality: 1 },
      })
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
      })
      setLogo((prev) => {
        if (!prev) return prev
        return { ...prev, dataUrl }
      })
      setStatus('done')
      setStatusMessage('Background removed')
    } catch {
      setStatus('error')
      setStatusMessage('Failed to remove background')
    }
  }, [logo])

  const handleLogoPositionChange = useCallback((x: number, y: number) => {
    setLogo((prev) => {
      if (!prev) return prev
      return { ...prev, x, y }
    })
  }, [])

  const handleLogoResize = useCallback((width: number, height: number) => {
    setLogo((prev) => {
      if (!prev) return prev
      return { ...prev, displayWidth: width, displayHeight: height }
    })
  }, [])

  const handleExportOpen = useCallback(() => {
    setShowExportDialog(true)
  }, [])

  const handleExportClose = useCallback(() => {
    setShowExportDialog(false)
  }, [])

  const handleDoExport = useCallback(async (options: ExportOptions) => {
    if (!background || !logo) return
    try {
      const result = await exportPoster(
        {
          backgroundDataUrl: background.dataUrl,
          logoDataUrl: logo.dataUrl,
          logoX: logo.x,
          logoY: logo.y,
          logoWidth: logo.displayWidth,
          logoHeight: logo.displayHeight,
        },
        options,
      )
      downloadImage(result.dataUrl, `${options.fileName}.${options.format === 'jpeg' ? 'jpg' : options.format}`)
      setShowExportDialog(false)
      setStatus('done')
      setStatusMessage('Poster exported successfully')
    } catch {
      setStatus('error')
      setStatusMessage('Failed to export poster')
    }
  }, [background, logo])

  const clearStatus = useCallback(() => {
    setStatus('idle')
    setStatusMessage('')
  }, [])

  const handleReset = useCallback(() => {
    setLogo(null)
    setStatus('idle')
    setStatusMessage('')
  }, [])

  return (
    <div className="app" onMouseDown={status === 'done' || status === 'error' ? clearStatus : undefined}>
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="var(--accent)" />
              <path d="M7 14L12 9L17 14M12 9V20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 10V19C21 19.552 20.552 20 20 20H15" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="app-title">PosterCraft</h1>
          <span className="app-subtitle">BD Team Poster Automation</span>
        </div>
        <div className="header-center">
          {statusMessage && (
            <div className={`status-badge ${status}`}>
              <span className="status-dot" />
              {statusMessage}
            </div>
          )}
        </div>
        <div className="header-right">
          {logo && (
            <button className="btn btn-ghost" onClick={handleReset} title="Reset logo">
              Reset
            </button>
          )}
        </div>
      </header>

      <div className="app-body">
        <aside className="sidebar sidebar-left">
          <section className="sidebar-section">
            <h2 className="sidebar-title">Backgrounds</h2>
            <BackgroundSelector
              selectedIndex={background?.index ?? null}
              onSelect={handleBackgroundSelect}
            />
          </section>
          <section className="sidebar-section">
            <h2 className="sidebar-title">Logo</h2>
            <LogoUploader
              hasLogo={!!logo}
              logoName={logo?.fileName ?? null}
              onUpload={handleLogoUpload}
            />
          </section>
          <section className="sidebar-section">
            <h2 className="sidebar-title">Actions</h2>
            <EffectsPanel
              hasLogo={!!logo}
              isProcessing={status === 'processing'}
              onRemoveBg={handleBgRemoval}
            />
          </section>
        </aside>

        <main className="main-content">
          <CanvasEditor
            ref={canvasRef}
            background={background}
            logo={logo}
            onLogoPositionChange={handleLogoPositionChange}
            onLogoResize={handleLogoResize}
          />
        </main>

        <aside className="sidebar sidebar-right">
          <section className="sidebar-section">
            <h2 className="sidebar-title">Export</h2>
            <ExportButton
              hasBackground={!!background}
              hasLogo={!!logo}
              isProcessing={status === 'processing'}
              onExport={handleExportOpen}
            />
          </section>
          {logo && (
            <section className="sidebar-section">
              <h2 className="sidebar-title">Details</h2>
              <div className="details-panel">
                <div className="detail-row">
                  <span className="detail-label">File</span>
                  <span className="detail-value">{logo.fileName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Resolution</span>
                  <span className="detail-value">{logo.originalWidth} &times; {logo.originalHeight}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Position</span>
                  <span className="detail-value">X: {Math.round(logo.x)}, Y: {Math.round(logo.y)}</span>
                </div>
              </div>
            </section>
          )}
        </aside>
      </div>

      <ExportDialog
        open={showExportDialog}
        background={background}
        logo={logo}
        onExport={handleDoExport}
        onClose={handleExportClose}
      />
    </div>
  )
}
