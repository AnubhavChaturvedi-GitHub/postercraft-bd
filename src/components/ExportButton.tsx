import './ExportButton.css'

interface Props {
  hasBackground: boolean
  hasLogo: boolean
  isProcessing: boolean
  onExport: () => void
}

export default function ExportButton({ hasBackground, hasLogo, isProcessing, onExport }: Props) {
  const disabled = !hasBackground || !hasLogo || isProcessing

  return (
    <div className="export-panel">
      <button
        className="export-btn"
        disabled={disabled}
        onClick={onExport}
      >
        {isProcessing ? (
          <div className="export-spinner" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 12V15C3 15.552 3.448 16 4 16H14C14.552 16 15 15.552 15 15V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 2V11M9 11L5 7M9 11L13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        <span>{isProcessing ? 'Exporting...' : 'Export Poster'}</span>
      </button>
      {!hasBackground && (
        <p className="export-hint">Select a background</p>
      )}
      {hasBackground && !hasLogo && (
        <p className="export-hint">Upload a logo</p>
      )}
    </div>
  )
}
