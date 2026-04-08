const { resolverItem } = require('../utils/resolutores')

function instalarAcciones ({ bot, contexto }) {
  const logger = contexto.logger

  contexto.registrarComando({
    nombre: 'comer',
    permiso: 'moderador',
    ejecutar: async ({ usuario }) => {
      try {
        await bot.consume()
        bot.whisper(usuario, 'Consumido')
      } catch (err) {
        contexto.contadorError()
        logger?.error('acciones', `Fallo consume (${contexto.id})`, err?.message)
        bot.whisper(usuario, 'Fallo')
      }
    }
  })

  contexto.registrarComando({
    nombre: 'pescar',
    permiso: 'moderador',
    ejecutar: async ({ usuario }) => {
      try {
        await bot.fish()
        bot.whisper(usuario, 'Pesca finalizada')
      } catch (err) {
        contexto.contadorError()
        logger?.error('acciones', `Fallo fish (${contexto.id})`, err?.message)
        bot.whisper(usuario, 'Fallo')
      }
    }
  })

  contexto.registrarComando({
    nombre: 'usar',
    permiso: 'moderador',
    ejecutar: async ({ usuario, args }) => {
      const mano = args[0] === 'offhand'
      try {
        bot.activateItem(mano)
        bot.whisper(usuario, 'Usando item')
      } catch (err) {
        contexto.contadorError()
        logger?.error('acciones', `Fallo activateItem (${contexto.id})`, err?.message)
        bot.whisper(usuario, 'Fallo')
      }
    }
  })

  contexto.registrarComando({
    nombre: 'dejarusar',
    permiso: 'moderador',
    ejecutar: async ({ usuario }) => {
      try {
        bot.deactivateItem()
        bot.whisper(usuario, 'Item desactivado')
      } catch (err) {
        contexto.contadorError()
        logger?.error('acciones', `Fallo deactivateItem (${contexto.id})`, err?.message)
        bot.whisper(usuario, 'Fallo')
      }
    }
  })

  contexto.registrarComando({
    nombre: 'craftear',
    permiso: 'moderador',
    ejecutar: async ({ usuario, args }) => {
      const itemNombre = args[0]
      const count = args[1] ? Number(args[1]) : 1
      const r = resolverItem(bot, itemNombre)
      if (!r) {
        bot.whisper(usuario, 'Item inválido')
        return
      }
      try {
        const recetas = bot.recipesFor(r.id, null, 1, null)
        if (!recetas || recetas.length === 0) {
          bot.whisper(usuario, 'Sin recetas')
          return
        }
        await bot.craft(recetas[0], count, null)
        bot.whisper(usuario, `Crafteado: ${r.nombre} x${count}`)
      } catch (err) {
        contexto.contadorError()
        logger?.error('acciones', `Fallo craft (${contexto.id})`, err?.message)
        bot.whisper(usuario, 'Fallo crafteando')
      }
    }
  })

  let _comiendo = false

  bot.on('health', () => {
    const auto = contexto.configBot?.acciones?.autoComer
    if (!auto) return
    if (_comiendo) return
    if (bot.food === undefined || bot.food === null) return
    if (bot.food > (auto.umbral ?? 14)) return

    const comida = bot.inventory.items().find(i => i.name.includes('bread') || i.name.includes('beef') || i.name.includes('pork') || i.name.includes('potato'))
    if (!comida) return

    _comiendo = true
    bot.equip(comida, 'hand')
      .then(() => bot.consume())
      .catch(() => {})
      .finally(() => { _comiendo = false })
  })
}

module.exports = {
  instalarAcciones
}
