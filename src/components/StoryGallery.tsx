'use client'

import { useEffect, useState, useCallback } from 'react'

type MediaItem = { url: string; type: string }

function MediaFrame({
  item,
  className,
  autoPlay = false,
}: {
  item: MediaItem
  className?: string
  autoPlay?: boolean
}) {
  if (item.type === 'video') {
    return (
      <video
        src={item.url}
        controls
        autoPlay={autoPlay}
        playsInline
        loop
        muted={autoPlay}
        className={className}
      />
    )
  }
  return <img src={item.url} alt="" className={className} />
}

export default function StoryGallery({ media }: { media: MediaItem[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const close = useCallback(() => setLightboxIndex(null), [])
  const next = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : Math.min(i + 1, media.length - 1)))
  }, [media.length])
  const prev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : Math.max(i - 1, 0)))
  }, [])

  useEffect(() => {
    if (lightboxIndex === null) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [lightboxIndex, close, next, prev])

  if (media.length === 0) return null

  const hero = media[0]
  const rest = media.slice(1)

  return (
    <>
      {/* ================= MÉDIA PRINCIPAL ================= */}
      <button
        onClick={() => setLightboxIndex(0)}
        className="group relative w-full aspect-video md:aspect-[16/8] overflow-hidden rounded-[var(--radius-l)] bg-[var(--accent-ink)] shadow-[var(--shadow-pop)] cursor-zoom-in"
      >
        <MediaFrame
          item={hero}
          autoPlay
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        <span className="absolute bottom-4 right-4 font-[family-name:var(--font-body)] text-[11px] font-medium text-white bg-black/45 backdrop-blur px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          Agrandir
        </span>
      </button>

      {/* ================= GALERIE DES AUTRES MÉDIAS ================= */}
      {rest.length > 0 && (
        <div className="mt-4">
          <span className="eyebrow">Galerie · {rest.length} autre{rest.length > 1 ? 's' : ''} média{rest.length > 1 ? 's' : ''}</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
            {rest.map((item, i) => (
              <button
                key={i}
                onClick={() => setLightboxIndex(i + 1)}
                className="group relative aspect-[3/4] overflow-hidden rounded-[var(--radius-m)] bg-[var(--ink)]/5 border border-[var(--line)] cursor-zoom-in"
              >
                <MediaFrame
                  item={item}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {item.type === 'video' && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                    <span className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--accent-ink)">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= VISIONNEUSE PLEIN ÉCRAN ================= */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-[var(--accent-ink)]/97 backdrop-blur flex items-center justify-center px-4 py-10 animate-fadeup">
          <button
            onClick={close}
            aria-label="Fermer"
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <span className="absolute top-6 left-6 font-[family-name:var(--font-body)] text-xs text-white/60">
            {lightboxIndex + 1} / {media.length}
          </span>

          {lightboxIndex > 0 && (
            <button
              onClick={prev}
              aria-label="Précédent"
              className="absolute left-3 md:left-8 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          <div className="max-w-4xl max-h-[82vh] w-full flex items-center justify-center">
            <MediaFrame
              item={media[lightboxIndex]}
              autoPlay
              className="max-w-full max-h-[82vh] w-auto h-auto object-contain rounded-[var(--radius-m)]"
            />
          </div>

          {lightboxIndex < media.length - 1 && (
            <button
              onClick={next}
              aria-label="Suivant"
              className="absolute right-3 md:right-8 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      )}
    </>
  )
}