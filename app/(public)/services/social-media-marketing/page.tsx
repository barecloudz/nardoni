import type { Metadata } from 'next'
import SocialMediaMarketingContent from '../../../../src/page-content/services/social-media-marketing'

export const metadata: Metadata = {
  title: 'Social Media Marketing - Instagram, Facebook & TikTok | Nardoni Digital',
  description: 'Grow your local business with strategic social media marketing. Expert management of Instagram, Facebook, and TikTok to build your brand and engage customers.',
  openGraph: {
    title: 'Social Media Marketing - Instagram, Facebook & TikTok | Nardoni Digital',
    description: 'Grow your local business with strategic social media marketing. Expert management of Instagram, Facebook, and TikTok.',
  },
  alternates: {
    canonical: 'https://nardonidigital.com/services/social-media-marketing',
  },
}

export default function SocialMediaMarketingPage() {
  return <SocialMediaMarketingContent />
}
