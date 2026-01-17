@echo off
title Sushi Aki Bot - Reiniciar
color 0E
echo.
echo  ======================================
echo   SUSHI AKI BOT - Reiniciando
echo  ======================================
echo.

echo Parando servicos...
net stop SushiAkiBot >nul 2>&1
net stop SushiAkiBackend >nul 2>&1

echo Aguardando 3 segundos...
timeout /t 3 /nobreak >nul

echo Iniciando servicos...
net start SushiAkiBackend
net start SushiAkiBot

echo.
echo Servicos reiniciados!
echo.
echo Acesse:
echo   - QR Code: http://localhost:3001
echo   - API: http://localhost:8001
echo.
pause
