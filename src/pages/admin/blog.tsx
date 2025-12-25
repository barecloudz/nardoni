import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { getBlogPosts } from '../../lib/supabase'
import AdminSidebar from '../../components/layout/admin-sidebar'
import CreateBlogPostModal from '../../components/admin/create-blog-post-modal'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Plus, Edit, Eye, Trash2 } from 'lucide-react'

const AdminBlog: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)

  // Fetch blog posts from Supabase
  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const { data, error } = await getBlogPosts()
      if (error) throw error
      return data || []
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success'
      case 'draft':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-8 overflow-y-auto pt-20 lg:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#191919]">
                Blog Management
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Create and manage blog posts
              </p>
            </div>
            <Button 
              className="flex items-center space-x-2"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span onClick={() => setIsCreateModalOpen(true)}>New Post</span>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#35c677]"></div>
                </div>
              )}
              
              {error && (
                <div className="text-red-500 text-center py-8">
                  Error loading blog posts: {error.message}
                </div>
              )}
              
              {!isLoading && !error && posts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No blog posts found. Create your first post to get started.
                </div>
              )}
              
              {!isLoading && !error && posts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -4 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                        <CardContent className="p-6">
                          {post.featured_image && (
                            <img
                              src={post.featured_image}
                              alt={post.title}
                              className="w-full h-40 object-cover rounded-lg mb-4"
                            />
                          )}
                          
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant={getStatusColor(post.status) as any}>
                              {post.status}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-[#191919] mb-2 line-clamp-2">
                            {post.title}
                          </h3>
                          
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <CreateBlogPostModal 
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          />
        </motion.div>
      </main>
    </div>
  )
}

export default AdminBlog