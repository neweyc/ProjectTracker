import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { billingApi } from '../../api/billingApi'
import { CreditCard, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export const BillingSettings: React.FC = () => {
  const { user } = useAuth()
  const [loading, setLoading] = React.useState(false)

  const handleSubscribe = async () => {
    try {
      setLoading(true)
      const successUrl = window.location.origin + '/settings?billing=success'
      const cancelUrl = window.location.origin + '/settings?billing=cancel'
      const { url } = await billingApi.createCheckoutSession(successUrl, cancelUrl)
      window.location.href = url
    } catch (err) {
      toast.error('Failed to start checkout. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleManageBilling = async () => {
    try {
      setLoading(true)
      const returnUrl = window.location.origin + '/settings'
      const { url } = await billingApi.createPortalSession(returnUrl)
      window.location.href = url
    } catch (err) {
      toast.error('Failed to open billing portal. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const isActive = user?.subscriptionStatus === 'active'

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">Subscription & Billing</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your plan and billing information.
        </p>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Plan</p>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                {isActive ? 'Olive Invoices Pro' : 'Free Plan'}
              </h4>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
              isActive 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' 
                : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
            }`}>
              {isActive ? 'Active' : 'No Subscription'}
            </span>
          </div>
        </div>

        {!isActive && (
          <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Upgrade to Pro to unlock advanced invoicing features, priority support, and team collaboration.
            </p>
          </div>
        )}

        <div className="mt-8 flex gap-3">
          {isActive ? (
            <button
              onClick={handleManageBilling}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              Manage Billing
              <ExternalLink className="w-3 h-3 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/20"
            >
              Upgrade to Pro
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
