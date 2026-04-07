const path = require('path')

const { cargarConfiguracion } = require('./core/config')
const { crearLogger } = require('./utils/logger')
const { GestorBots } = require('./core/bot_manager')
const { PanelConsola } = require('./core/panel')
const { GestorPlugins } = require('./core/plugin_manager')
const { manejarFalloFatal } = require('./utils/errors')

async function main () {
  const rutaConfig = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.resolve(__dirname, '../config/config.ejemplo.json')

  const config = await cargarConfiguracion(rutaConfig)
  const logger = crearLogger({ nivel: config.sistema?.nivelLog ?? 'info' })

  const gestorPlugins = new GestorPlugins({
    logger,
    carpeta: config.sistema?.plugins?.carpeta,
    habilitados: config.sistema?.plugins?.habilitados
  })

  const panel = new PanelConsola({
    logger,
    habilitado: config.sistema?.panel?.habilitado ?? true,
    intervaloMs: config.sistema?.panel?.intervaloMs ?? 500
  })

  const gestorBots = new GestorBots({
    logger,
    config,
    gestorPlugins,
    panel
  })

  panel.conectarFuenteEstado(() => gestorBots.obtenerEstadoGlobal())

  process.on('SIGINT', async () => {
    logger.info('sistema', 'Cierre solicitado. Finalizando bots...')
    await gestorBots.detenerTodos('SIGINT')
    panel.detener()
    process.exit(0)
  })

  await gestorBots.iniciarTodos()
  panel.iniciar()
}

main().catch((err) => manejarFalloFatal(err))
