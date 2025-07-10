import React from "react";
import { motion } from "framer-motion";
import pixelAvatar from "../assets/pixel-avatar.png";
import "../estilos/AboutSection.css";

const AboutSection = () => (
  <section id="about">
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="about-content"
    >
      <div className="avatar-wrapper">
        <img src={pixelAvatar} alt="Pixel Art Avatar" />
      </div>
      <h2>Sobre Mí</h2>
<p>
  Soy estudiante de Ingeniería en Software y Sistemas Computacionales en La Salle Bajío, con formación técnica previa en Programación por el CBTIS 65. Desde entonces, he trabajado de forma constante en el desarrollo de soluciones tecnológicas reales, combinando programación, diseño de interfaces, despliegue y administración de sistemas.
</p>
<p>
  Tengo experiencia práctica desarrollando proyectos full stack, creando APIs con Express, FastAPI y Vapor, y construyendo interfaces modernas con React, SwiftUI y Electron. Además, he implementado soluciones en la nube utilizando Docker, GitHub Actions, Firebase, DigitalOcean y Vercel.
</p>
<p>
 Me apasiona diseñar sistemas completos: desde la estructura de base de datos hasta la interfaz de usuario, pasando por la lógica del backend y flujos DevOps para despliegues confiables. Disfruto integrar el mundo físico con el digital, conectando componentes embebidos con plataformas modernas.
</p>
<p>
  Busco una oportunidad para integrarme a un equipo profesional donde pueda seguir creciendo, aprender de los mejores y aportar mis conocimientos técnicos, creatividad y compromiso para construir soluciones útiles, funcionales y bien estructuradas.
</p>


      <h3>Áreas de Especialización</h3>
<ul>
  <li>
    <strong>Desarrollo Web y Backend:</strong> Creación de APIs y aplicaciones con Node.js (Express), FastAPI y Vapor; desarrollo de interfaces modernas con React, SwiftUI y Electron; manejo de bases de datos SQL como MySQL, SQLite y T-SQL.
  </li>
  <li>
    <strong>DevOps y Despliegue:</strong> Automatización e implementación de pipelines con Docker, GitHub Actions; despliegue en plataformas como DigitalOcean, Vercel, Render y Firebase.
  </li>
  <li>
    <strong>Infraestructura:</strong> Administración de servidores virtualizados con Proxmox VE; configuración de servicios en Windows Server (Active Directory, DNS, DHCP); diseño de redes híbridas y entornos virtuales.
  </li>
<li>
  <strong>IoT e Integración:</strong> Uniendo el mundo físico con el digital mediante la orquestación de sensores, lógica embebida y servicios web.
</li>

  <li>
    <strong>Control de Versiones:</strong> Uso eficiente de Git y GitHub en entornos colaborativos y personales.
  </li>
</ul>
<p>
  Me motiva desarrollar soluciones completas que conecten el software con la infraestructura. Disfruto integrar hardware cuando el proyecto lo requiere, desplegar servicios propios y mantener una mejora continua en lo técnico y profesional.
</p>

    </motion.div>
  </section>
);

export default AboutSection;
