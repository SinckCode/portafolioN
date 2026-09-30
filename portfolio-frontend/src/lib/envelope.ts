/**
 * El API envuelve toda respuesta en `{ data: ... }` (TransformInterceptor), y
 * los endpoints paginados añaden `{ data, total, page, limit, totalPages }`.
 *
 * Este modulo es el UNICO lugar que desenvuelve ese envelope. Tener la regla
 * repetida en el cliente y en cada fetch de servidor ya costo tres bugs:
 * canonicals `/blog/undefined`, secciones del home vacias, y proyectos que
 * desaparecian al filtrar.
 */

const hasDataKey = (value: unknown): value is { data: unknown } =>
  typeof value === 'object' && value !== null && 'data' in value;

/** Desenvuelve un nivel de envelope. Si no hay envelope, devuelve el JSON tal cual. */
export function unwrap<T>(json: unknown): T {
  return (hasDataKey(json) ? json.data : json) as T;
}

/**
 * Desenvuelve y garantiza un array. Acepta tanto el JSON crudo del API como
 * una respuesta ya desenvuelta, asi que es seguro llamarlo en ambos lados.
 */
export function unwrapList<T>(json: unknown): T[] {
  if (Array.isArray(json)) return json as T[];
  const inner = hasDataKey(json) ? json.data : null;
  return Array.isArray(inner) ? (inner as T[]) : [];
}
