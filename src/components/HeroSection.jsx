import React, { useEffect, useState } from "react";
import { Link } from "react-scroll";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import projects from "../projects";
import "../estilos/HeroSection.css";

const ROLES = ["Full Stack", "DevOps", "Infraestructura"];
const CODING_SINCE = 2021;

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
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const HeroSection = ({ modelState = "ready" }) => {
  const reduceMotion = useReducedMotion();
  const [roleIndex, setRoleIndex] = useState(0);

  // Stats reales calculadas de projects.js
  const projectCount = projects.length;
  const techCount = new Set(projects.flatMap((p) => p.technologies)).size;
  const yearsCoding = new Date().getFullYear() - CODING_SINCE;

  useEffect(() => {
    if (reduceMotion) return undefined;
    const interval = setInterval(
      () => setRoleIndex((prev) => (prev + 1) % ROLES.length),
      2800
    );
    return () => clearInterval(interval);
  }, [reduceMotion]);

  return (
    <section id="home" className="hero-section">
      <motion.div
        className="hero-content"
        variants={container}
        initial="hidden"
        // La entrada espera a que el modelo 3D cargue (o falle), nunca bloquea
        animate={modelState !== "loading" ? "visible" : "hidden"}
      >
        <motion.span className="hero-badge" variants={item}>
          <span className="hero-badge__dot" aria-hidden="true" />
          Disponible para proyectos freelance
        </motion.span>

        <motion.h1 className="hero-title" variants={item}>
          Ángel David <span className="hero-title__accent">Onesto Frías</span>
        </motion.h1>

        <motion.h2 className="hero-subtitle" variants={item}>
          Desarrollador{" "}
          <span className="hero-role-swap">
            <AnimatePresence mode="wait">
              <motion.span
                key={ROLES[roleIndex]}
                className="hero-role"
                initial={{ opacity: 0, y: 14 }}
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
          en soluciones reales: programación, automatización y despliegue,
          del hardware a la nube.
        </motion.p>

        <motion.div className="hero-stats" variants={item}>
          <div className="hero-stat">
            <span className="hero-stat__number">{projectCount}+</span>
            <span className="hero-stat__label">Proyectos</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat__number">{techCount}+</span>
            <span className="hero-stat__label">Tecnologías</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat__number">{yearsCoding}</span>
            <span className="hero-stat__label">Años programando</span>
          </div>
        </motion.div>

        <motion.div className="hero-ctas" variants={item}>
          <Link to="portfolio" smooth={true} duration={500} offset={-20}>
            <button type="button" className="hero-btn hero-btn--primary">
              Ver proyectos
            </button>
          </Link>
          <Link to="contact" smooth={true} duration={500}>
            <button type="button" className="hero-btn hero-btn--ghost">
              Contáctame
            </button>
          </Link>
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
};

export default HeroSection;
