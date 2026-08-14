import type { Metadata } from 'next';
import '@fontsource-variable/inter';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/jetbrains-mono';
import { AuthProvider } from '@/context/AuthContext';
import './globals.scss';
import './premium.scss';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://angelonesto.com'),
  title: {
    default: 'Angel David Onesto Frias | Full Stack Developer',
    template: '%s | Angel Onesto',
  },
  description:
    'Desarrollador Full Stack & DevOps. Portfolio de proyectos web, IoT, mobile y mas.',
  keywords: ['Full Stack', 'DevOps', 'React', 'Next.js', 'NestJS', 'Portfolio'],
  authors: [{ name: 'Angel David Onesto Frias' }],
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://angelonesto.com',
    siteName: 'Angel Onesto Portfolio',
    title: 'Angel David Onesto Frias | Full Stack Developer',
    description:
      'Desarrollador Full Stack & DevOps. Portfolio de proyectos web, IoT, mobile y mas.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Angel David Onesto Frias | Full Stack Developer',
    description:
      'Desarrollador Full Stack & DevOps. Portfolio de proyectos web, IoT, mobile y mas.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background text-on-surface antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
