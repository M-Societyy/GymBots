const { parsearComando } = require('../utils/command_parser')

function instalarChatComandos ({ bot, contexto }) {
  const prefijo = contexto.configGlobal?.sistema?.prefijoComandos ?? '!'

  registrarComandosBase({ bot, contexto })

  bot.on('chat', async (usuario, mensaje) => {
    if (usuario === bot.username) return
    if (!mensaje.startsWith(prefijo)) return

    const cmd = parsearComando({ prefijo, mensaje })
    if (!cmd) return

    const def = contexto.obtenerComando(cmd.nombre)
    if (!def) {
      bot.whisper(usuario, `Comando desconocido: ${cmd.nombre}`)
      return
    }

    if (!tienePermiso({ contexto, usuario, permiso: def.permiso })) {
      bot.whisper(usuario, 'Permiso insuficiente')
      return
    }

    try {
      await def.ejecutar({ bot, contexto, usuario, args: cmd.args, raw: mensaje })
    } catch (err) {
      contexto.contadorError()
      contexto.logger?.error('chat', `Fallo comando ${cmd.nombre} (${contexto.id})`, err?.message)
      bot.whisper(usuario, `Error ejecutando ${cmd.nombre}`)
    }
  })
}

function tienePermiso ({ contexto, usuario, permiso }) {
  if (!permiso) return true
  const p = contexto.configBot?.permisos ?? {}
  const admin = p.admin ?? []
  const moderador = p.moderador ?? []
  const usuarioNivel = p.usuario ?? ['*']

  if (admin.includes(usuario)) return true
  if (permiso === 'admin') return false

  if (moderador.includes(usuario)) return true
  if (permiso === 'moderador') return false

  if (usuarioNivel.includes('*') || usuarioNivel.includes(usuario)) return true
  return false
}

function registrarComandosBase ({ bot, contexto }) {
  contexto.registrarComando({
    nombre: 'ayuda',
    permiso: null,
    ejecutar: async ({ usuario, args }) => {
      const prefijo = contexto.configGlobal?.sistema?.prefijoComandos ?? '!'

      const categorias = {
        'General': ['ayuda', 'estado', 'decir', 'salir', 'pattern'],
        'Movimiento': ['mirar', 'control', 'limpiarcontroles', 'ir'],
        'Entidades': ['cercanos', 'seguir', 'noseguir', 'acosar', 'pararacosar', 'atacar', 'escapar', 'pararescapar'],
        'Bloques': ['ver', 'buscarbloque', 'minar', 'colocar'],
        'Inventario': ['items', 'equipar', 'tirar', 'cofre'],
        'Acciones': ['comer', 'pescar', 'usar', 'dejarusar', 'craftear'],
        'Analisis': ['scan', 'tablist', 'tps', 'serverinfo', 'testperms'],
        'Player': ['player']
      }

      const todosRegistrados = new Set(contexto.listarComandos())

      // Si piden ayuda de una categoría específica
      const filtro = (args[0] ?? '').toLowerCase()
      if (filtro && categorias[filtro.charAt(0).toUpperCase() + filtro.slice(1)]) {
        const cat = filtro.charAt(0).toUpperCase() + filtro.slice(1)
        const cmds = (categorias[cat] ?? []).filter(c => todosRegistrados.has(c))
        bot.whisper(usuario, `--- ${cat} ---`)
        bot.whisper(usuario, cmds.map(c => `${prefijo}${c}`).join(', '))
        return
      }

      bot.whisper(usuario, `--- Ayuda GymBots (${todosRegistrados.size} cmds) ---`)
      for (const [cat, cmds] of Object.entries(categorias)) {
        const disponibles = cmds.filter(c => todosRegistrados.has(c))
        if (disponibles.length === 0) continue
        bot.whisper(usuario, `[${cat}] ${disponibles.map(c => `${prefijo}${c}`).join(', ')}`)
      }

      // Mostrar comandos no categorizados (plugins, etc.)
      const categorizados = new Set(Object.values(categorias).flat())
      const sinCategoria = [...todosRegistrados].filter(c => !categorizados.has(c))
      if (sinCategoria.length > 0) {
        bot.whisper(usuario, `[Otros] ${sinCategoria.map(c => `${prefijo}${c}`).join(', ')}`)
      }

      bot.whisper(usuario, `Tip: ${prefijo}ayuda <categoria> para detalle`)
    }
  })

  contexto.registrarComando({
    nombre: 'estado',
    permiso: null,
    ejecutar: async ({ usuario }) => {
      const e = bot.entity
      const pos = e?.position
        ? `${e.position.x.toFixed(1)} ${e.position.y.toFixed(1)} ${e.position.z.toFixed(1)}`
        : 'sin-pos'
      bot.whisper(usuario, `hp:${bot.health} food:${bot.food} dim:${bot.game?.dimension ?? ''} pos:${pos}`)
    }
  })

  contexto.registrarComando({
    nombre: 'decir',
    permiso: 'moderador',
    ejecutar: async ({ args }) => {
      const txt = args.join(' ').trim()
      if (!txt) return
      bot.chat(txt)
    }
  })

  contexto.registrarComando({
    nombre: 'salir',
    permiso: 'admin',
    ejecutar: async () => {
      contexto.marcarCierreSolicitado('comando')
      bot.end('cierre por comando')
    }
  })

  contexto.registrarComando({
    nombre: 'pattern',
    permiso: 'moderador',
    ejecutar: async ({ usuario, args }) => {
      const nombre = args[0]
      const texto = args.slice(1).join(' ')
      if (!nombre || !texto) {
        bot.whisper(usuario, 'Uso: pattern <nombre> <regex>' )
        return
      }
      let re
      try {
        re = new RegExp(texto)
      } catch (err) {
        bot.whisper(usuario, `Regex inválida: ${err.message}`)
        return
      }
      bot.addChatPattern(nombre, re, { repeat: true, parse: false })
      bot.whisper(usuario, `Patrón agregado: ${nombre}`)
    }
  })
}

module.exports = {
  instalarChatComandos
}
