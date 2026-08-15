'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface UserOption {
  _id: string;
  name: string;
}

export default function NewMessagePage() {
  return (
    <Suspense>
      <NewMessageForm />
    </Suspense>
  );
}

function NewMessageForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, accessToken, isLoading } = useAuth();

  const [to, setTo] = useState(searchParams.get('to') || '');
  const [toName, setToName] = useState(searchParams.get('toName') || '');
  const [subject, setSubject] = useState(searchParams.get('subject') || '');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  // User search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserOption[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user || !accessToken) {
      router.push('/login?returnUrl=/mensajes/nuevo');
    }
  }, [user, accessToken, isLoading, router]);

  // Debounced user search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (searchQuery.length < 2 || !accessToken) {
      setSearchResults([]);
      return;
    }
    searchTimeout.current = setTimeout(() => {
      api
        .searchUsers(searchQuery, accessToken)
        .then((data) => {
          const results = (data as UserOption[]) || [];
          // Filter out self
          setSearchResults(results.filter((u) => u._id !== user?._id));
          setShowDropdown(true);
        })
        .catch(() => setSearchResults([]));
    }, 300);
  }, [searchQuery, accessToken, user?._id]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function selectUser(u: UserOption) {
    setTo(u._id);
    setToName(u.name);
    setSearchQuery('');
    setShowDropdown(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!to || !subject.trim() || !body.trim() || !accessToken) return;
    setSending(true);
    setError('');
    try {
      await api.sendMessage({ to, subject: subject.trim(), body: body.trim() }, accessToken);
      router.push('/mensajes');
    } catch (err: any) {
      setError(err.message || 'Error al enviar mensaje');
      setSending(false);
    }
  }

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
        <div className="max-w-2xl mx-auto px-6">
          <Link
            href="/mensajes"
            className="inline-flex items-center gap-2 text-primary-container hover:text-primary-container/80 text-sm mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a mensajes
          </Link>

          <h1 className="text-2xl font-bold text-on-surface mb-6">Nuevo mensaje</h1>

          <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 space-y-5">
            {/* Recipient */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <label className="label">Para</label>
              {toName ? (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg text-sm text-on-surface" style={{ background: 'rgba(26,28,34,0.8)', border: '1px solid var(--color-outline-variant)' }}>
                    {toName}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setTo(''); setToName(''); }}
                    className="text-on-surface-variant hover:text-on-surface text-sm"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar usuario por nombre..."
                  className="input"
                  autoComplete="off"
                />
              )}
              {showDropdown && searchResults.length > 0 && (
                <div
                  className="absolute z-10 w-full mt-1 rounded-lg shadow-lg overflow-hidden"
                  style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-outline-variant)' }}
                >
                  {searchResults.map((u) => (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => selectUser(u)}
                      className="w-full px-4 py-3 text-left text-sm text-on-surface hover:bg-[rgba(26,28,34,0.5)] transition-colors flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-container to-primary-container/50 flex items-center justify-center text-black font-bold text-xs">
                        {u.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      {u.name}
                    </button>
                  ))}
                </div>
              )}
              {showDropdown && searchQuery.length >= 2 && searchResults.length === 0 && (
                <div
                  className="absolute z-10 w-full mt-1 rounded-lg shadow-lg p-4 text-sm text-on-surface-variant text-center"
                  style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-outline-variant)' }}
                >
                  No se encontraron usuarios
                </div>
              )}
            </div>

            {/* Subject */}
            <div>
              <label className="label">Asunto</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Asunto del mensaje"
                className="input"
                required
              />
            </div>

            {/* Body */}
            <div>
              <label className="label">Mensaje</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="input"
                rows={8}
                required
                style={{ resize: 'vertical', minHeight: '160px' }}
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="btn btn--primary"
                disabled={sending || !to || !subject.trim() || !body.trim()}
              >
                {sending ? 'Enviando...' : 'Enviar mensaje'}
              </button>
              <Link href="/mensajes" className="btn btn--ghost">
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
