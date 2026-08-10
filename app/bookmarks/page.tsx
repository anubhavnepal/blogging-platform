import { Navbar } from '@/components/layout/Navbar'
import { BookmarksView } from '@/components/posts/BookmarksView'

export default function BookmarksPage() {
  return (
    <main className="min-h-screen bg-[#0B0F17]">
      <Navbar />
      <BookmarksView />
    </main>
  )
}
