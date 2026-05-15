import { motion, AnimatePresence } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { useTaskDetail } from '@/hooks/useTasks'
import { useDeleteTimeEntry } from '@/hooks/useTimeEntries'
import { formatHours } from '@/lib/utils'

interface TimeEntryListProps {
  taskId: number
}

export function TimeEntryList({ taskId }: TimeEntryListProps) {
  const { data: task } = useTaskDetail(taskId)
  const deleteEntry = useDeleteTimeEntry()

  const entries = task?.timeEntries ?? []

  if (entries.length === 0) {
    return (
      <div className="py-3 text-center">
        <p className="text-xs text-gray-600">No time entries yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <AnimatePresence initial={false}>
        {entries.map(entry => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 group transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-violet-300">{formatHours(entry.hours)}</span>
                <span className="text-xs text-gray-600">
                  {new Date(entry.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              {entry.notes && (
                <p className="text-xs text-gray-500 truncate mt-0.5">{entry.notes}</p>
              )}
            </div>
            <button
              onClick={() => deleteEntry.mutate({ id: entry.id, taskId })}
              className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
