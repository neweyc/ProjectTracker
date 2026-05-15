import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Settings, CreditCard, LayoutGrid, Users } from 'lucide-react'
import { useSettings, useUpdateSettings } from '@/hooks/useSettings'
import { BillingSettings } from './BillingSettings'
import { ClientManager } from './ClientManager'

interface Props {
  open: boolean
  onClose: () => void
}

interface FormData {
  companyName: string
  companyAddress: string
  nextInvoiceSequence: number
}

type Tab = 'general' | 'clients' | 'billing'

export function SettingsModal({ open, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('general')
  const { data: settings } = useSettings()
  const updateSettings = useUpdateSettings()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>()

  useEffect(() => {
    if (open && settings) {
      reset({
        companyName: settings.companyName || '',
        companyAddress: settings.companyAddress || '',
        nextInvoiceSequence: settings.nextInvoiceSequence,
      })
      setActiveTab('general')
    }
  }, [open, settings, reset])

  const onSubmit = async (data: FormData) => {
    await updateSettings.mutateAsync({
      companyName: data.companyName.trim() || null,
      companyAddress: data.companyAddress.trim() || null,
      nextInvoiceSequence: Number(data.nextInvoiceSequence),
    })
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl focus:outline-none">
          <AnimatePresence mode="wait">
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="bg-[#111827] border border-[#1f2937] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f2937]">
                  <Dialog.Title className="flex items-center gap-2 text-base font-semibold text-white">
                    <Settings className="w-4 h-4 text-violet-400" />
                    Settings
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex h-[480px]">
                  {/* Tabs Sidebar */}
                  <div className="w-44 border-r border-[#1f2937] p-2 space-y-1">
                    <button
                      onClick={() => setActiveTab('general')}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'general' 
                          ? 'bg-violet-600/10 text-violet-400' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                      General
                    </button>
                    <button
                      onClick={() => setActiveTab('clients')}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'clients' 
                          ? 'bg-violet-600/10 text-violet-400' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      Clients
                    </button>
                    <button
                      onClick={() => setActiveTab('billing')}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'billing' 
                          ? 'bg-violet-600/10 text-violet-400' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      Billing
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {activeTab === 'general' && (
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                            Company Name
                          </label>
                          <input
                            {...register('companyName')}
                            placeholder="Acme Corp"
                            className="w-full bg-[#0b0f19] border border-[#374151] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                            Company Address
                          </label>
                          <textarea
                            {...register('companyAddress')}
                            rows={3}
                            placeholder={'123 Main St, Suite 100\nCity, State 12345'}
                            className="w-full bg-[#0b0f19] border border-[#374151] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                            Next Invoice Sequence
                          </label>
                          <input
                            type="number"
                            min="1"
                            {...register('nextInvoiceSequence', { required: true, min: 1, valueAsNumber: true })}
                            className="w-full bg-[#0b0f19] border border-[#374151] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors"
                          />
                          {errors.nextInvoiceSequence && (
                            <p className="mt-1 text-xs text-red-400">Must be at least 1</p>
                          )}
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full px-4 py-2 rounded-lg text-sm font-bold bg-violet-600 hover:bg-violet-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-900/20"
                          >
                            {isSubmitting ? 'Saving...' : 'Save Settings'}
                          </button>
                        </div>
                      </form>
                    )}

                    {activeTab === 'clients' && <ClientManager />}
                    {activeTab === 'billing' && <BillingSettings />}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

