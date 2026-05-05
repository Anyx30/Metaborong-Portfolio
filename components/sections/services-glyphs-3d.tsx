'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

type GlyphProps = {
  active: boolean
  primed?: boolean
  reducedMotion?: boolean
}

const stateClass = (primed: boolean, active: boolean) => {
  if (!primed) return 'opacity-0'
  return active ? 'opacity-100' : 'opacity-50'
}

const wrapClass = 'w-full h-full transition-opacity duration-300 ease-out'

// ─── Web3 ── isometric block, beveled, premium ────────────────────────────────

function Web3Block({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => {
    if (!ref.current || reducedMotion) return
    if (active) {
      ref.current.rotation.y += delta * 0.35
    }
  })
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} color="#ffffff" />
      <directionalLight position={[-3, -2, -1]} intensity={0.35} color="#7aa3ff" />
      <RoundedBox
        ref={ref as never}
        args={[1.4, 1.4, 1.4]}
        radius={0.12}
        smoothness={6}
        rotation={[Math.atan(1 / Math.sqrt(2)), Math.PI / 4, 0]}
      >
        <meshStandardMaterial
          color="#204AF8"
          metalness={0.3}
          roughness={0.42}
          envMapIntensity={0.6}
        />
      </RoundedBox>
    </>
  )
}

export function Web3Glyph3D({ active, primed, reducedMotion }: GlyphProps) {
  return (
    <div className={`${wrapClass} ${stateClass(primed ?? false, active)}`} aria-hidden="true">
      <Canvas
        orthographic
        camera={{ position: [0, 0, 5], zoom: 56 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.outputColorSpace = THREE.SRGBColorSpace
        }}
      >
        <Web3Block active={active} reducedMotion={reducedMotion ?? false} />
      </Canvas>
    </div>
  )
}

// ─── AI Agents ── neural network, 4 nodes + 5 connecting tubes ────────────────

const AI_NODES: [number, number, number][] = [
  [0, 0.85, 0.2],     // top
  [-0.95, -0.15, 0.4],// left-front
  [0.9, -0.1, -0.35], // right-back
  [0.05, -0.85, 0.15],// bottom
]

const AI_EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 3],
  [1, 2],
]

function tubeBetween(a: THREE.Vector3, b: THREE.Vector3): THREE.TubeGeometry {
  const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5)
  // Slight curve out toward the origin's perpendicular for organic feel
  const offset = mid.clone().normalize().multiplyScalar(-0.18)
  const ctrl = mid.add(offset)
  const curve = new THREE.QuadraticBezierCurve3(a, ctrl, b)
  return new THREE.TubeGeometry(curve, 16, 0.025, 8, false)
}

function NeuralNet({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null)

  const tubes = useMemo(() => {
    return AI_EDGES.map(([i, j]) =>
      tubeBetween(
        new THREE.Vector3(...AI_NODES[i]),
        new THREE.Vector3(...AI_NODES[j])
      )
    )
  }, [])

  useEffect(() => {
    return () => {
      tubes.forEach((g) => g.dispose())
    }
  }, [tubes])

  useFrame((_, delta) => {
    if (!groupRef.current || reducedMotion) return
    groupRef.current.rotation.y += delta * (active ? 0.45 : 0.15)
    groupRef.current.rotation.x = Math.sin(performance.now() * 0.0004) * 0.15
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={1.3} color="#ffffff" />
      <directionalLight position={[-2, -1, -3]} intensity={0.4} color="#5be3b3" />
      <group ref={groupRef}>
        {AI_NODES.map((p, i) => (
          <mesh key={`node-${i}`} position={p}>
            <sphereGeometry args={[i === 0 ? 0.22 : 0.17, 24, 24]} />
            <meshStandardMaterial
              color="#10b981"
              metalness={0.35}
              roughness={0.32}
              emissive="#0a8a62"
              emissiveIntensity={0.18}
            />
          </mesh>
        ))}
        {tubes.map((geom, idx) => (
          <mesh key={`edge-${idx}`} geometry={geom}>
            <meshStandardMaterial
              color="#10b981"
              metalness={0.2}
              roughness={0.55}
              transparent
              opacity={0.85}
            />
          </mesh>
        ))}
      </group>
    </>
  )
}

export function AIAgentsGlyph3D({ active, primed, reducedMotion }: GlyphProps) {
  return (
    <div className={`${wrapClass} ${stateClass(primed ?? false, active)}`} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0.3, 3.4], fov: 38 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.outputColorSpace = THREE.SRGBColorSpace
        }}
      >
        <NeuralNet active={active} reducedMotion={reducedMotion ?? false} />
      </Canvas>
    </div>
  )
}

// ─── Product Studio ── stacked layered slabs ──────────────────────────────────

const LAYERS = [
  { y: 0.42, color: '#FFB068', metalness: 0.18, roughness: 0.45 },
  { y: 0.0, color: '#F6851B', metalness: 0.22, roughness: 0.5 },
  { y: -0.42, color: '#C56612', metalness: 0.25, roughness: 0.55 },
] as const

function LayeredStack({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (!groupRef.current || reducedMotion) return
    if (active) {
      groupRef.current.rotation.y += delta * 0.25
    }
  })
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[2.5, 4, 3]} intensity={1.4} color="#ffffff" />
      <directionalLight position={[-2, -1, -2]} intensity={0.35} color="#ffd5a0" />
      <group ref={groupRef} rotation={[Math.PI / 7, -Math.PI / 5, 0]}>
        {LAYERS.map((l, i) => (
          <RoundedBox
            key={i}
            args={[1.55, 0.18, 1.15]}
            radius={0.07}
            smoothness={4}
            position={[0, l.y, 0]}
          >
            <meshStandardMaterial
              color={l.color}
              metalness={l.metalness}
              roughness={l.roughness}
              envMapIntensity={0.5}
            />
          </RoundedBox>
        ))}
      </group>
      <ContactShadows
        position={[0, -0.85, 0]}
        opacity={0.32}
        scale={3.2}
        blur={2.2}
        far={2}
      />
    </>
  )
}

export function ProductStudioGlyph3D({ active, primed, reducedMotion }: GlyphProps) {
  return (
    <div className={`${wrapClass} ${stateClass(primed ?? false, active)}`} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0.3, 3.6], fov: 36 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.outputColorSpace = THREE.SRGBColorSpace
        }}
      >
        <LayeredStack active={active} reducedMotion={reducedMotion ?? false} />
      </Canvas>
    </div>
  )
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export function PillarGlyph3D({
  pillarId,
  active,
  primed,
  reducedMotion,
}: {
  pillarId: 'web3' | 'ai-agents' | 'product-studio'
  active: boolean
  primed?: boolean
  reducedMotion?: boolean
}) {
  if (pillarId === 'web3') return <Web3Glyph3D active={active} primed={primed} reducedMotion={reducedMotion} />
  if (pillarId === 'ai-agents') return <AIAgentsGlyph3D active={active} primed={primed} reducedMotion={reducedMotion} />
  return <ProductStudioGlyph3D active={active} primed={primed} reducedMotion={reducedMotion} />
}
