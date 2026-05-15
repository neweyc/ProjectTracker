import { useState, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { Board } from '@/components/board/Board'
import { SettingsModal } from '@/components/settings/SettingsModal'
import { toast } from 'sonner'

export function AppShell() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('billing') === 'success') {
      toast.success('Your subscription has been updated! Welcome to the Pro family.')
      window.history.replaceState({}, '', window.location.pathname)
    }
    if (params.get('billing') === 'cancel') {
      toast.error('Checkout was cancelled. No charges were made.')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0f19]">
      <Sidebar
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <main className="flex-1 overflow-hidden">
        <Board selectedProjectId={selectedProjectId} />
      </main>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
