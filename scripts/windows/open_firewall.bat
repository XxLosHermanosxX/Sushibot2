@echo off
title Sushi Aki Bot - Configurar Firewall
color 0E

echo.
echo  ================================================
echo   SUSHI AKI BOT - Abrindo Portas no Firewall
echo  ================================================
echo.
echo Este script precisa ser executado como Administrador!
echo.
pause

echo.
echo Abrindo porta 8001 (Backend API)...
netsh advfirewall firewall add rule name="Sushi Aki Backend" dir=in action=allow protocol=TCP localport=8001
echo [OK] Porta 8001 aberta

echo.
echo Abrindo porta 3001 (WhatsApp QR Code)...
netsh advfirewall firewall add rule name="Sushi Aki WhatsApp QR" dir=in action=allow protocol=TCP localport=3001
echo [OK] Porta 3001 aberta

echo.
echo Abrindo porta 3000 (Frontend)...
netsh advfirewall firewall add rule name="Sushi Aki Frontend" dir=in action=allow protocol=TCP localport=3000
echo [OK] Porta 3000 aberta

echo.
echo  ================================================
echo   FIREWALL CONFIGURADO!
echo  ================================================
echo.
echo Portas abertas: 8001, 3001, 3000
echo.
pause
