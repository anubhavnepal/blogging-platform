'use client'

import React from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'

export function Footer() {
  const { siteConfig, isLoading } = useApp()

  if (isLoading) {
    return (
      <footer className="mt-16 border-t border-slate-800/80 bg-slate-950 py-8 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-slate-800 animate-pulse" />
            <div className="h-4 w-24 bg-slate-800 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-4 w-20 bg-slate-800 rounded animate-pulse" />
            <div className="h-4 w-40 bg-slate-800 rounded animate-pulse" />
          </div>
        </div>
      </footer>
    )
  }

  const displayName = siteConfig.siteName || 'Chronicle'

  return (
    <footer className="mt-16 border-t border-slate-800/80 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {siteConfig.siteLogo ? (
            <img 
              src={siteConfig.siteLogo} 
              alt={displayName} 
              className="w-5 h-5 rounded-md object-cover border border-slate-800"
            />
          ) : (
            <div className="w-5 h-5 rounded-md bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-bold text-slate-300">{displayName}</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <Link href="/privacy" className="hover:text-emerald-400 transition-colors font-medium">
            Privacy Policy
          </Link>
          <span>•</span>
          <p>© {new Date().getFullYear()} {displayName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
