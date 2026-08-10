'use client'

import React from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import { Bookmark, Clock, ArrowRight, Trash2, BookOpen } from 'lucide-react'

export function BookmarksView() {
  const { currentUser, posts, toggleBookmark, setIsAuthModalOpen } = useApp()

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 glass-panel rounded-2xl text-center space-y-4">
        <Bookmark className="w-12 h-12 text-emerald-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Sign In to View Bookmarks</h2>
        <p className="text-sm text-slate-400">
          Save your favorite technical publications and read them anytime across devices.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-6 py-2.5 bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg"
        >
          Sign In as Subscriber
        </button>
      </div>
    )
  }

  const userBookmarkIds = currentUser.bookmarks || []
  const bookmarkedPosts = posts.filter(p => userBookmarkIds.includes(p.id))

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Bookmark className="w-7 h-7 text-emerald-400" />
            Your Saved Reading List
          </h1>
          <p className="text-sm text-slate-400">
            Bookmarked articles for <strong>{currentUser.fullName}</strong> ({userBookmarkIds.length} saved)
          </p>
        </div>

        <Link
          href="/"
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 inline-flex items-center gap-1.5"
        >
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>Browse More</span>
        </Link>
      </div>

      {/* Bookmarks List */}
      {bookmarkedPosts.length === 0 ? (
        <div className="p-12 text-center glass-card rounded-2xl border border-slate-800 space-y-4">
          <p className="text-slate-400 text-base">You haven't bookmarked any articles yet.</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the bookmark icon on any article card or reader view to save posts for later reading.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl"
          >
            Explore Feed
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookmarkedPosts.map(post => (
            <article
              key={post.id}
              className="flex flex-col justify-between glass-card rounded-2xl border border-slate-800 p-5 space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded bg-slate-950 text-emerald-300 border border-emerald-500/20">
                    {post.category}
                  </span>
                  <button
                    onClick={() => toggleBookmark(post.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Link href={`/posts/${post.id}`}>
                  <h3 className="text-lg font-bold text-white hover:text-emerald-400 transition line-clamp-2">
                    {post.title}
                  </h3>
                </Link>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <img src={post.authorAvatar} alt={post.authorName} className="w-6 h-6 rounded-full object-cover" />
                  <span className="font-semibold text-slate-300">{post.authorName}</span>
                </div>

                <Link
                  href={`/posts/${post.id}`}
                  className="text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
