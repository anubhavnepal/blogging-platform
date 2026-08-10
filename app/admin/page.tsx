'use client'

import React from 'react'
import { AdminControlCenter } from '@/components/admin/AdminControlCenter'
import { AuthModal } from '@/components/auth/AuthModal'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between">
      <AdminControlCenter />
      <AuthModal />
    </div>
  )
}
