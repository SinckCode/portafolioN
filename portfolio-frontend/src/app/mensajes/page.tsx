'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { io, Socket } from 'socket.io-client';

const WS_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api$/, '');

interface Conversation {
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
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

export default function MessagesPage() {
  const router = useRouter();
  const { user, accessToken, isLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeName, setActiveName] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserOption[]>([]);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeChatRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || !accessToken) router.push('/login?returnUrl=/mensajes');
  }, [user, accessToken, isLoading, router]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior }), 50);
  }, []);

  // --- Data fetching (only on demand, never polling) ---
  const fetchConvos = useCallback(() => {
    if (!accessToken) return;
    api.getConversations(accessToken)
      .then((data) => setConversations((data as Conversation[]) || []))
      .catch(() => {})
      .finally(() => setLoadingConvos(false));
  }, [accessToken]);

  useEffect(() => { fetchConvos(); }, [fetchConvos]);

  // --- WebSocket: PRIMARY real-time mechanism (pattern: Rocket.Chat / Socket.IO official) ---
  useEffect(() => {
    if (!accessToken) return;

    const socket = io(`${WS_URL}/messages`, {
      // Auth function: always reads current token (survives auto-refresh)
      auth: (cb: (data: { token: string }) => void) => {
        cb({ token: localStorage.getItem('accessToken') || accessToken });
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: Infinity,
    });

    socket.on('connect', () => {
      setWsConnected(true);
      // On reconnect: catch up on missed data
      fetchConvos();
      const chatId = activeChatRef.current;
      if (chatId) {
        api.getConversation(chatId, localStorage.getItem('accessToken') || accessToken)
          .then((data) => {
            setMessages((data as ChatMessage[]) || []);
            scrollToBottom();
          })
          .catch(() => {});
      }
    });

    socket.on('disconnect', () => setWsConnected(false));

    // Message from another user → add to chat if active
    socket.on('newMessage', (msg: ChatMessage) => {
      const fromId = typeof msg.from === 'object' ? msg.from._id : msg.from;
      if (activeChatRef.current === fromId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        scrollToBottom();
      }
      fetchConvos();
    });

    // My own message confirmed via WS (backup for HTTP response)
    socket.on('messageSent', (msg: ChatMessage) => {
      const toId = typeof msg.to === 'object' ? msg.to._id : msg.to;
      if (activeChatRef.current === toId) {
        setMessages((prev) => {
          // Already present from HTTP response? skip
          if (prev.some((m) => m._id === msg._id)) return prev;
          // Replace optimistic temp message
          const tempIdx = prev.findIndex((m) => m._id.startsWith('temp-') && m.body === msg.body);
          if (tempIdx >= 0) {
            const updated = [...prev];
            updated[tempIdx] = msg;
            return updated;
          }
          return [...prev, msg];
        });
      }
      fetchConvos();
    });

    return () => { socket.disconnect(); };
  }, [accessToken, fetchConvos, scrollToBottom]);

  // --- Fallback polling: ONLY when WebSocket is disconnected (10s, not 3s) ---
  useEffect(() => {
    if (wsConnected || !activeChat || !accessToken) {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
      return;
    }
    pollRef.current = setInterval(() => {
      api.getConversation(activeChat, accessToken)
        .then((data) => setMessages((data as ChatMessage[]) || []))
        .catch(() => {});
      fetchConvos();
    }, 10000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [wsConnected, activeChat, accessToken, fetchConvos]);

  // --- Actions ---
  function openChat(userId: string, name: string) {
    setActiveChat(userId);
    setActiveName(name);
    setLoadingChat(true);
    setSearchQuery('');
    setSearchResults([]);

    api.getConversation(userId, accessToken!)
      .then((data) => {
        setMessages((data as ChatMessage[]) || []);
        scrollToBottom('auto');
      })
      .catch(() => {})
      .finally(() => setLoadingChat(false));

    fetchConvos();
  }

  // Pattern: Rocket.Chat — HTTP response IS the source of truth for the sender
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMsg.trim() || !activeChat || !accessToken || !user) return;
    const body = newMsg.trim();
    setSending(true);
    setNewMsg('');

    // 1. Show optimistic message instantly
    const optimisticId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      _id: optimisticId,
      body,
      createdAt: new Date().toISOString(),
      from: { _id: user._id, name: user.name, avatar: user.avatar },
      to: { _id: activeChat, name: activeName },
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom();

    try {
      // 2. POST returns the saved message — use it directly (no refetch!)
      const saved = await api.sendMessage({ to: activeChat, body }, accessToken) as ChatMessage;
      setMessages((prev) => prev.map((m) => m._id === optimisticId ? saved : m));
      fetchConvos();
    } catch {
      // 3. On failure: remove optimistic message
      setMessages((prev) => prev.filter((m) => m._id !== optimisticId));
    }
    setSending(false);
    inputRef.current?.focus();
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

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-20 flex items-center justify-center">
          <p className="text-on-surface-variant">Cargando...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-0">
        <div className="max-w-5xl mx-auto px-4" style={{ height: 'calc(100vh - 96px)' }}>
          <div className="flex h-full rounded-t-xl overflow-hidden" style={{ border: '1px solid var(--color-outline-variant)', borderBottom: 'none' }}>

            {/* Sidebar */}
            <div
              className={`flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}
              style={{ width: '100%', maxWidth: '320px', background: 'rgba(15,17,21,0.8)', borderRight: '1px solid var(--color-outline-variant)' }}
            >
              <div className="p-4" style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                <h1 className="text-lg font-bold text-on-surface mb-3">Chats</h1>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar usuario..."
                  className="input w-full"
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <div className="flex-1 overflow-y-auto">
                {searchQuery.length >= 2 && searchResults.length > 0 ? (
                  <div>
                    <p className="px-4 pt-3 pb-1 text-xs text-on-surface-variant font-medium uppercase">Usuarios</p>
                    {searchResults.map((u) => (
                      <button
                        key={u._id}
                        onClick={() => openChat(u._id, u.name)}
                        className="w-full px-4 py-3 text-left text-sm text-on-surface hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-container to-primary-container/50 flex items-center justify-center text-black font-bold text-sm shrink-0">
                          {initials(u.name)}
                        </div>
                        {u.name}
                      </button>
                    ))}
                  </div>
                ) : searchQuery.length >= 2 && searchResults.length === 0 ? (
                  <p className="text-on-surface-variant text-sm text-center py-8">Sin resultados</p>
                ) : loadingConvos ? (
                  <p className="text-on-surface-variant text-sm text-center py-8">Cargando...</p>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <svg className="w-12 h-12 mx-auto text-on-surface-variant mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-on-surface-variant text-sm">Sin conversaciones</p>
                    <p className="text-on-surface-variant text-xs mt-1">Busca un usuario para chatear</p>
                  </div>
                ) : (
                  conversations.map((c) => (
                    <button
                      key={c.recipientId}
                      onClick={() => openChat(c.recipientId, c.recipientName)}
                      className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                        activeChat === c.recipientId ? 'bg-primary-container/10' : 'hover:bg-[rgba(255,255,255,0.03)]'
                      }`}
                      style={{ borderBottom: '1px solid rgba(42,45,53,0.4)' }}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-container to-primary-container/50 flex items-center justify-center text-black font-bold text-sm shrink-0">
                        {initials(c.recipientName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm truncate ${c.unread > 0 ? 'font-bold text-on-surface' : 'text-on-surface'}`}>
                            {c.recipientName}
                          </span>
                          <span className="text-xs text-on-surface-variant shrink-0 ml-2">
                            {new Date(c.lastMessageAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className={`text-xs truncate flex-1 ${c.unread > 0 ? 'text-on-surface font-medium' : 'text-on-surface-variant'}`}>
                            {c.lastMessageFromMe ? 'Tu: ' : ''}{c.lastMessageBody}
                          </p>
                          {c.unread > 0 && (
                            <span className="w-5 h-5 rounded-full bg-primary-container text-black text-xs font-bold flex items-center justify-center shrink-0">
                              {c.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat area */}
            <div
              className={`flex-1 flex flex-col ${!activeChat ? 'hidden md:flex' : 'flex'}`}
              style={{ background: 'rgba(10,12,16,0.6)' }}
            >
              {!activeChat ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
                  <svg className="w-20 h-20 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-sm">Busca un usuario para iniciar un chat</p>
                </div>
              ) : (
                <>
                  <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                    <button
                      onClick={() => setActiveChat(null)}
                      className="md:hidden text-on-surface-variant hover:text-on-surface"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-container to-primary-container/50 flex items-center justify-center text-black font-bold text-sm">
                      {initials(activeName)}
                    </div>
                    <span className="text-on-surface font-medium">{activeName}</span>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                    {loadingChat ? (
                      <p className="text-on-surface-variant text-sm text-center py-8">Cargando...</p>
                    ) : messages.length === 0 ? (
                      <p className="text-on-surface-variant text-sm text-center py-8">Envia un mensaje para iniciar la conversacion</p>
                    ) : (
                      <>
                        {messages.map((msg) => {
                          const fromId = typeof msg.from === 'object' ? msg.from._id : msg.from;
                          const isMe = String(fromId) === String(user?._id);
                          return (
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
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
