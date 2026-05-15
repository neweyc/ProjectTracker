import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Board } from '@/components/board/Board'
import { SettingsModal } from '@/components/settings/SettingsModal'

export function AppShell() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

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
