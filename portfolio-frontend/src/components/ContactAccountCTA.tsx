'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import Icon from './ui/Icon';

/**
 * Segunda via de contacto: la mensajeria interna del sitio.
 *
 * El formulario de arriba manda un correo y ahi se acaba la conversacion para
 * quien escribe: no sabe si llego y para dar seguimiento tiene que buscar el hilo
 * en su bandeja. La mensajeria del sitio ya existe y resuelve eso, pero nadie la
 * descubre porque vive detras del login.
 *
 * Va debajo del formulario, no en su lugar: pedirle cuenta a alguien que solo
 * quiere mandar un mensaje es la forma mas rapida de perderlo.
 */

// El separador se dibuja desde el centro hacia los lados.
const lineaVariants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const oVariants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, delay: 0.35 },
  },
};

const tarjetaVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const },
  },
};

// Escalona titulo, texto y botones para que la tarjeta se lea en orden.
const contenidoVariants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.4, staggerChildren: 0.09 } },
};

const lineaTextoVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function ContactAccountCTA() {
  const { isAuthenticated, user } = useAuth();
  const reveal = useScrollReveal({ once: true, amount: 0.4 });

  const primerNombre = user?.name ? user.name.split(' ')[0] : '';

  return (
    <motion.div
      ref={reveal.ref}
      animate={reveal.animate}
      initial="hidden"
      className="contact-alt"
    >
      <div className="contact-alt__divider" aria-hidden="true">
        <motion.span className="contact-alt__line" variants={lineaVariants} />
        <motion.span className="contact-alt__o" variants={oVariants}>
          o
        </motion.span>
        <motion.span className="contact-alt__line" variants={lineaVariants} />
      </div>

      <motion.div
        className="contact-alt__card"
        variants={tarjetaVariants}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25 }}
      >
        <motion.span
          className="contact-alt__icon"
          aria-hidden="true"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon name="pen" size={18} />
        </motion.span>

        <motion.div className="contact-alt__body" variants={contenidoVariants}>
          {isAuthenticated ? (
            <>
              <motion.h3 className="contact-alt__title" variants={lineaTextoVariants}>
                Tu bandeja está aquí{primerNombre ? `, ${primerNombre}` : ''}
              </motion.h3>
              <motion.p className="contact-alt__text" variants={lineaTextoVariants}>
                Sigamos la conversación en un hilo, sin pasar por el correo.
              </motion.p>
              <motion.div className="contact-alt__actions" variants={lineaTextoVariants}>
                <Link href="/mensajes" className="contact-button">
                  <Icon name="send" size={15} />
                  Abrir mensajes
                </Link>
              </motion.div>
            </>
          ) : (
            <>
              <motion.h3 className="contact-alt__title" variants={lineaTextoVariants}>
                Escríbeme desde el sitio
              </motion.h3>
              <motion.p className="contact-alt__text" variants={lineaTextoVariants}>
                Con una cuenta hablamos en un hilo: ves cuándo leí tu mensaje y
                puedes retomarlo cuando quieras.
              </motion.p>
              <motion.div className="contact-alt__actions" variants={lineaTextoVariants}>
                <Link href="/registro" className="contact-button">
                  <Icon name="user" size={15} />
                  Crear cuenta
                </Link>
                <Link href="/login" className="contact-alt__link">
                  Ya tengo cuenta
                </Link>
              </motion.div>
            </>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
