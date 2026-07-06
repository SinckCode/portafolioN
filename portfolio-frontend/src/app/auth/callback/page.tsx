'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Aterrizaje del flujo OAuth: el API redirige aquí con los tokens.
// Los guardamos, cargamos el perfil y mandamos al usuario según su rol.
function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { loginWithTokens } = useAuth();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const access = params.get('access');
    const refresh = params.get('refresh');

    if (!access || !refresh) {
      router.replace('/login?error=oauth');
      return;
    }

    loginWithTokens(access, refresh)
      .then(async () => {
        // El rol decide el destino
        const token = localStorage.getItem('accessToken');
        const { api } = await import('@/lib/api');
        const profile = token
          ? ((await api.getProfile(token).catch(() => null)) as { role?: string } | null)
          : null;
        const role = profile?.role;
        router.replace(role === 'admin' || role === 'editor' ? '/admin' : '/perfil/cursos');
      })
      .catch(() => router.replace('/login?error=oauth'));
  }, [params, router, loginWithTokens]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-3">
      <span className="preloader__monogram" aria-hidden="true">AO</span>
      <p className="text-on-surface-variant">Iniciando sesión…</p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackInner />
    </Suspense>
  );
}
