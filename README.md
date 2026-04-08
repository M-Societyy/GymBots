# GymBots

Sistema avanzado y modular de bots para Minecraft basado en Mineflayer, controlado desde terminal con interfaz web moderna.

**Versión: 1.0.2**

Autoría: c1q_ | M-Society | Gym Client Team

**GitHub:** https://github.com/M-Societyy/GymBots

---

## Table of Contents

- [Características Principales](#características-principales)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Uso Rápido](#uso-rápido)
- [Comandos CLI](#comandos-cli)
- [Configuración](#configuración)
- [Sistema de Permisos](#sistema-de-permisos)
- [Comandos de Chat](#comandos-de-chat)
- [Interfaz Web](#interfaz-web)
- [Sistema de Plugins](#sistema-de-plugins)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Scripts y Automatización](#scripts-y-automatización)
- [Solución de Problemas](#solución-de-problemas)
- [API Web](#api-web)
- [Licencia](#licencia)

---

## Características Principales

- **Sistema Modular**: Arquitectura basada en módulos independientes
- **Control Total**: Gestión completa de bots desde terminal o interfaz web
- **Panel ASCII**: Monitor en tiempo real con estadísticas detalladas
- **Sistema de Permisos**: Control granular de acceso por niveles
- **Reconexión Automática**: Recuperación ante caídas de conexión
- **Interfaz Web Moderna**: Panel de control responsive con WebSocket
- **Plugins Extensibles**: Sistema de plugins personalizable
- **Multi-Bot**: Soporte para hasta 2000 bots simultáneos
- **Comandos Avanzados**: Más de 30 comandos integrados

---

## Requisitos

### Sistema Operativo
- Linux, macOS o Windows

### Software
- **Node.js >= 22** (requerido por Mineflayer 4.x)
- **npm** (gestor de paquetes de Node.js)
- **Git** (para clonar y actualizar)

### Servidor Minecraft
- Cualquier servidor compatible con Minecraft Java Edition
- Versiones soportadas: 1.8.x hasta las más recientes
- Autenticación: `offline` (cracked) o `microsoft` (premium)

---

## Instalación

### Método 1: Clonar Repositorio

```bash
git clone https://github.com/M-Societyy/GymBots.git
cd GymBots
npm install
```

### Método 2: Descarga Directa

1. Descarga el ZIP desde GitHub
2. Extrae el archivo
3. Abre terminal en la carpeta extraída
4. Ejecuta `npm install`

### Instalación Global (Opcional)

```bash
npm link
```

Esto permite usar el comando `gymbots` desde cualquier directorio.

---

## Uso Rápido

### Inicio Inmediato

```bash
npm start
```

### Usando el Comando Global

```bash
gymbots
```

### Scripts Automatizados

**Linux/macOS:**
```bash
./run.sh          # Verifica dependencias e inicia
./update.sh       # Actualiza desde GitHub e inicia
./update.sh --run # Actualiza y ejecuta automáticamente
```

**Windows:**
```bash
run.bat           # Verifica dependencias e inicia
update.bat        # Actualiza desde GitHub e inicia
```

### Configuración Inicial

GymBots guarda su configuración en:
```bash
~/.gymbots/config.json
```

Para inicializar la configuración:
```bash
gymbots init
```

---

## Comandos CLI

### Sistema Principal
```bash
gymbots                          # Modo interactivo con menú
gymbots init                      # Inicializa configuración
gymbots run                       # Ejecuta sistema con configuración actual
```

### Configuración del Servidor
```bash
gymbots servidor set              # Asistente interactivo para servidor
gymbots servidor show            # Muestra configuración actual
```

### Gestión de Bots
```bash
gymbots bot add                   # Asistente para crear nuevo bot
gymbots bot list                  # Lista todos los bots configurados
gymbots bot rm <id>               # Elimina bot específico
gymbots bot clear [--yes]         # Elimina TODOS los bots
gymbots bot spam                  # Asistente para bots masivos
```

### Control Web
```bash
gymbots web show                  # Muestra configuración web
gymbots web set                   # Configura servidor web
gymbots web on                    # Habilita interfaz web
gymbots web off                   # Deshabilita interfaz web
```

### Sistema de Permisos
```bash
gymbots permisos list <botId>     # Muestra permisos del bot
gymbots permisos grant <botId> <nivel> <usuario>   # Otorga permiso
gymbots permisos revoke <botId> <nivel> <usuario>  # Revoca permiso
```

### Utilidades
```bash
gymbots config show               # Muestra configuración completa
gymbots config path               # Muestra ruta del archivo de config
```

---

## Configuración

### Archivo de Configuración

La configuración principal se almacena en `~/.gymbots/config.json`:

```json
{
  "sistema": {
    "prefijoComandos": "!",
    "nivelLog": "info",
    "panel": {
      "habilitado": true,
      "intervaloMs": 500
    },
    "reconexion": {
      "habilitada": true,
      "intentosMaximos": 0,
      "esperaBaseMs": 2500,
      "esperaMaxMs": 30000
    },
    "web": {
      "habilitado": false,
      "host": "127.0.0.1",
      "port": 3000,
      "token": null
    },
    "plugins": {
      "carpeta": "./src/plugins",
      "habilitados": []
    }
  },
  "servidor": {
    "host": "localhost",
    "port": 25565,
    "version": false,
    "auth": "offline"
  },
  "bots": [
    {
      "id": "bot-1",
      "username": "GymBot_1",
      "password": null,
      "permisos": {
        "admin": ["c1q_"],
        "moderador": [],
        "usuario": ["*"]
      },
      "modulos": {
        "chat": true,
        "eventos": true,
        "estado": true,
        "bloques": true,
        "entidades": true,
        "inventario": true,
        "movimiento": true,
        "acciones": true
      },
      "pathfinder": {
        "habilitado": true
      }
    }
  ]
}
```

### Configuración del Servidor

- **host**: Dirección IP del servidor Minecraft
- **port**: Puerto (usualmente 25565)
- **version**: Versión específica o `false` para autodetectar
- **auth**: `offline` (cracked) o `microsoft` (premium)

### Configuración de Bots

- **id**: Identificador único del bot
- **username**: Nombre que aparecerá en el juego
- **password**: Opcional, para cuentas premium
- **permisos**: Configuración de acceso por niveles
- **modulos**: Módulos habilitados para el bot

### Límites y Restricciones

- **Máximo de bots**: 2000 por configuración
- **Tamaño máximo de username**: 16 caracteres
- **Prefijo de comandos**: Configurable (por defecto `!`)

---

## Sistema de Permisos

### Niveles de Permisos

1. **admin**: Control total del bot
2. **moderador**: Comandos de gestión y control
3. **usuario**: Comandos básicos e información

### Configuración de Permisos

```json
"permisos": {
  "admin": ["c1q_", "owner"],
  "moderador": ["trusted_player"],
  "usuario": ["*"]  // * permite a todos
}
```

### Gestión de Permisos

```bash
# Otorgar permisos
gymbots permisos grant bot-1 admin TuNick
gymbots permisos grant bot-1 moderador TuNick
gymbots permisos grant bot-1 usuario TuNick

# Revocar permisos
gymbots permisos revoke bot-1 admin TuNick
gymbots permisos revoke bot-1 moderador TuNick

# Ver permisos actuales
gymbots permisos list bot-1
```

### Comportamiento

- Los permisos se basan en el `username` del chat
- La jerarquía es estricta: admin > moderador > usuario
- Si un usuario está en múltiples niveles, se usa el más alto

---

## Comandos de Chat

### Prefijo

Por defecto el prefijo es `!` (configurable en `sistema.prefijoComandos`)

### Comandos Disponibles

#### Información y Estado
```
!ayuda                    # Muestra ayuda de comandos
!estado                   # Estado actual del bot
!info <usuario>           # Información de un jugador
```

#### Chat y Comunicación
```
!decir <mensaje>          # Bot habla en chat público
!whisper <usuario> <msg>  # Envía mensaje privado
!say <mensaje>            # Alias de !decir
```

#### Movimiento y Control
```
!mirar <yaw> <pitch>      # Orienta la vista del bot
!control <tecla> <on/off> # Controla teclas (W/A/S/D/etc)
!limpiarcontroles         # Limpia todos los controles
!ir <x> <y> <z>          # Mueve a coordenadas específicas
```

#### Bloques y Construcción
```
!ver [distancia]          # Muestra bloque en cursor
!buscarbloque <bloque>    # Busca bloque cercano
!minar <bloque> [dist]    # Mina bloque específico
!colocar <dx> <dy> <dz> <bloque> # Coloca bloque
```

#### Entidades y Jugadores
```
!cercanos [radio]         # Lista entidades cercanas
!seguir <jugador>         # Sigue a un jugador
!atacar <entidad>         # Ataca entidad
!dejar                    # Deja de seguir/atacar
```

#### Inventario y Items
```
!items                    # Muestra inventario
!equipar <item> [slot]    # Equipa item
!tirar <item> [cantidad]  # Tira item al suelo
!cofre                    # Interactúa con cofre cercano
```

#### Acciones y Utilidades
```
!comer                    # Come comida disponible
!pescar                   # Pesca automáticamente
!usar [offhand]           # Usa item en mano
!dejarusar                # Deja de usar item
!craftear <item> [cantidad] # Craftea item
```

#### Análisis y Monitoreo
```
!scan                     # Escanea jugadores online
!tablist                  # Muestra tablist completo
!tps                      # Mide TPS del servidor
!serverinfo               # Info detallada del servidor
!testperms                # Prueba permisos del servidor
```

---

## Interfaz Web

### Características

- **Panel en Tiempo Real**: Monitoreo vía WebSocket
- **Control Remoto**: Ejecuta comandos desde el navegador
- **Estadísticas Visuales**: Gráficos y métricas
- **Diseño Responsive**: Funciona en móvil y desktop
- **Temas**: Soporte claro/oscuro

### Configuración Web

```bash
# Configurar servidor web
gymbots web set

# Habilitar interfaz
gymbots web on

# Ver configuración
gymbots web show
```

### Opciones de Configuración

- **host**: IP donde escuchar (por defecto 127.0.0.1)
- **port**: Puerto (por defecto 3000)
- **token**: Token de seguridad opcional

### Acceso

Una vez habilitada, accede a:
```
http://localhost:3000
```

Si configuraste token:
```
http://localhost:3000?token=TU_TOKEN
```

---

## Sistema de Plugins

### Estructura

Los plugins se almacenan en `src/plugins/`:

```javascript
// src/plugins/ejemplo.js
module.exports = function pluginEjemplo ({ bot, contexto, logger }) {
  // Registrar comando personalizado
  contexto.registrarComando({
    nombre: 'ping',
    permiso: null,
    ejecutar: async ({ usuario }) => {
      bot.whisper(usuario, 'pong')
    }
  })

  // Eventos del bot
  bot.on('spawn', () => {
    logger?.info('plugins', `Plugin ejemplo activo en ${contexto.id}`)
  })
}
```

### Habilitación

Edita `~/.gymbots/config.json`:

```json
"sistema": {
  "plugins": {
    "carpeta": "./src/plugins",
    "habilitados": ["ejemplo", "miplugin"]
  }
}
```

### API de Plugins

#### Parámetros Disponibles
- **bot**: Instancia del bot de Mineflayer
- **contexto**: Contexto de ejecución del bot
- **logger**: Sistema de logging

#### Métodos del Contexto
- **registrarComando()**: Registra nuevo comando
- **obtenerComando()**: Obtiene definición de comando
- **contadorError()**: Incrementa contador de errores
- **logger**: Sistema de logging con colores

---

## Estructura del Proyecto

```
GymBots/
|
|--- src/                          # Código fuente
|    |
|    |--- app.js                   # Aplicación principal
|    |--- cli.js                   # Interfaz de línea de comandos
|    |--- main.js                  # Punto de entrada
|    |
|    |--- core/                    # Núcleo del sistema
|    |    |--- bot_manager.js      # Gestor de bots
|    |    |--- config.js           # Configuración
|    |    |--- config_store.js     # Almacenamiento de config
|    |    |--- context.js          # Contexto de ejecución
|    |    |--- panel.js            # Panel ASCII
|    |    |--- plugin_manager.js   # Gestor de plugins
|    |
|    |--- modules/                 # Módulos de funcionalidad
|    |    |--- acciones.js         # Comandos de acciones
|    |    |--- analisis.js         # Análisis y monitoreo
|    |    |--- bloques.js          # Manipulación de bloques
|    |    |--- chat.js             # Comandos de chat
|    |    |--- entidades.js        # Gestión de entidades
|    |    |--- estado.js           # Estado del bot
|    |    |--- eventos.js          # Manejo de eventos
|    |    |--- inventario.js       # Gestión de inventario
|    |    |--- movimiento.js       # Movimiento y control
|    |    |--- player.js           # Comportamiento de jugador
|    |
|    |--- utils/                   # Utilidades
|    |    |--- command_parser.js   # Parser de comandos
|    |    |--- logger.js           # Sistema de logging
|    |
|    |--- web/                     # Servidor web
|    |    |--- server.js           # Servidor Express + WebSocket
|    |    |--- public/             # Archivos estáticos
|    |
|    |--- plugins/                 # Plugins personalizados
|         |--- ejemplo.js          # Plugin de ejemplo
|
|--- config/                       # Configuraciones de ejemplo
|    |--- config.ejemplo.json     # Plantilla de configuración
|
|--- run.sh                        # Script de ejecución (Linux/macOS)
|--- run.bat                       # Script de ejecución (Windows)
|--- update.sh                     # Script de actualización (Linux/macOS)
|--- update.bat                    # Script de actualización (Windows)
|
|--- package.json                  # Dependencias del proyecto
|--- package-lock.json             # Lock de versiones
|--- README.md                     # Este archivo
|--- .gitignore                    # Archivos ignorados por Git
```

---

## Scripts y Automatización

### Scripts de Ejecución

#### run.sh (Linux/macOS)
- Verifica instalación de Node.js >= 22
- Detecta versión de Node
- Verifica instalación de npm
- Instala dependencias si es necesario
- Inicia GymBots automáticamente

#### run.bat (Windows)
- Funcionalidad equivalente a run.sh para Windows
- Verificación de dependencias
- Instalación automática si es necesario

### Scripts de Actualización

#### update.sh (Linux/macOS)
```bash
./update.sh          # Actualiza desde GitHub
./update.sh --run     # Actualiza y ejecuta automáticamente
```

Características:
- Verifica instalación de Git
- Detecta rama actual
- Hace pull con `--ff-only` (solo fast-forward)
- Instala/actualiza dependencias
- Opción de ejecución automática

#### update.bat (Windows)
- Funcionalidad equivalente para Windows
- Manejo de ramas Git
- Actualización de dependencias

### Verificación de Dependencias

Ambos scripts verifican automáticamente:
- Node.js >= 22
- npm disponible en PATH
- Git (scripts de actualización)
- Dependencias instaladas

---

## Solución de Problemas

### Errores Comunes

#### Node.js Version Incompatible

**Error:** `Node >= 22 requerido. Versión actual: v20.x.x`

**Solución:**
```bash
# Usar nvm (recomendado)
nvm install 22
nvm use 22

# O instalar Node 22 manualmente desde nodejs.org
```

#### Bot No Conecta

**Síntomas:** Bot permanece en "desconectado"

**Verificaciones:**
1. **Host y Puerto correctos**
   ```bash
   gymbots servidor set
   ```

2. **Tipo de autenticación**
   - `offline`: Servidores sin autenticación (cracked)
   - `microsoft`: Servidores premium

3. **Versión del servidor**
   - `false`: Autodetectar (recomendado)
   - `1.19.4`: Versión específica

4. **Firewall/Antivirus**
   - Verifica que el puerto no esté bloqueado
   - Configura excepciones si es necesario

#### Errores de Permiso

**Error:** `Permiso insuficiente` al ejecutar comandos

**Solución:**
```bash
# Agrega tu usuario a permisos de admin
gymbots permisos grant bot-id admin TuNick

# Verifica permisos actuales
gymbots permisos list bot-id
```

#### Problemas de Memoria

**Síntomas:** Bot se desconecta aleatoriamente

**Soluciones:**
- Reducir número de bots simultáneos
- Aumentar memoria Node.js:
  ```bash
  NODE_OPTIONS="--max-old-space-size=4096" npm start
  ```

#### Interfaz Web No Accesible

**Síntomas:** Error 404 o conexión rechazada

**Verificaciones:**
1. Web habilitada:
   ```bash
   gymbots web show
   ```

2. Puerto correcto y disponible
3. Token configurado (si se requiere)
4. Firewall permitiendo conexiones

### Depuración

#### Niveles de Log

Configura en `~/.gymbots/config.json`:
```json
"sistema": {
  "nivelLog": "debug"  // error, warn, info, debug
}
```

#### Logs Detallados

Ejecuta con variable de entorno:
```bash
DEBUG=* npm start
```

#### Consola Interactiva

Usa comandos de depuración en consola:
```
:help     # Muestra ayuda de consola
:bots     # Lista bots activos
:use bot-1# Selecciona bot objetivo
!estado   # Estado del bot seleccionado
```

### Recuperación de Datos

#### Configuración Corrupta

Si `~/.gymbots/config.json` se corrompe:
```bash
# Respaldar configuración actual
cp ~/.gymbots/config.json ~/.gymbots/config.backup.json

# Restaurar desde plantilla
cp config/config.ejemplo.json ~/.gymbots/config.json

# Reconfigurar
gymbots init
```

#### Estado de Bots

Los bots guardan estado temporalmente. Si se reinicia:
- Se pierde estado actual (posición, inventario, etc.)
- La configuración persiste en el archivo de config
- Los bots se reconectan automáticamente

---

## API Web

### Endpoints HTTP

#### Health Check
```http
GET /health
```
Respuesta:
```json
{ "ok": true }
```

#### Estado Global
```http
GET /api/state?token=TU_TOKEN
```
Respuesta:
```json
{
  "ok": true,
  "state": {
    "bots": [...],
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Comandos Disponibles
```http
GET /api/commands?token=TU_TOKEN
```
Respuesta:
```json
{
  "ok": true,
  "commands": [
    {
      "name": "estado",
      "description": "Muestra estado del bot",
      "permission": null
    }
  ]
}
```

### WebSocket

#### Conexión
```javascript
const ws = new WebSocket('ws://localhost:3000')
```

#### Mensajes

**Cliente -> Servidor:**
```json
{
  "type": "command",
  "botId": "bot-1",
  "command": "estado"
}
```

**Servidor -> Cliente:**
```json
{
  "type": "state",
  "data": {
    "bots": [...],
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Autenticación

Si configuraste token:
```javascript
const ws = new WebSocket('ws://localhost:3000?token=TU_TOKEN')
```

---

## Licencia

MIT License - Puedes usar, modificar y distribuir este proyecto libremente.

---

## Contribuciones

¡Contribuciones son bienvenidas!

1. Fork el repositorio
2. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit tus cambios: `git commit -m 'Añadir nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## Soporte

- **GitHub Issues**: Reporta bugs y solicita features
- **Discord**: Únete a la comunidad (enlace en GitHub)
- **Wiki**: Documentación adicional y guías

---

## ShowCase

Demostración del sistema en acción:
https://youtu.be/t7e8yLeb6_4

---

**Gracias por usar GymBots!** 

*Desarrollado con passion por la comunidad de Minecraft.*
