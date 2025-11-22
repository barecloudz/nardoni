import React, { useState } from 'react'
import { Link, useLocation } from 'wouter'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Cloud,
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  BookOpen,
  FolderOpen,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  PhoneCall
} from 'lucide-react'
import { Button } from '../ui/button'
import { authService } from '../../lib/auth'
import { supabase } from '../../lib/supabase'

const AdminSidebar: React.FC = () => {
  const [location] = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Fetch unread contacts count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-contacts-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread')

      if (error) {
        console.error('Error fetching unread count:', error)
        return 0
      }
      return count || 0
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: Users, label: 'Team', href: '/admin/team' },
    { icon: PhoneCall, label: 'Outreach', href: '/admin/outreach' },
    { icon: Users, label: 'Clients', href: '/admin/clients' },
    { icon: FileText, label: 'Marketing Plans', href: '/admin/marketing-plans' },
    { icon: DollarSign, label: 'Invoices', href: '/admin/invoices' },
    { icon: BookOpen, label: 'Blog', href: '/admin/blog' },
    { icon: FolderOpen, label: 'Documents', href: '/admin/documents' },
    { icon: MessageSquare, label: 'Book a Call', href: '/admin/contacts' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
  ]

  const handleLogout = async () => {
    await authService.logout()
    window.location.href = '/auth/login'
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6 text-[#191919]" />
        ) : (
          <Menu className="h-6 w-6 text-[#191919]" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-40 transform transition-transform duration-300 lg:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img
              src="/images/drawing.svg"
              alt="Nardoni Digital Logo"
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold text-[#191919]">Nardoni Digital</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
        </div>

        <nav className="mt-6">
          <div className="px-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = location === item.href

              return (
                <Link key={item.href} href={item.href}>
                  <motion.a
                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#35c677] text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-[#35c677]'
                    }`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    {/* Show badge for Book a Call if there are unread contacts */}
                    {item.href === '/admin/contacts' && unreadCount > 0 && (
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        isActive
                          ? 'bg-white text-[#35c677]'
                          : 'bg-red-500 text-white'
                      }`}>
                        {unreadCount}
                      </span>
                    )}
                  </motion.a>
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <Button
            variant="outline"
            className="w-full flex items-center space-x-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </>
  )
}

export default AdminSidebar