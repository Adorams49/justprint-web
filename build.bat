@echo off
setlocal
chcp 65001 >nul
title Just Print - Regenerar sitio
cd /d "%~dp0"

echo.
echo   1/2  Compilando los componentes de React (React Bits)...
echo.

where npm >nul 2>nul
if %errorlevel%==0 (
    if not exist node_modules call npm install
    call npm run build
) else (
    echo   No se encontro Node.js: se usan los componentes ya compilados en assets\islands.
)

echo.
echo   2/2  Regenerando paginas de servicio, mapa del sitio y menu...
echo.

where python >nul 2>nul
if %errorlevel%==0 (
    python -X utf8 build.py
) else (
    py -X utf8 build.py
)

echo.
pause
