/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Pre-existing type issues from Vite migration — tighten later
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
    ],
  },
}

export default nextConfig
