const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m',
  bgRed: '\x1b[41m',
  white: '\x1b[37m'
}

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
  console.error('')
  console.error(`${C.bgRed}${C.white}${C.bold}  FATAL ERROR  ${C.reset}`)
  console.error('')
  console.error(`  ${C.red}${C.bold}${info?.nombre ?? 'Error'}${C.reset}${C.gray}: ${C.reset}${C.yellow}${info?.mensaje ?? 'Error desconocido'}${C.reset}`)
  if (info?.stack) {
    console.error('')
    console.error(`${C.gray}${info.stack}${C.reset}`)
  }
  console.error('')
  process.exit(1)
}

module.exports = {
  serializarError,
  manejarFalloFatal
}
