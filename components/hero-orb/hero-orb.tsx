'use client'

// Skills ref (3d-web-experience): detect WebGL support before creating Canvas.
// Since this component is loaded with ssr:false, we can check synchronously
// at first render — no useEffect needed, no hydration flash.

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbScene } from './orb-scene'

function canUseWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl') || (c as any).getContext('experimental-webgl'))
  } catch {
    return false
  }
}

let _webGLChecked = false
let _webGLOK      = false
function isWebGLSupported(): boolean {
  if (!_webGLChecked) { _webGLChecked = true; _webGLOK = canUseWebGL() }
  return _webGLOK
}

// Static fallback — rendered when WebGL is unsupported OR the orb scene crashes.
// Keeps the right column visually intentional rather than silently blank.
function OrbFallback() {
  return (
    <div
      aria-hidden="true"
      className="w-full h-full flex items-center justify-center bg-bg-subtle"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="120"
        height="69"
        viewBox="0 0 52.082 30.457"
        fill="none"
        className="opacity-60"
      >
        <path
          d="M 10.421 5.234 C 10.421 2.343 12.754 0 15.631 0 C 18.509 0 20.842 2.343 20.842 5.234 L 20.842 10.326 C 20.842 10.326 21.153 12.766 22.164 13.809 C 23.206 14.886 25.723 15.229 25.723 15.229 L 26.382 15.229 C 26.382 15.229 28.898 14.886 29.941 13.809 C 30.799 12.924 31.153 11.031 31.24 10.48 L 31.24 5.234 C 31.24 2.343 33.573 0 36.451 0 C 39.328 0 41.661 2.343 41.661 5.234 L 41.661 10.326 C 41.661 10.326 41.972 12.766 42.983 13.809 C 44.026 14.886 46.542 15.229 46.542 15.229 L 47.852 15.229 C 50.188 15.229 52.082 17.131 52.082 19.477 L 52.082 30.457 L 41.661 30.457 L 41.661 15.229 L 36.121 15.229 C 36.121 15.229 33.605 15.571 32.562 16.648 C 31.704 17.534 31.35 19.426 31.263 19.977 L 31.263 25.224 C 31.263 28.114 28.93 30.457 26.052 30.457 C 23.175 30.457 20.842 28.114 20.842 25.224 L 20.842 20.131 C 20.842 20.131 20.501 17.604 19.429 16.556 C 18.39 15.541 15.961 15.229 15.961 15.229 L 10.421 15.229 L 10.421 30.457 L 0 30.457 L 0 19.477 C 0 17.131 1.894 15.229 4.23 15.229 L 5.54 15.229 C 5.54 15.229 8.056 14.886 9.099 13.809 C 10.11 12.766 10.421 10.326 10.421 10.326 L 10.421 5.234 Z"
          fill="#296ff0"
          fillRule="evenodd"
        />
      </svg>
    </div>
  )
}

// Catches runtime errors in the orb scene (Three.js init crash, GPU driver
// panic, scene render error). Renders the static M-wordmark fallback so the
// hero never has a silent empty 40% column.
class OrbErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('HeroOrb crashed; rendering fallback.', error, info)
    }
  }

  render() {
    if (this.state.hasError) return <OrbFallback />
    return this.props.children
  }
}

export function HeroOrb() {
  if (!isWebGLSupported()) return <OrbFallback />

  return (
    <OrbErrorBoundary>
      <div aria-hidden="true" style={{ width: '100%', height: '100%' }}>
        <Canvas
          camera={{ position: [0, 0, 5.5], fov: 48 }}
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true }}
          style={{ background: 'transparent' }}
        >
          <OrbScene />
        </Canvas>
      </div>
    </OrbErrorBoundary>
  )
}
