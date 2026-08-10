'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  UserProfile, 
  BlogPost, 
  SiteConfig, 
  ContentReport, 
  Comment,
  MOCK_USERS, 
  MOCK_POSTS, 
  MOCK_SITE_CONFIG, 
  MOCK_REPORTS 
} from '@/lib/mock-data'

interface AppContextType {
  currentUser: UserProfile | null
  allUsers: UserProfile[]
  posts: BlogPost[]
  siteConfig: SiteConfig
  reports: ContentReport[]
  comments: Record<string, Comment[]>
  activeCategory: string
  searchQuery: string
  isAuthModalOpen: boolean
  isAuthorModalOpen: boolean
  isLoading: boolean
  
  // Actions
  setCurrentUserById: (userId: string) => void
  loginWithGoogle: () => void
  logout: () => void
  setSearchQuery: (query: string) => void
  setActiveCategory: (category: string) => void
  setIsAuthModalOpen: (isOpen: boolean) => void
  setIsAuthorModalOpen: (isOpen: boolean) => void
  toggleBookmark: (postId: string) => void
  applyForAuthorStatus: (pitch: string) => void
  
  // Post Actions
  addPost: (post: Omit<BlogPost, 'id' | 'createdAt' | 'viewsCount' | 'likesCount'>) => Promise<BlogPost | null>
  updatePost: (id: string, updatedFields: Partial<BlogPost>) => void
  deletePost: (id: string) => void
  toggleLikePost: (id: string) => void
  addComment: (postId: string, content: string) => void
  submitReport: (postId: string, postTitle: string, reason: ContentReport['reason'], details: string) => void
  
  // Admin Actions
  updateUserVerification: (userId: string, status: 'none' | 'pending' | 'approved' | 'rejected') => void
  updateSiteConfig: (newConfig: Partial<SiteConfig>) => void
  resolveReport: (reportId: string, action: 'dismiss' | 'delete_post') => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null) // Start unauthenticated until Supabase auth resolves
  const currentUserRef = React.useRef(currentUser)
  useEffect(() => {
    currentUserRef.current = currentUser
  }, [currentUser])

  const [allUsers, setAllUsers] = useState<UserProfile[]>([])
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(MOCK_SITE_CONFIG)
  const [reports, setReports] = useState<ContentReport[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Listen to Supabase Auth State changes & fetch real profiles table
  useEffect(() => {
    async function initAuthListener() {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        // Fetch real posts & profiles from Supabase
        try {
          const { data: dbProfiles } = await supabase.from('profiles').select('*')
          const profilesMap: Record<string, any> = {}
          if (dbProfiles && dbProfiles.length > 0) {
            const mappedProfiles: UserProfile[] = dbProfiles.map((p: any) => {
              profilesMap[p.id] = p
              return {
                id: p.id,
                email: p.email || '',
                fullName: p.full_name || 'Subscriber',
                username: p.username || `user_${p.id.slice(0, 6)}`,
                avatarUrl: p.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
                role: p.role || 'reader',
                verificationStatus: (p.verification_status as any) || 'none',
                bio: p.bio || '',
                joinedDate: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                bookmarks: [],
                userLikes: []
              }
            })
            setAllUsers(mappedProfiles)
          }

          const { data: dbPosts } = await supabase.from('posts').select('*, profiles(*)')
          if (dbPosts && dbPosts.length > 0) {
            const mappedPosts: BlogPost[] = dbPosts.map((p: any) => {
              const author = p.profiles || profilesMap[p.author_id]
              return {
                id: p.id,
                title: p.title,
                slug: p.slug,
                excerpt: p.excerpt,
                content: p.content,
                coverImage: p.cover_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
                category: p.category || 'General',
                tags: p.tags || [],
                authorId: p.author_id,
                authorName: author?.full_name || 'Chronicle Author',
                authorAvatar: author?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                authorUsername: author?.username || 'author',
                isPublished: p.is_published ?? true,
                readTime: p.read_time || '4 min read',
                viewsCount: p.views_count || 0,
                likesCount: p.likes_count || 0,
                status: p.status || 'published',
                createdAt: p.created_at || new Date().toISOString()
              }
            })
            setPosts(mappedPosts)
          }

          const { data: dbReports } = await supabase.from('content_reports').select('*, posts(title), profiles(full_name)')
          if (dbReports && dbReports.length > 0) {
            const mappedReports: ContentReport[] = dbReports.map((r: any) => ({
              id: r.id,
              postId: r.post_id,
              postTitle: r.posts?.title || 'Reported Publication',
              reporterName: r.profiles?.full_name || (r.reporter_id ? (profilesMap[r.reporter_id]?.full_name || 'Anonymous User') : 'Anonymous User'),
              reason: r.reason,
              details: r.details || 'No details provided.',
              status: r.status || 'pending',
              createdAt: r.created_at || new Date().toISOString()
            }))
            setReports(mappedReports)
          }
        } catch (e) {
          // Graceful catch
        } finally {
          setIsLoading(false)
        }

        // Realtime subscription for content_reports
        const reportsChannel = supabase
          .channel('public:content_reports')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'content_reports' }, async () => {
            const { data: dbReports } = await supabase.from('content_reports').select('*, posts(title), profiles(full_name)')
            if (dbReports) {
              const mappedReports: ContentReport[] = dbReports.map((r: any) => ({
                id: r.id,
                postId: r.post_id,
                postTitle: r.posts?.title || 'Reported Publication',
                reporterName: r.profiles?.full_name || 'Anonymous User',
                reason: r.reason,
                details: r.details || 'No details provided.',
                status: r.status || 'pending',
                createdAt: r.created_at || new Date().toISOString()
              }))
              setReports(mappedReports)
            }
          })
          .subscribe()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            const user = session.user
            const meta = user.user_metadata

            const googleAvatar = meta?.avatar_url || meta?.picture || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`
            const googleName = meta?.full_name || meta?.name || user.email?.split('@')[0] || 'Subscriber'
            const googleUsername = meta?.preferred_username || user.email?.split('@')[0] || `user_${user.id.slice(0, 6)}`

            // Fetch existing role from database if available
            let assignedRole: 'admin' | 'author' | 'reader' = 'reader'
            let currentStatus: 'none' | 'pending' | 'approved' | 'rejected' = 'none'

            try {
              const { data: existingProfile } = await supabase
                .from('profiles')
                .select('role, verification_status')
                .eq('id', user.id)
                .single()

              if (existingProfile) {
                assignedRole = existingProfile.role || 'reader'
                currentStatus = existingProfile.verification_status || 'none'
              }
            } catch (e) {
              // Ignore single query error if profile doesn't exist yet
            }

            // Ensure user profile exists in public.profiles table (Foreign Key constraint safeguard)
            try {
              await supabase.from('profiles').upsert({
                id: user.id,
                email: user.email || '',
                full_name: googleName,
                username: googleUsername,
                avatar_url: googleAvatar,
                role: assignedRole,
                verification_status: currentStatus,
                bio: 'Authenticated User.'
              }, { onConflict: 'id' })

              // Fetch persisted bookmarks and likes from Supabase safely
              let userBookmarks: string[] = []
              let userLikesList: string[] = []
              try {
                const bRes = await supabase.from('bookmarks').select('post_id').eq('user_id', user.id)
                if (bRes.data) userBookmarks = bRes.data.map((b: any) => b.post_id)
              } catch (e) {
                // Ignore forbidden query error
              }

              try {
                const lRes = await supabase.from('post_likes').select('post_id').eq('user_id', user.id)
                if (lRes.data) userLikesList = lRes.data.map((l: any) => l.post_id)
              } catch (e) {
                // Ignore forbidden query error
              }

              const googleProfile: UserProfile = {
                id: user.id,
                email: user.email || '',
                fullName: googleName,
                username: googleUsername,
                avatarUrl: googleAvatar,
                role: assignedRole,
                verificationStatus: currentStatus as any,
                bio: 'Authenticated via Google OAuth.',
                joinedDate: new Date().toISOString().split('T')[0],
                bookmarks: userBookmarks,
                userLikes: userLikesList
              }

              setCurrentUser(googleProfile)
              setAllUsers(prev => {
                if (prev.some(u => u.id === googleProfile.id)) {
                  return prev.map(u => u.id === googleProfile.id ? googleProfile : u)
                }
                return [googleProfile, ...prev]
              })
            } catch (e) {
              console.error('Profile upsert error:', e)
            }
          }
        })

        return () => {
          subscription.unsubscribe()
          supabase.removeChannel(reportsChannel)
        }
      } catch (e) {
        // Fallback gracefully if Supabase URL is not populated yet
      }
    }

    initAuthListener()
  }, [siteConfig.autoApproveAuthors])
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false)
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState<boolean>(false)
  const [comments, setComments] = useState<Record<string, Comment[]>>({
    '11111111-1111-4111-a111-111111111111': [
      {
        id: 'c-1',
        postId: '11111111-1111-4111-a111-111111111111',
        authorName: 'Marcus Chen',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        content: 'Excellently structured RLS policy walkthrough! Supabase policy definitions really safeguard serverless architectures.',
        createdAt: '2026-07-28T16:45:00Z'
      }
    ]
  })

  // Switch Active User
  const setCurrentUserById = (userId: string) => {
    const user = allUsers.find(u => u.id === userId) || null
    setCurrentUser(user)
  }

  const loginWithGoogle = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      })

      if (error) {
        console.warn('Supabase OAuth notice:', error.message)
        // Fallback to mock session if Supabase is not yet configured in environment variables
        const newGoogleUser: UserProfile = {
          id: `usr-google-${Date.now()}`,
          email: 'alex.dev@gmail.com',
          fullName: 'Alex Riviera (Google)',
          username: 'alex_google',
          avatarUrl: 'https://lh3.googleusercontent.com/a/ACg8ocIq8w0X_placeholder=s96-c',
          role: 'reader',
          verificationStatus: siteConfig.autoApproveAuthors ? 'approved' : 'none',
          bio: 'Authenticated via Google OAuth. Technical reader & subscriber.',
          joinedDate: new Date().toISOString().split('T')[0],
          bookmarks: []
        }

        setAllUsers(prev => [newGoogleUser, ...prev])
        setCurrentUser(newGoogleUser)
        setIsAuthModalOpen(false)
      }
    } catch (err) {
      console.error('OAuth sign in error:', err)
    }
  }

  const logout = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (e) {
      // Ignored
    }
    setCurrentUser(null)
  }

  // Realtime Supabase Subscription & Sync Setup
  useEffect(() => {
    let channel: any = null

    async function setupRealtime() {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        // 1. Subscribe to Realtime updates on posts, likes, comments
        channel = supabase
          .channel('public:db_changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'posts' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newPost = payload.new as any
                setPosts(prev => {
                  if (prev.some(p => p.id === newPost.id)) return prev
                  return [{
                    id: newPost.id,
                    title: newPost.title,
                    slug: newPost.slug,
                    excerpt: newPost.excerpt,
                    content: newPost.content,
                    coverImage: newPost.cover_image,
                    category: newPost.category,
                    tags: newPost.tags || [],
                    authorId: newPost.author_id,
                    authorName: 'Author',
                    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                    authorUsername: 'author',
                    isPublished: newPost.is_published,
                    readTime: newPost.read_time,
                    viewsCount: newPost.views_count,
                    likesCount: newPost.likes_count,
                    status: newPost.status,
                    createdAt: newPost.created_at || new Date().toISOString()
                  }, ...prev]
                })
              } else if (payload.eventType === 'UPDATE') {
                const updated = payload.new as any
                setPosts(prev => prev.map(p => p.id === updated.id ? {
                  ...p,
                  title: updated.title,
                  excerpt: updated.excerpt,
                  content: updated.content,
                  likesCount: updated.likes_count,
                  viewsCount: updated.views_count,
                  isPublished: updated.is_published,
                  status: updated.status
                } : p))
              } else if (payload.eventType === 'DELETE') {
                const deletedId = payload.old.id
                setPosts(prev => prev.filter(p => p.id !== deletedId))
              }
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'post_likes' },
            async (payload) => {
              if (payload.eventType === 'INSERT') {
                const likedPostId = payload.new.post_id
                if (currentUserRef.current && payload.new.user_id === currentUserRef.current.id) return
                setPosts(prev => prev.map(p => p.id === likedPostId ? { ...p, likesCount: p.likesCount + 1 } : p))
              } else if (payload.eventType === 'DELETE') {
                const unlikedPostId = payload.old?.post_id || payload.old?.id
                if (currentUserRef.current && payload.old?.user_id === currentUserRef.current.id) return
                
                if (unlikedPostId) {
                  setPosts(prev => prev.map(p => p.id === unlikedPostId ? { ...p, likesCount: Math.max(0, p.likesCount - 1) } : p))
                } else {
                  // Fallback: Re-sync total likes count for all posts from DB
                  try {
                    const { createClient } = await import('@/lib/supabase/client')
                    const supabase = createClient()
                    const { data: countData } = await supabase.from('post_likes').select('post_id')
                    if (countData) {
                      const countsMap: Record<string, number> = {}
                      countData.forEach((row: any) => {
                        countsMap[row.post_id] = (countsMap[row.post_id] || 0) + 1
                      })
                      setPosts(prev => prev.map(p => ({
                        ...p,
                        likesCount: countsMap[p.id] || 0
                      })))
                    }
                  } catch (e) {
                    // Ignore sync error
                  }
                }
              }
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'profiles' },
            (payload) => {
              if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                const updatedProfile = payload.new as any
                setAllUsers(prev => prev.map(u => u.id === updatedProfile.id ? {
                  ...u,
                  role: updatedProfile.role || u.role,
                  verificationStatus: updatedProfile.verification_status || u.verificationStatus
                } : u))

                if (currentUserRef.current && currentUserRef.current.id === updatedProfile.id) {
                  setCurrentUser(prev => prev ? {
                    ...prev,
                    role: updatedProfile.role || prev.role,
                    verificationStatus: updatedProfile.verification_status || prev.verificationStatus
                  } : null)
                }
              }
            }
          )
          .subscribe()
      } catch (err) {
        // Fallback safely if Supabase is offline
      }
    }

    setupRealtime()

    return () => {
      if (channel) {
        channel.unsubscribe()
      }
    }
  }, [])

  // Toggle Bookmark with Supabase Persistence
  const toggleBookmark = async (postId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true)
      return
    }

    const currentBookmarks = currentUser.bookmarks || []
    const isBookmarked = currentBookmarks.includes(postId)
    const newBookmarks = isBookmarked
      ? currentBookmarks.filter(id => id !== postId)
      : [...currentBookmarks, postId]

    const updatedUser = { ...currentUser, bookmarks: newBookmarks }
    setCurrentUser(updatedUser)
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u))

    // Persist bookmark to Supabase database
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // Ensure profile row exists prior to insert
      await supabase.from('profiles').upsert({
        id: currentUser.id,
        email: currentUser.email || '',
        full_name: currentUser.fullName,
        username: currentUser.username,
        avatar_url: currentUser.avatarUrl,
        role: currentUser.role || 'reader',
        verification_status: 'approved',
        bio: currentUser.bio || ''
      }, { onConflict: 'id' })

      if (isBookmarked) {
        const { error } = await supabase.from('bookmarks').delete().eq('user_id', currentUser.id).eq('post_id', postId)
        if (error) console.error('Bookmark delete error:', error)
      } else {
        const { error } = await supabase.from('bookmarks').insert({ user_id: currentUser.id, post_id: postId })
        if (error) console.error('Bookmark insert error:', error)
      }
    } catch (err) {
      console.error('Bookmark error:', err)
    }
  }

  // Apply to become an author
  const applyForAuthorStatus = async (pitch: string) => {
    if (!currentUser) return
    const updatedUser: UserProfile = {
      ...currentUser,
      verificationStatus: 'pending',
      authorPitch: pitch
    }
    setCurrentUser(updatedUser)
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u))
    setIsAuthorModalOpen(false)

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      await supabase.from('profiles').update({
        verification_status: 'pending'
      }).eq('id', currentUser.id)
    } catch (e) {
      console.error('Author application error:', e)
    }
  }

  // Create & Edit Posts
  const addPost = async (postData: Omit<BlogPost, 'id' | 'createdAt' | 'viewsCount' | 'likesCount'>): Promise<BlogPost | null> => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data, error } = await supabase.from('posts').insert({
        title: postData.title,
        slug: postData.slug,
        excerpt: postData.excerpt,
        content: postData.content,
        cover_image: postData.coverImage,
        category: postData.category,
        tags: postData.tags,
        author_id: postData.authorId,
        is_published: postData.isPublished,
        read_time: postData.readTime,
        status: postData.status
      }).select('*, profiles(*)').single()

      if (error) {
        console.error('Supabase insert error:', error)
        // Fallback optimistic post
        const fallbackPost: BlogPost = {
          ...postData,
          id: `post-${Date.now()}`,
          viewsCount: 1,
          likesCount: 0,
          createdAt: new Date().toISOString()
        }
        setPosts(prev => [fallbackPost, ...prev])
        return fallbackPost
      }

      if (data) {
        const author = data.profiles
        const createdPost: BlogPost = {
          id: data.id,
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          coverImage: data.cover_image,
          category: data.category,
          tags: data.tags || [],
          authorId: data.author_id,
          authorName: author?.full_name || postData.authorName,
          authorAvatar: author?.avatar_url || postData.authorAvatar,
          authorUsername: author?.username || postData.authorUsername,
          isPublished: data.is_published,
          readTime: data.read_time,
          viewsCount: data.views_count || 0,
          likesCount: data.likes_count || 0,
          status: data.status,
          createdAt: data.created_at
        }
        setPosts(prev => [createdPost, ...prev.filter(p => p.id !== createdPost.id)])
        return createdPost
      }
    } catch (e) {
      console.error('Post creation exception:', e)
    }
    return null
  }

  const updatePost = async (id: string, updatedFields: Partial<BlogPost>) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p))

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const dbUpdates: any = {}
      if (updatedFields.title !== undefined) dbUpdates.title = updatedFields.title
      if (updatedFields.excerpt !== undefined) dbUpdates.excerpt = updatedFields.excerpt
      if (updatedFields.content !== undefined) dbUpdates.content = updatedFields.content
      if (updatedFields.category !== undefined) dbUpdates.category = updatedFields.category
      if (updatedFields.tags !== undefined) dbUpdates.tags = updatedFields.tags
      if (updatedFields.coverImage !== undefined) dbUpdates.cover_image = updatedFields.coverImage
      if (updatedFields.isPublished !== undefined) dbUpdates.is_published = updatedFields.isPublished
      if (updatedFields.status !== undefined) dbUpdates.status = updatedFields.status

      await supabase.from('posts').update(dbUpdates).eq('id', id)
    } catch (e) {
      console.error('Post update error:', e)
    }
  }

  const deletePost = async (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id))
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      await supabase.from('posts').delete().eq('id', id)
    } catch (e) {
      console.error('Post delete error:', e)
    }
  }

  // Toggle Like with Realtime Broadcast & Database Sync
  const toggleLikePost = async (id: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true)
      return
    }

    const currentLikes = currentUser.userLikes || []
    const isLiked = currentLikes.includes(id)
    const newLikes = isLiked
      ? currentLikes.filter(likedId => likedId !== id)
      : [...currentLikes, id]

    const updatedUser = { ...currentUser, userLikes: newLikes }
    setCurrentUser(updatedUser)
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u))

    // Optimistically update post like count locally
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, likesCount: isLiked ? Math.max(0, p.likesCount - 1) : p.likesCount + 1 }
      }
      return p
    }))

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // Ensure profile row exists prior to insert
      await supabase.from('profiles').upsert({
        id: currentUser.id,
        email: currentUser.email || '',
        full_name: currentUser.fullName,
        username: currentUser.username,
        avatar_url: currentUser.avatarUrl,
        role: currentUser.role || 'reader',
        verification_status: currentUser.verificationStatus || 'none',
        bio: currentUser.bio || ''
      }, { onConflict: 'id' })

      if (isLiked) {
        const { error } = await supabase.from('post_likes').delete().eq('user_id', currentUser.id).eq('post_id', id)
        if (error) console.error('Like delete error:', error)
      } else {
        const { error } = await supabase.from('post_likes').insert({ user_id: currentUser.id, post_id: id })
        if (error) console.error('Like insert error:', error)
      }

      // Fetch fresh count from post_likes & update posts table for bulletproof Realtime broadcast
      const { count } = await supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', id)
      if (count !== null) {
        await supabase.from('posts').update({ likes_count: count }).eq('id', id)
      }
    } catch (err) {
      console.error('Like error:', err)
    }
  }

  const addComment = (postId: string, content: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true)
      return
    }
    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      postId,
      authorName: currentUser.fullName,
      authorAvatar: currentUser.avatarUrl,
      content,
      createdAt: new Date().toISOString()
    }
    setComments(prev => ({
      ...prev,
      [postId]: [newComment, ...(prev[postId] || [])]
    }))
  }

  const submitReport = async (postId: string, postTitle: string, reason: ContentReport['reason'], details: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true)
      return
    }
    const newReport: ContentReport = {
      id: `rep-${Date.now()}`,
      postId,
      postTitle,
      reporterName: currentUser.fullName,
      reason,
      details,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    setReports(prev => [newReport, ...prev])

    // Persist to Supabase content_reports table
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      await supabase.from('content_reports').insert({
        post_id: postId,
        reporter_id: currentUser.id,
        reason: reason,
        details: details,
        status: 'pending'
      })
    } catch (err) {
      console.error('Failed to persist content report to Supabase:', err)
    }
  }

  // Admin Actions
  const updateUserVerification = async (userId: string, status: 'none' | 'pending' | 'approved' | 'rejected') => {
    const newRole = status === 'approved' ? 'author' : 'reader'
    
    // Update local state immediately
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { 
          ...u, 
          role: newRole,
          verificationStatus: status 
        }
      }
      return u
    }))

    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? { 
        ...prev, 
        role: newRole,
        verificationStatus: status 
      } : null)
    }

    // Persist to Supabase database
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({
          role: newRole,
          verification_status: status
        })
        .eq('id', userId)

      if (error) {
        console.error('Supabase profile update failed:', error)
      }
    } catch (e) {
      console.error('Update verification exception:', e)
    }
  }

  const updateSiteConfig = async (newConfig: Partial<SiteConfig>) => {
    setSiteConfig(prev => ({ ...prev, ...newConfig }))

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      await supabase.from('site_config').update({
        site_name: newConfig.siteName,
        tagline: newConfig.tagline,
        announcement_banner: newConfig.announcementBanner,
        auto_approve_authors: newConfig.autoApproveAuthors,
        maintenance_mode: newConfig.maintenanceMode,
        updated_at: new Date().toISOString()
      }).eq('id', 1)
    } catch (e) {
      console.error('Update site_config failed:', e)
    }
  }

  const resolveReport = async (reportId: string, action: 'dismiss' | 'delete_post') => {
    const report = reports.find(r => r.id === reportId)
    const targetPostId = report ? report.postId : reportId

    if (action === 'delete_post' && targetPostId) {
      deletePost(targetPostId)
    }

    const newStatus = action === 'dismiss' ? 'dismissed' : 'resolved'
    
    // Update all reports belonging to targetPostId in local state
    setReports(prev => prev.map(r => (r.postId === targetPostId || r.id === reportId) ? { ...r, status: newStatus as any } : r))

    // Sync resolution for all matching reports with Supabase
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      if (targetPostId) {
        await supabase.from('content_reports').update({ status: newStatus }).eq('post_id', targetPostId)
      }
    } catch (err) {
      console.error('Failed to sync resolveReport to Supabase:', err)
    }
  }

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        posts,
        siteConfig,
        reports,
        comments,
        activeCategory,
        searchQuery,
        isAuthModalOpen,
        isAuthorModalOpen,
        isLoading,
        setCurrentUserById,
        loginWithGoogle,
        logout,
        setSearchQuery,
        setActiveCategory,
        setIsAuthModalOpen,
        setIsAuthorModalOpen,
        toggleBookmark,
        applyForAuthorStatus,
        addPost,
        updatePost,
        deletePost,
        toggleLikePost,
        addComment,
        submitReport,
        updateUserVerification,
        updateSiteConfig,
        resolveReport
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
