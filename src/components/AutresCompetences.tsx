'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import SkillsOrbit from './SkillsOrbit'

// ssr:false → Three.js a besoin du navigateur (WebGL)
const BearScene = dynamic(() => import('./animation/BearScene'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[var(--accent-ink)]" />,
})

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

export default function AutresCompetences() {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  // L'animation 3D ne tourne que lorsque la section est à l'écran
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '150px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Transition liée au scroll : --p (0 → 1) pilote l'ouverture de la section colorée
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0

    const update = () => {
      raf = 0
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      // 0 quand le haut de la section touche le bas de l'écran, 1 quand elle est presque en haut
      const raw = (vh - rect.top) / (vh * 0.95)
      const p = reduce ? 1 : easeOutCubic(Math.min(1, Math.max(0, raw)))
      el.style.setProperty('--p', p.toFixed(4))
      // le halo coloré apparaît puis s'efface une fois la section entièrement ouverte
      el.style.setProperty('--glow', (Math.sin(Math.PI * Math.min(1, p * 1.05)) * 0.95).toFixed(3))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="autres-competences"
      className="relative w-full h-[820px] md:h-[900px] overflow-hidden bg-[var(--paper)]"
      style={{ ['--p' as string]: 0, ['--glow' as string]: 0 }}
    >
      {/* Halo multicolore qui borde le rideau pendant l'ouverture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ filter: 'blur(28px)', opacity: 'var(--glow)' as unknown as number }}
        aria-hidden
      >
        <div
          className="absolute inset-0 aurora-edge"
          style={{
            clipPath:
              'ellipse(calc(var(--p) * 100% + 6%) calc(var(--p) * 140% + 10%) at 50% 0%)',
          }}
        />
      </div>

      {/* Contenu : révélé en cercle depuis le haut au fil du scroll */}
      <div
        className="absolute inset-0 bg-[var(--accent-ink)]"
        style={{
          clipPath: 'ellipse(calc(var(--p) * 100%) calc(var(--p) * 140%) at 50% 0%)',
        }}
      >
        {/* Animation 3D en fond, sur toute la section */}
        <div className="absolute inset-0">
          <BearScene eventSource={sectionRef as React.RefObject<HTMLElement>} active={visible} />
        </div>

        {/* Léger voile sombre pour la lisibilité */}
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />

        {/* Lueur colorée en haut, qui adoucit le passage calme → vivant */}
        <div className="absolute inset-x-0 top-0 h-48 pointer-events-none competences-topglow" />

        {/* Titre */}
        <div
          className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 pt-14 pointer-events-none"
          style={{
            opacity: 'calc((var(--p) - 0.55) * 2.4)' as unknown as number,
            transform: 'translateY(calc((1 - var(--p)) * 36px))',
          }}
        >
          <span className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-white/70">
            <span className="w-6 h-px bg-white/70" />
            Et aussi
          </span>
          <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-[2.75rem] font-semibold mt-3 tracking-tight text-white">
            Autres compétences
          </h2>
        </div>

        {/* Carrousel orbital au centre */}
        <div
          className="absolute inset-0 flex items-center justify-center pt-16 pointer-events-none"
          style={{
            opacity: 'calc((var(--p) - 0.5) * 2)' as unknown as number,
            transform: 'scale(calc(0.85 + var(--p) * 0.15))',
          }}
        >
          <SkillsOrbit />
        </div>
      </div>
    </section>
  )
}