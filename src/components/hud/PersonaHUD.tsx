import { useState } from 'react'
import {
  Map,
  Volume2,
  VolumeX,
  RotateCcw,
  ArrowLeft,
  TrainFront,
  BookOpen,
  MessageSquareHeart,
  Disc3,
  FolderKanban,
  UserCheck,
  X,
} from 'lucide-react'
import {
  useAppStore,
  type CameraZone,
  isInsideTrainZone,
  isFocusedPropZone,
} from '../../store/useAppStore'
import { soundEngine } from '../../utils/soundEngine'

const ZONE_META: Record<CameraZone, { title: string; jp: string; hint: string }> = {
  platform: {
    title: 'SHIRO STATION',
    jp: 'シロ駅',
    hint: 'Click the N700S, Vending Machine, or Corkboard to explore',
  },
  vending: {
    title: 'VENDING MACHINE',
    jp: '自販機',
    hint: 'Click the Vending Machine again to browse Devlog Drinks · Esc to step back',
  },
  corkboard: {
    title: 'STATION CORKBOARD',
    jp: '掲示板',
    hint: 'Click the Corkboard again to sign the Guestbook · Esc to step back',
  },
  'car-2': {
    title: 'CAR 02 · PROJECTS',
    jp: '2号車・プロジェクト',
    hint: 'Drag to look around 360° · Click any Shinkansen seat to inspect a project',
  },
  'car-3': {
    title: 'CAR 03 · VINYL LOUNGE',
    jp: '3号車・ラウンジ',
    hint: 'Drag to look around · Click the Vintage Turntable or look out toward Mt. Fuji',
  },
  'car-4': {
    title: 'CAR 04 · CORRIDOR',
    jp: '4号車・通路',
    hint: 'Drag to enjoy the Mt. Fuji twilight view · Move to Car 05 for Credits',
  },
  'car-5': {
    title: 'CAR 05 · CREDITS FINALE',
    jp: '5号車・展望室',
    hint: 'Click the Rear Observation Console for About Shiro & Credits',
  },
  'seat-1': {
    title: 'SEAT 01 · PROJECT LUMOS',
    jp: 'プロジェクト・ルモス',
    hint: 'Click seat again to open Project Lumos · Esc to step back',
  },
  'seat-2': {
    title: 'SEAT 02 · SHIRO STATION 3D',
    jp: 'シロ駅 3D',
    hint: 'Click seat again to open Shiro Station 3D · Esc to step back',
  },
  'seat-3': {
    title: 'SEAT 03 · READYPATH',
    jp: 'レディパス',
    hint: 'Click seat again to open ReadyPath · Esc to step back',
  },
  'seat-4': {
    title: 'SEAT 04 · C++ LAB',
    jp: 'C++ ラボ',
    hint: 'Click seat again to open C++ Lab · Esc to step back',
  },
  turntable: {
    title: 'VINTAGE TURNTABLE',
    jp: 'レコードプレーヤー',
    hint: 'Click turntable again to open Vinyl Deck · Esc to step back',
  },
  credits: {
    title: 'SHIRO PROFILE & CREDITS',
    jp: 'プロフィール・クレジット',
    hint: 'Click console again to open JR Pass & Credits · Esc to step back',
  },
}

/**
 * Ultra-clean Minimalist Cozy Anime HUD:
 * - Zero cluttered navbars or floating 3D label buttons!
 * - Subtle contextual Back pill when focused/inside train
 * - Single whisper-clean bottom caption bar showing hover cue or focused 2nd-click prompt
 * - Optional compact Station Map icon in top-right for quick accessibility jumping
 */
export function PersonaHUD() {
  const cameraZone = useAppStore((s) => s.cameraZone)
  const setCameraZone = useAppStore((s) => s.setCameraZone)
  const activeSection = useAppStore((s) => s.activeSection)
  const openSection = useAppStore((s) => s.openSection)
  const stepBack = useAppStore((s) => s.stepBack)
  const hovered = useAppStore((s) => s.hoveredInteractable)
  const arrivalCompleted = useAppStore((s) => s.arrivalCompleted)
  const arrivalProgress = useAppStore((s) => s.arrivalProgress)
  const replayArrival = useAppStore((s) => s.replayArrival)
  const audioMuted = useAppStore((s) => s.audioMuted)
  const toggleAudioMuted = useAppStore((s) => s.toggleAudioMuted)
  const musicPlaying = useAppStore((s) => s.musicPlaying)
  const boardTrain = useAppStore((s) => s.boardTrain)
  const exitTrain = useAppStore((s) => s.exitTrain)

  const [mapOpen, setMapOpen] = useState(false)

  const meta = ZONE_META[cameraZone]
  const insideTrain = isInsideTrainZone(cameraZone)
  const isFocused = isFocusedPropZone(cameraZone)
  const isWalkingCar =
    cameraZone === 'car-2' ||
    cameraZone === 'car-3' ||
    cameraZone === 'car-4' ||
    cameraZone === 'car-5'

  const handleMuteToggle = () => {
    const nextMuted = !audioMuted
    soundEngine.setMuted(nextMuted)
    toggleAudioMuted()
  }

  return (
    <>
      {/* TOP-LEFT: Minimal Location Pill + Clean Step-Back Button when Focused / Inside */}
      <header className="pointer-events-none fixed top-3 left-3 z-20 flex max-w-[calc(100vw-142px)] items-center gap-2 sm:top-4 sm:left-4 sm:max-w-none">
        {(insideTrain || isFocused) && !activeSection && (
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick()
              stepBack()
            }}
            className="persona-panel-dark pointer-events-auto flex cursor-pointer items-center gap-1 px-2.5 py-2 text-xs font-black transition-transform hover:scale-105 active:scale-95"
            title="Step Back (Esc)"
          >
            <ArrowLeft className="h-4 w-4 text-[#ffb347]" />
            <span className="hidden sm:inline">{isFocused ? 'BACK' : 'PLATFORM'}</span>
          </button>
        )}

        <div className="persona-panel persona-skew pointer-events-auto px-3 py-1.5 sm:px-4 sm:py-2">
          <div className="persona-unskew flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
              style={{
                backgroundColor: arrivalCompleted ? 'var(--theme-accent-alt)' : 'var(--theme-accent)',
              }}
            />
            <div className="min-w-0">
              <p className="truncate font-display text-xs tracking-wider sm:text-sm">
                {meta.title} <span className="font-jp font-bold opacity-70">{meta.jp}</span>
              </p>
              {!arrivalCompleted && (
                <p className="text-[10px] font-bold tracking-widest uppercase opacity-70">
                  NOZOMI N700S ARRIVING · {Math.round(arrivalProgress * 100)}%
                </p>
              )}
            </div>
          </div>
        </div>

        {musicPlaying && !audioMuted && (
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick()
              openSection('music')
            }}
            className="persona-panel-dark pointer-events-auto hidden cursor-pointer items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold md:flex"
          >
            <Disc3 className="h-3.5 w-3.5 animate-spin text-[#ff9cbd]" />
            <span>VINYL SPINNING</span>
          </button>
        )}
      </header>

      {/* TOP-RIGHT: 3 Clean Compact Icons (Guide Map, Replay Arrival, Audio) */}
      <div className="fixed top-3 right-3 z-20 flex items-center gap-1.5 sm:top-4 sm:right-4">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick()
            setMapOpen((v) => !v)
          }}
          className="persona-panel-dark flex cursor-pointer items-center justify-center p-2 transition-transform active:scale-95"
          title="Station & Train Guide"
        >
          {mapOpen ? <X className="h-4 w-4" /> : <Map className="h-4 w-4 text-[#ffb347]" />}
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playStationChime()
            replayArrival()
          }}
          className="persona-panel-dark flex cursor-pointer items-center justify-center p-2 transition-transform active:scale-95"
          title="Replay Shinkansen Arrival"
        >
          <RotateCcw className="h-4 w-4 text-[#ffb7c5]" />
        </button>

        <button
          type="button"
          onClick={handleMuteToggle}
          className="persona-panel-dark flex cursor-pointer items-center justify-center p-2 transition-transform active:scale-95"
          title={audioMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {audioMuted ? <VolumeX className="h-4 w-4 opacity-60" /> : <Volume2 className="h-4 w-4 text-[#7bae7f]" />}
        </button>
      </div>

      {/* STATION GUIDE DRAWER (Optional Quick-Jump for Accessibility / Mobile) */}
      {mapOpen && (
        <aside className="persona-panel-dark fixed top-14 right-3 z-30 w-64 p-3 sm:top-16 sm:right-4">
          <div className="mb-2 flex items-center justify-between border-b border-white/15 pb-1.5 text-[11px] font-bold tracking-widest uppercase">
            <span className="text-[#ffb347]">Station &amp; Train Guide</span>
            <span className="font-jp opacity-75">案内</span>
          </div>
          <div className="flex flex-col gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick()
                exitTrain()
                setMapOpen(false)
              }}
              className="flex cursor-pointer items-center justify-between rounded bg-white/10 px-2.5 py-2 text-left hover:bg-[#ffb347] hover:text-[#2b211c]"
            >
              <span className="flex items-center gap-2">
                <TrainFront className="h-3.5 w-3.5" /> Platform Overview
              </span>
              <span className="font-jp text-[10px] opacity-75">ホーム</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick()
                setCameraZone('vending')
                setMapOpen(false)
              }}
              className="flex cursor-pointer items-center justify-between rounded bg-white/10 px-2.5 py-2 text-left hover:bg-[#ffb347] hover:text-[#2b211c]"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5" /> Blogs (Vending)
              </span>
              <span className="font-jp text-[10px] opacity-75">自販機</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick()
                setCameraZone('corkboard')
                setMapOpen(false)
              }}
              className="flex cursor-pointer items-center justify-between rounded bg-white/10 px-2.5 py-2 text-left hover:bg-[#ffb347] hover:text-[#2b211c]"
            >
              <span className="flex items-center gap-2">
                <MessageSquareHeart className="h-3.5 w-3.5" /> Guestbook (Board)
              </span>
              <span className="font-jp text-[10px] opacity-75">掲示板</span>
            </button>

            <div className="my-1 border-t border-white/15 pt-1 text-[10px] tracking-widest uppercase opacity-60">
              Inside N700S (Front → Rear)
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playDoorSlide()
                boardTrain('car-2')
                setMapOpen(false)
              }}
              className="flex cursor-pointer items-center justify-between rounded bg-white/10 px-2.5 py-2 text-left hover:bg-[#7bae7f] hover:text-[#141218]"
            >
              <span className="flex items-center gap-2">
                <FolderKanban className="h-3.5 w-3.5" /> Car 02: Project Seats
              </span>
              <span className="font-jp text-[10px] opacity-75">2号車</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playDoorSlide()
                boardTrain('car-3')
                setMapOpen(false)
              }}
              className="flex cursor-pointer items-center justify-between rounded bg-white/10 px-2.5 py-2 text-left hover:bg-[#ff9cbd] hover:text-[#141218]"
            >
              <span className="flex items-center gap-2">
                <Disc3 className="h-3.5 w-3.5" /> Car 03: Vintage Turntable
              </span>
              <span className="font-jp text-[10px] opacity-75">3号車</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playDoorSlide()
                boardTrain('car-4')
                setMapOpen(false)
              }}
              className="flex cursor-pointer items-center justify-between rounded bg-white/10 px-2.5 py-2 text-left hover:bg-white/25"
            >
              <span className="flex items-center gap-2">
                <TrainFront className="h-3.5 w-3.5" /> Car 04: Mt. Fuji Corridor
              </span>
              <span className="font-jp text-[10px] opacity-75">4号車</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playStationChime()
                boardTrain('car-5')
                setMapOpen(false)
              }}
              className="flex cursor-pointer items-center justify-between rounded bg-white/10 px-2.5 py-2 text-left hover:bg-[#ffb347] hover:text-[#2b211c]"
            >
              <span className="flex items-center gap-2">
                <UserCheck className="h-3.5 w-3.5" /> Car 05: Credits &amp; About
              </span>
              <span className="font-jp text-[10px] opacity-75">5号車</span>
            </button>
          </div>
        </aside>
      )}

      {/* BOTTOM-CENTER: Whisper-Clean Contextual Hint Bar + Slim Car Stepper Only Inside Train */}
      {!activeSection && arrivalCompleted && (
        <div className="pointer-events-none fixed right-0 bottom-4 left-0 z-20 flex flex-col items-center gap-2 px-3">
          {/* Dynamic Hover / Focus Caption */}
          <div className="rounded-full border border-[#ffb347]/60 bg-[#2b211c]/82 px-4 py-1.5 text-center text-[#fff8eb] shadow-lg backdrop-blur-sm">
            {hovered ? (
              <p className="text-[11px] font-bold tracking-wide sm:text-xs">
                <span className="text-[#ffb347]">✦ {hovered.label}</span>
                <span className="mx-1.5 opacity-45">|</span>
                <span className="opacity-90">{hovered.action}</span>
              </p>
            ) : (
              <p className="text-[11px] font-medium tracking-wide opacity-85 sm:text-xs">
                {meta.hint}
              </p>
            )}
          </div>

          {/* Ultra-Slim Car Stepper when walking inside Cars 2..5 */}
          {isWalkingCar && (
            <nav className="pointer-events-auto flex items-center gap-1 rounded-full border border-[#5c4033] bg-[#fff8eb]/92 px-2 py-1 text-[10px] font-black text-[#2b211c] shadow-md sm:text-[11px]">
              {(
                [
                  ['car-2', 'CAR 02 · PROJECTS'],
                  ['car-3', 'CAR 03 · VINYL'],
                  ['car-4', 'CAR 04'],
                  ['car-5', 'CAR 05 · CREDITS'],
                ] as const
              ).map(([zone, label]) => (
                <button
                  key={zone}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick()
                    setCameraZone(zone)
                  }}
                  className={`cursor-pointer rounded-full px-2.5 py-1 transition-colors ${
                    cameraZone === zone ? 'bg-[#2b211c] text-[#ffb347]' : 'hover:bg-black/10'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          )}
        </div>
      )}
    </>
  )
}
