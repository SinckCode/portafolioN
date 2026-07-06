'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) return;

    fetch(`${API_URL}/auth/verify-email?token=${token}`)
      .then((res) => {
        if (!res.ok) throw new Error('Verification failed');
        setStatus('success');
      })
      .catch(() => {
        setStatus('error');
      });
  }, [token]);

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
              Verificacion de email
            </h1>
          </div>

          {status === 'loading' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-container/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary-container animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              </div>
              <p className="text-on-surface-variant text-sm">
                Verificando tu email...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-6">
              <div className="auth-page__success-icon">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-on-surface font-medium mb-2">
                Email verificado exitosamente
              </p>
              <p className="text-on-surface-variant text-sm mb-6">
                Tu cuenta ha sido verificada. Ya puedes iniciar sesion.
              </p>
              <Link href="/login" className="btn btn--primary">
                Iniciar sesion
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-on-surface font-medium mb-2">
                Token invalido o expirado
              </p>
              <p className="text-on-surface-variant text-sm mb-6">
                El enlace de verificacion no es valido o ha expirado. Intenta registrarte nuevamente.
              </p>
              <Link href="/registro" className="btn btn--primary">
                Registrarse
              </Link>
            </div>
          )}

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
        </div>
      </div>
    </div>
  );
}
