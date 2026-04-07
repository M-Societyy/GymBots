function obtenerValorEnv (clave, porDefecto = null) {
  const v = process.env[clave]
  if (v === undefined || v === null || v === '') return porDefecto
  return v
}

function debugHabilitado (categoria) {
  const raw = obtenerValorEnv('GYMBOTS_DEBUG', '')
  if (!raw) return false
  const partes = raw.split(',').map(s => s.trim()).filter(Boolean)
  if (partes.includes('*')) return true
  return partes.includes(categoria)
}

module.exports = {
  obtenerValorEnv,
  debugHabilitado
}
