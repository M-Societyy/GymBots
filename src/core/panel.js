const readline = require('readline')

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
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m'
}

const BANNER = [
  `${C.cyan}${C.bold}   ██████╗ ██╗   ██╗███╗   ███╗${C.magenta}██████╗  ██████╗ ████████╗███████╗${C.reset}`,
  `${C.cyan}${C.bold}  ██╔════╝ ╚██╗ ██╔╝████╗ ████║${C.magenta}██╔══██╗██╔═══██╗╚══██╔══╝██╔════╝${C.reset}`,
  `${C.cyan}${C.bold}  ██║  ███╗ ╚████╔╝ ██╔████╔██║${C.magenta}██████╔╝██║   ██║   ██║   ███████╗${C.reset}`,
  `${C.cyan}${C.bold}  ██║   ██║  ╚██╔╝  ██║╚██╔╝██║${C.magenta}██╔══██╗██║   ██║   ██║   ╚════██║${C.reset}`,
  `${C.cyan}${C.bold}  ╚██████╔╝   ██║   ██║ ╚═╝ ██║${C.magenta}██████╔╝╚██████╔╝   ██║   ███████║${C.reset}`,
  `${C.cyan}${C.bold}   ╚═════╝    ╚═╝   ╚═╝     ╚═╝${C.magenta}╚═════╝  ╚═════╝    ╚═╝   ╚══════╝${C.reset}`
]

const ESTADO_ICONO = {
  conectado: `${C.green}●${C.reset}`,
  conectando: `${C.yellow}◌${C.reset}`,
  desconectado: `${C.red}○${C.reset}`,
  expulsado: `${C.red}✖${C.reset}`,
  error: `${C.red}⚠${C.reset}`,
  cerrado: `${C.gray}■${C.reset}`
}

function _stripAnsi (str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

function _barra (valor, max, largo, colorLleno, colorVacio) {
  const v = Math.max(0, Math.min(max, Number(valor) || 0))
  const lleno = Math.round((v / max) * largo)
  const vacio = largo - lleno
  return `${colorLleno}${'█'.repeat(lleno)}${colorVacio}${'░'.repeat(vacio)}${C.reset}`
}

function _uptime (startMs) {
  const diff = Math.floor((Date.now() - startMs) / 1000)
  const h = Math.floor(diff / 3600)
  const m = Math.floor((diff % 3600) / 60)
  const s = diff % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

class PanelConsola {
  constructor ({ logger, habilitado = true, intervaloMs = 500 } = {}) {
    this.logger = logger
    this.habilitado = habilitado
    this.intervaloMs = intervaloMs
    this._timer = null
    this._fuente = null
    this._renderHabilitado = true
    this._ultimaAltura = 0
    this._inicioMs = Date.now()

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
    this._inicioMs = Date.now()
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
    const ancho = Math.max(70, process.stdout.columns || 120)
    const interior = ancho - 4

    const lineas = []

    // ── Banner ──
    lineas.push(`${C.gray}${'═'.repeat(ancho)}${C.reset}`)
    for (const l of BANNER) {
      lineas.push(this._centrar(l, ancho))
    }
    lineas.push(`${C.dim}${this._centrarTexto('c1q_ | M-Society | Gym Client Team', ancho)}${C.reset}`)
    lineas.push(`${C.gray}${'═'.repeat(ancho)}${C.reset}`)

    // ── Info bar ──
    const bots = estado?.bots ?? []
    const total = bots.length
    const enLinea = bots.filter(b => b?.conexion?.estado === 'conectado').length
    const tick = estado?.tick ?? 0
    const errores = estado?.erroresRecientes ?? 0
    const eventos = estado?.eventosRecientes ?? 0
    const up = _uptime(this._inicioMs)

    const botsColor = enLinea === total && total > 0
      ? `${C.green}${C.bold}${enLinea}/${total}${C.reset}`
      : enLinea > 0
        ? `${C.yellow}${C.bold}${enLinea}/${total}${C.reset}`
        : `${C.red}${C.bold}${enLinea}/${total}${C.reset}`

    const errColor = errores > 0 ? `${C.red}${C.bold}${errores}${C.reset}` : `${C.green}0${C.reset}`

    const infoBar = `  ${C.cyan}⏱${C.reset} ${C.white}${up}${C.reset}  ${C.gray}│${C.reset}  ${C.cyan}🤖${C.reset} Bots: ${botsColor}  ${C.gray}│${C.reset}  ${C.cyan}⚡${C.reset} Tick: ${C.white}${tick}${C.reset}  ${C.gray}│${C.reset}  ${C.cyan}📡${C.reset} Eventos: ${C.white}${eventos}${C.reset}  ${C.gray}│${C.reset}  ${C.cyan}⚠${C.reset}  Errores: ${errColor}`
    lineas.push(infoBar)

    lineas.push(`${C.gray}${'─'.repeat(ancho)}${C.reset}`)

    // ── Bot list ──
    if (total === 0) {
      lineas.push('')
      lineas.push(this._centrarTexto(`${C.yellow}Sin bots activos. Configura bots con: gymbots bot add${C.reset}`, ancho))
      lineas.push('')
    } else {
      // Header
      const hdr = `  ${C.bold}${C.white}${'ID'.padEnd(14)}${'USUARIO'.padEnd(16)}${'ESTADO'.padEnd(14)}${'SERVIDOR'.padEnd(22)}${'DIM'.padEnd(14)}${'POS'.padEnd(24)}${'VIDA'.padEnd(14)}${'COMIDA'.padEnd(14)}${C.reset}`
      lineas.push(hdr)
      lineas.push(`${C.gray}${'─'.repeat(ancho)}${C.reset}`)

      for (const b of bots) {
        lineas.push(this._filaBot(b))
      }
    }

    lineas.push(`${C.gray}${'─'.repeat(ancho)}${C.reset}`)

    // ── Footer ──
    const pie = `  ${C.dim}Consola: ${C.reset}${C.cyan}:help${C.reset}${C.dim} │ Comandos en chat: usa prefijo ${C.reset}${C.cyan}!${C.reset}${C.dim} │ Web: ${C.reset}${C.cyan}gymbots web on${C.reset}`
    lineas.push(pie)
    lineas.push(`${C.gray}${'═'.repeat(ancho)}${C.reset}`)

    const salida = lineas.join('\n')

    this._limpiarPantalla()
    process.stdout.write(salida)

    this._ultimaAltura = lineas.length
    readline.cursorTo(process.stdout, 0, this._ultimaAltura)
  }

  _filaBot (b) {
    const id = (b?.id ?? 'sin-id').slice(0, 12)
    const usuario = (b?.username ?? '').slice(0, 14)
    const estadoRaw = b?.conexion?.estado ?? 'desconocido'
    const icono = ESTADO_ICONO[estadoRaw] ?? `${C.gray}?${C.reset}`
    const estadoTxt = `${icono} ${estadoRaw}`
    const servidor = (b?.conexion?.servidor ?? '').slice(0, 20)
    const dimension = (b?.estado?.dimension ?? '').replace('minecraft:', '').slice(0, 12)
    const pos = (b?.estado?.posicion ?? '').slice(0, 22)

    const vida = Number(b?.estado?.salud) || 0
    const comida = Number(b?.estado?.comida) || 0
    const barraVida = _barra(vida, 20, 10, C.red, C.gray)
    const barraComida = _barra(comida, 20, 10, C.yellow, C.gray)

    const vidaTxt = `${barraVida} ${C.white}${vida}${C.reset}`
    const comidaTxt = `${barraComida} ${C.white}${comida}${C.reset}`

    return `  ${C.cyan}${id.padEnd(14)}${C.reset}${C.white}${usuario.padEnd(16)}${C.reset}${this._padConAnsi(estadoTxt, 14)}${C.gray}${servidor.padEnd(22)}${C.reset}${C.green}${dimension.padEnd(14)}${C.reset}${C.blue}${pos.padEnd(24)}${C.reset}${vidaTxt}    ${comidaTxt}`
  }

  _centrar (textoAnsi, ancho) {
    const visible = _stripAnsi(textoAnsi).length
    const pad = Math.max(0, Math.floor((ancho - visible) / 2))
    return ' '.repeat(pad) + textoAnsi
  }

  _centrarTexto (textoAnsi, ancho) {
    const visible = _stripAnsi(textoAnsi).length
    const pad = Math.max(0, Math.floor((ancho - visible) / 2))
    return ' '.repeat(pad) + textoAnsi
  }

  _padConAnsi (textoAnsi, largo) {
    const visible = _stripAnsi(textoAnsi).length
    const faltan = Math.max(0, largo - visible)
    return textoAnsi + ' '.repeat(faltan)
  }
}

module.exports = {
  PanelConsola
}
