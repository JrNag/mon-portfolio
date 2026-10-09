'use client'

import * as THREE from 'three'
import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Plane, useAspect, useTexture } from '@react-three/drei'
import { EffectComposer, DepthOfField, Vignette } from '@react-three/postprocessing'
import Fireflies from './Fireflies'
import './layerMaterial'

// Les images sont dans /public/animation/
const IMAGES = [
  '/animation/bg.jpg',
  '/animation/stars.png',
  '/animation/ground.png',
  '/animation/bear.png',
  '/animation/leaves1.png',
  '/animation/leaves2.png',
]
const COLORS = ['orange'] // constante : évite de recréer les lucioles à chaque rendu

function Scene() {
  const scaleN = useAspect(1600, 1000, 1.05)
  const scaleW = useAspect(2200, 1000, 1.05)
  const textures = useTexture(IMAGES)
  const group = useRef<THREE.Group>(null!)
  const layersRef = useRef<any[]>([])
  const [movement] = useState(() => new THREE.Vector3())
  const [temp] = useState(() => new THREE.Vector3())

  const layers = [
    { texture: textures[0], z: 0, factor: 0.005, scale: scaleW },
    { texture: textures[1], z: 10, factor: 0.005, scale: scaleW },
    { texture: textures[2], z: 20, scale: scaleW },
    { texture: textures[3], z: 30, scaleFactor: 0.83, scale: scaleN },
    { texture: textures[4], factor: 0.03, scaleFactor: 1, z: 40, wiggle: 0.6, scale: scaleW },
    { texture: textures[5], factor: 0.04, scaleFactor: 1.3, z: 49, wiggle: 1, scale: scaleW },
  ]

  useFrame((state, delta) => {
    movement.lerp(temp.set(state.pointer.x, state.pointer.y * 0.2, 0), 0.2)
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, state.pointer.x * 20, 0.2)
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, state.pointer.y / 10, 0.2)
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, -state.pointer.x / 2, 0.2)
    layersRef.current[4].uniforms.time.value = layersRef.current[5].uniforms.time.value += delta
  }, 1)

  return (
    <group ref={group}>
      <Fireflies count={20} radius={80} colors={COLORS} />
      {layers.map(({ scale, texture, factor = 0, scaleFactor = 1, wiggle = 0, z }, i) => (
        <Plane scale={scale} args={[1, 1, wiggle ? 10 : 1, wiggle ? 10 : 1]} position-z={z} key={i}>
          <layerMaterial
            movement={movement}
            textr={texture}
            factor={factor}
            ref={(el: any) => (layersRef.current[i] = el)}
            wiggle={wiggle}
            scale={scaleFactor}
          />
        </Plane>
      ))}
    </group>
  )
}

function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <DepthOfField target={[0, 0, 30]} bokehScale={8} focalLength={0.1} width={1024} />
      <Vignette />
    </EffectComposer>
  )
}

export default function BearScene({
  eventSource,
  active = true,
}: {
  eventSource?: React.RefObject<HTMLElement>
  active?: boolean // false = l'animation est mise en pause (économise le GPU)
}) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.5]}
      eventSource={eventSource}
      eventPrefix="client"
      orthographic
      camera={{ zoom: 5, position: [0, 0, 200], far: 300, near: 50 }}
    >
      <Scene />
      <Effects />
    </Canvas>
  )
}