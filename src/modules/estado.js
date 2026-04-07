function instalarEstado ({ bot, contexto }) {
  const actualizar = () => {
    const e = bot.entity
    contexto.setEstadoJugador({
      posicion: e?.position ?? null,
      salud: bot.health ?? null,
      comida: bot.food ?? null,
      saturacion: bot.foodSaturation ?? null,
      oxigeno: bot.oxygenLevel ?? null,
      dimension: bot.game?.dimension ?? bot.game?.dimensionName ?? null
    })

    const jugadores = bot.players ? Object.keys(bot.players).length : 0
    const entidades = bot.entities ? Object.keys(bot.entities).length : 0

    contexto.estado.mundo = {
      ...contexto.estado.mundo,
      entidades,
      jugadores
    }
  }

  bot.on('spawn', actualizar)
  bot.on('move', actualizar)
  bot.on('health', actualizar)
  bot.on('breath', actualizar)
  bot.on('game', actualizar)
  bot.on('entitySpawn', actualizar)
  bot.on('entityGone', actualizar)
  bot.on('playerJoined', actualizar)
  bot.on('playerLeft', actualizar)
}

module.exports = {
  instalarEstado
}
