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
  title: 'NAGNIMARI Jean-Claude Junior — Développeur Web | Portfolio',
  description:
    'Portfolio de NAGNIMARI Jean-Claude Junior, développeur web étudiant en Génie Logiciel à IPNET. Découvrez mes projets, expérimentations et réalisations récentes.',
  keywords: [
    'NAGNIMARI Jean-Claude Junior',
    'NAGNIMARI Junior',
    'développeur web',
    'IPNET',
    'génie logiciel',
    'portfolio développeur',
  ],
  authors: [{ name: 'NAGNIMARI Jean-Claude Junior' }],
  openGraph: {
    title: 'NAGNIMARI Jean-Claude Junior — Développeur Web',
    description:
      'Portfolio de NAGNIMARI Jean-Claude Junior, développeur web étudiant en Génie Logiciel à IPNET.',
    type: 'website',
    locale: 'fr_FR',
  },
  verification: {
    google: 'vRWxIfiv10xBN_GNSXCTFEGTrYaVO8UTir9opaCYUj0',
  },
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