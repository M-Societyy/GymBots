function parsearComando ({ prefijo, mensaje }) {
  const sin = mensaje.slice(prefijo.length).trim()
  if (!sin) return null
  const partes = sin.split(/\s+/g)
  const nombre = (partes.shift() ?? '').toLowerCase()
  if (!nombre) return null
  return { nombre, args: partes }
}

module.exports = {
  parsearComando
}
