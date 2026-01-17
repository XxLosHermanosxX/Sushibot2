# 🍣 Sushi Aki Bot - Deploy no Windows Server 2025

Guia completo para instalar e rodar o bot em Windows Server.

## 📋 Pré-requisitos

### 1. Instalar Node.js (para o bot WhatsApp)
1. Acesse: https://nodejs.org/
2. Baixe a versão **LTS** (20.x ou superior)
3. Execute o instalador e siga os passos
4. Marque a opção "Add to PATH"

### 2. Instalar Python (para o backend)
1. Acesse: https://www.python.org/downloads/
2. Baixe Python **3.11** ou superior
3. Execute o instalador
4. **IMPORTANTE:** Marque ✅ "Add Python to PATH"
5. Clique em "Install Now"

### 3. Instalar Git (opcional, para clonar o projeto)
1. Acesse: https://git-scm.com/download/win
2. Baixe e instale

---

## 📁 Estrutura de Pastas

Crie a seguinte estrutura:
```
C:\SushiAkiBot\
├── backend\
│   ├── server.py
│   ├── requirements.txt
│   ├── config.json
│   ├── .env
│   └── whatsapp_bot\
│       ├── bot.js
│       ├── package.json
│       └── auth_info\ (criada automaticamente)
└── frontend\
    └── build\ (arquivos do React compilados)
```

---

## 🔧 Instalação Passo a Passo

### Passo 1: Copiar os arquivos

1. Crie a pasta `C:\SushiAkiBot`
2. Copie os arquivos do projeto para esta pasta

### Passo 2: Instalar dependências do Backend (Python)

Abra o **PowerShell como Administrador** e execute:

```powershell
# Navegar para a pasta do backend
cd C:\SushiAkiBot\backend

# Criar ambiente virtual (recomendado)
python -m venv venv

# Ativar ambiente virtual
.\venv\Scripts\Activate.ps1

# Instalar dependências
pip install -r requirements.txt
```

### Passo 3: Instalar dependências do Bot WhatsApp (Node.js)

```powershell
# Navegar para a pasta do bot
cd C:\SushiAkiBot\backend\whatsapp_bot

# Instalar dependências
npm install
```

### Passo 4: Configurar variáveis de ambiente

Crie o arquivo `C:\SushiAkiBot\backend\.env`:
```env
GEMINI_API_KEY=sua_chave_aqui
OPENROUTER_API_KEY=sua_chave_aqui
```

**Nota:** Você pode configurar as chaves pelo painel web depois.

---

## 🚀 Executar os Serviços

### Opção A: Executar manualmente (para testes)

Abra **3 janelas do PowerShell**:

**Janela 1 - Backend Python:**
```powershell
cd C:\SushiAkiBot\backend
.\venv\Scripts\Activate.ps1
uvicorn server:app --host 0.0.0.0 --port 8001
```

**Janela 2 - Bot WhatsApp:**
```powershell
cd C:\SushiAkiBot\backend\whatsapp_bot
$env:BACKEND_URL="http://localhost:8001"
node bot.js
```

**Janela 3 - Servir Frontend (opcional):**
```powershell
cd C:\SushiAkiBot\frontend\build
npx serve -s . -l 3000
```

### Opção B: Usar NSSM para rodar como serviço Windows (RECOMENDADO)

1. Baixe NSSM: https://nssm.cc/download
2. Extraia para `C:\nssm\`
3. Execute os comandos abaixo como Administrador:

```powershell
# Instalar Backend como serviço
C:\nssm\nssm.exe install SushiAkiBackend "C:\SushiAkiBot\backend\venv\Scripts\python.exe" "-m" "uvicorn" "server:app" "--host" "0.0.0.0" "--port" "8001"
C:\nssm\nssm.exe set SushiAkiBackend AppDirectory "C:\SushiAkiBot\backend"
C:\nssm\nssm.exe set SushiAkiBackend DisplayName "Sushi Aki - Backend"
C:\nssm\nssm.exe set SushiAkiBackend Start SERVICE_AUTO_START

# Instalar Bot WhatsApp como serviço
C:\nssm\nssm.exe install SushiAkiBot "C:\Program Files\nodejs\node.exe" "bot.js"
C:\nssm\nssm.exe set SushiAkiBot AppDirectory "C:\SushiAkiBot\backend\whatsapp_bot"
C:\nssm\nssm.exe set SushiAkiBot AppEnvironmentExtra "BACKEND_URL=http://localhost:8001"
C:\nssm\nssm.exe set SushiAkiBot DisplayName "Sushi Aki - WhatsApp Bot"
C:\nssm\nssm.exe set SushiAkiBot Start SERVICE_AUTO_START

# Iniciar os serviços
net start SushiAkiBackend
net start SushiAkiBot
```

---

## 🌐 Configurar Acesso Externo

### Firewall do Windows

Abra as portas no Firewall:

```powershell
# Abrir porta 8001 (Backend API)
New-NetFirewallRule -DisplayName "Sushi Aki Backend" -Direction Inbound -Protocol TCP -LocalPort 8001 -Action Allow

# Abrir porta 3001 (QR Code do WhatsApp)
New-NetFirewallRule -DisplayName "Sushi Aki WhatsApp QR" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow

# Abrir porta 3000 (Frontend - se servir localmente)
New-NetFirewallRule -DisplayName "Sushi Aki Frontend" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

### IIS como Proxy Reverso (Opcional)

Se quiser usar IIS para servir em porta 80/443:

1. Instale o IIS com URL Rewrite e ARR
2. Configure proxy reverso para `localhost:8001`

---

## 📱 Acessar o Painel

Após iniciar os serviços:

- **QR Code WhatsApp:** http://SEU_IP:3001
- **Backend API:** http://SEU_IP:8001
- **Frontend (se servir):** http://SEU_IP:3000

---

## 🔄 Scripts de Gerenciamento

### start_all.bat
```batch
@echo off
echo Iniciando Sushi Aki Bot...
net start SushiAkiBackend
net start SushiAkiBot
echo Serviços iniciados!
pause
```

### stop_all.bat
```batch
@echo off
echo Parando Sushi Aki Bot...
net stop SushiAkiBot
net stop SushiAkiBackend
echo Serviços parados!
pause
```

### restart_all.bat
```batch
@echo off
echo Reiniciando Sushi Aki Bot...
net stop SushiAkiBot
net stop SushiAkiBackend
timeout /t 3
net start SushiAkiBackend
net start SushiAkiBot
echo Serviços reiniciados!
pause
```

---

## ❓ Troubleshooting

### QR Code não aparece
- Verifique se o bot está rodando: `http://localhost:3001/status`
- Verifique os logs do serviço NSSM

### Backend não responde
- Teste: `curl http://localhost:8001/api/health`
- Verifique se Python está no PATH
- Verifique logs em `C:\SushiAkiBot\backend\logs\`

### WhatsApp desconecta
- Delete a pasta `auth_info` e reconecte:
```powershell
Remove-Item -Recurse -Force C:\SushiAkiBot\backend\whatsapp_bot\auth_info
net stop SushiAkiBot
net start SushiAkiBot
```

### Ver logs dos serviços
```powershell
# Logs do NSSM ficam em:
Get-Content C:\SushiAkiBot\backend\logs\backend.log -Tail 50
```

---

## 📞 Suporte

- Documentação OpenRouter: https://openrouter.ai/docs
- Documentação Gemini: https://ai.google.dev/docs
