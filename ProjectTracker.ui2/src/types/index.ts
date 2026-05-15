export interface User {
  userId: number
  tenantId: number
  email: string
  displayName: string
  subscriptionStatus?: string | null
  subscriptionTier?: string | null
}

export interface Client {
  id: number
  name: string
  email?: string | null
  address?: string | null
  createdAt: string
}

export type TaskStatus = 'Created' | 'InProgress' | 'Complete'

export interface Project {
  id: number
  name: string
  description?: string | null
  createdAt: string
  taskCount: number
  clientId?: number | null
}

export interface Task {
  id: number
  projectId: number
  parentTaskId?: number | null
  title: string
  description?: string | null
  status: TaskStatus
  isInvoiced: boolean
  subTaskCount: number
  totalHours: number
  createdAt: string
}

export interface SubTask {
  id: number
  title: string
  description?: string | null
  status: TaskStatus
  isInvoiced: boolean
  createdAt: string
}

export interface TimeEntry {
  id: number
  taskId: number
  hours: number
  date: string
  notes?: string | null
  createdAt: string
}

export interface TaskDetail {
  id: number
  projectId: number
  parentTaskId?: number | null
  title: string
  description?: string | null
  status: TaskStatus
  isInvoiced: boolean
  createdAt: string
  totalHours: number
  subTasks: SubTask[]
  timeEntries: TimeEntry[]
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  Created: 'To Do',
  InProgress: 'In Progress',
  Complete: 'Done',
}

export const STATUS_ORDER: TaskStatus[] = ['Created', 'InProgress', 'Complete']

export interface SystemSettings {
  companyName: string | null
  companyAddress: string | null
  nextInvoiceSequence: number
}

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid'

export interface InvoiceLineItem {
  id: number
  taskId: number
  description: string
  hours: number
  hourlyRate: number
  amount: number
}

export interface Invoice {
  id: number
  projectId: number
  invoiceNumber: string
  companyName: string | null
  clientName: string | null
  clientAddress: string | null
  dueDate: string | null
  taxRate: number
  notes: string | null
  status: InvoiceStatus
  createdAt: string
  lineItems: InvoiceLineItem[]
}
