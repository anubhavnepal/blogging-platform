'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { useApp } from '@/context/AppContext'
import type { Comment } from '@/lib/mock-data'
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
  Bookmark,
  CornerDownRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface CommentItemProps {
  comment: Comment
  allComments: Comment[]
  postId: string
  depth?: number
  replyingToId: string | null
  replyTargetAuthor: string
  replyInput: string
  collapsedThreads: Record<string, boolean>
  currentUser: any
  addComment: (postId: string, content: string, parentId?: string | null) => void | Promise<void>
  onStartReply: (commentId: string, authorName: string) => void
  onCancelReply: () => void
  onReplyInputChange: (val: string) => void
  onToggleCollapse: (commentId: string) => void
  onOpenAuthModal: () => void
}

function CommentItem({
  comment,
  allComments,
  postId,
  depth = 0,
  replyingToId,
  replyTargetAuthor,
  replyInput,
  collapsedThreads,
  currentUser,
  addComment,
  onStartReply,
  onCancelReply,
  onReplyInputChange,
  onToggleCollapse,
  onOpenAuthModal
}: CommentItemProps) {
  const childReplies = allComments.filter(r => r.parentId === comment.id)
  const isReplying = replyingToId === comment.id
  const isCollapsed = collapsedThreads[comment.id]
  const parentComment = comment.parentId ? allComments.find(p => p.id === comment.parentId) : null

  return (
    <div className={`space-y-2.5 sm:space-y-3 ${depth === 0 ? 'p-3.5 sm:p-4 bg-[#070a0f] border border-slate-800/60 rounded-xl' : 'p-2.5 sm:p-3 bg-[#0b0f17] border border-slate-800/50 rounded-xl'}`}>
      {/* Comment Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={comment.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
            alt={comment.authorName}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
            }}
            className={`${depth === 0 ? 'w-6 h-6 sm:w-7 sm:h-7' : 'w-5 h-5'} rounded-full object-cover border border-slate-700/80 shrink-0`}
          />
          <span className="text-[11px] sm:text-xs font-bold text-white tracking-tight truncate">{comment.authorName}</span>
          {parentComment && (
            <span className="text-[9px] sm:text-[10px] text-emerald-400/80 font-mono truncate max-w-[90px] sm:max-w-none">@{parentComment.authorName}</span>
          )}
        </div>
        <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono shrink-0">{new Date(comment.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Comment Content */}
      <p className={`text-xs ${depth === 0 ? 'sm:text-sm' : ''} text-slate-300 leading-relaxed ${depth === 0 ? 'sm:pl-9' : 'sm:pl-7'} break-words`}>
        {comment.content}
      </p>

      {/* Actions */}
      <div className={`${depth === 0 ? 'sm:pl-9' : 'sm:pl-7'} flex items-center gap-3 sm:gap-4`}>
        <button
          type="button"
          onClick={() => {
            if (!currentUser) {
              onOpenAuthModal()
              return
            }
            if (isReplying) {
              onCancelReply()
            } else {
              onStartReply(comment.id, comment.authorName)
            }
          }}
          className="text-[10px] sm:text-[11px] font-semibold text-emerald-400/90 hover:text-emerald-300 flex items-center gap-1 transition"
        >
          <CornerDownRight className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
          <span>Reply</span>
        </button>

        {childReplies.length > 0 && (
          <button
            type="button"
            onClick={() => onToggleCollapse(comment.id)}
            className="text-[10px] sm:text-[11px] font-medium text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
          >
            {isCollapsed ? (
              <>
                <span>Show {childReplies.length} {childReplies.length === 1 ? 'reply' : 'replies'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </>
            ) : (
              <>
                <span>Hide replies ({childReplies.length})</span>
                <ChevronUp className="w-3 h-3 text-slate-400" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Inline Reply Form */}
      {isReplying && (
        <div className={`mt-2.5 sm:mt-3 ${depth === 0 ? 'sm:pl-9' : 'sm:pl-7'}`}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!replyInput.trim()) return
              addComment(postId, replyInput, comment.id)
              onCancelReply()
            }}
            className="p-2.5 sm:p-3 bg-[#070a0f] border border-emerald-500/30 rounded-xl space-y-2"
          >
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-medium truncate">
                Replying to <strong className="text-white truncate">@{replyTargetAuthor || comment.authorName}</strong>
              </span>
              <button
                type="button"
                onClick={onCancelReply}
                className="hover:text-slate-200 shrink-0 ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea
              rows={2}
              value={replyInput}
              onChange={(e) => onReplyInputChange(e.target.value)}
              placeholder={`Write your reply to @${replyTargetAuthor || comment.authorName}...`}
              className="w-full p-2.5 text-xs bg-[#0b0f17] border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancelReply}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition"
              >
                <span>Post Reply</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recursive Child Replies */}
      {childReplies.length > 0 && !isCollapsed && (
        <div className={`mt-2.5 sm:mt-3 ${depth < 3 ? 'pl-2 sm:pl-5 border-l border-emerald-500/30 sm:border-l-2 sm:border-slate-800/80' : 'pl-1.5 sm:pl-3 border-l border-slate-800/40'} space-y-2.5 sm:space-y-3`}>
          {childReplies.map(child => (
            <CommentItem
              key={child.id}
              comment={child}
              allComments={allComments}
              postId={postId}
              depth={depth + 1}
              replyingToId={replyingToId}
              replyTargetAuthor={replyTargetAuthor}
              replyInput={replyInput}
              collapsedThreads={collapsedThreads}
              currentUser={currentUser}
              addComment={addComment}
              onStartReply={onStartReply}
              onCancelReply={onCancelReply}
              onReplyInputChange={onReplyInputChange}
              onToggleCollapse={onToggleCollapse}
              onOpenAuthModal={onOpenAuthModal}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function PostReader({ postId }: { postId: string }) {
  const { posts, comments, addComment, toggleLikePost, submitReport, currentUser, toggleBookmark, setIsAuthModalOpen } = useApp()
  const post = posts.find(p => p.id === postId)

  const [commentInput, setCommentInput] = useState('')
  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [replyTargetAuthor, setReplyTargetAuthor] = useState<string>('')
  const [replyInput, setReplyInput] = useState('')
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(5)
  const [collapsedThreads, setCollapsedThreads] = useState<Record<string, boolean>>({})
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
    <div className="max-w-5xl mx-auto px-3.5 sm:px-6 py-4 sm:py-8 pb-28 md:pb-12 relative">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Sticky Vertical Action Sidebar (Pill on mobile, vertical bar on desktop) */}
        <aside className="fixed bottom-4 left-1/2 -translate-x-1/2 md:translate-x-0 md:static md:left-auto md:bottom-auto md:sticky md:top-24 z-40 flex flex-row md:flex-col items-center gap-1.5 sm:gap-3 p-1.5 sm:p-2 bg-[#121824]/95 backdrop-blur-md border border-slate-800/90 rounded-full md:rounded-2xl shadow-2xl max-w-[calc(100vw-2rem)]">
          <Link
            href="/"
            className="p-2.5 sm:p-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-full md:rounded-xl transition"
            title="Back to Feed"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <button
            onClick={() => toggleLikePost(post.id)}
            className={`relative p-2.5 sm:p-3 rounded-full md:rounded-xl transition ${
              currentUser?.userLikes?.includes(post.id)
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50'
            }`}
            title="Like Post"
          >
            <Heart className={`w-4 h-4 ${currentUser?.userLikes?.includes(post.id) ? 'fill-emerald-400' : ''}`} />
            {post.likesCount > 0 && (
              <span className="absolute -top-1 -right-1 md:top-1.5 md:right-1.5 min-w-[14px] h-[14px] px-1 bg-emerald-500 text-slate-950 font-bold text-[9px] rounded-full flex items-center justify-center">
                {post.likesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => toggleBookmark(post.id)}
            className={`p-2.5 sm:p-3 rounded-full md:rounded-xl transition ${
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
            className="p-2.5 sm:p-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-full md:rounded-xl transition"
            title="Share Link"
          >
            {isCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="p-2.5 sm:p-3 text-slate-400 hover:text-rose-400 hover:bg-slate-800/50 rounded-full md:rounded-xl transition"
            title="Report Content"
          >
            <Flag className="w-4 h-4" />
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 space-y-4 sm:space-y-6 w-full min-w-0">
          {/* Top Meta & Author Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs font-mono pb-1">
            {/* Left: Category & Read Stats */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[11px] font-semibold rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                {post.category}
              </span>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[11px] text-slate-400 bg-[#121824] border border-slate-800/80 rounded-full flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-slate-400" />
                {post.readTime}
              </span>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[11px] text-slate-400 bg-[#121824] border border-slate-800/80 rounded-full">
                {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {/* Right: Author Badge */}
            <div className="flex items-center gap-2 text-xs">
              <img
                src={post.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={post.authorName}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                }}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-emerald-500/40 shrink-0"
              />
              <span className="font-semibold text-slate-200 flex items-center gap-1 truncate">
                {post.authorName}
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </span>
              <span className="text-slate-600 font-sans">•</span>
              <span className="text-slate-400 font-mono text-[11px] truncate">@{post.authorUsername}</span>
            </div>
          </div>

          {/* Unified Article Card Container */}
          <article className="p-4 sm:p-8 md:p-10 bg-[#0b0f17] border border-slate-800/80 rounded-2xl space-y-5 sm:space-y-8">
            {/* Title Section */}
            <header>
              <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight break-words">
                {post.title}
              </h1>
            </header>

            {/* Full-width Feature Cover Image */}
            {post.coverImage && (
              <div className="relative h-48 sm:h-80 md:h-96 w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950/50">
                <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Body Content */}
            <div 
              className="prose prose-invert prose-emerald max-w-none text-slate-300 text-sm sm:text-base leading-relaxed break-words overflow-hidden"
              dangerouslySetInnerHTML={{ 
                __html: (post.content || '').startsWith('<') 
                  ? (post.content || '') 
                  : (post.content || '').replace(/\n/g, '<br />') 
              }}
            />

            {/* Article Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-4 sm:pt-6 border-t border-slate-800/60">
                {post.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 text-[11px] sm:text-xs font-mono text-slate-400 bg-slate-900 rounded-lg border border-slate-800">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </article>

          {/* Discussion Card Section */}
          <section className="p-4 sm:p-8 bg-[#0b0f17] border border-slate-800/80 rounded-2xl space-y-5 sm:space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                Discussion
                <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded-full">
                  {postComments.length}
                </span>
              </h2>
            </div>

            {/* Comment Input */}
            {currentUser ? (
              <form onSubmit={handleCommentSubmit} className="space-y-3 sm:space-y-4">
                <div className="relative">
                  <textarea
                    rows={3}
                    placeholder="Add your thoughts or questions on this article..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="w-full p-3 sm:p-4 text-xs sm:text-sm bg-[#070a0f] border border-slate-800/80 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition"
                  />
                </div>
                <div className="flex justify-end pt-0.5">
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
              <div className="space-y-4 pt-4 border-t border-slate-800/60">
                {(() => {
                  const topLevelComments = postComments.filter(c => !c.parentId)
                  const visibleTopLevel = topLevelComments.slice(0, visibleCommentsCount)
                  const remainingCount = topLevelComments.length - visibleCommentsCount

                  return (
                    <>
                      {visibleTopLevel.map(c => (
                        <CommentItem
                          key={c.id}
                          comment={c}
                          allComments={postComments}
                          postId={post.id}
                          depth={0}
                          replyingToId={replyingToId}
                          replyTargetAuthor={replyTargetAuthor}
                          replyInput={replyInput}
                          collapsedThreads={collapsedThreads}
                          currentUser={currentUser}
                          addComment={addComment}
                          onStartReply={(commentId, authorName) => {
                            setReplyingToId(commentId)
                            setReplyTargetAuthor(authorName)
                            setReplyInput('')
                          }}
                          onCancelReply={() => {
                            setReplyingToId(null)
                            setReplyTargetAuthor('')
                            setReplyInput('')
                          }}
                          onReplyInputChange={(val) => setReplyInput(val)}
                          onToggleCollapse={(commentId) => setCollapsedThreads(prev => ({ ...prev, [commentId]: !prev[commentId] }))}
                          onOpenAuthModal={() => setIsAuthModalOpen(true)}
                        />
                      ))}

                      {/* Pagination: Load More Comments Button */}
                      {remainingCount > 0 && (
                        <div className="pt-2 text-center">
                          <button
                            type="button"
                            onClick={() => setVisibleCommentsCount(prev => prev + 5)}
                            className="px-5 py-2 bg-[#070a0f] hover:bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-emerald-400 rounded-xl transition shadow-sm inline-flex items-center gap-2"
                          >
                            <span>Load More Comments ({remainingCount} remaining)</span>
                            <ChevronDown className="w-4 h-4 text-emerald-400" />
                          </button>
                        </div>
                      )}
                    </>
                  )
                })()}
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
