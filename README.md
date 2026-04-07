# GymBots

Sistema avanzado y modular de bots para Minecraft basado en Mineflayer, controlado desde terminal.

Autoría: c1q_ | M-Society | Gym Client Team

## Requisitos

- Node.js >= 22
- Un servidor de Minecraft accesible

## Instalación

```bash
npm install
```

Opcional (para usar el comando `gymbots` globalmente):

```bash
npm link
```

## Uso rápido

```bash
npm start
```

O:

```bash
gymbots
```

GymBots guarda su configuración de usuario en:

```bash
~/.gymbots/config.json
```

## Comandos CLI

```bash
gymbots                          # Modo interactivo (menú)
gymbots init                      # Inicializa configuración en ~/.gymbots/config.json
gymbots run                       # Ejecuta el sistema usando ~/.gymbots/config.json
gymbots servidor set              # Asistente para host/puerto/version/auth

gymbots web show                  # Muestra configuración web
gymbots web set                   # Configura web (host/port/token)
gymbots web on                    # Habilita control web
gymbots web off                   # Deshabilita control web

gymbots bot add                   # Asistente para crear bot
gymbots bot list                  # Lista bots configurados
gymbots bot rm <id>               # Elimina un bot por id
gymbots bot clear [--yes]         # Elimina TODOS los bots de la configuración
gymbots bot spam                  # Asistente para agregar bots masivos

gymbots permisos list <botId>     # Muestra permisos del bot
gymbots permisos grant <botId> <nivel> <usuario>   # Otorga permiso (admin|moderador|usuario)
gymbots permisos revoke <botId> <nivel> <usuario>  # Revoca permiso (admin|moderador|usuario)

gymbots config show               # Muestra la configuración actual
gymbots config path               # Muestra la ruta de configuración
```

## Configuración

La configuración se persiste en `~/.gymbots/config.json`.

Puntos clave:

- `servidor.host`, `servidor.port`, `servidor.version`, `servidor.auth`.
- `bots[]`: lista de bots.
- Límite duro: **2000 bots** por configuración.

## Permisos

Los comandos del chat se protegen por nivel:

- `admin`
- `moderador`
- `usuario`

Ejemplos:

```bash
gymbots permisos list bot-1
gymbots permisos grant bot-1 admin TuNick
gymbots permisos grant bot-1 moderador TuNick
gymbots permisos revoke bot-1 moderador TuNick
```

Notas:

- El bot decide permisos por el `username` que aparece en el evento `chat`.
- En `usuario`, por defecto se permite `*`.

## Interfaz en consola

Al ejecutar, se muestra un panel ASCII con:

- Bots conectados / totales
- Estado de conexión
- Posición, dimensión, salud y comida
- Contadores de eventos y errores

## Comandos en el chat (prefijo configurable)

Por defecto el prefijo es `!`.

Incluye comandos para:

- Chat y permisos
- Bloques (ver/buscar/minar/colocar)
- Entidades (cercanos/seguir/atacar)
- Inventario (items/equipar/tirar/cofre)
- Movimiento (mirar/control/ir)
- Acciones (comer/pescar/usar/craftear)

## Web (control remoto)

GymBots puede exponer un servidor web (configurable) para monitoreo/control.

Configura con:

```bash
gymbots web set
gymbots web on
```

## Sistema de plugins

Carpeta por defecto:

- `src/plugins`

Ejemplo incluido:

- `src/plugins/ejemplo.js`

Habilitación:

- `sistema.plugins.habilitados`: lista de nombres de archivo (sin extensión).

## Solución de problemas

### Mineflayer requiere Node >= 22

Si usas Node 20, puede instalar pero fallar en runtime.

### Bot no conecta

Verifica:

- `host` y `port`
- `auth`:
  - `offline` para servidores sin premium
  - `microsoft` para premium

## Licencia

MIT
