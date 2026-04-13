'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { authService } from '../../src/lib/auth'
import { LoadingSpinner } from '../../src/components/ui/loading-spinner'
import { LayoutDashboard, FileBarChart, LogOut, MessageSquare, UserCircle } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/client/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/client/reports',   label: 'Reports',   icon: FileBarChart },
  { href: '/client/account',   label: 'Account',   icon: UserCircle },
]

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser()
        if (!user) { router.push('/auth/login'); return }
        if (user.role === 'admin') { router.push('/admin/dashboard'); return }
        setIsAuthorized(true)
      } catch {
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [router])

  const handleLogout = async () => {
    await authService.logout()
    router.push('/auth/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthorized) return null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Top nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/client/dashboard">
            <img src="/images/drawing.svg" alt="Nardoni Digital" className="h-8 w-auto" />
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden sm:flex items-center space-x-1">
            {NAV_ITEMS.map(item => {
              const active = pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#35c677]/10 text-[#35c677]'
                      : 'text-gray-500 hover:text-[#191919] hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center space-x-2">
            <a
              href="mailto:nardonidigital@gmail.com"
              className="hidden sm:flex items-center space-x-1.5 text-sm text-gray-500 hover:text-[#191919] px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Support</span>
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 text-sm text-gray-400 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </header>

      {/* Page content — bottom padding on mobile for tab bar */}
      <main className="flex-1 pb-20 sm:pb-0">
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 safe-area-pb">
        <div className="flex">
          {NAV_ITEMS.map(item => {
            const active = pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-3 space-y-1 transition-colors ${
                  active ? 'text-[#35c677]' : 'text-gray-400'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
          <a
            href="mailto:nardonidigital@gmail.com"
            className="flex-1 flex flex-col items-center justify-center py-3 space-y-1 text-gray-400"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs font-medium">Support</span>
          </a>
        </div>
      </nav>

    </div>
  )
}
