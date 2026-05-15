import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi, type CreateProjectInput, type UpdateProjectInput } from '@/api/projectsApi'
import { toast } from 'sonner'

export const projectKeys = {
  all: ['projects'] as const,
  detail: (id: number) => ['projects', id] as const,
}

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: projectsApi.getAll,
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProjectInput) => projectsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.all })
      toast.success('Project created')
    },
    onError: () => toast.error('Failed to create project'),
  })
}

export function useUpdateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProjectInput }) =>
      projectsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.all })
      toast.success('Project updated')
    },
    onError: () => toast.error('Failed to update project'),
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => projectsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.all })
      toast.success('Project deleted')
    },
    onError: () => toast.error('Failed to delete project'),
  })
}
