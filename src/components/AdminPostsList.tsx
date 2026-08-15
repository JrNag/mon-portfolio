'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Post = {
  id: string
  title: string
  media_url: string
  media_type: string
  tech_links: string
  created_at: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function AdminPostsList({ posts }: { posts: Post[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const router = useRouter()

  async function handleDelete(id: string) {
    setDeletingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('posts').delete().eq('id', id)
    setDeletingId(null)
    setConfirmId(null)

    if (error) {
      alert('Suppression impossible : ' + error.message)
      return
    }
    router.refresh()
  }

  if (posts.length === 0) {
    return (
      <div className="card border-dashed py-16 text-center">
        <p className="text-[var(--ink-faint)]">
          Ton premier projet apparaîtra ici juste après publication.
        </p>
      </div>
    )
  }

  return (
    <div className="card divide-y divide-[var(--line)] overflow-hidden">
      {posts.map((post) => (
        <div key={post.id} className="flex items-center gap-4 px-4 py-3.5 hover:bg-[var(--paper)] transition-colors">
          <div className="w-14 h-14 rounded-[var(--radius-s)] overflow-hidden bg-[var(--ink)]/5 shrink-0 border border-[var(--line)]">
            {post.media_type === 'video' ? (
              <video src={post.media_url} className="w-full h-full object-cover" />
            ) : (
              <img src={post.media_url} alt={post.title} className="w-full h-full object-cover" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{post.title}</p>
            <p className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--ink-faint)] mt-0.5">
              {post.media_type === 'video' ? 'vidéo' : 'image'} · {formatDate(post.created_at)}
            </p>
          </div>

          <a
            href={`/posts/${post.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-[var(--ink-soft)] hover:text-[var(--accent)] transition-colors shrink-0"
          >
            Voir →
          </a>

          {confirmId === post.id ? (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleDelete(post.id)}
                disabled={deletingId === post.id}
                className="text-xs font-semibold text-white bg-[var(--danger)] px-3 py-1.5 rounded-full hover:opacity-90 transition disabled:opacity-50"
              >
                {deletingId === post.id ? '…' : 'Confirmer'}
              </button>
              <button
                onClick={() => setConfirmId(null)}
                className="text-xs font-medium text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors"
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmId(post.id)}
              className="text-xs font-medium text-[var(--ink-faint)] hover:text-[var(--danger)] transition-colors shrink-0"
            >
              Supprimer
            </button>
          )}
        </div>
      ))}
    </div>
  )
}