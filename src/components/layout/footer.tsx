import React from 'react'
import { Link } from 'wouter'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { getCompanySettings } from '../../lib/supabase'
import { Cloud, Mail, Phone, MapPin, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react'

const Footer: React.FC = () => {
  // Fetch company settings for dynamic footer content
  const { data: companySettings } = useQuery({
    queryKey: ['company-settings'],
    queryFn: getCompanySettings
  })

  const footerSections = [
    {
      title: 'Services',
      links: [
        { label: 'AI Customer Support', href: '/services/ai-customer-support' },
        { label: 'AI Phone Agents', href: '/services/ai-phone-agents' },
        { label: 'Social Media Marketing', href: '/services/social-media-marketing' },
        { label: 'SEO & Local Search', href: '/services/seo-local-search' },
        { label: 'Paid Advertising', href: '/services/paid-advertising' },
        { label: 'Websites & Apps', href: '/services/websites-apps' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'Home', href: '/' },
        { label: 'Services', href: '/services' },
        { label: 'Blog', href: '/blog' },
        { label: 'Book a Call', href: '/book-a-call' }
      ]
    }
  ]

  const socialLinks = [
    { 
      icon: Instagram, 
      href: companySettings?.social_instagram || 'https://www.instagram.com/barecloudz/', 
      label: 'Instagram' 
    },
    { 
      icon: Twitter, 
      href: companySettings?.social_facebook || 'https://www.facebook.com/barecloudz', 
      label: 'Facebook' 
    },
    { 
      icon: Linkedin, 
      href: companySettings?.social_linkedin || 'https://linkedin.com/company/barecloudz', 
      label: 'LinkedIn' 
    },
    { 
      icon: Youtube, 
      href: companySettings?.social_youtube || 'https://youtube.com/barecloudz', 
      label: 'YouTube' 
    }
  ]

  return (
    <footer className="bg-[#191919] text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-80 h-80 bg-[#35c677] opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#35c677] opacity-3 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <img
                    src="/images/drawing.svg"
                    alt="Nardoni Digital Logo"
                    className="h-12 w-auto"
                  />
                  <span className="text-2xl font-bold">
                    {companySettings?.company_name || 'Nardoni Digital'}
                  </span>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed mb-6">
                  {companySettings?.description || 'Transforming local businesses with AI-powered automation and proven digital marketing strategies. Save time, increase bookings, and boost revenue.'}
                </p>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-[#35c677]" />
                  <span className="text-gray-300">
                    {companySettings?.email || 'hello@barecloudz.com'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-[#35c677]" />
                  <span className="text-gray-300">
                    {companySettings?.phone || '(803) 977-4285'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-[#35c677]" />
                  <span className="text-gray-300">
                    {companySettings?.company_address || 'San Francisco, CA'}
                  </span>
                </div>
              </motion.div>

              {/* Social Links */}
              <motion.div
                className="flex items-center space-x-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#35c677] transition-colors duration-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.a>
                  )
                })}
              </motion.div>
            </div>

            {/* Footer Links */}
            <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-8">
              {footerSections.map((section, sectionIndex) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
                >
                  <h3 className="text-lg font-semibold mb-6 text-white">
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <Link href={link.href}>
                          <motion.a
                            className="text-gray-400 hover:text-[#35c677] transition-colors duration-200 text-sm"
                            whileHover={{ x: 4 }}
                            transition={{ duration: 0.2 }}
                          >
                            {link.label}
                          </motion.a>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          className="border-t border-gray-800 py-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              &copy; 2025 Nardoni Digital. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>Made with ❤️ for local businesses</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#35c677] rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer