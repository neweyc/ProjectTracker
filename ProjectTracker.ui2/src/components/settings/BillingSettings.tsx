import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { billingApi } from '../../api/billingApi'
import { CreditCard, ExternalLink, ShieldCheck, Star, Users, Zap } from 'lucide-react'
import { toast } from 'sonner'

export const BillingSettings: React.FC = () => {
  const { user } = useAuth()
  const [loading, setLoading] = React.useState<string | null>(null)

  const handleSubscribe = async (tier: string) => {
    try {
      setLoading(tier)
      const successUrl = window.location.origin + '/?billing=success'
      const cancelUrl = window.location.origin + '/?billing=cancel'
      const { url } = await billingApi.createCheckoutSession(tier, successUrl, cancelUrl)
      window.location.href = url
    } catch (err) {
      toast.error('Failed to start checkout. Please try again.')
      console.error(err)
    } finally {
      setLoading(null)
    }
  }

  const handleManageBilling = async () => {
    try {
      setLoading('portal')
      const returnUrl = window.location.origin
      const { url } = await billingApi.createPortalSession(returnUrl)
      window.location.href = url
    } catch (err) {
      toast.error('Failed to open billing portal. Please try again.')
      console.error(err)
    } finally {
      setLoading(null)
    }
  }

  const isActive = user?.subscriptionStatus === 'active'
  const currentTier = user?.subscriptionTier || 'Free'

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-white">Subscription & Billing</h3>
        <p className="text-sm text-gray-500">
          Manage your plan and billing information.
        </p>
      </div>

      {/* Current Status Card */}
      <div className="bg-[#0b0f19] rounded-2xl border border-[#1f2937] p-6 overflow-hidden relative group">
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isActive ? 'bg-violet-600/20 text-violet-400 border border-violet-500/20' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Current Plan</p>
              <h4 className="text-xl font-bold text-white">
                {isActive ? `Olive ${currentTier}` : 'Free Plan'}
              </h4>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              isActive 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-gray-800 text-gray-500 border-gray-700'
            }`}>
              {isActive ? 'Active' : 'No Subscription'}
            </span>
          </div>
        </div>

        {isActive && (
          <div className="mt-8 flex gap-3 relative z-10">
            <button
              onClick={handleManageBilling}
              disabled={!!loading}
              className="flex items-center gap-2 px-4 py-2 bg-white text-violet-600 rounded-lg text-sm font-bold hover:bg-gray-100 transition-all disabled:opacity-50 shadow-lg shadow-black/20"
            >
              {loading === 'portal' ? <Zap className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              Manage Billing & Invoices
              <ExternalLink className="w-3 h-3 ml-1 opacity-50" />
            </button>
          </div>
        )}
      </div>

      {/* Pricing Tiers if not active */}
      {!isActive && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Solo Tier */}
          <div className="p-6 rounded-2xl border border-[#1f2937] bg-[#0b0f19] flex flex-col h-full">
            <div className="mb-6">
              <h4 className="font-bold text-white text-lg">Solo</h4>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-white">$9</span>
                <span className="text-gray-500 text-xs">/ month</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-2 text-xs text-gray-400">
                <Star className="w-3 h-3 text-violet-400 fill-violet-400" />
                Unlimited clients & invoices
              </li>
              <li className="flex items-center gap-2 text-xs text-gray-400">
                <Star className="w-3 h-3 text-violet-400 fill-violet-400" />
                Full Kanban board
              </li>
              <li className="flex items-center gap-2 text-xs text-gray-400">
                <Star className="w-3 h-3 text-violet-400 fill-violet-400" />
                PDF Exports
              </li>
            </ul>
            <button
              onClick={() => handleSubscribe('Solo')}
              disabled={!!loading}
              className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold transition-all"
            >
              {loading === 'Solo' ? 'Redirecting...' : 'Upgrade to Solo'}
            </button>
          </div>

          {/* Team Tier */}
          <div className="p-6 rounded-2xl border border-violet-500/30 bg-violet-600/5 flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-violet-600 text-[8px] font-bold uppercase tracking-wider text-white">
              Recommended
            </div>
            <div className="mb-6">
              <h4 className="font-bold text-white text-lg">Team</h4>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-white">$29</span>
                <span className="text-gray-400 text-xs">/ month</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-2 text-xs text-violet-200">
                <Users className="w-3 h-3" />
                Up to 5 team members
              </li>
              <li className="flex items-center gap-2 text-xs text-violet-200">
                <Users className="w-3 h-3" />
                Shared boards & collaboration
              </li>
              <li className="flex items-center gap-2 text-xs text-violet-200">
                <Users className="w-3 h-3" />
                Integrated payments
              </li>
            </ul>
            <button
              onClick={() => handleSubscribe('Team')}
              disabled={!!loading}
              className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold transition-all shadow-lg shadow-violet-900/20"
            >
              {loading === 'Team' ? 'Redirecting...' : 'Get Started with Team'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
