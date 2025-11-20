import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { supabase, getCurrentUser } from '../../lib/supabase'
import AdminSidebar from '../../components/layout/admin-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { Users, UserPlus, Mail, Shield, Trash2, Calendar } from 'lucide-react'

const AdminTeam: React.FC = () => {
  const queryClient = useQueryClient()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [newEmployee, setNewEmployee] = useState({
    email: '',
    password: '',
    name: '',
    role: 'admin' as 'admin' | 'client'
  })

  // Get current user to check if they're admin
  useEffect(() => {
    const fetchUser = async () => {
      const { user } = await getCurrentUser()
      setCurrentUser(user)
    }
    fetchUser()
  }, [])

  // Fetch all users from auth.users via the users table
  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    }
  })

  // Create new employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: async (employeeData: typeof newEmployee) => {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: employeeData.email,
        password: employeeData.password,
        email_confirm: true,
        user_metadata: {
          role: employeeData.role,
          name: employeeData.name
        }
      })

      if (authError) throw authError

      return authData
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] })
      setIsAddModalOpen(false)
      setNewEmployee({ email: '', password: '', name: '', role: 'admin' })
      alert('Employee added successfully!')
    },
    onError: (error: any) => {
      alert(`Failed to add employee: ${error.message}`)
    }
  })

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.auth.admin.deleteUser(userId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] })
      alert('Employee removed successfully!')
    },
    onError: (error: any) => {
      alert(`Failed to remove employee: ${error.message}`)
    }
  })

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmployee.email || !newEmployee.password || !newEmployee.name) {
      alert('Please fill in all fields')
      return
    }
    createEmployeeMutation.mutate(newEmployee)
  }

  const handleDeleteEmployee = (userId: string, email: string) => {
    if (confirm(`Are you sure you want to remove ${email} from the team?`)) {
      deleteEmployeeMutation.mutate(userId)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-8 overflow-y-auto pt-20 lg:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#191919]">
                Team Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage employee accounts and access
              </p>
            </div>
            {/* Only show Add Employee button for super admin */}
            {currentUser?.user_metadata?.super_admin === true && (
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Add Employee</span>
                  </Button>
                </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddEmployee} className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Full Name</label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email</label>
                    <Input
                      type="email"
                      placeholder="employee@nardonidigital.com"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Password</label>
                    <Input
                      type="password"
                      placeholder="Min 6 characters"
                      value={newEmployee.password}
                      onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Role</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={newEmployee.role}
                      onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value as 'admin' | 'client' })}
                    >
                      <option value="admin">Employee (Full Access)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Employees have full access to admin dashboard but cannot delete team members.
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={createEmployeeMutation.isPending}>
                    {createEmployeeMutation.isPending ? 'Adding...' : 'Add Employee'}
                  </Button>
                </form>
              </DialogContent>
              </Dialog>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-[#35c677]" />
                <span>All Team Members ({teamMembers.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center py-8 text-gray-500">Loading...</p>
              ) : teamMembers.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No team members yet</p>
              ) : (
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-[#35c677] rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {member.full_name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#191919]">
                            {member.full_name || 'No name'}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Mail className="h-3 w-3" />
                            <span>{member.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>Joined {new Date(member.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                          <Shield className="h-3 w-3 mr-1" />
                          {member.role || 'user'}
                        </Badge>
                        {/* Only show delete button if current user is super admin */}
                        {currentUser?.user_metadata?.super_admin === true && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteEmployee(member.id, member.email)}
                            disabled={deleteEmployeeMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

export default AdminTeam
