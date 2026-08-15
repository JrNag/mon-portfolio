import { createClient } from '@/lib/supabase'
import { HeroSection } from '@/components/blocks/hero-section-5'

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
      <section id="projets" className="max-w-6xl mx-auto px-6 md:px-10 py-24">
        <div className="flex items-end justify-between mb-14">
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
          <div className="card border-dashed py-24 text-center">
            <p className="text-[var(--ink-faint)] font-[family-name:var(--font-display)] text-lg">
              Rien à voir pour l&apos;instant — le premier projet arrive bientôt.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap items-start gap-x-6 gap-y-10">
            {safePosts.map((post, i) => {
              const mediaCount = post.media?.length ?? 1
              const number = String(i + 1).padStart(2, '0')

              // tailles, décalages et rotations variés → vrai effet "pêle-mêle"
              const widths = [
                'w-full sm:w-[47%] lg:w-[36%]',
                'w-full sm:w-[44%] lg:w-[24%]',
                'w-full sm:w-[47%] lg:w-[29%]',
                'w-full sm:w-[44%] lg:w-[21%]',
                'w-full sm:w-[47%] lg:w-[32%]',
                'w-full sm:w-[100%] lg:w-[19%]',
              ]
              const offsets = ['mt-0', 'mt-12', 'mt-4', 'mt-20', 'mt-2', 'mt-9']
              const rotations = ['-rotate-3', 'rotate-2', 'rotate-1', '-rotate-4', 'rotate-3', '-rotate-2', 'rotate-1']
              const aspects = ['aspect-[4/5]', 'aspect-square', 'aspect-[3/4]', 'aspect-[5/4]', 'aspect-[4/5]']

              const width = widths[i % widths.length]
              const offset = offsets[i % offsets.length]
              const rotate = rotations[i % rotations.length]
              const aspect = aspects[i % aspects.length]

              return (
                <a
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className={`group relative z-0 block no-underline text-[var(--ink)] animate-fadeup ${width} ${offset} ${rotate} hover:rotate-0 hover:z-10 hover:-translate-y-1.5 transition-all duration-500 ease-out`}
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  <div className="rounded-[var(--radius-l)] bg-[var(--surface)] border border-[var(--line)] p-2.5 shadow-[var(--shadow-card)] group-hover:shadow-[var(--shadow-pop)] group-hover:border-[var(--ink)]/15 transition-shadow duration-500">
                    {/* ---- média ---- */}
                    <div className={`relative overflow-hidden rounded-[calc(var(--radius-l)-8px)] bg-[var(--ink)]/5 ${aspect}`}>
                      {post.media_type === 'video' ? (
                        <video
                          src={post.media_url}
                          muted
                          loop
                          playsInline
                          autoPlay
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <img
                          src={post.media_url}
                          alt={post.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-out"
                        />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                      <span className="absolute top-3 left-3 font-[family-name:var(--font-body)] text-[10px] font-semibold tracking-wide text-white/90 bg-black/45 backdrop-blur px-2.5 py-1 rounded-full">
                        Projet {number}
                      </span>

                      {mediaCount > 1 && (
                        <span className="absolute top-3 right-3 font-[family-name:var(--font-body)] text-[10px] text-white bg-black/45 backdrop-blur px-2 py-1 rounded-full">
                          {mediaCount} médias
                        </span>
                      )}
                    </div>

                    {/* ---- légende façon polaroid ---- */}
                    <div className="px-2.5 pt-4 pb-3">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight group-hover:text-[var(--accent)] transition-colors">
                          {post.title}
                        </h3>
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-[var(--line-strong)] text-[var(--ink)] group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)] group-hover:text-white transition-all duration-300 shrink-0">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
                            <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </div>

                      {post.description && (
                        <p className="text-[13px] text-[var(--ink-soft)] leading-relaxed mb-3">
                          {post.description.length > 64
                            ? `${post.description.slice(0, 64).trim()}…`
                            : post.description}
                        </p>
                      )}

                      {post.tech_links && (
                        <div className="flex flex-wrap gap-1.5">
                          {post.tech_links.split(',').slice(0, 3).map((link, j) => (
                            <span
                              key={j}
                              className="font-[family-name:var(--font-body)] text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/15"
                            >
                              {link.trim().replace(/^https?:\/\//, '').split('/')[0]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
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