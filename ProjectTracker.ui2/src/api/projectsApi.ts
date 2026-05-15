import { apiClient } from './client'
import type { Project } from '@/types'

export interface CreateProjectInput { name: string; description?: string }
export interface UpdateProjectInput { name: string; description?: string }

export const projectsApi = {
  getAll: () =>
    apiClient.get<Project[]>('/api/projects'),

  create: (data: CreateProjectInput) =>
    apiClient.post<Project>('/api/projects', data),

  update: (id: number, data: UpdateProjectInput) =>
    apiClient.put<Project>(`/api/projects/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/api/projects/${id}`),
}
