# 🍣 Sushi Aki Bot - WhatsApp com IA

Bot de atendimento WhatsApp com inteligência artificial (Google Gemini) para o restaurante Sushi Aki.

## ✨ Funcionalidades

- 🤖 Respostas automáticas com IA (Google Gemini)
- 📱 Conexão WhatsApp via QR Code (Baileys)
- 🧑 Modo humano (assumir conversa manualmente)
- 📊 Painel de controle em tempo real
- 🔔 Notificações push de novas mensagens
- 📲 PWA instalável (Android e iPhone)
- ⚙️ Configuração de API Key pelo painel

## 🚀 Deploy

### Opção 1: VPS (Recomendado)

#### Requisitos:
- Node.js 18+
- Python 3.10+
- MongoDB (opcional)

#### Backend Python:
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001
```

#### Bot WhatsApp (Node.js):
```bash
cd backend/whatsapp_bot
npm install
BACKEND_URL=http://localhost:8001 node bot.js
```

#### Frontend React:
```bash
cd frontend
npm install
REACT_APP_BACKEND_URL=https://seu-backend.com npm run build
```

### Opção 2: Vercel (Frontend) + VPS (Backend + Bot)

1. **Deploy Frontend no Vercel:**
   - Conecte o repositório
   - Configure variável: `REACT_APP_BACKEND_URL=https://sua-api.com`
   - Deploy automático

2. **Backend na VPS:**
   ```bash
   # Backend
   cd backend && pip install -r requirements.txt
   uvicorn server:app --host 0.0.0.0 --port 8001

   # Bot WhatsApp
   cd backend/whatsapp_bot && npm install
   BACKEND_URL=http://localhost:8001 node bot.js
   ```

## ⚙️ Configuração

### API Key do Gemini

1. Acesse: https://aistudio.google.com/app/apikey
2. Crie uma nova API Key
3. No painel do bot, vá em **Configurações**
4. Cole a API Key e clique em **Salvar**
5. Teste a conexão

### Variáveis de Ambiente

**Backend (.env):**
```env
GEMINI_API_KEY=sua_api_key_aqui
MONGO_URL=mongodb://localhost:27017/sushiaki  # opcional
```

**Frontend (.env):**
```env
REACT_APP_BACKEND_URL=https://seu-backend.com
```

## 📱 Instalação do App

### Android:
1. Abra o site no Chrome
2. Menu ⋮ → "Instalar app"

### iPhone:
1. Abra o site no Safari
2. Compartilhar ⬆️ → "Adicionar à Tela de Início"

## 📁 Estrutura

```
/app
├── backend/
│   ├── server.py          # API FastAPI
│   ├── config.json        # Configurações salvas
│   ├── requirements.txt   # Dependências Python
│   └── whatsapp_bot/
│       ├── bot.js         # Bot WhatsApp Baileys
│       └── package.json   # Dependências Node.js
├── frontend/
│   ├── src/
│   │   └── App.js         # Aplicação React
│   ├── public/
│   │   ├── manifest.json  # PWA config
│   │   └── service-worker.js
│   └── package.json
└── README.md
```

## 🔧 Troubleshooting

### QR Code não aparece
- Verifique se o bot Node.js está rodando
- Verifique logs: `tail -f /var/log/supervisor/whatsapp_bot.err.log`

### Gemini não responde
- Verifique se a API Key está configurada
- Teste a conexão em Configurações
- Verifique cota no Google AI Studio

### WhatsApp desconecta
- Delete a pasta `auth_info` e reconecte
- Verifique se o número não está banido

## 📄 Licença

MIT
