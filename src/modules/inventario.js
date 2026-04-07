const { resolverItem } = require('../utils/resolutores')

function instalarInventario ({ bot, contexto }) {
  const logger = contexto.logger

  contexto.registrarComando({
    nombre: 'items',
    permiso: null,
    ejecutar: async ({ usuario }) => {
      const items = bot.inventory?.items?.() ?? []
      const txt = items.slice(0, 20).map(i => `${i.name}x${i.count}`).join(', ')
      bot.whisper(usuario, txt || 'Inventario vacío')
    }
  })

  contexto.registrarComando({
    nombre: 'equipar',
    permiso: 'moderador',
    ejecutar: async ({ usuario, args }) => {
      const nombre = args[0]
      const destino = args[1] ?? 'hand'
      const r = resolverItem(bot, nombre)
      if (!r) {
        bot.whisper(usuario, 'Item inválido')
        return
      }
      try {
        await bot.equip(r.id, destino)
        bot.whisper(usuario, `Equipado: ${r.nombre} -> ${destino}`)
      } catch (err) {
        contexto.contadorError()
        logger?.error('inventario', `Fallo equipando (${contexto.id})`, err?.message)
        bot.whisper(usuario, 'Fallo equipando')
      }
    }
  })

  contexto.registrarComando({
    nombre: 'tirar',
    permiso: 'moderador',
    ejecutar: async ({ usuario, args }) => {
      const nombre = args[0]
      const cant = args[1] ? Number(args[1]) : null
      const r = resolverItem(bot, nombre)
      if (!r) {
        bot.whisper(usuario, 'Item inválido')
        return
      }
      try {
        await bot.toss(r.id, null, cant)
        bot.whisper(usuario, `Tirado: ${r.nombre}`)
      } catch (err) {
        contexto.contadorError()
        logger?.error('inventario', `Fallo tirando (${contexto.id})`, err?.message)
        bot.whisper(usuario, 'Fallo tirando')
      }
    }
  })

  contexto.registrarComando({
    nombre: 'cofre',
    permiso: 'moderador',
    ejecutar: async ({ usuario }) => {
      const bloque = bot.blockAtCursor(6)
      if (!bloque) {
        bot.whisper(usuario, 'Sin bloque en cursor')
        return
      }
      try {
        const chest = await bot.openContainer(bloque)
        const items = chest.containerItems?.() ?? chest.items?.() ?? []
        bot.whisper(usuario, `Contenedor: ${items.length} items`)
        chest.close()
      } catch (err) {
        contexto.contadorError()
        logger?.error('inventario', `Fallo abriendo contenedor (${contexto.id})`, err?.message)
        bot.whisper(usuario, 'Fallo abriendo contenedor')
      }
    }
  })

  bot.on('windowOpen', () => {
    logger?.debug('inventario', `WindowOpen (${contexto.id})`)
  })
}

module.exports = {
  instalarInventario
}
