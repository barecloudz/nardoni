import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import BlogPostContent from '../../../../src/page-content/blog/post'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_ANON_KEY || ''

function getSupabase() {
  return createClient(supabaseUrl, supabaseAnonKey)
}

export async function generateStaticParams() {
  if (!supabaseUrl || !supabaseAnonKey) return []
  try {
    const supabase = getSupabase()
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug')
      .eq('status', 'published')
    return (posts || []).map((post) => ({ slug: post.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  if (!supabaseUrl || !supabaseAnonKey) return { title: 'Blog | Nardoni Digital' }
  const supabase = getSupabase()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt, featured_image')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!post) {
    return {
      title: 'Post Not Found | Nardoni Digital Blog',
    }
  }

  return {
    title: `${post.title} | Nardoni Digital Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      ...(post.featured_image && { images: [post.featured_image] }),
    },
    alternates: {
      canonical: `https://nardonidigital.com/blog/${params.slug}`,
    },
  }
}

export const revalidate = 3600

export default function BlogPostPage() {
  return <BlogPostContent />
}
