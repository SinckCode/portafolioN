import type { Metadata } from 'next';

// Mismo caso que /blog: `cursos/page.tsx` es 'use client' y no puede exportar
// `metadata`, asi que el canonical de /cursos vive aqui. Las paginas de curso
// individuales declaran el suyo en su propio generateMetadata y lo sobreescriben.
export const metadata: Metadata = {
  title: 'Cursos',
  description:
    'Cursos de desarrollo web, infraestructura y DevOps, en espanol y desde cero.',
  alternates: { canonical: '/cursos' },
};

export default function CursosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
