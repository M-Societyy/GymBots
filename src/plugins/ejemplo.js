module.exports = function pluginEjemplo ({ bot, contexto, logger }) {
  contexto.registrarComando({
    nombre: 'ping',
    permiso: null,
    ejecutar: async ({ usuario }) => {
      bot.whisper(usuario, 'pong')
    }
  })

  bot.on('spawn', () => {
    logger?.info('plugins', `Plugin ejemplo activo en ${contexto.id}`)
  })
}
