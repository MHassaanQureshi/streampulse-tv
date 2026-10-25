import React, { useState, useEffect } from 'react'
import { Tv, Wifi, Smartphone, Download, Check, Copy, ExternalLink, X, ShieldAlert, Monitor } from 'lucide-react'

export default function TvConnectModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false)
  const [copiedLocal, setCopiedLocal] = useState(false)
  const host = window.location.hostname
  const isLocalhost = !host || host === 'localhost' || host === '127.0.0.1'
  const tvIp = isLocalhost ? '192.168.1.36' : host
  const port = window.location.port || '3000'
  const tvUrl = `http://${tvIp}:${port}`
  const localUrl = `http://localhost:${port}`

  const copyUrl = (text, isTv = true) => {
    navigator.clipboard.writeText(text)
    if (isTv) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } else {
      setCopiedLocal(true)
      setTimeout(() => setCopiedLocal(false), 2500)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-chassis tv-connect-modal" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-box">
            <Tv size={24} color="#6366f1" />
            <h2>Connect to Your Smart TV</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Method 1: Instant Wi-Fi Browser Access (Easiest & Works on All TVs) */}
          <div className="setup-card featured-setup">
            <div className="setup-card-header">
              <span className="badge-step">Method 1 (Instant)</span>
              <h3>Open in Smart TV Web Browser</h3>
            </div>
            <p className="setup-desc">
              Works instantly on <strong>Samsung (Tizen), LG (webOS), Sony, Android TV, Fire TV, and Hisense (VIDAA)</strong>!
            </p>

            {/* Smart TV Network URL */}
            <div className="url-copy-box">
              <div className="url-display">
                <Wifi size={18} color="#22c55e" />
                <div>
                  <span className="url-label" style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Type this on your Smart TV Browser:</span>
                  <span className="url-text" style={{ fontSize: '16px', fontWeight: 'bold', color: '#38bdf8' }}>{tvUrl}</span>
                </div>
              </div>
              <button className="btn-copy" onClick={() => copyUrl(tvUrl, true)}>
                {copied ? <Check size={16} color="#22c55e" /> : <Copy size={16} />}
                <span>{copied ? 'Copied!' : 'Copy TV URL'}</span>
              </button>
            </div>

            {/* PC Localhost URL */}
            <div className="url-copy-box" style={{ marginTop: '8px', opacity: 0.9 }}>
              <div className="url-display">
                <Monitor size={18} color="#a855f7" />
                <div>
                  <span className="url-label" style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Local PC browser:</span>
                  <span className="url-text">{localUrl}</span>
                </div>
              </div>
              <button className="btn-copy" onClick={() => copyUrl(localUrl, false)}>
                {copiedLocal ? <Check size={16} color="#22c55e" /> : <Copy size={16} />}
                <span>{copiedLocal ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <ol className="step-list">
              <li>Make sure your Smart TV is connected to the <strong>same Wi-Fi network</strong> as this computer.</li>
              <li>Open the <strong>Internet Browser</strong> app on your Smart TV (e.g. Samsung Internet, LG Web Browser, or Silk).</li>
              <li>Type in <code>{tvUrl}</code> and press Enter.</li>
              <li>Select <strong>"Add to Home Screen"</strong> or Bookmark it for instant 1-click access with your remote!</li>
            </ol>
          </div>

          {/* Method 2 & 3: Native TV Sideloading */}
          <div className="setup-grid-methods">
            {/* Android TV / Fire TV APK */}
            <div className="setup-card">
              <div className="setup-card-header">
                <Smartphone size={20} color="#38bdf8" />
                <h4>Android TV / Fire TV (.APK)</h4>
              </div>
              <p>Install as a native application on your TV:</p>
              <ul className="step-bullets">
                <li>We can wrap this project with <strong>Capacitor</strong> into an <code>.apk</code> file.</li>
                <li>Install <strong>"Send Files to TV"</strong> from Google Play Store on your TV.</li>
                <li>Send the <code>.apk</code> file to your TV and click Install.</li>
              </ul>
            </div>

            {/* Samsung Tizen / LG webOS */}
            <div className="setup-card">
              <div className="setup-card-header">
                <Monitor size={20} color="#a855f7" />
                <h4>Samsung Tizen / LG webOS</h4>
              </div>
              <p>Direct TV OS developer installation:</p>
              <ul className="step-bullets">
                <li>Enable <strong>Developer Mode</strong> in your TV settings.</li>
                <li>Package using <strong>LG webOS Dev Manager</strong> (for LG) or <strong>Tizen Studio</strong> (for Samsung).</li>
                <li>Deploy directly over Wi-Fi to your TV.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn-done" onClick={onClose}>
            Got it, Back to Channels
          </button>
        </div>
      </div>
    </div>
  )
}
