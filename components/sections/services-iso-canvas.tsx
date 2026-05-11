'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrthographicCamera, Grid, Edges, Text } from '@react-three/drei'
import { useRef, useEffect, useState, Suspense } from 'react'
import { Group, MathUtils } from 'three'
import { type PillarId } from '@/components/sections/services-data'

const PILLAR_COLOR: Record<PillarId, string> = {
  'web3': '#204AF8',
  'ai-agents': '#10b981',
  'product-studio': '#F6851B',
}

const PILLAR_LABEL: Record<PillarId, string> = {
  'web3': 'WEB3',
  'ai-agents': 'AI',
  'product-studio': 'PRODUCT',
}

const INACTIVE_COLOR = '#cbd5e1'
const INACTIVE_LABEL_COLOR = '#1f2937'
const PLATE_HEIGHT = 0.04 // thin grey slab shown under inactive (and beneath active too)

// Three cubes spaced along x-axis, base sitting at y=0 (the floor plane).
const POSITIONS: Record<PillarId, [number, number, number]> = {
  'ai-agents':       [-2.6, 0, 0],
  'web3':            [ 0,   0, 0],
  'product-studio':  [ 2.6, 0, 0],
}

const CUBE_SIZE = 1.6 // edge length

export function ServicesIsoCanvas({ activeId }: { activeId: PillarId }) {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return (
    <div className="absolute inset-0" style={{ background: '#fafbff' }}>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        {/* True isometric ortho camera, tuned zoom so cubes fill the canvas */}
        <OrthographicCamera makeDefault position={[5, 5.5, 5]} zoom={72} near={0.1} far={50} />
        <IsoCameraTarget />

        {/* Cool neutral lighting — paper-blueprint vibe */}
        <ambientLight intensity={0.85} />
        <directionalLight
          position={[6, 9, 4]}
          intensity={0.85}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-near={0.1}
          shadow-camera-far={30}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <directionalLight position={[-5, 4, -3]} intensity={0.25} color="#dbe4ff" />

        <Floor />

        <Suspense fallback={null}>
          {(Object.keys(POSITIONS) as PillarId[]).map((id) => (
            <PillarCube
              key={id}
              id={id}
              position={POSITIONS[id]}
              isActive={id === activeId}
              reducedMotion={reducedMotion}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  )
}

function IsoCameraTarget() {
  useFrame(({ camera }) => {
    camera.lookAt(0, 0.7, 0)
  })
  return null
}

function Floor() {
  return (
    <group>
      {/* Shadow plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <shadowMaterial opacity={0.12} />
      </mesh>
      {/* Engineering grid — cell sized to cube subdivisions */}
      <Grid
        args={[40, 40]}
        position={[0, 0, 0]}
        cellSize={0.4}
        cellThickness={0.5}
        cellColor="#c5cdd9"
        sectionSize={1.6}
        sectionThickness={1}
        sectionColor="#9ca5b4"
        fadeDistance={20}
        fadeStrength={1.5}
        infiniteGrid={false}
        followCamera={false}
      />
    </group>
  )
}

function PillarCube({
  id,
  position,
  isActive,
  reducedMotion,
}: {
  id: PillarId
  position: [number, number, number]
  isActive: boolean
  reducedMotion: boolean
}) {
  const extrudeRef = useRef<Group>(null)
  // scale.y interpolates between thin grey slab (inactive) and full pillar cube (active).
  const targetScale = isActive ? 1 : PLATE_HEIGHT

  useFrame((_, delta) => {
    const eg = extrudeRef.current
    if (eg) {
      if (reducedMotion) {
        eg.scale.y = targetScale
      } else {
        eg.scale.y = MathUtils.damp(eg.scale.y, targetScale, 5, delta)
      }
    }
  })

  const color = isActive ? PILLAR_COLOR[id] : INACTIVE_COLOR
  // Label sits on the top face of the cube/plate. With scale.y applied to the parent
  // group, the local-space top of the box is at y = CUBE_SIZE (which gets scaled).
  // Position the label at scaled top via the parent group's scale by anchoring to the
  // cube body and using local y = CUBE_SIZE + small epsilon.
  const labelY = isActive ? CUBE_SIZE + 0.002 : PLATE_HEIGHT * CUBE_SIZE + 0.002

  return (
    <group position={position}>
      {/* Cube — base pinned at y=0, scales upward. Inactive cubes shrink to a thin
          grey slab (plate). The parent group's scale.y is animated for the rise. */}
      <group ref={extrudeRef} scale={[1, isActive ? 1 : PLATE_HEIGHT, 1]}>
        <mesh castShadow receiveShadow position={[0, CUBE_SIZE / 2, 0]}>
          <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
          <meshStandardMaterial color={color} metalness={0.02} roughness={0.7} />
          <Edges threshold={15} color={isActive ? color : '#94a3b8'} lineWidth={1.0} />
        </mesh>
      </group>

      {/* Label — flat on the top surface (cube top for active, plate top for inactive),
          oriented along the iso "depth" axis so the word slants up-right on screen,
          matching the Figma reference. */}
      <Text
        position={[0, labelY, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        fontSize={isActive ? 0.34 : 0.28}
        color={isActive ? '#ffffff' : INACTIVE_LABEL_COLOR}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.06}
        characters="WEB3AIPRODUCT"
        renderOrder={10}
        material-toneMapped={false}
        material-depthTest={false}
        material-transparent={true}
      >
        {PILLAR_LABEL[id]}
      </Text>
    </group>
  )
}

