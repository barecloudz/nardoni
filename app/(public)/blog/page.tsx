import type { Metadata } from 'next'
import BlogIndexContent from '../../../src/page-content/blog/index'

export const metadata: Metadata = {
  title: 'Marketing Blog - Tips & Insights for Local Businesses | Nardoni Digital',
  description: 'Expert marketing tips, digital strategy insights, and business growth advice for local businesses. Stay updated with the latest trends in SEO, social media, and AI marketing.',
  openGraph: {
    title: 'Marketing Blog - Tips & Insights for Local Businesses | Nardoni Digital',
    description: 'Expert marketing tips, digital strategy insights, and business growth advice for local businesses.',
  },
  alternates: {
    canonical: 'https://nardonidigital.com/blog',
  },
}

export default function BlogPage() {
  return <BlogIndexContent />
}
