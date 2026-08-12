'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import { AdminSidebar } from './AdminSidebar'
import { 
  ShieldCheck, 
  Settings, 
  UserCheck, 
  Flag, 
  Check, 
  X, 
  Trash2, 
  AlertTriangle, 
  Globe, 
  Sliders,
  Sparkles,
  ExternalLink,
  Search,
  Users,
  Feather,
  Filter,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Upload,
  Image as ImageIcon
} from 'lucide-react'

export function AdminControlCenter() {
  const { 
    currentUser, 
    allUsers, 
    updateUserVerification, 
    siteConfig, 
    updateSiteConfig, 
    reports, 
    resolveReport, 
    setIsAuthModalOpen 
  } = useApp()

  const [activeTab, setActiveTab] = useState<'verifications' | 'config' | 'moderation'>('verifications')

  // Form states for Site Config
  const [siteName, setSiteName] = useState(siteConfig.siteName)
  const [siteLogo, setSiteLogo] = useState(siteConfig.siteLogo || '')
  const [tagline, setTagline] = useState(siteConfig.tagline)
  const [announcementBanner, setAnnouncementBanner] = useState(siteConfig.announcementBanner)
  const [maintenance, setMaintenance] = useState(siteConfig.maintenanceMode)

  React.useEffect(() => {
    setSiteName(siteConfig.siteName)
    setSiteLogo(siteConfig.siteLogo || '')
    setTagline(siteConfig.tagline)
    setAnnouncementBanner(siteConfig.announcementBanner)
    setMaintenance(siteConfig.maintenanceMode)
  }, [siteConfig])

  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'pending' | 'admin' | 'author' | 'reader'>('all')

  // Post reports search, status filter, and pagination states
  const [reportSearchQuery, setReportSearchQuery] = useState('')
  const [reportStatusFilter, setReportStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all')
  const [reportPage, setReportPage] = useState(1)
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({})
  const itemsPerPage = 5

  const pendingUsers = allUsers.filter(u => u.verificationStatus === 'pending')
  const approvedAuthors = allUsers.filter(u => u.role === 'author' || u.verificationStatus === 'approved')
  const adminCount = allUsers.filter(u => u.role === 'admin').length
  const pendingReports = reports.filter(r => r.status === 'pending')

  // Group reports by unique postId for post-centric moderation
  interface ModerationCase {
    postId: string
    postTitle: string
    reports: typeof reports
    status: 'pending' | 'resolved' | 'dismissed'
    latestReportDate: string
    reasons: string[]
  }

  const groupedModerationCases: ModerationCase[] = React.useMemo(() => {
    const map = new Map<string, typeof reports>()
    reports.forEach(r => {
      if (!map.has(r.postId)) map.set(r.postId, [])
      map.get(r.postId)!.push(r)
    })

    const cases: ModerationCase[] = []
    map.forEach((repList, postId) => {
      // Sort reports newest first
      const sorted = [...repList].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      const isAnyPending = sorted.some(r => r.status === 'pending')
      const caseStatus = isAnyPending ? 'pending' : (sorted[0].status || 'resolved')
      const reasons = Array.from(new Set(sorted.map(r => r.reason)))

      cases.push({
        postId,
        postTitle: sorted[0].postTitle,
        reports: sorted,
        status: caseStatus as any,
        latestReportDate: sorted[0].createdAt,
        reasons
      })
    })

    // Sort cases newest report first
    return cases.sort((a, b) => new Date(b.latestReportDate).getTime() - new Date(a.latestReportDate).getTime())
  }, [reports])

  const filteredModerationCases = groupedModerationCases.filter(c => {
    const matchesSearch = 
      c.postTitle.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
      c.reasons.some(r => r.toLowerCase().includes(reportSearchQuery.toLowerCase())) ||
      c.reports.some(r => r.reporterName.toLowerCase().includes(reportSearchQuery.toLowerCase()) || r.details.toLowerCase().includes(reportSearchQuery.toLowerCase()))

    if (!matchesSearch) return false
    if (reportStatusFilter === 'pending') return c.status === 'pending'
    if (reportStatusFilter === 'resolved') return c.status === 'resolved' || c.status === 'dismissed'
    return true
  })

  const totalReportPages = Math.ceil(filteredModerationCases.length / itemsPerPage) || 1
  const paginatedModerationCases = filteredModerationCases.slice((reportPage - 1) * itemsPerPage, reportPage * itemsPerPage)

  // Filter users based on search and selected role filter
  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (roleFilter === 'pending') return user.verificationStatus === 'pending'
    if (roleFilter === 'admin') return user.role === 'admin'
    if (roleFilter === 'author') return user.role === 'author' || user.verificationStatus === 'approved'
    if (roleFilter === 'reader') return user.role === 'reader' && user.verificationStatus !== 'pending'

    return true
  })

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel p-8 rounded-2xl text-center space-y-4 border border-purple-500/30">
          <ShieldCheck className="w-12 h-12 text-purple-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Admin Access Restricted</h2>
          <p className="text-sm text-slate-400">
            This dashboard is reserved exclusively for site administrators. Please authenticate with an administrative account.
          </p>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-purple-600/20 transition"
          >
            Authenticate Admin Account
          </button>
        </div>
      </div>
    )
  }

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault()
    updateSiteConfig({
      siteName,
      siteLogo,
      tagline,
      announcementBanner,
      maintenanceMode: maintenance
    })
    alert('Site configuration updated successfully!')
  }

  const pendingCasesCount = groupedModerationCases.filter(c => c.status === 'pending').length

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-screen">
      <AdminSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingUsersCount={pendingUsers.length}
        pendingReportsCount={pendingCasesCount}
      />

      <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto">
        {/* Top Operational Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 glass-card rounded-2xl border border-purple-500/30 bg-purple-950/20">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-inner">
              {activeTab === 'verifications' && <UserCheck className="w-6 h-6" />}
              {activeTab === 'moderation' && <Flag className="w-6 h-6" />}
              {activeTab === 'config' && <Sliders className="w-6 h-6" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {activeTab === 'verifications' && 'Authors & User Access'}
                {activeTab === 'moderation' && 'Post reports'}
                {activeTab === 'config' && 'Site Settings & Branding'}
              </h1>
              <p className="text-xs text-slate-400">
                {activeTab === 'verifications' && 'Manage author verifications, role promotions, and user directory'}
                {activeTab === 'moderation' && 'Review flagged posts, inspect reported content, and execute moderation actions.'}
                {activeTab === 'config' && 'Configure global site parameters, announcement banners, and rules'}
              </p>
            </div>
          </div>
        </div>

      {/* Tab 1: Author Verifications & User Management */}
      {activeTab === 'verifications' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="glass-card p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
                <span>Total Users</span>
                <Users className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">{allUsers.length}</div>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5">
              <div className="flex items-center justify-between text-amber-400 text-xs font-semibold mb-1">
                <span>Pending Requests</span>
                <UserCheck className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-300 tracking-tight">{pendingUsers.length}</div>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold mb-1">
                <span>Active Authors</span>
                <Feather className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-300 tracking-tight">{approvedAuthors.length}</div>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5">
              <div className="flex items-center justify-between text-purple-400 text-xs font-semibold mb-1">
                <span>Administrators</span>
                <ShieldCheck className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-300 tracking-tight">{adminCount}</div>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 glass-card p-3.5 rounded-2xl border border-slate-800/80 bg-slate-950/60">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users by name, email, or handle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/80 text-white text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500/50 transition placeholder:text-slate-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition shrink-0 ${
                  roleFilter === 'all' 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                All ({allUsers.length})
              </button>

              <button
                onClick={() => setRoleFilter('pending')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition shrink-0 flex items-center gap-1.5 ${
                  roleFilter === 'pending' 
                    ? 'bg-amber-500 text-slate-950 shadow-sm' 
                    : 'text-amber-400 hover:bg-amber-500/10'
                }`}
              >
                Pending
                {pendingUsers.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-950/40 text-amber-200 text-[10px] flex items-center justify-center font-bold">
                    {pendingUsers.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setRoleFilter('author')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition shrink-0 ${
                  roleFilter === 'author' 
                    ? 'bg-emerald-500 text-slate-950 shadow-sm' 
                    : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-900/60'
                }`}
              >
                Authors ({approvedAuthors.length})
              </button>

              <button
                onClick={() => setRoleFilter('admin')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition shrink-0 ${
                  roleFilter === 'admin' 
                    ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300 shadow-sm' 
                    : 'text-slate-400 hover:text-purple-300 hover:bg-slate-900/60'
                }`}
              >
                Admins ({adminCount})
              </button>

              <button
                onClick={() => setRoleFilter('reader')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition shrink-0 ${
                  roleFilter === 'reader' 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                Readers
              </button>
            </div>
          </div>

          {/* User Management Table */}
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Users className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-300">No users match your criteria</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your search terms or role filters to find what you are looking for.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/90 bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-3.5 px-5">User Profile</th>
                      <th className="py-3.5 px-4">Role & Status</th>
                      <th className="py-3.5 px-4">Joined Date</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {filteredUsers.map((user) => {
                      const isPending = user.verificationStatus === 'pending'
                      const isApproved = user.verificationStatus === 'approved' || user.role === 'author'
                      const isRejected = user.verificationStatus === 'rejected'
                      const isAdmin = user.role === 'admin'

                      return (
                        <tr key={user.id} className="hover:bg-slate-900/40 transition-colors group">
                          {/* User Identity Column */}
                          <td className="py-4 px-5 align-top">
                            <div className="flex items-start gap-3">
                              <img 
                                src={user.avatarUrl} 
                                alt={user.fullName} 
                                referrerPolicy="no-referrer" 
                                className="w-9 h-9 rounded-full object-cover border border-slate-700/80 shrink-0 mt-0.5" 
                              />
                              <div>
                                <div className="font-bold text-white tracking-tight flex items-center gap-2">
                                  {user.fullName}
                                  <span className="text-[11px] font-normal text-slate-400 font-mono">@{user.username}</span>
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>

                                {/* Application Pitch Preview */}
                                {user.authorPitch && isPending && (
                                  <div className="mt-2.5 p-2.5 bg-amber-500/5 border border-amber-500/20 rounded-xl text-slate-300 text-[11px] leading-relaxed max-w-lg">
                                    <span className="text-amber-400 font-bold uppercase tracking-wider text-[9px] block mb-0.5">Author Application Pitch:</span>
                                    "{user.authorPitch}"
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Role & Status Column */}
                          <td className="py-4 px-4 align-top">
                            <div className="space-y-1.5">
                              <div>
                                {isAdmin ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-purple-300 bg-purple-500/10 border border-purple-500/30">
                                    <ShieldCheck className="w-3 h-3 text-purple-400" /> Admin
                                  </span>
                                ) : isApproved ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                                    <Feather className="w-3 h-3" /> Author
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-400 bg-slate-900 border border-slate-800">
                                    Reader
                                  </span>
                                )}
                              </div>

                              {isPending && (
                                <div className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                  Requested Author Access
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Joined Date Column */}
                          <td className="py-4 px-4 align-top text-slate-400 text-[11px] font-mono">
                            {user.joinedDate}
                          </td>

                          {/* Action Buttons Column */}
                          <td className="py-4 px-5 align-top text-right">
                            {isAdmin ? (
                              <span className="text-[11px] font-medium text-purple-400/70 italic">
                                System Owner
                              </span>
                            ) : isPending ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => updateUserVerification(user.id, 'approved')}
                                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 transition shadow-md shadow-emerald-950/20 active:scale-95"
                                >
                                  <Check className="w-3.5 h-3.5" /> Approve
                                </button>
                                <button
                                  onClick={() => updateUserVerification(user.id, 'rejected')}
                                  className="px-3 py-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-300 font-bold text-xs rounded-xl border border-red-500/30 flex items-center gap-1 transition active:scale-95"
                                >
                                  <X className="w-3.5 h-3.5" /> Reject
                                </button>
                              </div>
                            ) : isApproved ? (
                              <button
                                onClick={() => updateUserVerification(user.id, 'none')}
                                className="text-[11px] font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 px-2.5 py-1 rounded-lg border border-transparent hover:border-red-500/20 transition"
                              >
                                Revoke Access
                              </button>
                            ) : isRejected ? (
                              <button
                                onClick={() => updateUserVerification(user.id, 'approved')}
                                className="text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 transition"
                              >
                                Grant Author Access
                              </button>
                            ) : (
                              <button
                                onClick={() => updateUserVerification(user.id, 'approved')}
                                className="text-[11px] font-medium text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-transparent hover:border-emerald-500/20 transition"
                              >
                                Promote to Author
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Site Configuration Panel */}
      {activeTab === 'config' && (
        <form onSubmit={handleSaveConfig} className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Site Name</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Site Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Site Logo Uploader */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Site Logo</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-slate-950 border border-slate-800 rounded-xl">
              {siteLogo ? (
                <div className="relative group shrink-0">
                  <img
                    src={siteLogo}
                    alt="Site Logo Preview"
                    className="w-14 h-14 rounded-xl object-cover border border-slate-700/80 bg-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setSiteLogo('')}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full text-xs shadow transition"
                    title="Remove Logo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-purple-500/10 border border-dashed border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold rounded-xl flex items-center gap-2 transition active:scale-95">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{siteLogo ? 'Change Logo Image' : 'Upload Logo Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        if (!file.type.startsWith('image/')) {
                          alert('Please upload a valid image file (PNG, JPG, SVG, WEBP).')
                          return
                        }
                        if (file.size > 3 * 1024 * 1024) {
                          alert('Image file size must be less than 3 MB.')
                          return
                        }
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') {
                            setSiteLogo(reader.result)
                          }
                        }
                        reader.readAsDataURL(file)
                      }}
                    />
                  </label>
                  {siteLogo && (
                    <button
                      type="button"
                      onClick={() => setSiteLogo('')}
                      className="text-xs text-slate-400 hover:text-red-400 transition"
                    >
                      Reset to default text logo
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  PNG, JPG, SVG, or WEBP (Max 3 MB). Used in top navigation and site header.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Announcement Banner Text</label>
            <input
              type="text"
              value={announcementBanner}
              onChange={(e) => setAnnouncementBanner(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Site Maintenance Mode</h4>
                <p className="text-xs text-slate-400">Temporarily pause new article publishing for non-admin users.</p>
              </div>
              <input
                type="checkbox"
                checked={maintenance}
                onChange={(e) => setMaintenance(e.target.checked)}
                className="w-5 h-5 accent-purple-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              Save Site Settings
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Content Moderation Queue (Post reports) */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar (Post Case Counts) */}
          {(() => {
            const totalCases = groupedModerationCases.length
            const pendingCasesCount = groupedModerationCases.filter(c => c.status === 'pending').length
            const resolvedCasesCount = totalCases - pendingCasesCount

            return (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Flagged Posts</p>
                    <h3 className="text-xl font-extrabold text-white mt-0.5">{totalCases}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Flag className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Review</p>
                    <h3 className="text-xl font-extrabold text-amber-400 mt-0.5">{pendingCasesCount}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Resolved Posts</p>
                    <h3 className="text-xl font-extrabold text-emerald-400 mt-0.5">{resolvedCasesCount}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Search, Filter Toolbar & Report Aggregation */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reports by title, reason, or reporter..."
                value={reportSearchQuery}
                onChange={(e) => {
                  setReportSearchQuery(e.target.value)
                  setReportPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800/80">
              {(['all', 'pending', 'resolved'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setReportStatusFilter(status)
                    setReportPage(1)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                    reportStatusFilter === status
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Moderation List View with Multi-User Aggregation & Pagination */}
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            {paginatedModerationCases.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-3 opacity-80" />
                <p className="font-semibold text-white">No reported posts match your search or filter.</p>
                <p className="text-xs text-slate-500 mt-1">Try resetting the filter to view all moderation items.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {paginatedModerationCases.map((mCase) => {
                  const reportCount = mCase.reports.length
                  const primaryReason = mCase.reasons[0] || 'FLAGGED'

                  return (
                    <div key={mCase.postId} className="p-6 space-y-4 hover:bg-slate-900/40 transition">
                      {/* Header Row: Target Title + Multi-User Reporter Count + Status Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {mCase.reasons.map((r) => (
                              <span key={r} className="px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-md bg-red-500/15 text-red-400 border border-red-500/30 shrink-0">
                                {r}
                              </span>
                            ))}
                          </div>
                          <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                            {mCase.postTitle}
                          </h3>

                          {/* Multi-User Report Count Badge */}
                          {reportCount > 1 && (
                            <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                              🔥 {reportCount} users reported this post
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {mCase.status === 'pending' ? (
                            <span className="px-3 py-1 text-[11px] font-bold rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              Pending Review
                            </span>
                          ) : (
                            <span className="px-3 py-1 text-[11px] font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              Resolved
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Smart Truncated & Scrollable Activity Log for User Reports */}
                      {(() => {
                        const isExpanded = expandedLogs[mCase.postId] || false
                        const visibleReports = isExpanded ? mCase.reports : mCase.reports.slice(0, 2)
                        const hiddenCount = mCase.reports.length - 2

                        return (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                User Activity Log ({reportCount} {reportCount === 1 ? 'Report' : 'Reports'})
                              </p>

                              {reportCount > 2 && (
                                <button
                                  onClick={() => setExpandedLogs(prev => ({ ...prev, [mCase.postId]: !isExpanded }))}
                                  className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition"
                                >
                                  <span>{isExpanded ? 'Collapse Log' : `View all ${reportCount} reports (+${hiddenCount} more)`}</span>
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </div>

                            <div className={`space-y-2 transition-all ${isExpanded ? 'max-h-80 overflow-y-auto pr-1 custom-scrollbar' : ''}`}>
                              {visibleReports.map((r, idx) => (
                                <div key={r.id || idx} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                                    <span className="flex items-center gap-2">
                                      <strong className="text-slate-200">{r.reporterName}</strong>
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{r.reason}</span>
                                    </span>
                                    <span className="text-slate-500 font-mono text-[10px]">{new Date(r.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-xs text-slate-300 italic leading-relaxed">
                                    "{r.details}"
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })()}

                      {/* Action Bar */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-500 font-mono">
                          Target ID: {mCase.postId}
                        </span>

                        <div className="flex items-center gap-2.5">
                          <Link
                            href={`/posts/${mCase.postId}`}
                            target="_blank"
                            className="px-3.5 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm"
                          >
                            <span>Inspect Post</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {mCase.status === 'pending' && (
                            <>
                              <button
                                onClick={() => resolveReport(mCase.reports[0].id, 'dismiss')}
                                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition"
                              >
                                Dismiss
                              </button>
                              <button
                                onClick={() => resolveReport(mCase.reports[0].id, 'delete_post')}
                                className="px-3.5 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove Post</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Pagination Toolbar */}
            {totalReportPages > 1 && (
              <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
                <span>Page {reportPage} of {totalReportPages}</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={reportPage === 1}
                    onClick={() => setReportPage(prev => Math.max(prev - 1, 1))}
                    className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition"
                  >
                    Previous
                  </button>
                  <button
                    disabled={reportPage === totalReportPages}
                    onClick={() => setReportPage(prev => Math.min(prev + 1, totalReportPages))}
                    className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </main>
    </div>
  )
}
