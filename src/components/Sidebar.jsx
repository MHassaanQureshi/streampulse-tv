import React from 'react'
import {
  Sparkles,
  Newspaper,
  Trophy,
  Film,
  Tv,
  Baby,
  Music,
  Compass,
  Smile,
  Globe,
  Star,
  Search,
  PlusCircle,
  Tv2,
  Settings,
  HelpCircle,
  X
} from 'lucide-react'

// Icon lookup map
const ICONS = {
  Sparkles,
  Newspaper,
  Trophy,
  Film,
  Tv,
  Baby,
  Music,
  Compass,
  Smile,
  Globe
}

export default function Sidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  activeZone,
  sidebarIndex,
  favoritesCount = 0,
  isOpen = false,
  onClose,
  onOpenSearch,
  onOpenCustomPlaylist,
  onOpenTvGuide,
  onOpenSettings,
  onToggleRemote
}) {
  const handleSelect = (catId) => {
    onSelectCategory(catId)
    if (onClose) onClose()
  }

  const handleAction = (actionFn) => {
    if (actionFn) actionFn()
    if (onClose) onClose()
  }

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-label="Close sidebar navigation"
        />
      )}

      <aside className={`tv-sidebar ${activeZone === 'sidebar' ? 'zone-active' : ''} ${isOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo-badge">
            <Tv2 size={24} className="brand-icon" />
            <span className="brand-pulse-beacon" />
          </div>
          <div className="brand-text">
            <span className="brand-title">StreamPulse</span>
            <span className="brand-tag">Smart TV & Mobile</span>
          </div>
          {/* Mobile Collapse / Close Button */}
          <button
            className="sidebar-mobile-close-btn"
            onClick={onClose}
            aria-label="Close sidebar menu"
          >
            <X size={20} />
          </button>
        </div>

      {/* Main Categories Navigation */}
      <div className="sidebar-scroll-area">
        <div className="sidebar-section-title">CHANNELS & GENRES</div>
        
        <nav className="sidebar-nav">
          {categories.map((cat, idx) => {
            const IconComponent = ICONS[cat.icon] || Tv
            const isSelected = selectedCategory === cat.id
            const isFocused = activeZone === 'sidebar' && sidebarIndex === idx

            return (
              <button
                key={cat.id}
                data-nav={`sidebar-${idx}`}
                onClick={() => handleSelect(cat.id)}
                className={`sidebar-nav-item ${isSelected ? 'active' : ''} ${isFocused ? 'focused' : ''}`}
                tabIndex={-1}
              >
                <div className="nav-icon-box">
                  <IconComponent size={20} />
                </div>
                <span className="nav-label">{cat.name}</span>
                {isSelected && <span className="nav-active-pill" />}
              </button>
            )
          })}

          <div className="sidebar-section-title">LIBRARY & TOOLS</div>

          {/* Favorites */}
          <button
            data-nav={`sidebar-${categories.length}`}
            onClick={() => handleSelect('favorites')}
            className={`sidebar-nav-item ${selectedCategory === 'favorites' ? 'active' : ''} ${activeZone === 'sidebar' && sidebarIndex === categories.length ? 'focused' : ''}`}
            tabIndex={-1}
          >
            <div className="nav-icon-box">
              <Star size={20} color="#fbbf24" fill={selectedCategory === 'favorites' ? '#fbbf24' : 'none'} />
            </div>
            <span className="nav-label">My Favorites</span>
            {favoritesCount > 0 && (
              <span className="fav-counter">{favoritesCount}</span>
            )}
          </button>

          {/* Search */}
          <button
            data-nav={`sidebar-${categories.length + 1}`}
            onClick={() => handleAction(onOpenSearch)}
            className={`sidebar-nav-item ${activeZone === 'sidebar' && sidebarIndex === categories.length + 1 ? 'focused' : ''}`}
            tabIndex={-1}
          >
            <div className="nav-icon-box">
              <Search size={20} />
            </div>
            <span className="nav-label">Search Channels</span>
          </button>

          {/* Add Custom M3U */}
          <button
            data-nav={`sidebar-${categories.length + 2}`}
            onClick={() => handleAction(onOpenCustomPlaylist)}
            className={`sidebar-nav-item ${activeZone === 'sidebar' && sidebarIndex === categories.length + 2 ? 'focused' : ''}`}
            tabIndex={-1}
          >
            <div className="nav-icon-box">
              <PlusCircle size={20} />
            </div>
            <span className="nav-label">Add Custom M3U</span>
          </button>

          {/* TV Connect Guide */}
          <button
            data-nav={`sidebar-${categories.length + 3}`}
            onClick={() => handleAction(onOpenTvGuide)}
            className={`sidebar-nav-item ${activeZone === 'sidebar' && sidebarIndex === categories.length + 3 ? 'focused' : ''}`}
            tabIndex={-1}
          >
            <div className="nav-icon-box">
              <HelpCircle size={20} color="#38bdf8" />
            </div>
            <span className="nav-label">Smart TV Setup</span>
          </button>
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-hint">
          <span className="key-badge">D-PAD</span>
          <span>to Navigate</span>
          <span className="key-badge">OK</span>
          <span>to Select</span>
        </div>
      </div>
    </aside>
  </>
  )
}
