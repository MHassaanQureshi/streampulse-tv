import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import { defineConfig } from 'vite'

function iptvProxyPlugin() {
  return {
    name: 'iptv-local-proxy',
    configureServer(server) {
      server.middlewares.use('/proxy', async (req, res) => {
        try {
          const reqUrl = new URL(req.url, 'http://localhost:3000')
          const targetUrl = reqUrl.searchParams.get('url')

          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', '*')

          if (req.method === 'OPTIONS') {
            res.writeHead(204)
            res.end()
            return
          }

          if (!targetUrl) {
            res.writeHead(400, { 'Content-Type': 'text/plain' })
            res.end('Missing url parameter')
            return
          }

          const response = await fetch(targetUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': '*/*'
            }
          })

          const contentType = response.headers.get('content-type') || ''
          const isM3U8 = targetUrl.includes('.m3u8') || contentType.includes('mpegurl')

          if (isM3U8) {
            const text = await response.text()
            // Rewrite all chunk URLs in the m3u8 playlist to route through our local proxy
            const rewritten = text.split('\n').map(line => {
              const trimmed = line.trim()
              if (!trimmed || trimmed.startsWith('#')) return line
              try {
                const absolute = new URL(trimmed, targetUrl).href
                return `/proxy?url=${encodeURIComponent(absolute)}`
              } catch (e) {
                return line
              }
            }).join('\n')

            res.writeHead(response.status, {
              'Content-Type': 'application/vnd.apple.mpegurl',
              'Access-Control-Allow-Origin': '*'
            })
            res.end(rewritten)
          } else {
            // Binary segment (.ts, .m4s, .mp4, audio, etc.)
            const arrayBuf = await response.arrayBuffer()
            res.writeHead(response.status, {
              'Content-Type': contentType || 'video/MP2T',
              'Access-Control-Allow-Origin': '*'
            })
            res.end(Buffer.from(arrayBuf))
          }
        } catch (err) {
          console.error('[IPTV Proxy Error]', err.message)
          res.writeHead(502, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' })
          res.end('Proxy Fetch Error: ' + err.message)
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'chrome >= 49', 'firefox >= 52', 'edge >= 15', 'safari >= 10', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderModernChunks: false
    }),
    iptvProxyPlugin()
  ],
  server: {
    host: true, // Exposes on local network so Smart TV can access
    port: 3000,
  },
})




