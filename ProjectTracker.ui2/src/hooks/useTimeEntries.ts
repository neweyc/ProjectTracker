import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { timeEntriesApi, type LogTimeInput } from '@/api/timeEntriesApi'
import { taskKeys } from './useTasks'
import { toast } from 'sonner'

export const timeEntryKeys = {
  byTask: (taskId: number) => ['time-entries', taskId] as const,
}

export function useTimeEntries(taskId: number) {
  return useQuery({
    queryKey: timeEntryKeys.byTask(taskId),
    queryFn:  () => timeEntriesApi.getByTask(taskId),
    enabled:  taskId > 0,
  })
}

export function useLogTime() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: LogTimeInput }) =>
      timeEntriesApi.log(taskId, data),
    onSuccess: (_entry, vars) => {
      qc.invalidateQueries({ queryKey: timeEntryKeys.byTask(vars.taskId) })
      qc.invalidateQueries({ queryKey: taskKeys.detail(vars.taskId) })
      toast.success('Time logged')
    },
    onError: () => toast.error('Failed to log time'),
  })
}

export function useDeleteTimeEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, taskId }: { id: number; taskId: number }) =>
      timeEntriesApi.delete(id).then(() => ({ taskId })),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: timeEntryKeys.byTask(result.taskId) })
      qc.invalidateQueries({ queryKey: taskKeys.detail(result.taskId) })
      toast.success('Time entry removed')
    },
    onError: () => toast.error('Failed to remove time entry'),
  })
}
