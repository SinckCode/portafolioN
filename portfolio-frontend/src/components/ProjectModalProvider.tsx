'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import ProjectModalShell from './ProjectModalShell';
import ProjectDetailContent from './ProjectDetailContent';
import { Project } from '@/types';

/**
 * Modal de proyecto, abierto desde el cliente.
 *
 * Antes esto se resolvia con rutas interceptoras de Next, y el resultado era
 * inconsistente: el detalle abria en modal para unas tarjetas y en pagina
 * completa para otras. La interceptacion depende de que el router del cliente
 * tenga ya la carga interceptada, y como todas las paginas de detalle estan
 * prerenderizadas (generateStaticParams las genera todas) la que gana depende
 * del prefetch, que a su vez va por viewport. Desde el home no habia modal en
 * absoluto, porque una interceptora solo cubre su propio segmento.
 *
 * Con estado de cliente el comportamiento es el mismo en todas partes y no
 * depende de nada que no controlemos. Lo que daban las interceptoras se
 * conserva:
 *
 *  - La URL cambia (history.pushState), asi que el enlace se comparte igual.
 *  - Atras cierra el modal, porque el cierre es history.back() y este
 *    proveedor escucha popstate.
 *  - Entrar en frio o recargar sigue dando la pagina completa de /portafolio/
 *    <slug>, que es lo que recibe un crawler.
 *  - El contenido es el mismo ProjectDetailContent que usa la pagina, asi que
 *    las dos vistas no pueden divergir.
 */

interface ContextoModal {
  abrir: (project: Project) => void;
}

const ProjectModalContext = createContext<ContextoModal | null>(null);

/** Abre el detalle en modal. Fuera del proveedor no hace nada. */
export function useProjectModal(): ContextoModal {
  return useContext(ProjectModalContext) ?? { abrir: () => {} };
}

export default function ProjectModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [proyecto, setProyecto] = useState<Project | null>(null);

  const abrir = useCallback((p: Project) => {
    if (!p.slug) return;
    setProyecto(p);
    // Una entrada propia en el historial: es lo que hace que Atras cierre el
    // modal en lugar de sacar al visitante del sitio.
    window.history.pushState({ proyectoEnModal: p.slug }, '', `/portafolio/${p.slug}`);
  }, []);

  // El cierre siempre pasa por el historial: el boton y Escape del shell llaman
  // a router.back(), que dispara popstate y limpia el estado aqui. Un solo
  // camino de cierre evita que la URL y el modal se desincronicen.
  useEffect(() => {
    const alVolver = () => setProyecto(null);
    window.addEventListener('popstate', alVolver);
    return () => window.removeEventListener('popstate', alVolver);
  }, []);

  const valor = useMemo(() => ({ abrir }), [abrir]);

  return (
    <ProjectModalContext.Provider value={valor}>
      {children}
      {proyecto && (
        <ProjectModalShell titulo={proyecto.title}>
          <ProjectDetailContent project={proyecto} />
        </ProjectModalShell>
      )}
    </ProjectModalContext.Provider>
  );
}
