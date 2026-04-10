import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Providers from '../src/components/providers'
import ScrollToTop from '../src/components/scroll-to-top'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Nardoni Digital - Fill Your Calendar with New Customers',
  description: 'Transform your business with cutting-edge digital marketing solutions. Nardoni Digital creates campaigns that convert and strategies that scale.',
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  other: {
    'theme-color': '#35c677',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Nardoni',
    'application-name': 'Nardoni Digital',
    'msapplication-TileColor': '#35c677',
    'msapplication-tap-highlight': 'no',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <Providers>
          <ScrollToTop />
          <div className="min-h-screen bg-white">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
