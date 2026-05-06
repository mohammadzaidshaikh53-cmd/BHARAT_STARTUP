// app/blog/[slug]/page.js
import { supabase } from '@/lib/supabase-server';  // <-- CHANGED: was @/lib/supabase
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import DOMPurify from 'isomorphic-dompurify';
import { unstable_cache } from 'next/cache';
import { Suspense } from 'react';
import { Container } from '@/components/ui/Container';
import { Avatar } from '@/components/ui/Avatar';

// =============================================================================
// Utilities
// =============================================================================
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bharatstartup.com';
export const revalidate = 3600; // 1 hour ISR

function sanitizeHtml(content) {
  return DOMPurify.sanitize(content);
}

function getImageUrl(url, { width = 1200, height, quality = 80 } = {}) {
  if (!url) return null;
  if (url.includes('.supabase.co/storage/v1/object/public/')) {
    const params = new URLSearchParams();
    params.set('width', String(width));
    params.set('quality', String(quality));
    params.set('format', 'webp');
    if (height) params.set('height', String(height));
    return `${url}?${params.toString()}`;
  }
  return url;
}

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

// -----------------------------------------------------------------------------

const getPost = unstable_cache(
  async (slug) => {
    const { data, error } = await supabase
      .from('content_posts')
      .select(`
        id, title, slug, content, excerpt, featured_image,
        published_at, category_id, tags, author_id, created_at, updated_at,
        category:content_categories(name),
        author:users(id, raw_user_meta_data)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) throw error;
    if (data?.content) {
      const plainText = data.content.replace(/<[^>]*>/g, '');
      const words = plainText.split(/\s+/).filter(Boolean).length;
      data.reading_time = Math.ceil(words / 200);
      data.word_count = words;
      data.sanitized_content = sanitizeHtml(data.content);
    }
    return data;
  },
  ['post-detail'],
  { revalidate: 3600, tags: ['blog-posts'] }
);

// -----------------------------------------------------------------------------

export async function generateMetadata({ params }) {
  try {
    const post = await getPost(params.slug);
    if (!post) return {};
    const imageUrl = getImageUrl(post.featured_image, { width: 1200, height: 630 });
    return {
      title: post.title,
      description: post.excerpt || `Read ${post.title} on Bharat Startup`,
      canonical: `${SITE_URL}/blog/${params.slug}`,
      robots: { index: true, follow: true },
      openGraph: {
        title: post.title,
        description: post.excerpt,
        url: `${SITE_URL}/blog/${params.slug}`,
        siteName: 'Bharat Startup',
        type: 'article',
        publishedTime: post.published_at,
        authors: ['Bharat Startup'],
        tags: post.tags || [],
        images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: post.title }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch {
    return {};
  }
}

// -----------------------------------------------------------------------------

const getRelatedPosts = unstable_cache(
  async (postId, tags) => {
    if (!tags || tags.length === 0) return [];
    const { data, error } = await supabase
      .from('content_posts')
      .select('id, title, slug, excerpt, featured_image, published_at')
      .eq('status', 'published')
      .neq('id', postId)
      .contains('tags', tags.slice(0, 2))
      .order('published_at', { ascending: false })
      .limit(3);
    if (error) return [];
    return data || [];
  },
  ['related-posts'],
  { revalidate: 3600, tags: ['blog-posts'] }
);

async function RelatedPosts({ postId, tags }) {
  const related = await getRelatedPosts(postId, tags);
  if (!related.length) return null;

  return (
    <section className="mt-12" aria-labelledby="related-posts-heading">
      <h2 id="related-posts-heading" className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Related Posts
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.map((rp) => (
          <Link
            key={rp.id}
            href={`/blog/${rp.slug}`}
            className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
          >
            {rp.featured_image && (
              <div className="relative w-full h-40 overflow-hidden">
                <Image
                  src={getImageUrl(rp.featured_image, { width: 400, height: 240, quality: 75 })}
                  alt={rp.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-orange-600 transition">
                {rp.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                {rp.excerpt}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                {formatDate(rp.published_at)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------

export default async function BlogPostPage({ params }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const formattedDate = formatDate(post.published_at || post.created_at);
  const updatedDate = post.updated_at && post.updated_at !== post.published_at
    ? formatDate(post.updated_at)
    : null;
  const authorName = post.author?.raw_user_meta_data?.full_name ||
                     post.author?.raw_user_meta_data?.name ||
                     'Anonymous';
  const authorAvatar = post.author?.raw_user_meta_data?.avatar_url || null;
  const featuredImageUrl = getImageUrl(post.featured_image, { width: 1200, height: 630 });
  const postUrl = `${SITE_URL}/blog/${post.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.title,
    image: featuredImageUrl ? [featuredImageUrl] : [],
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.published_at || post.created_at,
    author: { '@type': 'Person', name: authorName },
    publisher: {
      '@type': 'Organization',
      name: 'Bharat Startup',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
    articleSection: post.category?.name || 'General',
    keywords: post.tags?.join(', ') || '',
    wordCount: post.word_count,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <Container className="max-w-4xl">
          <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
            {featuredImageUrl && (
              <div className="relative w-full h-64 md:h-96">
                <Image
                  src={featuredImageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 1200px"
                />
              </div>
            )}
            <div className="p-6 md:p-10">
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4 flex-wrap">
                <Link
                  href={`/blog/category/${post.category?.slug || post.category_id}`}
                  className="bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 px-3 py-1 rounded-full text-xs font-medium hover:bg-orange-100 transition"
                >
                  {post.category?.name || 'Uncategorized'}
                </Link>
                <span>{formattedDate}</span>
                {updatedDate && <span className="text-xs">(updated {updatedDate})</span>}
                <span>• {post.reading_time} min read</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                {post.title}
              </h1>

              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100 dark:border-gray-700">
                <Avatar src={authorAvatar} name={authorName} size={48} />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{authorName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Author</p>
                </div>
              </div>

              {post.excerpt && (
                <p className="text-xl text-gray-600 dark:text-gray-300 italic border-l-4 border-orange-500 pl-5 mb-8 leading-relaxed">
                  {post.excerpt}
                </p>
              )}

              <div
                className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 prose-a:text-orange-600 prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ __html: post.sanitized_content }}
              />

              {post.tags && post.tags.length > 0 && (
                <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tagged</p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/blog?tag=${encodeURIComponent(tag)}`}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-sm hover:bg-gray-200 transition"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Link href="/blog" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 transition">
                  ← Back to feed
                </Link>
              </div>
            </div>
          </article>

          <Suspense fallback={<div className="mt-12 text-center text-gray-400">Loading related posts...</div>}>
            <RelatedPosts postId={post.id} tags={post.tags} />
          </Suspense>
        </Container>
      </main>
    </>
  );
}