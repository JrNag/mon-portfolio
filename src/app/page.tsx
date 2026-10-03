import { createClient } from '@/lib/supabase'
import { HeroSection } from '@/components/blocks/hero-section-5'
import ProjectsShowcase from '@/components/ProjectsShowcase'

export const revalidate = 0

type Post = {
  id: string
  title: string
  description: string
  media_url: string
  media_type: string
  tech_links: string
  media?: { url: string; type: string }[]
  created_at: string
}

export default async function Home() {
  const supabase = createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  const safePosts: Post[] = posts ?? []

  // Image de couverture de chaque projet (1re image, sinon 1er média)
  const showcaseProjects = safePosts.map((p) => {
    const list = p.media && p.media.length > 0 ? p.media : [{ url: p.media_url, type: p.media_type }]
    const cover = list.find((m) => m.type !== 'video') ?? list[0]
    return {
      id: p.id,
      title: p.title,
      src: cover.url,
      type: (cover.type === 'video' ? 'video' : 'image') as 'image' | 'video',
    }
  })

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)] pt-3">
      <HeroSection projectCount={safePosts.length} />

      {/* ================= PRÉSENTATION ================= */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 border-b border-[var(--line)]">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-[family-name:var(--font-display)] text-xl font-semibold shrink-0">
            NJ
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
              NAGNIMARI Junior
            </h2>
            <p className="text-[var(--ink-soft)] text-[15px] mt-1">
              Étudiant en Licence 3 à IPNET Institute of Technology, passionné de développement
              web et d&apos;interfaces bien pensées.
            </p>
          </div>
        </div>
      </section>

      {/* ================= GRILLE DE PROJETS ================= */}
      <section id="projets" className="pt-24">
        <div className="max-w-6xl mx-auto px-6 md:px-10 flex items-end justify-between mb-14">
          <div>
            <span className="eyebrow inline-flex items-center gap-2">
              <span className="w-6 h-px bg-[var(--accent)]" />
              Réalisations
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-[2.75rem] font-semibold mt-3 tracking-tight">
              Derniers projets
            </h2>
          </div>
          <div className="hidden sm:flex items-baseline gap-2 font-[family-name:var(--font-display)]">
            <span className="text-3xl font-semibold text-[var(--accent)]">
              {String(safePosts.length).padStart(2, '0')}
            </span>
            <span className="text-sm text-[var(--ink-faint)]">projet{safePosts.length > 1 ? 's' : ''}</span>
          </div>
        </div>

        {safePosts.length === 0 ? (
          <div className="max-w-6xl mx-auto px-6 md:px-10"><div className="card border-dashed py-24 text-center">
            <p className="text-[var(--ink-faint)] font-[family-name:var(--font-display)] text-lg">
              Rien à voir pour l&apos;instant — le premier projet arrive bientôt.
            </p>
          </div></div>
        ) : (
          <ProjectsShowcase projects={showcaseProjects} />
        )}
      </section>

      {/* ================= FOOTER ================= */}
      <footer id="a-propos" className="border-t border-[var(--line)]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--ink-faint)]">
            © {new Date().getFullYear()} — construit avec Next.js &amp; Supabase.
          </p>
          <a href="/login" className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">
            Espace privé →
          </a>
        </div>
      </footer>
    </main>
  )
}