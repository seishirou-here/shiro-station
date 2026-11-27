import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { COZY_ANIME_THEME } from '../data/themes'
import { useAppStore } from '../store/useAppStore'

/**
 * Golden-Hour Cozy Anime Sky Dome + 3D Stylized Mount Fuji + Distant Twilight Hills
 * + Instanced Drifting Sakura Petals + HD Golden-Hour Lighting
 */
export function AnimeSkyBackdrop() {
  const fuji = useGLTF('/models/mount_fuji.glb')
  const qualityTier = useAppStore((s) => s.qualityTier)
  const petalCount =
    qualityTier === 'low'
      ? COZY_ANIME_THEME.scene.petalCountMobile
      : COZY_ANIME_THEME.scene.petalCountDesktop

  // Procedural Golden-Hour Sunset Gradient Sky Dome
  const skyTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 16
    canvas.height = 256
    const ctx = canvas.getContext('2d')!
    const grad = ctx.createLinearGradient(0, 0, 0, 256)
    grad.addColorStop(0.0, '#445d8c')
    grad.addColorStop(0.26, '#c77c7a')
    grad.addColorStop(0.50, '#ff9c69')
    grad.addColorStop(0.68, '#ffcf86')
    grad.addColorStop(0.84, '#fff1cc')
    grad.addColorStop(1.0, '#ffd8a8')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 16, 256)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  // Soft anime clouds & distant hills backdrop (Mt. Fuji is now real 3D geometry!)
  const horizonTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 384
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, 1024, 384)

    const drawCloud = (cx: number, cy: number, r: number, color: string) => {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.arc(cx - r * 0.78, cy + r * 0.22, r * 0.72, 0, Math.PI * 2)
      ctx.arc(cx + r * 0.82, cy + r * 0.18, r * 0.78, 0, Math.PI * 2)
      ctx.arc(cx + r * 0.22, cy - r * 0.35, r * 0.62, 0, Math.PI * 2)
      ctx.fill()
    }

    drawCloud(180, 125, 50, 'rgba(255, 226, 192, 0.72)')
    drawCloud(560, 95, 62, 'rgba(255, 236, 206, 0.75)')
    drawCloud(840, 138, 54, 'rgba(255, 210, 180, 0.72)')

    // Distant twilight hills
    ctx.fillStyle = 'rgba(116, 86, 98, 0.65)'
    ctx.beginPath()
    ctx.moveTo(0, 384)
    ctx.lineTo(0, 295)
    ctx.quadraticCurveTo(220, 260, 440, 290)
    ctx.quadraticCurveTo(700, 310, 1024, 272)
    ctx.lineTo(1024, 384)
    ctx.closePath()
    ctx.fill()

    // Soft golden mist band blending horizon cleanly into terrain
    const mist = ctx.createLinearGradient(0, 310, 0, 384)
    mist.addColorStop(0, 'rgba(255, 216, 168, 0.0)')
    mist.addColorStop(1, 'rgba(255, 216, 168, 0.9)')
    ctx.fillStyle = mist
    ctx.fillRect(0, 310, 1024, 74)

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  // Gentle cloud rotation around 3D Mount Fuji + Instanced Drifting Sakura Petals
  const fujiCloudsRef = useRef<THREE.Object3D | null>(null)
  const petalsRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const petalSeeds = useMemo(() => {
    const arr = []
    for (let i = 0; i < 120; i++) {
      arr.push({
        x: -18 + Math.random() * 48,
        y: 1.2 + Math.random() * 5.8,
        z: -10.5 + Math.random() * 11.5,
        speedX: 0.45 + Math.random() * 0.75,
        speedY: 0.22 + Math.random() * 0.35,
        swayAmp: 0.25 + Math.random() * 0.55,
        phase: Math.random() * Math.PI * 2,
        scale: 0.65 + Math.random() * 0.75,
      })
    }
    return arr
  }, [])

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    const dt = Math.min(delta, 0.05)

    // Subtle slow cloud drift around Mt. Fuji
    if (!fujiCloudsRef.current) {
      fujiCloudsRef.current = fuji.scene.getObjectByName('Fuji_CloudRing') ?? null
    }
    if (fujiCloudsRef.current) {
      fujiCloudsRef.current.rotation.y = t * 0.018
    }

    const mesh = petalsRef.current
    if (!mesh) return
    for (let i = 0; i < petalCount; i++) {
      const p = petalSeeds[i]
      p.x += p.speedX * dt
      p.y -= p.speedY * dt
      p.z += Math.sin(t * 1.1 + p.phase) * 0.16 * dt

      if (p.y < 0.8 || p.x > 34) {
        p.x = -12 + Math.random() * 34
        p.y = 5.4 + Math.random() * 2.4
        p.z = -10.2 + Math.random() * 7.5
      }

      dummy.position.set(p.x, p.y, p.z + Math.cos(t * 0.9 + p.phase) * p.swayAmp * 0.3)
      dummy.rotation.set(t * 1.3 + p.phase, t * 0.9 + p.phase, Math.sin(t + p.phase) * 1.4)
      dummy.scale.setScalar(p.scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      {/* Golden-hour Anime Sky Dome */}
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[175, 24, 16]} />
        <meshBasicMaterial map={skyTexture} side={THREE.BackSide} fog={false} />
      </mesh>

      {/* Glowing Anime Sunset Sun positioned over Mt. Fuji's shoulder */}
      <mesh position={[-96, 22, 52]} rotation={[0, Math.PI * 0.65, 0]}>
        <circleGeometry args={[10, 28]} />
        <meshBasicMaterial color="#fff5d4" fog={false} />
      </mesh>
      <mesh position={[-97, 22, 53]} rotation={[0, Math.PI * 0.65, 0]}>
        <circleGeometry args={[18, 28]} />
        <meshBasicMaterial color="#ffbe6b" transparent opacity={0.28} fog={false} />
      </mesh>

      {/* 3D Stylized Mount Fuji + Volumetric Clouds — framed cleanly in golden-hour sky & train windows! */}
      <primitive object={fuji.scene} position={[-68, -2.2, 42]} scale={[1.1, 1.1, 1.1]} />

      {/* Distant Anime Clouds & Hills */}
      <mesh position={[-85, 8.5, 12]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[140, 48]} />
        <meshBasicMaterial map={horizonTexture} transparent fog={false} depthWrite={false} />
      </mesh>

      {/* Seamless Warm Twilight Ground Valley below tracks */}
      <mesh position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[280, 280]} />
        <meshLambertMaterial color="#c8a88c" />
      </mesh>

      {/* HD Cozy Anime Golden-Hour Lighting */}
      <ambientLight color="#ffeed6" intensity={1.08} />
      <hemisphereLight args={['#fff2db', '#b58d79', 1.2]} />
      <directionalLight
        position={[24, 22, -16]}
        color={COZY_ANIME_THEME.scene.sunColor}
        intensity={2.05}
        castShadow={qualityTier === 'high'}
        shadow-mapSize={qualityTier === 'high' ? [2048, 2048] : [1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
        shadow-camera-left={-38}
        shadow-camera-right={38}
        shadow-camera-top={26}
        shadow-camera-bottom={-14}
      />

      {/* Warm Station Canopy Bounce & Sakura Fill Lights */}
      <pointLight position={[22, 3.2, -4.6]} color="#ffe2a8" intensity={6.5} distance={22} />
      <pointLight position={[12, 3.2, -4.6]} color="#ffe0a0" intensity={5.5} distance={18} />
      <pointLight position={[22, 4.2, -8.5]} color="#ffd4de" intensity={6.0} distance={18} />
      <pointLight position={[10, 4.5, -9.0]} color="#ffd4de" intensity={5.5} distance={18} />

      {/* Instanced Drifting Sakura Petals (1 Draw Call!) */}
      <instancedMesh ref={petalsRef} args={[undefined, undefined, petalCount]} frustumCulled={false}>
        <planeGeometry args={[0.14, 0.09]} />
        <meshBasicMaterial color="#ffb7c5" side={THREE.DoubleSide} transparent opacity={0.92} />
      </instancedMesh>
    </group>
  )
}

useGLTF.preload('/models/mount_fuji.glb')
