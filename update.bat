@echo off
setlocal enabledelayedexpansion

set "RUN_AFTER=0"
if /I "%~1"=="run" set "RUN_AFTER=1"

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%" || (echo Error: no se pudo acceder a %ROOT_DIR% & exit /b 1)

where git >nul 2>nul
if errorlevel 1 (
  echo Error: git no esta instalado o no esta en PATH.
  exit /b 1
)

if not exist ".git" (
  echo Error: este script debe ejecutarse en un clon de git ^(no se encontro .git^).
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo Error: node no esta instalado o no esta en PATH.
  exit /b 1
)

for /f "delims=" %%V in ('node -p "process.versions.node.split(\".\")[0]"') do set "NODE_MAJOR=%%V"
if "%NODE_MAJOR%"=="" (
  echo Error: no se pudo detectar la version de Node.
  exit /b 1
)

set /a NODE_MAJOR_NUM=%NODE_MAJOR%+0
if %NODE_MAJOR_NUM% LSS 22 (
  for /f "delims=" %%N in ('node -v') do set "NODE_VER=%%N"
  echo Error: Node ^>= 22 requerido. Version actual: %NODE_VER%
  exit /b 1
)

echo [1/3] Actualizando repo...
git fetch --all --prune
if errorlevel 1 exit /b 1

rem Si el usuario esta en otra rama, hacemos pull de esa rama.
for /f "delims=" %%B in ('git rev-parse --abbrev-ref HEAD') do set "BRANCH=%%B"
if "%BRANCH%"=="" set "BRANCH=main"

git pull --ff-only origin %BRANCH%
if errorlevel 1 (
  echo.
  echo Nota: Si tienes cambios locales, git puede rechazar el pull. Resuelve o haz commit/stash y vuelve a ejecutar.
  exit /b 1
)

echo [2/3] Instalando dependencias...
where npm >nul 2>nul
if errorlevel 1 (
  echo Error: npm no esta instalado o no esta en PATH.
  exit /b 1
)

if exist package-lock.json (
  npm ci
) else (
  npm install
)
if errorlevel 1 exit /b 1

echo [3/3] Listo.
if "%RUN_AFTER%"=="1" (
  echo Ejecutando: npm start
  npm start
) else (
  echo Si tienes GymBots corriendo, reinicialo manualmente.
  echo Tip: ejecuta este script con "run" para arrancar al terminar: update.bat run
)

endlocal
