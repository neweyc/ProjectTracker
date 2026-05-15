import { apiClient } from './client'
import type { SystemSettings } from '@/types'

export const settingsApi = {
  get: () =>
    apiClient.get<SystemSettings>('/api/settings'),

  update: (data: { companyName: string | null; companyAddress: string | null; nextInvoiceSequence: number }) =>
    apiClient.put<SystemSettings>('/api/settings', data),
}
