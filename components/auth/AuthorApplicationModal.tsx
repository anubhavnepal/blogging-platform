'use client'

import React, { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { X, Feather, Sparkles, CheckCircle2, Send, ShieldCheck } from 'lucide-react'

export function AuthorApplicationModal() {
  const { isAuthorModalOpen, setIsAuthorModalOpen, applyForAuthorStatus, currentUser } = useApp()
  const [pitch, setPitch] = useState('')

  if (!isAuthorModalOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    applyForAuthorStatus(pitch || 'Interested in contributing technical articles to Chronicle.')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 sm:p-8 overflow-hidden glass-panel rounded-3xl border border-slate-800 space-y-6">
        <button
          onClick={() => setIsAuthorModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-1">
            <Feather className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Become a Chronicle Author</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Join our curated network of engineers, architects, and technical creators.
          </p>
        </div>

        {/* Perks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Studio Access</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">Markdown editor with live preview & presets.</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Author Badge</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">Verified author status badge on all posts.</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Article Control</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">Manage drafts, updates, and analytics.</p>
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Briefly tell us what topics you plan to write about (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Next.js performance tuning, Supabase RLS security, AI agent frameworks..."
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAuthorModalOpen(false)}
              className="px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-950/40"
            >
              <span>Submit Author Application</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
