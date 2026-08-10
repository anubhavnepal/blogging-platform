'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import { 
  PenSquare, 
  FileText, 
  Eye, 
  ThumbsUp, 
  Trash2, 
  Edit3, 
  Plus, 
  CheckCircle2, 
  Globe, 
  FileCheck 
} from 'lucide-react'

export function AuthorDashboard() {
  const { currentUser, posts, deletePost, updatePost } = useApp()
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')

  if (!currentUser) return null

  // Filter posts belonging ONLY to this author (or all if admin)
  const authorPosts = currentUser.role === 'admin' 
    ? posts 
    : posts.filter(p => p.authorId === currentUser.id)

  const filteredPosts = authorPosts.filter(p => {
    if (filter === 'published') return p.isPublished
    if (filter === 'draft') return !p.isPublished
    return true
  })

  const totalViews = authorPosts.reduce((acc, p) => acc + p.viewsCount, 0)
  const totalLikes = authorPosts.reduce((acc, p) => acc + p.likesCount, 0)

  const toggleStatus = (id: string, currentStatus: boolean) => {
    updatePost(id, { 
      isPublished: !currentStatus,
      status: !currentStatus ? 'published' : 'draft'
    })
  }

  return (
    <div className="space-y-6">
      {/* Overview Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 glass-card rounded-2xl border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Publications</p>
            <span className="text-2xl font-black text-white">{authorPosts.length}</span>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 glass-card rounded-2xl border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Total Impressions</p>
            <span className="text-2xl font-black text-white">{totalViews.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 glass-card rounded-2xl border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Endorsements</p>
            <span className="text-2xl font-black text-white">{totalLikes.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
            <ThumbsUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Publications Management Section */}
      <div className="glass-card rounded-2xl border border-slate-800/80 overflow-hidden">
        {/* Table Top Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-950/40">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            {(['all', 'published', 'draft'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition ${
                  filter === tab 
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab} ({tab === 'all' ? authorPosts.length : authorPosts.filter(p => tab === 'published' ? p.isPublished : !p.isPublished).length})
              </button>
            ))}
          </div>

          <Link
            href="/editor?action=new"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Article</span>
          </Link>
        </div>

        {/* Table Content */}
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No articles found under this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Article Title</th>
                <th className="px-6 py-4 font-bold">Category</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Engagement</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredPosts.map(post => (
                <tr key={post.id} className="hover:bg-slate-900/40 transition">
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <Link href={`/posts/${post.id}`} className="font-bold text-white hover:text-emerald-400 text-sm block">
                        {post.title}
                      </Link>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Published {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-slate-900 text-slate-300 border border-slate-800 rounded-md font-semibold">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(post.id, post.isPublished)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                        post.isPublished
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {post.isPublished ? <Globe className="w-3 h-3" /> : <FileCheck className="w-3 h-3" />}
                      <span>{post.isPublished ? 'Live' : 'Draft'}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-slate-400 font-mono">
                      <span>{post.viewsCount} views</span>
                      <span>•</span>
                      <span>{post.likesCount} likes</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/editor?editId=${post.id}`}
                        className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition"
                        title="Edit Article"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${post.title}"?`)) {
                            deletePost(post.id)
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-400 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition"
                        title="Delete Article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  )
}
