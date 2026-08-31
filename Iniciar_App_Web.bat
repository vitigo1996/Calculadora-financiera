@echo off
title Finanzas Personales
cd /d "%~dp0"

echo ========================================================
echo        Iniciando App de Finanzas Personales...
echo ========================================================
echo.

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    python abrir_app.py
    goto end
)

where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    py abrir_app.py
    goto end
)

echo Iniciando via Vite/NPM...
call npm.cmd run dev -- --open

:end
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Ocurrio un inconveniente al abrir la app.
    echo Presiona cualquier tecla para cerrar.
    pause
)
