@echo off
setlocal
chcp 65001 >nul
title Just Print - Regenerar sitio
cd /d "%~dp0"

echo.
echo   Regenerando paginas de servicio, mapa del sitio y menu...
echo.

where python >nul 2>nul
if %errorlevel%==0 (
    python -X utf8 build.py
) else (
    py -X utf8 build.py
)

echo.
pause
