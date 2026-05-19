import './EffectsPanel.css'

interface Props {
  hasLogo: boolean
  isProcessing: boolean
  onRemoveBg: () => void
}

export default function EffectsPanel({ hasLogo, isProcessing, onRemoveBg }: Props) {
  return (
    <div className="effects-panel">
      {!hasLogo ? (
        <p className="effects-hint">Upload a logo first</p>
      ) : (
        <button className="remove-bg-btn" onClick={onRemoveBg} disabled={isProcessing}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>Remove Background</span>
        </button>
      )}
    </div>
  )
}
