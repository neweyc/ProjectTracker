import { useState } from 'react'
import { Receipt } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { LandingPage } from '@/pages/LandingPage'
import { ContactPage } from '@/pages/ContactPage'
import { useAuth } from '@/contexts/AuthContext'

type AuthView = 'landing' | 'login' | 'register' | 'contact'

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
  const [authView, setAuthView] = useState<AuthView>('landing')

  if (isLoading) return <LoadingScreen />

  if (!user) {
    if (authView === 'landing') {
      return (
        <LandingPage
          onLogin={() => setAuthView('login')}
          onRegister={() => setAuthView('register')}
          onContact={() => setAuthView('contact')}
        />
      )
    }

    if (authView === 'contact') {
      return <ContactPage onBack={() => setAuthView('landing')} />
    }

    return authView === 'login'
      ? <LoginPage onRegister={() => setAuthView('register')} onBackToHome={() => setAuthView('landing')} />
      : <RegisterPage onLogin={() => setAuthView('login')} onBackToHome={() => setAuthView('landing')} />
  }

  return <AppShell />
}
