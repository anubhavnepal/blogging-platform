'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { 
  ShieldCheck, 
  UserCheck, 
  Sliders, 
  Flag, 
  FileText, 
  ArrowLeft, 
  LogOut, 
  Globe,
  Sparkles,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

interface AdminSidebarProps {
  activeTab: 'verifications' | 'config' | 'moderation'
  setActiveTab: (tab: 'verifications' | 'config' | 'moderation') => void
  pendingUsersCount: number
  pendingReportsCount: number
}

export function AdminSidebar({
  activeTab,
  setActiveTab,
  pendingUsersCount,
  pendingReportsCount
}: AdminSidebarProps) {
  const { currentUser, logout, siteConfig } = useApp()

  return (
    <aside className="w-full lg:w-64 bg-[#080B11] border-b lg:border-b-0 lg:border-r border-slate-800/90 flex flex-col justify-between shrink-0 p-5 select-none lg:sticky lg:top-0 lg:h-screen z-30">
      {/* Top Section */}
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="pb-4 border-b border-slate-800/80">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-inner group-hover:border-purple-500/70 transition">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              {siteConfig.siteName ? (
                <span className="font-bold text-white text-sm block tracking-tight">
                  {siteConfig.siteName}
                </span>
              ) : (
                <div className="h-4 w-24 bg-slate-800 rounded animate-pulse my-1" />
              )}
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">
                Admin Console
              </span>
            </div>
          </Link>
        </div>

        {/* Admin User Profile Card - Clearly Separated */}
        {currentUser && (
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex items-center gap-3 shadow-sm">
            <img 
              src={currentUser.avatarUrl} 
              alt={currentUser.fullName} 
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover border border-purple-500/40 shrink-0"
            />
            <div className="truncate flex-1">
              <h4 className="text-xs font-bold text-white truncate">{currentUser.fullName}</h4>
              <p className="text-[10px] text-purple-300 font-mono font-medium truncate">@{currentUser.username}</p>
            </div>
          </div>
        )}

        {/* Navigation Menu Hierarchy */}
        <nav className="space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
            Control Center
          </div>

          {/* 1. Authors & Users */}
          <button
            onClick={() => setActiveTab('verifications')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'verifications'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4" />
              <span>Authors & Users</span>
            </div>
            {pendingUsersCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950">
                {pendingUsersCount}
              </span>
            )}
          </button>

          {/* 2. Content Moderation */}
          <button
            onClick={() => setActiveTab('moderation')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'moderation'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Flag className="w-4 h-4" />
              <span>Post Reports</span>
            </div>
            {pendingReportsCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500 text-white">
                {pendingReportsCount}
              </span>
            )}
          </button>

          {/* 3. Settings */}
          <button
            onClick={() => setActiveTab('config')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'config'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4" />
              <span>Site Settings</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Footer Navigation Actions - Fixed at Bottom */}
      <div className="space-y-2 pt-4 border-t border-slate-800/80 mt-6">
        <Link
          href="/"
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900/80 transition"
        >
          <ArrowLeft className="w-4 h-4 text-purple-400" />
          <span>Back to Site</span>
        </Link>

        {currentUser && (
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </aside>
  )
}
