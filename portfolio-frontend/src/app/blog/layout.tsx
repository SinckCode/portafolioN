import type { Metadata } from 'next';

// `blog/page.tsx` es un componente de cliente ('use client') y un componente de
// cliente no puede exportar `metadata`. Este layout existe solo para eso: darle
// a /blog su titulo y su canonical. Sin canonical, Google no sabe cual variante
// de la URL indexar y la deja en "Descubierta: actualmente sin indexar".
export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Articulos sobre desarrollo web, infraestructura, DevOps e IoT, escritos desde la practica.',
  alternates: { canonical: '/blog' },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
