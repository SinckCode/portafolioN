import { Project } from '@/types';

/**
 * Estado que se muestra junto a cada proyecto.
 *
 * IMPORTANTE: es una etiqueta derivada de los datos del propio proyecto, no
 * telemetria. No consulta el servidor, no hace health checks y no expone nada
 * de la infraestructura (VMs, IPs, hostnames internos). Un proyecto esta
 * "online" si publica una demo y "local" si solo vive en repositorio.
 *
 * Si algun dia se quiere mostrar uptime real, tendria que salir de un endpoint
 * publico pensado para eso, nunca de los datos internos del homelab.
 */
export type EstadoProyecto = 'online' | 'local';

export const estadoDe = (project: Project): EstadoProyecto =>
  project.demo || (project.demos?.length ?? 0) > 0 ? 'online' : 'local';

export const etiquetaEstado: Record<EstadoProyecto, string> = {
  online: 'online',
  local: 'local',
};
