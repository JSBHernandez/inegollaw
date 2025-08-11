'use client'

import { useState } from 'react'
import ClientCaseForm from '@/components/ClientCaseForm'
import ClientCasesList from '@/components/ClientCasesList'
import LoginForm from '@/components/LoginForm'
import { useAuth } from '@/hooks/useAuth'

interface ClientCase {
  id: number
  clientName: string
  caseType: string
  notes?: string
  totalContract: number
  createdAt: string
  updatedAt: string
}

export default function Home() {
  const { isAuthenticated, isLoading, login, logout } = useAuth()
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [editingCase, setEditingCase] = useState<ClientCase | null>(null)

  const handleFormSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleEditCase = (clientCase: ClientCase) => {
    setEditingCase(clientCase)
  }

  const handleCancelEdit = () => {
    setEditingCase(null)
  }

  const handleLogout = async () => {
    await logout()
    setEditingCase(null)
    setRefreshTrigger(0)
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={login} />
  }

  // Show main application if authenticated
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inegol Law Legal Services Management</h1>
              <p className="mt-2 text-gray-600">Manage immigration cases and client contracts efficiently</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div>
            <ClientCaseForm 
              onSuccess={handleFormSuccess} 
              editingCase={editingCase}
              onCancelEdit={handleCancelEdit}
            />
          </div>

          {/* List Section */}
          <div>
            <ClientCasesList 
              refreshTrigger={refreshTrigger}
              onEdit={handleEditCase}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
