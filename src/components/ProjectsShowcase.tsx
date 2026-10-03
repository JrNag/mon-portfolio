'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import InfiniteGallery, { type GalleryItem } from '@/components/ui/3d-gallery-photography'

export type ShowcaseProject = {
  id: string
  title: string
  src: string
  type: 'image' | 'video'
}

export default function ProjectsShowcase({ projects }: { projects: ShowcaseProject[] }) {
  const router = useRouter()
  const [active, setActive] = useState(0)

  const items: GalleryItem[] = useMemo(
    () =>
      projects.map((p) => ({
        src: p.src,
        type: p.type,
        title: p.title,
        href: `/posts/${p.id}`,
      })),
    [projects]
  )

  const handleClick = useCallback(
    (i: number) => {
      const item = items[i]
      if (item) router.push(item.href)
    },
    [items, router]
  )

  const current = items[active] ?? items[0]
  if (!current) return null

  return (
    // Conteneur haut = durée du scroll pendant lequel la section reste épinglée
    <div className="relative" style={{ height: `${(items.length * 0.6 + 1) * 100}dvh` }}>
      <div className="sticky top-0 h-dvh w-full overflow-hidden bg-white text-[var(--ink)]">
      <InfiniteGallery
        items={items}
        speed={1.5}
        visibleCount={10}
        className="absolute inset-0"
        onActiveChange={setActive}
        onItemClick={handleClick}
      />

      {/* Nom du projet actif (remplace le "Shadway" fixe) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-white mix-blend-exclusion">
        <h3
          key={active}
          className="animate-fadeup font-[family-name:var(--font-serif)] italic text-4xl md:text-7xl tracking-tight"
        >
          {current.title}
        </h3>
      </div>

      {/* Compteur */}
      <span className="pointer-events-none absolute top-5 left-6 font-[family-name:var(--font-display)] text-xs text-black/50">
        {String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
      </span>

      {/* Aide */}
      <p className="pointer-events-none absolute bottom-8 left-0 right-0 px-6 text-center font-[family-name:var(--font-display)] text-sm tracking-wide text-black/50">
        <span className="md:hidden">Faites défiler ou glissez, puis touchez une image pour l&apos;ouvrir</span>
        <span className="hidden md:inline">Scrollez ou glissez, puis cliquez sur une image pour l&apos;ouvrir</span>
      </p>
      </div>
    </div>
  )
}