import React from 'react'
import { Sparkles, Plus } from 'lucide-react'

interface AIResultCardProps {
  titulo: string
  autor: string
  descripcionBreve: string
  onAdd: () => void
  isSelected?: boolean
}

export default function AIResultCard({
  titulo,
  autor,
  descripcionBreve,
  onAdd,
  isSelected = false,
}: AIResultCardProps) {
  return (
    <div
      className={[
        'relative overflow-hidden rounded-xl border p-[1px] transition',
        isSelected ? 'shadow-[0_0_22px_rgba(168,85,247,0.26)]' : 'hover:shadow-[0_0_18px_rgba(234,179,8,0.22)]',
      ].join(' ')}
      style={{
        background: 'linear-gradient(135deg, rgba(147,51,234,0.95), rgba(234,179,8,0.9))',
      }}
    >
      <div className="rounded-[11px] border border-white/10 bg-black/45 p-2.5 backdrop-blur-md">
        <div className="mb-1.5 flex items-center gap-1.5">
          <Sparkles size={12} className="text-violet-200" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-violet-100">Resultado IA</p>
        </div>

        <p className="truncate font-serif text-xs font-semibold text-white">{titulo}</p>
        <p className="truncate text-[11px] text-amber-100/85">{autor}</p>
        <p className="mt-1.5 line-clamp-2 text-[10px] leading-relaxed text-violet-100/95">{descripcionBreve}</p>

        <button
          onClick={onAdd}
          className="mt-2 inline-flex h-7 items-center justify-center gap-1 rounded-full border border-amber-300/45 bg-gradient-to-r from-violet-500/35 to-amber-500/35 px-2.5 text-[10px] font-semibold text-amber-100 transition hover:from-violet-500/45 hover:to-amber-500/45"
        >
          <Plus size={12} /> Añadir a mi estante
        </button>
      </div>
    </div>
  )
}
