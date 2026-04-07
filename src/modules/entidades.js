function instalarEntidades ({ bot, contexto }) {
  const logger = contexto.logger

  contexto.estado.flags.acoso = contexto.estado.flags.acoso ?? null

  contexto.registrarComando({
    nombre: 'cercanos',
    permiso: null,
    ejecutar: async ({ usuario, args }) => {
      const max = args[0] ? Number(args[0]) : 10
      const lista = Object.values(bot.entities || {})
        .filter(e => e?.position && bot.entity?.position && e.position.distanceTo(bot.entity.position) <= max)
        .slice(0, 10)
        .map(e => `${e.name ?? e.type}:${e.id}`)

      bot.whisper(usuario, lista.length ? `Entidades: ${lista.join(', ')}` : 'Sin entidades cercanas')
    }
  })

  contexto.registrarComando({
    nombre: 'seguir',
    permiso: 'moderador',
    ejecutar: async ({ usuario, args }) => {
      const nombre = args[0]
      if (!nombre) {
        bot.whisper(usuario, 'Uso: seguir <jugador>')
        return
      }
      const objetivo = bot.players?.[nombre]?.entity
      if (!objetivo) {
        bot.whisper(usuario, 'Jugador no encontrado')
        return
      }
      contexto.estado.flags.seguimiento = { tipo: 'jugador', nombre }
      bot.whisper(usuario, `Siguiendo: ${nombre}`)
    }
  })

  contexto.registrarComando({
    nombre: 'acosar',
    permiso: 'moderador',
    ejecutar: async ({ usuario, args }) => {
      const nombre = args[0]
      if (!nombre) {
        bot.whisper(usuario, 'Uso: acosar <jugador>')
        return
      }
      const objetivo = bot.players?.[nombre]?.entity
      if (!objetivo) {
        bot.whisper(usuario, 'Jugador no encontrado')
        return
      }

      contexto.estado.flags.acoso = { nombre }
      contexto.estado.flags.seguimiento = { tipo: 'jugador', nombre }

      if (bot.pathfinder) {
        const { goals } = require('mineflayer-pathfinder')
        const { GoalFollow } = goals
        // follow dinámico, recalcula si el objetivo se mueve
        bot.pathfinder.setGoal(new GoalFollow(objetivo, 2), true)
      }

      bot.whisper(usuario, `Acoso activado: ${nombre}`)
    }
  })

  contexto.registrarComando({
    nombre: 'pararacosar',
    permiso: 'moderador',
    ejecutar: async ({ usuario }) => {
      contexto.estado.flags.acoso = null
      // Mantengo seguimiento separado, pero por seguridad lo detenemos también
      contexto.estado.flags.seguimiento = null
      try {
        if (bot.pathfinder) bot.pathfinder.setGoal(null)
      } catch {}
      try { bot.clearControlStates() } catch {}
      bot.whisper(usuario, 'Acoso detenido')
    }
  })

  contexto.registrarComando({
    nombre: 'noseguir',
    permiso: 'moderador',
    ejecutar: async ({ usuario }) => {
      contexto.estado.flags.seguimiento = null
      bot.whisper(usuario, 'Seguimiento detenido')
    }
  })

  contexto.registrarComando({
    nombre: 'atacar',
    permiso: 'moderador',
    ejecutar: async ({ usuario, args }) => {
      const nombre = args[0]
      if (!nombre) {
        bot.whisper(usuario, 'Uso: atacar <jugador>')
        return
      }
      const objetivo = bot.players?.[nombre]?.entity
      if (!objetivo) {
        bot.whisper(usuario, 'Jugador no encontrado')
        return
      }
      try {
        bot.attack(objetivo)
        bot.whisper(usuario, `Ataque enviado a ${nombre}`)
      } catch (err) {
        contexto.contadorError()
        logger?.error('entidades', `Fallo atacando (${contexto.id})`, err?.message)
        bot.whisper(usuario, 'Fallo atacando')
      }
    }
  })

  bot.on('physicsTick', () => {
    const s = contexto.estado.flags.seguimiento
    if (!s) return
    if (s.tipo === 'jugador') {
      const objetivo = bot.players?.[s.nombre]?.entity
      if (!objetivo) return
      try {
        bot.lookAt(objetivo.position, false).catch(() => {})
      } catch {}
    }
  })

  bot.on('entityHurt', (entity) => {
    if (!entity) return
    logger?.debug('entidades', `EntityHurt (${contexto.id}) ${entity.id}`)
  })
}

module.exports = {
  instalarEntidades
}
