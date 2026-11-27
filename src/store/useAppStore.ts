import { create } from 'zustand'

export type CameraZone =
  | 'platform'
  | 'vending'
  | 'corkboard'
  | 'car-2'
  | 'car-3'
  | 'car-4'
  | 'car-5'
  | 'seat-1'
  | 'seat-2'
  | 'seat-3'
  | 'seat-4'
  | 'turntable'
  | 'credits'

export type PortfolioSection = 'about' | 'projects' | 'blogs' | 'music' | 'guestbook' | null
export type QualityTier = 'high' | 'low'

export interface InteractableHint {
  id: string
  label: string
  jpLabel: string
  action: string
}

export interface GuestbookNote {
  id: string
  author: string
  message: string
  color: 'sakura' | 'amber' | 'mint' | 'cream'
  createdAt: string
  rotation: number
}

const STORAGE_KEY = 'shiro-station-guestbook-v1'

const DEFAULT_NOTES: GuestbookNote[] = [
  {
    id: 'starter-1',
    author: 'Lumi',
    message: 'Welcome to Shiro Station! Klik keretanya buat masuk & jelajahi tiap gerbong~',
    color: 'sakura',
    createdAt: '2026-11-27',
    rotation: -2.4,
  },
  {
    id: 'starter-2',
    author: 'Traveler 01',
    message: 'The vintage turntable + Mt. Fuji out the window feels like an anime movie!',
    color: 'amber',
    createdAt: '2026-11-27',
    rotation: 2.1,
  },
  {
    id: 'starter-3',
    author: 'Shiro',
    message: 'Leave a sticky note on the corkboard before the N700S departs!',
    color: 'mint',
    createdAt: '2026-11-27',
    rotation: -1.3,
  },
]

const loadNotes = (): GuestbookNote[] => {
  if (typeof window === 'undefined') return DEFAULT_NOTES
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_NOTES
    const parsed = JSON.parse(raw) as GuestbookNote[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_NOTES
  } catch {
    return DEFAULT_NOTES
  }
}

const saveNotes = (notes: GuestbookNote[]) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  } catch {
    // ignore storage quota errors
  }
}

const detectDefaultQuality = (): QualityTier => {
  if (typeof window === 'undefined') return 'high'
  const isSmallViewport = window.innerWidth < 768
  const lowCores = typeof navigator !== 'undefined' && navigator.hardwareConcurrency <= 4
  return isSmallViewport || lowCores ? 'low' : 'high'
}

export const isInsideTrainZone = (zone: CameraZone): boolean =>
  zone === 'car-2' ||
  zone === 'car-3' ||
  zone === 'car-4' ||
  zone === 'car-5' ||
  zone === 'seat-1' ||
  zone === 'seat-2' ||
  zone === 'seat-3' ||
  zone === 'seat-4' ||
  zone === 'turntable' ||
  zone === 'credits'

export const isFocusedPropZone = (zone: CameraZone): boolean =>
  zone === 'vending' ||
  zone === 'corkboard' ||
  zone === 'seat-1' ||
  zone === 'seat-2' ||
  zone === 'seat-3' ||
  zone === 'seat-4' ||
  zone === 'turntable' ||
  zone === 'credits'

interface AppState {
  cameraZone: CameraZone
  activeSection: PortfolioSection
  activeProjectId: string | null
  hoveredInteractable: InteractableHint | null
  sceneLoaded: boolean
  arrivalProgress: number
  arrivalCompleted: boolean
  trainDoorsOpen: boolean
  audioMuted: boolean
  musicPlaying: boolean
  activeTrackIndex: number
  qualityTier: QualityTier
  guestbookNotes: GuestbookNote[]

  setSceneLoaded: (loaded: boolean) => void
  setArrivalProgress: (p: number) => void
  setArrivalCompleted: (done: boolean) => void
  replayArrival: () => void
  setCameraZone: (zone: CameraZone) => void
  openSection: (section: PortfolioSection, projectId?: string | null) => void
  closeSection: () => void
  stepBack: () => void
  setHoveredInteractable: (hint: InteractableHint | null) => void
  toggleAudioMuted: () => void
  setMusicPlaying: (playing: boolean) => void
  setActiveTrackIndex: (index: number) => void
  boardTrain: (targetCar?: 'car-2' | 'car-3' | 'car-4' | 'car-5') => void
  exitTrain: () => void
  interactWithProp: (
    propZone: 'vending' | 'corkboard' | 'seat-1' | 'seat-2' | 'seat-3' | 'seat-4' | 'turntable' | 'credits',
    section: Exclude<PortfolioSection, null>,
    projectId?: string,
  ) => void
  addGuestbookNote: (author: string, message: string, color: GuestbookNote['color']) => void
}

export const useAppStore = create<AppState>((set) => ({
  cameraZone: 'platform',
  activeSection: null,
  activeProjectId: null,
  hoveredInteractable: null,
  sceneLoaded: false,
  arrivalProgress: 0,
  arrivalCompleted: false,
  trainDoorsOpen: false,
  audioMuted: false,
  musicPlaying: false,
  activeTrackIndex: 0,
  qualityTier: detectDefaultQuality(),
  guestbookNotes: loadNotes(),

  setSceneLoaded: (sceneLoaded) => set({ sceneLoaded }),
  setArrivalProgress: (arrivalProgress) => set({ arrivalProgress }),
  setArrivalCompleted: (arrivalCompleted) => set({ arrivalCompleted }),
  replayArrival: () =>
    set({
      cameraZone: 'platform',
      activeSection: null,
      activeProjectId: null,
      trainDoorsOpen: false,
      arrivalProgress: 0,
      arrivalCompleted: false,
    }),

  setCameraZone: (cameraZone) =>
    set({
      cameraZone,
      activeSection: null,
      trainDoorsOpen: isInsideTrainZone(cameraZone),
    }),

  openSection: (activeSection, projectId = null) =>
    set({ activeSection, activeProjectId: projectId }),

  closeSection: () => set({ activeSection: null }),

  /** Clean 2-step step-back hierarchy: Modal -> Focused Prop -> Parent Car/Platform -> Platform */
  stepBack: () =>
    set((s) => {
      if (s.activeSection) {
        return { activeSection: null }
      }
      if (s.cameraZone === 'vending' || s.cameraZone === 'corkboard') {
        return { cameraZone: 'platform' }
      }
      if (
        s.cameraZone === 'seat-1' ||
        s.cameraZone === 'seat-2' ||
        s.cameraZone === 'seat-3' ||
        s.cameraZone === 'seat-4'
      ) {
        return { cameraZone: 'car-2', activeProjectId: null }
      }
      if (s.cameraZone === 'turntable') {
        return { cameraZone: 'car-3' }
      }
      if (s.cameraZone === 'credits') {
        return { cameraZone: 'car-5' }
      }
      if (isInsideTrainZone(s.cameraZone)) {
        return { cameraZone: 'platform', trainDoorsOpen: false }
      }
      return s
    }),

  setHoveredInteractable: (hoveredInteractable) => set({ hoveredInteractable }),
  toggleAudioMuted: () => set((s) => ({ audioMuted: !s.audioMuted })),
  setMusicPlaying: (musicPlaying) => set({ musicPlaying }),
  setActiveTrackIndex: (activeTrackIndex) => set({ activeTrackIndex }),

  boardTrain: (targetCar = 'car-2') =>
    set({
      trainDoorsOpen: true,
      cameraZone: targetCar,
      activeSection: null,
      activeProjectId: null,
    }),

  exitTrain: () =>
    set({
      trainDoorsOpen: false,
      cameraZone: 'platform',
      activeSection: null,
      activeProjectId: null,
    }),

  /**
   * 2-Step Diegetic Interaction ("Focus -> Open"):
   * - 1st Click on a prop -> camera smoothly zooms to focus closely on that 3D object (no popup yet!)
   * - 2nd Click while already focused -> opens the rich interactive modal for that element!
   */
  interactWithProp: (propZone, section, projectId) =>
    set((s) => {
      if (s.cameraZone === propZone) {
        return { activeSection: section, activeProjectId: projectId ?? null }
      }
      return {
        cameraZone: propZone,
        activeSection: null,
        activeProjectId: projectId ?? null,
        trainDoorsOpen: isInsideTrainZone(propZone),
      }
    }),

  addGuestbookNote: (author, message, color) =>
    set((s) => {
      const next: GuestbookNote[] = [
        {
          id: `note-${Date.now()}`,
          author: author.trim() || 'Anonymous',
          message: message.trim(),
          color,
          createdAt: new Date().toISOString().slice(0, 10),
          rotation: Number(((Math.random() - 0.5) * 6).toFixed(1)),
        },
        ...s.guestbookNotes,
      ].slice(0, 24)
      saveNotes(next)
      return { guestbookNotes: next }
    }),
}))
