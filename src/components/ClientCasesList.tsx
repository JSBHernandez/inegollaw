'use client'

import { useEffect, useState } from 'react'
import CaseNotes from './CaseNotes'

interface ClientCase {
  id: number
  clientName: string
  caseType: string
  notes?: string
  totalContract: number
  createdAt: string
  updatedAt: string
  latestNote?: string | null
  latestNoteDate?: string | null
}

interface ClientCasesListProps {
  refreshTrigger: number
  onEdit: (clientCase: ClientCase) => void
}

export default function ClientCasesList({ refreshTrigger, onEdit }: ClientCasesListProps) {
  const [cases, setCases] = useState<ClientCase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [selectedCase, setSelectedCase] = useState<ClientCase | null>(null)

  const fetchCases = async () => {
    try {
      const response = await fetch('/api/client-cases')
      const result = await response.json()

      if (result.success) {
        setCases(result.data)
        setError('')
      } else {
        setError(result.error || 'Failed to fetch cases')
      }
    } catch (err) {
      setError('Failed to fetch cases')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this client case? This action cannot be undone.')) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/client-cases?id=${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        setCases(cases.filter(c => c.id !== id))
      } else {
        alert(`Error deleting case: ${result.error}`)
      }
    } catch (error) {
      alert('Failed to delete case. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    fetchCases()
  }, [refreshTrigger])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isUpdated = (createdAt: string, updatedAt: string) => {
    const created = new Date(createdAt).getTime()
    const updated = new Date(updatedAt).getTime()
    return Math.abs(updated - created) > 1000 // More than 1 second difference
  }

  if (loading) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="text-red-600">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={fetchCases}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Client Cases ({cases.length})</h2>
      </div>

      {cases.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <p>No client cases registered yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Case Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contract Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Latest Note
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cases.map((clientCase) => (
                <tr key={clientCase.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{clientCase.clientName}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {clientCase.caseType}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {formatCurrency(clientCase.totalContract)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(clientCase.createdAt)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isUpdated(clientCase.createdAt, clientCase.updatedAt) 
                      ? 'text-blue-600 font-medium' 
                      : 'text-gray-600'
                    }`}>
                      {formatDate(clientCase.updatedAt)}
                      {isUpdated(clientCase.createdAt, clientCase.updatedAt) && (
                        <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Updated
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-500 max-w-xs">
                      {clientCase.latestNote ? (
                        <div>
                          <div className="truncate mb-1">{clientCase.latestNote}</div>
                          <div className="text-xs text-gray-400">
                            {clientCase.latestNoteDate && formatDate(clientCase.latestNoteDate)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No notes yet</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedCase(clientCase)}
                        className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors"
                        title="View/Add Notes"
                      >
                        Notes
                      </button>
                      <button
                        onClick={() => {
                          // Create a modified version of the case with the latest note in the notes field
                          const caseForEdit = {
                            ...clientCase,
                            notes: clientCase.latestNote || clientCase.notes || ''
                          }
                          onEdit(caseForEdit)
                        }}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(clientCase.id)}
                        disabled={deletingId === clientCase.id}
                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === clientCase.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Case Notes Modal */}
      {selectedCase && (
        <CaseNotes
          clientCaseId={selectedCase.id}
          clientName={selectedCase.clientName}
          onClose={() => setSelectedCase(null)}
          onNoteAdded={() => fetchCases()} // Refresh the cases list
        />
      )}
    </div>
  )
}
