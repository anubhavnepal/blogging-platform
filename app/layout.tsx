import type { Metadata } from 'next'
import './globals.css'
import { AppProvider } from '@/context/AppContext'
import { AuthorApplicationModal } from '@/components/auth/AuthorApplicationModal'
import { createClient } from '@/lib/supabase/server'

export async function generateMetadata(): Promise<Metadata> {
  let siteName = 'Chronicle'
  let tagline = 'Modern Multi-Author Publication Platform'
  let description = 'An open digital publishing and blogging platform built for software engineers, designers, and technical creators.'
  
  try {
    const supabase = await createClient()
    const { data: dbConfig } = await supabase.from('site_config').select('*').eq('id', 1).single()
    if (dbConfig) {
      siteName = dbConfig.site_name || siteName
      tagline = dbConfig.tagline || tagline
      description = dbConfig.announcement_banner || description
    }
  } catch (e) {
    // Fallback to defaults if db isn't ready
  }

  return {
    title: `${siteName} — ${tagline}`,
    description: description,
    verification: {
      google: 'FvcKBOYw2eTGOkxdA8PApmI1MeJBGf-4AVOtjHu7Tek',
    },
  }
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
