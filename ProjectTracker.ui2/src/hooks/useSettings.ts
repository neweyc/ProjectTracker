import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '@/api/settingsApi'
import { toast } from 'sonner'

export const settingsKeys = {
  all: ['settings'] as const,
}

export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: settingsApi.get,
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { companyName: string | null; companyAddress: string | null; nextInvoiceSequence: number }) =>
      settingsApi.update(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: settingsKeys.all })
      toast.success('Settings updated')
    },
    onError: () => toast.error('Failed to update settings'),
  })
}
