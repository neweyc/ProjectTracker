import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { UserPlus, Star, Check, Loader2 } from 'lucide-react'
import { useUsers, useAddUser } from '@/hooks/useUsers'
import { useAuth } from '@/contexts/AuthContext'

interface AddUserFormData {
  email: string
  displayName: string
  password?: string
}

export function TeamManager() {
  const { user } = useAuth()
  const { data: members = [], isLoading } = useUsers()
  const addUser = useAddUser()
  const [isAdding, setIsAdding] = useState(false)

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<AddUserFormData>()

  // Determine limits based on tier
  const tier = user?.subscriptionTier || 'Free'
  const maxSeats = (tier === 'Team' || tier === 'Pro') ? 5 : 1
  const isLimitReached = members.length >= maxSeats

  const onAdd = async (data: AddUserFormData) => {
    // Basic password for now if not provided
    const password = data.password || 'Olive123!' 
    await addUser.mutateAsync({
      email: data.email,
      displayName: data.displayName,
      password
    })
    setIsAdding(false)
    reset()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            Team Members
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              tier === 'Team' || tier === 'Pro' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
            }`}>
              {tier} Plan
            </span>
          </h3>
          <p className="text-sm text-gray-500">
            {members.length} of {maxSeats} seats used.
          </p>
        </div>
        {!isAdding && !isLimitReached && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-violet-900/20"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Member
          </button>
        )}
      </div>

      {isLimitReached && tier !== 'Team' && (
        <div className="p-4 rounded-xl bg-violet-600/10 border border-violet-500/30 flex items-start gap-3">
          <Star className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-white">Unlock Team Collaboration</p>
            <p className="text-xs text-violet-300/80 leading-relaxed mt-1">
              Your current {tier} plan is limited to 1 seat. Upgrade to the <b>Team Plan</b> to add up to 5 members and collaborate on shared boards.
            </p>
          </div>
        </div>
      )}

      {isAdding && (
        <form 
          onSubmit={handleSubmit(onAdd)}
          className="p-4 rounded-xl bg-[#0b0f19] border border-violet-500/30 space-y-4 shadow-xl"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 text-left">Full Name</label>
              <input
                {...register('displayName', { required: true })}
                autoFocus
                className="w-full bg-[#080c14] border border-[#1f2937] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Sarah Jenkins"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 text-left">Email Address</label>
              <input
                {...register('email', { required: true })}
                type="email"
                className="w-full bg-[#080c14] border border-[#1f2937] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="sarah@company.com"
              />
            </div>
            <div className="col-span-2">
              <p className="text-[10px] text-gray-500 bg-gray-500/5 p-2 rounded italic">
                Note: For Phase 1, new users are assigned a temporary password (Olive123!). They can change it after their first login.
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2 border-t border-[#1f2937]">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-colors shadow-lg shadow-violet-900/20"
            >
              {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Invite Member
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {members.map(member => (
          <div key={member.id} className="flex items-center justify-between p-4 rounded-xl bg-[#0b0f19] border border-[#1f2937] hover:border-[#374151] transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-violet-600/20 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-xs shadow-inner">
                {member.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors">
                  {member.displayName}
                  {member.id === user?.userId && <span className="ml-2 text-[10px] bg-white/5 text-gray-500 px-1.5 py-0.5 rounded-md border border-white/5 uppercase">You</span>}
                </h4>
                <p className="text-xs text-gray-500">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-600">Joined {new Date(member.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
