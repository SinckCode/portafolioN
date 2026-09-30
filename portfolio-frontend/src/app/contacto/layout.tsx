import type { Metadata } from 'next';

// `contacto/page.tsx` es 'use client' (el formulario maneja estado), asi que su
// metadata y su canonical tienen que vivir en un layout de servidor.
export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Hablemos de tu proyecto: desarrollo a medida, infraestructura o consultoria.',
  alternates: { canonical: '/contacto' },
};

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
