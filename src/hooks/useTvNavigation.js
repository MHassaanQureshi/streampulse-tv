import { useState, useEffect, useCallback, useRef } from 'react'

// Synthesizes a soft, premium tactile audio tick on focus and select using Web Audio API
class TvSoundEffects {
  constructor() {
    this.ctx = null
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  playFocus() {
    try {
      this.init()
      if (!this.ctx) return
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.04)
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start()
      osc.stop(this.ctx.currentTime + 0.04)
    } catch (e) {
      // Audio might be blocked until first user gesture, ignore safely
    }
  }

  playSelect() {
    try {
      this.init()
      if (!this.ctx) return
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(587.33, this.ctx.currentTime) // D5
      osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.06) // A5
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start()
      osc.stop(this.ctx.currentTime + 0.1)
    } catch (e) {}
  }
}

export const tvSounds = new TvSoundEffects()

export function useTvNavigation({
  activeZone = 'channels', // 'sidebar' | 'channels' | 'player' | 'modal'
  setActiveZone,
  sidebarCount = 0,
  channelCount = 0,
  columnsCount = 4,
  onChannelSelect,
  onSidebarSelect,
  onBack,
  onNextPage,
  onPrevPage,
  canNextPage = false,
  canPrevPage = false,
  isPlaying = false,
  soundEnabled = true
}) {
  const [sidebarIndex, setSidebarIndex] = useState(0)
  const [channelIndex, setChannelIndex] = useState(0)
  const [playerControlIndex, setPlayerControlIndex] = useState(0)
  const lastActiveChannel = useRef(0)

  // Auto-scroll focused element into view with zero jank
  const scrollToFocused = useCallback((selector) => {
    const el = document.querySelector(selector)
    if (el) {
      el.scrollIntoView({
        behavior: 'auto', // Instant scroll is 10x faster on Smart TV hardware
        block: 'nearest',
        inline: 'nearest'
      })
    }
  }, [])

  // Handle Remote / Keyboard Events
  const handleKeyDown = useCallback((e) => {
    // TV Remote KeyCodes & standard Keyboard keys
    const key = e.key
    const code = e.keyCode

    const isUp = key === 'ArrowUp' || code === 38
    const isDown = key === 'ArrowDown' || code === 40
    const isLeft = key === 'ArrowLeft' || code === 37
    const isRight = key === 'ArrowRight' || code === 39
    const isEnter = key === 'Enter' || code === 13 || code === 10009 || code === 23 || code === 66 // Tizen, Android TV, OK
    const isBack = key === 'Escape' || key === 'Backspace' || code === 27 || code === 8 || code === 461 || code === 10009 || code === 4 || code === 10182 // webOS, Tizen, Android TV Return
    const isPageDown = key === 'PageDown' || code === 34 || code === 428 || code === 167 // Channel Down / Page Down
    const isPageUp = key === 'PageUp' || code === 33 || code === 427 || code === 166 // Channel Up / Page Up

    // Stop default scrolling on TV arrow keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', ' '].includes(key)) {
      e.preventDefault()
    }

    // 1. MODAL ZONE
    if (activeZone === 'modal') {
      if (isBack) {
        if (soundEnabled) tvSounds.playFocus()
        if (onBack) onBack()
      }
      return
    }

    // 2. PLAYER ZONE (Video is fullscreen / playing)
    if (activeZone === 'player') {
      if (isBack) {
        if (soundEnabled) tvSounds.playFocus()
        if (onBack) onBack()
        return
      }
      return
    }

    // 3. SIDEBAR ZONE
    if (activeZone === 'sidebar') {
      if (isUp) {
        setSidebarIndex(prev => {
          const next = Math.max(0, prev - 1)
          if (soundEnabled) tvSounds.playFocus()
          scrollToFocused(`[data-nav="sidebar-${next}"]`)
          return next
        })
      } else if (isDown) {
        setSidebarIndex(prev => {
          const next = Math.min(sidebarCount - 1, prev + 1)
          if (soundEnabled) tvSounds.playFocus()
          scrollToFocused(`[data-nav="sidebar-${next}"]`)
          return next
        })
      } else if (isRight) {
        // Jump from sidebar into channels
        if (channelCount > 0) {
          if (soundEnabled) tvSounds.playFocus()
          setActiveZone('channels')
          scrollToFocused(`[data-nav="channel-${lastActiveChannel.current}"]`)
        }
      } else if (isEnter) {
        if (soundEnabled) tvSounds.playSelect()
        if (onSidebarSelect) onSidebarSelect(sidebarIndex)
      }
      return
    }

    // 4. CHANNELS GRID ZONE
    if (activeZone === 'channels') {
      // Direct Page Navigation with Remote Channel / Page buttons
      if (isPageDown && canNextPage && onNextPage) {
        if (soundEnabled) tvSounds.playFocus()
        onNextPage(0)
        return
      }
      if (isPageUp && canPrevPage && onPrevPage) {
        if (soundEnabled) tvSounds.playFocus()
        onPrevPage(0)
        return
      }

      if (isLeft) {
        // If at the left-most column, shift focus into sidebar
        if (channelIndex % columnsCount === 0) {
          if (soundEnabled) tvSounds.playFocus()
          lastActiveChannel.current = channelIndex
          setActiveZone('sidebar')
          scrollToFocused(`[data-nav="sidebar-${sidebarIndex}"]`)
        } else {
          setChannelIndex(prev => {
            const next = Math.max(0, prev - 1)
            lastActiveChannel.current = next
            if (soundEnabled) tvSounds.playFocus()
            scrollToFocused(`[data-nav="channel-${next}"]`)
            return next
          })
        }
      } else if (isRight) {
        setChannelIndex(prev => {
          const next = Math.min(channelCount - 1, prev + 1)
          lastActiveChannel.current = next
          if (soundEnabled) tvSounds.playFocus()
          scrollToFocused(`[data-nav="channel-${next}"]`)
          return next
        })
      } else if (isUp) {
        if (channelIndex < columnsCount && canPrevPage && onPrevPage) {
          // Top row: auto-advance to previous page
          if (soundEnabled) tvSounds.playFocus()
          onPrevPage(channelIndex)
        } else {
          setChannelIndex(prev => {
            const next = Math.max(0, prev - columnsCount)
            lastActiveChannel.current = next
            if (soundEnabled) tvSounds.playFocus()
            scrollToFocused(`[data-nav="channel-${next}"]`)
            return next
          })
        }
      } else if (isDown) {
        if (channelIndex + columnsCount >= channelCount && canNextPage && onNextPage) {
          // Bottom row: auto-advance to next page
          if (soundEnabled) tvSounds.playFocus()
          onNextPage(channelIndex % columnsCount)
        } else {
          setChannelIndex(prev => {
            const next = Math.min(channelCount - 1, prev + columnsCount)
            lastActiveChannel.current = next
            if (soundEnabled) tvSounds.playFocus()
            scrollToFocused(`[data-nav="channel-${next}"]`)
            return next
          })
        }
      } else if (isEnter) {
        if (soundEnabled) tvSounds.playSelect()
        if (onChannelSelect) onChannelSelect(channelIndex)
      } else if (isBack) {
        if (soundEnabled) tvSounds.playFocus()
        setActiveZone('sidebar')
        scrollToFocused(`[data-nav="sidebar-${sidebarIndex}"]`)
      }
    }
  }, [
    activeZone,
    setActiveZone,
    sidebarIndex,
    channelIndex,
    sidebarCount,
    channelCount,
    columnsCount,
    onChannelSelect,
    onSidebarSelect,
    onBack,
    onNextPage,
    onPrevPage,
    canNextPage,
    canPrevPage,
    soundEnabled,
    scrollToFocused
  ])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return {
    sidebarIndex,
    setSidebarIndex,
    channelIndex,
    setChannelIndex,
    playerControlIndex,
    setPlayerControlIndex,
    scrollToFocused
  }
}
