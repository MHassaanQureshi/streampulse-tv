import React, { useState } from 'react'
import { Search, X, CornerDownLeft, Delete } from 'lucide-react'

const KEYPAD_ROWS = [
  ['A', 'B', 'C', 'D', 'E', 'F', '1', '2', '3'],
  ['G', 'H', 'I', 'J', 'K', 'L', '4', '5', '6'],
  ['M', 'N', 'O', 'P', 'Q', 'R', '7', '8', '9'],
  ['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0']
]

export default function SearchModal({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  onExecuteSearch
}) {
  const [localQuery, setLocalQuery] = useState(searchQuery || '')

  if (!isOpen) return null

  const handleKeyPress = (char) => {
    const updated = localQuery + char
    setLocalQuery(updated)
    onSearchChange(updated)
  }

  const handleBackspace = () => {
    const updated = localQuery.slice(0, -1)
    setLocalQuery(updated)
    onSearchChange(updated)
  }

  const handleClear = () => {
    setLocalQuery('')
    onSearchChange('')
  }

  const handleDone = () => {
    onSearchChange(localQuery)
    if (onExecuteSearch) onExecuteSearch(localQuery)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-chassis search-tv-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-box">
            <Search size={22} color="#6366f1" />
            <h2>Search Live Channels</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Search Display Bar */}
          <div className="tv-search-display">
            <Search size={24} className="search-display-icon" />
            <input
              type="text"
              placeholder="Search by channel name, country, or category..."
              value={localQuery}
              onChange={(e) => {
                setLocalQuery(e.target.value)
                onSearchChange(e.target.value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleDone()
                }
              }}
              className="tv-search-input"
              autoFocus
            />
            {localQuery && (
              <button className="clear-search-btn-large" onClick={handleClear} aria-label="Clear">
                ×
              </button>
            )}
            <button className="modal-search-action-btn" onClick={handleDone} aria-label="Submit Search">
              Search
            </button>
          </div>

          {/* On-Screen TV Remote Keyboard */}
          <div className="tv-virtual-keypad">
            {KEYPAD_ROWS.map((row, rIdx) => (
              <div key={rIdx} className="keypad-row">
                {row.map(char => (
                  <button
                    key={char}
                    className="keypad-key"
                    onClick={() => handleKeyPress(char)}
                  >
                    {char}
                  </button>
                ))}
              </div>
            ))}

            {/* Bottom Special Keys */}
            <div className="keypad-row special-row">
              <button className="keypad-key space-key" onClick={() => handleKeyPress(' ')}>
                SPACE
              </button>
              <button className="keypad-key backspace-key" onClick={handleBackspace}>
                <Delete size={18} />
                <span>DEL</span>
              </button>
              <button className="keypad-key clear-key" onClick={handleClear}>
                CLEAR
              </button>
              <button className="keypad-key done-key" onClick={handleDone}>
                <CornerDownLeft size={18} />
                <span>SEARCH</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
