import type { Metadata } from 'next'
import { Sora, Manrope, Fraunces } from 'next/font/google'
import './globals.css'

// Display : élégante, arrondie, chaleureuse — porte la personnalité du site
const sora = Sora({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
})

// Texte courant + étiquettes : une seule famille, cohérente et lisible
const manrope = Manrope({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
})

// Serif éditoriale — réservée aux grands titres (page projet) pour une touche
// plus soignée, avec un bel italique
const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
})

export const metadata: Metadata = {
  title: 'Portfolio — NAGNIMARI Junior',
  description: 'Projets, expérimentations et réalisations récentes.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body
        className={`${sora.variable} ${manrope.variable} ${fraunces.variable} font-[family-name:var(--font-body)] bg-[var(--paper)] text-[var(--ink)] antialiased`}
      >
        {children}
      </body>
    </html>
  )
}