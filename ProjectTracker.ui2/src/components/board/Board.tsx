import { useState } from 'react'
import { LayoutGrid, CheckSquare, Receipt } from 'lucide-react'
import { useProjects } from '@/hooks/useProjects'
import { Swimlane } from './Swimlane'
import { TaskDetailDrawer } from '@/components/tasks/TaskDetailDrawer'

interface BoardProps {
  selectedProjectId: number | null
}

export function Board({ selectedProjectId }: BoardProps) {
  const { data: allProjects = [], isLoading } = useProjects()
  const [showComplete, setShowComplete] = useState(false)
  const [hideInvoiced, setHideInvoiced] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [selectedTaskProjectId, setSelectedTaskProjectId] = useState<number | null>(null)

  const projects = selectedProjectId
    ? allProjects.filter(p => p.id === selectedProjectId)
    : allProjects

  const handleTaskClick = (taskId: number, projectId: number) => {
    setSelectedTaskId(taskId)
    setSelectedTaskProjectId(projectId)
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-500">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#1f2937]">
        <div className="flex items-center gap-3">
          <LayoutGrid className="w-5 h-5 text-violet-400" />
          <h1 className="text-base font-semibold text-white">
            {selectedProjectId ? projects[0]?.name ?? 'Board' : 'All Projects'}
          </h1>
          <span className="text-xs text-gray-500 bg-[#1f2937] px-2 py-0.5 rounded-full">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Column headers */}
          <div className="hidden md:flex items-center gap-1 mr-4">
            {[
              { label: 'To Do', color: 'bg-slate-500' },
              { label: 'In Progress', color: 'bg-amber-500' },
              { label: 'Done', color: 'bg-emerald-500' },
            ].map(col => (
              <div key={col.label} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-gray-500">
                <div className={`w-1.5 h-1.5 rounded-full ${col.color}`} />
                {col.label}
              </div>
            ))}
          </div>

          <button
            onClick={() => setHideInvoiced(v => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
              hideInvoiced
                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Hide invoiced
          </button>
          <button
            onClick={() => setShowComplete(v => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
              showComplete
                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Show done
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-16 h-16 rounded-2xl bg-[#111827] border border-[#1f2937] flex items-center justify-center">
              <LayoutGrid className="w-7 h-7 text-gray-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-400">No projects found</p>
              <p className="text-xs text-gray-600 mt-1">Create a project from the sidebar to get started</p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {projects.map(project => (
              <Swimlane
                key={project.id}
                project={project}
                showComplete={showComplete}
                hideInvoiced={hideInvoiced}
                onTaskClick={(taskId) => handleTaskClick(taskId, project.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task detail drawer */}
      <TaskDetailDrawer
        taskId={selectedTaskId}
        projectId={selectedTaskProjectId}
        onClose={() => {
          setSelectedTaskId(null)
          setSelectedTaskProjectId(null)
        }}
      />
    </div>
  )
}
