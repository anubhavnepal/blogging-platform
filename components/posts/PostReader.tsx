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
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Articles</span>
      </Link>

      {/* Header Info */}
      <header className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {post.category}
          </span>
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            {post.readTime}
          </span>
          <span className="text-xs text-slate-500">&bull;</span>
          <span className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
          {post.title}
        </h1>

        <p className="text-lg text-slate-300/90 leading-relaxed font-normal italic border-l-2 border-emerald-500 pl-4 py-1">
          {post.excerpt}
        </p>

        {/* Author Bio Row */}
        <div className="flex items-center justify-between py-4 border-y border-slate-800/80">
          <div className="flex items-center gap-3">
            <img
              src={post.authorAvatar}
              alt={post.authorName}
              className="w-11 h-11 rounded-full object-cover border border-slate-700"
            />
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1">
                {post.authorName}
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </h3>
              <p className="text-xs text-slate-400">@{post.authorUsername}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleBookmark(post.id)}
              className={`p-2 rounded-xl border transition ${
                currentUser?.bookmarks?.includes(post.id)
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 hover:border-emerald-500/40 text-slate-400 hover:text-emerald-400'
              }`}
              title={currentUser?.bookmarks?.includes(post.id) ? 'Remove Bookmark' : 'Bookmark Article'}
            >
              <Bookmark className={`w-4 h-4 ${currentUser?.bookmarks?.includes(post.id) ? 'fill-emerald-400' : ''}`} />
            </button>

            <button
              onClick={() => toggleLikePost(post.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border transition text-xs font-semibold ${
                currentUser?.userLikes?.includes(post.id)
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-slate-900 border-slate-800 hover:border-rose-500/40 text-slate-300 hover:text-rose-400'
              }`}
              title={currentUser?.userLikes?.includes(post.id) ? 'Unlike Post' : 'Like Post'}
            >
              <Heart className={`w-4 h-4 ${currentUser?.userLikes?.includes(post.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
              <span>{post.likesCount}</span>
            </button>

            <button
              onClick={copyShareLink}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition"
              title="Share Article"
            >
              {isCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-400 transition"
              title="Report Inappropriate Content"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Cover Image */}
      <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden border border-slate-800">
        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
      </div>

      {/* Body Content */}
      <div 
        className="prose prose-invert prose-emerald max-w-none font-sans text-slate-200 text-base leading-relaxed"
        dangerouslySetInnerHTML={{ 
          __html: post.content.startsWith('<') 
            ? post.content 
            : post.content.replace(/\n/g, '<br />') 
        }}
      />

      {/* Article Tags */}
      <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-800">
        {post.tags.map(tag => (
          <span key={tag} className="px-3 py-1 text-xs font-mono text-slate-300 bg-slate-900 rounded-lg border border-slate-800">
            #{tag}
          </span>
        ))}
      </div>

      {/* Comments Section */}
      <section className="pt-10 border-t border-slate-800/80 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            Discussion ({postComments.length})
          </h2>
        </div>

        {/* Comment Form */}
        {currentUser ? (
          <form onSubmit={handleCommentSubmit} className="space-y-3">
            <textarea
              rows={3}
              placeholder="Add your thoughts or questions on this article..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="w-full p-4 text-sm bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition"
              >
                <span>Post Comment</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-center text-sm text-slate-400">
            Please sign in to leave a comment on this publication.
          </div>
        )}

        {/* Comment List */}
        <div className="space-y-4">
          {postComments.map(c => (
            <div key={c.id} className="p-4 bg-slate-900/40 border border-slate-800/60 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={c.authorAvatar} alt={c.authorName} className="w-7 h-7 rounded-full object-cover" />
                  <span className="text-xs font-bold text-white">{c.authorName}</span>
                </div>
                <span className="text-[11px] text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-9">{c.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="relative w-full max-w-md p-6 glass-panel rounded-2xl border border-slate-800 space-y-5">
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white">Report Inappropriate Content</h3>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reason for Report</label>
                <select
                  value={reportReason}
                  onChange={(e: any) => setReportReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
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
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
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
    </article>
  )
}
