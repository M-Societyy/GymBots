const NIVELES = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
}

function crearLogger ({ nivel = 'info' } = {}) {
  const nivelActual = NIVELES[nivel] ?? NIVELES.info

  function ts () {
    const d = new Date()
    const yyyy = String(d.getFullYear())
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const mi = String(d.getMinutes()).padStart(2, '0')
    const ss = String(d.getSeconds()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`
  }

  function imprimir (nivelEtiqueta, categoria, mensaje, extra) {
    const linea = `[${ts()}] [${nivelEtiqueta.toUpperCase()}] [${categoria}] ${mensaje}`
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
  crearLogger
}
