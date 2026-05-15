import { apiClient } from './client'
import type { Invoice } from '@/types'

export interface CreateInvoiceLineItemInput {
  taskId: number
  hourlyRate: number
}

export interface CreateInvoiceInput {
  clientName: string | null
  clientAddress: string | null
  dueDate: string | null
  taxRate: number
  notes: string | null
  lineItems: CreateInvoiceLineItemInput[]
}

export interface UpdateInvoiceInput {
  clientName: string | null
  clientAddress: string | null
  dueDate: string | null
  taxRate: number
  notes: string | null
  status: Invoice['status']
}

export const invoicesApi = {
  getByProject: (projectId: number) =>
    apiClient.get<Invoice[]>(`/api/projects/${projectId}/invoices`),

  create: (projectId: number, data: CreateInvoiceInput) =>
    apiClient.post<Invoice>(`/api/projects/${projectId}/invoices`, data),

  update: (projectId: number, invoiceId: number, data: UpdateInvoiceInput) =>
    apiClient.put<void>(`/api/projects/${projectId}/invoices/${invoiceId}`, data),

  delete: (projectId: number, invoiceId: number) =>
    apiClient.delete(`/api/projects/${projectId}/invoices/${invoiceId}`),
}
