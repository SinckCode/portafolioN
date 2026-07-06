import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import './globals.scss';
import './premium.scss';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  display: 'swap',
  variable: '--font-display',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-mono',
});

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
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://angelonesto.com',
    siteName: 'Angel Onesto Portfolio',
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
    <html
      lang="es"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${inter.className}`}
    >
      <body className="min-h-screen bg-background text-on-surface antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
