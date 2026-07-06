'use client';

import { useMemo } from 'react';

// Fondo estático cuando WebGL no está disponible o el modelo falla
// (port de la SPA): gradiente radial + partículas CSS flotantes.

const PARTICLE_COUNT = 36;

export default function CanvasFallback() {
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${20 + Math.random() * 80}%`,
        size: 2 + Math.random() * 4,
        duration: 8 + Math.random() * 14,
        delay: -Math.random() * 20,
      })),
    []
  );

  return (
    <div className="canvas-fallback" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="canvas-fallback__particle"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
