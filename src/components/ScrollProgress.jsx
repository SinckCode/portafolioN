import React from "react";
import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";
import "../estilos/ScrollProgress.css";

// Barra de progreso de lectura fija en el borde superior.
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return null;

  return (
    <motion.div
      className="scroll-progress"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
};

export default ScrollProgress;
