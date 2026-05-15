import { apiClient } from './client'
import type { TimeEntry } from '@/types'

export interface LogTimeInput {
  hours: number
  date: string
  notes?: string
}

export const timeEntriesApi = {
  getByTask: (taskId: number) =>
    apiClient.get<TimeEntry[]>(`/api/tasks/${taskId}/time-entries`),

  log: (taskId: number, data: LogTimeInput) =>
    apiClient.post<TimeEntry>(`/api/tasks/${taskId}/time-entries`, data),

  delete: (id: number) =>
    apiClient.delete(`/api/time-entries/${id}`),
}
