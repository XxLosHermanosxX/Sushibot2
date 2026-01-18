# 🚀 Guia de Deploy - Sushi Aki Bot

## Arquitetura de Deploy

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     VERCEL      │     │    RAILWAY      │     │    RAILWAY      │
│   (Frontend)    │────▶│   (Backend)     │◀────│  (WhatsApp Bot) │
│   React App     │     │   FastAPI       │     │   Node.js       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │
                              ▼
                        ┌─────────────────┐
                        │   MONGODB       │
                        │ (Railway/Atlas) │
                        └─────────────────┘
```

---

## 📦 1. Deploy do Backend (Railway)

### Passo 1: Criar conta no Railway
1. Acesse: https://railway.app
2. Faça login com GitHub

### Passo 2: Criar novo projeto
1. Clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha o repositório **Sushibot2**
4. Configure o **Root Directory**: `backend`

### Passo 3: Configurar variáveis de ambiente
No painel do Railway, vá em **Variables** e adicione:

```
GEMINI_API_KEY=sua_chave_gemini
OPENROUTER_API_KEY=sua_chave_openrouter
MONGO_URL=mongodb+srv://...
WHATSAPP_BOT_URL=https://seu-bot.railway.app
PORT=8001
```

### Passo 4: Gerar domínio
1. Vá em **Settings** → **Networking**
2. Clique em **"Generate Domain"**
3. Copie a URL (ex: `https://sushiaki-backend.up.railway.app`)

---

## 📱 2. Deploy do Bot WhatsApp (Railway - Serviço Separado)

### Passo 1: Criar novo serviço no mesmo projeto
1. No projeto Railway, clique em **"+ New"**
2. Selecione **"GitHub Repo"** novamente
3. Escolha o mesmo repositório
4. Configure o **Root Directory**: `backend/whatsapp_bot`

### Passo 2: Configurar variáveis de ambiente
```
BACKEND_URL=https://sushiaki-backend.up.railway.app
PORT=3001
```

### Passo 3: Gerar domínio
1. Vá em **Settings** → **Networking**
2. Clique em **"Generate Domain"**
3. Copie a URL (ex: `https://sushiaki-bot.up.railway.app`)

### ⚠️ IMPORTANTE: Volte ao Backend e atualize:
```
WHATSAPP_BOT_URL=https://sushiaki-bot.up.railway.app
```

---

## 🌐 3. Deploy do Frontend (Vercel)

### Passo 1: Criar conta no Vercel
1. Acesse: https://vercel.com
2. Faça login com GitHub

### Passo 2: Importar projeto
1. Clique em **"Add New" → "Project"**
2. Selecione o repositório **Sushibot2**
3. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`

### Passo 3: Configurar variáveis de ambiente
```
REACT_APP_BACKEND_URL=https://sushiaki-backend.up.railway.app
REACT_APP_WHATSAPP_BOT_URL=https://sushiaki-bot.up.railway.app
```

### Passo 4: Deploy
1. Clique em **"Deploy"**
2. Aguarde o build (2-3 minutos)
3. Acesse a URL gerada

---

## 🗄️ 4. MongoDB (Opção Railway ou Atlas)

### Opção A: MongoDB no Railway
1. No projeto Railway, clique em **"+ New"**
2. Selecione **"Database" → "MongoDB"**
3. Copie a connection string
4. Atualize a variável `MONGO_URL` no backend

### Opção B: MongoDB Atlas (Gratuito)
1. Acesse: https://cloud.mongodb.com
2. Crie um cluster gratuito (M0)
3. Configure usuário e IP (0.0.0.0/0 para Railway)
4. Copie a connection string
5. Atualize a variável `MONGO_URL` no backend

---

## 📋 Checklist Final

- [ ] Backend Railway rodando
- [ ] Bot WhatsApp Railway rodando
- [ ] MongoDB configurado
- [ ] Frontend Vercel rodando
- [ ] Variáveis de ambiente configuradas
- [ ] QR Code aparecendo no dashboard
- [ ] Teste de conexão WhatsApp
- [ ] Teste de resposta da IA

---

## 🔧 Variáveis de Ambiente - Resumo

### Backend (Railway)
| Variável | Descrição | Exemplo |
|----------|-----------|----------|
| `GEMINI_API_KEY` | Chave API Gemini | `AIzaSy...` |
| `OPENROUTER_API_KEY` | Chave API OpenRouter | `sk-or-v1-...` |
| `MONGO_URL` | Connection string MongoDB | `mongodb+srv://...` |
| `WHATSAPP_BOT_URL` | URL do bot WhatsApp | `https://bot.railway.app` |
| `PORT` | Porta (Railway define) | `8001` |

### Bot WhatsApp (Railway)
| Variável | Descrição | Exemplo |
|----------|-----------|----------|
| `BACKEND_URL` | URL do backend | `https://backend.railway.app` |
| `PORT` | Porta (Railway define) | `3001` |

### Frontend (Vercel)
| Variável | Descrição | Exemplo |
|----------|-----------|----------|
| `REACT_APP_BACKEND_URL` | URL do backend | `https://backend.railway.app` |
| `REACT_APP_WHATSAPP_BOT_URL` | URL do bot | `https://bot.railway.app` |

---

## 🆘 Troubleshooting

### QR Code não aparece
- Verifique se o bot WhatsApp está rodando no Railway
- Verifique os logs no Railway
- Confirme a variável `BACKEND_URL`

### Bot não responde
- Verifique se a API Key (Gemini/OpenRouter) está configurada
- Teste a conexão no dashboard

### Erro de CORS
- O backend já está configurado para aceitar todas as origens
- Verifique se as URLs estão corretas

---

## 💰 Custos Estimados

| Serviço | Plano | Custo |
|---------|-------|-------|
| Vercel | Hobby | Gratuito |
| Railway | Starter | ~$5/mês |
| MongoDB Atlas | M0 | Gratuito |
| OpenRouter | Pay-as-you-go | $0 (modelos gratuitos) |
| Gemini | Free tier | Gratuito (limites) |

**Total estimado: $0-5/mês**

---

*Última atualização: Agosto 2025*
