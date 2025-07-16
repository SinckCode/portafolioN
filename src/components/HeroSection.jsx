import React from "react";
import { Link } from "react-scroll";
import { Fade } from "react-awesome-reveal";
import "../estilos/HeroSection.css";

const HeroSection = () => (
  <section id="home" className="hero-section-alt">
    <Fade direction="up" cascade damping={0.1} triggerOnce>
      <h1 className="hero-title-alt">Ángelll David Onestodfsfo Fríass</h1>
      <h2 className="hero-subtitle-alt">
        Desarrollador Full Stack · Infraestructura & DevOps
      </h2>
      <p className="hero-tagline-alt">
        Estudiante de Ingeniería de Software con enfoque en desarrollo Full Stack, infraestructura y DevOps.
Apasionado por convertir ideas en soluciones reales, combinando programación, automatización y despliegue.
      </p>
      <Link to="about" smooth={true} duration={500}>
        <button className="hero-button-alt">Conóceme ↓</button>
      </Link>
    </Fade>
    <div className="separator"></div>
  </section>
);

export default HeroSection;
