'use client';

import { useEffect, useState } from 'react';

// Devuelve el id de la sección visible actualmente (port de la SPA).
// `sectionIds` debe ser constante de módulo para no re-crear el observer.
const useActiveSection = (sectionIds: string[], threshold = 0.35): string => {
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
