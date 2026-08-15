'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface MessageDetail {
  _id: string;
  subject: string;
  body: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
  from: { _id: string; name: string; email: string; avatar?: string };
  to: { _id: string; name: string; email: string; avatar?: string };
}

export default function MessageDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, accessToken, isLoading } = useAuth();
  const [message, setMessage] = useState<MessageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user || !accessToken) {
      router.push('/login?returnUrl=/mensajes');
      return;
    }
    if (!params?.id) return;

    api
      .getMessage(params.id, accessToken)
      .then((data) => setMessage(data as MessageDetail))
      .catch(() => router.push('/mensajes'))
      .finally(() => setLoading(false));
  }, [params?.id, user, accessToken, isLoading, router]);

  async function handleDelete() {
    if (!message || !accessToken) return;
    if (!confirm('Eliminar este mensaje?')) return;
    setDeleting(true);
    try {
      await api.deleteMessage(message._id, accessToken);
      router.push('/mensajes');
    } catch {
      setDeleting(false);
    }
  }

  const isFromMe = message && user && message.from._id === user._id;

  if (isLoading || loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-20 flex items-center justify-center">
          <p className="text-on-surface-variant">Cargando mensaje...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!message) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center gap-4">
          <p className="text-on-surface-variant">Mensaje no encontrado</p>
          <Link href="/mensajes" className="btn btn--primary">Volver a mensajes</Link>
        </main>
        <Footer />
      </>
    );
  }

  const otherUser = isFromMe ? message.to : message.from;

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          {/* Back link */}
          <Link
            href="/mensajes"
            className="inline-flex items-center gap-2 text-primary-container hover:text-primary-container/80 text-sm mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a mensajes
          </Link>

          <div className="glass-card p-6 md:p-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b border-outline-variant">
              <div>
                <h1 className="text-xl font-bold text-on-surface mb-3">{message.subject}</h1>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-container to-primary-container/50 flex items-center justify-center text-black font-bold text-sm">
                    {(otherUser.name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-on-surface font-medium">
                      {isFromMe ? `Para: ${message.to.name}` : `De: ${message.from.name}`}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {new Date(message.createdAt).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="text-on-surface leading-relaxed whitespace-pre-wrap mb-8" style={{ minHeight: '120px' }}>
              {message.body}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-6 border-t border-outline-variant">
              {!isFromMe && (
                <Link
                  href={`/mensajes/nuevo?to=${message.from._id}&toName=${encodeURIComponent(message.from.name)}&subject=${encodeURIComponent(`Re: ${message.subject}`)}`}
                  className="btn btn--primary"
                >
                  Responder
                </Link>
              )}
              <button
                onClick={handleDelete}
                className="btn btn--ghost"
                style={{ color: '#ef4444' }}
                disabled={deleting}
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
