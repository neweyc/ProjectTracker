import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoicesApi, type CreateInvoiceInput, type UpdateInvoiceInput } from '@/api/invoicesApi'
import { taskKeys } from './useTasks'
import { toast } from 'sonner'

export const invoiceKeys = {
  byProject: (projectId: number) => ['invoices', 'project', projectId] as const,
}

export function useProjectInvoices(projectId: number) {
  return useQuery({
    queryKey: invoiceKeys.byProject(projectId),
    queryFn: () => invoicesApi.getByProject(projectId),
    enabled: projectId > 0,
  })
}

export function useCreateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: CreateInvoiceInput }) =>
      invoicesApi.create(projectId, data),
    onSuccess: (_invoice, vars) => {
      qc.invalidateQueries({ queryKey: invoiceKeys.byProject(vars.projectId) })
      qc.invalidateQueries({ queryKey: taskKeys.byProject(vars.projectId) })
      toast.success('Invoice created')
    },
    onError: () => toast.error('Failed to create invoice'),
  })
}

export function useUpdateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, invoiceId, data }: { projectId: number; invoiceId: number; data: UpdateInvoiceInput }) =>
      invoicesApi.update(projectId, invoiceId, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: invoiceKeys.byProject(vars.projectId) })
      toast.success('Invoice updated')
    },
    onError: () => toast.error('Failed to update invoice'),
  })
}

export function useDeleteInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, invoiceId }: { projectId: number; invoiceId: number }) =>
      invoicesApi.delete(projectId, invoiceId),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: invoiceKeys.byProject(vars.projectId) })
      qc.invalidateQueries({ queryKey: taskKeys.byProject(vars.projectId) })
      toast.success('Invoice deleted')
    },
    onError: () => toast.error('Failed to delete invoice'),
  })
}
