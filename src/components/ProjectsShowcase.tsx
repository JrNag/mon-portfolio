'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import WheelCarousel, { type WheelCarouselItem } from '@/components/ui/wheel-carousel'

export type ShowcaseProject = {
  id: string
  title: string
  src: string
  type: 'image' | 'video'
}

export default function ProjectsShowcase({ projects }: { projects: ShowcaseProject[] }) {
  const router = useRouter()

  const items: WheelCarouselItem[] = useMemo(
    () =>
      projects.map((p) => ({
        label: p.title,
        image: p.src,
        type: p.type,
        href: `/posts/${p.id}`,
      })),
    [projects]
  )

  if (items.length === 0) return null

  return (
    <WheelCarousel
      items={items}
      onItemClick={(item) => item.href && router.push(item.href)}
      className="border-y border-[var(--line)]"
    />
  )
}