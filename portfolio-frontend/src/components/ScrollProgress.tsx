'use client';

import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';

// Barra de progreso de lectura fija en el borde superior (port de la SPA).
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return null;

  return (
    <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />
  );
}
