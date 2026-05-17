import React from 'react'
import { motion } from 'framer-motion'
import {
  Receipt, LayoutGrid, Clock,
  ArrowRight, ShieldCheck, Zap, Star
} from 'lucide-react'
import { HeroMockup } from '@/components/landing/HeroMockup'

interface LandingPageProps {
  onLogin: () => void
  onRegister: () => void
  onContact: () => void
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister, onContact }) => {
  return (
    <div className="min-h-screen bg-[#080c14] text-white selection:bg-violet-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080c14]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-900/40">
              <Receipt className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Olive Invoice</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onContact}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Contact
            </button>
            <button
              onClick={onLogin}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={onRegister}
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-semibold transition-all shadow-lg shadow-violet-900/20"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Zap className="w-3 h-3" />
              The complete toolkit for freelancers
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              Organize projects.<br />Track time. Bill clients.
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Stop juggling spreadsheets and disparate tools. Olive Invoice combines Kanban planning, automated time tracking, and professional invoicing in one beautiful workspace.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={onRegister}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-lg font-bold transition-all shadow-xl shadow-violet-900/30 flex items-center justify-center gap-2 group"
              >
                Start for Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onLogin}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-lg font-bold transition-all"
              >
                Sign In
              </button>
            </div>
          </motion.div>

          {/* Hero Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-20"
          >
            <HeroMockup />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-[#0f1420]/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <LayoutGrid className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="text-xl font-bold">Plan with Kanban</h3>
              <p className="text-gray-400 leading-relaxed">
                Visualize your workflow with intuitive boards. Move tasks from "To Do" to "Done" and never lose track of a deliverable again.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold">One-Click Time Tracking</h3>
              <p className="text-gray-400 leading-relaxed">
                Log hours directly against your tasks. Accurate, effortless tracking ensures you get paid for every minute of your hard work.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Receipt className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold">Professional Invoicing</h3>
              <p className="text-gray-400 leading-relaxed">
                Convert logged hours into beautiful, branded invoices in seconds. Automated tax calculations and professional PDF exports included.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-400">Everything you need, nothing you don't.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Solo Plan */}
            <div className="p-8 rounded-3xl bg-[#0f1420] border border-white/5 flex flex-col">
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-400 mb-2">Solo</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$9</span>
                  <span className="text-gray-500 text-sm">/ month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <ShieldCheck className="w-4 h-4 text-violet-500" />
                  Unlimited clients & invoices
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <ShieldCheck className="w-4 h-4 text-violet-500" />
                  Full Kanban/Task board
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <ShieldCheck className="w-4 h-4 text-violet-500" />
                  One-click PDF invoices
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <ShieldCheck className="w-4 h-4 text-violet-500" />
                  Basic time reporting
                </li>
              </ul>
              <button 
                onClick={onRegister}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold transition-all"
              >
                Start Solo
              </button>
            </div>

            {/* Team/Pro Plan */}
            <div className="p-8 rounded-3xl bg-violet-600 border border-violet-500 flex flex-col relative overflow-hidden shadow-2xl shadow-violet-900/20">
              <div className="absolute top-4 right-4 bg-white/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white">
                Best Value
              </div>
              <div className="mb-8">
                <h3 className="text-lg font-bold text-violet-100 mb-2">Team / Pro</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$29</span>
                  <span className="text-violet-200 text-sm">/ month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-sm text-white">
                  <Star className="w-4 h-4 fill-white" />
                  Up to 5 team members
                </li>
                <li className="flex items-center gap-3 text-sm text-white">
                  <Star className="w-4 h-4 fill-white" />
                  Shared boards & collaboration
                </li>
                <li className="flex items-center gap-3 text-sm text-white">
                  <Star className="w-4 h-4 fill-white" />
                  Roles & permissions
                </li>
                <li className="flex items-center gap-3 text-sm text-white">
                  <Star className="w-4 h-4 fill-white" />
                  Team-wide activity history
                </li>
                <li className="flex items-center gap-3 text-sm text-white">
                  <Star className="w-4 h-4 fill-white" />
                  Integrated Stripe payments
                </li>
              </ul>
              <button 
                onClick={onRegister}
                className="w-full py-3 rounded-xl bg-white text-violet-600 font-bold hover:bg-gray-100 transition-all shadow-xl shadow-black/20"
              >
                Get Started with Team
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <Receipt className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex items-center gap-6">
              <button onClick={onContact} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                Contact
              </button>
            </div>
            <p className="text-gray-500 text-sm">© 2026 Olive Invoice. Built for the modern freelancer.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
