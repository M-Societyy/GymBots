@echo off
setlocal enabledelayedexpansion

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%" || (echo Error: no se pudo acceder a %ROOT_DIR% & exit /b 1)

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

where npm >nul 2>nul
if errorlevel 1 (
  echo Error: npm no esta instalado o no esta en PATH.
  exit /b 1
)

if not exist "node_modules" (
  echo Dependencias no instaladas. Ejecutando npm install...
  npm install
  if errorlevel 1 exit /b 1
)

echo Iniciando GymBots: npm start
npm start

endlocal
