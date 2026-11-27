import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore, isInsideTrainZone } from '../store/useAppStore'
import { PROJECTS_DATA } from '../data/portfolioData'
import { soundEngine } from '../utils/soundEngine'
import { getWoodGrainTexture, setObjectHighlight } from '../utils/proceduralTextures'

const ARRIVAL_START_X = -92
const ARRIVAL_DURATION_MS = 2800

const PROJECT_SEAT_SLOTS = [
  {
    zone: 'seat-1' as const,
    meshName: 'Car2_ProjectSeat_1',
    pos: [9.75, 1.52, 0.82] as [number, number, number],
    projectIndex: 0,
  },
  {
    zone: 'seat-2' as const,
    meshName: 'Car2_ProjectSeat_2',
    pos: [7.25, 1.52, 0.82] as [number, number, number],
    projectIndex: 1,
  },
  {
    zone: 'seat-3' as const,
    meshName: 'Car2_ProjectSeat_3',
    pos: [9.75, 1.52, -0.82] as [number, number, number],
    projectIndex: 2,
  },
  {
    zone: 'seat-4' as const,
    meshName: 'Car2_ProjectSeat_4',
    pos: [7.25, 1.52, -0.82] as [number, number, number],
    projectIndex: 3,
  },
]

/**
 * ShinkansenTrain (V2 Enclosed Interior + Clean 2-Step Hover/Click Edition):
 * - ZERO floating <Html> buttons!
 * - Smooth 2.8s N700S arrival animation (kept lightweight!)
 * - Direct click on parked N700S -> doors slide open & camera enters Car 2 (Projects Seats)
 * - Inside Car 2: 4 Clickable Modern Cozy Anime Shinkansen Seats (1st Click Focus -> 2nd Click Open Project!)
 * - Inside Car 3: Vintage Vinyl Turntable with live spinning Car3_Vinyl_Disc (1st Click Focus -> 2nd Click Open Music!)
 * - Inside Car 5 (Rear Tail): About Me & Credits Observation Console (1st Click Focus -> 2nd Click Open Credits!)
 * - Clickable Gangway Doorways between cars for natural RPG walking!
 */
export function ShinkansenTrain() {
  const { scene } = useGLTF('/models/shinkansen.glb')

  const cameraZone = useAppStore((s) => s.cameraZone)
  const sceneLoaded = useAppStore((s) => s.sceneLoaded)
  const arrivalCompleted = useAppStore((s) => s.arrivalCompleted)
  const setArrivalProgress = useAppStore((s) => s.setArrivalProgress)
  const setArrivalCompleted = useAppStore((s) => s.setArrivalCompleted)
  const trainDoorsOpen = useAppStore((s) => s.trainDoorsOpen)
  const musicPlaying = useAppStore((s) => s.musicPlaying)
  const boardTrain = useAppStore((s) => s.boardTrain)
  const setCameraZone = useAppStore((s) => s.setCameraZone)
  const interactWithProp = useAppStore((s) => s.interactWithProp)
  const setHovered = useAppStore((s) => s.setHoveredInteractable)

  const trainRef = useRef<THREE.Group>(null)
  const startTimeRef = useRef<number | null>(null)
  const doorSlideRef = useRef(0)

  const parts = useMemo(() => {
    const car2DoorL = scene.getObjectByName('Car2_Door_Left')
    const car2DoorR = scene.getObjectByName('Car2_Door_Right')
    const car3DoorL = scene.getObjectByName('Car3_Door_Left')
    const car3DoorR = scene.getObjectByName('Car3_Door_Right')
    const vinylDisc = scene.getObjectByName('Car3_Vinyl_Disc')
    const turntable = scene.getObjectByName('Car3_TurntableStation')
    const creditsConsole = scene.getObjectByName('Car5_CreditsLounge')
    const seats = PROJECT_SEAT_SLOTS.map((slot) => scene.getObjectByName(slot.meshName))

    return {
      car2DoorL,
      car2DoorR,
      car3DoorL,
      car3DoorR,
      vinylDisc,
      turntable,
      creditsConsole,
      seats,
      baseDoorPositions: {
        c2L: car2DoorL?.position.x ?? -2.0,
        c2R: car2DoorR?.position.x ?? -1.3,
        c3L: car3DoorL?.position.x ?? -2.0,
        c3R: car3DoorR?.position.x ?? -1.3,
      },
    }
  }, [scene])

  // Apply HD wood grain textures on train floors/furniture & crisp specular polish on glass/paint
  useEffect(() => {
    const woodTex = getWoodGrainTexture()
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      mesh.receiveShadow = true

      const mat = mesh.material as THREE.MeshStandardMaterial
      if (!mat || mat.userData.__hdApplied) return
      if (mesh.name.includes('_Floor') || mesh.name.includes('TT_Cabinet')) {
        mat.map = woodTex
        mat.roughness = 0.56
        mat.needsUpdate = true
      } else if (mesh.name.includes('_Glass_') || mesh.name.includes('DustCover')) {
        mat.transparent = true
        mat.opacity = 0.24
        mat.depthWrite = false
        mat.roughness = 0.08
        mat.needsUpdate = true
      } else if (mesh.name.includes('TabletScreen')) {
        // Make each seat's project tablet glow vividly from both aisle angles!
        mat.side = THREE.DoubleSide
        mat.emissiveIntensity = 1.6
        mat.needsUpdate = true
      } else if (mesh.name.includes('TabletBody')) {
        // Slight warm bezel glint so tablets stand out crisply
        mat.roughness = 0.25
        mat.needsUpdate = true
      } else if (mesh.name === 'Car1_DriverCab_Body_Shell') {
        // Render warm bright interior walls inside Car 5 Rear Observation Lounge cleanly!
        mat.side = THREE.DoubleSide
        mat.emissive = new THREE.Color('#473528')
        mat.emissiveIntensity = 0.55
        mat.needsUpdate = true
      }
      mat.userData.__hdApplied = true
    })
    // Hide solid end-cap / gangway only when standing inside Car 5 so view is 100% unobstructed!
    const rearGangway = scene.getObjectByName('Gangway_-11.7')
    if (rearGangway) {
      rearGangway.visible = cameraZone !== 'car-5' && cameraZone !== 'credits'
    }
    const car5Shell = scene.getObjectByName('Car1_DriverCab_Body_Shell')
    if (car5Shell) {
      // Keep shell visible for walls; ensure Car5_Floor & Console are bright
      car5Shell.visible = true
    }
  }, [scene, cameraZone])

  useEffect(() => {
    if (!arrivalCompleted) {
      startTimeRef.current = null
      if (trainRef.current) {
        trainRef.current.position.x = ARRIVAL_START_X
      }
    }
  }, [arrivalCompleted])

  const insideTrain = isInsideTrainZone(cameraZone)

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05)

    // 1. Lightweight Wall-Clock 2.8s N700S Arrival Animation
    if (sceneLoaded && !arrivalCompleted && trainRef.current) {
      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

      if (prefersReduced) {
        trainRef.current.position.x = 0
        setArrivalProgress(1)
        setArrivalCompleted(true)
      } else {
        if (startTimeRef.current === null) {
          startTimeRef.current = performance.now()
        }
        const rawT = Math.min(1, (performance.now() - startTimeRef.current) / ARRIVAL_DURATION_MS)
        const eased = 1 - Math.pow(1 - rawT, 4)
        trainRef.current.position.x = ARRIVAL_START_X * (1 - eased)
        const settle = rawT > 0.85 ? Math.sin(((rawT - 0.85) / 0.15) * Math.PI) * 0.004 : 0
        trainRef.current.rotation.z = -settle
        setArrivalProgress(rawT)

        if (rawT >= 1) {
          trainRef.current.position.x = 0
          trainRef.current.rotation.z = 0
          setArrivalCompleted(true)
        }
      }
    }

    // 2. Gentle idle rail air-suspension hum
    if (arrivalCompleted && trainRef.current) {
      trainRef.current.position.y = Math.sin(clock.getElapsedTime() * 1.8) * 0.003
    }

    // 3. Smooth Pneumatic Sliding Doors
    const targetOpen = trainDoorsOpen ? 0.56 : 0
    doorSlideRef.current = THREE.MathUtils.lerp(
      doorSlideRef.current,
      targetOpen,
      1 - Math.exp(-8 * dt),
    )
    const off = doorSlideRef.current
    if (parts.car2DoorL) parts.car2DoorL.position.x = parts.baseDoorPositions.c2L - off
    if (parts.car2DoorR) parts.car2DoorR.position.x = parts.baseDoorPositions.c2R + off
    if (parts.car3DoorL) parts.car3DoorL.position.x = parts.baseDoorPositions.c3L - off
    if (parts.car3DoorR) parts.car3DoorR.position.x = parts.baseDoorPositions.c3R + off

    // 4. Spin the Vintage Vinyl Record smoothly in Car 3!
    if (parts.vinylDisc) {
      const spinSpeed = musicPlaying ? 2.4 : cameraZone === 'turntable' ? 0.55 : 0.18
      parts.vinylDisc.rotation.y += spinSpeed * dt
    }
  })

  const handleBoardTrain = () => {
    if (!arrivalCompleted) return
    soundEngine.playDoorSlide()
    boardTrain('car-2')
  }

  return (
    <group ref={trainRef} position={[ARRIVAL_START_X, 0, 0]}>
      {/* Full Enclosed 5-Car HD N700S Shinkansen */}
      <primitive
        object={scene}
        onClick={(e: { stopPropagation: () => void }) => {
          if (cameraZone === 'platform' && arrivalCompleted) {
            e.stopPropagation()
            handleBoardTrain()
          }
        }}
        onPointerOver={(e: { stopPropagation: () => void }) => {
          if (cameraZone === 'platform' && arrivalCompleted) {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
            setHovered({
              id: 'train-board',
              label: 'SHINKANSEN N700S · BOARD CAR 02',
              jpLabel: '新幹線に乗車する',
              action: 'CLICK TO STEP INSIDE & EXPLORE ALL CARS',
            })
          }
        }}
        onPointerOut={() => {
          if (cameraZone === 'platform') {
            document.body.style.cursor = 'auto'
            setHovered(null)
          }
        }}
      />

      {/* Front N700S Headlight Glow */}
      <pointLight position={[22.8, 1.7, 0]} color="#fff3cc" intensity={3.2} distance={14} />

      {/* Warm Cozy Interior Cabin Lighting across Cars 2, 3, 4 & 5 */}
      {insideTrain && (
        <>
          <pointLight position={[7.8, 2.75, 0]} color="#ffe5b4" intensity={4.8} distance={11} />
          <pointLight position={[0.0, 2.75, 0]} color="#ffe2a8" intensity={5.2} distance={11} />
          <pointLight position={[1.15, 2.25, 0.9]} color="#ffd588" intensity={3.5} distance={6} />
          <pointLight position={[-7.8, 2.75, 0]} color="#ffe5b4" intensity={4.4} distance={11} />
          <pointLight position={[-13.8, 2.45, 0]} color="#ffe6b5" intensity={7.0} distance={12} />
          <pointLight position={[-15.8, 2.25, 0]} color="#ffd588" intensity={5.0} distance={9} />
        </>
      )}

      {/* === CAR 2 (2nd from Front): 4 CLICKABLE MODERN SHINKANSEN PROJECT SEATS === */}
      {(cameraZone === 'car-2' ||
        cameraZone === 'seat-1' ||
        cameraZone === 'seat-2' ||
        cameraZone === 'seat-3' ||
        cameraZone === 'seat-4') &&
        PROJECT_SEAT_SLOTS.map((slot, idx) => {
          const proj = PROJECTS_DATA[slot.projectIndex]
          if (!proj) return null
          const isFocused = cameraZone === slot.zone
          return (
            <mesh
              key={slot.zone}
              position={slot.pos}
              onClick={(e) => {
                e.stopPropagation()
                soundEngine.playClick()
                interactWithProp(slot.zone, 'projects', proj.id)
              }}
              onPointerOver={(e) => {
                e.stopPropagation()
                document.body.style.cursor = 'pointer'
                setObjectHighlight(parts.seats[idx], true)
                setHovered({
                  id: slot.zone,
                  label: `SEAT 0${idx + 1} · ${proj.title.toUpperCase()}`,
                  jpLabel: proj.jpTitle,
                  action: isFocused
                    ? 'CLICK AGAIN TO OPEN PROJECT DETAILS'
                    : 'CLICK TO FOCUS ON SEAT DISPLAY',
                })
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'auto'
                setObjectHighlight(parts.seats[idx], false)
                setHovered(null)
              }}
            >
              <boxGeometry args={[1.15, 1.35, 1.05]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          )
        })}

      {/* === CAR 3 (3rd from Front): CLICKABLE COZY ANIME VINTAGE TURNTABLE === */}
      {(cameraZone === 'car-3' || cameraZone === 'turntable') && (
        <mesh
          position={[1.15, 1.65, 1.02]}
          onClick={(e) => {
            e.stopPropagation()
            soundEngine.playClick()
            interactWithProp('turntable', 'music')
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
            setObjectHighlight(parts.turntable, true)
            setHovered({
              id: 'turntable',
              label: 'VINTAGE VINYL TURNTABLE · MUSIC',
              jpLabel: 'レコードプレーヤー',
              action:
                cameraZone === 'turntable'
                  ? 'CLICK AGAIN TO PLAY / SWITCH VINYL RECORDS'
                  : 'CLICK TO FOCUS ON TURNTABLE',
            })
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto'
            setObjectHighlight(parts.turntable, false)
            setHovered(null)
          }}
        >
          <boxGeometry args={[1.85, 1.35, 0.85]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      {/* === CAR 5 (Rear Tail Car): CLICKABLE ABOUT ME & CREDITS CONSOLE === */}
      {(cameraZone === 'car-5' || cameraZone === 'credits') && (
        <mesh
          position={[-15.85, 1.55, 0]}
          onClick={(e) => {
            e.stopPropagation()
            soundEngine.playStationChime()
            interactWithProp('credits', 'about')
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
            setObjectHighlight(parts.creditsConsole, true)
            setHovered({
              id: 'credits',
              label: 'REAR OBSERVATION · ABOUT SHIRO & CREDITS',
              jpLabel: 'プロフィール・クレジット',
              action:
                cameraZone === 'credits'
                  ? 'CLICK AGAIN TO VIEW PROFILE & CREDITS'
                  : 'CLICK TO FOCUS ON CREDITS CONSOLE',
            })
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto'
            setObjectHighlight(parts.creditsConsole, false)
            setHovered(null)
          }}
        >
          <boxGeometry args={[1.6, 1.55, 2.1]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      {/* === DIEGETIC WALKABLE GANGWAY DOORWAY HITBOXES BETWEEN CARS === */}
      {cameraZone === 'car-2' && (
        <mesh
          position={[4.05, 1.85, 0]}
          onClick={(e) => {
            e.stopPropagation()
            soundEngine.playClick()
            setCameraZone('car-3')
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
            setHovered({
              id: 'gangway-2-3',
              label: 'WALK TO CAR 03 · VINTAGE TURNTABLE LOUNGE',
              jpLabel: '3号車へ移動',
              action: 'CLICK DOORWAY TO ENTER CAR 03',
            })
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto'
            setHovered(null)
          }}
        >
          <boxGeometry args={[0.5, 2.0, 1.1]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      {cameraZone === 'car-3' && (
        <>
          <mesh
            position={[3.75, 1.85, 0]}
            onClick={(e) => {
              e.stopPropagation()
              soundEngine.playClick()
              setCameraZone('car-2')
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              document.body.style.cursor = 'pointer'
              setHovered({
                id: 'gangway-3-2',
                label: 'WALK TO CAR 02 · PROJECTS SEATS',
                jpLabel: '2号車へ移動',
                action: 'CLICK DOORWAY TO ENTER CAR 02',
              })
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto'
              setHovered(null)
            }}
          >
            <boxGeometry args={[0.5, 2.0, 1.1]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
          <mesh
            position={[-3.75, 1.85, 0]}
            onClick={(e) => {
              e.stopPropagation()
              soundEngine.playClick()
              setCameraZone('car-4')
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              document.body.style.cursor = 'pointer'
              setHovered({
                id: 'gangway-3-4',
                label: 'WALK TO CAR 04 · PASSENGER CORRIDOR',
                jpLabel: '4号車へ移動',
                action: 'CLICK DOORWAY TO ENTER CAR 04',
              })
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto'
              setHovered(null)
            }}
          >
            <boxGeometry args={[0.5, 2.0, 1.1]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </>
      )}

      {cameraZone === 'car-4' && (
        <mesh
          position={[-11.55, 1.85, 0]}
          onClick={(e) => {
            e.stopPropagation()
            soundEngine.playClick()
            setCameraZone('car-5')
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
            setHovered({
              id: 'gangway-4-5',
              label: 'WALK TO CAR 05 · ABOUT SHIRO & CREDITS',
              jpLabel: '5号車へ移動',
              action: 'CLICK DOORWAY TO ENTER REAR OBSERVATION CAR',
            })
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto'
            setHovered(null)
          }}
        >
          <boxGeometry args={[0.5, 2.0, 1.1]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}

useGLTF.preload('/models/shinkansen.glb')
