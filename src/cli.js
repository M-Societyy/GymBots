#!/usr/bin/env node

const readline = require('readline/promises')
const { stdin: input, stdout: output } = require('process')
const { C } = require('./utils/logger')

const { iniciarSistema } = require('./app')
const { cargarConfiguracion } = require('./core/config')
const {
  rutaConfigUsuario,
  configPorDefecto,
  cargarConfigUsuario,
  guardarConfigUsuario
} = require('./core/config_store')

const LIMITE_BOTS = 2000

function limpiarPantalla () {
  if (!process.stdout.isTTY) return
  process.stdout.write('\x1b[2J\x1b[H')
}

const BANNER_CLI = [
  `${C.cyan}${C.bold}   ██████╗ ██╗   ██╗███╗   ███╗${C.magenta}██████╗  ██████╗ ████████╗███████╗${C.reset}`,
  `${C.cyan}${C.bold}  ██╔════╝ ╚██╗ ██╔╝████╗ ████║${C.magenta}██╔══██╗██╔═══██╗╚══██╔══╝██╔════╝${C.reset}`,
  `${C.cyan}${C.bold}  ██║  ███╗ ╚████╔╝ ██╔████╔██║${C.magenta}██████╔╝██║   ██║   ██║   ███████╗${C.reset}`,
  `${C.cyan}${C.bold}  ██║   ██║  ╚██╔╝  ██║╚██╔╝██║${C.magenta}██╔══██╗██║   ██║   ██║   ╚════██║${C.reset}`,
  `${C.cyan}${C.bold}  ╚██████╔╝   ██║   ██║ ╚═╝ ██║${C.magenta}██████╔╝╚██████╔╝   ██║   ███████║${C.reset}`,
  `${C.cyan}${C.bold}   ╚═════╝    ╚═╝   ╚═╝     ╚═╝${C.magenta}╚═════╝  ╚═════╝    ╚═╝   ╚══════╝${C.reset}`
]

function imprimirAyuda () {
  const cmd = (c, d) => `  ${C.cyan}${C.bold}${c.padEnd(42)}${C.reset}${C.gray}${d}${C.reset}`
  const sec = (t) => `\n  ${C.magenta}${C.bold}── ${t} ──${C.reset}`

  const txt = [
    '',
    `${C.gray}${'═'.repeat(66)}${C.reset}`,
    ...BANNER_CLI,
    `${C.dim}          c1q_ | M-Society | Gym Client Team${C.reset}`,
    `${C.gray}${'═'.repeat(66)}${C.reset}`,
    sec('General'),
    cmd('gymbots', 'Modo interactivo (menú)'),
    cmd('gymbots init', 'Inicializa config en ~/.gymbots/config.json'),
    cmd('gymbots run', 'Ejecuta el sistema'),
    sec('Servidor'),
    cmd('gymbots servidor set', 'Asistente para host/puerto/version/auth'),
    sec('Web'),
    cmd('gymbots web show', 'Muestra configuración web'),
    cmd('gymbots web set', 'Configura web (host/port/token)'),
    cmd('gymbots web on', 'Habilita control web'),
    cmd('gymbots web off', 'Deshabilita control web'),
    sec('Bots'),
    cmd('gymbots bot add', 'Asistente para crear bot'),
    cmd('gymbots bot list', 'Lista bots configurados'),
    cmd('gymbots bot rm <id>', 'Elimina un bot por id'),
    cmd('gymbots bot clear [--yes]', 'Elimina TODOS los bots'),
    cmd('gymbots bot spam', 'Agregar bots masivos'),
    sec('Permisos'),
    cmd('gymbots permisos list <botId>', 'Muestra permisos del bot'),
    cmd('gymbots permisos grant <b> <n> <u>', 'Otorga permiso'),
    cmd('gymbots permisos revoke <b> <n> <u>', 'Revoca permiso'),
    sec('Config'),
    cmd('gymbots config show', 'Muestra la configuración actual'),
    cmd('gymbots config path', 'Muestra la ruta de configuración'),
    ''
  ].join('\n')
  console.log(txt)
}

async function preguntar (rl, etiqueta, porDefecto) {
  const suf = porDefecto !== undefined && porDefecto !== null ? ` (${porDefecto})` : ''
  const v = (await rl.question(`${etiqueta}${suf}: `)).trim()
  if (!v) return porDefecto
  return v
}

async function confirmar (rl, mensaje) {
  const v = (await rl.question(`${mensaje} (escribe SI para confirmar): `)).trim()
  return v.toUpperCase() === 'SI'
}

async function cmdInit () {
  const existente = await cargarConfigUsuario()
  if (existente) {
    console.log(`Ya existe configuración: ${rutaConfigUsuario()}`)
    return
  }
  const cfg = configPorDefecto()
  await guardarConfigUsuario(cfg)
  console.log(`Configuración creada: ${rutaConfigUsuario()}`)
}

async function obtenerConfigOperativa () {
  const existente = await cargarConfigUsuario()
  if (existente) return existente
  const cfg = configPorDefecto()
  await guardarConfigUsuario(cfg)
  return cfg
}

function asegurarEstructuraConfig (cfg) {
  cfg.sistema = cfg.sistema ?? {}
  cfg.sistema.web = cfg.sistema.web ?? { habilitado: false, host: '127.0.0.1', port: 3000, token: null }
  cfg.servidor = cfg.servidor ?? { host: 'localhost', port: 25565, version: false, auth: 'offline' }
  cfg.bots = Array.isArray(cfg.bots) ? cfg.bots : []
}

function recortarBots (cfg) {
  if (!Array.isArray(cfg.bots)) cfg.bots = []
  if (cfg.bots.length <= LIMITE_BOTS) return
  cfg.bots = cfg.bots.slice(0, LIMITE_BOTS)
}

async function cmdServidorSet (rlExterno) {
  const rl = rlExterno ?? readline.createInterface({ input, output })
  const propio = !rlExterno
  try {
    const cfg = await obtenerConfigOperativa()
    asegurarEstructuraConfig(cfg)

    const host = await preguntar(rl, 'Host', cfg.servidor?.host ?? 'localhost')
    const port = Number(await preguntar(rl, 'Puerto', cfg.servidor?.port ?? 25565))
    const versionRaw = await preguntar(rl, 'Versión (false para autodetectar)', cfg.servidor?.version ?? false)
    const version = (versionRaw === 'false' || versionRaw === false) ? false : String(versionRaw)
    const auth = await preguntar(rl, 'Auth (offline|microsoft)', cfg.servidor?.auth ?? 'offline')

    cfg.servidor = { host, port, version, auth }
    await guardarConfigUsuario(cfg)

    console.log('Servidor actualizado')
  } finally {
    if (propio) rl.close()
  }
}

async function cmdWebShow () {
  const cfg = await cargarConfigUsuario()
  if (!cfg) {
    console.log('Sin configuración. Ejecuta: gymbots init')
    return
  }
  asegurarEstructuraConfig(cfg)
  console.log(JSON.stringify(cfg.sistema?.web ?? {}, null, 2))
}

async function cmdWebOnOff (habilitado) {
  const cfg = await obtenerConfigOperativa()
  asegurarEstructuraConfig(cfg)
  cfg.sistema.web.habilitado = Boolean(habilitado)
  await guardarConfigUsuario(cfg)
  console.log(`Web: ${cfg.sistema.web.habilitado ? 'habilitado' : 'deshabilitado'}`)
}

async function cmdWebSet (rlExterno) {
  const rl = rlExterno ?? readline.createInterface({ input, output })
  const propio = !rlExterno
  try {
    const cfg = await obtenerConfigOperativa()
    asegurarEstructuraConfig(cfg)

    const habilitadoRaw = await preguntar(rl, 'Habilitar web (si/no)', cfg.sistema?.web?.habilitado ? 'si' : 'no')
    const host = await preguntar(rl, 'Host web', cfg.sistema?.web?.host ?? '127.0.0.1')
    const port = Number(await preguntar(rl, 'Puerto web', cfg.sistema?.web?.port ?? 3000))
    const token = await preguntar(rl, 'Token (vacío = sin token)', cfg.sistema?.web?.token ?? '')

    cfg.sistema.web = {
      habilitado: String(habilitadoRaw).toLowerCase().startsWith('s'),
      host,
      port,
      token: token ? token : null
    }

    await guardarConfigUsuario(cfg)
    console.log('Web actualizado')
  } finally {
    if (propio) rl.close()
  }
}

async function cmdBotAdd (rlExterno) {
  const rl = rlExterno ?? readline.createInterface({ input, output })
  const propio = !rlExterno
  try {
    const cfg = await obtenerConfigOperativa()
    asegurarEstructuraConfig(cfg)
    recortarBots(cfg)

    const id = await preguntar(rl, 'Id del bot', `bot-${cfg.bots.length + 1}`)
    const username = await preguntar(rl, 'Username', `GymBot_${cfg.bots.length + 1}`)
    const password = await preguntar(rl, 'Password (vacío si no aplica)', '')
    const pf = await preguntar(rl, 'Pathfinder (si/no)', 'si')

    const botCfg = {
      id,
      username,
      password: password ? password : null,
      permisos: { admin: [], moderador: [], usuario: ['*'] },
      modulos: {
        chat: true,
        eventos: true,
        estado: true,
        bloques: true,
        entidades: true,
        inventario: true,
        movimiento: true,
        acciones: true
      },
      pathfinder: { habilitado: String(pf).toLowerCase().startsWith('s') }
    }

    cfg.bots.push(botCfg)
    recortarBots(cfg)
    await guardarConfigUsuario(cfg)
    console.log(`Bot agregado: ${id}`)
  } finally {
    if (propio) rl.close()
  }
}

async function cmdBotsSpam (rlExterno) {
  const rl = rlExterno ?? readline.createInterface({ input, output })
  const propio = !rlExterno
  try {
    const cfg = await obtenerConfigOperativa()
    asegurarEstructuraConfig(cfg)
    recortarBots(cfg)

    const disponibles = Math.max(0, LIMITE_BOTS - cfg.bots.length)
    if (disponibles === 0) {
      console.log(`Límite alcanzado: ${LIMITE_BOTS} bots`) 
      return
    }

    console.log(`Bots actuales: ${cfg.bots.length} / ${LIMITE_BOTS}`)

    const cantidad = Number(await preguntar(rl, `Cantidad a agregar (1..${disponibles})`, Math.min(10, disponibles)))
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      console.log('Cantidad inválida')
      return
    }
    const cantFinal = Math.min(disponibles, Math.min(LIMITE_BOTS, Math.floor(cantidad)))

    const prefijoId = await preguntar(rl, 'Prefijo id', 'spam')
    const prefijoUser = await preguntar(rl, 'Prefijo username', 'SpamBot')
    const desde = Number(await preguntar(rl, 'Numeración inicial', 1))
    const password = await preguntar(rl, 'Password (vacío si no aplica)', '')
    const pf = await preguntar(rl, 'Pathfinder (si/no)', 'no')

    const base = Math.max(1, Number.isFinite(desde) ? Math.floor(desde) : 1)
    const pfHabilitado = String(pf).toLowerCase().startsWith('s')

    for (let i = 0; i < cantFinal; i++) {
      const n = base + i
      const id = `${prefijoId}-${n}`
      const username = `${prefijoUser}_${n}`
      cfg.bots.push({
        id,
        username,
        password: password ? password : null,
        permisos: { admin: [], moderador: [], usuario: ['*'] },
        modulos: {
          chat: true,
          eventos: true,
          estado: true,
          bloques: true,
          entidades: true,
          inventario: true,
          movimiento: true,
          acciones: true
        },
        pathfinder: { habilitado: pfHabilitado }
      })
      if (cfg.bots.length >= LIMITE_BOTS) break
    }

    recortarBots(cfg)
    await guardarConfigUsuario(cfg)
    console.log(`Bots agregados: ${cantFinal}`)
  } finally {
    if (propio) rl.close()
  }
}

async function cmdBotList () {
  const cfg = await cargarConfigUsuario()
  if (!cfg) {
    console.log('Sin configuración. Ejecuta: gymbots init')
    return
  }
  const bots = cfg.bots ?? []
  if (bots.length === 0) {
    console.log('Sin bots configurados')
    return
  }
  for (const b of bots) {
    console.log(`${b.id}  ${b.username}`)
  }
}

async function cmdBotRm (id) {
  if (!id) {
    console.log('Uso: gymbots bot rm <id>')
    return
  }
  const cfg = await cargarConfigUsuario()
  if (!cfg) {
    console.log('Sin configuración. Ejecuta: gymbots init')
    return
  }
  const antes = cfg.bots?.length ?? 0
  cfg.bots = (cfg.bots ?? []).filter(b => b.id !== id)
  const despues = cfg.bots.length
  if (antes === despues) {
    console.log('No existe ese id')
    return
  }
  await guardarConfigUsuario(cfg)
  console.log(`Bot eliminado: ${id}`)
}

async function cmdBotClear (opciones = {}) {
  const { yes = false, rl: rlExterno } = opciones
  const cfg = await cargarConfigUsuario()
  if (!cfg) {
    console.log('Sin configuración. Ejecuta: gymbots init')
    return
  }

  const total = cfg.bots?.length ?? 0
  if (total === 0) {
    console.log('No hay bots para eliminar')
    return
  }

  if (!yes) {
    const rl = rlExterno ?? readline.createInterface({ input, output })
    const propio = !rlExterno
    try {
      const ok = await confirmar(rl, `Esto eliminará ${total} bots de la configuración`) 
      if (!ok) {
        console.log('Cancelado')
        return
      }
    } finally {
      if (propio) rl.close()
    }
  }

  cfg.bots = []
  await guardarConfigUsuario(cfg)
  console.log(`Bots eliminados: ${total}`)
}

function normalizarNivel (nivel) {
  const n = String(nivel ?? '').toLowerCase()
  if (n === 'admin' || n === 'moderador' || n === 'usuario') return n
  return null
}

function obtenerBotPorId (cfg, botId) {
  const bots = cfg?.bots ?? []
  return bots.find(b => b.id === botId)
}

async function cmdPermisosList (botId) {
  if (!botId) {
    console.log('Uso: gymbots permisos list <botId>')
    return
  }
  const cfg = await cargarConfigUsuario()
  if (!cfg) {
    console.log('Sin configuración. Ejecuta: gymbots init')
    return
  }
  const botCfg = obtenerBotPorId(cfg, botId)
  if (!botCfg) {
    console.log('Bot no encontrado')
    return
  }
  const p = botCfg.permisos ?? { admin: [], moderador: [], usuario: ['*'] }
  console.log(JSON.stringify(p, null, 2))
}

async function cmdPermisosGrant (botId, nivel, usuario) {
  if (!botId || !nivel || !usuario) {
    console.log('Uso: gymbots permisos grant <botId> <nivel> <usuario>')
    return
  }
  const n = normalizarNivel(nivel)
  if (!n) {
    console.log('Nivel inválido. Usa: admin | moderador | usuario')
    return
  }
  const cfg = await cargarConfigUsuario()
  if (!cfg) {
    console.log('Sin configuración. Ejecuta: gymbots init')
    return
  }
  const botCfg = obtenerBotPorId(cfg, botId)
  if (!botCfg) {
    console.log('Bot no encontrado')
    return
  }
  botCfg.permisos = botCfg.permisos ?? { admin: [], moderador: [], usuario: ['*'] }
  botCfg.permisos[n] = Array.isArray(botCfg.permisos[n]) ? botCfg.permisos[n] : []
  if (!botCfg.permisos[n].includes(usuario)) botCfg.permisos[n].push(usuario)
  await guardarConfigUsuario(cfg)
  console.log(`Permiso otorgado: ${botId} ${n} ${usuario}`)
}

async function cmdPermisosRevoke (botId, nivel, usuario) {
  if (!botId || !nivel || !usuario) {
    console.log('Uso: gymbots permisos revoke <botId> <nivel> <usuario>')
    return
  }
  const n = normalizarNivel(nivel)
  if (!n) {
    console.log('Nivel inválido. Usa: admin | moderador | usuario')
    return
  }
  const cfg = await cargarConfigUsuario()
  if (!cfg) {
    console.log('Sin configuración. Ejecuta: gymbots init')
    return
  }
  const botCfg = obtenerBotPorId(cfg, botId)
  if (!botCfg) {
    console.log('Bot no encontrado')
    return
  }
  botCfg.permisos = botCfg.permisos ?? { admin: [], moderador: [], usuario: ['*'] }
  botCfg.permisos[n] = (botCfg.permisos[n] ?? []).filter(u => u !== usuario)
  await guardarConfigUsuario(cfg)
  console.log(`Permiso revocado: ${botId} ${n} ${usuario}`)
}

async function cmdConfigShow () {
  const cfg = await cargarConfigUsuario()
  if (!cfg) {
    console.log('Sin configuración. Ejecuta: gymbots init')
    return
  }
  console.log(JSON.stringify(cfg, null, 2))
}

async function cmdRun () {
  const ruta = rutaConfigUsuario()
  const cfgUsuario = await cargarConfigUsuario()
  if (!cfgUsuario) {
    console.log('Sin configuración. Ejecuta: gymbots init')
    return
  }

  const cfgValidada = await cargarConfiguracion(ruta)
  await iniciarSistema({ config: cfgValidada })
}

function imprimirMenu (cfg) {
  const s = cfg?.servidor ?? {}
  const bots = cfg?.bots?.length ?? 0
  const w = cfg?.sistema?.web ?? {}

  const webEstado = w.habilitado
    ? `${C.green}${C.bold}ON${C.reset}`
    : `${C.red}${C.bold}OFF${C.reset}`

  const botsColor = bots > 0
    ? `${C.green}${C.bold}${bots}${C.reset}`
    : `${C.yellow}${C.bold}${bots}${C.reset}`

  const out = [
    '',
    `${C.gray}${'═'.repeat(66)}${C.reset}`,
    ...BANNER_CLI,
    `${C.dim}          c1q_ | M-Society | Gym Client Team${C.reset}`,
    `${C.gray}${'═'.repeat(66)}${C.reset}`,
    '',
    `  ${C.cyan}${C.bold}┌─ Servidor ─────────────────────────────────────────┐${C.reset}`,
    `  ${C.cyan}│${C.reset}  Host: ${C.white}${C.bold}${s.host ?? 'localhost'}${C.reset}    Puerto: ${C.white}${C.bold}${s.port ?? 25565}${C.reset}`,
    `  ${C.cyan}│${C.reset}  Versión: ${C.white}${s.version || 'auto'}${C.reset}    Auth: ${C.white}${s.auth ?? 'offline'}${C.reset}`,
    `  ${C.cyan}│${C.reset}  Bots: ${botsColor}${C.gray} / ${LIMITE_BOTS}${C.reset}    Web: ${webEstado}`,
    `  ${C.cyan}${C.bold}└────────────────────────────────────────────────────┘${C.reset}`,
    '',
    `  ${C.gray}${'─'.repeat(52)}${C.reset}`,
    `  ${C.green}${C.bold}1${C.reset} ${C.gray}│${C.reset} ${C.white}Configurar servidor${C.reset}`,
    `  ${C.green}${C.bold}2${C.reset} ${C.gray}│${C.reset} ${C.white}Configurar web${C.reset}`,
    `  ${C.cyan}${C.bold}3${C.reset} ${C.gray}│${C.reset} ${C.white}Agregar bot${C.reset}`,
    `  ${C.cyan}${C.bold}4${C.reset} ${C.gray}│${C.reset} ${C.white}Agregar bots masivos (spam)${C.reset}`,
    `  ${C.cyan}${C.bold}5${C.reset} ${C.gray}│${C.reset} ${C.white}Listar bots${C.reset}`,
    `  ${C.magenta}${C.bold}6${C.reset} ${C.gray}│${C.reset} ${C.white}Permisos (grant/revoke/list)${C.reset}`,
    `  ${C.red}${C.bold}7${C.reset} ${C.gray}│${C.reset} ${C.white}Eliminar TODOS los bots${C.reset}`,
    `  ${C.yellow}${C.bold}8${C.reset} ${C.gray}│${C.reset} ${C.white}Ver configuración${C.reset}`,
    `  ${C.green}${C.bold}9${C.reset} ${C.gray}│${C.reset} ${C.green}${C.bold}Ejecutar GymBots${C.reset}  ${C.cyan}▶${C.reset}`,
    `  ${C.red}${C.bold}0${C.reset} ${C.gray}│${C.reset} ${C.dim}Salir${C.reset}`,
    `  ${C.gray}${'─'.repeat(52)}${C.reset}`,
    ''
  ]
  console.log(out.join('\n'))
}

async function menuPermisos (rlExterno) {
  const rl = rlExterno ?? readline.createInterface({ input, output })
  const propio = !rlExterno
  try {
    const botId = await preguntar(rl, 'Bot id', 'bot-1')
    const accion = await preguntar(rl, 'Acción (list|grant|revoke)', 'list')
    const a = String(accion).toLowerCase()
    if (a === 'list') {
      await cmdPermisosList(botId)
      return
    }
    const nivel = await preguntar(rl, 'Nivel (admin|moderador|usuario)', 'moderador')
    const usuario = await preguntar(rl, 'Usuario (nick exacto)', '')
    if (!usuario) {
      console.log('Usuario requerido')
      return
    }
    if (a === 'grant') return cmdPermisosGrant(botId, nivel, usuario)
    if (a === 'revoke') return cmdPermisosRevoke(botId, nivel, usuario)
    console.log('Acción inválida')
  } finally {
    if (propio) rl.close()
  }
}

async function modoInteractivo () {
  let cfg = await obtenerConfigOperativa()
  asegurarEstructuraConfig(cfg)
  recortarBots(cfg)

  const rl = readline.createInterface({ input, output })
  try {
    while (true) {
      cfg = await obtenerConfigOperativa()
      asegurarEstructuraConfig(cfg)
      recortarBots(cfg)
      limpiarPantalla()
      imprimirMenu(cfg)

      const op = (await rl.question(`${C.cyan}${C.bold}  ▸ ${C.reset}${C.white}Selecciona una opción: ${C.reset}`)).trim()
      if (op === '0') return
      if (op === '1') await cmdServidorSet(rl)
      else if (op === '2') await cmdWebSet(rl)
      else if (op === '3') await cmdBotAdd(rl)
      else if (op === '4') await cmdBotsSpam(rl)
      else if (op === '5') await cmdBotList()
      else if (op === '6') await menuPermisos(rl)
      else if (op === '7') await cmdBotClear({ rl })
      else if (op === '8') await cmdConfigShow()
      else if (op === '9') {
        console.log(`\n  ${C.green}${C.bold}▶ Iniciando GymBots v1.0.2...${C.reset}\n`)
        rl.close()
        await cmdRun()
        return
      } else {
        console.log('Opción inválida')
      }

      await rl.question(`${C.dim}  Enter para continuar...${C.reset}`)
    }
  } finally {
    rl.close()
  }
}

async function main () {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    await modoInteractivo()
    return
  }

  if (args[0] === '--help' || args[0] === '-h') {
    imprimirAyuda()
    return
  }

  if (args[0] === 'init') return cmdInit()
  if (args[0] === 'run') return cmdRun()
  if (args[0] === 'servidor' && args[1] === 'set') return cmdServidorSet()

  if (args[0] === 'web' && args[1] === 'show') return cmdWebShow()
  if (args[0] === 'web' && args[1] === 'set') return cmdWebSet()
  if (args[0] === 'web' && args[1] === 'on') return cmdWebOnOff(true)
  if (args[0] === 'web' && args[1] === 'off') return cmdWebOnOff(false)

  if (args[0] === 'bot' && args[1] === 'add') return cmdBotAdd()
  if (args[0] === 'bot' && args[1] === 'list') return cmdBotList()
  if (args[0] === 'bot' && args[1] === 'rm') return cmdBotRm(args[2])
  if (args[0] === 'bot' && args[1] === 'clear') {
    const yes = args.includes('--yes')
    return cmdBotClear({ yes })
  }

  if (args[0] === 'bot' && args[1] === 'spam') return cmdBotsSpam()

  if (args[0] === 'permisos' && args[1] === 'list') return cmdPermisosList(args[2])
  if (args[0] === 'permisos' && args[1] === 'grant') return cmdPermisosGrant(args[2], args[3], args[4])
  if (args[0] === 'permisos' && args[1] === 'revoke') return cmdPermisosRevoke(args[2], args[3], args[4])

  if (args[0] === 'config' && args[1] === 'show') return cmdConfigShow()
  if (args[0] === 'config' && args[1] === 'path') {
    console.log(rutaConfigUsuario())
    return
  }

  imprimirAyuda()
}

main().catch((err) => {
  console.error('Error:', err?.message ?? err)
  process.exit(1)
})
