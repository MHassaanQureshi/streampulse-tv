import React from 'react'
import { Star, Tv } from 'lucide-react'

// Pre-compiled helper outside component to avoid allocations
function getInitials(name) {
  if (!name) return 'TV'
  const words = name.replace(/[^a-zA-Z0-9 ]/g, '').trim().split(/\s+/)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

const ChannelCard = React.memo(function ChannelCard({
  channel,
  index,
  globalIndex,
  isFocused,
  isFavorite,
  onSelect,
  onToggleFavorite
}) {
  const handleClick = React.useCallback(() => {
    onSelect(channel, globalIndex !== undefined ? globalIndex : index)
  }, [channel, globalIndex, index, onSelect])

  return (
    <div
      data-nav={`channel-${index}`}
      onClick={handleClick}
      className={`channel-card ${isFocused ? 'focused' : ''}`}
      tabIndex={0}
      role="button"
      aria-label={`Watch ${channel.name}`}
    >
      {/* Channel Header Badges */}
      <div className="channel-card-top">
        <span className="live-pill">
          <span className="live-dot" /> LIVE
        </span>
        
        {channel.resolution && (
          <span className="badge-quality">{channel.resolution}</span>
        )}

        <button
          className={`fav-btn ${isFavorite ? 'is-fav' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(channel)
          }}
          title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          tabIndex={-1}
        >
          <Star size={16} fill={isFavorite ? '#fbbf24' : 'none'} color={isFavorite ? '#fbbf24' : '#94a3b8'} />
        </button>
      </div>

      {/* Channel Logo / Monogram */}
      <div className="channel-logo-container">
        {channel.logo ? (
          <>
            <img
              src={channel.logo}
              alt=""
              className="channel-logo-img"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              width="60"
              height="60"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const fallback = e.currentTarget.nextElementSibling
                if (fallback) fallback.style.display = 'flex'
              }}
            />
            <div className="channel-monogram" style={{ display: 'none' }}>
              <span className="monogram-text">{getInitials(channel.name)}</span>
              <Tv size={14} className="monogram-icon" />
            </div>
          </>
        ) : (
          <div className="channel-monogram">
            <span className="monogram-text">{getInitials(channel.name)}</span>
            <Tv size={14} className="monogram-icon" />
          </div>
        )}
      </div>

      {/* Channel Details */}
      <div className="channel-meta">
        <h3 className="channel-name" title={channel.name}>
          {channel.name}
        </h3>
        <div className="channel-sub">
          <span className="channel-group">{channel.group || 'Live Stream'}</span>
          {channel.country && <span className="channel-country">{channel.country.toUpperCase()}</span>}
        </div>
      </div>

      {/* Remote Focus Glow Ring */}
      <div className="focus-indicator-border" />
    </div>
  )
})

export default ChannelCard
