import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

/**
 * Plugin to serve .backend-port file from project root
 */
function backendPortPlugin() {
  return {
    name: 'backend-port-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/.backend-port') {
          const portFile = path.resolve(__dirname, '../.backend-port')
          if (fs.existsSync(portFile)) {
            const content = fs.readFileSync(portFile, 'utf-8')
            res.setHeader('Content-Type', 'text/plain')
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
            res.end(content)
            return
          } else {
            res.statusCode = 404
            res.end('Backend port file not found')
            return
          }
        }
        next()
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), backendPortPlugin()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        // Try to read backend port dynamically
        configure: (proxy, options) => {
          const portFile = path.resolve(__dirname, '../.backend-port')
          if (fs.existsSync(portFile)) {
            try {
              const port = fs.readFileSync(portFile, 'utf-8').trim()
              if (port && !isNaN(parseInt(port))) {
                options.target = `http://localhost:${port}`
                console.log(`✓ Proxy configured for backend on port ${port}`)
              }
            } catch (error) {
              console.log('Could not read backend port, using default 5000')
            }
          }
        }
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
