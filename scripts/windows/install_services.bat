@echo off
title Sushi Aki Bot - Instalador de Servicos
color 0B

echo.
echo  ================================================
echo   SUSHI AKI BOT - Instalador de Servicos Windows
echo  ================================================
echo.
echo Este script vai instalar os servicos do bot.
echo Certifique-se de ter:
echo   - Node.js instalado
echo   - Python instalado
echo   - NSSM em C:\nssm\
echo   - Arquivos em C:\SushiAkiBot\
echo.
pause

echo.
echo [1/4] Instalando dependencias Python...
cd /d C:\SushiAkiBot\backend
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r requirements.txt
echo [OK] Dependencias Python instaladas

echo.
echo [2/4] Instalando dependencias Node.js...
cd /d C:\SushiAkiBot\backend\whatsapp_bot
call npm install
echo [OK] Dependencias Node.js instaladas

echo.
echo [3/4] Criando servico Backend...
C:\nssm\nssm.exe install SushiAkiBackend "C:\SushiAkiBot\backend\venv\Scripts\python.exe" "-m" "uvicorn" "server:app" "--host" "0.0.0.0" "--port" "8001"
C:\nssm\nssm.exe set SushiAkiBackend AppDirectory "C:\SushiAkiBot\backend"
C:\nssm\nssm.exe set SushiAkiBackend DisplayName "Sushi Aki - Backend API"
C:\nssm\nssm.exe set SushiAkiBackend Description "Backend API do Sushi Aki Bot"
C:\nssm\nssm.exe set SushiAkiBackend Start SERVICE_AUTO_START
echo [OK] Servico Backend criado

echo.
echo [4/4] Criando servico WhatsApp Bot...
C:\nssm\nssm.exe install SushiAkiBot "C:\Program Files\nodejs\node.exe" "bot.js"
C:\nssm\nssm.exe set SushiAkiBot AppDirectory "C:\SushiAkiBot\backend\whatsapp_bot"
C:\nssm\nssm.exe set SushiAkiBot AppEnvironmentExtra "BACKEND_URL=http://localhost:8001"
C:\nssm\nssm.exe set SushiAkiBot DisplayName "Sushi Aki - WhatsApp Bot"
C:\nssm\nssm.exe set SushiAkiBot Description "Bot WhatsApp do Sushi Aki"
C:\nssm\nssm.exe set SushiAkiBot Start SERVICE_AUTO_START
echo [OK] Servico WhatsApp Bot criado

echo.
echo  ================================================
echo   INSTALACAO CONCLUIDA!
echo  ================================================
echo.
echo Para iniciar os servicos, execute start_all.bat
echo ou use: net start SushiAkiBackend && net start SushiAkiBot
echo.
pause
