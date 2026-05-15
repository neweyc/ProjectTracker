import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Dialog from '@radix-ui/react-dialog'
import {
  X, Plus, Receipt, FileDown, Edit2, Trash2,
  CheckSquare, Square, ArrowLeft, FileText,
} from 'lucide-react'
import { useProjectInvoices, useCreateInvoice, useUpdateInvoice, useDeleteInvoice } from '@/hooks/useInvoices'
import { useProjectTasks } from '@/hooks/useTasks'
import { useClients } from '@/hooks/useClients'
import { useSettings } from '@/hooks/useSettings'
import { InvoiceTemplate } from './InvoiceTemplate'
import { formatCurrency } from '@/lib/utils'
import type { Invoice, InvoiceStatus, Project } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  project: Project
}

type View = 'list' | 'create' | 'edit'

const STATUS_CONFIG: Record<InvoiceStatus, { text: string; bg: string; border: string }> = {
  Draft:  { text: 'text-slate-400',   bg: 'bg-slate-500/10',   border: 'border-slate-500/30' },
  Sent:   { text: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30' },
  Paid:   { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
}

function invoiceTotal(invoice: Invoice): number {
  const sub = invoice.lineItems.reduce((s, li) => s + li.amount, 0)
  return sub + sub * (invoice.taxRate / 100)
}

// ─── List view ───────────────────────────────────────────────────────────────

interface ListViewProps {
  projectId: number
  onCreate: () => void
  onEdit: (invoice: Invoice) => void
  onPrint: (invoice: Invoice) => void
}

function ListView({ projectId, onCreate, onEdit, onPrint }: ListViewProps) {
  const { data: invoices = [], isLoading } = useProjectInvoices(projectId)
  const deleteInvoice = useDeleteInvoice()

  const handleDelete = async (invoice: Invoice) => {
    if (!confirm(`Delete invoice #${invoice.invoiceNumber}? Related tasks will be marked uninvoiced.`)) return
    await deleteInvoice.mutateAsync({ projectId, invoiceId: invoice.id })
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (invoices.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12">
        <div className="w-14 h-14 rounded-2xl bg-[#111827] border border-[#1f2937] flex items-center justify-center">
          <FileText className="w-6 h-6 text-gray-600" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-400">No invoices yet</p>
          <p className="text-xs text-gray-600 mt-1">Generate an invoice from uninvoiced tasks</p>
        </div>
        <button
          onClick={onCreate}
          className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="divide-y divide-[#1f2937]">
        {invoices.map(invoice => {
          const sc = STATUS_CONFIG[invoice.status]
          const total = invoiceTotal(invoice)
          return (
            <div key={invoice.id} className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-white">#{invoice.invoiceNumber}</span>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${sc.text} ${sc.bg} ${sc.border}`}>
                    {invoice.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {invoice.clientName || 'No client'} &bull; {new Date(invoice.createdAt).toLocaleDateString()} &bull; {invoice.lineItems.length} item{invoice.lineItems.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-white">{formatCurrency(total)}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={() => onPrint(invoice)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                  title="Export PDF"
                >
                  <FileDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onEdit(invoice)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(invoice)}
                  disabled={deleteInvoice.isPending}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Create view ─────────────────────────────────────────────────────────────

interface CreateViewProps {
  projectId: number
  clientId?: number | null
  onBack: () => void
}

function CreateView({ projectId, clientId, onBack }: CreateViewProps) {
  const { data: tasks = [] } = useProjectTasks(projectId)
  const { data: clients = [] } = useClients()
  const createInvoice = useCreateInvoice()

  const uninvoiced = tasks.filter(t => !t.parentTaskId && !t.isInvoiced && t.totalHours > 0)

  const [selected, setSelected]   = useState<Record<number, boolean>>({})
  const [rates, setRates]         = useState<Record<number, number>>({})
  const [clientName, setClientName]       = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [dueDate, setDueDate]     = useState('')
  const [taxRate, setTaxRate]     = useState(0)
  const [notes, setNotes]         = useState('')

  useEffect(() => {
    if (clientId) {
      const client = clients.find(c => c.id === clientId)
      if (client) {
        setClientName(client.name)
        setClientAddress(client.address || '')
      }
    }
  }, [clientId, clients])

  const toggle = (id: number) => {
    setSelected(prev => {
      const next = { ...prev, [id]: !prev[id] }
      if (next[id] && !rates[id]) setRates(r => ({ ...r, [id]: 100 }))
      return next
    })
  }

  const selectedCount = Object.values(selected).filter(Boolean).length

  const handleSubmit = async () => {
    const lineItems = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([id]) => ({ taskId: Number(id), hourlyRate: rates[Number(id)] || 0 }))
    if (!lineItems.length) return
    await createInvoice.mutateAsync({
      projectId,
      data: {
        lineItems,
        clientName: clientName.trim() || null,
        clientAddress: clientAddress.trim() || null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        taxRate,
        notes: notes.trim() || null,
      },
    })
    onBack()
  }

  const inputCls = 'w-full bg-[#0b0f19] border border-[#374151] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors'

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col md:flex-row gap-5 p-4 min-h-0">
          {/* Left: client details */}
          <div className="w-full md:w-56 flex-shrink-0 space-y-3">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Invoice Details</p>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Client Name</label>
              <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client Corp" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Client Address</label>
              <textarea value={clientAddress} onChange={e => setClientAddress(e.target.value)} rows={3} placeholder={"123 Client St\nCity, State"} className={`${inputCls} resize-none`} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Due Date</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={`${inputCls} [color-scheme:dark]`} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Tax %</label>
                <input type="number" min="0" step="0.1" value={taxRate} onChange={e => setTaxRate(parseFloat(e.target.value) || 0)} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Notes / Terms</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Net 30..." className={`${inputCls} resize-none`} />
            </div>
          </div>

          {/* Right: task picker */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Billable Tasks</p>
            {uninvoiced.length === 0 ? (
              <div className="rounded-xl border border-[#1f2937] p-6 text-center">
                <p className="text-sm text-gray-500">No uninvoiced tasks with logged hours</p>
              </div>
            ) : (
              <div className="rounded-xl border border-[#1f2937] divide-y divide-[#1f2937] overflow-hidden">
                {uninvoiced.map(task => {
                  const isOn = !!selected[task.id]
                  return (
                    <div key={task.id} className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${isOn ? 'bg-violet-500/5' : 'hover:bg-white/[0.02]'}`}>
                      <button onClick={() => toggle(task.id)} className="flex-shrink-0 text-gray-500 hover:text-violet-400 transition-colors">
                        {isOn
                          ? <CheckSquare className="w-4 h-4 text-violet-400" />
                          : <Square className="w-4 h-4" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{task.title}</p>
                        <p className="text-xs text-gray-500">{task.totalHours}h logged</p>
                      </div>
                      {isOn && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <label className="text-xs text-gray-500">$/hr</label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={rates[task.id] || ''}
                            onChange={e => setRates(r => ({ ...r, [task.id]: parseFloat(e.target.value) || 0 }))}
                            className="w-16 bg-[#0b0f19] border border-[#374151] rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:border-violet-500 transition-colors"
                          />
                          <span className="text-xs font-semibold text-violet-300 w-16 text-right">
                            {formatCurrency((rates[task.id] || 0) * task.totalHours)}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-t border-[#1f2937]">
        <span className="text-xs text-gray-500">{selectedCount} task{selectedCount !== 1 ? 's' : ''} selected</span>
        <div className="flex gap-2">
          <button onClick={onBack} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedCount === 0 || createInvoice.isPending}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createInvoice.isPending ? 'Generating...' : 'Generate Invoice'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit view ────────────────────────────────────────────────────────────────

interface EditViewProps {
  invoice: Invoice
  onBack: () => void
  onPrint: (invoice: Invoice) => void
}

function EditView({ invoice, onBack, onPrint }: EditViewProps) {
  const updateInvoice = useUpdateInvoice()
  const deleteInvoice = useDeleteInvoice()

  const [clientName, setClientName]       = useState(invoice.clientName || '')
  const [clientAddress, setClientAddress] = useState(invoice.clientAddress || '')
  const [dueDate, setDueDate]     = useState(invoice.dueDate ? invoice.dueDate.split('T')[0] : '')
  const [taxRate, setTaxRate]     = useState(invoice.taxRate)
  const [notes, setNotes]         = useState(invoice.notes || '')
  const [status, setStatus]       = useState<InvoiceStatus>(invoice.status)

  useEffect(() => {
    setClientName(invoice.clientName || '')
    setClientAddress(invoice.clientAddress || '')
    setDueDate(invoice.dueDate ? invoice.dueDate.split('T')[0] : '')
    setTaxRate(invoice.taxRate)
    setNotes(invoice.notes || '')
    setStatus(invoice.status)
  }, [invoice])

  const handleSave = async () => {
    await updateInvoice.mutateAsync({
      projectId: invoice.projectId,
      invoiceId: invoice.id,
      data: {
        clientName: clientName.trim() || null,
        clientAddress: clientAddress.trim() || null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        taxRate,
        notes: notes.trim() || null,
        status,
      },
    })
    onBack()
  }

  const handleDelete = async () => {
    if (!confirm(`Delete invoice #${invoice.invoiceNumber}? Related tasks will be marked uninvoiced.`)) return
    await deleteInvoice.mutateAsync({ projectId: invoice.projectId, invoiceId: invoice.id })
    onBack()
  }

  const previewInvoice: Invoice = {
    ...invoice,
    clientName: clientName || null,
    clientAddress: clientAddress || null,
    dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    taxRate,
    notes: notes || null,
    status,
  }

  const inputCls = 'w-full bg-[#0b0f19] border border-[#374151] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors'

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as InvoiceStatus)}
            className={`${inputCls} bg-[#0b0f19]`}
          >
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Client Name</label>
          <input value={clientName} onChange={e => setClientName(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Client Address</label>
          <textarea value={clientAddress} onChange={e => setClientAddress(e.target.value)} rows={3} className={`${inputCls} resize-none`} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Due Date</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={`${inputCls} [color-scheme:dark]`} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Tax %</label>
            <input type="number" min="0" step="0.1" value={taxRate} onChange={e => setTaxRate(parseFloat(e.target.value) || 0)} className={inputCls} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Notes / Terms</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className={`${inputCls} resize-none`} />
        </div>
      </div>

      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-t border-[#1f2937]">
        <button
          onClick={handleDelete}
          disabled={deleteInvoice.isPending}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-40"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
        <div className="flex gap-2">
          <button onClick={onBack} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onPrint(previewInvoice)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 border border-[#374151] transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            Export
          </button>
          <button
            onClick={handleSave}
            disabled={updateInvoice.isPending}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateInvoice.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Root component ───────────────────────────────────────────────────────────

export function InvoiceManagerModal({ open, onClose, project }: Props) {
  const { data: settings } = useSettings()
  const [view, setView]               = useState<View>('list')
  const [editingInvoice, setEditing]  = useState<Invoice | null>(null)
  const [printTarget, setPrintTarget] = useState<Invoice | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = useCallback((invoice: Invoice) => {
    setPrintTarget(invoice)
  }, [])

  useEffect(() => {
    if (!printTarget) return
    const el = printRef.current
    if (!el) return
    const win = window.open('', '_blank', 'width=920,height=1200')
    if (win) {
      win.document.write('<!DOCTYPE html><html><head><title>Invoice ' + printTarget.invoiceNumber + '</title></head><body style="margin:0">' + el.innerHTML + '</body></html>')
      win.document.close()
      win.focus()
      win.print()
      win.close()
    }
    setPrintTarget(null)
  }, [printTarget])

  const handleClose = () => {
    setView('list')
    setEditing(null)
    onClose()
  }

  const handleEdit = (invoice: Invoice) => {
    setEditing(invoice)
    setView('edit')
  }

  const handleBack = () => {
    setView('list')
    setEditing(null)
  }

  const titles: Record<View, string> = {
    list:   'Invoices',
    create: 'New Invoice',
    edit:   editingInvoice ? `Invoice #${editingInvoice.invoiceNumber}` : 'Edit Invoice',
  }

  return (
    <>
      <Dialog.Root open={open} onOpenChange={(v) => !v && handleClose()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl h-[80vh] focus:outline-none">
            <AnimatePresence mode="wait">
              {open && (
                <motion.div
                  key="invoice-modal"
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className="h-full bg-[#111827] border border-[#1f2937] rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex-shrink-0 flex items-center gap-3 px-4 py-4 border-b border-[#1f2937]">
                    {view !== 'list' && (
                      <button
                        onClick={handleBack}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    )}
                    {view === 'list' && (
                      <Receipt className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    )}
                    <Dialog.Title className="flex-1 text-base font-semibold text-white">
                      {titles[view]}
                    </Dialog.Title>
                    {view === 'list' && (
                      <button
                        onClick={() => setView('create')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-600/20 text-violet-300 border border-violet-500/30 hover:bg-violet-600/30 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Create Invoice
                      </button>
                    )}
                    <button
                      onClick={handleClose}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Body */}
                  {view === 'list' && (
                    <ListView
                      projectId={project.id}
                      onCreate={() => setView('create')}
                      onEdit={handleEdit}
                      onPrint={handlePrint}
                    />
                  )}
                  {view === 'create' && (
                    <CreateView projectId={project.id} clientId={project.clientId} onBack={handleBack} />
                  )}
                  {view === 'edit' && editingInvoice && (
                    <EditView invoice={editingInvoice} onBack={handleBack} onPrint={handlePrint} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Hidden print target — rendered off-screen so ref is available when needed */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '794px', pointerEvents: 'none' }}>
        {printTarget && (
          <InvoiceTemplate ref={printRef} invoice={printTarget} settings={settings} />
        )}
      </div>
    </>
  )
}
