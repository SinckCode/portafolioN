import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import "../../estilos/SectionHeading.css";

// Encabezado estándar de sección: kicker mono cyan + título display +
// subtítulo opcional + subrayado gradiente.
const SectionHeading = ({ kicker, title, subtitle, align = "center" }) => {
  const reduceMotion = useReducedMotion();

  const variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.header
      className={`section-heading section-heading--${align}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      variants={variants}
    >
      {kicker && <span className="section-heading__kicker">{kicker}</span>}
      <h2 className="section-heading__title">{title}</h2>
      <span className="section-heading__underline" aria-hidden="true" />
      {subtitle && <p className="section-heading__subtitle">{subtitle}</p>}
    </motion.header>
  );
};

export default SectionHeading;
