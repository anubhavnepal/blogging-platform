'use client'

import React from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { AuthModal } from '@/components/auth/AuthModal'
import { Footer } from '@/components/layout/Footer'
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-300">
      <div>
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Navigation */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Publications</span>
          </Link>

          {/* Header */}
          <div className="glass-card p-8 sm:p-10 rounded-3xl border border-slate-800 bg-slate-900/80 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                Legal & Governance
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
              Last updated: August 10, 2026. This Privacy Policy details how Chronicle Publication Systems collects, uses, and protects your information when you interact with our platform.
            </p>
          </div>

          {/* Body Sections */}
          <div className="space-y-8 glass-card p-8 sm:p-10 rounded-3xl border border-slate-800/80 bg-slate-900/40 text-slate-300 text-sm leading-relaxed">
            
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                1. Information We Collect
              </h2>
              <p>
                When you access or register on Chronicle via Google OAuth or standard authentication, we collect basic account credentials essential for account functionality:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-2">
                <li>Your full name and email address.</li>
                <li>Public avatar picture provided by your OAuth identity provider.</li>
                <li>Content interactions including bookmarks, likes, and publication submissions.</li>
              </ul>
            </section>

            <hr className="border-slate-800/60" />

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                2. How We Use Your Data
              </h2>
              <p>We utilize the collected information strictly for:</p>
              <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-2">
                <li>Authenticating your session and safeguarding account security.</li>
                <li>Attributing authorship to publications and content reports.</li>
                <li>Synchronizing your user preferences, bookmarks, and reader analytics.</li>
                <li>Maintaining compliance with our content moderation standards.</li>
              </ul>
            </section>

            <hr className="border-slate-800/60" />

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                3. Data Sharing & Third-Party Services
              </h2>
              <p>
                Chronicle does not sell, rent, or lease personal user data to third parties. We utilize industry-standard cloud infrastructure (Supabase & Vercel) strictly to host and deliver our application services securely.
              </p>
            </section>

            <hr className="border-slate-800/60" />

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">4. User Rights & Data Deletion</h2>
              <p>
                You retain full rights over your data. You may request account deletion or data extraction at any time by contacting our governance team.
              </p>
            </section>

            <hr className="border-slate-800/60" />

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">5. Contact Us</h2>
              <p>
                If you have questions regarding this Privacy Policy, please reach out to us at{' '}
                <span className="text-emerald-400 font-mono">privacy@chronicle.dev</span>.
              </p>
            </section>

          </div>
        </div>
      </div>

      <AuthModal />

      <Footer />
    </main>
  )
}
