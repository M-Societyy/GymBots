function serializarError (err) {
  if (!err) return null
  return {
    nombre: err.name,
    mensaje: err.message,
    stack: err.stack
  }
}

function manejarFalloFatal (err) {
  const info = serializarError(err)
  console.error('[FATAL] Error no manejado')
  console.error(info)
  process.exit(1)
}

module.exports = {
  serializarError,
  manejarFalloFatal
}
