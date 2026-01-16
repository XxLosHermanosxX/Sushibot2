import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageCircle, 
  Send, 
  QrCode, 
  Settings, 
  Users, 
  Bot, 
  User, 
  Check, 
  CheckCheck,
  Wifi,
  WifiOff,
  RefreshCw,
  Clock,
  ArrowLeft,
  ToggleLeft,
  ToggleRight,
  Phone,
  ExternalLink
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const WHATSAPP_BOT_URL = 'http://localhost:3001';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [status, setStatus] = useState({
    whatsapp: { connected: false, qr_code: null, status_text: 'Desconectado' },
    bot_config: { auto_reply: true, human_takeover_minutes: 60 },
    conversas_ativas: 0,
    gemini_configured: false
  });
  const [conversas, setConversas] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [qrCodeData, setQrCodeData] = useState(null);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  // Buscar QR Code do bot Node.js
  const fetchQRCode = useCallback(async () => {
    try {
      const response = await fetch(`${WHATSAPP_BOT_URL}/qr-data`);
      if (response.ok) {
        const data = await response.json();
        setQrCodeData(data);
        if (data.status === 'Conectado!') {
          setStatus(prev => ({
            ...prev,
            whatsapp: { ...prev.whatsapp, connected: true, status_text: 'Conectado!' }
          }));
        }
      }
    } catch (error) {
      console.log('Bot WhatsApp não disponível');
    }
  }, []);

  // Conectar WebSocket
  const connectWebSocket = useCallback(() => {
    const wsUrl = BACKEND_URL.replace('http', 'ws') + '/api/ws';
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket conectado');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'init':
          setStatus(prev => ({
            ...prev,
            whatsapp: data.status,
            bot_config: data.config
          }));
          setConversas(data.conversas || []);
          setLoading(false);
          break;
          
        case 'status_update':
          setStatus(prev => ({ ...prev, whatsapp: data.status }));
          break;
          
        case 'message_received':
        case 'message_sent':
          setConversas(prev => {
            const idx = prev.findIndex(c => c.chat_id === data.chat_id);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = {
                ...updated[idx],
                mensagens: [...(updated[idx].mensagens || []), data.message]
              };
              return updated;
            } else {
              return [...prev, {
                chat_id: data.chat_id,
                nome_cliente: data.chat_id.split('@')[0],
                mensagens: [data.message],
                criado_em: new Date().toISOString()
              }];
            }
          });
          
          if (selectedChat?.chat_id === data.chat_id) {
            setSelectedChat(prev => ({
              ...prev,
              mensagens: [...(prev?.mensagens || []), data.message]
            }));
          }
          break;
          
        case 'config_updated':
          setStatus(prev => ({ ...prev, bot_config: data.config }));
          break;
          
        case 'human_takeover':
        case 'bot_resumed':
          setConversas(prev => prev.map(c => 
            c.chat_id === data.chat_id 
              ? { ...c, humano_ativo: data.type === 'human_takeover' }
              : c
          ));
          break;
          
        default:
          break;
      }
    };
    
    ws.onclose = () => {
      console.log('WebSocket desconectado, reconectando...');
      setTimeout(connectWebSocket, 3000);
    };
    
    wsRef.current = ws;
  }, [selectedChat]);

  // Buscar status inicial
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/status`);
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Erro ao buscar status:', error);
    }
  }, []);

  // Buscar conversas
  const fetchConversas = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/conversas`);
      if (response.ok) {
        const data = await response.json();
        setConversas(data.conversas || []);
      }
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchConversas();
    connectWebSocket();
    
    // Polling para QR Code
    const qrInterval = setInterval(fetchQRCode, 3000);
    
    return () => {
      clearInterval(qrInterval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [fetchStatus, fetchConversas, connectWebSocket, fetchQRCode]);

  // Scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.mensagens]);

  // Enviar mensagem manual
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    try {
      await fetch(`${BACKEND_URL}/api/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: selectedChat.chat_id,
          message: newMessage
        })
      });
      setNewMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  // Toggle auto reply
  const toggleAutoReply = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auto_reply: !status.bot_config.auto_reply
        })
      });
    } catch (error) {
      console.error('Erro ao atualizar config:', error);
    }
  };

  // Assumir/Liberar conversa
  const toggleHumanTakeover = async (chatId, isHuman) => {
    try {
      const endpoint = isHuman ? 'release' : 'takeover';
      await fetch(`${BACKEND_URL}/api/${endpoint}/${chatId}`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  // Testar Gemini
  const testGemini = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/test-gemini`, {
        method: 'POST'
      });
      const data = await response.json();
      alert(data.success ? `✅ Gemini OK: ${data.response}` : `❌ Erro: ${data.error}`);
    } catch (error) {
      alert('❌ Erro ao testar Gemini');
    }
  };

  // Formatar data
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // Componente de Status Badge
  const StatusBadge = ({ connected }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
      connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
    }`}>
      {connected ? <Wifi size={16} /> : <WifiOff size={16} />}
      {connected ? 'Conectado' : 'Desconectado'}
    </div>
  );

  // Sidebar
  const Sidebar = () => (
    <div className="w-64 bg-dark-300 border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-xl">
            🍣
          </div>
          <div>
            <h1 className="font-bold text-lg">Sushi Aki</h1>
            <p className="text-xs text-gray-400">Bot WhatsApp</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => setActiveTab('dashboard')}
              data-testid="nav-dashboard"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-primary text-white' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <QrCode size={20} />
              Dashboard
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('conversas')}
              data-testid="nav-conversas"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'conversas' 
                  ? 'bg-primary text-white' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <MessageCircle size={20} />
              Conversas
              {conversas.length > 0 && (
                <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {conversas.length}
                </span>
              )}
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('configuracoes')}
              data-testid="nav-config"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'configuracoes' 
                  ? 'bg-primary text-white' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Settings size={20} />
              Configurações
            </button>
          </li>
        </ul>
      </nav>
      
      {/* Status */}
      <div className="p-4 border-t border-white/10">
        <StatusBadge connected={status.whatsapp.connected || qrCodeData?.status === 'Conectado!'} />
      </div>
    </div>
  );

  // Dashboard View
  const DashboardView = () => (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-dark-200 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Status WhatsApp</p>
              <p className="text-xl font-bold mt-1">
                {status.whatsapp.connected || qrCodeData?.status === 'Conectado!' 
                  ? 'Online' 
                  : qrCodeData?.status || status.whatsapp.status_text}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              status.whatsapp.connected || qrCodeData?.status === 'Conectado!'
                ? 'bg-green-500/20' 
                : 'bg-yellow-500/20'
            }`}>
              <Phone size={24} className={
                status.whatsapp.connected || qrCodeData?.status === 'Conectado!'
                  ? 'text-green-400' 
                  : 'text-yellow-400'
              } />
            </div>
          </div>
        </div>
        
        <div className="bg-dark-200 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Conversas Ativas</p>
              <p className="text-xl font-bold mt-1">{conversas.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <Users size={24} className="text-primary" />
            </div>
          </div>
        </div>
        
        <div className="bg-dark-200 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Auto Resposta</p>
              <p className="text-xl font-bold mt-1">
                {status.bot_config.auto_reply ? 'Ativada' : 'Desativada'}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              status.bot_config.auto_reply ? 'bg-secondary/20' : 'bg-gray-500/20'
            }`}>
              <Bot size={24} className={
                status.bot_config.auto_reply ? 'text-secondary' : 'text-gray-400'
              } />
            </div>
          </div>
        </div>
      </div>
      
      {/* QR Code Section */}
      {(!status.whatsapp.connected && qrCodeData?.status !== 'Conectado!') && (
        <div className="bg-dark-200 rounded-2xl p-8 border border-white/10">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Conectar WhatsApp</h3>
            <p className="text-gray-400 mb-6">
              Escaneie o QR Code abaixo com o WhatsApp do celular
            </p>
            
            {(qrCodeData?.qr || status.whatsapp.qr_code) ? (
              <div className="inline-block bg-white p-4 rounded-2xl">
                <img 
                  src={qrCodeData?.qr || status.whatsapp.qr_code} 
                  alt="QR Code" 
                  className="w-64 h-64"
                  data-testid="qr-code-image"
                />
              </div>
            ) : (
              <div className="inline-flex flex-col items-center gap-4">
                <div className="w-64 h-64 bg-dark-300 rounded-2xl flex items-center justify-center">
                  <RefreshCw size={32} className="text-gray-500 animate-spin" />
                </div>
                <p className="text-gray-500">Aguardando QR Code...</p>
                <a 
                  href={`${WHATSAPP_BOT_URL}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  Abrir página do QR Code <ExternalLink size={16} />
                </a>
              </div>
            )}
            
            <div className="mt-6 text-sm text-gray-400">
              <p className="font-medium mb-2">Como conectar:</p>
              <ol className="text-left max-w-xs mx-auto space-y-1">
                <li>1. Abra o WhatsApp no celular</li>
                <li>2. Vá em Configurações → Aparelhos conectados</li>
                <li>3. Toque em "Conectar um aparelho"</li>
                <li>4. Escaneie este QR Code</li>
              </ol>
            </div>
          </div>
        </div>
      )}
      
      {/* Connected Status */}
      {(status.whatsapp.connected || qrCodeData?.status === 'Conectado!') && (
        <div className="bg-dark-200 rounded-2xl p-8 border border-green-500/30">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={40} className="text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-green-400 mb-2">WhatsApp Conectado!</h3>
            <p className="text-gray-400">
              O bot está ativo e respondendo mensagens automaticamente
            </p>
            {status.whatsapp.phone_number && (
              <p className="text-gray-500 mt-2 text-sm">
                Número: {status.whatsapp.phone_number}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Conversas View
  const ConversasView = () => (
    <div className="flex h-full">
      {/* Lista de Conversas */}
      <div className={`w-80 bg-dark-300 border-r border-white/10 flex flex-col ${
        selectedChat ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-4 border-b border-white/10">
          <h3 className="font-bold">Conversas</h3>
          <p className="text-sm text-gray-400">{conversas.length} ativas</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversas.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p>Nenhuma conversa ainda</p>
              <p className="text-sm mt-2">As conversas aparecerão aqui quando clientes enviarem mensagens</p>
            </div>
          ) : (
            conversas.map((conversa) => (
              <button
                key={conversa.chat_id}
                onClick={() => setSelectedChat(conversa)}
                data-testid={`conversa-${conversa.chat_id}`}
                className={`w-full p-4 border-b border-white/5 hover:bg-white/5 transition-colors text-left ${
                  selectedChat?.chat_id === conversa.chat_id ? 'bg-white/10' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <User size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{conversa.nome_cliente}</p>
                      {conversa.humano_ativo && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                          Humano
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      {conversa.mensagens?.slice(-1)[0]?.text || 'Nova conversa'}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
      
      {/* Chat View */}
      <div className={`flex-1 flex flex-col ${
        selectedChat ? 'flex' : 'hidden md:flex'
      }`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-dark-200">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedChat(null)}
                  className="md:hidden p-2 hover:bg-white/10 rounded-lg"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <User size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium">{selectedChat.nome_cliente}</p>
                  <p className="text-xs text-gray-400">
                    {selectedChat.humano_ativo ? '🧑 Humano ativo' : '🤖 Bot respondendo'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => toggleHumanTakeover(selectedChat.chat_id, selectedChat.humano_ativo)}
                data-testid="toggle-takeover"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedChat.humano_ativo
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                }`}
              >
                {selectedChat.humano_ativo ? 'Devolver ao Bot' : 'Assumir Conversa'}
              </button>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedChat.mensagens?.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  className={`flex ${msg.from === 'cliente' ? 'justify-start' : 'justify-end'} message-enter`}
                >
                  <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    msg.from === 'cliente'
                      ? 'bg-dark-200 border border-white/10'
                      : msg.from === 'bot'
                        ? 'bg-primary text-white'
                        : 'bg-secondary text-white'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                      msg.from === 'cliente' ? 'text-gray-500' : 'text-white/70'
                    }`}>
                      <Clock size={12} />
                      {formatTime(msg.timestamp)}
                      {msg.from !== 'cliente' && (
                        <CheckCheck size={14} className="ml-1" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-dark-200">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Digite uma mensagem..."
                  data-testid="message-input"
                  className="flex-1 bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
                <button
                  onClick={sendMessage}
                  data-testid="send-message-btn"
                  className="p-3 bg-primary hover:bg-primary/80 rounded-xl transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageCircle size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">Selecione uma conversa</p>
              <p className="text-sm mt-2">Escolha uma conversa da lista para visualizar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Configurações View
  const ConfiguracoesView = () => (
    <div className="p-8 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Configurações</h2>
      
      <div className="space-y-6">
        {/* Auto Reply */}
        <div className="bg-dark-200 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">Resposta Automática</h3>
              <p className="text-sm text-gray-400 mt-1">
                Quando ativado, o bot responde automaticamente às mensagens
              </p>
            </div>
            <button
              onClick={toggleAutoReply}
              data-testid="toggle-auto-reply"
              className="p-2"
            >
              {status.bot_config.auto_reply ? (
                <ToggleRight size={40} className="text-primary" />
              ) : (
                <ToggleLeft size={40} className="text-gray-500" />
              )}
            </button>
          </div>
        </div>
        
        {/* Timeout Humano */}
        <div className="bg-dark-200 rounded-2xl p-6 border border-white/10">
          <h3 className="font-bold mb-2">Timeout de Takeover Humano</h3>
          <p className="text-sm text-gray-400 mb-4">
            Após este tempo sem resposta humana, o bot retoma a conversa
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={status.bot_config.human_takeover_minutes}
              disabled
              className="w-24 bg-dark-300 border border-white/10 rounded-lg px-4 py-2 text-white"
            />
            <span className="text-gray-400">minutos</span>
          </div>
        </div>
        
        {/* Gemini Test */}
        <div className="bg-dark-200 rounded-2xl p-6 border border-white/10">
          <h3 className="font-bold mb-2">Integração Gemini</h3>
          <p className="text-sm text-gray-400 mb-4">
            Status: {status.gemini_configured ? '✅ Configurado' : '❌ Não configurado'}
          </p>
          <button
            onClick={testGemini}
            data-testid="test-gemini-btn"
            className="px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-sm font-medium transition-colors"
          >
            Testar Conexão
          </button>
        </div>
        
        {/* Info */}
        <div className="bg-dark-200 rounded-2xl p-6 border border-white/10">
          <h3 className="font-bold mb-4">Informações do Bot</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Versão</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Persona</span>
              <span>SORA 🍣</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Site</span>
              <a 
                href="https://sushiakicb.shop" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                sushiakicb.shop
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw size={48} className="mx-auto mb-4 animate-spin text-primary" />
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" data-testid="sushiaki-bot-app">
      <Sidebar />
      
      <main className="flex-1 overflow-hidden">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'conversas' && <ConversasView />}
        {activeTab === 'configuracoes' && <ConfiguracoesView />}
      </main>
    </div>
  );
}

export default App;
