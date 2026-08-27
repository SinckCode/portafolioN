import type { Metadata } from 'next';
import CourseDetailClient from './CourseDetailClient';

// Server component: metadata SEO + JSON-LD Course desde el API.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://angelonesto.com';

interface CourseData {
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
  level?: string;
  price?: number;
  instructor?: { name?: string };
}

async function getCourse(slug: string): Promise<CourseData | null> {
  try {
    const res = await fetch(`${API_URL}/courses/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    // El API envuelve las respuestas en { data: ... } (TransformInterceptor).
    // Sin desenvolver, la pagina emitia canonical /cursos/undefined.
    const json = await res.json();
    return (json.data ?? json) as CourseData;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) return { title: 'Curso no encontrado' };

  const description = (course.description || '').slice(0, 160);

  return {
    title: course.title,
    description,
    alternates: { canonical: `${SITE_URL}/cursos/${course.slug}` },
    openGraph: {
      title: course.title,
      description,
      type: 'website',
      url: `${SITE_URL}/cursos/${course.slug}`,
      ...(course.coverImage ? { images: [course.coverImage] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: course.title,
      description,
      ...(course.coverImage ? { images: [course.coverImage] } : {}),
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourse(slug);

  const jsonLd = course
    ? {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: course.title,
        description: course.description || '',
        provider: {
          '@type': 'Person',
          name: course.instructor?.name || 'Angel David Onesto Frias',
        },
        ...(typeof course.price === 'number'
          ? {
              offers: {
                '@type': 'Offer',
                price: course.price,
                priceCurrency: 'MXN',
              },
            }
          : {}),
        url: `${SITE_URL}/cursos/${course.slug}`,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <CourseDetailClient initialCourse={course as never} />
    </>
  );
}
