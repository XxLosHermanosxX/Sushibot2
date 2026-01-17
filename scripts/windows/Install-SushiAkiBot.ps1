# ================================================
# SUSHI AKI BOT - Script de Instalacao Completa
# Windows Server 2025 / Windows 11
# ================================================

param(
    [string]$InstallPath = "C:\SushiAkiBot",
    [switch]$SkipDependencies,
    [switch]$InstallServices
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "  ================================================" -ForegroundColor Cyan
Write-Host "   SUSHI AKI BOT - Instalador Automatico" -ForegroundColor Cyan
Write-Host "  ================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se esta rodando como Admin
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "[ERRO] Execute este script como Administrador!" -ForegroundColor Red
    exit 1
}

# Funcao para verificar se um comando existe
function Test-Command($command) {
    try {
        if (Get-Command $command -ErrorAction Stop) { return $true }
    } catch { return $false }
}

# ================================================
# VERIFICAR PRE-REQUISITOS
# ================================================

Write-Host "[1/6] Verificando pre-requisitos..." -ForegroundColor Yellow

# Node.js
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "  [OK] Node.js instalado: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  [ERRO] Node.js nao encontrado!" -ForegroundColor Red
    Write-Host "  Baixe em: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Python
if (Test-Command "python") {
    $pythonVersion = python --version
    Write-Host "  [OK] Python instalado: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "  [ERRO] Python nao encontrado!" -ForegroundColor Red
    Write-Host "  Baixe em: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# ================================================
# CRIAR ESTRUTURA DE PASTAS
# ================================================

Write-Host ""
Write-Host "[2/6] Criando estrutura de pastas..." -ForegroundColor Yellow

if (-not (Test-Path $InstallPath)) {
    New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
}

$backendPath = Join-Path $InstallPath "backend"
$whatsappBotPath = Join-Path $backendPath "whatsapp_bot"
$frontendPath = Join-Path $InstallPath "frontend"
$logsPath = Join-Path $InstallPath "logs"

New-Item -ItemType Directory -Path $backendPath -Force | Out-Null
New-Item -ItemType Directory -Path $whatsappBotPath -Force | Out-Null
New-Item -ItemType Directory -Path $frontendPath -Force | Out-Null
New-Item -ItemType Directory -Path $logsPath -Force | Out-Null

Write-Host "  [OK] Pastas criadas em: $InstallPath" -ForegroundColor Green

# ================================================
# INSTALAR DEPENDENCIAS PYTHON
# ================================================

Write-Host ""
Write-Host "[3/6] Configurando ambiente Python..." -ForegroundColor Yellow

Set-Location $backendPath

# Criar venv se nao existir
$venvPath = Join-Path $backendPath "venv"
if (-not (Test-Path $venvPath)) {
    Write-Host "  Criando ambiente virtual Python..." -ForegroundColor Gray
    python -m venv venv
}

# Ativar venv e instalar dependencias
$activateScript = Join-Path $venvPath "Scripts\Activate.ps1"
& $activateScript

Write-Host "  Instalando dependencias Python..." -ForegroundColor Gray
pip install --quiet --upgrade pip
pip install --quiet fastapi uvicorn aiohttp python-dotenv pydantic google-generativeai python-multipart websockets

Write-Host "  [OK] Dependencias Python instaladas" -ForegroundColor Green

# ================================================
# INSTALAR DEPENDENCIAS NODE.JS
# ================================================

Write-Host ""
Write-Host "[4/6] Configurando ambiente Node.js..." -ForegroundColor Yellow

Set-Location $whatsappBotPath

# Criar package.json se nao existir
if (-not (Test-Path "package.json")) {
    @"
{
  "name": "sushiaki-whatsapp-bot",
  "version": "1.0.0",
  "main": "bot.js",
  "scripts": {
    "start": "node bot.js"
  },
  "dependencies": {
    "@whiskeysockets/baileys": "^6.7.16",
    "qrcode": "^1.5.4",
    "qrcode-terminal": "^0.12.0",
    "pino": "^9.6.0",
    "axios": "^1.6.0"
  }
}
"@ | Out-File -FilePath "package.json" -Encoding utf8
}

Write-Host "  Instalando dependencias Node.js..." -ForegroundColor Gray
npm install --silent

Write-Host "  [OK] Dependencias Node.js instaladas" -ForegroundColor Green

# ================================================
# CRIAR ARQUIVO .ENV
# ================================================

Write-Host ""
Write-Host "[5/6] Configurando variaveis de ambiente..." -ForegroundColor Yellow

$envFile = Join-Path $backendPath ".env"
if (-not (Test-Path $envFile)) {
    @"
# Sushi Aki Bot - Configuracoes
# Configure as chaves de API pelo painel web ou aqui

GEMINI_API_KEY=
OPENROUTER_API_KEY=
"@ | Out-File -FilePath $envFile -Encoding utf8
    Write-Host "  [OK] Arquivo .env criado" -ForegroundColor Green
} else {
    Write-Host "  [OK] Arquivo .env ja existe" -ForegroundColor Green
}

# ================================================
# CONFIGURAR FIREWALL
# ================================================

Write-Host ""
Write-Host "[6/6] Configurando firewall..." -ForegroundColor Yellow

# Remover regras antigas se existirem
Remove-NetFirewallRule -DisplayName "Sushi Aki*" -ErrorAction SilentlyContinue

# Criar novas regras
New-NetFirewallRule -DisplayName "Sushi Aki Backend" -Direction Inbound -Protocol TCP -LocalPort 8001 -Action Allow | Out-Null
New-NetFirewallRule -DisplayName "Sushi Aki WhatsApp" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow | Out-Null
New-NetFirewallRule -DisplayName "Sushi Aki Frontend" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow | Out-Null

Write-Host "  [OK] Portas 8001, 3001, 3000 abertas no firewall" -ForegroundColor Green

# ================================================
# INSTALAR COMO SERVICOS (OPCIONAL)
# ================================================

if ($InstallServices) {
    Write-Host ""
    Write-Host "[EXTRA] Instalando como servicos Windows..." -ForegroundColor Magenta
    
    # Verificar se NSSM existe
    $nssmPath = "C:\nssm\nssm.exe"
    if (-not (Test-Path $nssmPath)) {
        Write-Host "  [AVISO] NSSM nao encontrado em C:\nssm\" -ForegroundColor Yellow
        Write-Host "  Baixe em: https://nssm.cc/download" -ForegroundColor Yellow
    } else {
        # Instalar Backend
        & $nssmPath install SushiAkiBackend "$venvPath\Scripts\python.exe" "-m" "uvicorn" "server:app" "--host" "0.0.0.0" "--port" "8001"
        & $nssmPath set SushiAkiBackend AppDirectory $backendPath
        & $nssmPath set SushiAkiBackend DisplayName "Sushi Aki - Backend"
        & $nssmPath set SushiAkiBackend Start SERVICE_AUTO_START
        
        # Instalar Bot
        $nodePath = (Get-Command node).Source
        & $nssmPath install SushiAkiBot $nodePath "bot.js"
        & $nssmPath set SushiAkiBot AppDirectory $whatsappBotPath
        & $nssmPath set SushiAkiBot AppEnvironmentExtra "BACKEND_URL=http://localhost:8001"
        & $nssmPath set SushiAkiBot DisplayName "Sushi Aki - WhatsApp Bot"
        & $nssmPath set SushiAkiBot Start SERVICE_AUTO_START
        
        Write-Host "  [OK] Servicos instalados" -ForegroundColor Green
    }
}

# ================================================
# FINALIZADO
# ================================================

Write-Host ""
Write-Host "  ================================================" -ForegroundColor Green
Write-Host "   INSTALACAO CONCLUIDA!" -ForegroundColor Green
Write-Host "  ================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Pasta de instalacao: $InstallPath" -ForegroundColor White
Write-Host ""
Write-Host "  PROXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "  1. Copie os arquivos server.py e bot.js para as pastas" -ForegroundColor White
Write-Host "  2. Execute o backend:" -ForegroundColor White
Write-Host "     cd $backendPath" -ForegroundColor Gray
Write-Host "     .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
Write-Host "     uvicorn server:app --host 0.0.0.0 --port 8001" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Execute o bot WhatsApp (outra janela):" -ForegroundColor White
Write-Host "     cd $whatsappBotPath" -ForegroundColor Gray
Write-Host "     `$env:BACKEND_URL='http://localhost:8001'" -ForegroundColor Gray
Write-Host "     node bot.js" -ForegroundColor Gray
Write-Host ""
Write-Host "  4. Acesse: http://localhost:3001 para QR Code" -ForegroundColor White
Write-Host "  5. Acesse: http://localhost:8001/api/status para API" -ForegroundColor White
Write-Host ""

Set-Location $InstallPath
