import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '../store/useAppStore'
import { soundEngine } from '../utils/soundEngine'
import {
  getPlatformTileTexture,
  getWoodGrainTexture,
  setObjectHighlight,
} from '../utils/proceduralTextures'

function drawShiroSignboard(
  ctx: CanvasRenderingContext2D,
  timeStr: string,
  arrivalDone: boolean,
) {
  const w = ctx.canvas.width
  const h = ctx.canvas.height

  ctx.fillStyle = '#fff8ea'
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = '#2c2523'
  ctx.fillRect(0, 0, w, 10)
  ctx.fillRect(0, h - 10, w, 10)

  ctx.fillStyle = '#5c9b6b'
  ctx.fillRect(0, h * 0.63, w, h * 0.14)
  ctx.fillStyle = '#f4a236'
  ctx.fillRect(0, h * 0.77, w, h * 0.045)

  ctx.fillStyle = '#2c2523'
  ctx.fillRect(w * 0.44, h * 0.59, w * 0.12, h * 0.24)
  ctx.fillStyle = '#fff8ea'
  ctx.font = '900 32px "Archivo Black", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('SR 01', w * 0.5, h * 0.715)

  ctx.fillStyle = '#2b211c'
  ctx.font = '900 102px "Noto Sans JP", sans-serif'
  ctx.fillText('シロ駅', w * 0.5, h * 0.27)

  ctx.fillStyle = '#5c4033'
  ctx.font = '900 44px "Archivo Black", sans-serif'
  ctx.fillText('SHIRO STATION', w * 0.5, h * 0.49)

  ctx.fillStyle = '#fff8ea'
  ctx.font = '700 22px "Space Grotesk", sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('◀ TOKYO', 28, h * 0.705)
  ctx.textAlign = 'right'
  ctx.fillText('KYOTO ▶', w - 28, h * 0.705)

  ctx.font = '700 24px "Space Grotesk", monospace'
  ctx.textAlign = 'left'
  const statusText = arrivalDone ? '● NOZOMI 01 BOARDING' : '▸ EXPRESS APPROACHING...'
  ctx.fillStyle = arrivalDone ? '#3f7d4d' : '#d96b27'
  ctx.fillText(statusText, 28, h * 0.90)

  ctx.textAlign = 'right'
  ctx.fillStyle = '#2b211c'
  ctx.fillText(timeStr, w - 28, h * 0.90)
}

/**
 * StationWorld (V2 Clean Diegetic Edition):
 * - ZERO floating <Html> buttons!
 * - HD procedural stone tile & wood grain textures
 * - Warm golden emissive hover highlight on Vending Machine & Corkboard
 * - 2-Step UX: 1st Click zooms focus closely -> 2nd Click opens Blogs / Guestbook!
 */
export function StationWorld() {
  const station = useGLTF('/models/station_platform.glb')
  const sakuraTall = useGLTF('/models/sakura_tree_tall.glb')
  const sakuraMed = useGLTF('/models/sakura_tree_medium.glb')
  const sakuraSmall = useGLTF('/models/sakura_tree_small.glb')

  const cameraZone = useAppStore((s) => s.cameraZone)
  const arrivalCompleted = useAppStore((s) => s.arrivalCompleted)
  const interactWithProp = useAppStore((s) => s.interactWithProp)
  const setHovered = useAppStore((s) => s.setHoveredInteractable)
  const setSceneLoaded = useAppStore((s) => s.setSceneLoaded)
  const guestbookNotes = useAppStore((s) => s.guestbookNotes)

  useEffect(() => {
    setSceneLoaded(true)
  }, [setSceneLoaded])

  // Apply HD procedural textures (station stone tiles + warm wood grain) & shadows
  useEffect(() => {
    const platTex = getPlatformTileTexture()
    const woodTex = getWoodGrainTexture()

    station.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      mesh.receiveShadow = true

      const mat = mesh.material as THREE.MeshStandardMaterial
      if (!mat || mat.userData.__hdApplied) return
      if (mesh.name.includes('Platform_Deck_Top')) {
        mat.map = platTex
        mat.roughness = 0.72
        mat.needsUpdate = true
      } else if (mesh.name.includes('Bench_') || mesh.name.includes('Canopy_Wood')) {
        mat.map = woodTex
        mat.roughness = 0.62
        mat.needsUpdate = true
      }
      mat.userData.__hdApplied = true
    })

    ;[sakuraTall.scene, sakuraMed.scene, sakuraSmall.scene].forEach((root) => {
      root.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          obj.castShadow = true
          obj.receiveShadow = true
        }
      })
    })
  }, [station.scene, sakuraTall.scene, sakuraMed.scene, sakuraSmall.scene])

  const vendingObj = useMemo(
    () => station.scene.getObjectByName('Interact_VendingMachine'),
    [station.scene],
  )
  const corkboardObj = useMemo(
    () => station.scene.getObjectByName('Interact_Corkboard'),
    [station.scene],
  )

  // Live SHIRO STATION (シロ駅) digital clock CanvasTexture
  const signCanvas = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 1024
    c.height = 340
    return c
  }, [])

  const signTexture = useMemo(() => {
    const tex = new THREE.CanvasTexture(signCanvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [signCanvas])

  const lastSecondRef = useRef(-1)
  useFrame(() => {
    const now = new Date()
    const sec = now.getSeconds()
    if (sec !== lastSecondRef.current) {
      lastSecondRef.current = sec
      const timeStr = now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      const ctx = signCanvas.getContext('2d')
      if (ctx) {
        drawShiroSignboard(ctx, `${timeStr} JST`, arrivalCompleted)
        signTexture.needsUpdate = true
      }
    }
  })

  // Gentle breeze sway on the 3 Sakura Trees
  const tallRef = useRef<THREE.Group>(null)
  const medRef = useRef<THREE.Group>(null)
  const smallRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (tallRef.current) tallRef.current.rotation.z = Math.sin(t * 0.7) * 0.014
    if (medRef.current) medRef.current.rotation.z = Math.sin(t * 0.85 + 1.4) * 0.018
    if (smallRef.current) smallRef.current.rotation.z = Math.sin(t * 1.05 + 2.6) * 0.022
  })

  const canClickPlatformProps =
    arrivalCompleted &&
    (cameraZone === 'platform' || cameraZone === 'vending' || cameraZone === 'corkboard')

  return (
    <group>
      <primitive object={station.scene} />

      {/* Live SHIRO STATION (シロ駅) Signboard Surface */}
      <mesh position={[14.63, 3.62, -4.05]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.94, 0.92]} />
        <meshBasicMaterial map={signTexture} toneMapped={false} />
      </mesh>

      {/* 3 Varied-Height Cozy Sakura Trees */}
      <group ref={tallRef} position={[9.5, 0.35, -10.4]}>
        <primitive object={sakuraTall.scene} />
      </group>
      <group ref={medRef} position={[-3.5, 0.35, -10.6]}>
        <primitive object={sakuraMed.scene} />
      </group>
      <group ref={smallRef} position={[21.5, 0.35, -9.8]}>
        <primitive object={sakuraSmall.scene} />
      </group>

      {/* Direct Click Hitbox: 3D VENDING MACHINE (1st Click = Focus -> 2nd Click = Open Blogs!) */}
      {canClickPlatformProps && (
        <mesh
          position={[19.4, 2.05, -5.95]}
          onClick={(e) => {
            e.stopPropagation()
            soundEngine.playClick()
            interactWithProp('vending', 'blogs')
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
            setObjectHighlight(vendingObj, true)
            setHovered({
              id: 'vending',
              label: 'VENDING MACHINE · BLOGS',
              jpLabel: '自販機・ブログ',
              action:
                cameraZone === 'vending'
                  ? 'CLICK AGAIN TO OPEN DEVLOG DRINKS'
                  : 'CLICK TO FOCUS ON VENDING MACHINE',
            })
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto'
            setObjectHighlight(vendingObj, false)
            setHovered(null)
          }}
        >
          <boxGeometry args={[1.6, 2.3, 1.4]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      {/* Direct Click Hitbox: 3D STATION CORKBOARD (1st Click = Focus -> 2nd Click = Open Guestbook!) */}
      {canClickPlatformProps && (
        <mesh
          position={[13.4, 2.45, -5.65]}
          onClick={(e) => {
            e.stopPropagation()
            soundEngine.playClick()
            interactWithProp('corkboard', 'guestbook')
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
            setObjectHighlight(corkboardObj, true)
            setHovered({
              id: 'corkboard',
              label: `STATION CORKBOARD · GUESTBOOK (${guestbookNotes.length})`,
              jpLabel: '掲示板',
              action:
                cameraZone === 'corkboard'
                  ? 'CLICK AGAIN TO READ & PIN STICKY NOTES'
                  : 'CLICK TO FOCUS ON CORKBOARD',
            })
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto'
            setObjectHighlight(corkboardObj, false)
            setHovered(null)
          }}
        >
          <boxGeometry args={[1.55, 1.9, 2.35]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}

useGLTF.preload('/models/station_platform.glb')
useGLTF.preload('/models/sakura_tree_tall.glb')
useGLTF.preload('/models/sakura_tree_medium.glb')
useGLTF.preload('/models/sakura_tree_small.glb')
