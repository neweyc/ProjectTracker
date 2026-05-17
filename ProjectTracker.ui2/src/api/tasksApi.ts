import { apiClient } from './client'
import type { Task, TaskDetail, TaskStatus } from '@/types'

export interface CreateTaskInput {
  projectId: number
  parentTaskId?: number | null
  title: string
  description?: string
  typeId?: number | null
}

export interface UpdateTaskInput {
  title: string
  description?: string | null
  isInvoiced: boolean
  typeId?: number | null
}

export const tasksApi = {
  getByProject: (projectId: number) =>
    apiClient.get<Task[]>(`/api/projects/${projectId}/tasks`),

  getById: (id: number) =>
    apiClient.get<TaskDetail>(`/api/tasks/${id}`),

  create: (data: CreateTaskInput) =>
    apiClient.post<Task>('/api/tasks', data),

  update: (id: number, data: UpdateTaskInput) =>
    apiClient.put<Task>(`/api/tasks/${id}`, data),

  updateStatus: (id: number, status: TaskStatus) =>
    apiClient.patch<{ id: number; status: string }>(`/api/tasks/${id}/status`, { status }),

  delete: (id: number) =>
    apiClient.delete(`/api/tasks/${id}`),
}
