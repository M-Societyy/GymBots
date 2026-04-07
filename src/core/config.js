const fs = require('fs/promises')

async function cargarConfiguracion (ruta) {
  const contenido = await fs.readFile(ruta, 'utf8')
  let json
  try {
    json = JSON.parse(contenido)
  } catch (err) {
    const error = new Error(`Configuración inválida: ${err.message}`)
    error.causa = err
    throw error
  }

  if (!json?.servidor || !Array.isArray(json?.bots)) {
    throw new Error('Configuración inválida: se requiere "servidor" y un arreglo "bots"')
  }

  return json
}

module.exports = {
  cargarConfiguracion
}
