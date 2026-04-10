import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#191919] mb-4">
          404 - Page Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-[#35c677] px-4 py-2 text-sm font-medium text-white hover:bg-[#2ba866] transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
