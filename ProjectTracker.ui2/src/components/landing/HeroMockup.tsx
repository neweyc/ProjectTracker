import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Receipt, Plus, Settings, Clock, GitBranch, LogOut,
  FileDown, Edit2, Trash2, LayoutGrid,
} from 'lucide-react'

// ─── Shared primitives ────────────────────────────────────────────────────────

function PriorityBadge({ p }: { p: 'High' | 'Medium' | 'Low' }) {
  const s = {
    High:   'text-red-400 bg-red-500/10 border-red-500/30',
    Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    Low:    'text-sky-400 bg-sky-500/10 border-sky-500/30',
  }[p]
  return <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${s}`}>{p}</span>
}

function TypeBadge({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="text-[9px] font-medium px-1.5 py-0.5 rounded"
      style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}44` }}
    >
      {name}
    </span>
  )
}

// ─── Board view ───────────────────────────────────────────────────────────────

interface CardData {
  title: string
  accent?: string
  priority?: 'High' | 'Medium' | 'Low'
  type?: { name: string; color: string }
  hours?: number
  subtasks?: number
  invoiced?: boolean
  pulse?: boolean
}

function MockCard({ card }: { card: CardData }) {
  return (
    <motion.div
      animate={card.pulse ? { y: [0, -3, 0] } : undefined}
      transition={card.pulse ? { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } : undefined}
      className="bg-[#111827] rounded-xl border border-[#1f2937] border-l-[3px] p-3 select-none"
      style={{ borderLeftColor: card.accent ?? '#64748b' }}
    >
      <p className="text-[11px] font-medium text-white leading-snug mb-2">{card.title}</p>
      <div className="flex items-center gap-1 flex-wrap">
        {card.priority && <PriorityBadge p={card.priority} />}
        {card.type     && <TypeBadge {...card.type} />}
        {card.hours && (
          <span className="flex items-center gap-0.5 text-[9px] text-gray-500 bg-[#1f2937] px-1.5 py-0.5 rounded">
            <Clock className="w-2 h-2" />{card.hours}h
          </span>
        )}
        {card.subtasks && (
          <span className="flex items-center gap-0.5 text-[9px] text-gray-500 bg-[#1f2937] px-1.5 py-0.5 rounded">
            <GitBranch className="w-2 h-2" />{card.subtasks}
          </span>
        )}
        {card.invoiced && (
          <span className="text-[9px] text-violet-300 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded">
            Invoiced
          </span>
        )}
      </div>
    </motion.div>
  )
}

const COL_CONFIG = {
  todo:       { label: 'To Do',       dot: 'bg-slate-400',   count: 'bg-slate-500/20 text-slate-400',    accent: '#64748b' },
  inprogress: { label: 'In Progress', dot: 'bg-amber-400',   count: 'bg-amber-500/20 text-amber-400',    accent: '#f59e0b' },
  done:       { label: 'Done',        dot: 'bg-emerald-400', count: 'bg-emerald-500/20 text-emerald-400', accent: '#10b981' },
}

function Column({ id, cards }: { id: keyof typeof COL_CONFIG; cards: CardData[] }) {
  const cfg = COL_CONFIG[id]
  return (
    <div className="flex flex-col gap-2 p-3 bg-[#0d1117] min-w-0">
      <div className="flex items-center gap-1.5 px-0.5 mb-0.5">
        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
        <span className="text-[10px] font-medium text-gray-500">{cfg.label}</span>
        <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-medium ${cfg.count}`}>{cards.length}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {cards.map((card, i) => <MockCard key={i} card={{ ...card, accent: cfg.accent }} />)}
      </div>
    </div>
  )
}

const FEATURE = { name: 'Feature', color: '#7c3aed' }
const BUG     = { name: 'Bug',     color: '#dc2626' }

const TODO_CARDS: CardData[] = [
  { title: 'Design new checkout flow',  priority: 'High',   type: FEATURE },
  { title: 'Write homepage copy',       priority: 'Medium', hours: 1.5 },
  { title: 'Fix mobile nav dropdown',   priority: 'Low',    type: BUG },
]
const INPROGRESS_CARDS: CardData[] = [
  { title: 'Build product catalog API', priority: 'High',   type: FEATURE, hours: 4.5, subtasks: 3, pulse: true },
  { title: 'Integrate Stripe payments', priority: 'Medium', type: FEATURE, hours: 2 },
]
const DONE_CARDS: CardData[] = [
  { title: 'Set up project structure',  type: FEATURE, hours: 1 },
  { title: 'Design system components',  hours: 6.5, invoiced: true },
]

function BoardView() {
  return (
    <div className="flex-1 grid grid-cols-3 divide-x divide-[#1f2937] overflow-y-auto">
      <Column id="todo"       cards={TODO_CARDS} />
      <Column id="inprogress" cards={INPROGRESS_CARDS} />
      <Column id="done"       cards={DONE_CARDS} />
    </div>
  )
}

// ─── Invoices view ────────────────────────────────────────────────────────────

interface MockInvoice {
  number: string
  status: 'Draft' | 'Sent' | 'Paid'
  client: string
  date: string
  items: number
  total: string
}

const INVOICES: MockInvoice[] = [
  { number: 'INV-2026-003', status: 'Paid',  client: 'Acme Corp',    date: 'May 1, 2026',  items: 3, total: '$4,800.00' },
  { number: 'INV-2026-002', status: 'Sent',  client: 'Acme Corp',    date: 'Apr 18, 2026', items: 2, total: '$2,400.00' },
  { number: 'INV-2026-001', status: 'Draft', client: 'Techbase Ltd', date: 'Apr 5, 2026',  items: 1, total: '$1,200.00' },
]

const STATUS_STYLES: Record<MockInvoice['status'], string> = {
  Draft: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  Sent:  'text-blue-400 bg-blue-500/10 border-blue-500/30',
  Paid:  'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
}

function InvoicesView() {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0d1117]">
      {/* Summary strip */}
      <div className="flex items-center gap-6 px-4 py-2.5 border-b border-[#1f2937] bg-[#080c14]">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Total Billed</span>
          <span className="text-xs font-bold text-white ml-1">$8,400.00</span>
        </div>
        <div className="w-px h-3 bg-[#1f2937]" />
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[9px] text-gray-500">1 Paid</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span className="text-[9px] text-gray-500">1 Sent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span className="text-[9px] text-gray-500">1 Draft</span>
        </div>
      </div>

      {/* Invoice rows */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1f2937]">
        {INVOICES.map((inv, i) => (
          <motion.div
            key={inv.number}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.2 }}
            className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors group"
          >
            {/* Icon */}
            <div className="w-8 h-8 rounded-lg bg-[#111827] border border-[#1f2937] flex items-center justify-center flex-shrink-0">
              <Receipt className="w-3.5 h-3.5 text-violet-400" />
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-semibold text-white">{inv.number}</span>
                <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${STATUS_STYLES[inv.status]}`}>
                  {inv.status}
                </span>
              </div>
              <p className="text-[9px] text-gray-500">
                {inv.client} &bull; {inv.date} &bull; {inv.items} item{inv.items !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Amount */}
            <span className="text-sm font-bold text-white flex-shrink-0">{inv.total}</span>

            {/* Actions — visible on hover */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <div className="w-6 h-6 flex items-center justify-center rounded-md text-gray-600 hover:text-violet-400 hover:bg-violet-500/10 transition-colors cursor-pointer">
                <FileDown className="w-3 h-3" />
              </div>
              <div className="w-6 h-6 flex items-center justify-center rounded-md text-gray-600 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                <Edit2 className="w-3 h-3" />
              </div>
              <div className="w-6 h-6 flex items-center justify-center rounded-md text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
                <Trash2 className="w-3 h-3" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Sidebar data ─────────────────────────────────────────────────────────────

const PROJECTS = [
  { name: 'E-commerce Redesign', color: '#7c3aed', count: 7, active: true },
  { name: 'Mobile App v2',       color: '#2563eb', count: 4, active: false },
  { name: 'API Services',        color: '#059669', count: 3, active: false },
]

// ─── Root export ──────────────────────────────────────────────────────────────

type Tab = 'board' | 'invoices'

export function HeroMockup() {
  const [tab, setTab] = useState<Tab>('board')

  return (
    <div className="relative">
      {/* Ambient glow */}
      <div className="absolute -inset-8 bg-violet-500/15 blur-[80px] rounded-full pointer-events-none" />

      {/* Window frame */}
      <div className="relative rounded-2xl border border-white/10 bg-[#0f1420] shadow-2xl shadow-black/70 overflow-hidden">

        {/* Browser chrome */}
        <div className="flex items-center gap-3 px-4 h-9 bg-[#080c14] border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-1.5 bg-[#0f1420] border border-white/[0.08] rounded-md px-3 py-1 text-[10px] text-gray-500 w-48 justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
              oliveinvoice.com
            </div>
          </div>
          <div className="w-12" />
        </div>

        {/* App layout */}
        <div className="flex" style={{ height: 430 }}>

          {/* Sidebar */}
          <aside className="w-48 flex-shrink-0 flex flex-col bg-[#080c14] border-r border-[#1f2937]">
            {/* Brand */}
            <div className="px-3.5 py-3.5 flex items-center gap-2.5 border-b border-[#1f2937]">
              <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
                <Receipt className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-white text-xs tracking-tight">Olive Invoice</span>
            </div>

            {/* All Projects */}
            <div className="px-2.5 pt-3 pb-1">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                <span className="font-medium">All Projects</span>
                <span className="ml-auto text-[9px] bg-[#1f2937] text-gray-500 px-1.5 py-0.5 rounded">3</span>
              </div>
            </div>

            {/* Projects label */}
            <div className="px-3.5 pt-2 pb-1.5 flex items-center justify-between">
              <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest">Projects</span>
              <Plus className="w-3 h-3 text-gray-600" />
            </div>

            {/* Project list */}
            <div className="flex-1 px-2.5 space-y-0.5 overflow-hidden">
              {PROJECTS.map((p) => (
                <div
                  key={p.name}
                  className={`relative flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs ${
                    p.active ? 'bg-[#111827] text-white' : 'text-gray-500'
                  }`}
                >
                  {p.active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-violet-500" />
                  )}
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="flex-1 truncate font-medium text-[11px]">{p.name}</span>
                  <span className="text-[9px] text-gray-600">{p.count}</span>
                </div>
              ))}
            </div>

            {/* Mini bar chart */}
            <div className="mx-2.5 mb-2.5 p-2.5 rounded-xl bg-[#0f1420] border border-[#1f2937]">
              <p className="text-[8px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Task Distribution</p>
              <div className="flex items-end gap-1.5 h-8">
                {[
                  { h: '55%', color: 'bg-slate-500/50',   label: 'To Do' },
                  { h: '35%', color: 'bg-amber-500/50',   label: 'Active' },
                  { h: '25%', color: 'bg-emerald-500/50', label: 'Done' },
                ].map(b => (
                  <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
                    <div className={`w-full rounded-sm ${b.color}`} style={{ height: b.h }} />
                    <span className="text-[7px] text-gray-600">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom */}
            <div className="p-2.5 border-t border-[#1f2937] space-y-0.5">
              <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-gray-500 text-xs">
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1.5">
                <div className="w-6 h-6 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-[8px] font-semibold text-violet-300">JD</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium text-gray-300 truncate">Jamie Doe</p>
                  <p className="text-[8px] text-gray-600 truncate">jamie@acme.com</p>
                </div>
                <LogOut className="w-3 h-3 text-gray-700" />
              </div>
            </div>
          </aside>

          {/* Main area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

            {/* Header with tab switcher */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1f2937] bg-[#080c14] flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-violet-500" />
                <span className="text-sm font-semibold text-white">E-commerce Redesign</span>
                <span className="text-[10px] text-gray-600 bg-[#1f2937] px-1.5 py-0.5 rounded">7 tasks</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Tab switcher */}
                <div className="flex items-center gap-0.5 bg-[#0b0f19] rounded-lg p-0.5 border border-[#1f2937]">
                  <button
                    onClick={() => setTab('board')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
                      tab === 'board'
                        ? 'bg-[#1f2937] text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <LayoutGrid className="w-3 h-3" /> Board
                  </button>
                  <button
                    onClick={() => setTab('invoices')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
                      tab === 'invoices'
                        ? 'bg-[#1f2937] text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <Receipt className="w-3 h-3" /> Invoices
                  </button>
                </div>

                {tab === 'board' ? (
                  <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-600/20 border border-violet-500/30 text-violet-300 text-[10px] font-semibold">
                    <Plus className="w-3 h-3" /> New Task
                  </button>
                ) : (
                  <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-600/20 border border-violet-500/30 text-violet-300 text-[10px] font-semibold">
                    <Plus className="w-3 h-3" /> Create Invoice
                  </button>
                )}
              </div>
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="flex-1 flex flex-col min-h-0 overflow-hidden"
              >
                {tab === 'board'    && <BoardView />}
                {tab === 'invoices' && <InvoicesView />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
