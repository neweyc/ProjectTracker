import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Receipt, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ApiError } from '@/api/client'

interface RegisterForm {
  tenantName: string
  displayName: string
  email: string
  password: string
  confirmPassword: string
}

interface Props {
  onLogin: () => void
  onBackToHome: () => void
}

export function RegisterPage({ onLogin, onBackToHome }: Props) {
  const { register: registerAccount } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterForm>()
  const password = watch('password')

  async function onSubmit(data: RegisterForm) {
    setServerError(null)
    try {
      await registerAccount(
        data.tenantName.trim(),
        data.displayName.trim(),
        data.email.trim(),
        data.password,
      )
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setServerError('An account with that email already exists.')
      } else {
        setServerError('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#080c14] flex flex-col items-center justify-center px-4 py-10">
      {/* Logo */}
      <button 
        onClick={onBackToHome}
        className="flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity"
      >
        <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-900/40">
          <Receipt className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-semibold text-white tracking-tight">Olive Invoice</span>
      </button>

      {/* Card */}
      <div className="w-full max-w-sm bg-[#0f1420] border border-[#1f2937] rounded-2xl p-8 shadow-2xl">
        <h1 className="text-lg font-semibold text-white mb-1">Create your account</h1>
        <p className="text-sm text-gray-500 mb-6">Get started — it only takes a minute</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Company / workspace name */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Company name
            </label>
            <input
              type="text"
              autoFocus
              autoComplete="organization"
              {...register('tenantName', { required: 'Company name is required' })}
              className="w-full px-3 py-2.5 rounded-lg bg-[#080c14] border border-[#1f2937] text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-colors"
              placeholder="Acme Inc."
            />
            {errors.tenantName && (
              <p className="mt-1 text-xs text-red-400">{errors.tenantName.message}</p>
            )}
          </div>

          {/* Your name */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Your name
            </label>
            <input
              type="text"
              autoComplete="name"
              {...register('displayName', { required: 'Your name is required' })}
              className="w-full px-3 py-2.5 rounded-lg bg-[#080c14] border border-[#1f2937] text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-colors"
              placeholder="Jane Smith"
            />
            {errors.displayName && (
              <p className="mt-1 text-xs text-red-400">{errors.displayName.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' },
              })}
              className="w-full px-3 py-2.5 rounded-lg bg-[#080c14] border border-[#1f2937] text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-colors"
              placeholder="you@company.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'At least 8 characters' },
                })}
                className="w-full px-3 py-2.5 pr-10 rounded-lg bg-[#080c14] border border-[#1f2937] text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Confirm password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: v => v === password || 'Passwords do not match',
              })}
              className="w-full px-3 py-2.5 rounded-lg bg-[#080c14] border border-[#1f2937] text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-colors"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Server error */}
          {serverError && (
            <div className="px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-400">{serverError}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors mt-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>

      {/* Login link */}
      <p className="mt-5 text-sm text-gray-500">
        Already have an account?{' '}
        <button
          onClick={onLogin}
          className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
        >
          Sign in
        </button>
      </p>
    </div>
  )
}
