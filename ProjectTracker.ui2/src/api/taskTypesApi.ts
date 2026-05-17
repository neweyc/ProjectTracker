import { apiClient } from './client'
import type { TaskType } from '@/types'

export interface CreateTaskTypeInput {
  name: string
  color: string
}

export interface UpdateTaskTypeInput {
  name: string
  color: string
}

export const taskTypesApi = {
  getAll: () =>
    apiClient.get<TaskType[]>('/api/task-types'),

  create: (data: CreateTaskTypeInput) =>
    apiClient.post<TaskType>('/api/task-types', data),

  update: (id: number, data: UpdateTaskTypeInput) =>
    apiClient.put<TaskType>(`/api/task-types/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/api/task-types/${id}`),
}
