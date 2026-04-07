const mineflayer = require('mineflayer')
const { pathfinder } = require('mineflayer-pathfinder')

const { esperar } = require('../utils/time')
const { crearContextoBot } = require('../core/context')
const { registrarEventosMineflayer } = require('../modules/eventos')
const { instalarChatComandos } = require('../modules/chat')
const { instalarEstado } = require('../modules/estado')
const { instalarBloques } = require('../modules/bloques')
const { instalarEntidades } = require('../modules/entidades')
const { instalarInventario } = require('../modules/inventario')
const { instalarMovimiento } = require('../modules/movimiento')
const { instalarAcciones } = require('../modules/acciones')

class GestorBots {
  constructor ({ logger, config, gestorPlugins, panel } = {}) {
    this.logger = logger
    this.config = config
    this.gestorPlugins = gestorPlugins
    this.panel = panel

    this.bots = new Map()
    this._onBotConectado = new Set()
    this._tick = 0
    this._eventosRecientes = 0
    this._erroresRecientes = 0

    setInterval(() => {
      this._tick++
      this._eventosRecientes = 0
      this._erroresRecientes = 0
    }, 1000).unref?.()
  }

  listarBots () {
    return Array.from(this.bots.keys()).sort()
  }

  obtenerEntrada (id) {
    return this.bots.get(id) ?? null
  }

  obtenerEntradas () {
    return Array.from(this.bots.values())
  }

  async ejecutarComandoEnBot ({ botId, comando, args, usuario = 'CONSOLE', raw = '' } = {}) {
    const entrada = this.obtenerEntrada(botId)
    if (!entrada?.contexto || !entrada?.bot) {
      throw new Error(`Bot no encontrado o no listo: ${botId}`)
    }

    const def = entrada.contexto.obtenerComando(String(comando ?? '').toLowerCase())
    if (!def) {
      throw new Error(`Comando desconocido: ${comando}`)
    }

    return def.ejecutar({
      bot: entrada.bot,
      contexto: entrada.contexto,
      usuario,
      args: Array.isArray(args) ? args : [],
      raw
    })
  }

  alConectarBot (fn) {
    if (typeof fn !== 'function') return () => {}
    this._onBotConectado.add(fn)
    return () => this._onBotConectado.delete(fn)
  }

  _emitirBotConectado (entrada) {
    for (const fn of this._onBotConectado) {
      try {
        fn(entrada)
      } catch (e) {
        this.logger?.error('sistema', 'Listener alConectarBot falló', e?.message)
      }
    }
  }

  obtenerEstadoGlobal () {
    return {
      tick: this._tick,
      eventosRecientes: this._eventosRecientes,
      erroresRecientes: this._erroresRecientes,
      bots: Array.from(this.bots.values()).map(e => e.contexto?.estadoPublico())
    }
  }

  async iniciarTodos () {
    const botsCfg = this.config?.bots ?? []
    for (const cfg of botsCfg) {
      await this.iniciarBot(cfg)
    }
  }

  async detenerTodos (motivo) {
    const entradas = Array.from(this.bots.values())
    for (const e of entradas) {
      try {
        e.contexto?.marcarCierreSolicitado(motivo)
        e.bot?.end(motivo)
      } catch {}
    }
    await esperar(250)
  }

  async iniciarBot (cfgBot) {
    const id = cfgBot?.id || cfgBot?.username
    if (!id) throw new Error('Bot sin id/username en configuración')

    if (this.bots.has(id)) {
      this.logger?.warn('bots', `Bot duplicado ignorado: ${id}`)
      return
    }

    const entrada = {
      id,
      cfg: cfgBot,
      bot: null,
      contexto: null,
      reinicios: 0
    }

    this.bots.set(id, entrada)
    await this._conectarEntrada(entrada)
  }

  async _conectarEntrada (entrada) {
    const { cfg } = entrada
    const servidor = this.config?.servidor ?? {}

    const opciones = {
      host: servidor.host,
      port: servidor.port,
      version: servidor.version,
      auth: servidor.auth,
      username: cfg.username,
      password: cfg.password ?? undefined
    }

    this.logger?.info('conexion', `Conectando bot ${entrada.id} -> ${opciones.host}:${opciones.port} (${opciones.auth})`)

    const bot = mineflayer.createBot(opciones)
    entrada.bot = bot

    const contexto = crearContextoBot({
      id: entrada.id,
      logger: this.logger,
      configGlobal: this.config,
      configBot: cfg,
      contadorEvento: () => { this._eventosRecientes++ },
      contadorError: () => { this._erroresRecientes++ }
    })

    entrada.contexto = contexto

    this._emitirBotConectado(entrada)

    if (cfg?.pathfinder?.habilitado) {
      bot.loadPlugin(pathfinder)
      contexto.marcarPlugin('pathfinder')
    }

    registrarEventosMineflayer({ bot, contexto })

    if (cfg?.modulos?.estado !== false) instalarEstado({ bot, contexto })
    if (cfg?.modulos?.chat !== false) instalarChatComandos({ bot, contexto })
    if (cfg?.modulos?.bloques !== false) instalarBloques({ bot, contexto })
    if (cfg?.modulos?.entidades !== false) instalarEntidades({ bot, contexto })
    if (cfg?.modulos?.inventario !== false) instalarInventario({ bot, contexto })
    if (cfg?.modulos?.movimiento !== false) instalarMovimiento({ bot, contexto })
    if (cfg?.modulos?.acciones !== false) instalarAcciones({ bot, contexto })

    this.gestorPlugins?.cargarParaBot({ bot, contexto })

    bot.once('spawn', () => {
      contexto.setConexion({ estado: 'conectado', servidor: `${opciones.host}:${opciones.port}` })
      this.logger?.info('conexion', `Bot conectado y spawneado: ${entrada.id}`)
    })

    bot.on('kicked', (reason) => {
      contexto.setConexion({ estado: 'expulsado', servidor: `${opciones.host}:${opciones.port}` })
      this.logger?.warn('conexion', `Bot expulsado: ${entrada.id}`, reason)
    })

    bot.on('error', (err) => {
      contexto.setConexion({ estado: 'error', servidor: `${opciones.host}:${opciones.port}` })
      this.logger?.error('conexion', `Error de bot: ${entrada.id}`, err?.message)
      this._erroresRecientes++
    })

    bot.on('end', async (reason) => {
      const cierre = contexto.cierreSolicitado()
      contexto.setConexion({ estado: cierre ? 'cerrado' : 'desconectado', servidor: `${opciones.host}:${opciones.port}` })
      this.logger?.warn('conexion', `Conexión finalizada: ${entrada.id}`, reason)

      if (cierre) return

      const rec = this.config?.sistema?.reconexion ?? {}
      if (!rec?.habilitada) return

      entrada.reinicios++
      const intentosMaximos = rec.intentosMaximos ?? 0
      if (intentosMaximos > 0 && entrada.reinicios > intentosMaximos) {
        this.logger?.error('conexion', `Reintentos agotados para ${entrada.id}`)
        return
      }

      const espera = this._calcularEsperaReconexion({
        intento: entrada.reinicios,
        base: rec.esperaBaseMs ?? 2500,
        max: rec.esperaMaxMs ?? 30000
      })

      this.logger?.info('conexion', `Reintentando en ${espera}ms: ${entrada.id}`)
      await esperar(espera)

      try {
        await this._conectarEntrada(entrada)
      } catch (err) {
        this.logger?.error('conexion', `Fallo reconectando ${entrada.id}`, err?.message)
      }
    })
  }

  _calcularEsperaReconexion ({ intento, base, max }) {
    const expo = Math.min(max, base * Math.pow(1.6, Math.max(0, intento - 1)))
    const jitter = Math.floor(Math.random() * 400)
    return Math.min(max, Math.floor(expo) + jitter)
  }
}

module.exports = {
  GestorBots
}
