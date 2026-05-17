import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Receipt, ArrowLeft, Lightbulb, Bug, MessageCircle, HelpCircle,
  CheckCircle2, Send, Clock, Mail
} from 'lucide-react'
import { sendContactMessage } from '@/api/contactApi'

interface ContactPageProps {
  onBack: () => void
}

type Category = 'Feature Request' | 'Bug Report' | 'Question' | 'Other'

const CATEGORIES: { id: Category; label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string }[] = [
  { id: 'Feature Request', label: 'Feature Request', icon: Lightbulb,     color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/40' },
  { id: 'Bug Report',      label: 'Bug Report',      icon: Bug,           color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/40' },
  { id: 'Question',        label: 'Question',         icon: HelpCircle,   color: 'text-sky-400',    bg: 'bg-sky-500/10',    border: 'border-sky-500/40' },
  { id: 'Other',           label: 'Other',            icon: MessageCircle,color: 'text-gray-400',   bg: 'bg-white/5',       border: 'border-white/10' },
]

export const ContactPage: React.FC<ContactPageProps> = ({ onBack }) => {
  const [category, setCategory] = useState<Category>('Feature Request')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await sendContactMessage({ name, email, category, message })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-white selection:bg-violet-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080c14]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-900/40">
              <Receipt className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Olive Invoice</span>
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </button>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 items-start">

            {/* Left: Context */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:sticky lg:top-32"
            >
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                We'd love to<br />hear from you.
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed mb-10">
                Have an idea that would make Olive Invoice better? Found something broken? Just want to say hello? We read every message.
              </p>

              <div className="space-y-5">
                {CATEGORIES.slice(0, 3).map(cat => {
                  const Icon = cat.icon
                  return (
                    <div key={cat.id} className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${cat.bg} ${cat.border}`}>
                        <Icon className={`w-5 h-5 ${cat.color}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm mb-0.5">{cat.label}</p>
                        <p className="text-gray-500 text-sm leading-relaxed">
                          {cat.id === 'Feature Request' && 'Tell us what would make your workflow better. We prioritize based on user demand.'}
                          {cat.id === 'Bug Report' && 'Help us squash issues fast. The more detail you share, the quicker we can fix it.'}
                          {cat.id === 'Question' && 'Not sure how something works? We are happy to help you get the most out of the app.'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-10 pt-8 border-t border-white/5 flex flex-col gap-3">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Clock className="w-4 h-4 text-gray-600" />
                  Usually responds within 24 hours
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Mail className="w-4 h-4 text-gray-600" />
                  admin@craytech-solutions.com
                </div>
              </div>
            </motion.div>

            {/* Right: Form */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="bg-[#0f1420] border border-white/5 rounded-3xl p-8 shadow-2xl shadow-black/30">
                <AnimatePresence mode="wait">
                  {success ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center text-center py-12 gap-5"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white mb-2">Message sent!</h2>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                          Thanks for reaching out. We'll get back to you at <span className="text-white font-medium">{email}</span> within 24 hours.
                        </p>
                      </div>
                      <button
                        onClick={onBack}
                        className="mt-2 px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-all"
                      >
                        Back to home
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-6"
                    >
                      <div>
                        <h2 className="text-xl font-bold text-white mb-1">Send a message</h2>
                        <p className="text-gray-500 text-sm">Fill in the form and we'll get back to you.</p>
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2.5">Category</label>
                        <div className="grid grid-cols-2 gap-2">
                          {CATEGORIES.map(cat => {
                            const Icon = cat.icon
                            const isSelected = category === cat.id
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => setCategory(cat.id)}
                                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                  isSelected
                                    ? `${cat.bg} ${cat.border} ${cat.color}`
                                    : 'bg-[#0b0f19] border-[#1f2937] text-gray-500 hover:border-[#374151] hover:text-gray-300'
                                }`}
                              >
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                {cat.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Name + Email */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1.5">Your name</label>
                          <input
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Jane Smith"
                            maxLength={100}
                            className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1.5">Email address</label>
                          <input
                            required
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="jane@example.com"
                            maxLength={200}
                            className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors"
                          />
                        </div>
                      </div>

                      {/* Message */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">
                          Message
                          <span className="ml-1 text-gray-600 font-normal">({message.length}/5000)</span>
                        </label>
                        <textarea
                          required
                          value={message}
                          onChange={e => setMessage(e.target.value)}
                          placeholder={
                            category === 'Feature Request' ? 'Describe the feature and why it would help your workflow…' :
                            category === 'Bug Report' ? 'What happened? Steps to reproduce, expected vs actual behaviour…' :
                            category === 'Question' ? 'What would you like to know?…' :
                            'What\'s on your mind?…'
                          }
                          rows={5}
                          minLength={10}
                          maxLength={5000}
                          className="w-full bg-[#0b0f19] border border-[#1f2937] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors resize-none"
                        />
                      </div>

                      {error && (
                        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                          {error}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-bold transition-all shadow-lg shadow-violet-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending…
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Message
                          </>
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
