import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Circle, Loader2, CheckCircle2 } from 'lucide-react'
import { useUpdateTaskStatus } from '@/hooks/useTasks'
import { CreateTaskModal } from './CreateTaskModal'
import type { TaskDetail, TaskStatus, SubTask } from '@/types'
import { STATUS_LABELS } from '@/types'

interface SubTaskListProps {
  parentTask: TaskDetail
  projectId: number
}

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  Created: 'InProgress',
  InProgress: 'Complete',
  Complete: 'Created',
}

const STATUS_ICON_CLASS: Record<TaskStatus, string> = {
  Created: 'text-slate-500 hover:text-slate-300',
  InProgress: 'text-amber-500 hover:text-amber-300',
  Complete: 'text-emerald-500 hover:text-emerald-300',
}

function SubTaskIcon({ status }: { status: TaskStatus }) {
  if (status === 'Complete') {
    return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
  }
  if (status === 'InProgress') {
    return <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
  }
  return <Circle className="w-4 h-4 text-slate-500" />
}

export function SubTaskList({ parentTask, projectId }: SubTaskListProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const updateStatus = useUpdateTaskStatus()

  const handleCycleStatus = (subtask: SubTask) => {
    const nextStatus = STATUS_CYCLE[subtask.status]
    updateStatus.mutate({
      id: subtask.id,
      status: nextStatus,
      projectId,
      parentTaskId: parentTask.id,
    })
  }

  return (
    <div className="space-y-1">
      <AnimatePresence initial={false}>
        {parentTask.subTasks.map(subtask => (
          <motion.div
            key={subtask.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/5 group transition-colors"
          >
            <button
              onClick={() => handleCycleStatus(subtask)}
              className={`flex-shrink-0 transition-colors ${STATUS_ICON_CLASS[subtask.status]}`}
              title={`Status: ${STATUS_LABELS[subtask.status]} — click to advance`}
            >
              <SubTaskIcon status={subtask.status} />
            </button>
            <span className={`flex-1 text-sm min-w-0 truncate ${
              subtask.status === 'Complete' ? 'line-through text-gray-600' : 'text-gray-300'
            }`}>
              {subtask.title}
            </span>
            <span className={`text-[10px] flex-shrink-0 ${
              subtask.status === 'Complete' ? 'text-emerald-600' : 'text-gray-600'
            }`}>
              {STATUS_LABELS[subtask.status]}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        onClick={() => setCreateOpen(true)}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-gray-600 hover:text-gray-400 hover:bg-white/5 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Add subtask
      </button>

      <CreateTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        projectId={projectId}
        parentTaskId={parentTask.id}
      />
    </div>
  )
}
