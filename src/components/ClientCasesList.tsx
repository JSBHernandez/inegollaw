'use client'

import { useEffect, useState } from 'react'
import CaseNotes from './CaseNotes'

interface ClientCase {
  id: number
  clientName: string
  caseType: string
  status: string
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
  const [filteredCases, setFilteredCases] = useState<ClientCase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [selectedCase, setSelectedCase] = useState<ClientCase | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('All')

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
    } catch (_) {
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
    } catch (_) {
      alert('Failed to delete case. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  // Filter cases based on status
  useEffect(() => {
    if (statusFilter === 'All') {
      setFilteredCases(cases)
    } else {
      setFilteredCases(cases.filter(clientCase => 
        clientCase.status === statusFilter
      ))
    }
  }, [cases, statusFilter])

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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Client Cases ({filteredCases.length})</h2>
        </div>
        {/* Status Filter */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">
              Filter by Status:
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {filteredCases.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <p>{statusFilter === 'All' ? 'No client cases registered yet.' : `No ${statusFilter.toLowerCase()} cases found.`}</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <table className="w-full table-fixed divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-48 px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Client Name
                  </th>
                  <th className="w-44 px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Case Type
                  </th>
                  <th className="w-32 px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="w-40 px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Contract Amount
                  </th>
                  <th className="w-48 px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="flex-1 px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Latest Note
                  </th>
                  <th className="w-32 px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCases.map((clientCase) => (
                  <tr key={clientCase.id} className="hover:bg-gray-50">
                    <td className="w-48 px-6 py-6 align-top">
                      <div className="text-base font-medium text-gray-900 truncate">{clientCase.clientName}</div>
                    </td>
                    <td className="w-44 px-6 py-6 align-top">
                      <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-orange-100 text-orange-800 whitespace-nowrap">
                        {clientCase.caseType}
                      </span>
                    </td>
                    <td className="w-32 px-6 py-6 align-top">
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap ${
                        (clientCase.status || 'Active') === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : (clientCase.status || 'Active') === 'Completed'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-orange-100 text-orange-800'  // For "Other"
                      }`}>
                        {clientCase.status || 'Active'}
                      </span>
                    </td>
                    <td className="w-40 px-6 py-6 align-top">
                      <div className="text-base text-gray-900 font-semibold whitespace-nowrap">
                        {clientCase.totalContract ? formatCurrency(clientCase.totalContract) : 'N/A'}
                      </div>
                    </td>
                    <td className="w-48 px-6 py-6 align-top">
                      <div className="text-sm text-gray-900">
                        <div className="whitespace-nowrap">{formatDate(clientCase.createdAt)}</div>
                      </div>
                    </td>
                    <td className="flex-1 px-6 py-6 align-top">
                      <div className="text-sm text-gray-600">
                        {clientCase.latestNote ? (
                          <div>
                            <div className="mb-2 leading-relaxed break-words">{clientCase.latestNote}</div>
                            <div className="text-xs text-gray-400 whitespace-nowrap">
                              {clientCase.latestNoteDate && formatDate(clientCase.latestNoteDate)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No notes yet</span>
                        )}
                      </div>
                    </td>
                    <td className="w-32 px-6 py-6 align-top">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setSelectedCase(clientCase)}
                          className="text-green-700 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-md transition-colors text-xs font-medium w-full text-center whitespace-nowrap"
                          title="View/Add Notes"
                        >
                          Notes
                        </button>
                        <button
                          onClick={() => {
                            const caseForEdit = {
                              ...clientCase,
                              notes: clientCase.latestNote || clientCase.notes || ''
                            }
                            onEdit(caseForEdit)
                          }}
                          className="text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors text-xs font-medium w-full text-center whitespace-nowrap"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(clientCase.id)}
                          disabled={deletingId === clientCase.id}
                          className="text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium w-full text-center whitespace-nowrap"
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

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden divide-y divide-gray-200 bg-gray-50">
            {filteredCases.map((clientCase) => (
              <div key={clientCase.id} className="bg-white mx-4 my-4 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Card Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 truncate pr-4">{clientCase.clientName}</h3>
                    <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-orange-100 text-orange-800 whitespace-nowrap">
                      {clientCase.caseType}
                    </span>
                  </div>
                  <div className="flex justify-start">
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap ${
                      (clientCase.status || 'Active') === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : (clientCase.status || 'Active') === 'Completed'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-orange-100 text-orange-800'  // For "Other"
                    }`}>
                      {clientCase.status || 'Active'}
                    </span>
                  </div>
                </div>
                
                {/* Card Content */}
                <div className="px-6 py-5">
                  <div className="grid grid-cols-2 gap-6 mb-5">
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contract Amount</span>
                      <div className="text-lg font-bold text-gray-900">{clientCase.totalContract ? formatCurrency(clientCase.totalContract) : 'N/A'}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created Date</span>
                      <div className="text-sm font-medium text-gray-900">{formatDate(clientCase.createdAt)}</div>
                    </div>
                  </div>

                  {/* Latest Note Section */}
                  <div className="mb-5">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-3">Latest Note</span>
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[60px] flex items-center">
                      {clientCase.latestNote ? (
                        <div className="w-full">
                          <div className="text-sm text-gray-700 leading-relaxed mb-2">{clientCase.latestNote}</div>
                          {clientCase.latestNoteDate && (
                            <div className="text-xs text-gray-400">
                              {formatDate(clientCase.latestNoteDate)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic w-full text-center">No notes yet</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setSelectedCase(clientCase)}
                      className="text-green-700 hover:text-green-900 bg-green-50 hover:bg-green-100 border border-green-200 hover:border-green-300 px-4 py-2.5 rounded-lg transition-all text-sm font-medium text-center"
                      title="View/Add Notes"
                    >
                      Notes
                    </button>
                    <button
                      onClick={() => {
                        const caseForEdit = {
                          ...clientCase,
                          notes: clientCase.latestNote || clientCase.notes || ''
                        }
                        onEdit(caseForEdit)
                      }}
                      className="text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 hover:border-indigo-300 px-4 py-2.5 rounded-lg transition-all text-sm font-medium text-center"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(clientCase.id)}
                      disabled={deletingId === clientCase.id}
                      className="text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 px-4 py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-center"
                    >
                      {deletingId === clientCase.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
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
