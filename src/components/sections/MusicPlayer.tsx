import { X, Play, Pause, SkipForward, Bell, Disc3 } from 'lucide-react'
import { MUSIC_TRACKS } from '../../data/portfolioData'
import { useAppStore } from '../../store/useAppStore'
import { soundEngine } from '../../utils/soundEngine'

export function MusicPlayer() {
  const closeSection = useAppStore((s) => s.closeSection)
  const musicPlaying = useAppStore((s) => s.musicPlaying)
  const setMusicPlaying = useAppStore((s) => s.setMusicPlaying)
  const activeTrackIndex = useAppStore((s) => s.activeTrackIndex)
  const setActiveTrackIndex = useAppStore((s) => s.setActiveTrackIndex)
  const audioMuted = useAppStore((s) => s.audioMuted)
  const toggleAudioMuted = useAppStore((s) => s.toggleAudioMuted)

  const currentTrack = MUSIC_TRACKS[activeTrackIndex] ?? MUSIC_TRACKS[0]

  const ensureUnmuted = () => {
    if (audioMuted) {
      soundEngine.setMuted(false)
      toggleAudioMuted()
    }
  }

  const handleTogglePlay = () => {
    ensureUnmuted()
    if (musicPlaying) {
      soundEngine.stopMusic()
      setMusicPlaying(false)
    } else {
      soundEngine.startMusic(activeTrackIndex)
      setMusicPlaying(true)
    }
  }

  const handleSelectTrack = (idx: number) => {
    ensureUnmuted()
    setActiveTrackIndex(idx)
    soundEngine.startMusic(idx)
    setMusicPlaying(true)
  }

  const handleNext = () => {
    handleSelectTrack((activeTrackIndex + 1) % MUSIC_TRACKS.length)
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 p-3 backdrop-blur-[2px] sm:p-6">
      <section className="persona-panel-dark relative flex w-full max-w-md flex-col overflow-hidden">
        {/* Vintage Turntable Walnut Header */}
        <div className="flex items-center justify-between border-b-2 border-[#ffb347]/40 bg-[#4b2f21] px-5 py-3">
          <div className="flex items-center gap-2.5">
            <Disc3 className={`h-5 w-5 text-[#ff9cbd] ${musicPlaying ? 'animate-spin' : ''}`} />
            <div>
              <h2 className="font-display text-base tracking-wider text-[#fff8eb]">
                VINTAGE TURNTABLE <span className="font-jp text-xs text-[#ffb347]">レコード</span>
              </h2>
              <p className="text-[10px] font-bold tracking-widest uppercase text-white/70">
                CAR 03 // COZY ANIME VINYL DECK
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick()
              closeSection()
            }}
            className="cursor-pointer rounded-lg bg-white/10 p-1.5 hover:bg-white/20"
            aria-label="Close Vintage Turntable"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="rounded-xl border-2 border-[#d4a548]/50 bg-black/35 p-4">
            <div className="flex items-center justify-between">
              <span className="rounded bg-[#ff9cbd] px-2 py-0.5 text-[10px] font-black text-[#2b211c]">
                33⅓ RPM · {currentTrack.vibe}
              </span>
              <span className="text-[11px] font-bold text-[#ffb347]">{currentTrack.bpm} BPM</span>
            </div>

            <h3 className="mt-2 font-display text-lg text-[#fff8eb]">{currentTrack.title}</h3>
            <p className="font-jp text-xs text-[#ff9cbd]/90">{currentTrack.jpTitle}</p>

            {/* Warm Analog EQ Bars */}
            <div className="mt-4 flex h-8 items-end gap-1.5">
              {[0.55, 0.9, 0.4, 0.8, 1.0, 0.65, 0.85, 0.45, 0.75, 0.6].map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t bg-gradient-to-t from-[#d4a548] to-[#ff9cbd] transition-all duration-300 ${
                    musicPlaying ? 'animate-pulse' : 'opacity-30'
                  }`}
                  style={{
                    height: musicPlaying ? `${Math.round(h * 100)}%` : '20%',
                    animationDelay: `${i * 90}ms`,
                  }}
                />
              ))}
            </div>

            {/* Playback Controls */}
            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#ffb347] py-2 font-display text-xs tracking-wider text-[#2b211c] transition-transform active:scale-95"
              >
                {musicPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {musicPlaying ? 'LIFT NEEDLE' : 'DROP NEEDLE'}
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="flex cursor-pointer items-center justify-center rounded-lg bg-white/15 p-2 hover:bg-white/25"
                title="Next Vinyl"
              >
                <SkipForward className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  ensureUnmuted()
                  soundEngine.playStationChime()
                }}
                className="flex cursor-pointer items-center gap-1 rounded-lg bg-[#7bae7f] px-3 py-2 text-xs font-black text-[#141218] hover:opacity-90"
                title="Play JR Station Chime"
              >
                <Bell className="h-3.5 w-3.5" /> CHIME
              </button>
            </div>
          </div>

          {/* Vinyl Record Crate Tracklist */}
          <div className="mt-4 space-y-1.5">
            {MUSIC_TRACKS.map((track, idx) => {
              const active = idx === activeTrackIndex
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => handleSelectTrack(idx)}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-bold transition-colors ${
                    active
                      ? 'bg-[#ff9cbd]/25 text-[#fff8eb] ring-1 ring-[#ff9cbd]'
                      : 'bg-white/5 text-white/75 hover:bg-white/10'
                  }`}
                >
                  <span>
                    LP 0{idx + 1}. {track.title}
                  </span>
                  <span className="font-jp text-[10px] opacity-75">{track.jpTitle}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
