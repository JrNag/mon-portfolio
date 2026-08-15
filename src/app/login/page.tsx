'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      setError('Email ou mot de passe incorrect.')
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] bg-[var(--paper)] text-[var(--ink)]">
      {/* ================= PANNEAU GAUCHE — identité ================= */}
      <section className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[var(--accent-ink)] text-white px-14 py-12">
        <div className="animate-rail absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--accent)]" />

        {/* motif de grille discret */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <a href="/" className="relative font-[family-name:var(--font-display)] text-lg font-semibold">
          portfolio<span className="text-[var(--accent)]">.</span>
        </a>

        <div className="relative max-w-md">
          <span className="eyebrow text-white/45">Espace privé</span>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.12] mt-4">
            Chaque projet publié ici est passé par ce même formulaire.
          </h1>
          <p className="mt-5 text-white/55 text-[15px] leading-relaxed">
            Connecte-toi pour ajouter un nouveau projet, gérer les médias
            et suivre ce qui est publié sur le portfolio.
          </p>
        </div>

        <p className="relative font-[family-name:var(--font-mono)] text-xs text-white/35">
          Accès réservé au propriétaire du site.
        </p>
      </section>

      {/* ================= PANNEAU DROIT — formulaire ================= */}
      <section className="flex items-center justify-center px-6 py-16">
        <form onSubmit={handleLogin} className="w-full max-w-sm">
          <div className="lg:hidden mb-10 text-center">
            <a href="/" className="font-[family-name:var(--font-display)] text-lg font-semibold">
              portfolio<span className="text-[var(--accent)]">.</span>
            </a>
          </div>

          <span className="eyebrow">Connexion</span>
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold mt-2 mb-9">
            Content de te revoir
          </h2>

          <div className="mb-4">
            <label htmlFor="email" className="field-label">
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="toi@exemple.com"
              autoComplete="email"
              required
              className="field-input"
            />
          </div>

          <div className="mb-2">
            <label htmlFor="password" className="field-label">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="field-input pr-16"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-wide text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors"
              >
                {showPassword ? 'Masquer' : 'Afficher'}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-[var(--danger)] text-sm font-medium mt-4 bg-[var(--danger)]/8 border border-[var(--danger)]/20 rounded-[var(--radius-s)] px-3.5 py-2.5">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary w-full mt-7 py-3">
            {loading ? 'Connexion en cours…' : 'Se connecter'}
          </button>

          <a
            href="/"
            className="block text-center text-sm text-[var(--ink-faint)] hover:text-[var(--ink)] mt-6 transition-colors"
          >
            ← Retour au portfolio
          </a>
        </form>
      </section>
    </main>
  )
}