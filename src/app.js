const { crearLogger, C } = require('./utils/logger')
const { GestorBots } = require('./core/bot_manager')
const { PanelConsola } = require('./core/panel')
const { GestorPlugins } = require('./core/plugin_manager')
const readline = require('readline/promises')
const { stdin: input, stdout: output } = require('process')
const { parsearComando } = require('./utils/command_parser')
const { crearServidorWeb } = require('./web/server')

function crearConsolaRuntime ({ logger, gestorBots, panel, config }) {
  const habilitada = config?.sistema?.consola?.habilitada ?? true
  if (!habilitada) return { detener: () => {} }

  const prefijo = config?.sistema?.prefijoComandos ?? '!'
  const prompt = config?.sistema?.consola?.prompt ?? 'gymbots> '

  let objetivo = config?.sistema?.consola?.objetivoPorDefecto ?? 'all'
  let cerrada = false

  const consolaChatHabilitado = config?.sistema?.consola?.mostrarChat ?? true

  const quitarListenersPorBot = new Map()

  function logLineaBot (botId, texto) {
    const t = String(texto ?? '')
    if (!t) return
    console.log(`${C.cyan}[${botId}]${C.reset} ${t}`)
  }

  function conectarLogsChatBot (entrada) {
    if (!consolaChatHabilitado) return
    const botId = entrada?.id
    const bot = entrada?.bot
    if (!botId || !bot) return

    if (quitarListenersPorBot.has(botId)) {
      try { quitarListenersPorBot.get(botId)() } catch {}
      quitarListenersPorBot.delete(botId)
    }

    const onChat = (usuario, mensaje) => {
      if (!mensaje) return
      logLineaBot(botId, `<${usuario}> ${mensaje}`)
    }

    const onWhisper = (usuario, mensaje) => {
      if (!mensaje) return
      logLineaBot(botId, `[whisper] <${usuario}> ${mensaje}`)
    }

    bot.on('chat', onChat)
    bot.on('whisper', onWhisper)

    const chatOriginal = bot.chat
    const whisperOriginal = bot.whisper

    bot.chat = (mensaje) => {
      logLineaBot(botId, `[chat->] ${mensaje}`)
      return chatOriginal.call(bot, mensaje)
    }

    bot.whisper = (usuario, mensaje) => {
      logLineaBot(botId, `[whisper->] <${usuario}> ${mensaje}`)
      return whisperOriginal.call(bot, usuario, mensaje)
    }

    const quitar = () => {
      try { bot.off('chat', onChat) } catch {}
      try { bot.off('whisper', onWhisper) } catch {}
      try { bot.chat = chatOriginal } catch {}
      try { bot.whisper = whisperOriginal } catch {}
    }

    quitarListenersPorBot.set(botId, quitar)
  }

  const desuscribir = gestorBots.alConectarBot(conectarLogsChatBot)

  const rl = readline.createInterface({ input, output })

  function cerrarConsola () {
    if (cerrada) return
    cerrada = true
    try { rl.close() } catch {}
  }

  const onSigint = () => {
    cerrarConsola()
  }

  process.once('SIGINT', onSigint)

  async function ejecutarLinea (linea) {
    const l = String(linea ?? '').trim()
    if (!l) return

    if (l === ':help') {
      console.log(`\n${C.cyan}${C.bold}  Consola GymBots v1.0.2${C.reset}`)
      console.log(`${C.gray}  ${'─'.repeat(44)}${C.reset}`)
      console.log(`  ${C.green}:help${C.reset}                 ${C.gray}Ayuda${C.reset}`)
      console.log(`  ${C.green}:bots${C.reset}                 ${C.gray}Lista bots activos${C.reset}`)
      console.log(`  ${C.green}:use ${C.yellow}<id>${C.green}|all${C.reset}          ${C.gray}Selecciona bot objetivo${C.reset}`)
      console.log(`  ${C.cyan}${prefijo}${C.yellow}<cmd> ...${C.reset}         ${C.gray}Ejecuta comando del bot${C.reset}`) 
      console.log(`  ${C.red}:quit${C.reset}                 ${C.gray}Cierra la consola${C.reset}`)
      console.log(`${C.gray}  ${'─'.repeat(44)}${C.reset}\n`)
      return
    }

    if (l === ':bots') {
      const ids = gestorBots.listarBots()
      if (ids.length) {
        console.log(`\n${C.cyan}${C.bold}  Bots activos (${ids.length}):${C.reset}`)
        for (const id of ids) console.log(`  ${C.green}●${C.reset} ${C.white}${id}${C.reset}`)
        console.log('')
      } else {
        console.log(`${C.yellow}Sin bots activos${C.reset}`)
      }
      return
    }

    if (l.startsWith(':use ')) {
      const arg = l.slice(5).trim()
      if (!arg) {
        console.log(`${C.yellow}Uso: :use <id>|all${C.reset}`)
        return
      }
      if (arg === 'all') {
        objetivo = 'all'
        console.log(`${C.green}${C.bold}Objetivo: ALL${C.reset}`)
        return
      }
      if (!gestorBots.obtenerEntrada(arg)) {
        console.log(`${C.red}Bot no encontrado${C.reset}`)
        return
      }
      objetivo = arg
      console.log(`${C.cyan}Objetivo: ${C.bold}${objetivo}${C.reset}`)
      return
    }

    if (l === ':quit') {
      cerrada = true
      rl.close()
      return
    }

    if (!l.startsWith(prefijo)) {
      console.log(`${C.yellow}Comando inválido. Usa ${C.cyan}${prefijo}${C.yellow} o ${C.cyan}:help${C.reset}`) 
      return
    }

    const cmd = parsearComando({ prefijo, mensaje: l })
    if (!cmd) return

    const raw = l
    if (objetivo === 'all') {
      const entradas = gestorBots.obtenerEntradas().filter(e => e?.id)
      if (entradas.length === 0) {
        console.log('Sin bots activos')
        return
      }
      for (const e of entradas) {
        try {
          await ejecutarComandoConsoleEnBot({ botId: e.id, cmd, raw })
        } catch (err) {
          logger?.error('consola', `Fallo ejecutando ${cmd.nombre} en ${e.id}`, err?.message)
        }
      }
      return
    }

    await ejecutarComandoConsoleEnBot({ botId: objetivo, cmd, raw })
  }

  async function ejecutarComandoConsoleEnBot ({ botId, cmd, raw }) {
    const entrada = gestorBots.obtenerEntrada(botId)
    if (!entrada?.bot) throw new Error(`Bot no encontrado o no listo: ${botId}`)

    const bot = entrada.bot
    const whisperOriginal = bot.whisper

    bot.whisper = (usuario, mensaje) => {
      logLineaBot(botId, `[respuesta] ${mensaje}`)
    }

    try {
      await gestorBots.ejecutarComandoEnBot({ botId, comando: cmd.nombre, args: cmd.args, usuario: 'CONSOLE', raw })
    } finally {
      bot.whisper = whisperOriginal
    }
  }

  async function loop () {
    while (!cerrada) {
      try {
        panel?.pausarRender?.()
        const linea = await rl.question(prompt)
        panel?.reanudarRender?.()
        await ejecutarLinea(linea)
      } catch (err) {
        panel?.reanudarRender?.()
        if (cerrada) return

        const nombre = err?.name
        const codigo = err?.code
        const msg = String(err?.message ?? '')

        // Cuando se presiona Ctrl+C o se cierra la interfaz, readline/promises suele rechazar.
        // No queremos spamear errores en ese caso.
        if (nombre === 'AbortError') return
        if (codigo === 'ERR_CLOSED') return
        if (msg.toLowerCase().includes('canceled')) return

        logger?.error('consola', 'Error consola', err?.message)
      }
    }
  }

  loop().catch(() => {})

  return {
    detener: () => {
      cerrarConsola()
      try { desuscribir?.() } catch {}
      for (const quitar of quitarListenersPorBot.values()) {
        try { quitar() } catch {}
      }
      quitarListenersPorBot.clear()
      try { process.off('SIGINT', onSigint) } catch {}
    }
  }
}

async function iniciarSistema ({ config }) {
  const logger = crearLogger({ nivel: config.sistema?.nivelLog ?? 'info' })

  const gestorPlugins = new GestorPlugins({
    logger,
    carpeta: config.sistema?.plugins?.carpeta,
    habilitados: config.sistema?.plugins?.habilitados
  })

  const panel = new PanelConsola({
    logger,
    habilitado: config.sistema?.panel?.habilitado ?? true,
    intervaloMs: config.sistema?.panel?.intervaloMs ?? 500
  })

  const gestorBots = new GestorBots({
    logger,
    config,
    gestorPlugins,
    panel
  })

  panel.conectarFuenteEstado(() => gestorBots.obtenerEstadoGlobal())

  let consola = null
  let web = null

  process.on('SIGINT', async () => {
    logger.info('sistema', 'Cierre solicitado. Finalizando bots...')
    consola?.detener?.()
    try { await web?.detener?.() } catch {}
    await gestorBots.detenerTodos('SIGINT')
    panel.detener()
    process.exit(0)
  })

  await gestorBots.iniciarTodos()
  panel.iniciar()

  consola = crearConsolaRuntime({ logger, gestorBots, panel, config })

  web = crearServidorWeb({ logger, gestorBots, config })
  await web.iniciar()

  return { logger, gestorBots, panel, consola, web }
}

module.exports = {
  iniciarSistema
}
