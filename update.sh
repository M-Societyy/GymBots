#!/usr/bin/env bash
set -euo pipefail

RUN_AFTER=0
if [ "${1-}" = "--run" ]; then
  RUN_AFTER=1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if ! command -v git >/dev/null 2>&1; then
  echo "Error: git no está instalado o no está en PATH." >&2
  exit 1
fi

if [ ! -d ".git" ]; then
  echo "Error: este script debe ejecutarse en un clon de git (no se encontró .git)." >&2
  exit 1
fi

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

echo "[1/3] Actualizando repo..."
# Si hay cambios locales, no forzamos nada. Dejamos que git falle y el usuario decida.
git fetch --all --prune

default_branch="$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null | sed 's@^origin/@@' || true)"
if [ -z "${default_branch}" ]; then
  default_branch="main"
fi

current_branch="$(git rev-parse --abbrev-ref HEAD)"
# Si estás en main/master (o el default), hacemos pull ahí. Si no, hacemos pull sobre tu branch actual.
if [ "$current_branch" = "$default_branch" ] || [ "$current_branch" = "main" ] || [ "$current_branch" = "master" ]; then
  git pull --ff-only
else
  git pull --ff-only origin "$current_branch"
fi

echo "[2/3] Instalando dependencias..."
if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm no está instalado o no está en PATH." >&2
  exit 1
fi

if [ -f "package-lock.json" ]; then
  npm ci
else
  npm install
fi

echo "[3/3] Listo."
if [ "${RUN_AFTER}" -eq 1 ]; then
  echo "Ejecutando: npm start"
  npm start
else
  echo "Si tienes GymBots corriendo como servicio/proceso, reinícialo manualmente."
  echo "Tip: ejecuta este script con --run para arrancar al terminar: ./update.sh --run"
fi
