'use client'

import React from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import { Clock, Heart, ArrowUpRight, Flag, Bookmark, Loader2, Filter } from 'lucide-react'

const CATEGORIES = ['All', 'Engineering', 'Design', 'AI & Systems', 'Tutorials', 'Culture']

export function PostFeed() {
  const { posts, activeCategory, setActiveCategory, searchQuery, toggleLikePost, submitReport, currentUser, toggleBookmark, isLoading } = useApp()

  if (isLoading) {
    return (
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
        <p className="text-slate-400 text-sm font-medium font-mono">Fetching published articles...</p>
      </section>
    )
  }

  // Filter posts based on category & search query
  const publishedPosts = posts.filter(post => post.isPublished && post.status !== 'flagged')

  const filteredPosts = publishedPosts.filter(post => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesCategory && matchesSearch
  })

  return (
    <section className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
        
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <div className="flex items-center gap-1.5 pl-1 pr-2 text-xs text-slate-500 font-mono">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Topics:</span>
          </div>

          {CATEGORIES.map(category => {
            const isActive = activeCategory === category
            const count = category === 'All' 
              ? publishedPosts.length 
              : publishedPosts.filter(p => p.category === category).length

            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`px-3.5 py-1.5 text-xs font-mono rounded-xl whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-950/40'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{category}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  isActive ? 'bg-slate-950/20 text-slate-950 font-extrabold' : 'bg-slate-950 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Counter Meta */}
        <div className="text-right px-2 hidden lg:block">
          <span className="text-[11px] text-slate-500 font-mono">
            Showing <strong className="text-emerald-400 font-bold">{filteredPosts.length}</strong> of {publishedPosts.length} Publications
          </span>
        </div>

      </div>

      {/* Clean Full-Width Publication Grid (3 Columns) */}
      <div>
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80 my-6 space-y-3">
            <p className="text-slate-400 text-sm font-mono">No published articles match your current topic filter.</p>
            <button
              type="button"
              onClick={() => setActiveCategory('All')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-mono font-bold rounded-xl transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => {
              const isLiked = currentUser?.userLikes?.includes(post.id) || false
              const isBookmarked = currentUser?.bookmarks?.includes(post.id) || false

              return (
                <article
                  key={post.id}
                  className="group flex flex-col justify-between rounded-3xl border border-slate-800/90 bg-slate-900 overflow-hidden hover:border-emerald-500/40 transition-all duration-300 shadow-xl hover:shadow-emerald-950/20"
                >
                  <div>
                    {/* Cover Image & Category Badge */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg bg-slate-950/90 text-emerald-300 border border-emerald-500/30">
                          {post.category}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          submitReport(post.id, post.title, 'offensive', 'Flagged from post card feed.')
                          alert('Article reported to platform admins for moderation review.')
                        }}
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-950/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition border border-slate-800/60"
                        title="Report Article"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          {post.readTime}
                        </span>
                        <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>

                    {/* Article Info */}
                    <div className="p-5 space-y-3">
                      <Link href={`/posts/${post.id}`} className="block group/link">
                        <h3 className="text-base font-bold text-white group-hover/link:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                          {post.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-slate-300/80 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Footer Author & Actions */}
                  <div className="px-5 py-3.5 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-7 h-7 rounded-full object-cover border border-emerald-500/30"
                      />
                      <span className="text-xs font-bold text-slate-300 truncate max-w-[120px]">
                        {post.authorName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleBookmark(post.id)}
                        className={`p-1.5 rounded-lg transition ${
                          isBookmarked
                            ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                            : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
                        }`}
                        title={isBookmarked ? 'Remove Bookmark' : 'Save Article'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleLikePost(post.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono font-bold transition ${
                          isLiked
                            ? 'text-rose-400 bg-rose-500/10 border border-rose-500/30'
                            : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                        }`}
                        title={isLiked ? 'Unlike Article' : 'Like Article'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{post.likesCount}</span>
                      </button>

                      <Link
                        href={`/posts/${post.id}`}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

