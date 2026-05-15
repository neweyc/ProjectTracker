import { useState } from 'react'
import { Receipt } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { useAuth } from '@/contexts/AuthContext'

type AuthView = 'login' | 'register'

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-900/40 animate-pulse">
          <Receipt className="w-5 h-5 text-white" />
        </div>
        <p className="text-sm text-gray-600">Loading…</p>
      </div>
    </div>
  )
}

export default function App() {
  const { user, isLoading } = useAuth()
  const [authView, setAuthView] = useState<AuthView>('login')

  if (isLoading) return <LoadingScreen />

  if (!user) {
    return authView === 'login'
      ? <LoginPage onRegister={() => setAuthView('register')} />
      : <RegisterPage onLogin={() => setAuthView('login')} />
  }

  return <AppShell />
}
