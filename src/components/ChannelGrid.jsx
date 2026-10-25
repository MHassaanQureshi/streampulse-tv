import React, { useState, useEffect } from 'react'
import ChannelCard from './ChannelCard'
import { Tv, RefreshCw, Search, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'

const PAGE_SIZE = 20 // 20 cards in DOM = 60FPS on low-end Smart TV processors

const ChannelGrid = React.memo(function ChannelGrid({
  channels = [],
  isLoading,
  error,
  categoryTitle,
  selectedCategory,
  channelIndex,
  activeZone,
  favorites = [],
  onSelectChannel,
  onToggleFavorite,
  onRetry,
  searchQuery,
  onSearchChange,
  countryPresets = [],
  selectedCountry,
  onSelectCountry,
  currentPage = 0,
  onPageChange
}) {
  const favSet = React.useMemo(() => {
    const s = new Set()
    for (let i = 0; i < favorites.length; i++) {
      if (favorites[i].id) s.add(favorites[i].id)
      if (favorites[i].url) s.add(favorites[i].url)
    }
    return s
  }, [favorites])

  const totalPages = Math.max(1, Math.ceil(channels.length / PAGE_SIZE))

  // Paginated slice for current page
  const pageStart = currentPage * PAGE_SIZE
  const pageChannels = channels.slice(pageStart, pageStart + PAGE_SIZE)

  return (
    <main className={`channel-grid-container ${activeZone === 'channels' ? 'zone-active' : ''}`}>
      {/* Top Banner / Filter Bar */}
      <header className="grid-header">
        <div className="header-titles">
          <h1 className="category-title">{categoryTitle}</h1>
          <span className="channel-count-badge">
            {isLoading ? 'Loading...' : `${channels.length} Channels`}
          </span>
          {totalPages > 1 && (
            <span className="page-indicator-pill">
              Page {currentPage + 1} of {totalPages}
            </span>
          )}
        </div>

        {/* Search input field */}
        <div className="header-search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search channels, genres..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => onSearchChange('')}>
              ×
            </button>
          )}
        </div>
      </header>

      {/* Country Filter Chips (when viewing Featured or News or All) */}
      {countryPresets.length > 0 && selectedCategory !== 'favorites' && (
        <div className="country-filter-strip">
          <button
            className={`country-chip ${!selectedCountry ? 'active' : ''}`}
            onClick={() => onSelectCountry('')}
          >
            🌍 All Regions
          </button>
          {countryPresets.map(c => (
            <button
              key={c.code}
              className={`country-chip ${selectedCountry === c.code ? 'active' : ''}`}
              onClick={() => onSelectCountry(c.code)}
            >
              <span>{c.flag}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid-state-message">
          <div className="spinner-large" />
          <h2>Fetching Live Playlist...</h2>
          <p>Downloading and indexing channels for Smart TV viewing</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="grid-state-message error">
          <AlertCircle size={48} color="#ef4444" />
          <h2>Unable to Load Playlist</h2>
          <p>{error}</p>
          <button className="btn-retry" onClick={onRetry}>
            <RefreshCw size={18} /> Retry Loading
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && channels.length === 0 && (
        <div className="grid-state-message empty">
          <Tv size={48} color="#64748b" />
          <h2>No Channels Found</h2>
          <p>
            {searchQuery
              ? `No channels match "${searchQuery}". Try a different search.`
              : selectedCategory === 'favorites'
              ? 'You have not added any favorite channels yet. Press the Star button on any channel!'
              : 'No channels available in this category.'}
          </p>
        </div>
      )}

      {/* Channel Grid (24 Cards at a time for Ultra Smooth 60FPS TV Performance) */}
      {!isLoading && !error && pageChannels.length > 0 && (
        <div className="channels-grid">
          {pageChannels.map((channel, idx) => {
            const isFocused = activeZone === 'channels' && channelIndex === idx
            return (
              <ChannelCard
                key={channel.id || `ch_${pageStart + idx}`}
                channel={channel}
                index={idx}
                globalIndex={pageStart + idx}
                isFocused={isFocused}
                isFavorite={favSet.has(channel.id) || favSet.has(channel.url)}
                onSelect={onSelectChannel}
                onToggleFavorite={onToggleFavorite}
              />
            )
          })}
        </div>
      )}

      {/* TV Pagination Navigation Bar */}
      {!isLoading && totalPages > 1 && (
        <div className="tv-pagination-bar">
          <button
            className={`btn-page-nav ${currentPage === 0 ? 'disabled' : ''}`}
            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            <ChevronLeft size={20} />
            <span>Previous Page</span>
          </button>

          <span className="pagination-text">
            Showing {pageStart + 1} - {Math.min(channels.length, pageStart + PAGE_SIZE)} of {channels.length}
          </span>

          <button
            className={`btn-page-nav ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}
            onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1}
          >
            <span>Next Page</span>
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </main>
  )
})

export default ChannelGrid
