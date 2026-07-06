'use client';

import { motion, AnimatePresence } from 'framer-motion';

// Preloader del modelo 3D (port de la SPA): monograma AO con glow pulsante,
// barra de progreso y porcentaje en mono.

interface PreloaderProps {
  visible: boolean;
  progress: number;
}

export default function Preloader({ visible, progress }: PreloaderProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="preloader"
          role="status"
          aria-label="Cargando portafolio"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="preloader__monogram" aria-hidden="true">
            AO
          </span>
          <div className="preloader__bar" aria-hidden="true">
            <span
              className="preloader__bar-fill"
              style={{ width: `${Math.min(Math.round(progress), 100)}%` }}
            />
          </div>
          <span className="preloader__pct" aria-hidden="true">
            {Math.min(Math.round(progress), 100)}%
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
