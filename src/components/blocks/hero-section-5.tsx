import Link from 'next/link'
import DottedSurface from '@/components/ui/dotted-surface'

/**
 * HeroSection — bandeau d'accueil "carte" plein largeur avec fond animé :
 * nappe de points 3D ondulante (Three.js) + grille + vignette. Navigation
 * intégrée à la carte, gros titre, CTA, ligne de stats.
 *
 * Nécessite le package "three" (npm install three @types/three).
 */
export function HeroSection({ projectCount }: { projectCount?: number } = {}) {
  return (
    <section className="px-3 md:px-6 pt-4">
      <div className="relative overflow-hidden rounded-[28px] md:rounded-[32px] border border-white/10 bg-[var(--accent-ink)] shadow-[0_30px_80px_-20px_rgba(11,13,22,0.55)]">
        {/* ============= FOND ANIMÉ ============= */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <DottedSurface size={7} opacity={0.75} sizeAttenuation vertexColors className="absolute inset-0" />

          {/* grille fine */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
              backgroundSize: '44px 44px',
              maskImage: 'radial-gradient(ellipse 70% 70% at 50% 30%, black 40%, transparent 90%)',
            }}
          />

          {/* vignette pour la lisibilité du texte */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--accent-ink)] via-[var(--accent-ink)]/10 to-[var(--accent-ink)]/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-ink)] via-[var(--accent-ink)]/30 to-transparent" />
        </div>

        {/* ============= NAV ============= */}
        <div className="relative z-10 flex items-center justify-between px-6 md:px-10 h-20">
          <Link href="/" className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
            portfolio<span className="text-[var(--accent)]">.</span>
          </Link>
          <Link href="/login" className="btn btn-ghost">
            Connexion
          </Link>
        </div>

        {/* ============= CONTENU ============= */}
        <div className="relative z-10 px-6 md:px-10 pb-20 pt-8 md:pt-14">
          <span className="hero-fadeup hero-delay-1 eyebrow text-white/50 mb-5 inline-block">
            Développeur full-stack · disponible pour de nouveaux projets
          </span>

          <h1 className="hero-fadeup hero-delay-2 font-[family-name:var(--font-display)] text-white text-[2.6rem] leading-[1.08] md:text-6xl md:leading-[1.05] font-semibold max-w-3xl">
            Des interfaces claires,
            <br />
            du code qui <span className="text-[var(--accent)]">tient la route.</span>
          </h1>

          <p className="hero-fadeup hero-delay-3 mt-6 max-w-lg text-[15px] leading-relaxed text-white/60">
            Ici, un aperçu des projets sur lesquels je travaille : applications,
            expérimentations, refontes — du prototype à la mise en production.
          </p>

          <div className="hero-fadeup hero-delay-4 mt-9 flex flex-wrap items-center gap-3">
            <Link href="#projets" className="btn btn-primary">
              Voir les projets
            </Link>
            <Link href="/login" className="btn btn-ghost">
              Espace admin
            </Link>
          </div>

          <dl className="hero-fadeup hero-delay-5 mt-16 grid grid-cols-3 max-w-md gap-6 border-t border-white/10 pt-8">
            <div>
              <dt className="eyebrow text-white/40">Projets</dt>
              <dd className="font-[family-name:var(--font-display)] text-2xl font-semibold mt-1 text-white">
                {projectCount ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-white/40">Stack</dt>
              <dd className="font-[family-name:var(--font-display)] text-2xl font-semibold mt-1 text-white">Full</dd>
            </div>
            <div>
              <dt className="eyebrow text-white/40">Statut</dt>
              <dd className="font-[family-name:var(--font-display)] text-2xl font-semibold mt-1 text-[var(--accent)]">
                Actif
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}