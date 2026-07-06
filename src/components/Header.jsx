import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-scroll";
import useActiveSection from "../hooks/useActiveSection";
import { SECTIONS, SECTION_IDS } from "../navigation";
import "../estilos/Header.css";

const Header = () => {
  const active = useActiveSection(SECTION_IDS);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`header-desktop${scrolled ? " header-desktop--scrolled" : ""}`}>
      <Link
        to="home"
        smooth={true}
        duration={500}
        className="header-logo"
        href="#home"
      >
        AO<span className="header-logo__dot">.</span>
      </Link>

      <nav className="nav-desktop" aria-label="Navegación principal">
        <ul>
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <Link
                to={section.id}
                smooth={true}
                duration={500}
                href={`#${section.id}`}
                className={`nav-link${active === section.id ? " nav-link--active" : ""}`}
                aria-current={active === section.id ? "true" : undefined}
              >
                {section.label}
                {active === section.id && (
                  <motion.span
                    className="nav-link__underline"
                    layoutId="nav-underline"
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
