import { useEffect, useState } from "react";

// Devuelve el id de la sección visible actualmente.
// `sectionIds` debe ser una constante de módulo (p. ej. SECTION_IDS de
// navigation.js) para no re-crear el observer en cada render.
const useActiveSection = (sectionIds, threshold = 0.35) => {
  const [active, setActive] = useState(sectionIds[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { threshold }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionIds, threshold]);

  return active;
};

export default useActiveSection;
