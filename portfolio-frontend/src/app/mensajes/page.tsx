'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface MessagePreview {
  _id: string;
  subject: string;
  body: string;
  read: boolean;
  createdAt: string;
  from?: { _id: string; name: string; avatar?: string };
  to?: { _id: string; name: string; avatar?: string };
}

export default function MessagesPage() {
  const router = useRouter();
  const { user, accessToken, isLoading } = useAuth();
  const [tab, setTab] = useState<'inbox' | 'sent'>('inbox');
  const [messages, setMessages] = useState<MessagePreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!user || !accessToken) {
      router.push('/login?returnUrl=/mensajes');
      return;
    }

    setLoading(true);
    const fetcher = tab === 'inbox' ? api.getInbox(accessToken) : api.getSent(accessToken);
    fetcher
      .then((data) => setMessages((data as MessagePreview[]) || []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [tab, user, accessToken, isLoading, router]);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-20 flex items-center justify-center">
          <p className="text-on-surface-variant">Cargando...</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-on-surface">Mensajes</h1>
            <Link href="/mensajes/nuevo" className="btn btn--primary">
              Nuevo mensaje
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-lg" style={{ background: 'rgba(26,28,34,0.6)' }}>
            <button
              onClick={() => setTab('inbox')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                tab === 'inbox'
                  ? 'bg-primary-container text-black'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Recibidos
            </button>
            <button
              onClick={() => setTab('sent')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                tab === 'sent'
                  ? 'bg-primary-container text-black'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Enviados
            </button>
          </div>

          {/* Messages list */}
          {loading ? (
            <p className="text-on-surface-variant text-center py-12">Cargando mensajes...</p>
          ) : messages.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 mx-auto text-on-surface-variant mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-on-surface-variant">
                {tab === 'inbox' ? 'No tienes mensajes' : 'No has enviado mensajes'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((msg) => {
                const otherUser = tab === 'inbox' ? msg.from : msg.to;
                const initials = (otherUser?.name || '?')
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                return (
                  <Link
                    key={msg._id}
                    href={`/mensajes/${msg._id}`}
                    className="glass-card p-4 flex items-center gap-4 hover:bg-[rgba(26,28,34,0.5)] transition-colors block"
                    style={{ borderLeft: tab === 'inbox' && !msg.read ? '3px solid var(--color-primary)' : undefined }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-container to-primary-container/50 flex items-center justify-center text-black font-bold text-sm shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm truncate ${tab === 'inbox' && !msg.read ? 'font-bold text-on-surface' : 'text-on-surface'}`}>
                          {otherUser?.name || 'Usuario'}
                        </span>
                        <span className="text-xs text-on-surface-variant shrink-0">
                          {new Date(msg.createdAt).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${tab === 'inbox' && !msg.read ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}`}>
                        {msg.subject}
                      </p>
                      <p className="text-xs text-on-surface-variant truncate">
                        {msg.body.slice(0, 80)}
                      </p>
                    </div>
                    {tab === 'inbox' && !msg.read && (
                      <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
