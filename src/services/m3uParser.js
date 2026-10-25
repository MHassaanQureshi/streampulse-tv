// Fast M3U parser tailored for Smart TV performance and iptv-org playlists

const CACHE_PREFIX = 'iptv_cache_'
const CACHE_TTL_MS = 1000 * 60 * 60 * 2 // 2 hours

export function parseM3U(m3uContent, sourceLabel = 'IPTV', defaultCountry = '') {
  if (!m3uContent || typeof m3uContent !== 'string') return []

  const lines = m3uContent.split(/\r?\n/)
  const channels = []
  let currentInfo = null

  // Pre-compiled regex patterns for speed
  const tvgIdRegex = /tvg-id="([^"]*)"/i
  const tvgNameRegex = /tvg-name="([^"]*)"/i
  const tvgLogoRegex = /tvg-logo="([^"]*)"/i
  const groupTitleRegex = /group-title="([^"]*)"/i
  const tvgCountryRegex = /tvg-country="([^"]*)"/i

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    if (line.startsWith('#EXTINF:')) {
      // Extract metadata
      const tvgIdMatch = line.match(tvgIdRegex)
      const tvgNameMatch = line.match(tvgNameRegex)
      const tvgLogoMatch = line.match(tvgLogoRegex)
      const groupMatch = line.match(groupTitleRegex)
      const countryMatch = line.match(tvgCountryRegex)

      // The channel title is after the last comma
      const commaIndex = line.lastIndexOf(',')
      let title = commaIndex !== -1 ? line.substring(commaIndex + 1).trim() : ''

      if (!title && tvgNameMatch) {
        title = tvgNameMatch[1].trim()
      }

      // Filter out explicitly dead, closed, or geo-blocked streams
      const isDead = /\[(?:offline|closed|dead|geo-blocked)\]/i.test(title) ||
                    (groupMatch && /\[(?:offline|closed|dead|geo-blocked)\]/i.test(groupMatch[1]))
      if (isDead) {
        currentInfo = null
        continue
      }

      // Robust Country Extraction: tvg-country, tvg-id format (.in@, .us@, etc.), or defaultCountry
      let country = countryMatch ? countryMatch[1].trim().toLowerCase() : ''
      if (!country && tvgIdMatch) {
        const idCountryMatch = tvgIdMatch[1].match(/\.([a-z]{2})(?:@|"|$)/i)
        if (idCountryMatch) {
          country = idCountryMatch[1].toLowerCase()
        }
      }
      if (!country && defaultCountry) {
        country = defaultCountry.toLowerCase()
      }

      // Detect resolution from title
      let resolution = 'SD'
      if (/4k|2160p/i.test(title)) resolution = '4K'
      else if (/1080p|fhd/i.test(title)) resolution = '1080p'
      else if (/720p|hd/i.test(title)) resolution = '720p'

      currentInfo = {
        tvgId: tvgIdMatch ? tvgIdMatch[1] : '',
        name: title || 'Unknown Channel',
        logo: tvgLogoMatch ? tvgLogoMatch[1] : '',
        group: groupMatch ? groupMatch[1].trim() : sourceLabel,
        country: country || '',
        resolution
      }
    } else if (line.startsWith('http://') || line.startsWith('https://')) {
      if (currentInfo) {
        channels.push({
          id: `ch_${channels.length + 1}_${currentInfo.tvgId || Math.random().toString(36).slice(2, 7)}`,
          name: currentInfo.name,
          logo: currentInfo.logo,
          group: currentInfo.group,
          country: currentInfo.country,
          resolution: currentInfo.resolution,
          url: line
        })
        currentInfo = null
      }
    }
  }

  return channels
}

// High-speed in-memory cache for Smart TV memory efficiency (avoids localStorage quota exceptions)
const memoryCache = new Map()

export async function fetchAndParsePlaylist(url, sourceLabel = 'IPTV', defaultCountry = '', maxChannels = 1500) {
  const cacheKey = `${url}_${defaultCountry}`
  
  // 1. Check instant in-memory cache
  if (memoryCache.has(cacheKey)) {
    const cached = memoryCache.get(cacheKey)
    if (Date.now() - cached.timestamp < CACHE_TTL_MS && cached.data?.length > 0) {
      return cached.data
    }
  }

  // Fetch playlist with timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 20000)

  try {
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch playlist: ${response.status} ${response.statusText}`)
    }

    const text = await response.text()
    let channels = parseM3U(text, sourceLabel, defaultCountry)

    // Cap channels per playlist category to prevent TV memory overload
    if (channels.length > maxChannels) {
      channels = channels.slice(0, maxChannels)
    }

    // Save to memory cache
    memoryCache.set(cacheKey, {
      timestamp: Date.now(),
      data: channels
    })

    return channels
  } catch (err) {
    clearTimeout(timeoutId)
    throw err
  }
}
