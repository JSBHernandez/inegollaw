import { z } from 'zod'

export const clientCaseSchema = z.object({
  clientName: z.string().min(1, 'Client name is required').max(255, 'Client name is too long'),
  caseType: z.string().min(1, 'Case type is required').max(100, 'Case type is too long'),
  status: z.enum(['Active', 'Completed', 'Other']),
  notes: z.string().optional(),
  totalContract: z.union([
    z.number().positive('Total contract must be a positive number'),
    z.undefined(),
    z.null()
  ]).optional(),
})

export type ClientCaseFormData = z.infer<typeof clientCaseSchema>
