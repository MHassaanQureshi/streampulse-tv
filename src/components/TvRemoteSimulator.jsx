import React, { useState } from 'react'
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CornerDownLeft,
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Radio,
  Tv,
  X,
  Keyboard,
  Sliders
} from 'lucide-react'

export default function TvRemoteSimulator({ soundEnabled = true }) {
  const [isOpen, setIsOpen] = useState(false)

  // Dispatches synthetic keyboard event to trigger standard TV remote listeners
  const sendKey = (key, keyCode) => {
    const event = new KeyboardEvent('keydown', {
      key: key,
      keyCode: keyCode,
      which: keyCode,
      bubbles: true,
      cancelable: true
    })
    window.dispatchEvent(event)
  }

  return (
    <div className={`tv-remote-widget ${isOpen ? 'open' : 'closed'}`}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          className="remote-toggle-pill"
          onClick={() => setIsOpen(true)}
          title="Open Smart TV Remote Simulator"
        >
          <Tv size={18} />
          <span>TV Remote</span>
        </button>
      )}

      {/* Remote Control Chassis */}
      {isOpen && (
        <div className="remote-chassis">
          <div className="remote-header">
            <div className="remote-header-brand">
              <Tv size={16} />
              <span>TV REMOTE</span>
            </div>
            <button className="remote-close-btn" onClick={() => setIsOpen(false)}>
              <X size={16} />
            </button>
          </div>

          <div className="remote-body">
            {/* Top Quick Actions */}
            <div className="remote-row top-row">
              <button
                className="remote-btn circle red"
                onClick={() => sendKey('Escape', 27)}
                title="Back / Exit (Esc)"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                className="remote-btn pill"
                onClick={() => sendKey('f', 70)}
                title="Fullscreen (F)"
              >
                <Maximize size={15} />
              </button>
              <button
                className="remote-btn pill"
                onClick={() => sendKey('m', 77)}
                title="Mute (M)"
              >
                <VolumeX size={15} />
              </button>
            </div>

            {/* D-Pad Controller */}
            <div className="dpad-container">
              <div className="dpad-ring">
                {/* UP */}
                <button
                  className="dpad-btn dpad-up"
                  onClick={() => sendKey('ArrowUp', 38)}
                  title="Arrow Up"
                >
                  <ChevronUp size={24} />
                </button>

                {/* LEFT */}
                <button
                  className="dpad-btn dpad-left"
                  onClick={() => sendKey('ArrowLeft', 37)}
                  title="Arrow Left (Enter Sidebar)"
                >
                  <ChevronLeft size={24} />
                </button>

                {/* CENTER OK */}
                <button
                  className="dpad-center-ok"
                  onClick={() => sendKey('Enter', 13)}
                  title="OK / Enter"
                >
                  <span>OK</span>
                </button>

                {/* RIGHT */}
                <button
                  className="dpad-btn dpad-right"
                  onClick={() => sendKey('ArrowRight', 39)}
                  title="Arrow Right"
                >
                  <ChevronRight size={24} />
                </button>

                {/* DOWN */}
                <button
                  className="dpad-btn dpad-down"
                  onClick={() => sendKey('ArrowDown', 40)}
                  title="Arrow Down"
                >
                  <ChevronDown size={24} />
                </button>
              </div>
            </div>

            {/* Channel & Volume Rockers */}
            <div className="remote-row rockers-row">
              <div className="rocker-group">
                <span className="rocker-label">CH</span>
                <button
                  className="rocker-btn"
                  onClick={() => sendKey('ArrowUp', 38)}
                  title="Channel Up"
                >
                  +
                </button>
                <button
                  className="rocker-btn"
                  onClick={() => sendKey('ArrowDown', 40)}
                  title="Channel Down"
                >
                  -
                </button>
              </div>

              <div className="remote-center-btn-col">
                <button
                  className="remote-btn circle home-btn"
                  onClick={() => sendKey('Escape', 27)}
                  title="Return / Home (Esc)"
                >
                  BACK
                </button>
                <button
                  className="remote-btn circle play-btn"
                  onClick={() => sendKey(' ', 32)}
                  title="Play / Pause (Space)"
                >
                  <Play size={14} fill="#fff" />
                </button>
              </div>

              <div className="rocker-group">
                <span className="rocker-label">VOL</span>
                <button
                  className="rocker-btn"
                  onClick={() => sendKey('VolumeUp', 175)}
                  title="Volume Up"
                >
                  +
                </button>
                <button
                  className="rocker-btn"
                  onClick={() => sendKey('VolumeDown', 174)}
                  title="Volume Down"
                >
                  -
                </button>
              </div>
            </div>

            {/* Keyboard Shortcuts Guide */}
            <div className="remote-shortcuts-hint">
              <div className="shortcut-title">
                <Keyboard size={12} />
                <span>PHYSICAL KEYBOARD</span>
              </div>
              <div className="shortcut-list">
                <div><kbd>Arrows</kbd> Navigate D-Pad</div>
                <div><kbd>Enter</kbd> OK / Play</div>
                <div><kbd>Esc</kbd> Back / Return</div>
                <div><kbd>Space</kbd> Pause / Play</div>
                <div><kbd>F</kbd> Fullscreen</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
