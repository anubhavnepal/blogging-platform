'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { useApp } from '@/context/AppContext'
import { 
  Clock, 
  Eye, 
  Heart, 
  Share2, 
  Flag, 
  ArrowLeft, 
  MessageSquare, 
  Send,
  ShieldCheck,
  CheckCircle2,
  X,
  Bookmark
} from 'lucide-react'

export function PostReader({ postId }: { postId: string }) {
  const { posts, comments, addComment, toggleLikePost, submitReport, currentUser, toggleBookmark } = useApp()
  const post = posts.find(p => p.id === postId)

  const [commentInput, setCommentInput] = useState('')
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [reportReason, setReportReason] = useState<'spam' | 'offensive' | 'misinformation' | 'plagiarism'>('offensive')
  const [reportDetails, setReportDetails] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Article Not Found</h2>
        <p className="text-slate-400 mb-6">The article you are searching for might have been moved or removed by moderators.</p>
        <Link href="/" className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-semibold rounded-xl inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Feed
        </Link>
      </div>
    )
  }

  const postComments = comments[post.id] || []

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentInput.trim()) return
    addComment(post.id, commentInput)
    setCommentInput('')
  }

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitReport(post.id, post.title, reportReason, reportDetails)
    setIsReportModalOpen(false)
    setReportDetails('')
    alert('Thank you for helping keep Chronicle safe. Your report has been submitted to the Admin Moderation queue.')
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 relative">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Sticky Vertical Action Sidebar */}
        <aside className="fixed left-4 bottom-6 md:sticky md:top-24 z-30 flex md:flex-col items-center gap-3 p-2 bg-[#121824]/90 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-xl">
          <Link
            href="/"
            className="p-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <button
            onClick={() => toggleLikePost(post.id)}
            className={`relative p-3 rounded-xl transition ${
              currentUser?.userLikes?.includes(post.id)
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50'
            }`}
            title="Like Post"
          >
            <Heart className={`w-4 h-4 ${currentUser?.userLikes?.includes(post.id) ? 'fill-emerald-400' : ''}`} />
            {post.likesCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] px-1 bg-emerald-500 text-slate-950 font-bold text-[9px] rounded-full flex items-center justify-center">
                {post.likesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => toggleBookmark(post.id)}
            className={`p-3 rounded-xl transition ${
              currentUser?.bookmarks?.includes(post.id)
                ? 'text-amber-400 bg-amber-500/10'
                : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800/50'
            }`}
            title="Bookmark"
          >
            <Bookmark className={`w-4 h-4 ${currentUser?.bookmarks?.includes(post.id) ? 'fill-amber-400' : ''}`} />
          </button>

          <button
            onClick={copyShareLink}
            className="p-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition"
            title="Share"
          >
            {isCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="p-3 text-slate-400 hover:text-rose-400 hover:bg-slate-800/50 rounded-xl transition"
            title="Report"
          >
            <Flag className="w-4 h-4" />
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 space-y-6 w-full">
          {/* Top Meta & Author Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            {/* Left: Category & Read Stats */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-[11px] font-semibold rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                {post.category}
              </span>
              <span className="px-3 py-1 text-[11px] text-slate-400 bg-[#121824] border border-slate-800/80 rounded-full flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-slate-400" />
                {post.readTime}
              </span>
              <span className="px-3 py-1 text-[11px] text-slate-400 bg-[#121824] border border-slate-800/80 rounded-full">
                {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {/* Right: Author Badge (Clean, frameless inline style) */}
            <div className="flex items-center gap-2 text-xs">
              <img
                src={post.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={post.authorName}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                }}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-emerald-500/40"
              />
              <span className="font-semibold text-slate-200 flex items-center gap-1">
                {post.authorName}
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </span>
              <span className="text-slate-600 font-sans">•</span>
              <span className="text-slate-400 font-mono text-[11px]">@{post.authorUsername}</span>
            </div>
          </div>

          {/* Unified Article Card Container (Title, Cover Image & Content inside one card) */}
          <article className="p-6 sm:p-10 bg-[#0b0f17] border border-slate-800/80 rounded-2xl space-y-8">
            {/* Title Section */}
            <header>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
                {post.title}
              </h1>
            </header>

            {/* Full-width Feature Cover Image (if available) */}
            {post.coverImage && (
              <div className="relative h-64 sm:h-96 w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950/50">
                <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Body Content */}
            <div 
              className="prose prose-invert prose-emerald max-w-none text-slate-300 text-sm sm:text-base leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: (post.content || '').startsWith('<') 
                  ? (post.content || '') 
                  : (post.content || '').replace(/\n/g, '<br />') 
              }}
            />

            {/* Article Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-800/60">
                {post.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 text-xs font-mono text-slate-400 bg-slate-900 rounded-lg border border-slate-800">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </article>

          {/* Discussion Card Section */}
          <section className="p-6 sm:p-8 bg-[#0b0f17] border border-slate-800/80 rounded-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                Discussion
                <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded-full">
                  {postComments.length}
                </span>
              </h2>
            </div>

            {/* Comment Input */}
            {currentUser ? (
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <div className="relative">
                  <textarea
                    rows={4}
                    placeholder="Add your thoughts or questions on this article..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="w-full p-4 text-xs sm:text-sm bg-[#070a0f] border border-slate-800/80 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition"
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition shadow-lg shadow-emerald-500/20"
                  >
                    <span>Post Comment</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-[#070a0f] border border-slate-800/80 rounded-xl text-center text-xs text-slate-400">
                Please sign in to leave a comment on this publication.
              </div>
            )}

            {/* Existing Comments List */}
            {postComments.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-800/60">
                {postComments.map(c => (
                  <div key={c.id} className="p-4 bg-[#070a0f] border border-slate-800/60 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={c.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                          alt={c.authorName}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                          }}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs font-bold text-white">{c.authorName}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-8">{c.content}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md p-6 bg-[#0b0f17] rounded-2xl border border-slate-800 space-y-5">
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white">Report Inappropriate Content</h3>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reason for Report</label>
                <select
                  value={reportReason}
                  onChange={(e: any) => setReportReason(e.target.value)}
                  className="w-full p-2.5 bg-[#070a0f] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="offensive">Offensive / Hate Speech / Harassment</option>
                  <option value="spam">Spam / Unsolicited Promotion</option>
                  <option value="misinformation">Misinformation / Dangerous Content</option>
                  <option value="plagiarism">Plagiarism / Intellectual Property</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Additional Details</label>
                <textarea
                  rows={3}
                  placeholder="Provide context for admin review..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  className="w-full p-3 bg-[#070a0f] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white font-bold text-xs rounded-xl"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
