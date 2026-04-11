import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, CheckCircle2, PlusCircle, Bell } from 'lucide-react'
import { GoogleBook } from '../../services/googleBooks'

interface BookZoomModalProps {
  isOpen: boolean
  book: GoogleBook | null
  isInLibrary?: boolean
  isTitleFollowed?: boolean
  onClose: () => void
  onAddToList: (book: GoogleBook) => Promise<void> | void
  onMarkAsRead: (book: GoogleBook) => Promise<void> | void
  onToggleFollowTitle: (book: GoogleBook) => Promise<void> | void
}

export default function BookZoomModal({ isOpen, book, isInLibrary = false, isTitleFollowed = false, onClose, onAddToList, onMarkAsRead, onToggleFollowTitle }: BookZoomModalProps) {
  return (
    <AnimatePresence>
      {isOpen && book && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-[24px] border border-[#D4AF37]/30 bg-[#0F0F0F]/90 p-4 text-[#F5F1E8] shadow-[0_20px_56px_rgba(0,0,0,0.55)]"
            initial={{ opacity: 0, scale: 0.58, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.62, y: 0 }}
            transition={{ type: 'spring', stiffness: 290, damping: 24 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.18),transparent_60%)]" />
            <button
              onClick={onClose}
              className="sticky float-right right-0 top-0 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Cerrar"
            >
              <X size={14} />
            </button>

            <div className="clear-both grid grid-cols-1 gap-4 sm:grid-cols-[140px_1fr]">
              <img
                src={book.thumbnail || '/placeholder-book.png'}
                alt={book.title}
                className="h-[210px] w-[140px] rounded-[18px] bg-black/30 p-1 object-contain shadow-[0_12px_26px_rgba(0,0,0,0.42)]"
              />

              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#D4AF37]">Vista rápida</p>
                <h3 className="mt-1.5 font-serif text-2xl font-bold">{book.title}</h3>
                <p className="mt-1 text-xs text-[#CFC6BA]">{book.author}</p>
                {book.publishedDate && (
                  <p className="mt-1 text-[11px] text-[#D4AF37]">Publicado: {book.publishedDate}</p>
                )}
                <p className="mt-3 line-clamp-6 text-xs leading-relaxed text-[#E5DED3]">
                  {book.description || 'Sinopsis disponible próximamente. Añade este libro para seguir su lectura y compartir reseñas con el Círculo Noveli.'}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => onAddToList(book)}
                    disabled={isInLibrary}
                    className="inline-flex items-center gap-1.5 rounded-[30px] border border-[#D4AF37]/35 bg-white/5 px-3 py-1.5 text-xs font-medium text-[#D4AF37] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-80"
                  >
                    <PlusCircle size={14} />
                    {isInLibrary ? '✅ En tu estante' : 'Añadir a lista'}
                  </button>
                  <button
                    onClick={() => onMarkAsRead(book)}
                    className="inline-flex items-center gap-1.5 rounded-[30px] border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/15"
                  >
                    <CheckCircle2 size={14} />
                    Marcar como leído
                  </button>
                  <button
                    onClick={() => onToggleFollowTitle(book)}
                    className={`inline-flex items-center gap-1.5 rounded-[30px] border px-3 py-1.5 text-xs font-medium transition ${isTitleFollowed ? 'border-[#D4AF37]/35 bg-[#D4AF37]/16 text-[#D4AF37]' : 'border-white/25 bg-white/10 text-white hover:bg-white/15'}`}
                  >
                    <Bell size={14} />
                    {isTitleFollowed ? 'Siguiendo título' : 'Seguir título'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
