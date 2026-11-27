import { useState } from 'react'
import { X, ArrowLeft, Coffee, Clock } from 'lucide-react'
import { BLOGS_DATA, type BlogDrinkItem } from '../../data/portfolioData'
import { useAppStore } from '../../store/useAppStore'
import { soundEngine } from '../../utils/soundEngine'

export function BlogsSection() {
  const closeSection = useAppStore((s) => s.closeSection)
  const [selectedDrink, setSelectedDrink] = useState<BlogDrinkItem | null>(null)

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 p-3 backdrop-blur-[2px] sm:p-6">
      <section className="persona-panel relative flex max-h-[86vh] w-full max-w-2xl flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b-3 border-[#5c4033] bg-[#d95d4e] px-5 py-3 text-[#fff8eb]">
          <div className="flex items-center gap-2.5">
            <Coffee className="h-5 w-5" />
            <div>
              <h2 className="font-display text-base tracking-wider sm:text-lg">
                SHIRO VENDING DEVLOGS <span className="font-jp text-sm opacity-90">自販機ブログ</span>
              </h2>
              <p className="text-[11px] font-bold tracking-widest uppercase opacity-85">
                PICK A DRINK CAN TO READ A SHORT DEVLOG
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick()
              closeSection()
            }}
            className="cursor-pointer rounded-lg bg-black/25 p-1.5 hover:bg-black/40"
            aria-label="Close Blogs"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6">
          {selectedDrink ? (
            <div>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick()
                  setSelectedDrink(null)
                }}
                className="mb-4 flex cursor-pointer items-center gap-1.5 text-xs font-black tracking-wider uppercase text-[#5c4033] hover:underline"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Vending Shelf
              </button>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-3 py-0.5 text-xs font-black text-[#2b211c]"
                  style={{ backgroundColor: selectedDrink.flavorColor }}
                >
                  {selectedDrink.canLabel} · {selectedDrink.jpLabel}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold opacity-65">
                  <Clock className="h-3.5 w-3.5" /> {selectedDrink.readTime} · {selectedDrink.date}
                </span>
              </div>

              <h3 className="font-display text-xl leading-snug sm:text-2xl">{selectedDrink.title}</h3>

              <div className="mt-4 space-y-3.5 text-sm leading-relaxed sm:text-[15px]">
                {selectedDrink.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              {BLOGS_DATA.map((drink) => (
                <button
                  key={drink.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick()
                    setSelectedDrink(drink)
                  }}
                  className="group flex cursor-pointer flex-col justify-between rounded-xl border-2 border-[#5c4033] bg-[#fffdf7] p-3.5 text-left transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_#5c4033]"
                >
                  <div>
                    {/* Stylized Drink Can Illustration */}
                    <div
                      className="mb-3 flex h-24 flex-col items-center justify-center rounded-lg border-2 border-[#5c4033] p-2 text-center"
                      style={{ backgroundColor: drink.flavorColor }}
                    >
                      <span className="font-jp text-xs font-black text-[#2b211c]/80">
                        {drink.jpLabel}
                      </span>
                      <span className="font-display text-sm tracking-wide text-[#2b211c]">
                        {drink.canLabel}
                      </span>
                    </div>

                    <p className="text-[10px] font-bold tracking-widest uppercase opacity-60">
                      {drink.readTime}
                    </p>
                    <h3 className="mt-1 text-sm font-black leading-snug group-hover:text-[#b54538]">
                      {drink.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-3 text-xs opacity-75">{drink.excerpt}</p>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[#5c4033]/20 pt-2">
                    <span className="font-display text-xs text-[#5c4033]">{drink.price}</span>
                    <span className="rounded bg-[#2b211c] px-2 py-0.5 text-[10px] font-bold text-[#fff8eb]">
                      DISPENSE ▶
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
