import { useState } from 'react'
import { Tag, Plus, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react'
import { useTaskTypes, useCreateTaskType, useUpdateTaskType, useDeleteTaskType } from '@/hooks/useTaskTypes'
import type { TaskType } from '@/types'

const PRESET_COLORS = [
  '#7c3aed', // violet
  '#2563eb', // blue
  '#0891b2', // cyan
  '#059669', // emerald
  '#65a30d', // lime
  '#d97706', // amber
  '#dc2626', // red
  '#db2777', // pink
  '#9333ea', // purple
  '#0284c7', // sky
  '#16a34a', // green
  '#6b7280', // gray
]

interface TypeRowProps {
  type: TaskType
}

function TypeRow({ type }: TypeRowProps) {
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [name, setName] = useState(type.name)
  const [color, setColor] = useState(type.color)
  const updateType = useUpdateTaskType()
  const deleteType = useDeleteTaskType()

  const handleSave = async () => {
    if (!name.trim()) return
    await updateType.mutateAsync({ id: type.id, data: { name: name.trim(), color } })
    setEditing(false)
  }

  const handleCancel = () => {
    setName(type.name)
    setColor(type.color)
    setEditing(false)
  }

  const handleDelete = async () => {
    await deleteType.mutateAsync(type.id)
  }

  if (editing) {
    return (
      <div className="p-3 rounded-xl bg-[#0b0f19] border border-violet-500/30 space-y-3">
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel() }}
          className="w-full bg-[#080c14] border border-[#1f2937] rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
        />
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-6 h-6 rounded-full transition-transform hover:scale-110 flex items-center justify-center"
              style={{ backgroundColor: c }}
            >
              {color === c && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
            </button>
          ))}
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updateType.isPending || !name.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
          >
            {updateType.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            Save
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#0b0f19] border border-[#1f2937] hover:border-[#374151] transition-all group">
      <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: type.color }} />
      <span className="flex-1 text-sm text-white font-medium">{type.name}</span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {confirmDelete ? (
          <>
            <span className="text-xs text-red-400 mr-1">Delete?</span>
            <button
              onClick={handleDelete}
              disabled={deleteType.isPending}
              className="px-2 py-1 rounded-md bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs font-bold transition-colors"
            >
              {deleteType.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="p-1 rounded-md text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-md text-gray-500 hover:text-violet-400 hover:bg-violet-400/10 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export function TaskTypeManager() {
  const { data: types = [], isLoading } = useTaskTypes()
  const createType = useCreateTaskType()
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])

  const handleCreate = async () => {
    if (!newName.trim()) return
    await createType.mutateAsync({ name: newName.trim(), color: newColor })
    setNewName('')
    setNewColor(PRESET_COLORS[0])
    setAdding(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-violet-400" />
            Task Types
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Categorize your tasks with colour-coded labels.
          </p>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-violet-900/20"
          >
            <Plus className="w-3.5 h-3.5" />
            New Type
          </button>
        )}
      </div>

      {adding && (
        <div className="p-3 rounded-xl bg-[#0b0f19] border border-violet-500/30 space-y-3">
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setAdding(false) }}
            placeholder="e.g. Improvement"
            className="w-full bg-[#080c14] border border-[#1f2937] rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
          />
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setNewColor(c)}
                className="w-6 h-6 rounded-full transition-transform hover:scale-110 flex items-center justify-center"
                style={{ backgroundColor: c }}
              >
                {newColor === c && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
              </button>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setAdding(false); setNewName('') }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={createType.isPending || !newName.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              {createType.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
              Create
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {types.length === 0 && !adding && (
          <p className="text-sm text-gray-600 text-center py-6">No task types yet. Create one to get started.</p>
        )}
        {types.map(type => (
          <TypeRow key={type.id} type={type} />
        ))}
      </div>
    </div>
  )
}
