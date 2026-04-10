import type { Metadata } from 'next'
import SEOLocalSearchContent from '../../../../src/page-content/services/seo-local-search'

export const metadata: Metadata = {
  title: 'SEO & Local Search - Top Page of Google in 90 Days | Nardoni Digital',
  description: '$500/month to get your company on the first page of Google in 90 days. If we don\'t deliver, we keep working for free until we do. Expert local SEO for local businesses.',
  openGraph: {
    title: 'SEO & Local Search - Top Page of Google in 90 Days | Nardoni Digital',
    description: '$500/month to get your company on the first page of Google in 90 days or we keep working for free.',
  },
  alternates: {
    canonical: 'https://nardonidigital.com/services/seo-local-search',
  },
}

export default function SEOLocalSearchPage() {
  return <SEOLocalSearchContent />
}
