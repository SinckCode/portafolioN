'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ResetPasswordPage() {
  const params = useParams();
  const token = params.token as string;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al restablecer la contrasena');
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
          {success ? (
            <div className="text-center py-6">
              <div className="auth-page__success-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-on-surface mb-2">
                Contrasena actualizada
              </h2>
              <p className="text-on-surface-variant text-sm mb-6">
                Tu contrasena ha sido restablecida exitosamente.
              </p>
              <Link
                href="/login"
                className="btn btn--primary inline-flex px-6 py-3"
              >
                Iniciar sesion
              </Link>
            </div>
          ) : (
            <>
              <div className="auth-page__header">
                <h1 className="auth-page__title">
                  Nueva contrasena
                </h1>
                <p className="auth-page__subtitle">
                  Ingresa tu nueva contrasena.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="auth-page__form">
                <div>
                  <label className="block text-sm text-on-surface-variant mb-2">
                    Nueva contrasena
                  </label>
                  <div className="input__wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="input input--with-icon"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="input__icon text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-2">
                    Minimo 8 caracteres, 1 mayuscula, 1 numero
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-on-surface-variant mb-2">
                    Confirmar contrasena
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="input"
                  />
                </div>

                {error && (
                  <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
                )}

                <button
                  type="submit"
                  className="auth-page__submit btn btn--primary"
                  disabled={loading}
                >
                  {loading ? 'Restableciendo...' : 'Restablecer contrasena'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
