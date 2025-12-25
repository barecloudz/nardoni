import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { getDocuments } from '../../lib/supabase'
import AdminSidebar from '../../components/layout/admin-sidebar'
import UploadDocumentModal from '../../components/admin/upload-document-modal'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Upload, Download, Eye, Trash2, FileText, Image, File } from 'lucide-react'

const AdminDocuments: React.FC = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false)

  // Fetch documents from Supabase
  const { data: documents = [], isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data, error } = await getDocuments()
      if (error) throw error
      return data || []
    }
  })

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image
    if (type.includes('pdf') || type.includes('document')) return FileText
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
                Document Management
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Upload and manage client documents
              </p>
            </div>
            <Button 
              className="flex items-center space-x-2"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <Upload className="h-4 w-4" />
              <span onClick={() => setIsUploadModalOpen(true)}>Upload Document</span>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#35c677]"></div>
                </div>
              )}
              
              {error && (
                <div className="text-red-500 text-center py-8">
                  Error loading documents: {error.message}
                </div>
              )}
              
              {!isLoading && !error && documents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No documents found. Upload your first document to get started.
                </div>
              )}
              
              {!isLoading && !error && documents.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {documents.map((document) => {
                    const FileIcon = getFileIcon(document.type)
                    return (
                      <motion.div
                        key={document.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ y: -4 }}
                      >
                        <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="w-12 h-12 bg-[#35c677]/10 rounded-lg flex items-center justify-center">
                                <FileIcon className="h-6 w-6 text-[#35c677]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-[#191919] truncate">
                                  {document.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {formatFileSize(document.size)}
                                </p>
                              </div>
                            </div>
                            
                            {document.clients && (
                              <div className="mb-4">
                                <p className="text-sm text-gray-600">
                                  Client: {document.clients.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {document.clients.company}
                                </p>
                              </div>
                            )}
                            
                            <div className="mb-4">
                              <p className="text-xs text-gray-500">
                                Uploaded {new Date(document.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <UploadDocumentModal 
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
          />
        </motion.div>
      </main>
    </div>
  )
}

export default AdminDocuments