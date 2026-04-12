'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { WeeklyReportCard, ClientValueBreakdown } from '../../components/client/weekly-report-card'
import { FileBarChart } from 'lucide-react'

const ClientReports: React.FC = () => {
  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  const { data: portalData, isLoading } = useQuery({
    queryKey: ['client-portal-data'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token ? `Bearer ${session.access_token}` : ''
      const res = await fetch('/api/client/portal-data', {
        headers: { Authorization: token },
      })
      if (!res.ok) return null
      return res.json()
    },
  })

  const clientRecord = portalData?.client || null
  const reports = portalData?.reports || []
  const services = portalData?.services || []

  // Auto-expand the most recent report
  React.useEffect(() => {
    if (reports.length > 0 && expandedId === null) {
      setExpandedId(reports[0].id)
    }
  }, [reports])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#191919]">Weekly Reports</h2>
        <p className="text-gray-500 text-sm mt-1">Your weekly breakdown of everything we're doing for you.</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#35c677]" />
        </div>
      )}

      {!isLoading && reports.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <FileBarChart className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <p className="font-medium text-gray-700">Your first report is on its way</p>
          <p className="text-sm mt-1">We publish weekly updates every Monday. Check back soon.</p>
        </div>
      )}

      {!isLoading && reports.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {reports.map(report => (
            <WeeklyReportCard
              key={report.id}
              report={report}
              clientId={clientRecord?.id}
              isExpanded={expandedId === report.id}
              onToggle={() => setExpandedId(expandedId === report.id ? null : report.id)}
            />
          ))}
        </motion.div>
      )}

      {/* Value breakdown — always shown if services are configured */}
      {clientRecord?.id && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ClientValueBreakdown clientId={clientRecord.id} weeklyRate={300} prefetchedServices={services} />
        </motion.div>
      )}
    </div>
  )
}

export default ClientReports
