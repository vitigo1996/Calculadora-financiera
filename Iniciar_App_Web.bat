@echo off
title Finanzas Personales - Servidor Local
echo ========================================================
echo   Iniciando App de Finanzas Personales en tu Navegador
echo ========================================================
echo.
cd /d "%~dp0"
echo Abriendo navegador en http://localhost:3000 ...
start http://localhost:3000
echo.
echo Presiona Ctrl + C para detener el servidor en cualquier momento.
echo.
npm run dev
pause
