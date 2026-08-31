'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import { 
  PenSquare, 
  Shield, 
  Clock, 
  LogOut, 
  LogIn, 
  Search,
  BookOpen,
  Bookmark,
  Feather,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

export function Navbar() {
  const { currentUser, siteConfig, setIsAuthModalOpen, setIsAuthorModalOpen, logout, searchQuery, setSearchQuery } = useApp()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close mobile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md transition-all">
      {/* Announcement Banner */}
      {siteConfig.announcementBanner && (
        <div className="bg-slate-900 border-b border-slate-800 py-1.5 px-4 text-center text-[11px] sm:text-xs text-emerald-400 font-medium flex items-center justify-center gap-2 truncate">
          <span className="truncate">{siteConfig.announcementBanner}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Full Site Name */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          {siteConfig.siteLogo ? (
            <img 
              src={siteConfig.siteLogo} 
              alt={siteConfig.siteName || 'Logo'} 
              className="w-9 h-9 rounded-xl object-cover shadow-md group-hover:scale-105 transition border border-slate-800 shrink-0"
            />
          ) : siteConfig.siteName ? (
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-md group-hover:scale-105 transition shrink-0">
              {siteConfig.siteName.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-slate-800 animate-pulse shrink-0" />
          )}
          <div className="flex flex-col">
            {siteConfig.siteName ? (
              <span className="text-lg sm:text-xl font-bold text-white tracking-tight group-hover:text-emerald-400 transition">
                {siteConfig.siteName}
              </span>
            ) : (
              <div className="h-5 w-28 bg-slate-800 rounded animate-pulse my-0.5" />
            )}
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

        {/* DESKTOP NAVIGATION (Visible on md and larger screens) */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-slate-900 transition"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>Explore</span>
          </Link>

          {/* Bookmarks */}
          {currentUser && (
            <Link
              href="/bookmarks"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-slate-900 transition"
            >
              <Bookmark className="w-4 h-4 text-emerald-400" />
              <span>Bookmarks</span>
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
              <span>Pending Admin Approval</span>
            </div>
          )}

          {/* Rejected Status Badge */}
          {currentUser && currentUser.verificationStatus === 'rejected' && currentUser.role !== 'admin' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-red-500/10 text-red-300 border border-red-500/20">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              <span>Application Declined</span>
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
              <span>Admin</span>
            </Link>
          )}

          {/* User Profile / Logout on Desktop */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser.fullName}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                }}
                className="w-8 h-8 rounded-full object-cover border border-slate-800"
              />
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight">
                  {currentUser.fullName}
                </span>
                <span className="text-[10px] text-slate-400 capitalize">
                  {currentUser.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-400 rounded-xl hover:bg-slate-900 transition ml-1"
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

        {/* MOBILE NAVIGATION (Visible on screens smaller than md) */}
        <div className="md:hidden flex items-center gap-2 shrink-0 relative" ref={dropdownRef}>
          {currentUser ? (
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-2 p-1.5 pl-2 pr-2.5 rounded-full border transition ${
                isDropdownOpen
                  ? 'bg-slate-800/90 border-emerald-500/50 text-white shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900/90 border-slate-800 text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser.fullName}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                }}
                className="w-7 h-7 rounded-full object-cover border border-slate-700/80 shrink-0"
              />
              <span className="text-xs font-bold text-white tracking-tight max-w-[100px] truncate">
                {currentUser.fullName}
              </span>
              {isDropdownOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow transition shrink-0"
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Floating Dropdown Menu */}
          {currentUser && isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-[#0c1017] border border-slate-800 rounded-2xl shadow-2xl z-50 p-2 space-y-1.5 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
              {/* User Header */}
              <div className="p-3 bg-[#070a0f] border border-slate-800/80 rounded-xl flex items-center gap-3">
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser.fullName}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                  }}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">{currentUser.fullName}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">@{currentUser.username || 'user'}</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full tracking-wider ${
                      currentUser.role === 'admin' 
                        ? 'bg-purple-950 text-purple-300 border border-purple-500/30' 
                        : currentUser.role === 'author'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {currentUser.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Application status notice on mobile */}
              {currentUser.verificationStatus === 'pending' && currentUser.role !== 'admin' && (
                <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-xs text-amber-300">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Author Application Pending</span>
                </div>
              )}
              {currentUser.verificationStatus === 'rejected' && currentUser.role !== 'admin' && (
                <div className="px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                  <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0"></span>
                  <span>Application Declined</span>
                </div>
              )}

              <div className="py-1 space-y-0.5">
                <Link
                  href="/"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl transition"
                >
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>Explore Articles</span>
                </Link>

                <Link
                  href="/bookmarks"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl transition"
                >
                  <div className="flex items-center gap-3">
                    <Bookmark className="w-4 h-4 text-emerald-400" />
                    <span>Saved Bookmarks</span>
                  </div>
                  {currentUser.bookmarks && currentUser.bookmarks.length > 0 && (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold text-[10px] rounded-full">
                      {currentUser.bookmarks.length}
                    </span>
                  )}
                </Link>

                {(currentUser.role === 'author' || currentUser.role === 'admin') && (
                  <Link
                    href="/editor"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition"
                  >
                    <PenSquare className="w-4 h-4" />
                    <span>Author Studio</span>
                  </Link>
                )}

                {currentUser.role === 'reader' && currentUser.verificationStatus === 'none' && (
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false)
                      setIsAuthorModalOpen(true)
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition text-left"
                  >
                    <Feather className="w-4 h-4" />
                    <span>Apply as Author</span>
                  </button>
                )}

                {currentUser.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-purple-300 hover:bg-purple-950/40 rounded-xl transition"
                  >
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
              </div>

              <div className="pt-1 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false)
                    logout()
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl transition text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
