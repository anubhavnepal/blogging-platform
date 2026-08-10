import type { Metadata } from 'next'
import './globals.css'
import { AppProvider } from '@/context/AppContext'
import { AuthorApplicationModal } from '@/components/auth/AuthorApplicationModal'

export const metadata: Metadata = {
  title: 'Chronicle — Modern Multi-Author Publication Platform',
  description: 'A sleek, high-craft developer publishing platform built with Next.js 16 and Supabase.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B0F17] text-slate-100 antialiased">
        <AppProvider>
          {children}
          <AuthorApplicationModal />
        </AppProvider>
      </body>
    </html>
  )
}
