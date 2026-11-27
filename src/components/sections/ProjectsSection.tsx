import { X, FolderKanban, Sparkles, ArrowRight } from 'lucide-react'
import { PROJECTS_DATA } from '../../data/portfolioData'
import { useAppStore } from '../../store/useAppStore'
import { soundEngine } from '../../utils/soundEngine'

export function ProjectsSection() {
  const closeSection = useAppStore((s) => s.closeSection)
  const activeProjectId = useAppStore((s) => s.activeProjectId)
  const setCameraZone = useAppStore((s) => s.setCameraZone)

  const highlightedProject = activeProjectId
    ? PROJECTS_DATA.find((p) => p.id === activeProjectId)
    : null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 p-3 backdrop-blur-[2px] sm:p-6">
      <section className="persona-panel relative flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden">
        {/* Express Seat Display Header */}
        <div className="flex items-center justify-between border-b-3 border-[#5c4033] bg-[#2b211c] px-5 py-3 text-[#fff8eb]">
          <div className="flex items-center gap-2.5">
            <FolderKanban className="h-5 w-5 text-[#7bae7f]" />
            <div>
              <h2 className="font-display text-base tracking-wider sm:text-lg">
                CAR 02 // SEAT PROJECT SHOWCASE{' '}
                <span className="font-jp text-sm text-[#ffb347]">プロジェクト</span>
              </h2>
              <p className="text-[11px] font-bold tracking-widest uppercase opacity-75">
                {highlightedProject
                  ? `FOCUSED SEAT: ${highlightedProject.trainCode} — ${highlightedProject.title}`
                  : 'SELECTED BUILDS & EXPERIMENTS BY SHIRO'}
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
            aria-label="Close Projects"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Project Cards Grid (focused seat's project highlighted cleanly!) */}
        <div className="grid grid-cols-1 gap-4 overflow-y-auto p-4 sm:grid-cols-2 sm:p-6">
          {PROJECTS_DATA.map((proj) => {
            const isSelected = proj.id === activeProjectId
            return (
              <article
                key={proj.id}
                className={`flex flex-col justify-between rounded-xl border-2 p-4 transition-all ${
                  isSelected
                    ? 'border-[#2b211c] bg-[#fff4db] ring-2 ring-[#ffb347] shadow-[5px_5px_0px_#2b211c]'
                    : 'border-[#5c4033] bg-[#fffdf7] shadow-[4px_4px_0px_#5c4033]'
                }`}
              >
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span
                      className="rounded px-2 py-0.5 font-display text-[11px] tracking-wider text-[#2b211c]"
                      style={{ backgroundColor: proj.accent }}
                    >
                      {proj.trainCode}
                    </span>
                    <span className="rounded-full border border-[#5c4033]/30 bg-[#fff3d6] px-2 py-0.5 text-[10px] font-black tracking-wider">
                      {isSelected ? '★ ACTIVE SEAT' : proj.status}
                    </span>
                  </div>

                  <h3 className="font-display text-lg leading-tight">{proj.title}</h3>
                  <p className="font-jp text-xs font-bold opacity-60">{proj.jpTitle}</p>
                  <p className="mt-2.5 text-xs leading-relaxed opacity-85 sm:text-sm">
                    {proj.summary}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-[#5c4033]/15 pt-3">
                  {proj.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-[#2b211c] px-2 py-0.5 text-[10px] font-bold text-[#fff8eb]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </article>
            )
          })}
        </div>

        {/* Next Car CTA Footer */}
        <div className="flex items-center justify-between border-t-2 border-[#5c4033]/20 bg-[#f6ebd6] px-5 py-2.5 text-xs font-bold">
          <span className="flex items-center gap-1.5 opacity-80">
            <Sparkles className="h-3.5 w-3.5 text-[#d97724]" /> Walk back to Car 03 for the Vintage
            Turntable Lounge!
          </span>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick()
              closeSection()
              setCameraZone('car-3')
            }}
            className="flex cursor-pointer items-center gap-1 rounded-lg bg-[#2b211c] px-3 py-1.5 text-[11px] font-black text-[#ffb347] hover:opacity-90"
          >
            CAR 03 · VINYL LOUNGE <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>
    </div>
  )
}
