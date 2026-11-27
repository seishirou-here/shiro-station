import { MUSIC_TRACKS } from '../data/portfolioData'

/**
 * Zero-dependency Web Audio API engine for Shiro Station:
 * - Authentic Japanese Shinkansen "hassha melody" chime on arrival/boarding
 * - Soft UI click & sliding door air-whoosh SFX
 * - Cozy synthesized lo-fi Rhodes chord loop for the Lounge Jukebox
 */
class ShiroSoundEngine {
  private ctx: AudioContext | null = null
  private muted = false
  private loopTimer: number | null = null
  private stepIndex = 0
  private activeTrack = 0

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return null
      this.ctx = new AudioCtx()
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  public setMuted(muted: boolean) {
    this.muted = muted
    if (muted) {
      this.stopMusic()
    }
  }

  /** Classic cheerful Japanese JR station arrival chime (bell arpeggio) */
  public playStationChime() {
    const ctx = this.ensureContext()
    if (!ctx) return
    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5]
    const offsets = [0, 0.16, 0.32, 0.48, 0.72, 0.88]

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + offsets[i])

      gain.gain.setValueAtTime(0.001, now + offsets[i])
      gain.gain.exponentialRampToValueAtTime(0.08, now + offsets[i] + 0.025)
      gain.gain.exponentialRampToValueAtTime(0.0008, now + offsets[i] + 0.55)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + offsets[i])
      osc.stop(now + offsets[i] + 0.6)
    })
  }

  /** Soft snappy Persona-like confirmation chirp */
  public playClick() {
    const ctx = this.ensureContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(640, now)
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.06)

    gain.gain.setValueAtTime(0.055, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.09)
  }

  /** Gentle pneumatic door slide chime when boarding Shinkansen */
  public playDoorSlide() {
    const ctx = this.ensureContext()
    if (!ctx) return
    const now = ctx.currentTime
    // Two-tone JR door chime (ding-dong)
    ;[880, 698.46].forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      const t = now + idx * 0.14
      osc.frequency.setValueAtTime(freq, t)
      gain.gain.setValueAtTime(0.001, t)
      gain.gain.exponentialRampToValueAtTime(0.065, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.38)
    })
  }

  /** Start cozy synthesized Rhodes/Bell lo-fi loop for the Lounge Jukebox */
  public startMusic(trackIndex: number) {
    this.activeTrack = trackIndex
    this.stopMusic()
    const ctx = this.ensureContext()
    if (!ctx) return

    const track = MUSIC_TRACKS[trackIndex] ?? MUSIC_TRACKS[0]
    const beatMs = (60 / track.bpm) * 1000 * 2 // 1 warm chord every 2 beats
    this.stepIndex = 0

    const playChord = () => {
      if (this.muted) return
      const audio = this.ensureContext()
      if (!audio) return
      const chord = track.chordProgression[this.stepIndex % track.chordProgression.length]
      const now = audio.currentTime

      chord.forEach((freq, idx) => {
        const osc = audio.createOscillator()
        const gain = audio.createGain()
        const filter = audio.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(1100, now)

        osc.type = idx === 0 ? 'triangle' : 'sine'
        osc.frequency.setValueAtTime(freq, now + idx * 0.03)

        gain.gain.setValueAtTime(0.001, now + idx * 0.03)
        gain.gain.exponentialRampToValueAtTime(0.032, now + idx * 0.03 + 0.08)
        gain.gain.exponentialRampToValueAtTime(0.001, now + beatMs / 1000 + 0.25)

        osc.connect(filter)
        filter.connect(gain)
        gain.connect(audio.destination)
        osc.start(now + idx * 0.03)
        osc.stop(now + beatMs / 1000 + 0.3)
      })

      this.stepIndex += 1
    }

    playChord()
    this.loopTimer = window.setInterval(playChord, beatMs)
  }

  public stopMusic() {
    if (this.loopTimer !== null) {
      window.clearInterval(this.loopTimer)
      this.loopTimer = null
    }
  }

  public getCurrentTrack() {
    return this.activeTrack
  }
}

export const soundEngine = new ShiroSoundEngine()
