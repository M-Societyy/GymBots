const os = require('os')
const path = require('path')
const fs = require('fs/promises')

function rutaBaseUsuario () {
  return path.join(os.homedir(), '.gymbots')
}

function rutaConfigUsuario () {
  return path.join(rutaBaseUsuario(), 'config.json')
}

function configPorDefecto () {
  return {
    sistema: {
      prefijoComandos: '!',
      nivelLog: 'info',
      panel: { habilitado: true, intervaloMs: 500 },
      consola: { habilitada: true, prompt: 'gymbots> ', objetivoPorDefecto: 'all' },
      web: { habilitado: false, host: '127.0.0.1', port: 3000, token: null },
      reconexion: { habilitada: true, intentosMaximos: 0, esperaBaseMs: 2500, esperaMaxMs: 30000 },
      plugins: { carpeta: './src/plugins', habilitados: [] }
    },
    servidor: { host: 'localhost', port: 25565, version: false, auth: 'offline' },
    bots: [
      {
        id: 'bot-1',
        username: 'GymBot_1',
        password: null,
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
        pathfinder: { habilitado: true },
        acciones: { autoComer: { umbral: 14 } }
      }
    ]
  }
}

async function asegurarCarpeta () {
  await fs.mkdir(rutaBaseUsuario(), { recursive: true })
}

async function cargarConfigUsuario () {
  await asegurarCarpeta()
  const ruta = rutaConfigUsuario()
  try {
    const raw = await fs.readFile(ruta, 'utf8')
    return JSON.parse(raw)
  } catch (err) {
    if (err?.code === 'ENOENT') return null
    throw err
  }
}

async function guardarConfigUsuario (config) {
  await asegurarCarpeta()
  const ruta = rutaConfigUsuario()
  const raw = JSON.stringify(config, null, 2) + '\n'
  await fs.writeFile(ruta, raw, 'utf8')
  return ruta
}

module.exports = {
  rutaBaseUsuario,
  rutaConfigUsuario,
  configPorDefecto,
  cargarConfigUsuario,
  guardarConfigUsuario
}
