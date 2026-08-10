'use client'

import React, { Suspense } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { PostEditor } from '@/components/editor/PostEditor'
import { AuthModal } from '@/components/auth/AuthModal'

export default function EditorPage() {
  return (
    <main className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar />
        <Suspense fallback={<div className="max-w-5xl mx-auto py-12 text-center text-slate-400">Loading Studio...</div>}>
          <PostEditor />
        </Suspense>
      </div>
      <AuthModal />
    </main>
  )
}
