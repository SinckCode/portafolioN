import React from "react";
import useActiveSection from "../hooks/useActiveSection";
import { SECTIONS, SECTION_IDS } from "../navigation";
import "../estilos/DotNavigation.css";

const DotNavigation = () => {
  const active = useActiveSection(SECTION_IDS);

  return (
    <nav className="dot-navigation" aria-label="Progreso de secciones">
      {SECTIONS.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={`dot${active === section.id ? " active" : ""}`}
          aria-label={section.label}
          aria-current={active === section.id ? "true" : undefined}
        >
          <span className="dot__circle" aria-hidden="true" />
          <span className="dot__tooltip" aria-hidden="true">
            {section.label}
          </span>
        </a>
      ))}
    </nav>
  );
};

export default DotNavigation;
