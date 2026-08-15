import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import StoryGallery from '@/components/StoryGallery'

export const revalidate = 0

type MediaItem = { url: string; type: string }

export default async function PostDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createClient()
  const { data: post } = await supabase.from('posts').select('*').eq('id', id).single()

  if (!post) notFound()

  const media: MediaItem[] =
    Array.isArray(post.media) && post.media.length > 0
      ? post.media
      : [{ url: post.media_url, type: post.media_type }]

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      {/* ================= EN-TÊTE ================= */}
      <header className="border-b border-[var(--line)]">
        <div className="max-w-4xl mx-auto px-5 md:px-10 h-16 flex items-center justify-between">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Portfolio
          </a>
          <span className="eyebrow hidden sm:block">Étude de projet</span>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-5 md:px-10 py-12 md:py-16">
        {/* ================= TITRE ================= */}
        <div className="mb-10 max-w-2xl">
          <span className="eyebrow inline-flex items-center gap-2 mb-5">
            <span className="w-6 h-px bg-[var(--accent)]" />
            Projet
          </span>
          <h1 className="font-[family-name:var(--font-serif)] italic text-4xl md:text-6xl font-medium leading-[1.05] tracking-tight">
            {post.title}
          </h1>
        </div>

        {/* ================= GALERIE MÉDIA ================= */}
        <StoryGallery media={media} />

        {/* ================= CONTENU ================= */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 md:gap-16 items-start">
          {post.description && (
            <p className="text-[17px] leading-relaxed text-[var(--ink-soft)] whitespace-pre-line max-w-xl">
              {post.description}
            </p>
          )}

          {post.tech_links && (
            <div className="md:w-56 shrink-0">
              <span className="eyebrow block mb-3">Stack &amp; liens</span>
              <div className="flex flex-col gap-2">
                {post.tech_links.split(',').map((link: string, i: number) => (
                  <a
                    key={i}
                    href={link.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between font-[family-name:var(--font-body)] text-sm font-medium px-4 py-2.5 rounded-[var(--radius-s)] border border-[var(--line)] hover:border-[var(--ink)] transition-colors"
                  >
                    {link.trim().replace(/^https?:\/\//, '').split('/')[0]}
                    <span className="text-[var(--ink-faint)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all">
                      →
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors mt-16 pt-8 border-t border-[var(--line)] w-full"
        >
          ← Retour aux projets
        </a>
      </article>
    </main>
  )
}