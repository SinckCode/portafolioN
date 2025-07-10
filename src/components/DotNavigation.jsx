import React, { useEffect, useState } from "react";
import "../estilos/DotNavigation.css"; // Asegúrate de tener este archivo CSS

const sections = [
  { id: "home", label: "Inicio" },
  { id: "about", label: "Acerca" },
  { id: "portfolio", label: "Portafolio" },
  { id: "contact", label: "Contacto" }
];

const DotNavigation = () => {
  const [active, setActive] = useState("home");

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5 // 50% visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    }, options);

    sections.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="dot-navigation">
      {sections.map(section => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={`dot ${active === section.id ? "active" : ""}`}
          aria-label={section.label}
        />
      ))}
    </div>
  );
};

export default DotNavigation;
