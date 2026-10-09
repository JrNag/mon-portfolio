'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'

export interface WheelCarouselItem {
  label: string
  image: string
  type?: 'image' | 'video'
  href?: string
}

export interface WheelCarouselProps {
  items: WheelCarouselItem[]
  onItemClick?: (item: WheelCarouselItem, index: number) => void
  actionLabel?: string
  scrollPerItem?: number // en % de hauteur d'écran, par projet (défaut 70)
  radius?: number
  spacing?: number
  visibleItems?: number
  apexInset?: number
  textColor?: string
  selectedColor?: string
  markerColor?: string
  background?: string
  className?: string
}

// true sous 768px (breakpoint `md` de Tailwind)
function useIsMobile() {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const on = () => setMobile(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return mobile
}

const START = 0.04 // marge au début / à la fin pour garder le 1er et le dernier projet affichés
const SPAN = 0.92

export default function WheelCarousel({
  items,
  onItemClick,
  actionLabel = 'Voir le projet →',
  scrollPerItem = 70,
  radius: radiusProp = 380,
  spacing: spacingProp = 13,
  visibleItems: visibleProp = 6,
  apexInset: apexProp = 12,
  textColor = 'rgba(18, 20, 26, 0.32)',
  selectedColor = '#12141a',
  markerColor = '#3452ff',
  background = 'var(--paper)',
  className = '',
}: WheelCarouselProps) {
  const reduceMotion = useReducedMotion() ?? false
  const isMobile = useIsMobile()
  // 📱 Sur mobile : arc presque droit (grand rayon, faible angle) → les titres restent dans l'écran
  //    au lieu de partir vers la gauche et d'être coupés comme avant.
  const radius = isMobile ? 1000 : radiusProp
  const spacing = isMobile ? 4.5 : spacingProp
  const visibleItems = isMobile ? 3 : visibleProp
  const apexInset = isMobile ? 9 : apexProp
  const n = items.length
  const wrapperRef = useRef<HTMLDivElement>(null)
  const labelRefs = useRef<(HTMLDivElement | null)[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ['start start', 'end end'] })

  // ⚡ Les titres sont déplacés directement dans le DOM (sans re-rendu React) → scroll fluide.
  // React ne se met à jour que lorsque le projet sélectionné change.
  const update = useCallback(
    (p: number) => {
      const t = Math.min(1, Math.max(0, (p - START) / SPAN))
      const rotation = t * (n - 1)

      labelRefs.current.forEach((el, index) => {
        if (!el) return
        const offset = index - rotation
        if (Math.abs(offset) > visibleItems + 1) {
          el.style.opacity = '0'
          return
        }
        const angle = offset * spacing
        const rad = (angle * Math.PI) / 180
        const x = -radius * (1 - Math.cos(rad))
        const y = radius * Math.sin(rad)
        const distance = Math.min(Math.abs(offset) / visibleItems, 1)
        const scale = 1 - Math.min(Math.abs(offset) * 0.04, 0.45)
        el.style.opacity = String(Math.cos((distance * Math.PI) / 2))
        el.style.transform = `translate3d(${x}px, ${y}px, 0) translateY(-50%) rotate(${angle}deg) scale(${scale})`
      })

      const idx = Math.min(n - 1, Math.max(0, Math.round(rotation)))
      setSelectedIndex((prev) => (prev === idx ? prev : idx))
    },
    [n, radius, spacing, visibleItems]
  )

  useMotionValueEvent(scrollYProgress, 'change', update)
  useEffect(() => {
    update(scrollYProgress.get())
  }, [update, scrollYProgress])

  // Précharge les images pour éviter le petit "gel" au premier affichage de chaque projet
  useEffect(() => {
    items.forEach((it) => {
      if (it.type !== 'video') {
        const img = new Image()
        img.decoding = 'async'
        img.src = it.image
      }
    })
  }, [items])

  // Aller à un projet en faisant défiler la page jusqu'à la bonne position
  const goTo = (index: number) => {
    const el = wrapperRef.current
    if (!el || n < 2) return
    const i = Math.min(n - 1, Math.max(0, index))
    const t = START + SPAN * (i / (n - 1))
    const scrollable = el.offsetHeight - window.innerHeight
    const top = el.getBoundingClientRect().top + window.scrollY + t * scrollable
    window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  const selected = items[selectedIndex]
  if (!selected) return null

  return (
    // Grand conteneur : sa hauteur = la durée du scroll pendant lequel la section reste épinglée
    <div ref={wrapperRef} className="relative" style={{ height: `${100 + (n - 1) * scrollPerItem}dvh` }}>
      <div
        className={`sticky top-0 h-dvh w-full overflow-hidden ${className}`}
        style={{ backgroundColor: background }}
      >
        {/* Compteur */}
        <span className="pointer-events-none absolute top-5 left-6 md:left-10 z-20 font-[family-name:var(--font-display)] text-xs text-black/50">
          {String(selectedIndex + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
        </span>

        <div className="flex h-full w-full flex-col md:flex-row">
          {/* ---------- Photo du projet ---------- */}
          <div className="flex h-[50%] md:h-full w-full md:w-[44%] shrink-0 flex-col items-center justify-center gap-4 px-5 md:pl-10 md:pr-4 pt-12 md:pt-0">
            <button
              type="button"
              onClick={() => onItemClick?.(selected, selectedIndex)}
              aria-label={`Ouvrir ${selected.label}`}
              className="relative w-[min(100%,calc((50dvh_-_7rem)_*_4_/_3))] md:w-full md:max-h-[calc(100%-4.5rem)] overflow-hidden rounded-2xl bg-[#ececE6] cursor-pointer"
              style={{ aspectRatio: '4 / 3' }}
            >
              <AnimatePresence initial={false} mode="sync">
                {selected.type === 'video' ? (
                  <motion.video
                    key={`${selectedIndex}-${selected.image}`}
                    src={selected.image}
                    autoPlay
                    muted
                    loop
                    playsInline
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.3 }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <motion.img
                    key={`${selectedIndex}-${selected.image}`}
                    src={selected.image}
                    alt={selected.label}
                    draggable={false}
                    decoding="async"
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.3 }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
              </AnimatePresence>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Projet précédent"
                onClick={() => goTo(selectedIndex - 1)}
                disabled={selectedIndex === 0}
                className="rounded-full border border-[var(--line)] bg-white p-2 text-[var(--ink)] shadow-sm hover:bg-[var(--paper)] transition-colors disabled:opacity-30"
              >
                <ChevronUp size={18} />
              </button>
              <button
                type="button"
                onClick={() => onItemClick?.(selected, selectedIndex)}
                className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                {actionLabel}
              </button>
              <button
                type="button"
                aria-label="Projet suivant"
                onClick={() => goTo(selectedIndex + 1)}
                disabled={selectedIndex === n - 1}
                className="rounded-full border border-[var(--line)] bg-white p-2 text-[var(--ink)] shadow-sm hover:bg-[var(--paper)] transition-colors disabled:opacity-30"
              >
                <ChevronDown size={18} />
              </button>
            </div>
          </div>

          {/* ---------- Roue des titres (pilotée par le scroll) ---------- */}
          <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
            <span
              aria-hidden="true"
              className="absolute top-1/2 z-10 -translate-y-1/2 rounded-full"
              style={{
                left: `calc(${apexInset}% - 22px)`,
                width: 14,
                height: 14,
                backgroundColor: markerColor,
              }}
            />

            {items.map((item, index) => (
              <div
                key={`${item.label}-${index}`}
                ref={(el) => {
                  labelRefs.current[index] = el
                }}
                aria-current={index === selectedIndex}
                className="pointer-events-none absolute top-1/2 origin-left overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(0.95rem,2vw,1.75rem)] font-medium leading-tight tracking-[-0.01em] opacity-0 will-change-transform transition-colors duration-200"
                style={{
                  left: `${apexInset}%`,
                  maxWidth: `${100 - apexInset - 5}%`, // le titre ne sort plus du cadre
                  color: index === selectedIndex ? selectedColor : textColor,
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Aide */}
        <p className="pointer-events-none absolute bottom-5 left-0 right-0 px-6 text-center font-[family-name:var(--font-display)] text-xs tracking-wide text-black/45">
          Scrollez pour faire défiler les projets
        </p>
      </div>
    </div>
  )
}