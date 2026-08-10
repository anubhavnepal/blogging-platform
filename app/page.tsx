'use client'

import React from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { HeroSpotlight } from '@/components/home/HeroSpotlight'
import { PostFeed } from '@/components/home/PostFeed'
import { AuthModal } from '@/components/auth/AuthModal'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-300">
      <div>
        <Navbar />
        {/* Hidden/Semantic header for search crawlers & Google OAuth verification bot */}
        <div className="sr-only">
          <h1>Chronicle</h1>
          <p>Chronicle is an open publication platform for engineers, creators, and technical writers to read, write, and share articles.</p>
        </div>
        <HeroSpotlight />
        <PostFeed />
      </div>

      <AuthModal />

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800/80 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md gradient-accent flex items-center justify-center text-slate-950 font-bold text-xs">C</div>
            <span className="font-bold text-slate-300">Chronicle Publication Platform</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="/privacy" className="hover:text-emerald-400 transition-colors font-medium">Privacy Policy</a>
            <span>•</span>
            <p>© {new Date().getFullYear()} Chronicle. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
