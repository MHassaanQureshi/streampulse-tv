import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { PLAYLIST_CATEGORIES, COUNTRY_PRESETS, FEATURED_CHANNELS } from './constants/playlists'
import { fetchAndParsePlaylist } from './services/m3uParser'
import {
  getFavorites,
  toggleFavorite,
  isFavorite,
  getCustomPlaylists,
  addCustomPlaylist,
  addRecentChannel
} from './services/storage'
import { useTvNavigation } from './hooks/useTvNavigation'
import Sidebar from './components/Sidebar'
import ChannelGrid from './components/ChannelGrid'
import VideoPlayer from './components/VideoPlayer'
import TvRemoteSimulator from './components/TvRemoteSimulator'
import TvConnectModal from './components/TvConnectModal'
import CustomPlaylistModal from './components/CustomPlaylistModal'
import SearchModal from './components/SearchModal'

export default function App() {
  // Navigation & View States
  const [activeZone, setActiveZone] = useState('channels') // 'channels', 'sidebar', 'player', 'modal'
  const [selectedCategory, setSelectedCategory] = useState('featured')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const PAGE_SIZE = 20

  // Channels Data States
  const [channels, setChannels] = useState(FEATURED_CHANNELS)
  const [favorites, setFavorites] = useState([])
  const [customPlaylists, setCustomPlaylists] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Player States
  const [activeChannel, setActiveChannel] = useState(null)
  const [activeChannelIndex, setActiveChannelIndex] = useState(0)

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCustomPlaylistOpen, setIsCustomPlaylistOpen] = useState(false)
  const [isTvGuideOpen, setIsTvGuideOpen] = useState(false)

  // Load initial storage data
  useEffect(() => {
    setFavorites(getFavorites())
    setCustomPlaylists(getCustomPlaylists())
  }, [])

  // Load channels when category or country changes
  const loadCategoryChannels = useCallback(async (catId, countryCode = '') => {
    setError(null)
    setCurrentPage(0)

    // 1. Featured Category
    if (catId === 'featured') {
      if (!countryCode) {
        setChannels(FEATURED_CHANNELS)
        setIsLoading(false)
        return
      }
      const hasFeaturedForCountry = FEATURED_CHANNELS.some(c => c.country === countryCode)
      if (hasFeaturedForCountry) {
        setChannels(FEATURED_CHANNELS)
        setIsLoading(false)
        return
      }
      // If no featured preset channels exist for that country, load the country playlist
      const countryObj = COUNTRY_PRESETS.find(c => c.code === countryCode)
      if (countryObj?.url) {
        setIsLoading(true)
        try {
          const list = await fetchAndParsePlaylist(countryObj.url, countryObj.name, countryCode)
          setChannels(list)
        } catch (err) {
          setError(`Could not load ${countryObj.name} playlist. Please check your internet connection.`)
        } finally {
          setIsLoading(false)
        }
        return
      }
    }

    // 2. Favorites Category
    if (catId === 'favorites') {
      const favs = getFavorites()
      setFavorites(favs)
      setChannels(favs)
      setIsLoading(false)
      return
    }

    // 3. All Category with specific Country
    if (catId === 'all' && countryCode) {
      const countryObj = COUNTRY_PRESETS.find(c => c.code === countryCode)
      if (countryObj?.url) {
        setIsLoading(true)
        try {
          const list = await fetchAndParsePlaylist(countryObj.url, countryObj.name, countryCode)
          setChannels(list)
        } catch (err) {
          setError(`Could not load ${countryObj.name} playlist. Please check your internet connection.`)
        } finally {
          setIsLoading(false)
        }
        return
      }
    }

    // 4. Genre / Category Playlist (Entertainment, News, Sports, Movies, Animation, Music, etc.)
    const categoryObj = PLAYLIST_CATEGORIES.find(c => c.id === catId)
    if (categoryObj && categoryObj.url) {
      setIsLoading(true)
      try {
        const list = await fetchAndParsePlaylist(categoryObj.url, categoryObj.name)
        setChannels(list)
      } catch (err) {
        setError(`Failed to fetch ${categoryObj.name} streams. Please try again.`)
      } finally {
        setIsLoading(false)
      }
      return
    }

    // 5. Fallback: All Global
    if (catId === 'all') {
      setIsLoading(true)
      try {
        const list = await fetchAndParsePlaylist('https://iptv-org.github.io/iptv/index.m3u', 'All Global')
        setChannels(list)
      } catch (err) {
        setError('Failed to fetch global index.')
      } finally {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    loadCategoryChannels(selectedCategory, selectedCountry)
  }, [selectedCategory, selectedCountry, loadCategoryChannels])

  // Filter channels based on country and search query
  const filteredChannels = useMemo(() => {
    let result = channels

    // 1. Country Filter (filters channels by 2-letter country code)
    if (selectedCountry) {
      result = result.filter(ch => ch.country === selectedCountry)
    }

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(ch =>
        ch.name.toLowerCase().includes(query) ||
        (ch.group && ch.group.toLowerCase().includes(query)) ||
        (ch.country && ch.country.toLowerCase().includes(query))
      )
    }

    return result
  }, [channels, selectedCountry, searchQuery])

  // Visible channels on current page (max 24 for instant TV rendering)
  const currentDisplayChannels = useMemo(() => {
    const start = currentPage * PAGE_SIZE
    return filteredChannels.slice(start, start + PAGE_SIZE)
  }, [filteredChannels, currentPage])

  // Calculate total pages for current category
  const totalPages = Math.max(1, Math.ceil(filteredChannels.length / PAGE_SIZE))

  // Channel Selection Handler (Memoized to prevent card re-renders)
  const handleSelectChannel = useCallback((channel, index) => {
    setActiveChannel(channel)
    setActiveChannelIndex(index)
    setActiveZone('player')
    addRecentChannel(channel)
  }, [])

  // Favorite Toggle Handler
  const handleToggleFavorite = useCallback((channel) => {
    const updated = toggleFavorite(channel)
    setFavorites(updated)
    if (selectedCategory === 'favorites') {
      setChannels(updated)
    }
  }, [selectedCategory])

  // Category Selection
  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId)
    setSearchQuery('')
    setCurrentPage(0)
    setActiveZone('channels')
  }

  // Country Selection
  const handleSelectCountry = (code) => {
    setSelectedCountry(code)
    setCurrentPage(0)
    setActiveZone('channels')
  }

  // Add Custom Playlist
  const handleAddCustomPlaylist = (name, url) => {
    const updated = addCustomPlaylist(name, url)
    setCustomPlaylists(updated)
    setIsLoading(true)
    fetchAndParsePlaylist(url, name)
      .then(list => {
        setChannels(list)
        setSelectedCategory('custom')
        setCurrentPage(0)
        setActiveZone('channels')
      })
      .catch(err => {
        setError('Failed to load custom playlist: ' + err.message)
      })
      .finally(() => setIsLoading(false))
  }

  // Smart TV Spatial Navigation Hook
  const {
    sidebarIndex,
    setSidebarIndex,
    channelIndex,
    setChannelIndex
  } = useTvNavigation({
    activeZone,
    setActiveZone,
    sidebarCount: PLAYLIST_CATEGORIES.length + 4,
    channelCount: currentDisplayChannels.length,
    columnsCount: 4,
    canNextPage: currentPage < totalPages - 1,
    canPrevPage: currentPage > 0,
    onNextPage: (colIndex = 0) => {
      setCurrentPage(p => Math.min(totalPages - 1, p + 1))
      setChannelIndex(colIndex)
    },
    onPrevPage: (colIndex = 0) => {
      setCurrentPage(p => Math.max(0, p - 1))
      setChannelIndex(Math.min(PAGE_SIZE - 1, (Math.floor((PAGE_SIZE - 1) / 4) * 4) + (colIndex % 4)))
    },
    onChannelSelect: (idx) => {
      const realIndex = currentPage * PAGE_SIZE + idx
      if (filteredChannels[realIndex]) {
        handleSelectChannel(filteredChannels[realIndex], realIndex)
      }
    },
    onSidebarSelect: (idx) => {
      if (idx < PLAYLIST_CATEGORIES.length) {
        handleSelectCategory(PLAYLIST_CATEGORIES[idx].id)
      } else if (idx === PLAYLIST_CATEGORIES.length) {
        handleSelectCategory('favorites')
      } else if (idx === PLAYLIST_CATEGORIES.length + 1) {
        setIsSearchOpen(true)
      } else if (idx === PLAYLIST_CATEGORIES.length + 2) {
        setIsCustomPlaylistOpen(true)
      } else if (idx === PLAYLIST_CATEGORIES.length + 3) {
        setIsTvGuideOpen(true)
      }
    },
    onBack: () => {
      if (activeZone === 'player') {
        setActiveChannel(null)
        setActiveZone('channels')
      } else if (isSearchOpen || isCustomPlaylistOpen || isTvGuideOpen) {
        setIsSearchOpen(false)
        setIsCustomPlaylistOpen(false)
        setIsTvGuideOpen(false)
        setActiveZone('channels')
      } else if (activeZone === 'channels') {
        setActiveZone('sidebar')
      }
    },
    isPlaying: !!activeChannel,
    soundEnabled: false // Disabled for maximum Smart TV CPU responsiveness
  })

  // Category Title Helper
  const getCategoryTitle = () => {
    const catObj = PLAYLIST_CATEGORIES.find(c => c.id === selectedCategory)
    const catName = catObj ? catObj.name : 'Channels'
    const countryObj = COUNTRY_PRESETS.find(x => x.code === selectedCountry)

    if (selectedCategory === 'favorites') {
      return countryObj ? `Favorites (${countryObj.flag} ${countryObj.name})` : 'My Favorite Channels'
    }
    if (selectedCategory === 'custom') {
      return 'Custom Playlist Channels'
    }
    if (countryObj && selectedCategory !== 'all') {
      return `${countryObj.flag} ${countryObj.name} • ${catName}`
    }
    if (countryObj && selectedCategory === 'all') {
      return `${countryObj.flag} ${countryObj.name} Channels`
    }
    return catObj ? catObj.name : 'Live TV Channels'
  }

  return (
    <div className="tv-app-shell">
      {/* 1. Sidebar Navigation - Hidden during playback to save 100% TV GPU memory */}
      <div style={{ display: activeChannel ? 'none' : 'flex' }}>
        <Sidebar
          categories={PLAYLIST_CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          activeZone={activeZone}
          sidebarIndex={sidebarIndex}
          favoritesCount={favorites.length}
          onOpenSearch={() => {
            setIsSearchOpen(true)
            setActiveZone('modal')
          }}
          onOpenCustomPlaylist={() => {
            setIsCustomPlaylistOpen(true)
            setActiveZone('modal')
          }}
          onOpenTvGuide={() => {
            setIsTvGuideOpen(true)
            setActiveZone('modal')
          }}
          onOpenSettings={() => {
            setIsTvGuideOpen(true)
            setActiveZone('modal')
          }}
        />
      </div>

      {/* 2. Main Content: Channel Grid - Hidden during playback to save TV RAM & GPU fillrate */}
      <div style={{ display: activeChannel ? 'none' : 'flex', flex: 1, height: '100vh', overflow: 'hidden' }}>
        <ChannelGrid
          channels={filteredChannels}
          isLoading={isLoading}
          error={error}
          categoryTitle={getCategoryTitle()}
          selectedCategory={selectedCategory}
          channelIndex={channelIndex}
          activeZone={activeZone}
          favorites={favorites}
          onSelectChannel={handleSelectChannel}
          onToggleFavorite={handleToggleFavorite}
          onRetry={() => loadCategoryChannels(selectedCategory, selectedCountry)}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q)
            setCurrentPage(0)
          }}
          countryPresets={COUNTRY_PRESETS}
          selectedCountry={selectedCountry}
          onSelectCountry={handleSelectCountry}
          currentPage={currentPage}
          onPageChange={(p) => {
            setCurrentPage(p)
            setChannelIndex(0)
          }}
        />
      </div>

      {/* 3. Fullscreen Live Video Player (Active when channel selected) */}
      {activeChannel && (
        <VideoPlayer
          channel={activeChannel}
          channelsList={filteredChannels}
          currentIndex={activeChannelIndex}
          onClose={() => {
            setActiveChannel(null)
            setActiveZone('channels')
          }}
          onChannelChange={(ch, idx) => {
            setActiveChannel(ch)
            setActiveChannelIndex(idx)
            addRecentChannel(ch)
          }}
          isFavorite={isFavorite(activeChannel.id, favorites)}
          onToggleFavorite={handleToggleFavorite}
          activeZone={activeZone}
          setActiveZone={setActiveZone}
        />
      )}

      {/* 4. Interactive Virtual Smart TV Remote Simulator (PC Testing & Remote Help) */}
      <TvRemoteSimulator soundEnabled={true} />

      {/* 5. Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false)
          setActiveZone('channels')
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onExecuteSearch={() => {
          setIsSearchOpen(false)
          setActiveZone('channels')
        }}
      />

      <CustomPlaylistModal
        isOpen={isCustomPlaylistOpen}
        onClose={() => {
          setIsCustomPlaylistOpen(false)
          setActiveZone('channels')
        }}
        onAddPlaylist={handleAddCustomPlaylist}
      />

      <TvConnectModal
        isOpen={isTvGuideOpen}
        onClose={() => {
          setIsTvGuideOpen(false)
          setActiveZone('channels')
        }}
      />
    </div>
  )
}
