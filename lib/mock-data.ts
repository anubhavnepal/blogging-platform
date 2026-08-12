export type UserRole = 'admin' | 'author' | 'reader'
export type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected'

export interface UserProfile {
  id: string
  email: string
  fullName: string
  username: string
  avatarUrl: string
  role: UserRole
  verificationStatus: VerificationStatus
  bio: string
  joinedDate: string
  bookmarks?: string[]
  userLikes?: string[]
  authorPitch?: string
}

export interface SiteConfig {
  siteName: string
  tagline: string
  announcementBanner: string
  allowAnonymousReading: boolean
  autoApproveAuthors: boolean
  maintenanceMode: boolean
  featuredCategory: string
}

export interface Comment {
  id: string
  postId: string
  authorName: string
  authorAvatar: string
  content: string
  createdAt: string
}

export interface ContentReport {
  id: string
  postId: string
  postTitle: string
  reporterName: string
  reason: 'spam' | 'offensive' | 'misinformation' | 'plagiarism'
  details: string
  status: 'pending' | 'resolved' | 'dismissed'
  createdAt: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  category: string
  tags: string[]
  authorId: string
  authorName: string
  authorAvatar: string
  authorUsername: string
  isPublished: boolean
  isFeatured?: boolean
  readTime: string
  viewsCount: number
  likesCount: number
  status: 'published' | 'draft' | 'flagged' | 'archived'
  createdAt: string
}

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d',
    email: 'admin@chronicle.io',
    fullName: 'Alex Vance',
    username: 'alexvance_admin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    verificationStatus: 'approved',
    bio: 'Lead System Administrator & Chief Editor at Chronicle Hub.',
    joinedDate: '2026-01-10',
    bookmarks: []
  },
  {
    id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    email: 'elena.dev@google.com',
    fullName: 'Elena Rostova',
    username: 'elena_arch',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    role: 'author',
    verificationStatus: 'approved',
    bio: 'Principal Staff Architect writing about distributed consensus and Next.js 16 internals.',
    joinedDate: '2026-02-14',
    bookmarks: []
  },
  {
    id: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
    email: 'marcus.k@tech.co',
    fullName: 'Marcus Chen',
    username: 'marcus_ai',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'author',
    verificationStatus: 'approved',
    bio: 'Exploring agentic AI systems, LLM fine-tuning, and neural interfaces.',
    joinedDate: '2026-03-01',
    bookmarks: []
  },
  {
    id: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
    email: 'sarah.newbie@gmail.com',
    fullName: 'Sarah Jenkins',
    username: 'sarah_j',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'reader',
    verificationStatus: 'pending',
    bio: 'Frontend developer looking to publish tutorials on CSS Grid & WebAssembly.',
    joinedDate: '2026-07-29',
    bookmarks: [],
    authorPitch: 'I write deep technical guides on WebAssembly performance and CSS layout tricks.'
  },
  {
    id: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b',
    email: 'david.subscriber@gmail.com',
    fullName: 'David Miller',
    username: 'dmiller_read',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'reader',
    verificationStatus: 'none',
    bio: 'Tech enthusiast and active reader subscriber.',
    joinedDate: '2026-06-12',
    bookmarks: []
  }
]

export const MOCK_SITE_CONFIG: SiteConfig = {
  siteName: 'Chronicle',
  tagline: 'Where architecture, code, and technical thoughts converge.',
  announcementBanner: '✨ Welcome to Chronicle — A high-signal publication hub for engineers and creators.',
  allowAnonymousReading: true,
  autoApproveAuthors: false,
  maintenanceMode: false,
  featuredCategory: 'Engineering'
}

export const MOCK_POSTS: BlogPost[] = [
  {
    id: '11111111-1111-4111-a111-111111111111',
    title: 'Architecting Distributed Real-time Applications with Next.js 16 and Supabase',
    slug: 'architecting-distributed-realtime-apps-nextjs16-supabase',
    excerpt: 'Building scalable web applications in modern software engineering demands a zero-compromise approach to database security, real-time synchronization, and edge execution performance. Explore server actions, edge database caching, and row-level security policy design for high-scale enterprise applications.',
    content: `Building scalable web applications in 2026 demands a zero-compromise approach to database security, real-time sync, and edge execution performance.

## The Shift to Edge & Row-Level Security

With **Supabase** acting as our persistent relational engine and **Next.js 16** powering the application layer, we eliminate middle-tier boilerplate while retaining granular security control.

### Why Row-Level Security (RLS) Matters

Instead of relying solely on API middleware checks that can be accidentally bypassed, database RLS policies enforce access control directly at the Postgres engine level.

\`\`\`sql
CREATE POLICY "Approved authors can publish posts" ON public.posts
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND verification_status = 'approved'
    )
  );
\`\`\`

### Performance Optimization Strategies

1. **Stale-While-Revalidate Caching**: Cache expensive render passes at the CDN layer.
2. **Selective Hydration**: Keep interactive islands client-side while keeping reader content zero-JS HTML server output.
3. **Database Connection Pooling**: Utilize Supabase Transaction Pooler for serverless function scaling.

By unifying these patterns, your publishing platform maintains sub-50ms response times globally.`,
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    category: 'Engineering',
    tags: ['Next.js', 'Supabase', 'Architecture', 'TypeScript'],
    authorId: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    authorName: 'Elena Rostova',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    authorUsername: 'elena_arch',
    isPublished: true,
    isFeatured: true,
    readTime: '6 min read',
    viewsCount: 2480,
    likesCount: 194,
    status: 'published',
    createdAt: '2026-07-28T14:20:00Z'
  },
  {
    id: '22222222-2222-4222-a222-222222222222',
    title: 'The Psychology of Micro-Interactions in Dark Theme Interfaces',
    slug: 'psychology-of-micro-interactions-dark-theme-interfaces',
    excerpt: 'In modern software design, dark mode has evolved far beyond a simple aesthetic preference—it is a low-luminance sensory environment where user focus and visual fatigue dictate interaction patterns. Discover how kinetic visual feedback, haptic micro-animations, and subtle light washes keep users engaged.',
    content: `Dark mode is no longer just an aesthetic toggle; it is a fundamental pillar of modern visual design systems.

When users navigate dark interfaces, contrast management becomes paramount. Plain black background (\`#000000\`) creates harsh visual contrast that fatigues the retina. Instead, deep slate gradients (\`#0B0F17\` to \`#111827\`) paired with muted neon accents create depth.

### Principles of Visual Depth

- **Elevated Surfaces**: Use lighter slate fills with subtle border highlights (\`border-slate-800/60\`).
- **Glow Effects**: Soft radial background blurs guide the reader's eye naturally toward primary actions.
- **Haptic Micro-Animations**: Smooth scale transitions (\`hover:scale-[1.02]\`) convey tactile feedback.`,
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    category: 'Design',
    tags: ['UI/UX', 'Dark Mode', 'Frontend', 'CSS'],
    authorId: 'usr-author-2',
    authorName: 'Marcus Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    authorUsername: 'marcus_ai',
    isPublished: true,
    isFeatured: false,
    readTime: '4 min read',
    viewsCount: 1320,
    likesCount: 98,
    status: 'published',
    createdAt: '2026-07-25T09:15:00Z'
  },
  {
    id: '33333333-3333-4333-a333-333333333333',
    title: 'Building Autonomous AI Agents with Persistent Memory Trees',
    slug: 'building-autonomous-ai-agents-persistent-memory-trees',
    excerpt: 'Exploring vector embeddings, episodic memory retrieval, and multi-agent coordination frameworks in production.',
    content: `Autonomous AI agents are evolving from ephemeral chat completion handlers into long-running cognitive entities.

In this breakdown, we examine how context preservation across multi-step execution flows enables agents to perform complex, multi-file code refactorings without context degradation.

### Key Components

1. **Short-Term Context Buffer**: Active scratchpad for current sub-task execution.
2. **Episodic Knowledge Base**: Vector database containing past conversation summaries and decisions.
3. **Guardrail Validators**: Deterministic lint and test checks preventing unsafe actions.`,
    coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80',
    category: 'AI & Systems',
    tags: ['AI', 'Agents', 'Python', 'LLM'],
    authorId: 'usr-author-2',
    authorName: 'Marcus Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    authorUsername: 'marcus_ai',
    isPublished: true,
    isFeatured: false,
    readTime: '5 min read',
    viewsCount: 3100,
    likesCount: 265,
    status: 'published',
    createdAt: '2026-07-20T18:00:00Z'
  }
]

export const MOCK_REPORTS: ContentReport[] = [
  {
    id: 'rep-1',
    postId: '33333333-3333-4333-a333-333333333333',
    postTitle: 'Building Autonomous AI Agents with Persistent Memory Trees',
    reporterName: 'David Miller',
    reason: 'spam',
    details: 'Testing the reporting functionality for verification testing.',
    status: 'pending',
    createdAt: '2026-07-29T11:00:00Z'
  }
]
