function instalarAnalisis ({ bot, contexto }) {
  const logger = contexto.logger

  // !scan — escanea jugadores online: nombre, ping, gamemode, UUID parcial
  contexto.registrarComando({
    nombre: 'scan',
    permiso: 'moderador',
    ejecutar: async ({ usuario }) => {
      const players = bot.players ?? {}
      const lista = Object.values(players)
      if (lista.length === 0) {
        bot.whisper(usuario, 'Sin jugadores detectados')
        return
      }

      bot.whisper(usuario, `--- Scan: ${lista.length} jugadores ---`)
      for (const p of lista.slice(0, 15)) {
        const name = p.username ?? '?'
        const ping = p.ping ?? '?'
        const gm = p.gamemode ?? '?'
        const uuid = (p.uuid ?? '').slice(0, 8)
        const entity = p.entity
        const dist = entity?.position && bot.entity?.position
          ? entity.position.distanceTo(bot.entity.position).toFixed(1)
          : '?'
        bot.whisper(usuario, `${name} | ping:${ping}ms | gm:${gm} | dist:${dist} | uuid:${uuid}..`)
      }
      if (lista.length > 15) {
        bot.whisper(usuario, `... y ${lista.length - 15} más`)
      }
    }
  })

  // !tablist — muestra el tablist completo (nombres crudos tal cual los envía el servidor)
  contexto.registrarComando({
    nombre: 'tablist',
    permiso: 'moderador',
    ejecutar: async ({ usuario }) => {
      const players = bot.players ?? {}
      const nombres = Object.keys(players).sort()
      if (nombres.length === 0) {
        bot.whisper(usuario, 'Tablist vacío')
        return
      }

      // Enviar en bloques de 10 para no saturar el chat
      bot.whisper(usuario, `--- Tablist (${nombres.length}) ---`)
      for (let i = 0; i < nombres.length; i += 10) {
        const bloque = nombres.slice(i, i + 10).join(', ')
        bot.whisper(usuario, bloque)
      }
    }
  })

  // !tps — estima el TPS del servidor midiendo physicsTicks durante 5 segundos
  contexto.registrarComando({
    nombre: 'tps',
    permiso: 'moderador',
    ejecutar: async ({ usuario }) => {
      bot.whisper(usuario, 'Midiendo TPS (5s)...')

      let ticks = 0
      const onTick = () => { ticks++ }
      bot.on('physicsTick', onTick)

      await new Promise(resolve => setTimeout(resolve, 5000))

      bot.off('physicsTick', onTick)

      // physicsTick debería correr a 20/s si TPS es 20
      const tpsEstimado = (ticks / 5).toFixed(1)
      let estado = 'OK'
      if (tpsEstimado < 15) estado = 'BAJO'
      if (tpsEstimado < 10) estado = 'CRITICO'

      bot.whisper(usuario, `TPS estimado: ${tpsEstimado} (${estado}) [${ticks} ticks en 5s]`)
    }
  })

  // !serverinfo — información del servidor: versión, dificultad, dimensión, max players, etc.
  contexto.registrarComando({
    nombre: 'serverinfo',
    permiso: 'moderador',
    ejecutar: async ({ usuario }) => {
      const game = bot.game ?? {}
      const version = bot.version ?? '?'
      const dim = game.dimension ?? '?'
      const dificultad = game.difficulty ?? '?'
      const maxPlayers = game.maxPlayers ?? '?'
      const gameMode = game.gameMode ?? '?'
      const hardcore = game.hardcore ? 'SI' : 'NO'
      const levelType = game.levelType ?? '?'
      const viewDist = game.serverViewDistance ?? game.viewDistance ?? '?'
      const numPlayers = Object.keys(bot.players ?? {}).length

      bot.whisper(usuario, `--- Server Info ---`)
      bot.whisper(usuario, `Version: ${version} | Dim: ${dim}`)
      bot.whisper(usuario, `Dificultad: ${dificultad} | Hardcore: ${hardcore}`)
      bot.whisper(usuario, `GameMode: ${gameMode} | LevelType: ${levelType}`)
      bot.whisper(usuario, `Jugadores: ${numPlayers}/${maxPlayers} | ViewDist: ${viewDist}`)

      // Intentar obtener el brand del servidor
      const brand = bot.serverBrand ?? null
      if (brand) {
        bot.whisper(usuario, `Brand: ${brand}`)
      }
    }
  })

  // !testperms — testea qué puede hacer el bot: chat, commands, build, movimiento
  contexto.registrarComando({
    nombre: 'testperms',
    permiso: 'admin',
    ejecutar: async ({ usuario }) => {
      bot.whisper(usuario, '--- Test de permisos del servidor ---')

      const resultados = []

      // Test 1: GameMode
      const gm = bot.game?.gameMode ?? '?'
      resultados.push(`GameMode: ${gm}`)

      // Test 2: Puede moverse?
      const canMove = bot.entity?.onGround !== undefined
      resultados.push(`Movimiento: ${canMove ? 'SI' : '?'}`)

      // Test 3: Operator status (comprobar si tiene permisos op)
      const permLevel = bot.player?.permissionLevel ?? 0
      resultados.push(`PermLevel: ${permLevel}`)

      // Test 4: Posición de spawn conocida?
      const spawn = bot.spawnPoint
      resultados.push(`SpawnPoint: ${spawn ? `${spawn.x},${spawn.y},${spawn.z}` : 'desconocido'}`)

      // Test 5: Health habilitado?
      resultados.push(`Health: ${bot.health ?? 'null'} | Food: ${bot.food ?? 'null'}`)

      // Test 6: Intentar obtener experiencia
      resultados.push(`XP: level=${bot.experience?.level ?? '?'} points=${bot.experience?.points ?? '?'}`)

      // Test 7: Inventario accesible?
      const invItems = bot.inventory?.items?.()?.length ?? 0
      resultados.push(`Inventario: ${invItems} items`)

      // Test 8: Entidades visibles
      const entidades = Object.keys(bot.entities ?? {}).length
      resultados.push(`Entidades visibles: ${entidades}`)

      for (const r of resultados) {
        bot.whisper(usuario, r)
      }
    }
  })
}

module.exports = {
  instalarAnalisis
}
