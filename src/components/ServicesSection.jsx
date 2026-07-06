import React from "react";
import { motion } from "framer-motion";
import { scroller } from "react-scroll";
import Icon from "./ui/Icon";
import SectionHeading from "./ui/SectionHeading";
import { getTechColor } from "../utils/techColors";
import services from "../services";
import "../estilos/ServicesSection.css";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const item = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const ServicesSection = () => {
  const handleQuote = (service) => {
    // ContactSection escucha este evento y pre-llena el mensaje
    window.dispatchEvent(
      new CustomEvent("contact:prefill", {
        detail: { subject: service.title },
      })
    );
    scroller.scrollTo("contact", { smooth: true, duration: 500 });
  };

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
            <motion.article
              key={service.id}
              className="service-card"
              variants={item}
            >
              <span className="service-card__icon" aria-hidden="true">
                <Icon name={service.icon} size={24} strokeWidth={1.75} />
              </span>

              <h3 className="service-card__title">{service.title}</h3>
              <span className="service-card__tagline">{service.tagline}</span>
              <p className="service-card__description">{service.description}</p>

              <ul className="service-card__deliverables">
                {service.deliverables.map((d) => (
                  <li key={d}>
                    <Icon name="check" size={14} />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>

              <div className="service-card__stack">
                {service.stack.map((tech) => (
                  <span
                    key={tech}
                    className="service-card__chip"
                    style={{ "--tag-color": getTechColor(tech) }}
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {service.startingPrice && (
                <span className="service-card__price">{service.startingPrice}</span>
              )}

              <button
                type="button"
                className="service-card__cta"
                onClick={() => handleQuote(service)}
              >
                {service.ctaLabel}
                <Icon name="arrow-right" size={15} />
              </button>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
