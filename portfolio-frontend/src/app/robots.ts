import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/perfil/', '/api/'],
      },
    ],
    sitemap: 'https://angelonesto.com/sitemap.xml',
  };
}
