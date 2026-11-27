import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore, type CameraZone, isInsideTrainZone } from '../store/useAppStore'

interface CameraPreset {
  pos: [number, number, number]
  target: [number, number, number]
  parallax: number
  freeLook?: boolean
}

const CAMERA_PRESETS: Record<CameraZone, CameraPreset> = {
  // Right-side Station POV: N700S huge on LEFT, SHIRO STATION top-center, Vending & Corkboard & Sakura on RIGHT, 3D Mt. Fuji in horizon!
  platform: {
    pos: [30.2, 2.55, -4.35],
    target: [11.2, 2.12, -2.25],
    parallax: 0.45,
  },
  // 2-Step Focus Views on Platform Props (Step 1 Focus -> Step 2 Open!)
  vending: {
    pos: [22.1, 2.22, -4.75],
    target: [19.4, 2.12, -5.95],
    parallax: 0.1,
  },
  corkboard: {
    pos: [16.3, 2.42, -4.48],
    target: [13.4, 2.45, -5.65],
    parallax: 0.1,
  },

  // === TRUE INSIDE-THE-TRAIN EXPLORATION (360° Smooth Drag-Look!) ===
  // Car 2 (2nd from front): Standing at front facing ALL 4 Clickable Modern Project Seats & glowing tablets!
  'car-2': {
    pos: [10.35, 2.02, 0.0],
    target: [7.2, 1.48, 0.0],
    parallax: 0.12,
    freeLook: true,
  },
  // Car 3 (3rd from front): Standing inside Cozy Lounge with Vintage Turntable, Sofa & Mt. Fuji panorama window!
  'car-3': {
    pos: [-2.15, 2.02, -0.15],
    target: [1.15, 1.58, 0.72],
    parallax: 0.12,
    freeLook: true,
  },
  // Car 4 (4th from front): Cozy Passenger Corridor facing seats + Mt. Fuji sunset view!
  'car-4': {
    pos: [-4.75, 2.02, 0.0],
    target: [-8.6, 1.55, 0.25],
    parallax: 0.12,
    freeLook: true,
  },
  // Car 5 (Rear Tail Car): Standing cleanly beside observation armchair facing the glowing Credits Console!
  'car-5': {
    pos: [-13.85, 2.05, 0.72],
    target: [-15.95, 1.52, -0.08],
    parallax: 0.12,
    freeLook: true,
  },

  // === 2-STEP FOCUSED CLOSE-UPS INSIDE TRAIN ===
  // 4 Clickable Modern Shinkansen Project Seats in Car 2 (approaching from front aisle -> straight onto cushion & tablet!)
  'seat-1': {
    pos: [10.8, 1.88, 0.08],
    target: [9.72, 1.52, 0.82],
    parallax: 0.08,
  },
  'seat-2': {
    pos: [8.3, 1.88, 0.08],
    target: [7.22, 1.52, 0.82],
    parallax: 0.08,
  },
  'seat-3': {
    pos: [10.8, 1.88, -0.08],
    target: [9.72, 1.52, -0.82],
    parallax: 0.08,
  },
  'seat-4': {
    pos: [8.3, 1.88, -0.08],
    target: [7.22, 1.52, -0.82],
    parallax: 0.08,
  },
  // Cozy Anime Vintage Turntable close-up in Car 3 (shows spinning vinyl, tonearm & matcha cup!)
  turntable: {
    pos: [0.95, 2.04, -0.08],
    target: [1.02, 1.72, 1.02],
    parallax: 0.08,
  },
  // Rear Credits Observation Console close-up in Car 5!
  credits: {
    pos: [-14.25, 1.88, 0.0],
    target: [-15.95, 1.56, 0.0],
    parallax: 0.08,
  },
}

const INTERIOR_CAR_ORDER: CameraZone[] = ['car-2', 'car-3', 'car-4', 'car-5']

export function CameraRig() {
  const { camera, gl } = useThree()
  const cameraZone = useAppStore((s) => s.cameraZone)
  const setCameraZone = useAppStore((s) => s.setCameraZone)
  const stepBack = useAppStore((s) => s.stepBack)

  const currentLookAt = useRef(new THREE.Vector3(11.2, 2.12, -2.25))
  const desiredPos = useMemo(() => new THREE.Vector3(), [])
  const desiredLook = useMemo(() => new THREE.Vector3(), [])
  const baseDir = useMemo(() => new THREE.Vector3(), [])
  const rotatedDir = useMemo(() => new THREE.Vector3(), [])
  const euler = useMemo(() => new THREE.Euler(0, 0, 0, 'YXZ'), [])

  const pointer = useRef({ x: 0, y: 0 })
  // Smooth 360° drag-to-look yaw/pitch offsets while exploring inside train cars!
  const lookOffset = useRef({ yaw: 0, pitch: 0, targetYaw: 0, targetPitch: 0 })
  const draggingRef = useRef(false)
  const lastDragPos = useRef({ x: 0, y: 0 })

  // Smoothly step into new rooms without ever clipping through solid exterior train walls!
  const prevZoneRef = useRef<CameraZone>('platform')
  useEffect(() => {
    lookOffset.current.targetYaw = 0
    lookOffset.current.targetPitch = 0
    const prev = prevZoneRef.current
    prevZoneRef.current = cameraZone

    const prevPreset = CAMERA_PRESETS[prev]
    const nextPreset = CAMERA_PRESETS[cameraZone]
    const dist = Math.hypot(
      nextPreset.pos[0] - prevPreset.pos[0],
      nextPreset.pos[1] - prevPreset.pos[1],
      nextPreset.pos[2] - prevPreset.pos[2],
    )
    // If jumping across rooms (> 5m), place camera gently 0.9m shy of arrival so it glides smoothly in without passing through walls!
    if (dist > 5.0) {
      const dirX = nextPreset.target[0] - nextPreset.pos[0]
      const dirZ = nextPreset.target[2] - nextPreset.pos[2]
      const len = Math.hypot(dirX, dirZ) || 1
      camera.position.set(
        nextPreset.pos[0] - (dirX / len) * 0.65,
        nextPreset.pos[1],
        nextPreset.pos[2] - (dirZ / len) * 0.65,
      )
      currentLookAt.current.set(nextPreset.target[0], nextPreset.target[1], nextPreset.target[2])
    }
  }, [camera, cameraZone])

  useEffect(() => {
    const dom = gl.domElement

    const onPointerDown = (e: PointerEvent) => {
      if (!CAMERA_PRESETS[useAppStore.getState().cameraZone].freeLook) return
      draggingRef.current = true
      lastDragPos.current = { x: e.clientX, y: e.clientY }
    }

    const onPointerMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1

      if (draggingRef.current && CAMERA_PRESETS[useAppStore.getState().cameraZone].freeLook) {
        const dx = e.clientX - lastDragPos.current.x
        const dy = e.clientY - lastDragPos.current.y
        lastDragPos.current = { x: e.clientX, y: e.clientY }
        // Full 360° horizontal look inside the car + comfortable vertical look (-32°..+35°)
        lookOffset.current.targetYaw += dx * 0.0045
        lookOffset.current.targetPitch = THREE.MathUtils.clamp(
          lookOffset.current.targetPitch + dy * 0.0032,
          -0.52,
          0.55,
        )
      }
    }

    const onPointerUp = () => {
      draggingRef.current = false
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (e.key === 'Escape') {
        stepBack()
        return
      }

      const curZone = useAppStore.getState().cameraZone
      const carIdx = INTERIOR_CAR_ORDER.indexOf(curZone)
      if (carIdx !== -1) {
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === 's' || e.key === 'S') {
          const next = INTERIOR_CAR_ORDER[Math.min(INTERIOR_CAR_ORDER.length - 1, carIdx + 1)]
          setCameraZone(next)
        } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'w' || e.key === 'W') {
          const prev = INTERIOR_CAR_ORDER[Math.max(0, carIdx - 1)]
          setCameraZone(prev)
        }
      }
    }

    dom.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      dom.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [gl.domElement, setCameraZone, stepBack])

  useFrame(({ clock }, delta) => {
    const preset = CAMERA_PRESETS[cameraZone]
    const t = clock.getElapsedTime()
    const dt = Math.min(delta, 0.05)
    const lerpSpeed = 1 - Math.exp(-5.8 * dt)

    // Smoothly damp interior 360° drag-look angles
    lookOffset.current.yaw = THREE.MathUtils.lerp(
      lookOffset.current.yaw,
      lookOffset.current.targetYaw,
      1 - Math.exp(-9 * dt),
    )
    lookOffset.current.pitch = THREE.MathUtils.lerp(
      lookOffset.current.pitch,
      lookOffset.current.targetPitch,
      1 - Math.exp(-9 * dt),
    )

    const inside = isInsideTrainZone(cameraZone)
    const px = pointer.current.x * preset.parallax
    const py = pointer.current.y * preset.parallax * 0.45

    desiredPos.set(
      preset.pos[0] + (inside ? 0 : Math.sin(t * 0.45) * 0.05),
      preset.pos[1] - (preset.freeLook ? 0 : py) + Math.cos(t * 0.55) * 0.02,
      preset.pos[2] - (preset.freeLook ? 0 : px),
    )

    if (preset.freeLook) {
      // Rotate base gaze direction by user's drag yaw/pitch so you can freely explore every corner of the car!
      baseDir
        .set(
          preset.target[0] - preset.pos[0],
          preset.target[1] - preset.pos[1],
          preset.target[2] - preset.pos[2],
        )
        .normalize()
      euler.set(lookOffset.current.pitch - py * 0.2, lookOffset.current.yaw - px * 0.25, 0)
      rotatedDir.copy(baseDir).applyEuler(euler)
      desiredLook.copy(desiredPos).addScaledVector(rotatedDir, 4.0)
    } else {
      desiredLook.set(
        preset.target[0],
        preset.target[1] - py * 0.3,
        preset.target[2] - px * 0.2,
      )
    }

    camera.position.lerp(desiredPos, lerpSpeed)
    currentLookAt.current.lerp(desiredLook, lerpSpeed)
    camera.lookAt(currentLookAt.current)
  })

  return null
}
