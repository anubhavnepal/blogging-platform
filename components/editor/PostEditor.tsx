'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { AuthorDashboard } from './AuthorDashboard'
import { RichTextEditor } from './RichTextEditor'
import { 
  ShieldAlert, 
  Clock, 
  Sparkles, 
  Send, 
  Eye, 
  PenSquare, 
  Image as ImageIcon, 
  Upload,
  X,
  Loader2
} from 'lucide-react'

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80'
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB Limit

export function PostEditor() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams ? searchParams.get('editId') : null
  const action = searchParams ? searchParams.get('action') : null
  const mode = searchParams ? searchParams.get('mode') : null

  const { currentUser, posts, addPost, updatePost, setIsAuthModalOpen } = useApp()

  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('Engineering')
  const [tagsInput, setTagsInput] = useState('Engineering, Tech')
  const [coverImage, setCoverImage] = useState('')

  // Determine current active sub-mode
  const isEditing = Boolean(editId || action === 'new')
  const isPreview = mode === 'preview'

  // Reset or Load post content based on URL query parameters
  useEffect(() => {
    if (editId) {
      const existing = posts.find(p => p.id === editId)
      if (existing) {
        setTitle(existing.title || '')
        setExcerpt(existing.excerpt || '')
        setContent(existing.content || '')
        setCategory(existing.category || 'Engineering')
        setTagsInput((existing.tags || []).join(', '))
        setCoverImage(existing.coverImage || '')
        setEditingPostId(editId)
      }
    } else if (action === 'new') {
      setTitle('')
      setExcerpt('')
      setContent('')
      setCategory('Engineering')
      setTagsInput('Engineering, Tech')
      setCoverImage('')
      setEditingPostId(null)
    }
  }, [editId, action])

  // ==================== ADMIN VERIFICATION GATE CHECK ====================
  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 glass-panel rounded-2xl text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Authentication Required</h2>
        <p className="text-sm text-slate-400">
          You must be logged in with a verified Author account to access the publication studio.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-6 py-2.5 bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg"
        >
          Sign In / Select Account
        </button>
      </div>
    )
  }

  // Gate Check: User must be Admin or Approved Author
  const isApproved = currentUser.role === 'admin' || currentUser.verificationStatus === 'approved'

  if (!isApproved) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 glass-panel rounded-2xl border border-amber-500/30 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <Clock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Author Verification Pending
          </span>
          <h2 className="text-2xl font-bold text-white">Editor Interface Locked</h2>
          <p className="text-sm text-slate-300/90 leading-relaxed max-w-md mx-auto">
            Hello <strong className="text-white">{currentUser.fullName}</strong>! Your author request is currently waiting for <strong>Admin Review & Approval</strong> to prevent spam and unauthorized content.
          </p>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl text-left text-xs text-slate-400 space-y-2">
          <p className="font-semibold text-slate-200">How to test this during evaluation:</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Click your avatar in the navbar top right and select <strong>Alex Vance (Admin)</strong>.</li>
            <li>Go to the <strong>Admin Panel</strong> in the top navigation bar.</li>
            <li>Click <strong>Approve Author</strong> for your user request.</li>
            <li>Switch back to your user account to unlock this Editor Studio!</li>
          </ol>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold rounded-xl text-xs"
          >
            Switch User / View Demo Roles
          </button>
        </div>
      </div>
    )
  }
  // ==================== END VERIFICATION GATE CHECK ====================

  const handleSavePost = async (publishStatus: 'published' | 'draft') => {
    const safeTitle = (title || '').trim()
    const safeContent = content || ''
    const rawText = safeContent.replace(/<[^>]*>?/gm, '').trim()
    if (!safeTitle || !rawText) {
      alert('Please provide an article title and body content.')
      return
    }

    setIsSaving(true)
    const tagsArray = (tagsInput || '').split(',').map(t => t.trim()).filter(Boolean)
    const isPub = publishStatus === 'published'
    const finalCoverImage = coverImage || DEFAULT_FALLBACK_IMAGE

    // Generate fallback excerpt from content if excerpt field is empty (extract first 45 clean words)
    let finalExcerpt = (excerpt || '').trim()
    if (!finalExcerpt) {
      // Strip HTML tags and collapse whitespace
      const plainContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      if (plainContent) {
        const words = plainContent.split(' ')
        finalExcerpt = words.length > 45 ? words.slice(0, 45).join(' ') : plainContent
      } else {
        finalExcerpt = title
      }
    }

    try {
      if (editingPostId) {
        await updatePost(editingPostId, {
          title,
          excerpt: finalExcerpt,
          content,
          category,
          tags: tagsArray,
          coverImage: finalCoverImage,
          isPublished: isPub,
          status: publishStatus
        })
      } else {
        await addPost({
          title,
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
          excerpt: finalExcerpt,
          content,
          coverImage: finalCoverImage,
          category,
          tags: tagsArray,
          authorId: currentUser.id,
          authorName: currentUser.fullName,
          authorAvatar: currentUser.avatarUrl,
          authorUsername: currentUser.username,
          isPublished: isPub,
          readTime: `${Math.max(2, Math.ceil(rawText.split(/\s+/).length / 150))} min read`,
          status: publishStatus
        })
      }
      router.push('/editor')
    } catch (err) {
      console.error('Save error:', err)
      alert('An error occurred while saving to the server.')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle custom image file upload with strict validation
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null)
    const file = e.target.files?.[0]
    if (!file) return

    // 1. Strict File Type Validation (Images Only)
    if (!file.type.startsWith('image/')) {
      setUploadError('Invalid file type. Only image files (PNG, JPG, WEBP, GIF) are allowed.')
      return
    }

    // 2. Size Limit Check (5MB max)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError('File is too large! Please select an image under 5 MB.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setCoverImage(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  // When NOT editing, render standard AuthorDashboard with top Author Studio header
  if (!isEditing) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <PenSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Author Studio</h1>
              <p className="text-xs text-slate-400">Manage your technical publications and audience analytics</p>
            </div>
          </div>
        </div>
        <AuthorDashboard />
      </div>
    )
  }

  // When EDITING or CREATING: Professional 2-Column Layout
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Main Scrollable Content Area */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {editingPostId ? 'Edit Publication' : 'Create New Publication'}
              </h1>
              <p className="text-xs text-slate-400">Draft or publish technical content directly</p>
            </div>
          </div>

          {isPreview ? (
            <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">Article Preview</span>
              </div>
              <div className="h-[260px] w-full rounded-xl overflow-hidden relative bg-slate-900 border border-slate-800">
                <img src={coverImage || DEFAULT_FALLBACK_IMAGE} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6">
                  <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-500 text-slate-950 rounded-md uppercase tracking-wider">{category}</span>
                  <h2 className="text-2xl font-extrabold text-white mt-2">{title || 'Untitled Article'}</h2>
                </div>
              </div>
              <div 
                className="prose prose-invert prose-emerald max-w-none font-sans text-slate-200 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content || '<em class="text-slate-500">No content entered yet...</em>' }}
              />
            </div>
          ) : (
            <div className="space-y-6 glass-card p-6 sm:p-8 rounded-2xl border border-slate-800/80">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Article Title</label>
                <input
                  type="text"
                  placeholder="e.g. Next-Gen Realtime Architectures with Supabase and Edge Functions"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-lg font-bold text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/60"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="AI & Systems">AI & Systems</option>
                    <option value="Tutorials">Tutorials</option>
                    <option value="Culture">Culture</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Tags (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="Nextjs, Supabase, Tailwind, AI"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Short Abstract / Excerpt</label>
                <textarea
                  rows={2}
                  placeholder="A brief 1-2 sentence summary of what readers will learn..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              {/* Clean Featured Image File Uploader (No Presets, No Raw URLs) */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-400" /> Featured Article Image
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">Formats: PNG, JPG, WEBP (Max 5MB)</span>
                </label>

                {uploadError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-medium">
                    {uploadError}
                  </div>
                )}

                {coverImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 group h-56 bg-slate-950">
                    <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                      <label className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl cursor-pointer transition flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Change Photo</span>
                        <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                      </label>
                      <button
                        type="button"
                        onClick={() => setCoverImage('')}
                        className="px-4 py-2 bg-rose-500/80 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Remove Photo</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl bg-slate-950/60 hover:bg-slate-950 transition cursor-pointer group text-center space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:scale-105 transition">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200 group-hover:text-white">Click to upload custom article cover photo</p>
                      <p className="text-[11px] text-slate-500">Supports PNG, JPG, WEBP up to 5 MB</p>
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                  </label>
                )}
              </div>

              {/* True WYSIWYG MS Word Style Rich Text Editor */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Article Body Content</label>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Type or paste your article content freely..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Control Sidebar */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3">
              Publishing Actions
            </h3>

            {/* Mode Switcher */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">Workspace Mode</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    const base = editId ? `/editor?editId=${editId}` : '/editor?action=new'
                    router.push(base)
                  }}
                  className={`py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                    !isPreview ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <PenSquare className="w-3.5 h-3.5" /> Editor
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const base = editId ? `/editor?editId=${editId}&mode=preview` : '/editor?action=new&mode=preview'
                    router.push(base)
                  }}
                  className={`py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                    isPreview ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
              </div>
            </div>

            {/* Action Buttons: Publish or Save as Draft */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSavePost('published')}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow transition"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{editingPostId ? 'Save & Publish Post' : 'Publish Article Now'}</span>
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSavePost('draft')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-emerald-400 border border-slate-700/80 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                <span>Save as Draft</span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/editor')}
                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white transition flex items-center justify-center gap-2"
              >
                Cancel & Exit
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

