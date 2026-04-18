'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  PhoneCall,
  Mail,
  FileBarChart,
  CheckSquare,
  Package,
  Link2,
} from 'lucide-react'
import { Button } from '../ui/button'
import { authService } from '../../lib/auth'
import { supabase } from '../../lib/supabase'

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
  badge?: number
}

interface NavGroup {
  label?: string
  items: NavItem[]
}

const AdminSidebar: React.FC = () => {
  const location = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-contacts-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread')
      if (error) return 0
      return count || 0
    },
    refetchInterval: 30000,
  })

  const navGroups: NavGroup[] = [
    {
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
      ],
    },
    {
      label: 'Clients',
      items: [
        { icon: Users, label: 'Clients', href: '/admin/clients' },
        { icon: MessageSquare, label: 'Book a Call', href: '/admin/contacts' },
      ],
    },
    {
      label: 'Marketing',
      items: [
        { icon: PhoneCall, label: 'Outreach', href: '/admin/outreach' },
        { icon: Mail, label: 'Marketing Email', href: '/admin/marketing-email' },
        { icon: FileText, label: 'Marketing Plans', href: '/admin/marketing-plans' },
        { icon: BookOpen, label: 'Blog', href: '/admin/blog' },
      ],
    },
    {
      label: 'Finance',
      items: [
        { icon: DollarSign, label: 'Invoices', href: '/admin/invoices' },
        { icon: Link2, label: 'Offers', href: '/admin/offers' },
        { icon: Package, label: 'Service Catalog', href: '/admin/service-catalog' },
      ],
    },
    {
      label: 'Operations',
      items: [
        { icon: Users, label: 'Team', href: '/admin/team' },
        { icon: CheckSquare, label: 'Tasks', href: '/admin/tasks' },
        { icon: FolderOpen, label: 'Documents', href: '/admin/documents' },
        { icon: FileBarChart, label: 'Reports', href: '/admin/reports' },
      ],
    },
  ]

  const handleLogout = async () => {
    await authService.logout()
    window.location.href = '/auth/login'
  }

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon
    const isActive = location === item.href
    const badge = item.href === '/admin/contacts' ? unreadCount : 0

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${
          isActive
            ? 'bg-[#35c677] text-white'
            : 'text-gray-600 hover:bg-gray-50 hover:text-[#35c677]'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <motion.span
          className="flex items-center justify-between w-full"
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">{item.label}</span>
          </div>
          {badge > 0 && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isActive ? 'bg-white text-[#35c677]' : 'bg-red-500 text-white'
            }`}>
              {badge}
            </span>
          )}
        </motion.span>
      </Link>
    )
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

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-40 transform transition-transform duration-300 lg:translate-x-0 flex flex-col ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <img src="/images/drawing.svg" alt="Nardoni Digital Logo" className="h-10 w-auto" />
            <span className="text-xl font-bold text-[#191919]">Nardoni Digital</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3 space-y-5">
            {navGroups.map((group, gi) => (
              <div key={gi}>
                {group.label && (
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-1.5">
                    {group.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {group.items.map(renderNavItem)}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Settings + Logout */}
        <div className="p-3 border-t border-gray-200 flex-shrink-0 space-y-0.5">
          {renderNavItem({ icon: Settings, label: 'Settings', href: '/admin/settings' })}
          <Button
            variant="outline"
            className="w-full flex items-center space-x-2 mt-2"
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
