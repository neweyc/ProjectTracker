import { motion, AnimatePresence } from 'framer-motion'
import { useDroppable } from '@dnd-kit/core'
import { TaskCard } from './TaskCard'
import type { Task, TaskStatus } from '@/types'
import { STATUS_LABELS } from '@/types'

interface BoardColumnProps {
  status: TaskStatus
  tasks: Task[]
  onTaskClick: (taskId: number) => void
  isLast: boolean
  hideCards?: boolean
  isDraggingAny?: boolean
}

const STATUS_CONFIG: Record<TaskStatus, { dot: string; label: string; countBg: string }> = {
  Created: {
    dot: 'bg-slate-400',
    label: STATUS_LABELS.Created,
    countBg: 'bg-slate-500/20 text-slate-400',
  },
  InProgress: {
    dot: 'bg-amber-400',
    label: STATUS_LABELS.InProgress,
    countBg: 'bg-amber-500/20 text-amber-400',
  },
  Complete: {
    dot: 'bg-emerald-400',
    label: STATUS_LABELS.Complete,
    countBg: 'bg-emerald-500/20 text-emerald-400',
  },
}

export function BoardColumn({ status, tasks, onTaskClick, hideCards, isDraggingAny }: BoardColumnProps) {
  const config = STATUS_CONFIG[status]
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={`p-3 flex flex-col gap-2 min-h-[80px] transition-colors duration-150 ${
        isOver ? 'bg-violet-500/5' : 'bg-[#0d1117]'
      }`}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-1 mb-1">
        <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        <span className="text-xs font-medium text-gray-500">{config.label}</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={tasks.length}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.12 }}
            className={`ml-auto text-xs px-1.5 py-0.5 rounded-full font-medium ${config.countBg}`}
          >
            {tasks.length}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Task cards or completed count */}
      {hideCards ? (
        <div className="flex items-center justify-center flex-1 py-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">{tasks.length}</div>
            <div className="text-xs text-gray-600 mt-0.5">completed</div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <AnimatePresence initial={false}>
            {tasks.map(task => (
              <motion.div
                key={task.id}
                layout={!isDraggingAny}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <TaskCard task={task} onClick={() => onTaskClick(task.id)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
