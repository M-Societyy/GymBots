const http = require('http')
const path = require('path')

const express = require('express')
const WebSocket = require('ws')
const { parsearComando } = require('../utils/command_parser')

function crearServidorWeb ({ logger, gestorBots, config }) {
  const webCfg = config?.sistema?.web ?? {}
  const habilitado = webCfg?.habilitado ?? false
  if (!habilitado) {
    return { iniciar: async () => {}, detener: async () => {}, url: null }
  }

  const host = webCfg?.host ?? '127.0.0.1'
  const port = Number(webCfg?.port ?? 3000)
  const token = webCfg?.token ? String(webCfg.token) : null
  const prefijo = config?.sistema?.prefijoComandos ?? '!'

  const app = express()
  const server = http.createServer(app)
  const wss = new WebSocket.Server({ server })

  function autorizadoHttp (req) {
    if (!token) return true
    const t = req.query?.token
    if (t && String(t) === token) return true
    const h = req.headers['x-gymbots-token']
    if (h && String(h) === token) return true
    return false
  }

  app.get('/health', (req, res) => {
    res.json({ ok: true })
  })

  app.get('/api/state', (req, res) => {
    if (!autorizadoHttp(req)) {
      res.status(401).json({ ok: false })
      return
    }
    res.json({ ok: true, state: gestorBots.obtenerEstadoGlobal() })
  })

  app.get('/config.js', (req, res) => {
    if (!autorizadoHttp(req)) {
      res.status(401).type('text/plain').send('unauthorized')
      return
    }
    res.type('application/javascript')
    res.send(`window.__GYMBOTS__ = window.__GYMBOTS__ || {}; window.__GYMBOTS__.token = ${token ? JSON.stringify(token) : 'null'};`)
  })

  const publicDir = path.join(__dirname, 'public')
  app.use(express.static(publicDir))

  function autorizadoWs (req) {
    if (!token) return true
    try {
      const url = new URL(req.url, `http://${req.headers.host}`)
      return url.searchParams.get('token') === token
    } catch {
      return false
    }
  }

  wss.on('connection', (ws, req) => {
    if (!autorizadoWs(req)) {
      try { ws.close(1008, 'unauthorized') } catch {}
      return
    }

    const enviarEstado = () => {
      if (ws.readyState !== WebSocket.OPEN) return
      const payload = {
        type: 'state',
        ts: Date.now(),
        data: gestorBots.obtenerEstadoGlobal()
      }
      ws.send(JSON.stringify(payload))
    }

    const intervalo = setInterval(enviarEstado, 500)

    ws.on('message', async (buf) => {
      let msg
      try {
        msg = JSON.parse(String(buf))
      } catch {
        return
      }

      if (msg?.type === 'cmd') {
        const botId = msg?.botId
        const raw = String(msg?.raw ?? '').trim()
        if (!raw) return

        const mensaje = raw.startsWith(prefijo) ? raw : `${prefijo}${raw}`
        const cmd = parsearComando({ prefijo, mensaje })
        if (!cmd) {
          ws.send(JSON.stringify({ type: 'ack', ok: false, error: 'comando inválido' }))
          return
        }

        try {
          if (botId === 'all') {
            const ids = gestorBots.listarBots()
            for (const id of ids) {
              await gestorBots.ejecutarComandoEnBot({ botId: id, comando: cmd.nombre, args: cmd.args, usuario: 'WEB', raw: mensaje })
            }
          } else {
            await gestorBots.ejecutarComandoEnBot({ botId, comando: cmd.nombre, args: cmd.args, usuario: 'WEB', raw: mensaje })
          }

          ws.send(JSON.stringify({ type: 'ack', ok: true }))
        } catch (err) {
          logger?.error('web', 'Fallo ejecutando comando web', err?.message)
          ws.send(JSON.stringify({ type: 'ack', ok: false, error: String(err?.message ?? err) }))
        }
      }
    })

    ws.on('close', () => {
      clearInterval(intervalo)
    })

    enviarEstado()
  })

  let escuchando = false

  return {
    url: `http://${host}:${port}`,
    iniciar: async () => {
      if (escuchando) return
      await new Promise((resolve, reject) => {
        server.listen(port, host, (err) => {
          if (err) return reject(err)
          escuchando = true
          resolve()
        })
      })
      logger?.info('web', `Control web: http://${host}:${port}`)
    },
    detener: async () => {
      if (!escuchando) return
      await new Promise((resolve) => {
        try {
          wss.close(() => {
            server.close(() => resolve())
          })
        } catch {
          try { server.close(() => resolve()) } catch { resolve() }
        }
      })
      escuchando = false
    }
  }
}

module.exports = {
  crearServidorWeb
}
