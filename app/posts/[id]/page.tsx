'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { PostReader } from '@/components/posts/PostReader'
import { AuthModal } from '@/components/auth/AuthModal'

export default function PostDetailPage() {
  const params = useParams()
  const postId = params.id as string

  return (
    <main className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar />
        <PostReader postId={postId} />
      </div>
      <AuthModal />
    </main>
  )
}
