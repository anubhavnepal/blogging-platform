'use client'

import React from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import { Sparkles, Clock, Heart, Bookmark, ArrowRight, ShieldCheck } from 'lucide-react'

export function HeroSpotlight() {
  const { posts, currentUser, toggleLikePost, toggleBookmark, isLoading } = useApp()
  
  if (isLoading) {
    return (
      <section className="relative overflow-hidden pt-8 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-[380px] w-full rounded-3xl bg-slate-900/60 border border-slate-800/80 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-400/40 border-t-emerald-400 animate-spin" />
        </div>
      </section>
    )
  }

  const featuredPost = posts.find(p => p.isFeatured && p.isPublished) || posts[0]

  if (!featuredPost) return null

  const isLiked = currentUser?.userLikes?.includes(featuredPost.id) || false
  const isBookmarked = currentUser?.bookmarks?.includes(featuredPost.id) || false

  return (
    <section className="relative overflow-hidden pt-8 pb-12">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-stretch gap-8 glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden">
          
          {/* Cover Image Spotlight */}
          <div className="w-full lg:w-1/2 relative min-h-[260px] sm:min-h-[340px] rounded-2xl overflow-hidden group">
            <img
              src={featuredPost.coverImage}
              alt={featuredPost.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-semibold tracking-wide uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Spotlight Article
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-300/80">
              <span className="px-2.5 py-1 bg-slate-950 text-emerald-300 rounded-lg border border-slate-800">
                {featuredPost.category}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {featuredPost.readTime}
              </span>
            </div>
          </div>

          {/* Article Info & CTA */}
          <div className="w-full lg:w-1/2 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={featuredPost.authorAvatar}
                  alt={featuredPost.authorName}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-1">
                    {featuredPost.authorName}
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </h4>
                  <p className="text-xs text-slate-400">@{featuredPost.authorUsername}</p>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight group-hover:text-emerald-400 transition">
                {featuredPost.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-300/90 line-clamp-3 leading-relaxed">
                {featuredPost.excerpt}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <button
                  onClick={() => toggleLikePost(featuredPost.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
                    isLiked 
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 font-bold' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-rose-500' : ''}`} />
                  <span>{featuredPost.likesCount} Likes</span>
                </button>

                <button
                  onClick={() => toggleBookmark(featuredPost.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
                    isBookmarked 
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/30'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-amber-400' : ''}`} />
                  <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
                </button>
              </div>

              <Link
                href={`/posts/${featuredPost.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 transition shadow-lg shadow-emerald-950/40 group"
              >
                <span>Read Story</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
