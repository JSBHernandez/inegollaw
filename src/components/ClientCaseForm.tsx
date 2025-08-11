'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientCaseSchema, ClientCaseFormData } from '@/lib/validations'

interface ClientCase {
  id: number
  clientName: string
  caseType: string
  notes?: string
  totalContract: number
  createdAt: string
  updatedAt: string
}

interface ClientCaseFormProps {
  onSuccess: () => void
  editingCase?: ClientCase | null
  onCancelEdit?: () => void
}

export default function ClientCaseForm({ onSuccess, editingCase, onCancelEdit }: ClientCaseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const isEditing = !!editingCase

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ClientCaseFormData>({
    resolver: zodResolver(clientCaseSchema),
  })

  // Load data when editing
  useEffect(() => {
    if (editingCase) {
      setValue('clientName', editingCase.clientName)
      setValue('caseType', editingCase.caseType)
      setValue('notes', editingCase.notes || '')
      setValue('totalContract', editingCase.totalContract)
    } else {
      reset()
    }
  }, [editingCase, setValue, reset])

  const onSubmit = async (data: ClientCaseFormData) => {
    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const url = '/api/client-cases'
      const method = isEditing ? 'PUT' : 'POST'
      const body = isEditing ? { ...data, id: editingCase.id } : data

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (result.success) {
        setSubmitMessage(
          isEditing 
            ? 'Client case updated successfully!' 
            : 'Client case registered successfully!'
        )
        reset()
        onSuccess()
        if (onCancelEdit) onCancelEdit()
      } else {
        setSubmitMessage(`Error: ${result.error}`)
      }
    } catch (error) {
      setSubmitMessage('Failed to submit form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    reset()
    setSubmitMessage('')
    if (onCancelEdit) onCancelEdit()
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Edit Client Case' : 'Register New Client Case'}
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">
            Client Name *
          </label>
          <input
            type="text"
            id="clientName"
            {...register('clientName')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter client name"
          />
          {errors.clientName && (
            <p className="mt-1 text-sm text-red-600">{errors.clientName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="caseType" className="block text-sm font-medium text-gray-700 mb-1">
            Case Type *
          </label>
          <select
            id="caseType"
            {...register('caseType')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select case type</option>
            <option value="Green Card">Green Card</option>
            <option value="TN Visa">TN Visa</option>
            <option value="Investor Visa">Investor Visa</option>
            <option value="Work Visa">Work Visa</option>
            <option value="National Interest Visa">National Interest Visa</option>
            <option value="Citizenship">Citizenship</option>
            <option value="FOIA">FOIA</option>
            <option value="Consular-Embassy Process">Consular-Embassy Process</option>
            <option value="DACA">DACA</option>
            <option value="Fiance(e) Visa">Fiance(e) Visa</option>
            <option value="Tourist Visa">Tourist Visa</option>
          </select>
          {errors.caseType && (
            <p className="mt-1 text-sm text-red-600">{errors.caseType.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="totalContract" className="block text-sm font-medium text-gray-700 mb-1">
            Total Contract Amount ($) *
          </label>
          <input
            type="number"
            id="totalContract"
            step="0.01"
            min="0"
            {...register('totalContract', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter contract amount"
          />
          {errors.totalContract && (
            <p className="mt-1 text-sm text-red-600">{errors.totalContract.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            rows={4}
            {...register('notes')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter any additional notes..."
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting 
              ? (isEditing ? 'Updating...' : 'Registering...') 
              : (isEditing ? 'Update Case' : 'Register Case')
            }
          </button>
          
          {isEditing && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {submitMessage && (
          <div className={`mt-4 p-3 rounded-md ${
            submitMessage.includes('successfully') 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {submitMessage}
          </div>
        )}
      </form>
    </div>
  )
}
