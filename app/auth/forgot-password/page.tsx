'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../../src/lib/supabase'
import { Input } from '../../../src/components/ui/input'
import { Button } from '../../../src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/card'
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [sent, setSent] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      setSent(true)
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <img src="/img/logo.png" alt="Nardoni Digital" className="h-8 w-auto mx-auto" />
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-bold text-[#191919]">Reset your password</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Enter your email and we'll send you a reset link.</p>
          </CardHeader>
          <CardContent className="pt-4">
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4 py-4"
              >
                <div className="w-14 h-14 bg-[#35c677]/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-7 w-7 text-[#35c677]" />
                </div>
                <div>
                  <p className="font-semibold text-[#191919]">Check your email</p>
                  <p className="text-sm text-gray-500 mt-1">
                    We sent a reset link to <span className="font-medium text-[#191919]">{email}</span>
                  </p>
                </div>
                <Link href="/auth/login" className="block">
                  <Button variant="outline" className="w-full">Back to login</Button>
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
                <Link href="/auth/login" className="flex items-center justify-center space-x-1 text-sm text-gray-500 hover:text-[#191919] transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to login</span>
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
