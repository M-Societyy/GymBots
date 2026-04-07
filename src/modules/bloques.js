const vec3 = require('vec3')
const { resolverBloque } = require('../utils/resolutores')

function instalarBloques ({ bot, contexto }) {
  const logger = contexto.logger

  contexto.registrarComando({
    nombre: 'ver',
    permiso: null,
    ejecutar: async ({ usuario, args }) => {
      const dist = args[0] ? Number(args[0]) : 6
      const bloque = bot.blockAtCursor(dist)
      if (!bloque) {
        bot.whisper(usuario, 'Sin bloque en cursor')
        return
      }
      bot.whisper(usuario, `Bloque: ${bloque.name} id:${bloque.type} meta:${bloque.metadata} pos:${bloque.position.x},${bloque.position.y},${bloque.position.z}`)
    }
  })

  contexto.registrarComando({
    nombre: 'buscarbloque',
    permiso: 'moderador',
    ejecutar: async ({ usuario, args }) => {
      const nombre = args[0]
      const r = resolverBloque(bot, nombre)
      if (!r) {
        bot.whisper(usuario, 'Bloque inválido')
        return
      }
      const max = args[1] ? Number(args[1]) : 32
      const b = bot.findBlock({ matching: r.id, maxDistance: max })
      if (!b) {
        bot.whisper(usuario, `No encontrado: ${r.nombre}`)
        return
      }
      bot.whisper(usuario, `Encontrado: ${r.nombre} en ${b.position.x},${b.position.y},${b.position.z}`)
    }
  })

  contexto.registrarComando({
    nombre: 'minar',
    permiso: 'moderador',
    ejecutar: async ({ usuario, args }) => {
      const nombre = args[0]
      if (!nombre) {
        bot.whisper(usuario, 'Uso: minar <bloque> [maxDist]')
        return
      }
      const r = resolverBloque(bot, nombre)
      if (!r) {
        bot.whisper(usuario, 'Bloque inválido')
        return
      }
      const max = args[1] ? Number(args[1]) : 16
      const objetivo = bot.findBlock({ matching: r.id, maxDistance: max })
      if (!objetivo) {
        bot.whisper(usuario, `No encontrado: ${r.nombre}`)
        return
      }
      if (!bot.canDigBlock(objetivo)) {
        bot.whisper(usuario, 'No se puede minar ese bloque')
        return
      }
      try {
        await bot.lookAt(objetivo.position, true)
        await bot.dig(objetivo, true)
        bot.whisper(usuario, `Minado: ${r.nombre}`)
      } catch (err) {
        contexto.contadorError()
        logger?.error('bloques', `Fallo minando (${contexto.id})`, err?.message)
        bot.whisper(usuario, 'Fallo minando')
      }
    }
  })

  contexto.registrarComando({
    nombre: 'colocar',
    permiso: 'moderador',
    ejecutar: async ({ usuario, args }) => {
      const dx = Number(args[0])
      const dy = Number(args[1])
      const dz = Number(args[2])
      if ([dx, dy, dz].some(n => Number.isNaN(n))) {
        bot.whisper(usuario, 'Uso: colocar <dx> <dy> <dz>')
        return
      }
      const ref = bot.blockAt(bot.entity.position.offset(dx, dy, dz))
      if (!ref) {
        bot.whisper(usuario, 'Bloque de referencia no existe')
        return
      }
      try {
        await bot.placeBlock(ref, vec3(0, 1, 0))
        bot.whisper(usuario, 'Bloque colocado')
      } catch (err) {
        contexto.contadorError()
        logger?.error('bloques', `Fallo colocando (${contexto.id})`, err?.message)
        bot.whisper(usuario, 'Fallo colocando')
      }
    }
  })

  bot.on('blockUpdate', (oldBlock, newBlock) => {
    contexto.contadorEvento()
    if (!oldBlock) return
    if (oldBlock.type === newBlock.type && oldBlock.metadata === newBlock.metadata) return
    logger?.debug('bloques', `Actualización de bloque (${contexto.id}) ${oldBlock.position}`)
  })
}

module.exports = {
  instalarBloques
}
