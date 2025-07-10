import React, { useState } from "react";
import "../estilos/FloatingMenu.css";

const menuItems = [
  { label: "Inicio", href: "#home" },
  { label: "Sobre mí", href: "#about" },
  { label: "Portafolio", href: "#portfolio" },
  { label: "Contacto", href: "#contact" },
];

const FloatingMenu = () => {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => setOpen((prev) => !prev);
  const closeMenu = () => setOpen(false);

  return (
    <div className="floating-wrapper">
      <button
        className={`floating-btn ${open ? "open" : ""}`}
        onClick={toggleMenu}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
      >
        <span />
        <span />
        <span />
      </button>

      {open && (
        <nav className="floating-menu" aria-label="Menú flotante">
          <ul>
            {menuItems.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={closeMenu}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
};

export default FloatingMenu;
