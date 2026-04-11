import React from 'react'
import { BookOpen, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import { BookshelfBook } from '../../services/database'

interface QuestCardProps {
  book: BookshelfBook | null
  theme: 'dark' | 'light'
  onContinueReading?: () => void
}

export default function QuestCard({ book, theme, onContinueReading }: QuestCardProps) {
  const isDark = theme === 'dark'

  if (!book) {
    return (
      <motion.div
        className="rounded-[20px] border backdrop-blur-lg p-8 text-center"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.08) 100%)'
            : 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.06) 100%)',
          borderColor: isDark ? 'rgba(212, 175, 55, 0.2)' : 'rgba(196, 164, 132, 0.2)',
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <BookOpen size={32} className="mx-auto mb-3 opacity-50" />
        <p className="font-semibold mb-1">Sin misiones activas</p>
        <p className="text-sm opacity-70">Añade un libro para comenzar una nueva aventura literaria 📚</p>
      </motion.div>
    )
  }

  const progressPercent = Math.round((book.currentPage / book.totalPages) * 100)
  const pagesLeft = book.totalPages - book.currentPage

  return (
    <motion.div
      className="rounded-[20px] border backdrop-blur-lg overflow-hidden"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.08) 100%)'
          : 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.06) 100%)',
        borderColor: isDark ? 'rgba(212, 175, 55, 0.2)' : 'rgba(196, 164, 132, 0.2)',
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Cover + Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 p-5 sm:p-6">
        {/* Book Cover */}
        <div className="relative rounded-[12px] overflow-hidden">
          {book.cover ? (
            <>
              <img
                src={book.cover}
                alt={book.title}
                className="w-full aspect-[2/3] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </>
          ) : (
            <div className="w-full aspect-[2/3] bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center rounded">
              <BookOpen className="text-white/70" size={32} />
            </div>
          )}
        </div>

        {/* Mission Info */}
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase font-bold tracking-[0.1em] opacity-70 mb-2">Misión Actual</p>
            <h3 className="text-lg font-bold mb-1" style={{ color: isDark ? '#F5F1E8' : '#3B2F24' }}>
              {book.title}
            </h3>
            <p className="text-sm opacity-70 mb-3">{book.author}</p>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Progreso de lectura</span>
                <span style={{ color: isDark ? '#D4AF37' : '#C4A484' }}>{progressPercent}%</span>
              </div>
              <div
                className="relative h-2 rounded-full overflow-hidden border"
                style={{
                  background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.4)',
                  borderColor: isDark ? 'rgba(212, 175, 55, 0.2)' : 'rgba(196, 164, 132, 0.2)',
                }}
              >
                <motion.div
                  className="h-full rounded-full pages-gradient"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{
                    boxShadow: isDark
                      ? '0 0 8px rgba(34, 197, 94, 0.5)'
                      : '0 0 6px rgba(34, 197, 94, 0.4)',
                  }}
                />
              </div>

              <div className="flex justify-between text-xs opacity-60 mt-2">
                <span>{book.currentPage} de {book.totalPages} páginas</span>
                <span className="font-semibold">{pagesLeft} páginas restantes</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {onContinueReading && (
            <motion.button
              onClick={onContinueReading}
              className="mt-4 px-4 py-2.5 rounded-[12px] font-semibold text-sm transition-all flex items-center justify-center gap-2 border"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(196, 164, 132, 0.15) 0%, rgba(196, 164, 132, 0.08) 100%)',
                color: isDark ? '#D4AF37' : '#C4A484',
                borderColor: isDark ? 'rgba(212, 175, 55, 0.3)' : 'rgba(196, 164, 132, 0.25)',
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: isDark
                  ? '0 0 16px rgba(212, 175, 55, 0.25)'
                  : '0 0 12px rgba(196, 164, 132, 0.2)',
              }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Target size={16} /> Continuar leyendo
            </motion.button>
          )}
        </div>
      </div>

      {/* Quick Achievement Suggestion */}
      <motion.div
        className="border-t px-5 sm:px-6 py-4"
        style={{
          borderColor: isDark ? 'rgba(212, 175, 55, 0.1)' : 'rgba(196, 164, 132, 0.1)',
          background: isDark
            ? 'rgba(0, 0, 0, 0.2)'
            : 'rgba(255, 255, 255, 0.3)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5">⚡</span>
          <div>
            <p className="text-sm font-semibold mb-1">Logro del día</p>
            <p className="text-xs opacity-70">
              {pagesLeft <= 10
                ? `¡Casi terminas! Lee los últimos ${pagesLeft} paginas -> +100 XP`
                : `Lee ${Math.min(10, pagesLeft)} páginas hoy -> +50 XP`}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
