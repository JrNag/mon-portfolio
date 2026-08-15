'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function PostForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [techLinks, setTechLinks] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (files.length === 0) {
      setError('Choisis au moins une image ou vidéo.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setError('Session expirée, reconnecte-toi.')
      setLoading(false)
      return
    }

    const media: { url: string; type: string }[] = []

    for (const file of files) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('media1').upload(fileName, file)

      if (uploadError) {
        setError("Erreur lors de l'upload : " + uploadError.message)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage.from('media1').getPublicUrl(fileName)
      media.push({
        url: urlData.publicUrl,
        type: file.type.startsWith('video') ? 'video' : 'image',
      })
    }

    const { error: insertError } = await supabase.from('posts').insert({
      title,
      description,
      tech_links: techLinks,
      media_url: media[0].url,
      media_type: media[0].type,
      media,
      author_id: user.id,
    })

    setLoading(false)

    if (insertError) {
      setError('Erreur lors de la publication : ' + insertError.message)
      return
    }

    setTitle('')
    setDescription('')
    setTechLinks('')
    setFiles([])
    setSuccess(true)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="card lg:sticky lg:top-28 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Nouveau projet
        </h2>
        <span className="chip">draft</span>
      </div>

      <div>
        <label htmlFor="title" className="field-label">
          Titre
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nom du projet"
          required
          className="field-input"
        />
      </div>

      <div>
        <label htmlFor="description" className="field-label">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="En quelques phrases, ce que fait le projet"
          rows={3}
          className="field-input resize-none"
        />
      </div>

      <div>
        <label htmlFor="techLinks" className="field-label">
          Liens techs (séparés par des virgules)
        </label>
        <input
          id="techLinks"
          type="text"
          value={techLinks}
          onChange={(e) => setTechLinks(e.target.value)}
          placeholder="https://github.com/... , https://demo.com"
          className="field-input"
        />
      </div>

      <div>
        <label className="field-label">Images ou vidéos (plusieurs possibles)</label>
        <label className="flex items-center justify-center px-4 py-6 rounded-[var(--radius-s)] border-2 border-dashed border-[var(--line)] hover:border-[var(--accent)] cursor-pointer transition-colors text-center">
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            required
            className="hidden"
          />
          <span className="text-sm text-[var(--ink-soft)]">
            {files.length > 0
              ? `${files.length} fichier(s) sélectionné(s)`
              : 'Clique pour choisir un ou plusieurs fichiers'}
          </span>
        </label>
      </div>

      {error && (
        <p className="text-[var(--danger)] text-sm font-medium bg-[var(--danger)]/8 border border-[var(--danger)]/20 rounded-[var(--radius-s)] px-3.5 py-2.5">
          {error}
        </p>
      )}
      {success && (
        <p className="text-[var(--ok)] text-sm font-medium bg-[var(--ok)]/8 border border-[var(--ok)]/20 rounded-[var(--radius-s)] px-3.5 py-2.5">
          Publié avec succès.
        </p>
      )}

      <button type="submit" disabled={loading} className="btn btn-primary w-full py-3">
        {loading ? 'Publication…' : 'Publier'}
      </button>
    </form>
  )
}