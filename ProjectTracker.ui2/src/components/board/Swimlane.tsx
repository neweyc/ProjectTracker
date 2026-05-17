import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Plus, Clock, Receipt } from 'lucide-react'
import {
  DndContext, DragOverlay,
  PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent,
} from '@dnd-kit/core'
import { useProjectTasks, useUpdateTaskStatus } from '@/hooks/useTasks'
import { BoardColumn } from './BoardColumn'
import { TaskCard } from './TaskCard'
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal'
import { InvoiceManagerModal } from '@/components/invoices/InvoiceManagerModal'
import type { Project, Task, TaskStatus } from '@/types'
import { formatHours } from '@/lib/utils'

interface SwimlaneProps {
  project: Project
  showComplete: boolean
  hideInvoiced: boolean
  onTaskClick: (taskId: number) => void
}

const PROJECT_COLORS = [
  '#7c3aed', '#2563eb', '#059669', '#d97706',
  '#dc2626', '#7c3aed', '#0891b2', '#db2777',
]

const STATUS_ORDER: TaskStatus[] = ['Created', 'InProgress', 'Complete']

export function Swimlane({ project, showComplete, hideInvoiced, onTaskClick }: SwimlaneProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const [invoicesOpen, setInvoicesOpen] = useState(false)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const { data: tasks = [] } = useProjectTasks(project.id)
  const updateStatus = useUpdateTaskStatus()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const handleDragStart = (e: DragStartEvent) => {
    setActiveTask((e.active.data.current as { task: Task }).task)
  }

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveTask(null)
    const task = (e.active.data.current as { task: Task } | undefined)?.task
    const targetStatus = e.over?.id as TaskStatus | undefined
    if (task && targetStatus && task.status !== targetStatus) {
      updateStatus.mutate({ id: task.id, status: targetStatus, projectId: project.id })
    }
  }

  const color = PROJECT_COLORS[project.id % PROJECT_COLORS.length]

  const topLevelTasks = tasks.filter(t => !t.parentTaskId && (!hideInvoiced || !t.isInvoiced))
  const completedCount = topLevelTasks.filter(t => t.status === 'Complete').length
  const totalCount = topLevelTasks.length
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
  const totalHours = topLevelTasks.reduce((sum, t) => sum + t.totalHours, 0)

  const tasksByStatus: Record<TaskStatus, typeof topLevelTasks> = {
    Created: [],
    InProgress: [],
    Complete: [],
  }
  for (const t of topLevelTasks) {
    tasksByStatus[t.status].push(t)
  }


  return (
    <div className="rounded-xl border border-[#1f2937] bg-[#0d1117] overflow-hidden">
      {/* Project header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#111827] border-b border-[#1f2937]">
        <button
          onClick={() => setCollapsed(v => !v)}
          className="flex items-center gap-2.5 flex-1 min-w-0 group"
        >
          <motion.div
            animate={{ rotate: collapsed ? 0 : 90 }}
            transition={{ duration: 0.15 }}
          >
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
          </motion.div>
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="font-semibold text-sm text-white truncate">{project.name}</span>
        </button>

        <div className="flex items-center gap-2 flex-shrink-0">
          {totalHours > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {formatHours(totalHours)}
            </div>
          )}
          {!showComplete && completedCount > 0 && (
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              {completedCount} done
            </span>
          )}
          <span className="text-xs text-gray-500 bg-[#1f2937] px-2 py-0.5 rounded-full">
            {totalCount}
          </span>
          <button
            onClick={() => setInvoicesOpen(true)}
            className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20 transition-colors"
          >
            <Receipt className="w-3 h-3" />
            Invoices
          </button>
          <button
            onClick={() => setCreateTaskOpen(true)}
            className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Task
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-[#1f2937]">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 to-emerald-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Columns */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-3 divide-x divide-[#1f2937] min-h-[80px]">
                {STATUS_ORDER.map((status, i) => (
                  <BoardColumn
                    key={status}
                    status={status}
                    tasks={tasksByStatus[status]}
                    onTaskClick={onTaskClick}
                    isLast={i === STATUS_ORDER.length - 1}
                    hideCards={!showComplete && status === 'Complete'}
                    isDraggingAny={activeTask !== null}
                  />
                ))}
              </div>
              <DragOverlay dropAnimation={null}>
                {activeTask && (
                  <div className="rotate-2 opacity-90 w-full">
                    <TaskCard task={activeTask} onClick={() => {}} />
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          </motion.div>
        )}
      </AnimatePresence>

      <CreateTaskModal
        open={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        projectId={project.id}
        onTaskCreated={onTaskClick}
      />
      <InvoiceManagerModal
        open={invoicesOpen}
        onClose={() => setInvoicesOpen(false)}
        project={project}
      />
    </div>
  )
}
