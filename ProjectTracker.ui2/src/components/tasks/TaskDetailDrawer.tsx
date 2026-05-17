import { useState, useEffect } from 'react'
import { Drawer } from 'vaul'
import { motion } from 'framer-motion'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { X, Clock, GitBranch, ChevronDown, Edit2, Check, Tag } from 'lucide-react'
import { useTaskDetail, useUpdateTask, useUpdateTaskStatus } from '@/hooks/useTasks'
import { useTaskTypes } from '@/hooks/useTaskTypes'
import { SubTaskList } from './SubTaskList'
import { TimeEntryList } from '@/components/time/TimeEntryList'
import { LogTimeModal } from '@/components/time/LogTimeModal'
import { STATUS_LABELS, STATUS_ORDER } from '@/types'
import type { TaskStatus } from '@/types'
import { formatHours } from '@/lib/utils'

interface TaskDetailDrawerProps {
  taskId: number | null
  projectId: number | null
  onClose: () => void
}

const STATUS_STYLES: Record<TaskStatus, { text: string; bg: string; border: string; dot: string }> = {
  Created: { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30', dot: 'bg-slate-400' },
  InProgress: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-400' },
  Complete: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
}

export function TaskDetailDrawer({ taskId, projectId, onClose }: TaskDetailDrawerProps) {
  const { data: task, isLoading } = useTaskDetail(taskId)
  const updateTask = useUpdateTask()
  const updateStatus = useUpdateTaskStatus()
  const { data: taskTypes = [] } = useTaskTypes()
  const [logTimeOpen, setLogTimeOpen] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')
  const [editingDescription, setEditingDescription] = useState(false)
  const [descriptionValue, setDescriptionValue] = useState('')
  const [timeEntriesOpen, setTimeEntriesOpen] = useState(false)
  const [subtasksOpen, setSubtasksOpen] = useState(true)

  useEffect(() => {
    if (task) {
      setTitleValue(task.title)
      setDescriptionValue(task.description ?? '')
    }
  }, [task])

  const handleSaveTitle = () => {
    if (!task || !titleValue.trim()) return
    updateTask.mutate({
      id: task.id,
      data: { title: titleValue.trim(), description: task.description, isInvoiced: task.isInvoiced, typeId: task.typeId },
    })
    setEditingTitle(false)
  }

  const handleSaveDescription = () => {
    if (!task) return
    const trimmed = descriptionValue.trim() || null
    if (trimmed !== (task.description ?? null)) {
      updateTask.mutate({
        id: task.id,
        data: { title: task.title, description: trimmed, isInvoiced: task.isInvoiced, typeId: task.typeId },
      })
    }
    setEditingDescription(false)
  }

  const handleStatusChange = (status: TaskStatus) => {
    if (!task || !projectId) return
    updateStatus.mutate({ id: task.id, status, projectId })
  }

  const handleToggleInvoiced = () => {
    if (!task) return
    updateTask.mutate({
      id: task.id,
      data: { title: task.title, description: task.description, isInvoiced: !task.isInvoiced, typeId: task.typeId },
    })
  }

  const handleTypeChange = (typeId: number | null) => {
    if (!task) return
    updateTask.mutate({
      id: task.id,
      data: { title: task.title, description: task.description, isInvoiced: task.isInvoiced, typeId },
    })
  }

  const styles = task ? STATUS_STYLES[task.status] : STATUS_STYLES.Created

  return (
    <>
      <Drawer.Root
        open={taskId !== null}
        onOpenChange={(open) => { if (!open) onClose() }}
        direction="right"
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <Drawer.Content className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md outline-none">
            <div className="h-full flex flex-col bg-[#0f1724] border-l border-[#1f2937] shadow-2xl shadow-black/60">
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                </div>
              ) : task ? (
                <>
                  {/* Sticky header */}
                  <div className="flex-shrink-0 px-5 py-4 border-b border-[#1f2937] bg-[#0f1724]">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        {editingTitle ? (
                          <div className="flex items-center gap-2">
                            <input
                              value={titleValue}
                              onChange={e => setTitleValue(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleSaveTitle()
                                if (e.key === 'Escape') setEditingTitle(false)
                              }}
                              autoFocus
                              className="flex-1 bg-[#1f2937] border border-[#374151] rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-violet-500"
                            />
                            <button
                              onClick={handleSaveTitle}
                              className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingTitle(true)}
                            className="group flex items-start gap-2 w-full text-left"
                          >
                            <span className="text-sm font-semibold text-white leading-tight line-clamp-3 flex-1">{task.title}</span>
                            <Edit2 className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 flex-shrink-0 mt-0.5 transition-colors" />
                          </button>
                        )}

                        {/* Status + Type badges */}
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <button className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles.text} ${styles.bg} ${styles.border} transition-colors hover:opacity-80`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                                {STATUS_LABELS[task.status]}
                                <ChevronDown className="w-3 h-3 ml-0.5" />
                              </button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content
                                className="bg-[#1f2937] border border-[#374151] rounded-xl shadow-2xl py-1 z-[60] min-w-[160px]"
                                sideOffset={4}
                              >
                                {STATUS_ORDER.map(status => (
                                  <DropdownMenu.Item
                                    key={status}
                                    onSelect={() => handleStatusChange(status)}
                                    className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer outline-none transition-colors ${
                                      task.status === status
                                        ? 'text-white bg-white/5'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                  >
                                    <div className={`w-2 h-2 rounded-full ${STATUS_STYLES[status].dot}`} />
                                    {STATUS_LABELS[status]}
                                  </DropdownMenu.Item>
                                ))}
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>

                          {taskTypes.length > 0 && (
                            <DropdownMenu.Root>
                              <DropdownMenu.Trigger asChild>
                                <button
                                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors hover:opacity-80"
                                  style={
                                    task.typeName && task.typeColor
                                      ? { backgroundColor: `${task.typeColor}22`, color: task.typeColor, borderColor: `${task.typeColor}66` }
                                      : { backgroundColor: 'transparent', color: '#6b7280', borderColor: '#374151' }
                                  }
                                >
                                  <Tag className="w-3 h-3" />
                                  {task.typeName ?? 'No type'}
                                  <ChevronDown className="w-3 h-3 ml-0.5" />
                                </button>
                              </DropdownMenu.Trigger>
                              <DropdownMenu.Portal>
                                <DropdownMenu.Content
                                  className="bg-[#1f2937] border border-[#374151] rounded-xl shadow-2xl py-1 z-[60] min-w-[160px]"
                                  sideOffset={4}
                                >
                                  <DropdownMenu.Item
                                    onSelect={() => handleTypeChange(null)}
                                    className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer outline-none transition-colors ${
                                      !task.typeId ? 'text-white bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                  >
                                    <div className="w-2 h-2 rounded-full bg-gray-600" />
                                    None
                                  </DropdownMenu.Item>
                                  {taskTypes.map(type => (
                                    <DropdownMenu.Item
                                      key={type.id}
                                      onSelect={() => handleTypeChange(type.id)}
                                      className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer outline-none transition-colors ${
                                        task.typeId === type.id ? 'text-white bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                      }`}
                                    >
                                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: type.color }} />
                                      {type.name}
                                    </DropdownMenu.Item>
                                  ))}
                                </DropdownMenu.Content>
                              </DropdownMenu.Portal>
                            </DropdownMenu.Root>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={onClose}
                        className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Scrollable body */}
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                    {/* Description */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</p>
                        {!editingDescription && (
                          <button
                            onClick={() => setEditingDescription(true)}
                            className="p-1 text-gray-600 hover:text-gray-400 rounded transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      {editingDescription ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={descriptionValue}
                            onChange={e => setDescriptionValue(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Escape') { setDescriptionValue(task.description ?? ''); setEditingDescription(false) }
                            }}
                            autoFocus
                            rows={4}
                            placeholder="Add a description..."
                            className="w-full bg-[#1f2937] border border-violet-500/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 resize-none"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => { setDescriptionValue(task.description ?? ''); setEditingDescription(false) }}
                              className="px-2.5 py-1 text-xs text-gray-400 hover:text-white transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveDescription}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
                            >
                              <Check className="w-3 h-3" /> Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingDescription(true)}
                          className="w-full text-left"
                        >
                          {task.description ? (
                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{task.description}</p>
                          ) : (
                            <p className="text-sm text-gray-600 italic">Add a description...</p>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatHours(task.totalHours)} tracked</span>
                      </div>
                      {task.subTasks.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <GitBranch className="w-3.5 h-3.5" />
                          <span>{task.subTasks.length} subtasks</span>
                        </div>
                      )}
                    </div>

                    {/* Invoiced toggle */}
                    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#111827] border border-[#1f2937]">
                      <span className="text-sm text-gray-300">Invoiced</span>
                      <button
                        onClick={handleToggleInvoiced}
                        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                          task.isInvoiced ? 'bg-violet-600' : 'bg-[#374151]'
                        }`}
                      >
                        <motion.div
                          animate={{ x: task.isInvoiced ? 20 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow"
                        />
                      </button>
                    </div>

                    {/* Time entries — only for top-level tasks */}
                    {!task.parentTaskId && (
                      <div>
                        <button
                          onClick={() => setTimeEntriesOpen(v => !v)}
                          className="w-full flex items-center justify-between py-2 group"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-gray-500" />
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Time Entries</span>
                            <span className="text-xs text-gray-600">({task.timeEntries.length})</span>
                          </div>
                          <motion.div animate={{ rotate: timeEntriesOpen ? 90 : 0 }} transition={{ duration: 0.15 }}>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-600 rotate-[-90deg]" />
                          </motion.div>
                        </button>

                        {timeEntriesOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.15 }}
                          >
                            <TimeEntryList taskId={task.id} />
                            <button
                              onClick={() => setLogTimeOpen(true)}
                              className="mt-2 w-full py-1.5 text-xs text-violet-400 hover:text-violet-300 hover:bg-violet-500/5 rounded-lg border border-dashed border-violet-500/20 transition-colors"
                            >
                              + Log time
                            </button>
                          </motion.div>
                        )}
                        {!timeEntriesOpen && (
                          <button
                            onClick={() => setLogTimeOpen(true)}
                            className="mt-1 w-full py-1.5 text-xs text-violet-400 hover:text-violet-300 hover:bg-violet-500/5 rounded-lg border border-dashed border-violet-500/20 transition-colors"
                          >
                            + Log time
                          </button>
                        )}
                      </div>
                    )}

                    {/* Subtasks */}
                    <div>
                      <button
                        onClick={() => setSubtasksOpen(v => !v)}
                        className="w-full flex items-center justify-between py-2 group"
                      >
                        <div className="flex items-center gap-2">
                          <GitBranch className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Subtasks</span>
                          <span className="text-xs text-gray-600">({task.subTasks.length})</span>
                        </div>
                        <motion.div animate={{ rotate: subtasksOpen ? 0 : -90 }} transition={{ duration: 0.15 }}>
                          <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
                        </motion.div>
                      </button>

                      {subtasksOpen && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.15 }}
                        >
                          <SubTaskList
                            parentTask={task}
                            projectId={projectId!}
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {task && !task.parentTaskId && (
        <LogTimeModal
          open={logTimeOpen}
          onClose={() => setLogTimeOpen(false)}
          taskId={task.id}
        />
      )}
    </>
  )
}
