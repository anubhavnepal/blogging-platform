'use client'

import React from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import { 
  PenSquare, 
  Shield, 
  UserCheck, 
  Clock, 
  LogOut, 
  LogIn, 
  Sparkles,
  Search,
  BookOpen,
  Bookmark,
  Feather
} from 'lucide-react'

export function Navbar() {
  const { currentUser, siteConfig, setIsAuthModalOpen, setIsAuthorModalOpen, logout, searchQuery, setSearchQuery } = useApp()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md transition-all">
      {/* Announcement Banner */}
      {siteConfig.announcementBanner && (
        <div className="bg-slate-900 border-b border-slate-800 py-1.5 px-4 text-center text-xs text-emerald-400 font-medium flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{siteConfig.announcementBanner}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-md group-hover:scale-105 transition">
            C
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white tracking-tight group-hover:text-emerald-400 transition">
              Chronicle
            </span>
            <span className="text-[10px] text-slate-400 font-mono -mt-1 hidden sm:inline-block">
              PUBLICATION PLATFORM
            </span>
          </div>
        </Link>

        {/* Center Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search articles, topics, authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 text-sm bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition"
            />
          </div>
        </div>

        {/* Right Navigation & Auth Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-slate-900 transition"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Explore</span>
          </Link>

          {/* Bookmarks */}
          {currentUser && (
            <Link
              href="/bookmarks"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-slate-900 transition"
            >
              <Bookmark className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Bookmarks</span>
              {currentUser.bookmarks && currentUser.bookmarks.length > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 font-bold text-[10px] rounded-full">
                  {currentUser.bookmarks.length}
                </span>
              )}
            </Link>
          )}

          {/* Become Author CTA */}
          {currentUser && currentUser.role === 'reader' && currentUser.verificationStatus === 'none' && (
            <button
              onClick={() => setIsAuthorModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition"
            >
              <Feather className="w-3.5 h-3.5" />
              <span>Apply as Author</span>
            </button>
          )}

          {/* Pending Review Badge */}
          {currentUser && currentUser.verificationStatus === 'pending' && currentUser.role !== 'admin' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Pending Admin Approval</span>
            </div>
          )}

          {/* Rejected Status Badge */}
          {currentUser && currentUser.verificationStatus === 'rejected' && currentUser.role !== 'admin' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-red-500/10 text-red-300 border border-red-500/20">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              <span className="hidden sm:inline">Application Declined</span>
            </div>
          )}

          {/* Author Studio Link */}
          {(currentUser?.role === 'author' || currentUser?.role === 'admin') && (
            <Link
              href="/editor"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 transition"
            >
              <PenSquare className="w-3.5 h-3.5" />
              <span>Studio</span>
            </Link>
          )}

          {/* Admin Governance */}
          {currentUser?.role === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-300 bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/30 rounded-xl transition"
            >
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden lg:inline">Admin</span>
            </Link>
          )}

          {/* User Profile / Login */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-slate-800"
              />
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight">
                  {currentUser.fullName}
                </span>
                <span className="text-[10px] text-slate-400 capitalize">
                  {currentUser.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-400 rounded-xl hover:bg-slate-900 transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
