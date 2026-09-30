'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

/**
 * Suscripcion al newsletter.
 *
 * Vive aparte porque /blog paso a renderizarse en el servidor: este es el unico
 * trozo de esa pagina que necesita estado, y aislarlo evita volver a marcar el
 * listado completo como componente de cliente.
 */
export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState('');
  const [error, setError] = useState('');

  const suscribir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setEnviando(true);
    setError('');
    setExito('');
    try {
      await api.subscribe(email);
      setExito('Te has suscrito correctamente.');
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al suscribirse');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <form className="newsletter__form" onSubmit={suscribir}>
        <input
          type="email"
          placeholder="tu@email.com"
          aria-label="Tu correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input flex-1"
          required
        />
        <button
          type="submit"
          className="btn btn--primary whitespace-nowrap"
          disabled={enviando}
        >
          {enviando ? 'Enviando…' : 'Suscribirme'}
        </button>
      </form>

      <div aria-live="polite">
        {exito && <p className="text-green-400 text-sm mt-3">{exito}</p>}
        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      </div>
    </>
  );
}
