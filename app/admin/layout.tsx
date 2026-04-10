'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '../../src/lib/auth'
import { LoadingSpinner } from '../../src/components/ui/loading-spinner'
import AdminSidebar from '../../src/components/layout/admin-sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser()
        if (!user) {
          router.push('/auth/login')
          return
        }
        if (user.role !== 'admin') {
          router.push('/client/dashboard')
          return
        }
        setIsAuthorized(true)
      } catch {
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-8 overflow-y-auto pt-20 lg:pt-8">
        {children}
      </main>
    </div>
  )
}
