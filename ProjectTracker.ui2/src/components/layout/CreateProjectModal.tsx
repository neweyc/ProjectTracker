import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useCreateProject } from '@/hooks/useProjects'

interface Props {
  open: boolean
  onClose: () => void
}

interface FormData {
  name: string
  description: string
}

export function CreateProjectModal({ open, onClose }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>()
  const createProject = useCreateProject()

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  const onSubmit = async (data: FormData) => {
    await createProject.mutateAsync({
      name: data.name,
      description: data.description || undefined,
    })
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md focus:outline-none">
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="bg-[#111827] border border-[#1f2937] rounded-2xl shadow-2xl shadow-black/50 p-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <Dialog.Title className="text-base font-semibold text-white">
                    New Project
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Project Name
                    </label>
                    <input
                      {...register('name', { required: 'Name is required' })}
                      placeholder="e.g. Website Redesign"
                      className="w-full bg-[#0b0f19] border border-[#374151] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Description <span className="text-gray-600">(optional)</span>
                    </label>
                    <textarea
                      {...register('description')}
                      placeholder="Brief project description..."
                      rows={3}
                      className="w-full bg-[#0b0f19] border border-[#374151] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createProject.isPending}
                      className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createProject.isPending ? 'Creating...' : 'Create Project'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
