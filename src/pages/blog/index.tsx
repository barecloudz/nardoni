import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'wouter'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import Header from '../../components/layout/header'
import Footer from '../../components/layout/footer'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Calendar, User, ArrowRight, Search } from 'lucide-react'
import { Input } from '../../components/ui/input'

const BlogIndex: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('')

  // Fetch published blog posts
  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['published-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, featured_image, created_at, author_id')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    }
  })

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-[#191919] mb-6">
                Marketing
                <br />
                <span className="text-[#35c677]">Insights</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Stay ahead of the curve with the latest trends, strategies, and insights 
                in digital marketing and AI automation.
              </p>
              
              {/* Search */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#35c677]"></div>
              </div>
            )}
            
            {error && (
              <div className="text-center py-16">
                <p className="text-red-500 mb-4">Error loading blog posts</p>
                <p className="text-gray-600">Please try again later</p>
              </div>
            )}
            
            {!isLoading && !error && filteredPosts.length === 0 && (
              <div className="text-center py-16">
                <h3 className="text-2xl font-bold text-[#191919] mb-4">
                  {searchTerm ? 'No posts found' : 'No blog posts yet'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Check back soon for new content!'
                  }
                </p>
              </div>
            )}
            
            {!isLoading && !error && filteredPosts.length > 0 && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                  >
                    <Link href={`/blog/${post.slug}`}>
                      <Card className="h-full cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                        <CardContent className="p-0">
                          {post.featured_image && (
                            <div className="relative h-48 overflow-hidden rounded-t-lg">
                              <img
                                src={post.featured_image}
                                alt={post.title}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                          )}
                          
                          <div className="p-6">
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(post.created_at)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>Nardoni Digital Team</span>
                              </div>
                            </div>
                            
                            <h3 className="text-xl font-bold text-[#191919] mb-3 line-clamp-2">
                              {post.title}
                            </h3>
                            
                            <p className="text-gray-600 mb-4 line-clamp-3">
                              {post.excerpt}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">
                                Marketing
                              </Badge>
                              <div className="flex items-center space-x-1 text-[#35c677] font-medium">
                                <span>Read More</span>
                                <ArrowRight className="h-4 w-4" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}

export default BlogIndex