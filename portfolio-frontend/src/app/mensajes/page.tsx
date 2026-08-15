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

  // Search users to start chat
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserOption[]>([]);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const activeChatRef = useRef<string | null>(null);

  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || !accessToken) {
      router.push('/login?returnUrl=/mensajes');
    }
  }, [user, accessToken, isLoading, router]);

  const fetchConvos = useCallback(() => {
    if (!accessToken) return;
    api.getConversations(accessToken)
      .then((data) => setConversations((data as Conversation[]) || []))
      .catch(() => {})
      .finally(() => setLoadingConvos(false));
  }, [accessToken]);

  useEffect(() => { fetchConvos(); }, [fetchConvos]);

  const fetchChat = useCallback((userId: string) => {
    if (!accessToken) return;
    api.getConversation(userId, accessToken)
      .then((data) => {
        setMessages((data as ChatMessage[]) || []);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      })
      .catch(() => {});
  }, [accessToken]);

  // Socket.IO — bonus real-time, NOT the only way messages appear
  useEffect(() => {
    if (!accessToken) return;

    const socket = io(`${WS_URL}/messages`, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('newMessage', (msg: ChatMessage) => {
      if (activeChatRef.current === msg.from._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      }
      fetchConvos();
    });

    socket.on('messageSent', (msg: ChatMessage) => {
      if (activeChatRef.current === msg.to._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      }
      fetchConvos();
    });

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [accessToken, fetchConvos]);

  // Open a conversation
  function openChat(userId: string, name: string) {
    setActiveChat(userId);
    setActiveName(name);
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

    fetchConvos();
  }

  // Send message — uses API response directly, not WebSocket
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMsg.trim() || !activeChat || !accessToken) return;
    const body = newMsg.trim();
    setSending(true);
    setNewMsg('');
    try {
      const sent = await api.sendMessage({ to: activeChat, body }, accessToken) as ChatMessage;
      // Add to messages immediately from API response
      if (sent?._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === sent._id)) return prev;
          return [...prev, sent];
        });
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      } else {
        // Fallback: refetch the whole conversation
        fetchChat(activeChat);
      }
      fetchConvos();
      inputRef.current?.focus();
    } catch { /* ignore */ }
    setSending(false);
  }

  // User search (inline in sidebar)
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
              {/* Header + search input always visible */}
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

              {/* Search results or conversation list */}
              <div className="flex-1 overflow-y-auto">
                {searchQuery.length >= 2 && searchResults.length > 0 ? (
                  /* Search results */
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
                  /* Conversation list */
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
                  {/* Chat header */}
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

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                    {loadingChat ? (
                      <p className="text-on-surface-variant text-sm text-center py-8">Cargando...</p>
                    ) : messages.length === 0 ? (
                      <p className="text-on-surface-variant text-sm text-center py-8">Envia un mensaje para iniciar la conversacion</p>
                    ) : (
                      <>
                        {messages.map((msg) => {
                          const isMe = msg.from._id === user?._id;
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

                  {/* Input */}
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
