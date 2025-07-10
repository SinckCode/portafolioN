import React from "react";
import "../estilos/Header.css"; // Asegúrate de tener este archivo CSS

const Header = () => (
  <header className="header-desktop">
    <nav className="nav-desktop">
      <ul>
        <li><a href="#home">Inicio</a></li>
        <li><a href="#about">Sobre mi</a></li>
        <li><a href="#portfolio">Portafolio</a></li>
        <li><a href="#contact">Contacto</a></li>
      </ul>
    </nav>
  </header>
);

export default Header;
