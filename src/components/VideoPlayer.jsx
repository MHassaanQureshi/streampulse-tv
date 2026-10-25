import React, { useEffect, useRef, useState, useCallback } from 'react'
import Hls from 'hls.js'
import { Capacitor } from '@capacitor/core'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Star,
  ChevronLeft,
  ChevronRight,
  Shield,
  Radio,
  Tv,
  ArrowLeft,
  Activity,
  Layers
} from 'lucide-react'

const isNative = typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform()

export default function VideoPlayer({
  channel,
  channelsList = [],
  currentIndex = 0,
  onClose,
  onChannelChange,
  isFavorite,
  onToggleFavorite,
  activeZone,
  setActiveZone
}) {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const osdTimerRef = useRef(null)

  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [aspectRatio, setAspectRatio] = useState('16:9') // '16:9', 'fill', '4:3'
  const [useProxy, setUseProxy] = useState(false)
  const [streamStatus, setStreamStatus] = useState('connecting') // 'connecting', 'playing', 'buffering', 'error'
  const [errorMessage, setErrorMessage] = useState('')
  const [showOsd, setShowOsd] = useState(true)
  const [showDiagnostics, setShowDiagnostics] = useState(false)
  const [stats, setStats] = useState({ bitrate: 0, buffer: 0, res: '1080p' })
  const [focusedControl, setFocusedControl] = useState(0) // 0: Play, 1: Prev, 2: Next, 3: Fav, 4: Aspect, 5: Proxy, 6: Close

  // Determine current stream URL (direct or via local proxy)
  const getStreamUrl = useCallback(() => {
    if (!channel?.url) return ''
    if (useProxy && !isNative) {
      // Use local high-speed built-in proxy on Vite/Node server
      return `/proxy?url=${encodeURIComponent(channel.url)}`
    }
    return channel.url
  }, [channel, useProxy])

  // Reset & show OSD with 4s auto-hide timer
  const touchOsd = useCallback(() => {
    setShowOsd(true)
    if (osdTimerRef.current) clearTimeout(osdTimerRef.current)
    osdTimerRef.current = setTimeout(() => {
      setShowOsd(false)
    }, 4500)
  }, [])

  // Initialize or update stream
  useEffect(() => {
    if (!channel || !videoRef.current) return

    setStreamStatus('connecting')
    setErrorMessage('')
    touchOsd()

    const video = videoRef.current
    const streamUrl = getStreamUrl()

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    // 7-second watchdog timer to eliminate infinite loading stalls
    const watchdogTimer = setTimeout(() => {
      if (video.paused || streamStatus === 'connecting') {
        if (!useProxy && !isNative) {
          console.log('Stream loading timeout on direct stream. Switching to local proxy...')
          setUseProxy(true)
        } else {
          setStreamStatus('error')
        }
      }
    }, 7000)

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false, // Standard mode prevents CPU clock sync burn on weak TV chips
        backBufferLength: 0,   // Instantly release played chunks from RAM to prevent TV browser OOM crash
        maxBufferLength: 6,    // 6s buffer ahead saves ~85% RAM on 512MB/1GB TVs
        maxMaxBufferLength: 10,
        maxBufferSize: 8 * 1024 * 1024, // Strict 8MB max buffer ceiling
        maxBufferHole: 0.5,
        highBufferWatchdogPeriod: 2,
        capLevelToPlayerSize: true,      // Limit stream decoding to actual TV screen resolution
        fragLoadingTimeOut: 8000,
        manifestLoadingTimeOut: 8000
      })

      hlsRef.current = hls
      hls.loadSource(streamUrl)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        video.play().then(() => {
          setStreamStatus('playing')
          setIsPlaying(true)
        }).catch(e => {
          // Modern browsers block autoplay with sound unless muted
          console.warn('Autoplay blocked with sound. Retrying muted:', e)
          video.muted = true
          setIsMuted(true)
          video.play().then(() => {
            setStreamStatus('playing')
            setIsPlaying(true)
          }).catch(err => {
            console.warn('User gesture required:', err)
            setIsPlaying(false)
          })
        })
      })

      hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
        setStreamStatus('playing')
        if (data.details.totalduration) {
          const bit = data.details.averagetargetduration || 0
          setStats(s => ({ ...s, bitrate: Math.round(bit * 800) }))
        }
      })

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.warn('HLS Event Error:', data)
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // If direct stream was blocked by CORS, auto-switch to Local Proxy seamlessly (web only)
              if (!useProxy && !isNative) {
                console.log('Stream CORS/network blocked. Auto-activating Local Proxy...')
                setStreamStatus('buffering')
                setUseProxy(true)
              } else {
                setStreamStatus('error')
                hls.startLoad()
              }
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              setStreamStatus('buffering')
              hls.recoverMediaError()
              break
            default:
              setStreamStatus('error')
              hls.destroy()
              break
          }
        }
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS for Safari & certain TV webOS/Tizen browsers
      video.src = streamUrl
      video.addEventListener('loadedmetadata', () => {
        video.play().then(() => {
          setStreamStatus('playing')
        }).catch(() => {
          video.muted = true
          setIsMuted(true)
          video.play().catch(() => setIsPlaying(false))
        })
      })
      video.addEventListener('error', () => {
        if (!useProxy) {
          setUseProxy(true)
        } else {
          setStreamStatus('error')
        }
      })
    } else {
      setStreamStatus('error')
      setErrorMessage('Your browser / TV engine does not support HLS streaming.')
    }

    return () => {
      clearTimeout(watchdogTimer)
      if (hlsRef.current) {
        try {
          hlsRef.current.stopLoad()
          hlsRef.current.destroy()
        } catch (e) {}
        hlsRef.current = null
      }
      if (video) {
        try {
          video.pause()
          video.removeAttribute('src')
          video.load() // Immediately releases hardware video decoder in TV chip
        } catch (e) {}
      }
      if (osdTimerRef.current) {
        clearTimeout(osdTimerRef.current)
      }
    }
  }, [channel, useProxy, getStreamUrl, touchOsd])

  // Play / Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
    touchOsd()
  }

  // Previous & Next Channel handlers
  const handlePrevChannel = () => {
    if (channelsList.length === 0) return
    const prevIdx = (currentIndex - 1 + channelsList.length) % channelsList.length
    onChannelChange(channelsList[prevIdx], prevIdx)
    touchOsd()
  }

  const handleNextChannel = () => {
    if (channelsList.length === 0) return
    const nextIdx = (currentIndex + 1) % channelsList.length
    onChannelChange(channelsList[nextIdx], nextIdx)
    touchOsd()
  }

  // Aspect ratio cycle
  const cycleAspectRatio = () => {
    const modes = ['16:9', 'fill', '4:3']
    const next = modes[(modes.indexOf(aspectRatio) + 1) % modes.length]
    setAspectRatio(next)
    touchOsd()
  }

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) document.exitFullscreen()
      setIsFullscreen(false)
    }
    touchOsd()
  }

  // Remote key controller when player is active
  useEffect(() => {
    const handlePlayerKeys = (e) => {
      const key = e.key
      const code = e.keyCode

      // Wake OSD on any interaction
      touchOsd()

      // Back / Escape key returns to channel grid (webOS 461, Tizen 10009/10182, Android TV 4/27/8)
      if (key === 'Escape' || key === 'Backspace' || code === 27 || code === 8 || code === 461 || code === 10009 || code === 4 || code === 10182) {
        e.preventDefault()
        onClose()
        return
      }

      // Quick channel flipping with ArrowUp / ArrowDown / TV Channel Up / TV Channel Down
      if (key === 'ArrowUp' || code === 38 || code === 427 || code === 33 || code === 166) {
        e.preventDefault()
        handleNextChannel()
        return
      }
      if (key === 'ArrowDown' || code === 40 || code === 428 || code === 34 || code === 167) {
        e.preventDefault()
        handlePrevChannel()
        return
      }

      // Left / Right to cycle player controls
      if (key === 'ArrowLeft' || code === 37) {
        e.preventDefault()
        setFocusedControl(prev => Math.max(0, prev - 1))
        return
      }
      if (key === 'ArrowRight' || code === 39) {
        e.preventDefault()
        setFocusedControl(prev => Math.min(6, prev + 1))
        return
      }

      // Space / OK / Enter / Media Play/Pause
      if (key === ' ' || key === 'Enter' || code === 13 || code === 415 || code === 19 || code === 23 || code === 66 || code === 85 || code === 10252) {
        e.preventDefault()
        // Execute action based on focused control
        switch (focusedControl) {
          case 0: togglePlay(); break
          case 1: handlePrevChannel(); break
          case 2: handleNextChannel(); break
          case 3: onToggleFavorite(channel); break
          case 4: cycleAspectRatio(); break
          case 5: setUseProxy(!useProxy); break
          case 6: onClose(); break
          default: togglePlay(); break
        }
      }

      // Quick keys
      if (key === 'f' || key === 'F') toggleFullscreen()
      if (key === 'm' || key === 'M') setIsMuted(!isMuted)
    }

    window.addEventListener('keydown', handlePlayerKeys)
    return () => window.removeEventListener('keydown', handlePlayerKeys)
  }, [focusedControl, useProxy, channel, currentIndex, channelsList, isMuted, touchOsd, onClose, onToggleFavorite])

  // Get CSS object-fit for aspect ratio
  const getObjectFitStyle = () => {
    if (aspectRatio === 'fill') return 'cover'
    if (aspectRatio === '4:3') return 'contain'
    return 'contain'
  }

  return (
    <div
      className={`tv-player-container ${isFullscreen ? 'is-fullscreen' : ''}`}
      onMouseMove={touchOsd}
      onClick={touchOsd}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="tv-video-element"
        style={{ objectFit: getObjectFitStyle() }}
        playsInline
        muted={isMuted}
        onWaiting={() => setStreamStatus('buffering')}
        onPlaying={() => setStreamStatus('playing')}
      />

      {/* Buffering & Error Overlay */}
      {streamStatus === 'connecting' && (
        <div className="player-status-badge">
          <div className="spinner" />
          <span>Tuning into {channel.name}...</span>
        </div>
      )}

      {streamStatus === 'buffering' && (
        <div className="player-status-badge">
          <div className="spinner" />
          <span>Buffering Live Stream...</span>
        </div>
      )}

      {streamStatus === 'error' && (
        <div className="player-status-badge player-error-badge">
          <Radio size={22} color="#ef4444" />
          <span>Not Available</span>
        </div>
      )}

      {/* OSD (On-Screen Display) */}
      <div className={`tv-osd ${showOsd ? 'visible' : 'hidden'}`}>
        {/* Top Bar: Channel Header */}
        <div className="osd-top-bar">
          <button
            className={`osd-back-btn ${focusedControl === 6 ? 'focused' : ''}`}
            onClick={onClose}
            title="Back to Channels (Esc)"
          >
            <ArrowLeft size={22} />
            <span>Channels</span>
          </button>

          <div className="osd-channel-info">
            {channel.logo && (
              <img src={channel.logo} alt="" className="osd-logo" onError={(e) => { e.target.style.display = 'none' }} />
            )}
            <div>
              <div className="osd-channel-title">
                {channel.name}
                <span className="live-indicator">● LIVE</span>
                {channel.resolution && <span className="quality-pill">{channel.resolution}</span>}
                {useProxy && <span className="proxy-pill">PROXY</span>}
              </div>
              <div className="osd-channel-genre">{channel.group || 'Live Stream'} • Channel {currentIndex + 1} of {channelsList.length}</div>
            </div>
          </div>

          <div className="osd-clock">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="osd-bottom-bar">
          <div className="osd-controls-row">
            {/* Play/Pause */}
            <button
              className={`osd-btn primary ${focusedControl === 0 ? 'focused' : ''}`}
              onClick={togglePlay}
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause size={22} /> : <Play size={22} />}
            </button>

            {/* Previous Channel */}
            <button
              className={`osd-btn ${focusedControl === 1 ? 'focused' : ''}`}
              onClick={handlePrevChannel}
              title="Previous Channel (Down / PageDown)"
            >
              <ChevronLeft size={22} />
              <span>Prev</span>
            </button>

            {/* Next Channel */}
            <button
              className={`osd-btn ${focusedControl === 2 ? 'focused' : ''}`}
              onClick={handleNextChannel}
              title="Next Channel (Up / PageUp)"
            >
              <span>Next</span>
              <ChevronRight size={22} />
            </button>

            {/* Favorite */}
            <button
              className={`osd-btn ${focusedControl === 3 ? 'focused' : ''} ${isFavorite ? 'active-fav' : ''}`}
              onClick={() => onToggleFavorite(channel)}
              title="Toggle Favorite (F)"
            >
              <Star size={20} fill={isFavorite ? '#fbbf24' : 'none'} color={isFavorite ? '#fbbf24' : '#fff'} />
            </button>

            {/* Aspect Ratio */}
            <button
              className={`osd-btn ${focusedControl === 4 ? 'focused' : ''}`}
              onClick={cycleAspectRatio}
              title="Cycle Aspect Ratio"
            >
              <Layers size={18} />
              <span>{aspectRatio.toUpperCase()}</span>
            </button>

            {/* CORS Proxy Switch */}
            <button
              className={`osd-btn ${focusedControl === 5 ? 'focused' : ''} ${useProxy ? 'active' : ''}`}
              onClick={() => setUseProxy(!useProxy)}
              title="Toggle Stream Proxy"
            >
              <Shield size={18} color={useProxy ? '#38bdf8' : '#94a3b8'} />
              <span>{useProxy ? 'Proxy ON' : 'Proxy OFF'}</span>
            </button>

            {/* Volume Mute */}
            <button
              className="osd-btn"
              onClick={() => setIsMuted(!isMuted)}
              title="Mute / Unmute (M)"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            {/* Fullscreen */}
            <button
              className="osd-btn"
              onClick={toggleFullscreen}
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>

          {/* Quick TV Remote Guide Hint */}
          <div className="osd-hints-bar">
            <span><kbd>▲</kbd> <kbd>▼</kbd> Change Channel</span>
            <span><kbd>◄</kbd> <kbd>►</kbd> Controls</span>
            <span><kbd>OK</kbd> Select</span>
            <span><kbd>BACK</kbd> Channels Grid</span>
          </div>
        </div>
      </div>
    </div>
  )
}
