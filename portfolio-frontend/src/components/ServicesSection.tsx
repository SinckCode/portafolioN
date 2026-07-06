'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/Icon';
import SectionHeading from '@/components/ui/SectionHeading';
import { getTechColor } from '@/lib/techColors';
import { api } from '@/lib/api';

// Sección de servicios (diseño de la SPA + datos del CMS):
// lo que se edite en /admin/servicios se refleja aquí.

interface Service {
  _id: string;
  title: string;
  icon: string;
  tagline: string;
  description: string;
  deliverables: string[];
  stack: string[];
  startingPrice: string | null;
  ctaLabel: string;
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const item = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    api
      .getServices()
      .then((data) => {
        const items = ((data as { data: Service[] }).data || []) as Service[];
        setServices(items);
      })
      .catch(() => {});
  }, []);

  const handleQuote = (service: Service) => {
    // ContactSection escucha este evento y pre-llena el mensaje
    window.dispatchEvent(
      new CustomEvent('contact:prefill', {
        detail: { subject: service.title },
      })
    );
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (services.length === 0) return <section id="services" aria-hidden="true" />;

  return (
    <section id="services" className="services-section">
      <div className="services-inner">
        <SectionHeading
          kicker="Servicios"
          title="¿Qué puedo construir para ti?"
          subtitle="Trabajo freelance de punta a punta: desde el primer diagrama hasta el deploy en producción."
        />

        <motion.div
          className="services-grid"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {services.map((service) => (
            <motion.article key={service._id} className="service-card" variants={item}>
              <span className="service-card__icon" aria-hidden="true">
                <Icon name={service.icon || 'zap'} size={24} strokeWidth={1.75} />
              </span>

              <h3 className="service-card__title">{service.title}</h3>
              {service.tagline && (
                <span className="service-card__tagline">{service.tagline}</span>
              )}
              <p className="service-card__description">{service.description}</p>

              {service.deliverables?.length > 0 && (
                <ul className="service-card__deliverables">
                  {service.deliverables.map((d) => (
                    <li key={d}>
                      <Icon name="check" size={14} />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              )}

              {service.stack?.length > 0 && (
                <div className="service-card__stack">
                  {service.stack.map((tech) => (
                    <span
                      key={tech}
                      className="tag-chip"
                      style={{ '--tag-color': getTechColor(tech) } as React.CSSProperties}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {service.startingPrice && (
                <span className="service-card__price">{service.startingPrice}</span>
              )}

              <button
                type="button"
                className="service-card__cta"
                onClick={() => handleQuote(service)}
              >
                {service.ctaLabel || 'Cotizar proyecto'}
                <Icon name="arrow-right" size={15} />
              </button>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
