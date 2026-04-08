const NIVELES = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
}

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m'
}

const ETIQUETAS = {
  error: `${C.bgRed}${C.white}${C.bold} ERROR ${C.reset}`,
  warn: `${C.bgYellow}${C.bold} WARN  ${C.reset}`,
  info: `${C.cyan}${C.bold}  INFO ${C.reset}`,
  debug: `${C.gray} DEBUG ${C.reset}`
}

const COLOR_MSG = {
  error: C.red,
  warn: C.yellow,
  info: C.white,
  debug: C.gray
}

function crearLogger ({ nivel = 'info' } = {}) {
  const nivelActual = NIVELES[nivel] ?? NIVELES.info

  function ts () {
    const d = new Date()
    const hh = String(d.getHours()).padStart(2, '0')
    const mi = String(d.getMinutes()).padStart(2, '0')
    const ss = String(d.getSeconds()).padStart(2, '0')
    return `${hh}:${mi}:${ss}`
  }

  function imprimir (nivelEtiqueta, categoria, mensaje, extra) {
    const etiqueta = ETIQUETAS[nivelEtiqueta] ?? nivelEtiqueta.toUpperCase()
    const colorMsg = COLOR_MSG[nivelEtiqueta] ?? ''
    const linea = `${C.gray}${ts()}${C.reset} ${etiqueta} ${C.magenta}${categoria}${C.reset} ${colorMsg}${mensaje}${C.reset}`
    if (extra !== undefined) {
      console.log(linea, extra)
    } else {
      console.log(linea)
    }
  }

  const api = {
    error: (categoria, mensaje, extra) => {
      if (NIVELES.error <= nivelActual) imprimir('error', categoria, mensaje, extra)
    },
    warn: (categoria, mensaje, extra) => {
      if (NIVELES.warn <= nivelActual) imprimir('warn', categoria, mensaje, extra)
    },
    info: (categoria, mensaje, extra) => {
      if (NIVELES.info <= nivelActual) imprimir('info', categoria, mensaje, extra)
    },
    debug: (categoria, mensaje, extra) => {
      if (NIVELES.debug <= nivelActual) imprimir('debug', categoria, mensaje, extra)
    }
  }

  return api
}

module.exports = {
  crearLogger,
  C
}
