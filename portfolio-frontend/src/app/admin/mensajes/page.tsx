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
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConvo, setActiveConvo] = useState<{ userA: string; userB: string; label: string } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);

  // Admin can also send messages
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [sendTo, setSendTo] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserOption[]>([]);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const activeConvoRef = useRef<typeof activeConvo>(null);

  useEffect(() => {
    activeConvoRef.current = activeConvo;
  }, [activeConvo]);

  const fetchConversations = useCallback(async () => {
    if (!accessToken) return;
    try {
      const data = await api.getAdminConversations(accessToken);
      setConversations((data as AdminConversation[]) || []);
    } catch { /* empty */ }
    setLoading(false);
  }, [accessToken]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const loadChat = useCallback(async (userA: string, userB: string) => {
    if (!accessToken) return;
    try {
      const data = await api.getAdminConversation(userA, userB, accessToken);
      setMessages((data as ChatMessage[]) || []);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'auto' }), 50);
    } catch { /* empty */ }
  }, [accessToken]);

  // Socket for real-time updates in admin
  useEffect(() => {
    if (!accessToken) return;

    const socket = io(`${WS_URL}/messages`, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    const refreshAll = () => {
      fetchConversations();
      if (activeConvoRef.current) {
        loadChat(activeConvoRef.current.userA, activeConvoRef.current.userB);
      }
    };

    socket.on('newMessage', refreshAll);
    socket.on('messageSent', refreshAll);

    return () => { socket.disconnect(); };
  }, [accessToken, fetchConversations, loadChat]);

  function openConvo(c: AdminConversation) {
    const label = `${c.userA.name} y ${c.userB.name}`;
    setActiveConvo({ userA: c.userA._id, userB: c.userB._id, label });
    setLoadingChat(true);
    loadChat(c.userA._id, c.userB._id).finally(() => setLoadingChat(false));
  }

  async function handleAdminSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMsg.trim() || !sendTo || !accessToken) return;
    setSending(true);
    try {
      await api.sendMessage({ to: sendTo, body: newMsg.trim() }, accessToken);
      setNewMsg('');
      setShowCompose(false);
      setSendTo('');
      fetchConversations();
    } catch { /* empty */ }
    setSending(false);
  }

  async function handleDeleteMsg(id: string) {
    if (!confirm('Eliminar este mensaje permanentemente?')) return;
    if (!accessToken) return;
    try {
      await api.adminDeleteMessage(id, accessToken);
      setMessages((prev) => prev.filter((m) => m._id !== id));
      fetchConversations();
    } catch { /* empty */ }
  }

  // User search for compose
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (searchQuery.length < 2 || !accessToken) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(() => {
      api.searchUsers(searchQuery, accessToken)
        .then((data) => setSearchResults((data as UserOption[]) || []))
        .catch(() => setSearchResults([]));
    }, 300);
  }, [searchQuery, accessToken]);

  function initials(name: string) {
    return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="admin-page__title">Mensajes</h1>
        <button
          onClick={() => { setShowCompose(!showCompose); setActiveConvo(null); }}
          className="btn btn--primary"
          style={{ fontSize: '0.85rem' }}
        >
          Nuevo mensaje
        </button>
      </div>

      <div className="flex gap-6" style={{ height: 'calc(100vh - 220px)', minHeight: '400px' }}>
        {/* Conversation list */}
        <div className="admin-card flex flex-col" style={{ width: '380px', minWidth: '300px' }}>
          <div className="px-4 py-3 font-medium text-on-surface text-sm" style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
            Todas las conversaciones
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="text-on-surface-variant text-sm text-center py-8">Cargando...</p>
            ) : conversations.length === 0 ? (
              <p className="text-on-surface-variant text-sm text-center py-8">Sin conversaciones</p>
            ) : (
              conversations.map((c, i) => {
                const isActive = activeConvo?.userA === c.userA._id && activeConvo?.userB === c.userB._id;
                return (
                  <button
                    key={`${c.userA._id}-${c.userB._id}`}
                    onClick={() => openConvo(c)}
                    className={`w-full px-4 py-3 text-left transition-colors ${isActive ? 'bg-primary-container/10' : 'hover:bg-[rgba(255,255,255,0.03)]'}`}
                    style={i < conversations.length - 1 ? { borderBottom: '1px solid rgba(42,45,53,0.4)' } : {}}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-1">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-container to-primary-container/50 flex items-center justify-center text-black font-bold" style={{ fontSize: '0.6rem' }}>
                          {initials(c.userA.name)}
                        </div>
                        <span className="text-xs text-on-surface">{c.userA.name}</span>
                      </div>
                      <svg className="w-3 h-3 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <div className="flex items-center gap-1">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-container to-primary-container/50 flex items-center justify-center text-black font-bold" style={{ fontSize: '0.6rem' }}>
                          {initials(c.userB.name)}
                        </div>
                        <span className="text-xs text-on-surface">{c.userB.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-on-surface-variant truncate flex-1">{c.lastMessageBody}</p>
                      <span className="text-xs text-on-surface-variant shrink-0 ml-2">
                        {c.totalMessages} msgs
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {new Date(c.lastMessageAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right panel: chat view or compose */}
        <div className="admin-card flex-1 flex flex-col">
          {showCompose ? (
            /* Compose new message */
            <div className="p-6">
              <h2 className="text-on-surface font-medium mb-4">Enviar mensaje como {user?.name}</h2>
              <div className="mb-4">
                <label className="block text-sm text-on-surface-variant mb-1">Destinatario</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar usuario..."
                  className="input"
                  style={{ fontSize: '0.85rem' }}
                />
                {searchResults.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-40 overflow-y-auto admin-card p-2">
                    {searchResults.map((u) => (
                      <button
                        key={u._id}
                        onClick={() => { setSendTo(u._id); setSearchQuery(u.name); setSearchResults([]); }}
                        className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors flex items-center gap-2 ${sendTo === u._id ? 'bg-primary-container/20 text-on-surface' : 'text-on-surface hover:bg-[rgba(255,255,255,0.05)]'}`}
                      >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-container to-primary-container/50 flex items-center justify-center text-black font-bold" style={{ fontSize: '0.55rem' }}>
                          {initials(u.name)}
                        </div>
                        {u.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <form onSubmit={handleAdminSend}>
                <textarea
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="input w-full mb-4"
                  rows={4}
                  style={{ fontSize: '0.85rem', resize: 'vertical' }}
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={sending || !newMsg.trim() || !sendTo}
                    className="btn btn--primary"
                  >
                    {sending ? 'Enviando...' : 'Enviar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCompose(false); setNewMsg(''); setSendTo(''); setSearchQuery(''); }}
                    className="btn btn--ghost"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          ) : activeConvo ? (
            /* Chat view */
            <>
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                <span className="text-on-surface font-medium text-sm">{activeConvo.label}</span>
                <button
                  onClick={() => setActiveConvo(null)}
                  className="text-on-surface-variant hover:text-on-surface text-xs"
                >
                  Cerrar
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                {loadingChat ? (
                  <p className="text-on-surface-variant text-sm text-center py-8">Cargando...</p>
                ) : messages.length === 0 ? (
                  <p className="text-on-surface-variant text-sm text-center py-8">Sin mensajes</p>
                ) : (
                  <>
                    {messages.map((msg) => (
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
                              title="Eliminar mensaje"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          <p className="text-sm text-on-surface" style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{msg.body}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </>
                )}
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
              <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm">Selecciona una conversacion para ver los mensajes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
