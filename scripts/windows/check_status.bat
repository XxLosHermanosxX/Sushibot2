@echo off
title Sushi Aki Bot - Status
color 0F

echo.
echo  ======================================
echo   SUSHI AKI BOT - Status dos Servicos
echo  ======================================
echo.

echo Verificando Backend...
sc query SushiAkiBackend | find "RUNNING" >nul
if %errorlevel% == 0 (
    echo   [ONLINE] Backend API rodando na porta 8001
) else (
    echo   [OFFLINE] Backend API parado
)

echo.
echo Verificando WhatsApp Bot...
sc query SushiAkiBot | find "RUNNING" >nul
if %errorlevel% == 0 (
    echo   [ONLINE] WhatsApp Bot rodando na porta 3001
) else (
    echo   [OFFLINE] WhatsApp Bot parado
)

echo.
echo Testando conexoes...
echo.

curl -s http://localhost:8001/api/health >nul 2>&1
if %errorlevel% == 0 (
    echo   [OK] Backend respondendo
) else (
    echo   [ERRO] Backend nao responde
)

curl -s http://localhost:3001/status >nul 2>&1
if %errorlevel% == 0 (
    echo   [OK] WhatsApp Bot respondendo
) else (
    echo   [ERRO] WhatsApp Bot nao responde
)

echo.
echo  ======================================
echo.
echo URLs de acesso:
echo   - QR Code: http://localhost:3001
echo   - API: http://localhost:8001/api/status
echo.
pause
