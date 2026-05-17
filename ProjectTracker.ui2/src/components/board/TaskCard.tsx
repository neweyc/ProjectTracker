import { motion } from 'framer-motion'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Clock, GitBranch, ChevronDown, DollarSign } from 'lucide-react'
import { useUpdateTaskStatus } from '@/hooks/useTasks'
import type { Task, TaskStatus } from '@/types'
import { STATUS_LABELS, PRIORITY_CONFIG } from '@/types'
import { formatHours } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onClick: () => void
}

const STATUS_STYLES: Record<TaskStatus, {
  border: string
  glow: string
  dot: string
  text: string
  bg: string
}> = {
  Created: {
    border: 'border-l-slate-500',
    glow: 'hover:shadow-slate-500/10',
    dot: 'bg-slate-400',
    text: 'text-slate-400',
    bg: 'bg-slate-500/10',
  },
  InProgress: {
    border: 'border-l-amber-500',
    glow: 'hover:shadow-amber-500/10',
    dot: 'bg-amber-400',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  Complete: {
    border: 'border-l-emerald-500',
    glow: 'hover:shadow-emerald-500/20',
    dot: 'bg-emerald-400',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
}

const STATUS_ORDER: TaskStatus[] = ['Created', 'InProgress', 'Complete']

export function TaskCard({ task, onClick }: TaskCardProps) {
  const updateStatus = useUpdateTaskStatus()
  const styles = STATUS_STYLES[task.status]

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  })

  const handleStatusChange = (status: TaskStatus, e: Event) => {
    e.stopPropagation()
    updateStatus.mutate({ id: task.id, status, projectId: task.projectId })
  }

  const dragStyle = transform ? { transform: CSS.Translate.toString(transform) } : undefined

  return (
    <motion.div
      ref={setNodeRef}
      style={dragStyle}
      {...listeners}
      {...attributes}
      layout
      whileHover={isDragging ? undefined : { scale: 1.02, y: -1 }}
      whileTap={isDragging ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={isDragging ? undefined : onClick}
      className={`
        group relative bg-[#111827] rounded-xl border border-[#1f2937] border-l-[3px] ${styles.border}
        select-none
        hover:border-[#374151] hover:shadow-lg ${styles.glow}
        transition-shadow duration-200
        ${isDragging ? 'opacity-40 cursor-grabbing' : 'cursor-grab'}
      `}
    >
      <div className="p-3">
        {/* Header row */}
        <div className="flex items-start gap-2 mb-2">
          <p className="flex-1 text-sm font-medium text-white leading-snug line-clamp-2 min-w-0">
            {task.title}
          </p>
          {/* Status dropdown - visible on hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={e => e.stopPropagation()}>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs ${styles.text} ${styles.bg} hover:opacity-80 transition-opacity`}>
                  <div className={`w-1 h-1 rounded-full ${styles.dot}`} />
                  <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="bg-[#1f2937] border border-[#374151] rounded-xl shadow-2xl shadow-black/50 py-1 z-50 min-w-[140px]"
                  sideOffset={4}
                  align="end"
                >
                  {STATUS_ORDER.map(status => (
                    <DropdownMenu.Item
                      key={status}
                      onSelect={(e) => handleStatusChange(status, e)}
                      className={`flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer outline-none transition-colors ${
                        task.status === status
                          ? 'text-white bg-white/5'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLES[status].dot}`} />
                      {STATUS_LABELS[status]}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>

        {/* Footer pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {task.priority && (
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${PRIORITY_CONFIG[task.priority].color} ${PRIORITY_CONFIG[task.priority].bg} ${PRIORITY_CONFIG[task.priority].border}`}>
              {PRIORITY_CONFIG[task.priority].label}
            </span>
          )}
          {task.typeName && task.typeColor && (
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${task.typeColor}22`, color: task.typeColor, border: `1px solid ${task.typeColor}44` }}
            >
              {task.typeName}
            </span>
          )}
          {task.totalHours > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-gray-500 bg-[#1f2937] px-1.5 py-0.5 rounded">
              <Clock className="w-2.5 h-2.5" />
              {formatHours(task.totalHours)}
            </span>
          )}
          {task.subTaskCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-gray-500 bg-[#1f2937] px-1.5 py-0.5 rounded">
              <GitBranch className="w-2.5 h-2.5" />
              {task.subTaskCount}
            </span>
          )}
          {task.isInvoiced && (
            <span className="flex items-center gap-1 text-[10px] text-violet-300 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded">
              <DollarSign className="w-2.5 h-2.5" />
              Invoiced
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
