import { X, Sparkles, ExternalLink, TrainFront } from 'lucide-react'
import { PROFILE_DATA } from '../../data/portfolioData'
import { useAppStore } from '../../store/useAppStore'
import { soundEngine } from '../../utils/soundEngine'

export function AboutSection() {
  const closeSection = useAppStore((s) => s.closeSection)

  const handleClose = () => {
    soundEngine.playClick()
    closeSection()
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-3 backdrop-blur-[3px] sm:p-6">
      <section className="persona-panel relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden">
        {/* Rear Tail Car 05 Observation Finale — JR Pass Header */}
        <div className="relative flex items-center justify-between border-b-3 border-[#5c4033] bg-gradient-to-r from-[#2b211c] via-[#4a3228] to-[#5c9b6b] px-5 py-4 text-[#fff8eb]">
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-black tracking-[0.2em] text-[#ffb347] uppercase">
              <TrainFront className="h-3.5 w-3.5" /> CAR 05 // REAR OBSERVATION FINALE — JR PASS
            </p>
            <h2 className="mt-0.5 font-display text-2xl tracking-wider sm:text-3xl">
              {PROFILE_DATA.displayName}{' '}
              <span className="font-jp text-lg text-[#ffb7c5]">{PROFILE_DATA.jpName}</span>
            </h2>
            <p className="text-xs font-bold opacity-85">{PROFILE_DATA.role}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="cursor-pointer rounded-lg bg-black/30 p-1.5 hover:bg-black/50"
            aria-label="Close About Me"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto p-5 sm:p-6">
          <p className="text-sm font-medium leading-relaxed sm:text-[15px]">{PROFILE_DATA.bio}</p>

          <div className="rounded-xl border-2 border-[#5c4033] bg-[#fff3d8] p-4">
            <h3 className="mb-2.5 flex items-center gap-1.5 font-display text-xs tracking-widest text-[#5c4033] uppercase">
              <Sparkles className="h-3.5 w-3.5 text-[#d97724]" /> CURRENT STATUS // 現在のステータス
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {PROFILE_DATA.currently.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-[#5c4033]/25 bg-white/80 p-2.5"
                >
                  <p className="text-[10px] font-black tracking-widest text-[#5c9b6b]">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-[#2b211c]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-display text-xs tracking-widest text-[#5c4033] uppercase">
              TECH &amp; TOOLKIT
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {PROFILE_DATA.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg border-2 border-[#5c4033] bg-white px-2.5 py-1 text-xs font-black text-[#2b211c]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {PROFILE_DATA.socials.map((soc) => (
              <a
                key={soc.label}
                href={soc.url}
                target={soc.url.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg border-2 border-[#2b211c] bg-[#ffb347] px-3 py-1.5 text-xs font-black text-[#2b211c] shadow-[2px_2px_0px_#2b211c] transition-transform hover:-translate-y-0.5"
              >
                <span>{soc.label}</span>
                <span className="opacity-70">{soc.handle}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>

          <footer className="border-t-2 border-dashed border-[#5c4033]/30 pt-3 text-center text-xs font-bold opacity-75">
            <p className="font-jp text-[#5c4033]">ご乗車ありがとうございました — THANK YOU FOR RIDING</p>
            <p className="mt-1 text-[11px]">{PROFILE_DATA.credits}</p>
          </footer>
        </div>
      </section>
    </div>
  )
}
