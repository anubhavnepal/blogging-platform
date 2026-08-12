import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Handled in middleware/server components
            }
          },
        },
      }
    )

    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      // Sync Google user profile details into public.profiles database table
      const user = data.user
      const userMetadata = user.user_metadata

      const avatarUrl = userMetadata.avatar_url || userMetadata.picture || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`
      const fullName = userMetadata.full_name || userMetadata.name || user.email?.split('@')[0] || 'Subscriber'
      const username = userMetadata.preferred_username || user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`

      // Check if profile exists first to preserve assigned role and status
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('role, verification_status')
        .eq('id', user.id)
        .single()

      // Upsert profile record while preserving role and verification status
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email || '',
        full_name: fullName,
        username,
        avatar_url: avatarUrl,
        role: existingProfile?.role || 'reader',
        verification_status: existingProfile?.verification_status || 'none',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth_failed`)
}
