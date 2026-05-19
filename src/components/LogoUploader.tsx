import { useRef } from 'react'
import './LogoUploader.css'

interface Props {
  hasLogo: boolean
  logoName: string | null
  onUpload: (file: File) => void
}

const ACCEPTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.bmp', '.gif']

export default function LogoUploader({ hasLogo, logoName, onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      alert('Please select a valid image file (PNG, JPG, WEBP, SVG, BMP, or GIF)')
      return
    }
    e.target.value = ''
    onUpload(file)
  }

  return (
    <div className="logo-uploader">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
      />
      {!hasLogo ? (
        <button className="upload-btn" onClick={handleClick}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 3V13M10 3L6 7M10 3L14 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 14V16C2 17.105 2.895 18 4 18H16C17.105 18 18 17.105 18 16V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>Upload Logo</span>
        </button>
      ) : (
        <div className="logo-info">
          <div className="logo-preview-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 12L5 9L8 12L11 8L14 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <span className="logo-name">{logoName}</span>
          <button className="btn-change" onClick={handleClick}>Change</button>
        </div>
      )}
    </div>
  )
}
