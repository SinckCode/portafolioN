'use client';

import { motion } from 'framer-motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';

// Encabezado estándar de sección: kicker mono cyan + título display +
// subtítulo opcional + subrayado gradiente. Port del rediseño de la SPA.
// Estilos: .section-heading__* en globals.scss.
//
// SEO: useScrollReveal → SSR sin opacity:0 inline; el contenido es
// visible para Google sin ejecutar JS.

interface SectionHeadingProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
}

const variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const SectionHeading = ({
  kicker,
  title,
  subtitle,
  align = 'center',
}: SectionHeadingProps) => {
  const { ref, animate } = useScrollReveal({ once: true, amount: 0.5 });

  return (
    <motion.header
      ref={ref}
      className={`section-heading section-heading--${align}`}
      animate={animate}
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
