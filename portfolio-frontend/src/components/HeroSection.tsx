'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { api, toList } from '@/lib/api';
import { Project } from '@/types';

// Hero premium (port de la SPA): badge de disponibilidad, nombre con
// gradiente cyan, rol rotatorio, stats reales del API y CTAs duales.
//
// SEO: initial={false} en el container para que el SSR renderice con
// opacity:1 (sin eso, framer-motion inyecta opacity:0 inline y Google
// puede ignorar el contenido).  La animación de entrada queda cubierta
// por el Preloader, así que el usuario no nota la diferencia.

const ROLES = ['Full Stack', 'DevOps', 'Infraestructura'];
const CODING_SINCE = 2021;
// Fallback si el API no responde (valores reales al momento del port)
const FALLBACK_STATS = { projects: 17, techs: 78 };

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function HeroSection() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [roleIndex, setRoleIndex] = useState(0);
  const [stats, setStats] = useState(FALLBACK_STATS);

  const yearsCoding = new Date().getFullYear() - CODING_SINCE;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    api
      .getProjects({ limit: '100' })
      .then((data) => {
        const items = toList<Project>(data);
        if (items.length > 0) {
          setStats({
            projects: items.length,
            techs: new Set(items.flatMap((p) => p.technologies)).size,
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const interval = setInterval(
      () => setRoleIndex((prev) => (prev + 1) % ROLES.length),
      2800
    );
    return () => clearInterval(interval);
  }, [reduceMotion]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="hero-section">
      <motion.div
        className="hero-content"
        variants={container}
        // initial={false} → SSR renderiza en estado "visible" (opacity:1).
        // La animación de entrada ya no se ve porque el Preloader la cubre.
        initial={false}
        animate="visible"
      >
        <motion.span className="hero-badge" variants={item}>
          <span className="hero-badge__dot" aria-hidden="true" />
          Disponible para proyectos freelance
        </motion.span>

        <motion.h1 className="hero-title" variants={item}>
          Ángel David <span className="hero-title__accent">Onesto Frías</span>
        </motion.h1>

        <motion.h2 className="hero-subtitle" variants={item}>
          Desarrollador{' '}
          <span className="hero-role-swap">
            <AnimatePresence mode="wait">
              <motion.span
                key={ROLES[roleIndex]}
                className="hero-role"
                initial={mounted ? { opacity: 0, y: 14 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {ROLES[roleIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h2>

        <motion.p className="hero-tagline" variants={item}>
          Estudiante de Ingeniería de Software apasionado por convertir ideas
          en soluciones reales: programación, automatización y despliegue, del
          hardware a la nube.
        </motion.p>

        <motion.div className="hero-stats" variants={item}>
          <div className="hero-stat">
            <span className="hero-stat__number">{stats.projects}+</span>
            <span className="hero-stat__label">Proyectos</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat__number">{stats.techs}+</span>
            <span className="hero-stat__label">Tecnologías</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat__number">{yearsCoding}</span>
            <span className="hero-stat__label">Años programando</span>
          </div>
        </motion.div>

        <motion.div className="hero-ctas" variants={item}>
          <button
            type="button"
            className="hero-btn hero-btn--primary"
            onClick={() => scrollTo('portfolio')}
          >
            Ver proyectos
          </button>
          <button
            type="button"
            className="hero-btn hero-btn--ghost"
            onClick={() => scrollTo('contact')}
          >
            Contáctame
          </button>
        </motion.div>
      </motion.div>

      <div className="hero-scroll-indicator" aria-hidden="true">
        <span className="hero-scroll-indicator__mouse">
          <span className="hero-scroll-indicator__wheel" />
        </span>
        <span className="hero-scroll-indicator__text">scroll</span>
      </div>
    </section>
  );
}
