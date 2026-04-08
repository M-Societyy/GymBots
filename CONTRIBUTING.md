# Contributing to GymBots

¡Gracias por tu interés en contribuir a GymBots! Este documento te guiará sobre cómo contribuir al proyecto.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

Por favor, sé respetuoso y profesional en todas tus interacciones. Nos esforzamos por crear una comunidad inclusiva y amigable.

## Getting Started

1. **Fork el repositorio**
2. **Clona tu fork:**
   ```bash
   git clone https://github.com/TU_USERNAME/GymBots.git
   cd GymBots
   ```
3. **Instala dependencias:**
   ```bash
   npm install
   ```

## Development Setup

### Requisitos
- Node.js >= 22
- npm
- Git

### Scripts Disponibles
```bash
npm start          # Inicia GymBots
npm run cli        # Ejecuta CLI
npm run build:win  # Build para Windows
```

### Configuración de Desarrollo
1. Copia el archivo de configuración de ejemplo:
   ```bash
   cp config/config.ejemplo.json ~/.gymbots/config.json
   ```
2. Edita la configuración según tus necesidades

## Submitting Changes

### 1. Crea una Rama
```bash
git checkout -b feature/tu-nueva-funcionalidad
```

### 2. Haz tus Cambios
- Sigue las [Coding Standards](#coding-standards)
- Añade pruebas si es necesario
- Actualiza la documentación

### 3. Commit tus Cambios
Usa mensajes de commit claros y descriptivos:
```bash
git commit -m "feat: añadir nueva funcionalidad de XYZ"
```

### 4. Push y Pull Request
```bash
git push origin feature/tu-nueva-funcionalidad
```
Luego crea un Pull Request en GitHub.

## Coding Standards

### JavaScript
- Usa ES6+ features cuando sea apropiado
- Sigue el estilo existente en el proyecto
- Usa `const` y `let` en lugar de `var`
- Añade comentarios en código complejo

### Nomenclatura
- **Variables y funciones:** `camelCase`
- **Constantes:** `UPPER_SNAKE_CASE`
- **Archivos:** `kebab-case.js`
- **Clases:** `PascalCase`

### Estructura de Archivos
```javascript
// Imports
const { crearLogger } = require('../utils/logger')

// Constants
const MAX_BOTS = 2000

// Functions
function miFuncion() {
  // Implementation
}

// Exports
module.exports = { miFuncion }
```

## Testing

### Ejecutar Pruebas
```bash
npm test
```

### Añadir Pruebas
- Las pruebas deben estar en `test/` o `__tests__/`
- Usa nombres descriptivos
- Prueba casos normales y edge cases

### Ejemplo de Prueba
```javascript
const { miFuncion } = require('../src/modules/mimodulo')

test('debería retornar valor esperado', () => {
  expect(miFuncion()).toBe('valor esperado')
})
```

## Documentation

### Actualizar README
Si tu cambio afecta la funcionalidad principal:
1. Actualiza el README.md
2. Añade ejemplos si es necesario
3. Actualiza la tabla de contenidos

### Code Comments
- Comenta funciones complejas
- Explica algoritmos no obvios
- Usa JSDoc para funciones exportadas:

```javascript
/**
 * Convierte coordenadas a formato string
 * @param {number} x - Coordenada X
 * @param {number} y - Coordenada Y
 * @param {number} z - Coordenada Z
 * @returns {string} Coordenadas formateadas
 */
function formatCoords(x, y, z) {
  return `${x}, ${y}, ${z}`
}
```

## Tipos de Contribuciones

### Bug Fixes
- Describe el bug que estás arreglando
- Añade pruebas que prevengan regresiones
- Actualiza la documentación si es necesario

### New Features
- Explica el propósito de la nueva funcionalidad
- Añade pruebas completas
- Actualiza el README y documentación

### Documentation
- Corrige typos y errores gramaticales
- Mejora la claridad de la documentación existente
- Añade ejemplos y guías

### Plugins
- Sigue el template de `src/plugins/ejemplo.js`
- Añade documentación de uso
- Incluye ejemplos de configuración

## Review Process

1. **Automated Checks**: CI/CD verificará que todo funcione
2. **Code Review**: Al menos un maintainer revisará tu PR
3. **Testing**: Nos aseguraremos que las pruebas pasen
4. **Documentation**: Verificaremos que la documentación esté actualizada

## Release Process

Los releases siguen [Semantic Versioning](https://semver.org/):
- **MAJOR**: Cambios breaking
- **MINOR**: Nuevas features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## Community

- **Discord**: [Enlace en el README]
- **GitHub Issues**: Para bugs y features
- **GitHub Discussions**: Para preguntas generales

## Ayuda

Si tienes dudas:
1. Revisa el README y documentación existente
2. Busca issues similares o discussions
3. Crea un issue con tu pregunta
4. Únete a nuestro Discord

---

¡Gracias por contribuir a GymBots! Tu ayuda hace que este proyecto sea mejor para todos.
