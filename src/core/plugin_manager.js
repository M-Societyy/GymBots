const fs = require('fs')
const path = require('path')

class GestorPlugins {
  constructor ({ logger, carpeta, habilitados } = {}) {
    this.logger = logger
    this.carpeta = carpeta ? path.resolve(carpeta) : null
    this.habilitados = Array.isArray(habilitados) ? habilitados : []
  }

  cargarParaBot ({ bot, contexto }) {
    if (!this.carpeta) return
    if (!fs.existsSync(this.carpeta)) {
      this.logger?.warn('plugins', `Carpeta de plugins no encontrada: ${this.carpeta}`)
      return
    }

    const archivos = fs.readdirSync(this.carpeta)
      .filter(f => f.endsWith('.js'))
      .map(f => path.join(this.carpeta, f))

    for (const ruta of archivos) {
      const nombre = path.basename(ruta, '.js')
      if (this.habilitados.length > 0 && !this.habilitados.includes(nombre)) continue

      try {
        const plugin = require(ruta)
        if (typeof plugin !== 'function') {
          this.logger?.warn('plugins', `Plugin inválido (no es función): ${nombre}`)
          continue
        }
        plugin({ bot, contexto, logger: this.logger })
        this.logger?.info('plugins', `Plugin cargado: ${nombre}`)
      } catch (err) {
        this.logger?.error('plugins', `Error cargando plugin: ${nombre}`, err?.message)
      }
    }
  }
}

module.exports = {
  GestorPlugins
}
