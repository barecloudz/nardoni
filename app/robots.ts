import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/client/', '/auth/', '/api/'],
      },
    ],
    sitemap: 'https://nardonidigital.com/sitemap.xml',
  }
}
