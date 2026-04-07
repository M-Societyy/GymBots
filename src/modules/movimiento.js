function instalarMovimiento ({ bot, contexto }) {
  const logger = contexto.logger

  contexto.registrarComando({
    nombre: 'mirar',
    permiso: null,
    ejecutar: async ({ usuario, args }) => {
      const yaw = Number(args[0])
      const pitch = Number(args[1])
      if (Number.isNaN(yaw) || Number.isNaN(pitch)) {
        bot.whisper(usuario, 'Uso: mirar <yaw> <pitch>')
        return
      }
      try {
        await bot.look(yaw, pitch, true)
        bot.whisper(usuario, 'Mirada actualizada')
      } catch (err) {
        contexto.contadorError()
        logger?.error('movimiento', `Fallo mirar (${contexto.id})`, err?.message)
        bot.whisper(usuario, 'Fallo')
      }
    }
  })

  contexto.registrarComando({
    nombre: 'control',
    permiso: 'moderador',
    ejecutar: async ({ usuario, args }) => {
      const control = args[0]
      const estado = args[1]
      if (!control || (estado !== 'on' && estado !== 'off')) {
        bot.whisper(usuario, 'Uso: control <forward|back|left|right|jump|sprint|sneak> <on|off>')
        return
      }
      bot.setControlState(control, estado === 'on')
      bot.whisper(usuario, `Control ${control}: ${estado}`)
    }
  })

  contexto.registrarComando({
    nombre: 'limpiarcontroles',
    permiso: 'moderador',
    ejecutar: async ({ usuario }) => {
      bot.clearControlStates()
      bot.whisper(usuario, 'Controles limpiados')
    }
  })

  contexto.registrarComando({
    nombre: 'ir',
    permiso: 'moderador',
    ejecutar: async ({ usuario, args }) => {
      const x = Number(args[0])
      const y = Number(args[1])
      const z = Number(args[2])
      if ([x, y, z].some(n => Number.isNaN(n))) {
        bot.whisper(usuario, 'Uso: ir <x> <y> <z>')
        return
      }
      if (!bot.pathfinder) {
        bot.whisper(usuario, 'Pathfinder no disponible')
        return
      }
      const { goals } = require('mineflayer-pathfinder')
      const { GoalBlock } = goals
      bot.pathfinder.setGoal(new GoalBlock(x, y, z))
      bot.whisper(usuario, `Goal: ${x} ${y} ${z}`)
    }
  })

  bot.on('forcedMove', () => {
    logger?.debug('movimiento', `ForcedMove (${contexto.id})`)
  })
}

module.exports = {
  instalarMovimiento
}
