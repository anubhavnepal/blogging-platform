'use client'

import React from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import { Clock, Heart, Eye, ArrowUpRight, MessageSquare, Flag, Bookmark, Loader2 } from 'lucide-react'

const CATEGORIES = ['All', 'Engineering', 'Design', 'AI & Systems', 'Tutorials', 'Culture']

export function PostFeed() {
  const { posts, activeCategory, setActiveCategory, searchQuery, toggleLikePost, submitReport, currentUser, toggleBookmark, isLoading } = useApp()

  if (isLoading) {
    return (
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
        <p className="text-slate-400 text-sm font-medium">Fetching real publications...</p>
      </section>
    )
  }

  // Filter posts based on category & search query
  const filteredPosts = posts.filter(post => {
    if (!post.isPublished || post.status === 'flagged') return false
    
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesCategory && matchesSearch
  })

  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Category Pills & Controls */}
      <div className="flex items-center justify-between gap-4 mb-8 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2">
          {CATEGORIES.map(category => {
            const isActive = activeCategory === category
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-semibold'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800/80 hover:text-white'
                }`}
              >
                {category}
              </button>
            )
          })}
        </div>

        <span className="text-xs text-slate-500 font-mono hidden sm:inline-block">
          Showing {filteredPosts.length} Articles
        </span>
      </div>

      {/* Grid Layout */}
      {filteredPosts.length === 0 ? (
        <div className="p-12 text-center glass-card rounded-2xl border border-slate-800/60 my-6">
          <p className="text-slate-400 text-base">No articles found matching your filter parameters.</p>
          <button
            onClick={() => {
              setActiveCategory('All')
            }}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold rounded-xl transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map(post => (
            <article
              key={post.id}
              className="group flex flex-col justify-between glass-card rounded-2xl border border-slate-800/80 bg-slate-900/50 overflow-hidden hover:border-emerald-500/40 transition-all duration-300"
            >
              <div>
                {/* Cover Image */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-950 text-emerald-300 border border-emerald-500/20">
                      {post.category}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      submitReport(post.id, post.title, 'offensive', 'Flagged from post card feed.')
                      alert('Post reported for admin moderation review.')
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-950/70 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
                    title="Report Inappropriate Content"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Article Content */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{post.readTime}</span>
                    <span>&bull;</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>

                  <Link href={`/posts/${post.id}`}>
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {post.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-950/60 rounded border border-slate-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Author Footer & Interactivity */}
              <div className="px-5 py-4 border-t border-slate-800/80 bg-slate-950/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="w-7 h-7 rounded-full object-cover border border-slate-700"
                  />
                  <span className="text-xs font-semibold text-slate-300 truncate max-w-[100px]">
                    {post.authorName}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleBookmark(post.id)}
                    className={`p-1.5 rounded-lg transition flex items-center gap-1 ${
                      currentUser?.bookmarks?.includes(post.id)
                        ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
                    }`}
                    title={currentUser?.bookmarks?.includes(post.id) ? 'Remove Bookmark' : 'Save to Bookmarks'}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${currentUser?.bookmarks?.includes(post.id) ? 'fill-emerald-400' : ''}`} />
                  </button>

                  <button
                    onClick={() => toggleLikePost(post.id)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition ${
                      currentUser?.userLikes?.includes(post.id)
                        ? 'text-rose-400 bg-rose-500/10 border border-rose-500/30'
                        : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                    }`}
                    title={currentUser?.userLikes?.includes(post.id) ? 'Unlike Post' : 'Like Post'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${currentUser?.userLikes?.includes(post.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span className="font-semibold">{post.likesCount}</span>
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
          ))}
        </div>
      )}
    </section>
  )
}
