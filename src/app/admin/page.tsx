import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import PostForm from '@/components/PostForm'
import LogoutButton from '@/components/LogoutButton'
import StatCard from '@/components/StatCard'
import AdminPostsList from '@/components/AdminPostsList'

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  const safePosts = posts ?? []
  const videoCount = safePosts.filter((p) => p.media_type === 'video').length
  const imageCount = safePosts.length - videoCount
  const lastPublished = safePosts[0]
    ? new Date(safePosts[0].created_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
      })
    : '—'

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      {/* ================= TOP BAR ================= */}
      <header className="border-b border-[var(--line)] bg-[var(--surface)]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <span className="eyebrow">Espace admin</span>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold mt-1">
              Tableau de bord
            </h1>
          </div>
          <div className="flex items-center gap-5">
            <a href="/" className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors hidden sm:block">
              Voir le site →
            </a>
            <span className="w-px h-5 bg-[var(--line)] hidden sm:block" />
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* ================= STATS ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <StatCard label="Projets publiés" value={safePosts.length} />
          <StatCard label="Images" value={imageCount} />
          <StatCard label="Vidéos" value={videoCount} />
          <StatCard label="Dernière publication" value={lastPublished} accent />
        </div>

        {/* ================= FORMULAIRE + LISTE ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
          <PostForm />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
                Tes projets
              </h2>
              <span className="chip">{safePosts.length} au total</span>
            </div>

            <AdminPostsList posts={safePosts} />
          </div>
        </div>
      </div>
    </main>
  )
}