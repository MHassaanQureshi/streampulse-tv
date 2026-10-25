// Storage service for Favorites, History, Custom Playlists and Settings

const FAVORITES_KEY = 'streampulse_favorites'
const RECENTS_KEY = 'streampulse_recents'
const CUSTOM_URLS_KEY = 'streampulse_custom_playlists'
const SETTINGS_KEY = 'streampulse_settings'

export function getFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

export function saveFavorites(favorites) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  } catch (e) {
    console.error('Failed to save favorites:', e)
  }
}

export function isFavorite(channelId, favorites = null) {
  const list = favorites || getFavorites()
  return list.some(ch => ch.id === channelId || (ch.url && ch.url === channelId))
}

export function toggleFavorite(channel) {
  const current = getFavorites()
  const exists = current.some(ch => ch.id === channel.id || ch.url === channel.url)
  let updated
  if (exists) {
    updated = current.filter(ch => ch.id !== channel.id && ch.url !== channel.url)
  } else {
    updated = [channel, ...current]
  }
  saveFavorites(updated)
  return updated
}

export function getRecentChannels() {
  try {
    const raw = localStorage.getItem(RECENTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

export function addRecentChannel(channel) {
  try {
    const current = getRecentChannels()
    const filtered = current.filter(ch => ch.id !== channel.id && ch.url !== channel.url)
    const updated = [channel, ...filtered].slice(0, 20) // Keep top 20
    localStorage.setItem(RECENTS_KEY, JSON.stringify(updated))
    return updated
  } catch (e) {
    return []
  }
}

export function getCustomPlaylists() {
  try {
    const raw = localStorage.getItem(CUSTOM_URLS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

export function addCustomPlaylist(name, url) {
  const current = getCustomPlaylists()
  const updated = [{ id: 'custom_' + Date.now(), name, url, count: 0 }, ...current]
  localStorage.setItem(CUSTOM_URLS_KEY, JSON.stringify(updated))
  return updated
}

export function getTvSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? JSON.parse(raw) : {
      useProxy: false,
      aspectRatio: '16:9',
      autoPlay: true,
      remoteSounds: true,
      debugOverlay: false
    }
  } catch (e) {
    return { useProxy: false, aspectRatio: '16:9', autoPlay: true }
  }
}

export function saveTvSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (e) {
    console.error('Failed to save settings:', e)
  }
}

