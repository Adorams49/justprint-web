@echo off
setlocal
chcp 65001 >nul
title Just Print - Vista previa
cd /d "%~dp0"
set PORT=8080

echo.
echo   ============================================
echo     JUST PRINT  -  Vista previa de la pagina
echo   ============================================
echo.

where python >nul 2>nul
if %errorlevel%==0 (
    echo   Servidor local en http://localhost:%PORT%
    echo   Deja esta ventana abierta. Cierrala para detenerlo.
    echo.
    start "" "http://localhost:%PORT%"
    python -m http.server %PORT% --bind 127.0.0.1
    goto :eof
)

where py >nul 2>nul
if %errorlevel%==0 (
    echo   Servidor local en http://localhost:%PORT%
    echo   Deja esta ventana abierta. Cierrala para detenerlo.
    echo.
    start "" "http://localhost:%PORT%"
    py -m http.server %PORT% --bind 127.0.0.1
    goto :eof
)

echo   No se encontro Python. Abriendo el archivo directamente...
start "" "%~dp0index.html"
pause
