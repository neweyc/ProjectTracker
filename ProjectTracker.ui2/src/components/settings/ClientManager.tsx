import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Edit2, Trash2, Mail, MapPin, Check, Loader2 } from 'lucide-react'
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '@/hooks/useClients'
import type { Client } from '@/types'

interface ClientFormData {
  name: string
  email: string
  address: string
}

export function ClientManager() {
  const { data: clients = [], isLoading } = useClients()
  const createClient = useCreateClient()
  const updateClient = useUpdateClient()
  const deleteClient = useDeleteClient()

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ClientFormData>()

  const onAdd = async (data: ClientFormData) => {
    await createClient.mutateAsync({
      name: data.name,
      email: data.email || null,
      address: data.address || null
    })
    setIsAdding(false)
    reset()
  }

  const onUpdate = async (id: number, data: ClientFormData) => {
    await updateClient.mutateAsync({
      id,
      data: {
        name: data.name,
        email: data.email || null,
        address: data.address || null
      }
    })
    setEditingId(null)
  }

  const startEdit = (client: Client) => {
    setEditingId(client.id)
    reset({
      name: client.name,
      email: client.email || '',
      address: client.address || ''
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Clients</h3>
          <p className="text-sm text-gray-500">Manage your recurring client information.</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => {
              setIsAdding(true)
              reset({ name: '', email: '', address: '' })
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Client
          </button>
        )}
      </div>

      <div className="space-y-3">
        {isAdding && (
          <form 
            onSubmit={handleSubmit(onAdd)}
            className="p-4 rounded-xl bg-[#0b0f19] border border-violet-500/30 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Name</label>
                <input
                  {...register('name', { required: true })}
                  autoFocus
                  className="w-full bg-[#080c14] border border-[#1f2937] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                  placeholder="Client Name or Company"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Email</label>
                <input
                  {...register('email')}
                  className="w-full bg-[#080c14] border border-[#1f2937] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                  placeholder="client@email.com"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Address</label>
                <textarea
                  {...register('address')}
                  rows={2}
                  className="w-full bg-[#080c14] border border-[#1f2937] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  placeholder="123 Client St..."
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t border-[#1f2937]">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                Save Client
              </button>
            </div>
          </form>
        )}

        {clients.length === 0 && !isAdding && (
          <div className="text-center py-10 border border-dashed border-[#1f2937] rounded-xl">
            <p className="text-sm text-gray-600 italic">No clients added yet.</p>
          </div>
        )}

        {clients.map(client => (
          <div key={client.id} className="group relative p-4 rounded-xl bg-[#0b0f19] border border-[#1f2937] hover:border-[#374151] transition-all">
            {editingId === client.id ? (
              <form onSubmit={handleSubmit(data => onUpdate(client.id, data))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <input
                      {...register('name', { required: true })}
                      className="w-full bg-[#080c14] border border-[#1f2937] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                  <div>
                    <input
                      {...register('email')}
                      className="w-full bg-[#080c14] border border-[#1f2937] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                  <div className="col-span-2">
                    <textarea
                      {...register('address')}
                      rows={2}
                      className="w-full bg-[#080c14] border border-[#1f2937] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors resize-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold"
                  >
                    Update
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-white group-hover:text-violet-400 transition-colors">{client.name}</h4>
                    {client.email && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Mail className="w-3 h-3" />
                        {client.email}
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-start gap-1.5 text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mt-0.5" />
                        <span className="whitespace-pre-line">{client.address}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(client)}
                      className="p-1.5 rounded-lg hover:bg-[#1f2937] text-gray-500 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this client?')) deleteClient.mutate(client.id)
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
