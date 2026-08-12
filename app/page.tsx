'use client'

import React from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { HeroSpotlight } from '@/components/home/HeroSpotlight'
import { PostFeed } from '@/components/home/PostFeed'
import { AuthModal } from '@/components/auth/AuthModal'
import { Footer } from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-300">
      <div>
        <Navbar />
        <HeroSpotlight />
        <PostFeed />
      </div>

      <AuthModal />

      <Footer />
    </main>
  )
}
