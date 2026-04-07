const readline = require('readline')

class PanelConsola {
  constructor ({ logger, habilitado = true, intervaloMs = 500 } = {}) {
    this.logger = logger
    this.habilitado = habilitado
    this.intervaloMs = intervaloMs
    this._timer = null
    this._fuente = null
    this._renderHabilitado = true
    this._ultimaAltura = 0

    process.stdout.on('resize', () => {
      this._renderizar(true)
    })
  }

  conectarFuenteEstado (fn) {
    this._fuente = fn
  }

  iniciar () {
    if (!this.habilitado) return
    if (this._timer) return
    this._timer = setInterval(() => this._renderizar(false), this.intervaloMs)
    this._timer.unref?.()
  }

  detener () {
    if (this._timer) clearInterval(this._timer)
    this._timer = null
    if (this.habilitado) {
      this._limpiarPantalla()
    }
  }

  pausarRender () {
    this._renderHabilitado = false
  }

  reanudarRender () {
    this._renderHabilitado = true
  }

  _limpiarPantalla () {
    process.stdout.write('\x1b[2J\x1b[H')
  }

  _renderizar (forzar) {
    if (!this.habilitado) return
    if (!this._renderHabilitado && !forzar) return

    const estado = this._fuente ? this._fuente() : null
    const ancho = Math.max(60, process.stdout.columns || 120)

    const lineas = []
    lineas.push(this._lineaCaja(ancho, 'GymBots'))
    lineas.push(this._lineaContenido(ancho, this._cabecera(estado)))
    lineas.push(this._lineaSeparador(ancho))

    const bots = estado?.bots ?? []
    if (bots.length === 0) {
      lineas.push(this._lineaContenido(ancho, 'Sin bots activos'))
    } else {
      for (const b of bots) {
        lineas.push(this._lineaContenido(ancho, this._filaBot(b)))
      }
    }

    lineas.push(this._lineaSeparador(ancho))
    lineas.push(this._lineaContenido(ancho, this._pie(estado)))
    lineas.push(this._lineaCajaFin(ancho))

    const salida = lineas.join('\n')

    this._limpiarPantalla()
    process.stdout.write(salida)

    this._ultimaAltura = lineas.length
    readline.cursorTo(process.stdout, 0, this._ultimaAltura)
  }

  _cabecera (estado) {
    const total = estado?.bots?.length ?? 0
    const enLinea = (estado?.bots ?? []).filter(b => b?.conexion?.estado === 'conectado').length
    const tick = estado?.tick ?? 0
    return `Autoría: c1q_ | M-Society | Gym Client Team  |  Bots: ${enLinea}/${total}  |  Tick: ${tick}`
  }

  _filaBot (b) {
    const id = b?.id ?? 'sin-id'
    const usuario = b?.username ?? 'sin-usuario'
    const estado = b?.conexion?.estado ?? 'desconocido'
    const servidor = b?.conexion?.servidor ?? ''
    const pos = b?.estado?.posicion ?? ''
    const vida = b?.estado?.salud ?? ''
    const hambre = b?.estado?.comida ?? ''
    const mundo = b?.estado?.dimension ?? ''
    return `${id}  |  ${usuario}  |  ${estado}  |  ${servidor}  |  ${mundo}  |  ${pos}  |  hp:${vida}  food:${hambre}`
  }

  _pie (estado) {
    const errores = estado?.erroresRecientes ?? 0
    const eventos = estado?.eventosRecientes ?? 0
    return `Eventos: ${eventos}  |  Errores: ${errores}  |  Comandos: escribir en chat o usar consola` 
  }

  _lineaCaja (ancho, titulo) {
    const t = ` ${titulo} `
    const relleno = Math.max(0, ancho - 2 - t.length)
    const izq = Math.floor(relleno / 2)
    const der = relleno - izq
    return `┌${'─'.repeat(izq)}${t}${'─'.repeat(der)}┐`
  }

  _lineaCajaFin (ancho) {
    return `└${'─'.repeat(ancho - 2)}┘`
  }

  _lineaSeparador (ancho) {
    return `├${'─'.repeat(ancho - 2)}┤`
  }

  _lineaContenido (ancho, texto) {
    const contenido = (texto ?? '').toString()
    const recortado = contenido.length > (ancho - 4) ? `${contenido.slice(0, ancho - 7)}...` : contenido
    return `│ ${recortado.padEnd(ancho - 4, ' ')} │`
  }
}

module.exports = {
  PanelConsola
}
