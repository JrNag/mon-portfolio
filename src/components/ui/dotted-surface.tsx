'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

type DottedSurfaceProps = {
  size?: number
  opacity?: number
  sizeAttenuation?: boolean
  vertexColors?: boolean
  className?: string
}

const SEPARATION = 34
const AMOUNT_X = 60
const AMOUNT_Y = 46

export default function DottedSurface({
  size = 8,
  opacity = 0.8,
  sizeAttenuation = true,
  vertexColors = true,
  className,
}: DottedSurfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let width = container.clientWidth
    let height = container.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(70, width / height, 1, 3000)
    camera.position.set(0, 320, 620)
    camera.lookAt(0, -60, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    container.appendChild(renderer.domElement)

    // ---- grille de points ----
    const positions: number[] = []
    const colors: number[] = []
    const baseColor = new THREE.Color('#5b7bff')
    const tipColor = new THREE.Color('#8dd8ff')

    for (let ix = 0; ix < AMOUNT_X; ix++) {
      for (let iy = 0; iy < AMOUNT_Y; iy++) {
        const x = ix * SEPARATION - (AMOUNT_X * SEPARATION) / 2
        const z = iy * SEPARATION - (AMOUNT_Y * SEPARATION) / 2
        positions.push(x, 0, z)

        const mix = iy / AMOUNT_Y
        const c = baseColor.clone().lerp(tipColor, mix)
        colors.push(c.r, c.g, c.b)
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size,
      sizeAttenuation,
      vertexColors,
      color: vertexColors ? undefined : 0x9db4ff,
      transparent: true,
      opacity,
      depthWrite: false,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    let frameId = 0
    let count = 0
    const posAttr = geometry.attributes.position as THREE.BufferAttribute

    function animate() {
      let i = 0
      for (let ix = 0; ix < AMOUNT_X; ix++) {
        for (let iy = 0; iy < AMOUNT_Y; iy++) {
          const y =
            Math.sin((ix + count) * 0.28) * 22 + Math.sin((iy + count) * 0.42) * 22
          posAttr.setY(i, y)
          i++
        }
      }
      posAttr.needsUpdate = true
      count += 0.06

      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }
    animate()

    function handleResize() {
      if (!container) return
      width = container.clientWidth
      height = container.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [size, opacity, sizeAttenuation, vertexColors])

  return <div ref={containerRef} className={className ?? 'absolute inset-0'} />
}