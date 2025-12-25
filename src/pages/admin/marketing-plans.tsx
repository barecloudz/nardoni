import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { getMarketingPlans } from '../../lib/supabase'
import AdminSidebar from '../../components/layout/admin-sidebar'
import CreateMarketingPlanModal from '../../components/admin/create-marketing-plan-modal'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Plus, Sparkles, Eye, Edit, Download } from 'lucide-react'

const AdminMarketingPlans: React.FC = () => {
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)

  // Fetch marketing plans from Supabase
  const { data: plans = [], isLoading, error } = useQuery({
    queryKey: ['marketing-plans'],
    queryFn: async () => {
      const { data, error } = await getMarketingPlans()
      if (error) throw error
      return data || []
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success'
      case 'pending':
        return 'warning'
      case 'draft':
        return 'secondary'
      case 'rejected':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const handleGenerateAIPlan = async () => {
    setIsGenerating(true)
    // Simulate AI plan generation
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsGenerating(false)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-8 overflow-y-auto pt-20 lg:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#191919]">
                Marketing Plans
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Create and manage AI-powered marketing strategies
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Button 
                variant="outline" 
                className="flex items-center space-x-2"
                onClick={handleGenerateAIPlan}
                disabled={isGenerating}
              >
                <Sparkles className="h-4 w-4" />
                <span>
                  {isGenerating ? 'Generating...' : 'Generate AI Plan'}
                </span>
              </Button>
              <Button 
                className="flex items-center space-x-2"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                <span>Create Plan</span>
              </Button>
            </div>
          </div>

          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-[#35c677] to-[#2ba866] text-white p-6 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <div>
                  <h3 className="font-semibold">AI Marketing Plan Generation</h3>
                  <p className="text-sm opacity-90">
                    Creating a customized marketing strategy based on your business requirements...
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#35c677]"></div>
            </div>
          )}
          
          {error && (
            <div className="text-red-500 text-center py-16">
              Error loading marketing plans: {error.message}
            </div>
          )}
          
          {!isLoading && !error && plans.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              No marketing plans found. Create your first plan to get started.
            </div>
          )}
          
          {!isLoading && !error && plans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -4 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-[#191919] mb-2">
                          {plan.title}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          {plan.clients?.name || 'Unknown Client'}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(plan.status) as any}>
                        {plan.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Business Type:</span>
                        <p className="font-medium">{plan.business_type}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Industry:</span>
                        <p className="font-medium">{plan.industry}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-500 text-sm">Budget:</span>
                      <p className="font-semibold text-[#35c677]">
                        ${plan.budget.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-500 text-sm">Goals:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {plan.goals?.map((goal, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-500 text-sm">Channels:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {plan.channels?.map((channel, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {channel}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="text-xs text-gray-500">
                        Updated {new Date(plan.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          )}

          <CreateMarketingPlanModal 
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          />
        </motion.div>
      </main>
    </div>
  )
}

export default AdminMarketingPlans