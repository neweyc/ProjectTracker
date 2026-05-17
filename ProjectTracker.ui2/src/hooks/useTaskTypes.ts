import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskTypesApi, type CreateTaskTypeInput, type UpdateTaskTypeInput } from '@/api/taskTypesApi'
import { toast } from 'sonner'

export const taskTypeKeys = {
  all: ['task-types'] as const,
}

export function useTaskTypes() {
  return useQuery({
    queryKey: taskTypeKeys.all,
    queryFn: () => taskTypesApi.getAll(),
  })
}

export function useCreateTaskType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTaskTypeInput) => taskTypesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskTypeKeys.all })
      toast.success('Task type created')
    },
    onError: () => toast.error('Failed to create task type'),
  })
}

export function useUpdateTaskType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskTypeInput }) =>
      taskTypesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskTypeKeys.all })
      toast.success('Task type updated')
    },
    onError: () => toast.error('Failed to update task type'),
  })
}

export function useDeleteTaskType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => taskTypesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskTypeKeys.all })
      toast.success('Task type deleted')
    },
    onError: () => toast.error('Failed to delete task type'),
  })
}
