import { forwardRef, useRef, useState, useCallback, useEffect } from 'react'
import type { LogoImage, BackgroundImage } from '../types'
import './CanvasEditor.css'

interface Props {
  background: BackgroundImage | null
  logo: LogoImage | null
  onLogoPositionChange: (x: number, y: number) => void
  onLogoResize: (width: number, height: number) => void
}

const MIN_LOGO_SIZE = 20

const CanvasEditor = forwardRef<HTMLDivElement, Props>(
  ({ background, logo, onLogoPositionChange, onLogoResize }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [bgNaturalSize, setBgNaturalSize] = useState({ width: 0, height: 0 })
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
    const [bgLoaded, setBgLoaded] = useState(false)

    useEffect(() => {
      setBgNaturalSize({ width: 0, height: 0 })
      setBgLoaded(false)
      if (!background) return

      const img = new Image()
      img.onload = () => {
        setBgNaturalSize({ width: img.naturalWidth, height: img.naturalHeight })
        setBgLoaded(true)
      }
      img.src = background.dataUrl
    }, [background])

    useEffect(() => {
      const updateSize = () => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect()
          setContainerSize({ width: rect.width, height: rect.height })
        }
      }
      if (background) updateSize()
      window.addEventListener('resize', updateSize)
      return () => window.removeEventListener('resize', updateSize)
    }, [background])

    const bgScale = bgNaturalSize.width > 0 && containerSize.width > 0
      ? containerSize.width / bgNaturalSize.width
      : 1

    const displayBgWidth = containerSize.width
    const displayBgHeight = bgNaturalSize.height * bgScale

    const logoDisplayW = logo && bgNaturalSize.width > 0
      ? (logo.displayWidth / bgNaturalSize.width) * displayBgWidth
      : logo ? logo.displayWidth : 0

    const logoDisplayH = logo && bgNaturalSize.height > 0
      ? (logo.displayHeight / bgNaturalSize.height) * displayBgHeight
      : logo ? logo.displayHeight : 0

    const [dragPos, setDragPos] = useState({ x: 0, y: 0 })

    useEffect(() => {
      if (!logo) return
      const s = bgNaturalSize.width > 0 ? displayBgWidth / bgNaturalSize.width : 1
      setDragPos({ x: logo.x * s, y: logo.y * s })
    }, [logo?.x, logo?.y, logo?.displayWidth, logo?.displayHeight, bgNaturalSize.width, displayBgWidth])

    const dragStateRef = useRef<{
      startX: number
      startY: number
      startPosX: number
      startPosY: number
    } | null>(null)

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
      if (e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()

      dragStateRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startPosX: dragPos.x,
        startPosY: dragPos.y,
      }

      const onMouseMove = (ev: MouseEvent) => {
        const ds = dragStateRef.current
        if (!ds) return

        const dx = ev.clientX - ds.startX
        const dy = ev.clientY - ds.startY

        let newX = ds.startPosX + dx
        let newY = ds.startPosY + dy

        newX = Math.max(0, Math.min(newX, containerSize.width - Math.max(1, logoDisplayW)))
        newY = Math.max(0, Math.min(newY, containerSize.height - Math.max(1, logoDisplayH)))

        setDragPos({ x: newX, y: newY })

        const s = bgNaturalSize.width > 0 ? displayBgWidth / bgNaturalSize.width : 1
        onLogoPositionChange(Math.round(newX / s), Math.round(newY / s))
      }

      const onMouseUp = () => {
        dragStateRef.current = null
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }, [dragPos, containerSize, logoDisplayW, logoDisplayH, bgNaturalSize.width, displayBgWidth, onLogoPositionChange])

    const handleResizeStart = useCallback((e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const startX = e.clientX
      const startY = e.clientY
      const startW = logoDisplayW
      const startH = logoDisplayH

      const onMouseMove = (ev: MouseEvent) => {
        if (!logo) return
        const dx = ev.clientX - startX
        const dy = ev.clientY - startY

        let newW = Math.max(MIN_LOGO_SIZE, startW + dx)
        let newH = Math.max(MIN_LOGO_SIZE, startH + dy)

        const aspect = logo.originalWidth / logo.originalHeight
        if (newW / newH > aspect) {
          newH = newW / aspect
        } else {
          newW = newH * aspect
        }

        const s = bgNaturalSize.width > 0 ? displayBgWidth / bgNaturalSize.width : 1
        onLogoResize(Math.round(newW / s), Math.round(newH / s))
      }

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }, [logo, logoDisplayW, logoDisplayH, bgNaturalSize, displayBgWidth, onLogoResize])

    const renderLogo = logo && bgLoaded && bgNaturalSize.width > 0 && bgNaturalSize.height > 0
    const aspectRatio = bgNaturalSize.width > 0 && bgNaturalSize.height > 0
      ? `${bgNaturalSize.width} / ${bgNaturalSize.height}`
      : undefined

    return (
      <div className="canvas-editor" ref={ref}>
        {!background ? (
          <div className="canvas-placeholder">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="4" y="4" width="40" height="40" rx="4" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M16 28L22 22L28 28L34 20L40 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
            </svg>
            <p className="placeholder-text">Select a background to start</p>
          </div>
        ) : (
          <div
            className="canvas-container"
            ref={containerRef}
            style={{
              width: '100%',
              maxHeight: '100%',
              aspectRatio,
            }}
          >
            <img
              src={background.dataUrl}
              alt="Background"
              className="canvas-bg"
              style={{ width: '100%', height: 'auto', display: 'block' }}
              draggable={false}
            />

            {renderLogo && (
              <div
                className="logo-wrapper"
                style={{
                  position: 'absolute',
                  left: dragPos.x,
                  top: dragPos.y,
                  cursor: 'move',
                }}
                onMouseDown={handleMouseDown}
              >
                <img
                  src={logo!.dataUrl}
                  alt="Logo"
                  className="canvas-logo"
                  style={{
                    width: Math.max(1, logoDisplayW),
                    height: Math.max(1, logoDisplayH),
                  }}
                  draggable={false}
                />
                <div className="resize-handle" onMouseDown={handleResizeStart}>
                  <svg width="8" height="8" viewBox="0 0 8 8">
                    <line x1="0" y1="8" x2="8" y2="8" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="8" y1="0" x2="8" y2="8" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  },
)

CanvasEditor.displayName = 'CanvasEditor'
export default CanvasEditor
