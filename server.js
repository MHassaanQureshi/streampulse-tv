// High-Performance Native Server for Smart TVs with built-in CORS Proxy
import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DIST_DIR = path.join(__dirname, 'dist')
const PORT = 3000

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.m3u8': 'application/vnd.apple.mpegurl',
  '.ts': 'video/MP2T'
}

const server = http.createServer(async (req, res) => {
  // CORS Headers for everything
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', '*')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`)

  // 1. BUILT-IN CORS STREAMING PROXY
  if (parsedUrl.pathname === '/proxy') {
    const targetUrl = parsedUrl.searchParams.get('url')
    if (!targetUrl) {
      res.writeHead(400, { 'Content-Type': 'text/plain' })
      res.end('Missing url parameter')
      return
    }

    try {
      const upstream = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*'
        }
      })

      const contentType = upstream.headers.get('content-type') || ''
      const isM3U8 = targetUrl.includes('.m3u8') || contentType.includes('mpegurl')

      if (isM3U8) {
        const text = await upstream.text()
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

        res.writeHead(upstream.status, {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Access-Control-Allow-Origin': '*'
        })
        res.end(rewritten)
      } else {
        const buf = Buffer.from(await upstream.arrayBuffer())
        res.writeHead(upstream.status, {
          'Content-Type': contentType || 'video/MP2T',
          'Access-Control-Allow-Origin': '*'
        })
        res.end(buf)
      }
    } catch (err) {
      console.error('[Proxy Error]', err.message)
      res.writeHead(502, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' })
      res.end('Proxy Error: ' + err.message)
    }
    return
  }

  // 2. STATIC FILE SERVER (dist/ directory)
  let filePath = path.join(DIST_DIR, parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname)

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA routing
      filePath = path.join(DIST_DIR, 'index.html')
    }

    const ext = path.extname(filePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end('Server Error')
        return
      }
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000'
      })
      res.end(content)
    })
  })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`StreamPulse Smart TV Server running on port ${PORT}`)
  console.log(`Local: http://localhost:${PORT}`)
  console.log(`TV Access: http://192.168.1.36:${PORT}`)
})
