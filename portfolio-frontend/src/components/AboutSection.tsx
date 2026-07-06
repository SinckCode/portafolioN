'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Icon from '@/components/ui/Icon';
import SectionHeading from '@/components/ui/SectionHeading';
import { getTechColor } from '@/lib/techColors';

// About premium (port de la SPA): avatar en card glass con borde animado,
// bio en 2 columnas, specialty cards con SVG y strip de stack.

const SPECIALTIES = [
  {
    icon: 'code',
    title: 'Desarrollo Web y Backend',
    description:
      'APIs con Express, FastAPI y Vapor; interfaces modernas con React, SwiftUI y Electron; bases de datos MySQL, SQLite y T-SQL.',
  },
  {
    icon: 'cloud',
    title: 'DevOps y Despliegue',
    description:
      'Pipelines con Docker y GitHub Actions; despliegues en DigitalOcean, Vercel, Render y Firebase.',
  },
  {
    icon: 'server',
    title: 'Infraestructura',
    description:
      'Servidores virtualizados con Proxmox VE; Windows Server (Active Directory, DNS, DHCP); redes híbridas.',
  },
  {
    icon: 'cpu',
    title: 'IoT e Integración',
    description:
      'Sensores, lógica embebida y servicios web: el mundo físico conectado con el digital.',
  },
  {
    icon: 'git-branch',
    title: 'Control de Versiones',
    description:
      'Git y GitHub en entornos colaborativos y personales, con flujos de trabajo ordenados.',
  },
];

const STACK = [
  'React',
  'Node.js',
  'Express',
  'FastAPI',
  'SwiftUI',
  'Docker',
  'GitHub Actions',
  'MySQL',
  'MongoDB',
  'Firebase',
  'DigitalOcean',
  'Proxmox',
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function AboutSection() {
  return (
    <section id="about" className="about-section">
      <div className="about-inner">
        <SectionHeading
          kicker="Sobre mí"
          title="Construyo soluciones completas"
          subtitle="Del diseño de la base de datos a la interfaz, pasando por el backend, el despliegue y el hardware cuando hace falta."
        />

        <motion.div
          className="about-grid"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div className="about-avatar-col" variants={item}>
            <div className="avatar-card">
              {/* unoptimized: el PNG fuente pesa 2.4MB y el optimizador tarda
                  en frío dejando la card vacía; pixel-art no necesita sharp */}
              <Image
                src="/pixel-avatar.png"
                alt="Avatar pixel art de Ángel David Onesto Frías"
                width={200}
                height={200}
                style={{ imageRendering: 'pixelated' }}
                unoptimized
              />
            </div>
            <span className="avatar-caption">angel · onesto · dev</span>
          </motion.div>

          <motion.div className="about-bio" variants={item}>
            <p className="about-lead">
              Soy estudiante de Ingeniería en Software y Sistemas
              Computacionales en La Salle Bajío, con formación técnica previa
              en Programación por el CBTIS 65. Desde entonces desarrollo
              soluciones tecnológicas reales que combinan programación, diseño
              de interfaces, despliegue y administración de sistemas.
            </p>
            <p>
              Tengo experiencia práctica en proyectos full stack: APIs con
              Express, FastAPI y Vapor, interfaces modernas con React, SwiftUI
              y Electron, y soluciones en la nube con Docker, GitHub Actions,
              Firebase, DigitalOcean y Vercel.
            </p>
            <p>
              Me apasiona diseñar sistemas completos, integrar el mundo físico
              con el digital y mantener una mejora continua. Busco integrarme a
              un equipo profesional donde pueda seguir creciendo y aportar
              conocimiento técnico, creatividad y compromiso.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          className="about-specialties"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          <motion.h3 className="about-subtitle" variants={item}>
            Áreas de especialización
          </motion.h3>
          <div className="specialty-grid">
            {SPECIALTIES.map((spec) => (
              <motion.article key={spec.title} className="specialty-card-premium" variants={item}>
                <span className="specialty-card-premium__icon" aria-hidden="true">
                  <Icon name={spec.icon} size={22} strokeWidth={1.75} />
                </span>
                <h4>{spec.title}</h4>
                <p>{spec.description}</p>
              </motion.article>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="about-stack"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="about-stack__label">Stack principal</span>
          <div className="about-stack__chips">
            {STACK.map((tech) => (
              <span
                key={tech}
                className="tag-chip"
                style={{ '--tag-color': getTechColor(tech) } as React.CSSProperties}
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
