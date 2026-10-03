'use client'

import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/* ==========================================================================
   Galerie 3D infinie (adaptée de "3d-gallery-photography")
   - les images défilent en profondeur, en boucle
   - onActiveChange(index) : renvoie le projet actuellement "au centre"
   - onItemClick(index)    : clic sur une image
   ========================================================================== */

export type GalleryItem = {
  src: string
  type?: 'image' | 'video'
  title: string
  href: string
}

type FadeSettings = {
  fadeIn: { start: number; end: number }
  fadeOut: { start: number; end: number }
}

type BlurSettings = {
  blurIn: { start: number; end: number }
  blurOut: { start: number; end: number }
  maxBlur: number
}

export interface InfiniteGalleryProps {
  items: GalleryItem[]
  speed?: number
  visibleCount?: number
  /** Si true, la molette contrôle la galerie (bloque le scroll de la page au survol). */
  captureWheel?: boolean
  fadeSettings?: FadeSettings
  blurSettings?: BlurSettings
  onActiveChange?: (index: number) => void
  onItemClick?: (index: number) => void
  className?: string
  style?: CSSProperties
}

const DEPTH_RANGE = 50
const MAX_HORIZONTAL_OFFSET = 8
const MAX_VERTICAL_OFFSET = 8

const DEFAULT_FADE: FadeSettings = {
  fadeIn: { start: 0.05, end: 0.25 },
  fadeOut: { start: 0.4, end: 0.43 },
}
const DEFAULT_BLUR: BlurSettings = {
  blurIn: { start: 0.0, end: 0.1 },
  blurOut: { start: 0.4, end: 0.43 },
  maxBlur: 8.0,
}

/* ------------------------------ matériau tissu ----------------------------- */
const createClothMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      map: { value: null },
      opacity: { value: 1.0 },
      blurAmount: { value: 0.0 },
      scrollForce: { value: 0.0 },
      time: { value: 0.0 },
      isHovered: { value: 0.0 },
    },
    vertexShader: `
      uniform float scrollForce;
      uniform float time;
      uniform float isHovered;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vec3 pos = position;

        float curveIntensity = scrollForce * 0.3;
        float distanceFromCenter = length(pos.xy);
        float curve = distanceFromCenter * distanceFromCenter * curveIntensity;

        float ripple1 = sin(pos.x * 2.0 + scrollForce * 3.0) * 0.02;
        float ripple2 = sin(pos.y * 2.5 + scrollForce * 2.0) * 0.015;
        float clothEffect = (ripple1 + ripple2) * abs(curveIntensity) * 2.0;

        float flagWave = 0.0;
        if (isHovered > 0.5) {
          float wavePhase = pos.x * 3.0 + time * 8.0;
          float waveAmplitude = sin(wavePhase) * 0.1;
          float dampening = smoothstep(-0.5, 0.5, pos.x);
          flagWave = waveAmplitude * dampening;
          flagWave += sin(pos.x * 5.0 + time * 12.0) * 0.03 * dampening;
        }

        pos.z -= (curve + clothEffect + flagWave);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform float opacity;
      uniform float blurAmount;
      uniform float scrollForce;
      varying vec2 vUv;

      void main() {
        vec4 color = texture2D(map, vUv);

        if (blurAmount > 0.0) {
          vec2 texelSize = 1.0 / vec2(textureSize(map, 0));
          vec4 blurred = vec4(0.0);
          float total = 0.0;
          for (float x = -2.0; x <= 2.0; x += 1.0) {
            for (float y = -2.0; y <= 2.0; y += 1.0) {
              vec2 offset = vec2(x, y) * texelSize * blurAmount;
              float weight = 1.0 / (1.0 + length(vec2(x, y)));
              blurred += texture2D(map, vUv + offset) * weight;
              total += weight;
            }
          }
          color = blurred / total;
        }

        float curveHighlight = abs(scrollForce) * 0.05;
        color.rgb += vec3(curveHighlight * 0.1);

        gl_FragColor = vec4(color.rgb, color.a * opacity);
      }
    `,
  })

/* ------------------------- chargement des textures ------------------------- */
function useMediaTextures(items: GalleryItem[]) {
  const [textures, setTextures] = useState<(THREE.Texture | null)[]>([])

  useEffect(() => {
    let cancelled = false
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    const created: THREE.Texture[] = []
    const videos: HTMLVideoElement[] = []

    setTextures(items.map(() => null))

    const assign = (i: number, tex: THREE.Texture) => {
      if (cancelled) {
        tex.dispose()
        return
      }
      created.push(tex)
      setTextures((prev) => {
        const next = [...prev]
        next[i] = tex
        return next
      })
    }

    items.forEach((item, i) => {
      if (item.type === 'video') {
        const v = document.createElement('video')
        v.crossOrigin = 'anonymous'
        v.src = item.src
        v.muted = true
        v.loop = true
        v.playsInline = true
        v.play().catch(() => {})
        videos.push(v)
        assign(i, new THREE.VideoTexture(v))
      } else {
        loader.load(item.src, (tex) => assign(i, tex), undefined, () => {})
      }
    })

    return () => {
      cancelled = true
      created.forEach((t) => t.dispose())
      videos.forEach((v) => {
        v.pause()
        v.removeAttribute('src')
        v.load()
      })
    }
  }, [items])

  return textures
}

function getAspect(tex: THREE.Texture) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const im = tex.image as any
  const w = im?.videoWidth || im?.naturalWidth || im?.width
  const h = im?.videoHeight || im?.naturalHeight || im?.height
  return w && h ? w / h : 1
}

const noRaycast = () => {}

/* --------------------------------- scène ---------------------------------- */
function Scene({
  items,
  speed = 1,
  visibleCount = 10,
  captureWheel = false,
  fadeSettings = DEFAULT_FADE,
  blurSettings = DEFAULT_BLUR,
  onActiveChange,
  onItemClick,
}: Omit<InfiniteGalleryProps, 'className' | 'style'>) {
  const { gl } = useThree()
  const N = items.length
  const V = visibleCount

  const textures = useMediaTextures(items)

  const materials = useMemo(
    () => Array.from({ length: V }, () => createClothMaterial()),
    [V]
  )
  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials])

  const meshRefs = useRef<(THREE.Mesh | null)[]>([])

  // z = profondeur 0..DEPTH_RANGE ; v = rang virtuel (sert à choisir l'image)
  const planes = useMemo(
    () =>
      Array.from({ length: V }, (_, i) => ({
        z: (DEPTH_RANGE / V) * i,
        v: i,
      })),
    [V]
  )

  const spatial = useMemo(
    () =>
      Array.from({ length: V }, (_, i) => {
        const hAngle = (i * 2.618) % (Math.PI * 2)
        const vAngle = (i * 1.618 + Math.PI / 3) % (Math.PI * 2)
        const hRadius = (i % 3) * 1.2
        const vRadius = ((i + 1) % 4) * 0.8
        return {
          x: (Math.sin(hAngle) * hRadius * MAX_HORIZONTAL_OFFSET) / 3,
          y: (Math.cos(vAngle) * vRadius * MAX_VERTICAL_OFFSET) / 4,
        }
      }),
    [V]
  )

  const ctrl = useRef({
    velocity: 0,
    auto: true,
    last: 0,
    inside: false,
    dragging: false,
    lastX: 0,
    active: -1,
    pending: 0, // avance directe (en unités de profondeur) pilotée par le scroll de la page
    flex: 0, // déformation visuelle due au scroll
  })

  const cbRef = useRef({ onActiveChange, onItemClick })
  cbRef.current = { onActiveChange, onItemClick }

  /* ----------------------------- entrées utilisateur ---------------------------- */
  useEffect(() => {
    const el = gl.domElement
    const c = ctrl.current
    el.style.touchAction = 'pan-y' // le scroll vertical de la page reste possible

    const interact = () => {
      c.auto = false
      c.last = performance.now()
    }

    const onWheel = (e: WheelEvent) => {
      if (!captureWheel) return
      e.preventDefault()
      c.velocity += e.deltaY * 0.01 * speed
      interact()
    }
    // le scroll de la page (molette, tactile, scrollbar) accélère le défilement
    let lastY = window.scrollY
    const onPageScroll = () => {
      const dy = window.scrollY - lastY
      lastY = window.scrollY
      const r = el.getBoundingClientRect()
      if (r.bottom < 0 || r.top > window.innerHeight) return // section hors écran
      // le scroll de la page fait avancer les projets directement :
      // ~60% d'une hauteur d'écran de scroll = 1 projet
      const pxPerProject = window.innerHeight * 0.6
      c.pending += (dy / pxPerProject) * (DEPTH_RANGE / V)
      c.flex = Math.max(-3, Math.min(3, c.flex + dy * 0.004))
    }
    const onKey = (e: KeyboardEvent) => {
      if (!c.inside) return
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        c.velocity -= 2 * speed
        interact()
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        c.velocity += 2 * speed
        interact()
      }
    }
    const onDown = (e: PointerEvent) => {
      c.dragging = true
      c.lastX = e.clientX
      interact()
    }
    const onMove = (e: PointerEvent) => {
      if (!c.dragging) return
      const dx = e.clientX - c.lastX
      c.lastX = e.clientX
      c.velocity -= dx * 0.03 * speed // glisser vers la gauche = avancer
      interact()
    }
    const onUp = () => {
      c.dragging = false
      c.last = performance.now()
    }
    const onEnter = () => (c.inside = true)
    const onLeave = () => {
      c.inside = false
      c.dragging = false
      el.style.cursor = ''
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onPageScroll, { passive: true })
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onPageScroll)
    }
  }, [gl, speed, captureWheel, V])

  /* ---------------------------------- boucle ---------------------------------- */
  useFrame((state, rawDelta) => {
    if (N === 0) return
    const c = ctrl.current
    const delta = Math.min(rawDelta, 0.05)

    if (!c.auto && !c.dragging && performance.now() - c.last > 3000) c.auto = true
    if (c.auto) c.velocity += 0.3 * delta
    c.velocity *= Math.pow(0.95, delta * 60)
    c.flex *= Math.pow(0.9, delta * 60)
    const pendingZ = c.pending
    c.pending = 0

    const time = state.clock.getElapsedTime()
    const fi = fadeSettings.fadeIn
    const fo = fadeSettings.fadeOut
    const bi = blurSettings.blurIn
    const bo = blurSettings.blurOut
    const maxBlur = blurSettings.maxBlur
    const focus = (fi.end + fo.start) / 2

    let bestDist = Infinity
    let bestIdx = -1

    planes.forEach((p, i) => {
      // avance + bouclage
      let z = p.z + c.velocity * delta * 10 + pendingZ
      if (z >= DEPTH_RANGE) {
        const w = Math.floor(z / DEPTH_RANGE)
        z -= DEPTH_RANGE * w
        p.v -= w * V
      } else if (z < 0) {
        const w = Math.ceil(-z / DEPTH_RANGE)
        z += DEPTH_RANGE * w
        p.v += w * V
      }
      p.z = z

      const imageIndex = (((-p.v % N) + N) % N) | 0
      const n = z / DEPTH_RANGE

      // opacité
      let opacity = 0
      if (n < fi.start) opacity = 0
      else if (n < fi.end) opacity = (n - fi.start) / (fi.end - fi.start)
      else if (n < fo.start) opacity = 1
      else if (n < fo.end) opacity = 1 - (n - fo.start) / (fo.end - fo.start)
      opacity = Math.max(0, Math.min(1, opacity))

      // flou
      let blur = 0
      if (n < bi.start) blur = maxBlur
      else if (n < bi.end) blur = maxBlur * (1 - (n - bi.start) / (bi.end - bi.start))
      else if (n < bo.start) blur = 0
      else if (n < bo.end) blur = (maxBlur * (n - bo.start)) / (bo.end - bo.start)
      else blur = maxBlur
      blur = Math.max(0, Math.min(maxBlur, blur))

      const mesh = meshRefs.current[i]
      const mat = materials[i]
      const tex = textures[imageIndex]
      if (!mesh || !tex) {
        if (mesh) mesh.visible = false
        return
      }

      const aspect = getAspect(tex)
      mesh.visible = opacity > 0.01
      mesh.position.set(spatial[i].x, spatial[i].y, z - DEPTH_RANGE / 2)
      if (aspect > 1) mesh.scale.set(2 * aspect, 2, 1)
      else mesh.scale.set(2, 2 / aspect, 1)
      mesh.userData.index = imageIndex
      // seules les images bien visibles sont cliquables
      mesh.raycast = opacity > 0.6 ? THREE.Mesh.prototype.raycast : noRaycast

      mat.uniforms.map.value = tex
      mat.uniforms.opacity.value = opacity
      mat.uniforms.blurAmount.value = blur
      mat.uniforms.time.value = time
      mat.uniforms.scrollForce.value = c.velocity + c.flex
      if (opacity <= 0.6) mat.uniforms.isHovered.value = 0

      // projet "actif" = le plus proche de la zone de netteté
      if (opacity > 0.3) {
        const d = Math.abs(n - focus)
        if (d < bestDist) {
          bestDist = d
          bestIdx = imageIndex
        }
      }
    })

    if (bestIdx !== -1 && bestIdx !== c.active) {
      c.active = bestIdx
      cbRef.current.onActiveChange?.(bestIdx)
    }
  })

  if (N === 0) return null

  return (
    <>
      {materials.map((m, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el
          }}
          material={m}
          visible={false}
          onClick={(e) => {
            if (e.delta > 6) return // c'était un glissement, pas un clic
            e.stopPropagation()
            cbRef.current.onItemClick?.(e.object.userData.index)
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            m.uniforms.isHovered.value = 1
            gl.domElement.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            m.uniforms.isHovered.value = 0
            gl.domElement.style.cursor = ''
          }}
        >
          <planeGeometry args={[1, 1, 32, 32]} />
        </mesh>
      ))}
    </>
  )
}

/* ------------------------------ repli sans WebGL ----------------------------- */
function FallbackGallery({ items }: { items: GalleryItem[] }) {
  return (
    <div className="h-full w-full overflow-y-auto p-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((it, i) => (
          <a key={i} href={it.href} className="block text-white no-underline">
            {it.type === 'video' ? (
              <video src={it.src} muted playsInline className="w-full h-40 object-cover rounded" />
            ) : (
              <img src={it.src} alt={it.title} className="w-full h-40 object-cover rounded" />
            )}
            <span className="block mt-2 text-sm">{it.title}</span>
          </a>
        ))}
      </div>
    </div>
  )
}

/* --------------------------------- composant -------------------------------- */
function InfiniteGallery({
  items,
  className = 'h-96 w-full',
  style,
  speed,
  visibleCount,
  captureWheel,
  fadeSettings,
  blurSettings,
  onActiveChange,
  onItemClick,
}: InfiniteGalleryProps) {
  const [webgl, setWebgl] = useState<boolean | null>(null)
  const [inView, setInView] = useState(true)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      setWebgl(!!(canvas.getContext('webgl2') || canvas.getContext('webgl')))
    } catch {
      setWebgl(false)
    }
  }, [])

  // on met le rendu en pause quand la section n'est pas à l'écran
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrapRef} className={className} style={style}>
      {webgl === false ? (
        <FallbackGallery items={items} />
      ) : webgl ? (
        <Canvas
          camera={{ position: [0, 0, 0], fov: 55 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          frameloop={inView ? 'always' : 'never'}
        >
          <Scene
            items={items}
            speed={speed}
            visibleCount={visibleCount}
            captureWheel={captureWheel}
            fadeSettings={fadeSettings}
            blurSettings={blurSettings}
            onActiveChange={onActiveChange}
            onItemClick={onItemClick}
          />
        </Canvas>
      ) : null}
    </div>
  )
}

export default memo(InfiniteGallery)