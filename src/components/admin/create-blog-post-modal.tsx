'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase, getCurrentUser } from '../../lib/supabase'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { X, BookOpen, Image, Type, FileText } from 'lucide-react'

const blogPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  featured_image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  status: z.enum(['draft', 'published']).default('draft'),
})

type BlogPostFormData = z.input<typeof blogPostSchema>

interface CreateBlogPostModalProps {
  isOpen: boolean
  onClose: () => void
}

const CreateBlogPostModal: React.FC<CreateBlogPostModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      status: 'draft'
    }
  })

  const watchTitle = watch('title')

  // Auto-generate slug from title
  React.useEffect(() => {
    if (watchTitle) {
      const slug = watchTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setValue('slug', slug)
    }
  }, [watchTitle, setValue])

  const createBlogPostMutation = useMutation({
    mutationFn: async (data: BlogPostFormData) => {
      const { user } = await getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      const { data: blogPost, error } = await supabase
        .from('blog_posts')
        .insert([{
          ...data,
          author_id: user.id,
          featured_image: data.featured_image || null
        }])
        .select()
        .single()

      if (error) throw error
      return blogPost
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error creating blog post:', error)
      alert('Failed to create blog post. Please try again.')
    }
  })

  const onSubmit = async (data: BlogPostFormData) => {
    createBlogPostMutation.mutate(data)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-[#35c677]" />
                <span>Create New Blog Post</span>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Type className="h-4 w-4 inline mr-1" />
                    Title *
                  </label>
                  <Input
                    {...register('title')}
                    placeholder="How AI is Transforming Local Businesses"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug *
                  </label>
                  <Input
                    {...register('slug')}
                    placeholder="ai-transforming-local-businesses"
                    className={errors.slug ? 'border-red-500' : ''}
                  />
                  {errors.slug && (
                    <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Image className="h-4 w-4 inline mr-1" />
                  Featured Image URL
                </label>
                <Input
                  {...register('featured_image')}
                  placeholder="https://images.pexels.com/photos/..."
                  className={errors.featured_image ? 'border-red-500' : ''}
                />
                {errors.featured_image && (
                  <p className="text-red-500 text-sm mt-1">{errors.featured_image.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Use a high-quality image from Pexels or Unsplash (1200x600px recommended)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt *
                </label>
                <Textarea
                  {...register('excerpt')}
                  placeholder="A brief summary of your blog post that will appear in the blog listing..."
                  rows={3}
                  className={errors.excerpt ? 'border-red-500' : ''}
                />
                {errors.excerpt && (
                  <p className="text-red-500 text-sm mt-1">{errors.excerpt.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="h-4 w-4 inline mr-1" />
                  Content * (HTML supported)
                </label>
                <Textarea
                  {...register('content')}
                  placeholder="<h2>Introduction</h2>
<p>Your blog content goes here...</p>

<img src='https://images.pexels.com/photos/...' alt='Description' class='w-full h-64 object-cover rounded-lg my-6' />

<h2>Main Points</h2>
<p>More content...</p>

<h3>Conclusion</h3>
<p>Wrap up your thoughts...</p>"
                  rows={15}
                  className={`font-mono text-sm ${errors.content ? 'border-red-500' : ''}`}
                />
                {errors.content && (
                  <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  You can use HTML tags for formatting. Add images throughout using: 
                  &lt;img src="URL" alt="description" class="w-full h-64 object-cover rounded-lg my-6" /&gt;
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="w-full p-2 border border-gray-200 rounded-md"
                >
                  <option value="draft">Draft (not visible to public)</option>
                  <option value="published">Published (visible to public)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createBlogPostMutation.isPending}
                  className="flex items-center space-x-2"
                >
                  {createBlogPostMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-4 w-4" />
                      <span>Create Blog Post</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default CreateBlogPostModal