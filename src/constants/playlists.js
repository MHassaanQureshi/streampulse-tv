// Curated and verified playlists from iptv-org
export const PLAYLIST_CATEGORIES = [
  { id: 'featured', name: 'Featured Channels', icon: 'Sparkles', url: null, description: 'Handpicked verified 24/7 global live streams' },
  { id: 'news', name: 'News', icon: 'Newspaper', url: 'https://iptv-org.github.io/iptv/categories/news.m3u', description: 'Global breaking news and headlines' },
  { id: 'sports', name: 'Sports', icon: 'Trophy', url: 'https://iptv-org.github.io/iptv/categories/sports.m3u', description: 'Live sports, highlights, and racing' },
  { id: 'movies', name: 'Movies & Cinema', icon: 'Film', url: 'https://iptv-org.github.io/iptv/categories/movies.m3u', description: 'Films, cinema, and blockbuster features' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Tv', url: 'https://iptv-org.github.io/iptv/categories/entertainment.m3u', description: 'General entertainment, series, and talk shows' },
  { id: 'animation', name: 'Animation & Kids', icon: 'Baby', url: 'https://iptv-org.github.io/iptv/categories/animation.m3u', description: 'Cartoons, anime, and family-friendly channels' },
  { id: 'music', name: 'Music', icon: 'Music', url: 'https://iptv-org.github.io/iptv/categories/music.m3u', description: 'Live concerts, hits, EDM, and music videos' },
  { id: 'documentary', name: 'Documentary', icon: 'Compass', url: 'https://iptv-org.github.io/iptv/categories/documentary.m3u', description: 'Wildlife, science, space, and history' },
  { id: 'comedy', name: 'Comedy', icon: 'Smile', url: 'https://iptv-org.github.io/iptv/categories/comedy.m3u', description: 'Stand-up, sitcoms, and comedy shows' },
  { id: 'all', name: 'All Global (index.m3u)', icon: 'Globe', url: 'https://iptv-org.github.io/iptv/index.m3u', description: 'Complete worldwide catalog (30,000+ channels)' }
]

export const COUNTRY_PRESETS = [
  { code: 'us', name: 'United States', flag: '🇺🇸', url: 'https://iptv-org.github.io/iptv/countries/us.m3u' },
  { code: 'uk', name: 'United Kingdom', flag: '🇬🇧', url: 'https://iptv-org.github.io/iptv/countries/uk.m3u' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦', url: 'https://iptv-org.github.io/iptv/countries/ca.m3u' },
  { code: 'in', name: 'India', flag: '🇮🇳', url: 'https://iptv-org.github.io/iptv/countries/in.m3u' },
  { code: 'pk', name: 'Pakistan', flag: '🇵🇰', url: 'https://iptv-org.github.io/iptv/countries/pk.m3u' },
  { code: 'au', name: 'Australia', flag: '🇦🇺', url: 'https://iptv-org.github.io/iptv/countries/au.m3u' },
  { code: 'de', name: 'Germany', flag: '🇩🇪', url: 'https://iptv-org.github.io/iptv/countries/de.m3u' },
  { code: 'fr', name: 'France', flag: '🇫🇷', url: 'https://iptv-org.github.io/iptv/countries/fr.m3u' },
  { code: 'es', name: 'Spain', flag: '🇪🇸', url: 'https://iptv-org.github.io/iptv/countries/es.m3u' },
  { code: 'it', name: 'Italy', flag: '🇮🇹', url: 'https://iptv-org.github.io/iptv/countries/it.m3u' },
  { code: 'br', name: 'Brazil', flag: '🇧🇷', url: 'https://iptv-org.github.io/iptv/countries/br.m3u' },
  { code: 'tr', name: 'Turkey', flag: '🇹🇷', url: 'https://iptv-org.github.io/iptv/countries/tr.m3u' }
]

// 100% verified, active 24/7 working live streams (Tested & Online)
export const FEATURED_CHANNELS = [
  {
    id: 'nasa-tv',
    name: 'NASA TV Live (Public)',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/300px-NASA_logo.svg.png',
    group: 'Science / Space',
    url: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8',
    resolution: '1080p',
    country: 'us'
  },
  {
    id: 'redbull-tv',
    name: 'Red Bull TV Sports',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Red_Bull_TV_logo.svg/320px-Red_Bull_TV_logo.svg.png',
    group: 'Sports / Extreme',
    url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    resolution: '1080p',
    country: 'int'
  },
  {
    id: 'dw-english',
    name: 'Deutsche Welle (DW) English',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Deutsche_Welle_symbol_2012.svg/320px-Deutsche_Welle_symbol_2012.svg.png',
    group: 'News',
    url: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8',
    resolution: '1080p',
    country: 'de'
  },
  {
    id: 'bloomberg-tv',
    name: 'Bloomberg Quicktake Live',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Bloomberg_Television_logo_2016.svg/320px-Bloomberg_Television_logo_2016.svg.png',
    group: 'Business / News',
    url: 'https://bloomberg.com/media-manifest/streams/us.m3u8',
    resolution: '1080p',
    country: 'us'
  },
  {
    id: '4sides-in',
    name: '4 SiDES TV Live',
    logo: 'https://jiotvimages.cdn.jio.com/dare_images/images/4sites.png',
    group: 'News',
    url: 'https://stream.ottlive.co.in/4sidestv/index.m3u8',
    resolution: '1080p',
    country: 'in'
  },
  {
    id: '7s-music-in',
    name: '7S Music HD',
    logo: 'https://i.imgur.com/zDiIhdN.png',
    group: 'Music',
    url: 'https://cdn.pishow.tv/ott/live/1257/master.m3u8',
    resolution: '720p',
    country: 'in'
  },
  {
    id: '9x-jalwa-in',
    name: '9X Jalwa Bollywood Hits',
    logo: 'https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_9X_JALWA/images/LOGO_HD/image.png',
    group: 'Music',
    url: 'https://wiselp.wiseplayout.com/9X_Jalwa/master.m3u8',
    resolution: '1080p',
    country: 'in'
  },
  {
    id: 'and-tv-in',
    name: '&TV Entertainment',
    logo: 'https://xstreamcp-assets-msp.streamready.in/assets/LIVETV/LIVECHANNEL/LIVETV_LIVETVCHANNEL_SYMANDTV/images/LOGO_HD/LOGO_HD_image.png',
    group: 'Entertainment',
    url: 'https://wiselp.wiseplayout.com/Zee_And_TV/master.m3u8',
    resolution: '720p',
    country: 'in'
  },
  {
    id: 'alright-tv-in',
    name: 'Alright! TV Entertainment',
    logo: 'https://jiotvimages.cdn.jio.com/dare_images/images/alrght.png',
    group: 'Entertainment',
    url: 'https://amg01281-9xmediapvtltd-alrighttv-samsungin-6x3qg.amagi.tv/playlist/amg01281-9xmediapvtltd-alrighttv-samsungin/playlist.m3u8',
    resolution: '1080p',
    country: 'in'
  },
  {
    id: '24news-in',
    name: '24 News Live',
    logo: 'https://sund-images.sunnxt.com/202222/300x300_24News_202222_d63feca0-79ae-47ea-b75a-66c17d456f4c.png',
    group: 'News',
    url: 'https://mumt07.tangotv.in/zHjX9OFlTWENTYFOURNEWS/index.m3u8',
    resolution: '720p',
    country: 'in'
  },
  {
    id: '2gb-news',
    name: '2GB News Live',
    logo: 'https://i.ibb.co/jwM8DFG/2GB-1.png',
    group: 'News',
    url: 'https://2gblive.akamaized.net/hls/live/2033805/2GB/index.m3u8',
    resolution: '1080p',
    country: 'au'
  },
  {
    id: '3cat-info',
    name: '3Cat Information HD',
    logo: 'https://i.imgur.com/YQvLPT1.png',
    group: 'News',
    url: 'https://directes-tv-int.3catdirectes.cat/live-origin/canal324-hls/master.m3u8',
    resolution: '1080p',
    country: 'es'
  }
]
