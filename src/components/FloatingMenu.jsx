import React, { useState } from "react";
import "../estilos/FloatingMenu.css"; // Asegúrate de tener este archivo CSS

const FloatingMenu = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="floating-menu">
      <button
        className={`menu-toggle ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>
      <ul className={`menu-items ${open ? "show" : ""}`}>
        <li><a href="#home">Inicio</a></li>
        <li><a href="#about">Acerca de</a></li>
        <li><a href="#services">Servicios</a></li>
        <li><a href="#portfolio">Portafolio</a></li>
        <li><a href="#contact">Contacto</a></li>
        <li><a href="#blog">Blog</a></li>
      </ul>
    </div>
  );
};

export default FloatingMenu;
