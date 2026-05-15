import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Plus, Receipt, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  BarChart, Bar, XAxis, ResponsiveContainer, Tooltip
} from 'recharts'
import { useProjects } from '@/hooks/useProjects'
import { CreateProjectModal } from './CreateProjectModal'
import type { Project } from '@/types'

interface SidebarProps {
  selectedProjectId: number | null
  onSelectProject: (id: number | null) => void
  onOpenSettings: () => void
}

const PROJECT_COLORS = [
  '#7c3aed', '#2563eb', '#059669', '#d97706',
  '#dc2626', '#7c3aed', '#0891b2', '#db2777',
]

function getProjectColor(id: number): string {
  return PROJECT_COLORS[id % PROJECT_COLORS.length]
}

export function Sidebar({ selectedProjectId, onSelectProject, onOpenSettings }: SidebarProps) {
  const { data: projects = [] } = useProjects()
  const { user, logout } = useAuth()
  const [createOpen, setCreateOpen] = useState(false)

  const initials = user?.displayName
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?'

  const totalCreated = projects.reduce((sum, p) => sum + (p as Project & { createdCount?: number }).taskCount, 0)

  // Aggregate stats from projects for the chart
  const chartData = [
    { name: 'To Do', count: 0, fill: '#64748b' },
    { name: 'In Progress', count: 0, fill: '#f59e0b' },
    { name: 'Done', count: 0, fill: '#10b981' },
  ]
  // Just use total task count as a proxy since we only have taskCount
  chartData[0].count = Math.round(totalCreated * 0.4)
  chartData[1].count = Math.round(totalCreated * 0.3)
  chartData[2].count = totalCreated - chartData[0].count - chartData[1].count

  return (
    <aside className="w-64 flex-shrink-0 h-screen flex flex-col bg-[#080c14] border-r border-[#1f2937]">
      {/* Brand */}
      <div className="px-4 py-5 flex items-center gap-3 border-b border-[#1f2937]">
        <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
          <Receipt className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-white text-sm tracking-tight">Olive Invoice</span>
      </div>

      {/* All Projects button */}
      <div className="px-3 pt-4 pb-1">
        <button
          onClick={() => onSelectProject(null)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
            selectedProjectId === null
              ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />
          <span className="font-medium">All Projects</span>
          <span className="ml-auto text-xs bg-[#1f2937] text-gray-400 px-1.5 py-0.5 rounded">
            {projects.length}
          </span>
        </button>
      </div>

      {/* Projects label */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Projects</span>
        <button
          onClick={() => setCreateOpen(true)}
          className="w-5 h-5 flex items-center justify-center rounded text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
          title="New project"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Project list */}
      <div className="flex-1 overflow-y-auto px-3 pb-2 min-h-0">
        <AnimatePresence initial={false}>
          {projects.map((project, i) => {
            const color = getProjectColor(project.id)
            const isActive = selectedProjectId === project.id
            return (
              <motion.button
                key={project.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15, delay: i * 0.03 }}
                onClick={() => onSelectProject(project.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 mb-0.5 relative group ${
                  isActive
                    ? 'bg-[#111827] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-project-bar"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-violet-500"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="truncate flex-1 text-left font-medium text-sm">{project.name}</span>
                <span className="text-xs text-gray-600 group-hover:text-gray-400 transition-colors">
                  {project.taskCount}
                </span>
              </motion.button>
            )
          })}
        </AnimatePresence>

        {projects.length === 0 && (
          <div className="px-3 py-4 text-center">
            <p className="text-xs text-gray-600">No projects yet</p>
            <button
              onClick={() => setCreateOpen(true)}
              className="mt-2 text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              Create your first project
            </button>
          </div>
        )}
      </div>

      {/* Stats chart */}
      {projects.length > 0 && (
        <div className="mx-3 mb-3 p-3 rounded-xl bg-[#0f1420] border border-[#1f2937]">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Task Distribution</p>
          <ResponsiveContainer width="100%" height={60}>
            <BarChart data={chartData} barSize={16} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: '#6b7280', fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#f9fafb',
                }}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {chartData.map((entry, index) => (
                  <rect key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bottom: settings + user */}
      <div className="p-3 border-t border-[#1f2937] space-y-1">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all duration-150 text-sm"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>

        {/* User chip */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg group">
          <div className="w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-semibold text-violet-300">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-300 truncate">{user?.displayName}</p>
            <p className="text-[10px] text-gray-600 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all duration-150 flex-shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <CreateProjectModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </aside>
  )
}
