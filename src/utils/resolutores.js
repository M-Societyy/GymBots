function resolverItem (bot, nombreOId) {
  if (nombreOId === undefined || nombreOId === null) return null
  if (typeof nombreOId === 'number') return { id: nombreOId, nombre: String(nombreOId) }
  const txt = String(nombreOId).toLowerCase()
  const porNombre = bot.registry?.itemsByName?.[txt]
  if (porNombre) return { id: porNombre.id, nombre: porNombre.name }
  const porNombreAlt = bot.registry?.blocksByName?.[txt]
  if (porNombreAlt) return { id: porNombreAlt.id, nombre: porNombreAlt.name }
  const comoNumero = Number(txt)
  if (!Number.isNaN(comoNumero)) return { id: comoNumero, nombre: txt }
  return null
}

function resolverBloque (bot, nombreOId) {
  if (nombreOId === undefined || nombreOId === null) return null
  if (typeof nombreOId === 'number') return { id: nombreOId, nombre: String(nombreOId) }
  const txt = String(nombreOId).toLowerCase()
  const porNombre = bot.registry?.blocksByName?.[txt]
  if (porNombre) return { id: porNombre.id, nombre: porNombre.name }
  const comoNumero = Number(txt)
  if (!Number.isNaN(comoNumero)) return { id: comoNumero, nombre: txt }
  return null
}

module.exports = {
  resolverItem,
  resolverBloque
}
