@echo off
title Sushi Aki Bot - Iniciar
color 0A
echo.
echo  ======================================
echo   SUSHI AKI BOT - Iniciando Servicos
echo  ======================================
echo.

net start SushiAkiBackend
if %errorlevel% == 0 (
    echo [OK] Backend iniciado
) else (
    echo [ERRO] Falha ao iniciar Backend
)

net start SushiAkiBot
if %errorlevel% == 0 (
    echo [OK] WhatsApp Bot iniciado
) else (
    echo [ERRO] Falha ao iniciar WhatsApp Bot
)

echo.
echo Servicos iniciados!
echo.
echo Acesse:
echo   - QR Code: http://localhost:3001
echo   - API: http://localhost:8001
echo.
pause
