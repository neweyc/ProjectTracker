import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi, type CreateTaskInput, type UpdateTaskInput } from '@/api/tasksApi'
import type { TaskStatus } from '@/types'
import { toast } from 'sonner'

export const taskKeys = {
  byProject: (projectId: number) => ['tasks', 'project', projectId] as const,
  detail:    (id: number)        => ['tasks', id] as const,
}

export function useProjectTasks(projectId: number) {
  return useQuery({
    queryKey: taskKeys.byProject(projectId),
    queryFn:  () => tasksApi.getByProject(projectId),
    enabled:  projectId > 0,
  })
}

export function useTaskDetail(id: number | null) {
  return useQuery({
    queryKey: taskKeys.detail(id!),
    queryFn:  () => tasksApi.getById(id!),
    enabled:  id !== null,
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTaskInput) => tasksApi.create(data),
    onSuccess: (_task, vars) => {
      qc.invalidateQueries({ queryKey: taskKeys.byProject(vars.projectId) })
      if (vars.parentTaskId) {
        qc.invalidateQueries({ queryKey: taskKeys.detail(vars.parentTaskId) })
      }
      toast.success('Task created')
    },
    onError: () => toast.error('Failed to create task'),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskInput }) =>
      tasksApi.update(id, data),
    onSuccess: (task) => {
      qc.invalidateQueries({ queryKey: taskKeys.byProject(task.projectId) })
      qc.invalidateQueries({ queryKey: taskKeys.detail(task.id) })
      toast.success('Task updated')
    },
    onError: () => toast.error('Failed to update task'),
  })
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, projectId, parentTaskId }: { id: number; status: TaskStatus; projectId: number; parentTaskId?: number }) =>
      tasksApi.updateStatus(id, status).then(r => ({ ...r, projectId, parentTaskId })),

    onMutate: async ({ id, status, projectId, parentTaskId }) => {
      await qc.cancelQueries({ queryKey: taskKeys.byProject(projectId) })
      const previous = qc.getQueryData<import('@/types').Task[]>(taskKeys.byProject(projectId))
      qc.setQueryData<import('@/types').Task[]>(taskKeys.byProject(projectId), old =>
        old?.map(t => t.id === id ? { ...t, status } : t) ?? []
      )

      if (parentTaskId) {
        await qc.cancelQueries({ queryKey: taskKeys.detail(parentTaskId) })
        qc.setQueryData<import('@/types').TaskDetail>(taskKeys.detail(parentTaskId), old => {
          if (!old) return old;
          return {
            ...old,
            subTasks: old.subTasks.map(st => st.id === id ? { ...st, status } : st)
          };
        })
      }

      return { previous, projectId, parentTaskId }
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined)
        qc.setQueryData(taskKeys.byProject(ctx.projectId), ctx.previous)
      if (ctx?.parentTaskId) {
        qc.invalidateQueries({ queryKey: taskKeys.detail(ctx.parentTaskId) })
      }
      toast.error('Failed to update status')
    },

    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: taskKeys.byProject(vars.projectId) })
      qc.invalidateQueries({ queryKey: taskKeys.detail(vars.id) })
      if (vars.parentTaskId) {
        qc.invalidateQueries({ queryKey: taskKeys.detail(vars.parentTaskId) })
      }
    },
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, projectId }: { id: number; projectId: number }) =>
      tasksApi.delete(id).then(() => ({ projectId })),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: taskKeys.byProject(result.projectId) })
      toast.success('Task deleted')
    },
    onError: () => toast.error('Failed to delete task'),
  })
}
