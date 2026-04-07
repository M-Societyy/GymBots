function crearContextoBot ({ id, logger, configGlobal, configBot, contadorEvento, contadorError } = {}) {
  const estado = {
    id,
    username: configBot?.username,
    conexion: { estado: 'conectando', servidor: '' },
    jugador: {},
    posicion: null,
    salud: null,
    comida: null,
    saturacion: null,
    oxigeno: null,
    dimension: null,
    mundo: {
      chunksCargados: 0,
      entidades: 0,
      jugadores: 0
    },
    plugins: [],
    flags: {
      cierreSolicitado: false,
      motivoCierre: null
    }
  }

  const comandos = new Map()

  function estadoPublico () {
    const pos = estado.posicion
      ? `${estado.posicion.x.toFixed(1)},${estado.posicion.y.toFixed(1)},${estado.posicion.z.toFixed(1)}`
      : ''

    return {
      id: estado.id,
      username: estado.username,
      conexion: estado.conexion,
      estado: {
        posicion: pos,
        salud: estado.salud,
        comida: estado.comida,
        dimension: estado.dimension
      },
      mundo: estado.mundo,
      plugins: estado.plugins
    }
  }

  function registrarComando (def) {
    if (!def?.nombre || typeof def.ejecutar !== 'function') {
      throw new Error('Comando inválido')
    }
    comandos.set(def.nombre, def)
  }

  function obtenerComando (nombre) {
    return comandos.get(nombre)
  }

  function listarComandos () {
    return Array.from(comandos.keys()).sort()
  }

  function setConexion (v) {
    estado.conexion = { ...estado.conexion, ...v }
  }

  function setEstadoJugador (v) {
    Object.assign(estado, v)
  }

  function marcarPlugin (nombre) {
    if (!estado.plugins.includes(nombre)) estado.plugins.push(nombre)
  }

  function marcarCierreSolicitado (motivo) {
    estado.flags.cierreSolicitado = true
    estado.flags.motivoCierre = motivo ?? 'solicitado'
  }

  function cierreSolicitado () {
    return estado.flags.cierreSolicitado
  }

  return {
    id,
    logger,
    configGlobal,
    configBot,
    estado,
    estadoPublico,
    contadorEvento: contadorEvento ?? (() => {}),
    contadorError: contadorError ?? (() => {}),
    registrarComando,
    obtenerComando,
    listarComandos,
    setConexion,
    setEstadoJugador,
    marcarPlugin,
    marcarCierreSolicitado,
    cierreSolicitado
  }
}

module.exports = {
  crearContextoBot
}
