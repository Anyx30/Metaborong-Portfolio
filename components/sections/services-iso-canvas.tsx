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
const INACTIVE_LABEL_COLOR = '#94a3b8'

// Three cubes spaced along x-axis, base sitting at y=0 (the floor plane).
const POSITIONS: Record<PillarId, [number, number, number]> = {
  'ai-agents':       [-2.6, 0, 0],
  'web3':            [ 0,   0, 0],
  'product-studio':  [ 2.6, 0, 0],
}

const CUBE_SIZE = 1.6 // edge length
const LABEL_HOVER_Y = 2.05 // height above floor — clears active cube top (y=1.6) without clipping the canvas viewport

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
    camera.lookAt(0, 0.4, 0)
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
  const targetScale = isActive ? 1 : 0.001

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

  const color = PILLAR_COLOR[id]
  const labelColor = isActive ? color : INACTIVE_LABEL_COLOR

  return (
    <group position={position}>
      {/* Cube — base pinned at y=0, scales upward */}
      <group ref={extrudeRef} scale={[1, isActive ? 1 : 0.001, 1]}>
        <mesh castShadow receiveShadow position={[0, CUBE_SIZE / 2, 0]}>
          <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
          <meshStandardMaterial
            color={isActive ? color : INACTIVE_COLOR}
            metalness={0.02}
            roughness={0.7}
          />
          <Edges
            threshold={15}
            color={isActive ? color : '#94a3b8'}
            lineWidth={1.2}
          />
        </mesh>
      </group>

      {/* Footprint — always visible, pillar-tinted when active */}
      <FootprintOutline color={isActive ? color : '#cbd5e1'} />

      {/* Label — 3D SDF text via Drei. Rendered on top (depthTest=false) so it
          always reads above the cube regardless of camera angle. White outline
          keeps it readable when label color overlaps a same-color cube face. */}
      <Text
        position={[0, LABEL_HOVER_Y, 0]}
        rotation={[0, 0, 0]}
        fontSize={0.32}
        color={labelColor}
        anchorX="center"
        anchorY="bottom"
        letterSpacing={0.18}
        characters="WEB3AIPRODUCT"
        outlineWidth={0.012}
        outlineColor="#fafbff"
        outlineBlur={0}
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

function FootprintOutline({ color }: { color: string }) {
  const s = CUBE_SIZE
  return (
    <lineSegments position={[0, 0.005, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[
            new Float32Array([
              -s / 2, 0,  s / 2,   s / 2, 0,  s / 2,
               s / 2, 0,  s / 2,   s / 2, 0, -s / 2,
               s / 2, 0, -s / 2,  -s / 2, 0, -s / 2,
              -s / 2, 0, -s / 2,  -s / 2, 0,  s / 2,
            ]),
            3,
          ]}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={0.55} />
    </lineSegments>
  )
}
