import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRoute } from 'wouter'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import Header from '../../components/layout/header'
import Footer from '../../components/layout/footer'
import { Button } from '../../components/ui/button'
import { Calendar, User, ArrowLeft, Share2, Twitter, Linkedin, Facebook } from 'lucide-react'
import { Link } from 'wouter'

const BlogPost: React.FC = () => {
  const [, params] = useRoute('/blog/:slug')
  const slug = params?.slug

  // Fetch the blog post by slug
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No slug provided')
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!slug
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = post ? `Check out this article: ${post.title}` : ''

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#35c677]"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-[#191919] mb-4">
                Post Not Found
              </h1>
              <p className="text-gray-600 mb-8">
                The blog post you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/blog">
                <Button className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Blog</span>
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-12 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Link href="/blog">
                <Button variant="ghost" className="mb-6 flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Blog</span>
                </Button>
              </Link>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.created_at)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>Nardoni Digital Team</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-[#191919] mb-6 leading-tight">
                {post.title}
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                {post.excerpt}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Featured Image */}
        {post.featured_image && (
          <section className="py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                className="max-w-4xl mx-auto"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-96 object-cover rounded-2xl shadow-2xl"
                />
              </motion.div>
            </div>
          </section>
        )}

        {/* Article Content */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Share Sidebar */}
                <motion.div
                  className="lg:col-span-1 order-2 lg:order-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <div className="sticky top-32">
                    <h3 className="text-lg font-semibold text-[#191919] mb-4 flex items-center space-x-2">
                      <Share2 className="h-5 w-5" />
                      <span>Share</span>
                    </h3>
                    <div className="space-y-3">
                      {shareLinks.map((link) => {
                        const Icon = link.icon
                        return (
                          <a
                            key={link.name}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Icon className="h-5 w-5 text-gray-600" />
                            <span className="text-gray-700">{link.name}</span>
                          </a>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>

                {/* Main Content */}
                <motion.div
                  className="lg:col-span-3 order-1 lg:order-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <div 
                    className="prose prose-lg max-w-none prose-headings:text-[#191919] prose-a:text-[#35c677] prose-strong:text-[#191919]"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-br from-[#191919] to-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to transform your marketing?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Let's discuss how our AI-powered solutions can help your business grow.
              </p>
              <Link href="/contact">
                <Button size="lg" className="bg-[#35c677] hover:bg-[#2ba866] text-white px-8 py-4 text-lg">
                  Get Started Today
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}

export default BlogPost