'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch {
      setError('Error al enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page cyber-grid">
      <div className="auth-page__blob" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link href="/" className="block text-center mb-8">
          <span className="text-3xl font-bold text-on-surface">
            A<span className="text-primary-container">O</span>
          </span>
        </Link>

        {/* Card */}
        <div className="auth-page__card glass-card">
          <div className="auth-page__header">
            <h1 className="auth-page__title">
              Recuperar contrasena
            </h1>
            <p className="auth-page__subtitle">
              Ingresa tu email y te enviaremos un enlace para restablecer tu contrasena.
            </p>
          </div>

          {sent ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-container/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary-container" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-on-surface font-medium mb-2">Correo enviado</p>
              <p className="text-on-surface-variant text-sm mb-6">
                Si existe una cuenta con ese email, recibiras un enlace para restablecer tu contrasena.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-primary-container hover:text-primary-container/80 text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver a iniciar sesion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-page__form">
              <div>
                <label className="block text-sm text-on-surface-variant mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="input"
                />
              </div>

              {error && (
                <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
              )}
              <button
                type="submit"
                className="auth-page__submit"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>
          )}

          {!sent && (
            <p className="auth-page__footer">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-primary-container hover:text-primary-container/80 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver a iniciar sesion
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
