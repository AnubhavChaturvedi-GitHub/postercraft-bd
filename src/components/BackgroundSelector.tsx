import { useState, useEffect } from 'react'
import type { BackgroundImage } from '../types'
import './BackgroundSelector.css'

const TOTAL_BACKGROUNDS = 4

interface Props {
  selectedIndex: number | null
  onSelect: (bg: BackgroundImage) => void
}

export default function BackgroundSelector({ selectedIndex, onSelect }: Props) {
  const [backgrounds, setBackgrounds] = useState<BackgroundImage[]>([])

  useEffect(() => {
    const loaded: BackgroundImage[] = []
    let loadedCount = 0

    for (let i = 1; i <= TOTAL_BACKGROUNDS; i++) {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 120
        canvas.height = 80
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, 120, 80)
        const thumb = canvas.toDataURL('image/jpeg', 0.7)

        loaded.push({
          index: i,
          dataUrl: img.src,
          thumbnailUrl: thumb,
          name: `background-${i}`,
        })
        loadedCount++
        if (loadedCount === TOTAL_BACKGROUNDS) {
          loaded.sort((a, b) => a.index - b.index)
          setBackgrounds([...loaded])
        }
      }
      img.onerror = () => {
        const color = getColorForIndex(i)
        const canvas = document.createElement('canvas')
        canvas.width = 200
        canvas.height = 150
        const ctx = canvas.getContext('2d')!
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        grad.addColorStop(0, color[0])
        grad.addColorStop(1, color[1])
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9)

        const thumbCanvas = document.createElement('canvas')
        thumbCanvas.width = 120
        thumbCanvas.height = 80
        const thumbCtx = thumbCanvas.getContext('2d')!
        thumbCtx.drawImage(canvas, 0, 0, 120, 80)
        const thumb = thumbCanvas.toDataURL('image/jpeg', 0.7)

        loaded.push({ index: i, dataUrl, thumbnailUrl: thumb, name: `background-${i}` })
        loadedCount++
        if (loadedCount === TOTAL_BACKGROUNDS) {
          loaded.sort((a, b) => a.index - b.index)
          setBackgrounds([...loaded])
        }
      }
      img.src = `./backgrounds/bg${i}.jpg`
    }
  }, [])

  return (
    <div className="bg-grid">
      {backgrounds.map((bg) => (
        <button
          key={bg.index}
          className={`bg-item ${selectedIndex === bg.index ? 'selected' : ''}`}
          onClick={() => onSelect(bg)}
          title={`Background ${bg.index}`}
        >
          <img src={bg.thumbnailUrl} alt={`Background ${bg.index}`} className="bg-thumb" />
          <span className="bg-label">#{bg.index}</span>
        </button>
      ))}
    </div>
  )
}

function getColorForIndex(i: number): [string, string] {
  const palettes: [string, string][] = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
    ['#a18cd1', '#fbc2eb'],
    ['#fccb90', '#d57eeb'],
    ['#e0c3fc', '#8ec5fc'],
    ['#f5576c', '#ff6f91'],
    ['#667eea', '#764ba2'],
  ]
  return palettes[(i - 1) % palettes.length]
}
