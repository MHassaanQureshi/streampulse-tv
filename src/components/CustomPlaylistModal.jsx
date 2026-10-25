import React, { useState } from 'react'
import { PlusCircle, Link2, X, Check, Globe } from 'lucide-react'

export default function CustomPlaylistModal({ isOpen, onClose, onAddPlaylist }) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please provide a playlist name')
      return
    }
    if (!url.trim() || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      setError('Please enter a valid HTTP or HTTPS M3U URL')
      return
    }

    onAddPlaylist(name.trim(), url.trim())
    setName('')
    setUrl('')
    setError('')
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-chassis custom-m3u-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-box">
            <PlusCircle size={22} color="#6366f1" />
            <h2>Add Custom M3U Playlist</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <p className="modal-intro">
            Paste any M3U or M3U8 playlist link to load your custom channels into StreamPulse TV.
          </p>

          {error && <div className="modal-error-banner">{error}</div>}

          <div className="form-group">
            <label>Playlist Name</label>
            <input
              type="text"
              placeholder="e.g., My Premium IPTV, Sports HD, etc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="tv-input"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>M3U / M3U8 Playlist URL</label>
            <div className="input-with-icon">
              <Link2 size={18} className="input-icon" />
              <input
                type="url"
                placeholder="https://example.com/playlist.m3u"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="tv-input"
              />
            </div>
          </div>

          <div className="quick-presets">
            <span className="preset-label">Quick Links:</span>
            <button
              type="button"
              className="btn-preset-chip"
              onClick={() => {
                setName('IPTV-Org Master')
                setUrl('https://iptv-org.github.io/iptv/index.m3u')
              }}
            >
              iptv-org index.m3u (All Global)
            </button>
            <button
              type="button"
              className="btn-preset-chip"
              onClick={() => {
                setName('US Channels')
                setUrl('https://iptv-org.github.io/iptv/countries/us.m3u')
              }}
            >
              USA Channels
            </button>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              <Check size={18} /> Load Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
