import { useState, type FormEvent } from 'react'
import { X, Pin, Send } from 'lucide-react'
import { useAppStore, type GuestbookNote } from '../../store/useAppStore'
import { soundEngine } from '../../utils/soundEngine'

const NOTE_COLORS: Record<GuestbookNote['color'], string> = {
  sakura: '#ffc8d6',
  amber: '#ffe28a',
  mint: '#bce8cf',
  cream: '#fff9e6',
}

export function GuestbookBoard() {
  const closeSection = useAppStore((s) => s.closeSection)
  const notes = useAppStore((s) => s.guestbookNotes)
  const addNote = useAppStore((s) => s.addGuestbookNote)

  const [author, setAuthor] = useState('')
  const [message, setMessage] = useState('')
  const [color, setColor] = useState<GuestbookNote['color']>('sakura')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    soundEngine.playClick()
    addNote(author, message, color)
    setAuthor('')
    setMessage('')
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 p-3 backdrop-blur-[2px] sm:p-6">
      <section className="persona-panel relative flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden">
        {/* Corkboard Wooden Header */}
        <div className="flex items-center justify-between border-b-3 border-[#5c4033] bg-[#6b442e] px-5 py-3 text-[#fff8eb]">
          <div className="flex items-center gap-2.5">
            <Pin className="h-5 w-5 text-[#ffb347]" />
            <div>
              <h2 className="font-display text-base tracking-wider sm:text-lg">
                STATION CORKBOARD <span className="font-jp text-sm opacity-90">掲示板</span>
              </h2>
              <p className="text-[11px] font-bold tracking-widest uppercase opacity-80">
                LEAVE A STICKY NOTE AT SHIRO STATION ({notes.length} NOTES)
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
            aria-label="Close Guestbook"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid max-h-[75vh] grid-cols-1 gap-4 overflow-y-auto bg-[#c89a68]/45 p-4 sm:grid-cols-12 sm:p-5">
          {/* Sticky Notes Cork Wall */}
          <div className="grid grid-cols-1 gap-3 sm:col-span-7 sm:grid-cols-2">
            {notes.map((note) => (
              <article
                key={note.id}
                className="relative rounded-md border-2 border-[#5c4033] p-3 shadow-[3px_4px_0px_rgba(43,33,28,0.35)] transition-transform hover:scale-[1.03]"
                style={{
                  backgroundColor: NOTE_COLORS[note.color],
                  transform: `rotate(${note.rotation}deg)`,
                }}
              >
                <span className="mx-auto mb-1.5 block h-2.5 w-2.5 rounded-full border border-[#5c4033] bg-[#d95d4e]" />
                <p className="text-xs font-bold leading-relaxed text-[#2b211c] sm:text-[13px]">
                  “{note.message}”
                </p>
                <div className="mt-2.5 flex items-center justify-between border-t border-[#5c4033]/20 pt-1.5 text-[10px] font-black text-[#5c4033]">
                  <span>— {note.author}</span>
                  <span className="opacity-70">{note.createdAt}</span>
                </div>
              </article>
            ))}
          </div>

          {/* Pin a New Sticky Note Form */}
          <form
            onSubmit={handleSubmit}
            className="flex h-fit flex-col gap-3 rounded-xl border-2 border-[#5c4033] bg-[#fff8eb] p-4 sm:col-span-5"
          >
            <h3 className="font-display text-sm tracking-wide">PIN YOUR NOTE ✨</h3>
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase opacity-75">
                Name / Handle
              </label>
              <input
                type="text"
                maxLength={28}
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Traveler name..."
                className="w-full rounded-lg border-2 border-[#5c4033]/40 bg-white px-3 py-1.5 text-sm font-bold text-[#2b211c] outline-none focus:border-[#5c4033]"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase opacity-75">
                Message
              </label>
              <textarea
                rows={3}
                maxLength={140}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Say hi before the Shinkansen leaves!"
                className="w-full resize-none rounded-lg border-2 border-[#5c4033]/40 bg-white px-3 py-1.5 text-sm text-[#2b211c] outline-none focus:border-[#5c4033]"
              />
            </div>

            <div>
              <span className="mb-1.5 block text-[11px] font-bold uppercase opacity-75">
                Paper Color
              </span>
              <div className="flex gap-2">
                {(Object.keys(NOTE_COLORS) as GuestbookNote['color'][]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-7 w-7 cursor-pointer rounded-full border-2 transition-transform ${
                      color === c ? 'scale-115 border-[#2b211c]' : 'border-[#5c4033]/40'
                    }`}
                    style={{ backgroundColor: NOTE_COLORS[c] }}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-[#2b211c] bg-[#ffb347] px-4 py-2 font-display text-xs tracking-wider text-[#2b211c] shadow-[3px_3px_0px_#2b211c] transition-transform active:translate-y-0.5"
            >
              <Send className="h-3.5 w-3.5" /> PIN TO BOARD
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
