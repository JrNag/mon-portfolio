'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, ChevronLeft, ChevronRight } from 'lucide-react'

// ✏️ Tes compétences — modifie les textes ici si tu veux
const skills = [
  { id: 1, name: 'Git', short: 'Git', category: 'Développement', color: '#f59e0b',
    desc: 'Versionner son code et collaborer avec Git et GitHub.' },
  { id: 2, name: 'VS Code', short: 'VS', category: 'Outils', color: '#38bdf8',
    desc: 'Mon éditeur principal pour développer au quotidien.' },
  { id: 3, name: 'OSPF', short: 'OSPF', category: 'Réseau', color: '#818cf8',
    desc: 'Protocole de routage dynamique à état de liens.' },
  { id: 4, name: 'VLAN', short: 'VLAN', category: 'Réseau', color: '#818cf8',
    desc: 'Segmentation logique d’un réseau local.' },
  { id: 5, name: 'NAT', short: 'NAT', category: 'Réseau', color: '#818cf8',
    desc: 'Traduction des adresses IP privées vers publiques.' },
  { id: 6, name: 'DHCP', short: 'DHCP', category: 'Réseau', color: '#818cf8',
    desc: 'Attribution automatique des adresses IP aux machines.' },
  { id: 7, name: 'Active Directory', short: 'AD', category: 'Système', color: '#34d399',
    desc: 'Gestion centralisée des utilisateurs et des ressources Windows.' },
]

// Largeur de l'écran (0 tant que le composant n'est pas monté → rendu "bureau" côté serveur)
const useWindowWidth = () => {
  const [w, setW] = React.useState(1024)
  React.useEffect(() => {
    const check = () => setW(window.innerWidth)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return w
}

// Dimensions de l'orbite selon la largeur d'écran.
// 📱 Mobile : le rayon est calculé pour que les pastilles ne dépassent JAMAIS de l'écran
//            et laissent assez de place à la carte centrale (qui ne se superpose plus aux pastilles).
const getSizes = (w: number) => {
  if (w < 640) {
    const badge = 48
    const radius = Math.min(150, Math.floor((w - badge - 32) / 2))
    return { radius, badge, card: w < 380 ? 'w-32' : 'w-36', name: 'text-sm', text: 'text-[11px]', compact: true }
  }
  if (w < 768) return { radius: 175, badge: 72, card: 'w-52', name: 'text-lg', text: 'text-sm', compact: false }
  return { radius: 235, badge: 88, card: 'w-60', name: 'text-xl', text: 'text-sm', compact: false }
}

export default function SkillsOrbit() {
  const [active, setActive] = React.useState(0)
  const [hover, setHover] = React.useState(false)
  const width = useWindowWidth()
  const { radius, badge, card, name, text, compact } = getSizes(width)
  const box = radius * 2 + badge + 20

  const next = () => setActive((i) => (i + 1) % skills.length)
  const prev = () => setActive((i) => (i - 1 + skills.length) % skills.length)
  const rotation = (i: number) => (i - active) * (360 / skills.length)

  // Rotation automatique (en pause quand la souris est sur le carrousel)
  React.useEffect(() => {
    if (hover) return
    const t = setInterval(() => setActive((i) => (i + 1) % skills.length), 3500)
    return () => clearInterval(t)
  }, [hover])

  const s = skills[active]

  return (
    <div
      className="relative flex items-center justify-center pointer-events-auto"
      style={{ width: box, height: box }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Carte de la compétence active (centre) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={s.id}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`z-10 ${card} text-center rounded-2xl ${compact ? 'p-3' : 'p-4'} bg-black/55 backdrop-blur-md border border-white/15 shadow-2xl`}
        >
          <div
            className={`mx-auto -mt-10 mb-2 items-center justify-center rounded-full font-bold text-white border-4 ${compact ? 'hidden' : 'flex'}`}
            style={{ width: badge * 0.85, height: badge * 0.85, borderColor: s.color, background: '#0b0d16' }}
          >
            {s.short}
          </div>
          <h3 className={`font-bold text-white ${name}`}>{s.name}</h3>
          <div className={`flex items-center justify-center gap-1 mt-1 ${text}`} style={{ color: s.color }}>
            <Layers size={12} /> <span>{s.category}</span>
          </div>
          <p className={`mt-2 leading-snug text-white/70 ${text}`}>{s.desc}</p>
          <div className="flex justify-center items-center gap-2 mt-3">
            <button onClick={prev} aria-label="Précédent" className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <ChevronLeft size={16} className="text-white" />
            </button>
            <span className="text-xs text-white/60 tabular-nums">{active + 1} / {skills.length}</span>
            <button onClick={next} aria-label="Suivant" className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <ChevronRight size={16} className="text-white" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Badges en orbite */}
      {skills.map((p, i) => {
        const rot = rotation(i)
        const isActive = i === active
        return (
          <motion.div
            key={p.id}
            animate={{ transform: `rotate(${rot}deg) translateY(-${radius}px)` }}
            transition={{ type: 'spring', stiffness: 150, damping: 20, delay: isActive ? 0 : Math.abs(i - active) * 0.05 }}
            style={{
              width: badge,
              height: badge,
              position: 'absolute',
              top: `calc(50% - ${badge / 2}px)`,
              left: `calc(50% - ${badge / 2}px)`,
              zIndex: isActive ? 20 : 10,
            }}
          >
            {/* Contre-rotation pour garder le texte droit */}
            <motion.div
              animate={{ rotate: -rot }}
              transition={{ type: 'spring', stiffness: 150, damping: 20 }}
              className="w-full h-full"
            >
              <motion.button
                onClick={() => setActive(i)}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                aria-label={p.name}
                className="w-full h-full rounded-full flex items-center justify-center font-bold text-white cursor-pointer"
                style={{
                  background: isActive ? '#0b0d16' : 'rgba(11,13,22,0.85)',
                  border: `${isActive ? 4 : 2}px solid ${isActive ? p.color : 'rgba(255,255,255,0.35)'}`,
                  fontSize: p.short.length > 3 ? badge * 0.2 : badge * 0.3,
                  boxShadow: isActive ? `0 0 24px ${p.color}88` : 'none',
                }}
              >
                {p.short}
              </motion.button>
            </motion.div>
          </motion.div>
        )
      })}
    </div>
  )
}