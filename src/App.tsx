import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { COZY_ANIME_THEME } from './data/themes'
import { useAppStore } from './store/useAppStore'
import { AnimeSkyBackdrop } from './scene/AnimeSkyBackdrop'
import { StationWorld } from './scene/StationWorld'
import { ShinkansenTrain } from './scene/ShinkansenTrain'
import { CameraRig } from './scene/CameraRig'
import { PersonaHUD } from './components/hud/PersonaHUD'
import { BlogsSection } from './components/sections/BlogsSection'
import { GuestbookBoard } from './components/sections/GuestbookBoard'
import { ProjectsSection } from './components/sections/ProjectsSection'
import { MusicPlayer } from './components/sections/MusicPlayer'
import { AboutSection } from './components/sections/AboutSection'

function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    )
  } catch {
    return false
  }
}

export default function App() {
  const qualityTier = useAppStore((s) => s.qualityTier)
  const sceneLoaded = useAppStore((s) => s.sceneLoaded)
  const activeSection = useAppStore((s) => s.activeSection)
  const openSection = useAppStore((s) => s.openSection)
  const [webglReady] = useState(() => checkWebGLSupport())
  const isPortrait = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* HD Cozy Anime 3D Viewport (ACES Filmic + Soft Shadows + Adaptive DPR) */}
      {webglReady ? (
        <Canvas
          shadows={qualityTier === 'high' ? 'percentage' : false}
          dpr={qualityTier === 'low' ? [1, 1.5] : [1, 2]}
          camera={{
            position: [30.2, 2.55, -4.35],
            fov: isPortrait ? 56 : 44,
            near: 0.12,
            far: 260,
          }}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.06,
            outputColorSpace: THREE.SRGBColorSpace,
          }}
        >
          <fog attach="fog" args={[COZY_ANIME_THEME.scene.fogColor, 34, 155]} />
          <AnimeSkyBackdrop />
          <Suspense fallback={null}>
            <StationWorld />
            <ShinkansenTrain />
          </Suspense>
          <CameraRig />
        </Canvas>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-[#ff9d6c] to-[#ffe4b5] p-6">
          <div className="persona-panel max-w-md p-6 text-center">
            <p className="font-jp text-sm font-black text-[#5c9b6b]">シロ駅</p>
            <h1 className="font-display text-2xl">SHIRO STATION</h1>
            <p className="mt-2 text-xs font-bold opacity-80">
              WebGL is disabled on this browser — explore the portfolio sections directly below:
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {(['about', 'projects', 'blogs', 'music', 'guestbook'] as const).map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => openSection(sec)}
                  className="cursor-pointer rounded-lg border-2 border-[#5c4033] bg-[#ffb347] px-3 py-1.5 text-xs font-black uppercase"
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Atmospheric Station Loading Curtain */}
      {webglReady && !sceneLoaded && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#ff9d6c] via-[#ffcf86] to-[#fff0c9] text-[#2b211c]">
          <div className="persona-panel persona-skew px-6 py-4 text-center">
            <div className="persona-unskew">
              <p className="font-jp text-lg font-black text-[#5c9b6b]">シロ駅</p>
              <h1 className="font-display text-2xl tracking-wider">SHIRO STATION</h1>
              <p className="mt-1.5 animate-pulse text-xs font-bold tracking-widest uppercase opacity-75">
                PREPARING PLATFORM 1 &amp; N700S EXPRESS...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Clean Minimalist Cozy Anime HUD */}
      <PersonaHUD />

      {/* Active Section Overlays (Opened on 2nd Click!) */}
      {activeSection === 'blogs' && <BlogsSection />}
      {activeSection === 'guestbook' && <GuestbookBoard />}
      {activeSection === 'projects' && <ProjectsSection />}
      {activeSection === 'music' && <MusicPlayer />}
      {activeSection === 'about' && <AboutSection />}
    </div>
  )
}
