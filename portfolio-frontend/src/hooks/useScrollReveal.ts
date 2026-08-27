'use client';

import { useEffect, useRef } from 'react';
import { useInView, useAnimationControls, type UseInViewOptions } from 'framer-motion';

/**
 * Animación de entrada por scroll compatible con SSR.
 *
 * - SSR: sin `initial` ni `animate` inline → el contenido renderiza
 *   visible (sin opacity:0), lo que Google indexa correctamente.
 * - Hydration: `controls.set('hidden')` oculta el contenido al instante
 *   (sin transición), antes de que el usuario haga scroll.
 * - Scroll: `controls.start('visible')` dispara la animación de entrada.
 *
 * El componente debe tener variants `hidden` y `visible`.
 */
export function useScrollReveal(viewportOptions?: UseInViewOptions) {
  const ref = useRef(null);
  const isInView = useInView(ref, viewportOptions);
  const controls = useAnimationControls();
  const ready = useRef(false);

  useEffect(() => {
    if (!ready.current) {
      controls.set('hidden');
      ready.current = true;
    }
  }, [controls]);

  useEffect(() => {
    if (isInView) controls.start('visible');
  }, [isInView, controls]);

  return { ref, animate: controls };
}
