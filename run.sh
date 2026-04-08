#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: node no está instalado o no está en PATH." >&2
  exit 1
fi

node_major="$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo "")"
if [ -z "${node_major}" ]; then
  echo "Error: no se pudo detectar la versión de Node." >&2
  exit 1
fi

if [ "${node_major}" -lt 22 ]; then
  echo "Error: Node >= 22 requerido. Versión actual: $(node -v)." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm no está instalado o no está en PATH." >&2
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "Dependencias no instaladas. Ejecutando npm install..."
  npm install
fi

echo "Iniciando GymBots: npm start"
exec npm start
