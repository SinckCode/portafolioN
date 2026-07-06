import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: __dirname, // silencia el warning de múltiples lockfiles
  poweredByHeader: false, // no filtrar "X-Powered-By: Next.js"
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.angelonesto.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  // Cabeceras de seguridad (complementan a Cloudflare; ver Fase 3 de blindaje)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
          {
            // CSP: permite self + API (imágenes/uploads, fetch), fuentes de Google,
            // e inline styles/scripts que Next.js necesita. frame-ancestors evita clickjacking.
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https://api.angelonesto.com https://*.googleusercontent.com https://avatars.githubusercontent.com",
              "media-src 'self' https://api.angelonesto.com",
              "connect-src 'self' https://api.angelonesto.com",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
