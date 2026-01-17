@echo off
title Sushi Aki Bot - Parar
color 0C
echo.
echo  ======================================
echo   SUSHI AKI BOT - Parando Servicos
echo  ======================================
echo.

net stop SushiAkiBot
if %errorlevel% == 0 (
    echo [OK] WhatsApp Bot parado
) else (
    echo [AVISO] WhatsApp Bot ja estava parado
)

net stop SushiAkiBackend
if %errorlevel% == 0 (
    echo [OK] Backend parado
) else (
    echo [AVISO] Backend ja estava parado
)

echo.
echo Servicos parados!
echo.
pause
