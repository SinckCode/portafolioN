'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { io, Socket } from 'socket.io-client';

const WS_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api$/, '');

interface AdminConversation {
  userA: { _id: string; name: string };
  userB: { _id: string; name: string };
  lastMessageBody: string;
  lastMessageAt: string;
  totalMessages: number;
}

interface Conversation {
  recipientId: string;
  recipientName: string;
  lastMessageBody: string;
  lastMessageAt: string;
  lastMessageFromMe: boolean;
  unread: number;
}

interface ChatMessage {
  _id: string;
  body: string;
  createdAt: string;
  from: { _id: string; name: string; avatar?: string };
  to: { _id: string; name: string; avatar?: string };
}

interface UserOption {
  _id: string;
  name: string;
}

export default function AdminMensajes() {
  const { user, accessToken } = useAuth();
  const [tab, setTab] = useState<'my' | 'all'>('my');

  // "My chats" — admin's own conversations (same as /mensajes)
  const [myConvos, setMyConvos] = useState<Conversation[]>([]);
  const [loadingMy, setLoadingMy] = useState(true);

  // "All" — system-wide view
  const [allConvos, setAllConvos] = useState<AdminConversation[]>([]);
  const [loadingAll, setLoadingAll] = useState(true);

  // Active chat
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeName, setActiveName] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);

  // Admin viewing a conversation between two other users
  const [viewingPair, setViewingPair] = useState<{ a: string; b: string; label: string } | null>(null);

  // User search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserOption[]>([]);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const activeChatRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>(null);
  const sendingRef = useRef(false);

  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

  // Fetch my conversations
  const fetchMyConvos = useCallback(() => {
    if (!accessToken) return;
    api.getConversations(accessToken)
      .then((data) => setMyConvos((data as Conversation[]) || []))
      .catch(() => {})
      .finally(() => setLoadingMy(false));
  }, [accessToken]);

  // Fetch all system conversations
  const fetchAllConvos = useCallback(() => {
    if (!accessToken) return;
    api.getAdminConversations(accessToken)
      .then((data) => setAllConvos((data as AdminConversation[]) || []))
      .catch(() => {})
      .finally(() => setLoadingAll(false));
  }, [accessToken]);

  useEffect(() => { fetchMyConvos(); fetchAllConvos(); }, [fetchMyConvos, fetchAllConvos]);

  const fetchChat = useCallback((userId: string) => {
    if (!accessToken) return;
    api.getConversation(userId, accessToken)
      .then((data) => {
        const serverMsgs = (data as ChatMessage[]) || [];
        setMessages((prev) => {
          const serverIds = new Set(serverMsgs.map((m) => m._id));
          const optimistic = prev.filter((m) => m._id.startsWith('temp-') && !serverIds.has(m._id));
          return [...serverMsgs, ...optimistic];
        });
        if (serverMsgs.length > 0) {
          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      })
      .catch(() => {});
  }, [accessToken]);

  // Polling: primary real-time mechanism (3s), skips while sending
  useEffect(() => {
    if (!activeChat || !accessToken) return;
    pollRef.current = setInterval(() => {
      if (sendingRef.current) return;
      fetchChat(activeChat);
      fetchMyConvos();
      fetchAllConvos();
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeChat, accessToken, fetchChat, fetchMyConvos, fetchAllConvos]);

  // Socket: bonus instant delivery
  useEffect(() => {
    if (!accessToken) return;
    const socket = io(`${WS_URL}/messages`, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
    });
    socketRef.current = socket;

    socket.on('newMessage', (msg: ChatMessage) => {
      if (activeChatRef.current === msg.from?._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      }
      fetchMyConvos();
      fetchAllConvos();
    });

    socket.on('messageSent', (msg: ChatMessage) => {
      if (activeChatRef.current === msg.to?._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          const cleaned = prev.filter((m) => !(m._id.startsWith('temp-') && m.body === msg.body));
          return [...cleaned, msg];
        });
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      }
      fetchMyConvos();
      fetchAllConvos();
    });

    return () => { socket.disconnect(); };
  }, [accessToken, fetchMyConvos, fetchAllConvos]);

  // Open chat with a user (admin chats as themselves)
  function openChat(userId: string, name: string) {
    setActiveChat(userId);
    setActiveName(name);
    setViewingPair(null);
    setLoadingChat(true);
    setSearchQuery('');
    setSearchResults([]);

    api.getConversation(userId, accessToken!)
      .then((data) => {
        setMessages((data as ChatMessage[]) || []);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'auto' }), 50);
      })
      .catch(() => {})
      .finally(() => setLoadingChat(false));

    fetchMyConvos();
  }

  // View conversation between two other users (read-only + admin delete)
  function viewConversation(c: AdminConversation) {
    const label = `${c.userA.name} ↔ ${c.userB.name}`;
    setViewingPair({ a: c.userA._id, b: c.userB._id, label });
    setActiveChat(null);
    setLoadingChat(true);

    api.getAdminConversation(c.userA._id, c.userB._id, accessToken!)
      .then((data) => {
        setMessages((data as ChatMessage[]) || []);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'auto' }), 50);
      })
      .catch(() => {})
      .finally(() => setLoadingChat(false));
  }

  // Send message with optimistic update
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMsg.trim() || !activeChat || !accessToken || !user) return;
    const body = newMsg.trim();
    setSending(true);
    sendingRef.current = true;
    setNewMsg('');

    const optimisticId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      _id: optimisticId,
      body,
      createdAt: new Date().toISOString(),
      from: { _id: user._id, name: user.name, avatar: user.avatar },
      to: { _id: activeChat, name: activeName },
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    try {
      await api.sendMessage({ to: activeChat, body }, accessToken);
      sendingRef.current = false;
      fetchChat(activeChat);
      fetchMyConvos();
      fetchAllConvos();
    } catch {
      sendingRef.current = false;
      setMessages((prev) => prev.filter((m) => m._id !== optimisticId));
    }
    setSending(false);
    inputRef.current?.focus();
  }

  async function handleDeleteMsg(id: string) {
    if (!confirm('Eliminar este mensaje permanentemente?')) return;
    if (!accessToken) return;
    try {
      await api.adminDeleteMessage(id, accessToken);
      setMessages((prev) => prev.filter((m) => m._id !== id));
      fetchAllConvos();
    } catch { /* empty */ }
  }

  // User search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (searchQuery.length < 2 || !accessToken) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(() => {
      api.searchUsers(searchQuery, accessToken)
        .then((data) => setSearchResults(((data as UserOption[]) || []).filter((u) => u._id !== user?._id)))
        .catch(() => setSearchResults([]));
    }, 300);
  }, [searchQuery, accessToken, user?._id]);

  function initials(name: string) {
    return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  }

  const hasActiveView = activeChat || viewingPair;

  return (
    <div>
      <h1 className="admin-page__title mb-6">Mensajes</h1>

      <div className="flex gap-6" style={{ height: 'calc(100vh - 220px)', minHeight: '400px' }}>
        {/* Left panel */}
        <div className="admin-card flex flex-col" style={{ width: '360px', minWidth: '280px' }}>
          {/* Tabs */}
          <div className="flex" style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
            <button
              onClick={() => setTab('my')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${tab === 'my' ? 'text-on-surface border-b-2 border-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Mis chats
            </button>
            <button
              onClick={() => setTab('all')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${tab === 'all' ? 'text-on-surface border-b-2 border-primary-container' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Todos
            </button>
          </div>

          {/* Search (only in "my" tab) */}
          {tab === 'my' && (
            <div className="p-3" style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar usuario..."
                className="input w-full"
                style={{ fontSize: '0.85rem' }}
              />
            </div>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {tab === 'my' ? (
              <>
                {/* Search results */}
                {searchQuery.length >= 2 && searchResults.length > 0 ? (
                  searchResults.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => openChat(u._id, u.name)}
                      className="w-full px-4 py-3 text-left text-sm text-on-surface hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center gap-3"
                      style={{ borderBottom: '1px solid rgba(42,45,53,0.4)' }}
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-container to-primary-container/50 flex items-center justify-center text-black font-bold text-xs shrink-0">
                        {initials(u.name)}
                      </div>
                      {u.name}
                    </button>
                  ))
                ) : searchQuery.length >= 2 ? (
                  <p className="text-on-surface-variant text-sm text-center py-8">Sin resultados</p>
                ) : loadingMy ? (
                  <p className="text-on-surface-variant text-sm text-center py-8">Cargando...</p>
                ) : myConvos.length === 0 ? (
                  <p className="text-on-surface-variant text-sm text-center py-8">Sin conversaciones. Busca un usuario para chatear.</p>
                ) : (
                  myConvos.map((c) => (
                    <button
                      key={c.recipientId}
                      onClick={() => openChat(c.recipientId, c.recipientName)}
                      className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${activeChat === c.recipientId ? 'bg-primary-container/10' : 'hover:bg-[rgba(255,255,255,0.03)]'}`}
                      style={{ borderBottom: '1px solid rgba(42,45,53,0.4)' }}
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-container to-primary-container/50 flex items-center justify-center text-black font-bold text-xs shrink-0">
                        {initials(c.recipientName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm truncate ${c.unread > 0 ? 'font-bold' : ''} text-on-surface`}>{c.recipientName}</span>
                          <span className="text-xs text-on-surface-variant shrink-0 ml-2">
                            {new Date(c.lastMessageAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <p className={`text-xs truncate ${c.unread > 0 ? 'text-on-surface font-medium' : 'text-on-surface-variant'}`}>
                          {c.lastMessageFromMe ? 'Tu: ' : ''}{c.lastMessageBody}
                        </p>
                      </div>
                      {c.unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-primary-container text-black text-xs font-bold flex items-center justify-center shrink-0">
                          {c.unread}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </>
            ) : (
              /* All conversations tab */
              loadingAll ? (
                <p className="text-on-surface-variant text-sm text-center py-8">Cargando...</p>
              ) : allConvos.length === 0 ? (
                <p className="text-on-surface-variant text-sm text-center py-8">Sin conversaciones en el sistema</p>
              ) : (
                allConvos.map((c) => {
                  const isActive = viewingPair?.a === c.userA._id && viewingPair?.b === c.userB._id;
                  return (
                    <button
                      key={`${c.userA._id}-${c.userB._id}`}
                      onClick={() => viewConversation(c)}
                      className={`w-full px-4 py-3 text-left transition-colors ${isActive ? 'bg-primary-container/10' : 'hover:bg-[rgba(255,255,255,0.03)]'}`}
                      style={{ borderBottom: '1px solid rgba(42,45,53,0.4)' }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs text-on-surface font-medium">{c.userA.name}</span>
                        <svg className="w-3 h-3 text-on-surface-variant shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <span className="text-xs text-on-surface font-medium">{c.userB.name}</span>
                        <span className="text-xs text-on-surface-variant ml-auto">{c.totalMessages} msgs</span>
                      </div>
                      <p className="text-xs text-on-surface-variant truncate">{c.lastMessageBody}</p>
                    </button>
                  );
                })
              )
            )}
          </div>
        </div>

        {/* Right panel — chat */}
        <div className="admin-card flex-1 flex flex-col">
          {!hasActiveView ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
              <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm">Selecciona un chat o busca un usuario</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-container to-primary-container/50 flex items-center justify-center text-black font-bold text-xs">
                    {initials(activeChat ? activeName : viewingPair!.label.split(' ')[0])}
                  </div>
                  <span className="text-on-surface font-medium text-sm">
                    {activeChat ? activeName : viewingPair!.label}
                  </span>
                  {viewingPair && <span className="text-xs text-on-surface-variant">(solo lectura)</span>}
                </div>
                <button
                  onClick={() => { setActiveChat(null); setViewingPair(null); }}
                  className="text-on-surface-variant hover:text-on-surface text-xs"
                >
                  Cerrar
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                {loadingChat ? (
                  <p className="text-on-surface-variant text-sm text-center py-8">Cargando...</p>
                ) : messages.length === 0 ? (
                  <p className="text-on-surface-variant text-sm text-center py-8">
                    {activeChat ? 'Envia un mensaje para iniciar la conversacion' : 'Sin mensajes'}
                  </p>
                ) : (
                  <>
                    {messages.map((msg) => {
                      const fromId = typeof msg.from === 'object' ? msg.from._id : msg.from;
                      const isMe = String(fromId) === String(user?._id);
                      return viewingPair ? (
                        /* Admin view: show all messages linearly with delete */
                        <div key={msg._id} className="group flex items-start gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-container to-primary-container/50 flex items-center justify-center text-black font-bold shrink-0 mt-0.5" style={{ fontSize: '0.55rem' }}>
                            {initials(msg.from.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-on-surface">{msg.from.name}</span>
                              <span className="text-xs text-on-surface-variant">
                                {new Date(msg.createdAt).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <button
                                onClick={() => handleDeleteMsg(msg._id)}
                                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                                title="Eliminar"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                            <p className="text-sm text-on-surface" style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{msg.body}</p>
                          </div>
                        </div>
                      ) : (
                        /* My chat: bubble style */
                        <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className="max-w-[75%] px-3.5 py-2 rounded-2xl text-sm"
                            style={{
                              background: isMe ? 'var(--color-primary-container)' : 'rgba(42,45,53,0.7)',
                              color: isMe ? '#000' : 'var(--color-on-surface)',
                              borderBottomRightRadius: isMe ? '4px' : undefined,
                              borderBottomLeftRadius: !isMe ? '4px' : undefined,
                            }}
                          >
                            <p style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{msg.body}</p>
                            <p className="text-right mt-1" style={{ fontSize: '0.65rem', opacity: 0.6 }}>
                              {new Date(msg.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </>
                )}
              </div>

              {/* Input (only when chatting as admin, not viewing others) */}
              {activeChat && (
                <form
                  onSubmit={handleSend}
                  className="px-4 py-3 flex items-center gap-3"
                  style={{ borderTop: '1px solid var(--color-outline-variant)' }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="input flex-1"
                    style={{ borderRadius: '9999px', fontSize: '0.9rem' }}
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMsg.trim()}
                    className="w-10 h-10 rounded-full bg-primary-container text-black flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity disabled:opacity-30"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
