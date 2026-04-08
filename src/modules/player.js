function instalarPlayer ({ bot, contexto }) {
  const logger = contexto.logger

  contexto.estado.flags.playerMode = false

  let _intervaloMirada = null
  let _intervaloSprint = null

  function iniciarModoPlayer () {
    detenerModoPlayer()
    contexto.estado.flags.playerMode = true

    // Mirada natural: mirar ligeramente alrededor de forma periódica (simula cabeza humana)
    _intervaloMirada = setInterval(() => {
      if (!contexto.estado.flags.playerMode) return
      if (!bot.entity) return

      // Si está siguiendo/acosando a alguien, no randomizar mirada
      if (contexto.estado.flags.seguimiento || contexto.estado.flags.acoso) return

      const yawRandom = bot.entity.yaw + (Math.random() - 0.5) * 0.3
      const pitchRandom = Math.max(-1.2, Math.min(1.2, bot.entity.pitch + (Math.random() - 0.5) * 0.15))
      bot.look(yawRandom, pitchRandom, false).catch(() => {})
    }, 2000 + Math.floor(Math.random() * 3000))

    // Sprint inteligente: al moverse en línea recta, activar sprint
    _intervaloSprint = setInterval(() => {
      if (!contexto.estado.flags.playerMode) return
      if (!bot.entity) return

      const vel = bot.entity.velocity
      if (!vel) return

      const speed = Math.sqrt(vel.x * vel.x + vel.z * vel.z)
      if (speed > 0.1 && bot.food > 6) {
        bot.setControlState('sprint', true)
      } else {
        bot.setControlState('sprint', false)
      }
    }, 500)

    if (_intervaloMirada) _intervaloMirada.unref?.()
    if (_intervaloSprint) _intervaloSprint.unref?.()
  }

  function detenerModoPlayer () {
    contexto.estado.flags.playerMode = false
    if (_intervaloMirada) { clearInterval(_intervaloMirada); _intervaloMirada = null }
    if (_intervaloSprint) { clearInterval(_intervaloSprint); _intervaloSprint = null }
    try { bot.setControlState('sprint', false) } catch {}
  }

  // Saltar automáticamente cuando choca contra un bloque (humano natural)
  bot.on('physicsTick', () => {
    if (!contexto.estado.flags.playerMode) return
    if (!bot.entity) return

    // Auto-jump cuando estás contra un bloque y te mueves
    const vel = bot.entity.velocity
    if (!vel) return

    const moving = Math.abs(vel.x) > 0.01 || Math.abs(vel.z) > 0.01
    const blocked = bot.entity.isCollidedHorizontally

    if (moving && blocked && bot.entity.onGround) {
      bot.setControlState('jump', true)
      setTimeout(() => {
        try { bot.setControlState('jump', false) } catch {}
      }, 150)
    }
  })

  // Swing arm cuando ataca (más realista)
  bot.on('physicsTick', () => {
    if (!contexto.estado.flags.playerMode) return
    // El swing se hace automático por mineflayer al atacar, pero nos aseguramos
    // de que el bot se vea natural al estar idle: pequeños movimientos de cabeza ya están
  })

  contexto.registrarComando({
    nombre: 'player',
    permiso: 'moderador',
    ejecutar: async ({ usuario, args }) => {
      const modo = (args[0] ?? '').toLowerCase()
      if (modo === 'on') {
        iniciarModoPlayer()
        bot.whisper(usuario, 'Modo Player: ON (fisicas humanas activadas)')
        logger?.info('player', `Modo player activado (${contexto.id})`)
      } else if (modo === 'off') {
        detenerModoPlayer()
        bot.whisper(usuario, 'Modo Player: OFF')
        logger?.info('player', `Modo player desactivado (${contexto.id})`)
      } else {
        const estado = contexto.estado.flags.playerMode ? 'ON' : 'OFF'
        bot.whisper(usuario, `Modo Player: ${estado}. Uso: player <on|off>`)
      }
    }
  })

  // Limpiar al desconectar
  bot.once('end', () => {
    detenerModoPlayer()
  })
}

module.exports = {
  instalarPlayer
}
