import type { Metadata } from 'next';
import BlogPostClient from './BlogPostClient';

// Server component: metadata SEO + JSON-LD desde el API; el contenido
// interactivo vive en BlogPostClient.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://angelonesto.com';

interface PostData {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  tags?: string[];
  publishedAt?: string;
  createdAt?: string;
  author?: { name?: string };
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: string };
}

async function getPost(slug: string): Promise<PostData | null> {
  try {
    const res = await fetch(`${API_URL}/posts/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as PostData;
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
  const post = await getPost(slug);
  if (!post) return { title: 'Artículo no encontrado' };

  const title = post.seo?.metaTitle || post.title;
  const description = post.seo?.metaDescription || post.excerpt || '';
  const image = post.seo?.ogImage || post.coverImage;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${SITE_URL}/blog/${post.slug}`,
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  const jsonLd = post
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt || '',
        datePublished: post.publishedAt || post.createdAt,
        author: {
          '@type': 'Person',
          name: post.author?.name || 'Angel David Onesto Frias',
        },
        ...(post.coverImage ? { image: [post.coverImage] } : {}),
        mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
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
      <BlogPostClient initialPost={post as never} />
    </>
  );
}
