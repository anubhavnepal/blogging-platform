'use client'

import React from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import { Heart, Bookmark, ArrowRight, ShieldCheck } from 'lucide-react'

export function HeroSpotlight() {
  const { posts, currentUser, toggleLikePost, toggleBookmark, isLoading } = useApp()
  
  if (isLoading) {
    return (
      <section className="pt-6 pb-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-[400px] w-full rounded-3xl bg-slate-900 border border-slate-800 animate-pulse flex items-center justify-center">
          <div className="w-7 h-7 rounded-full border-2 border-emerald-400/40 border-t-emerald-400 animate-spin" />
        </div>
      </section>
    )
  }

  const publishedPosts = posts.filter(p => p.isPublished)
  const featuredPost = publishedPosts.find(p => p.isFeatured) || publishedPosts[0]

  if (!featuredPost) return null

  const isLiked = currentUser?.userLikes?.includes(featuredPost.id) || false
  const isBookmarked = currentUser?.bookmarks?.includes(featuredPost.id) || false

  return (
    <section className="pt-6 pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Solid Architectural 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: Pure Image Card */}
          <div className="lg:col-span-6 relative min-h-[240px] sm:min-h-[300px] lg:min-h-[350px] rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl group">
            <img
              src={featuredPost.coverImage}
              alt={featuredPost.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>

          {/* Right Column: Clean Editorial Info Layout */}
          <div className="lg:col-span-6 rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-6 lg:p-7 flex flex-col justify-between shadow-xl">
            
            {/* Top Section: Meta & Headline */}
            <div className="space-y-3">
              
              {/* Clean Meta Row (No emojis or extra icons) */}
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="font-bold text-emerald-400 uppercase tracking-widest">
                  LATEST POST
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300 font-medium">
                  {featuredPost.category}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">
                  {featuredPost.readTime}
                </span>
              </div>

              {/* Title */}
              <Link href={`/posts/${featuredPost.id}`} className="block group">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug group-hover:text-emerald-400 transition-colors">
                  {featuredPost.title}
                </h1>
              </Link>

              {/* Excerpt */}
              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed line-clamp-3 font-normal">
                {featuredPost.excerpt}
              </p>
            </div>

            {/* Bottom Section: Author & Unified Actions */}
            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-4">
              
              {/* Author Profile */}
              <div className="flex items-center gap-3">
                <img
                  src={featuredPost.authorAvatar}
                  alt={featuredPost.authorName}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border border-emerald-500/40"
                />
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    {featuredPost.authorName}
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {new Date(featuredPost.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Interaction Bar */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleLikePost(featuredPost.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono font-bold transition ${
                    isLiked 
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-rose-400'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-rose-500' : ''}`} />
                  <span>{featuredPost.likesCount}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleBookmark(featuredPost.id)}
                  className={`p-2 rounded-xl border transition ${
                    isBookmarked 
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-amber-400'
                  }`}
                  title={isBookmarked ? 'Remove Bookmark' : 'Save Article'}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>

                <Link
                  href={`/posts/${featuredPost.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition shadow-lg shadow-emerald-950/50"
                >
                  <span>Read Post</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  )
}
