import React from 'react'
import { BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import { BookshelfBook } from '../../services/database'

interface ShelfBooksVisualProps {
  books: BookshelfBook[]
  completedCount: number
  theme: 'dark' | 'light'
}

export default function ShelfBooksVisual({
  books,
  completedCount,
  theme,
}: ShelfBooksVisualProps) {
  const isDark = theme === 'dark'
  const totalShelfSlots = Math.max(10, Math.ceil(books.length * 1.2))

  const shelfColors = [
    'from-red-500 to-red-700',
    'from-orange-500 to-orange-700',
    'from-yellow-500 to-yellow-700',
    'from-green-500 to-green-700',
    'from-blue-500 to-blue-700',
    'from-purple-500 to-purple-700',
    'from-pink-500 to-pink-700',
    'from-indigo-500 to-indigo-700',
    'from-teal-500 to-teal-700',
    'from-cyan-500 to-cyan-700',
  ]

  return (
    <motion.div
      className="flex flex-col gap-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Counter */}
      <div className="text-center">
        <motion.h3
          className="text-5xl font-bold mb-2"
          style={{ color: isDark ? '#D4AF37' : '#C4A484' }}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, type: 'spring', stiffness: 100 }}
        >
          {completedCount}
        </motion.h3>
        <p className="text-xs uppercase tracking-[0.15em] font-bold opacity-70">Libros completados</p>
      </div>

      {/* Shelf Grid */}
      <div className="grid gap-3">
        {/* Shelf visual with slots */}
        <div
          className="relative p-6 rounded-[20px] border backdrop-blur-lg"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.8) 0%, rgba(20, 20, 20, 0.6) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(245, 245, 245, 0.5) 100%)',
            borderColor: isDark ? 'rgba(212, 175, 55, 0.2)' : 'rgba(196, 164, 132, 0.2)',
            boxShadow: isDark
              ? '0 0 12px rgba(0, 0, 0, 0.4), inset 0 0 8px rgba(0, 0, 0, 0.2)'
              : '0 0 8px rgba(0, 0, 0, 0.05), inset 0 0 4px rgba(255, 255, 255, 0.4)',
          }}
        >
          {/* Wood shelf effect */}
          <div
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r"
            style={{
              background: isDark
                ? 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3) 50%, transparent)'
                : 'linear-gradient(90deg, transparent, rgba(196, 164, 132, 0.2) 50%, transparent)',
            }}
          />

          {/* Books grid */}
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
            {[...Array(totalShelfSlots)].map((_, index) => {
              const isCompleted = index < completedCount
              const book = books[index]
              const colorClass = shelfColors[index % shelfColors.length]

              return (
                <motion.div
                  key={index}
                  className="relative aspect-[2/3] rounded-sm overflow-hidden border"
                  style={{
                    borderColor: isCompleted
                      ? 'rgba(212, 175, 55, 0.4)'
                      : isDark
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.08)',
                  }}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                    ease: 'easeOut',
                  }}
                  whileHover={isCompleted ? { scale: 1.08, rotateZ: 2 } : {}}
                >
                  {isCompleted && book ? (
                    <>
                      {/* Book with cover image */}
                      {book.cover ? (
                        <>
                          <img
                            src={book.cover}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </>
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${colorClass}`} />
                      )}
                      
                      {/* Completion badge */}
                      <motion.div
                        className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.05 + 0.2,
                          type: 'spring',
                          stiffness: 120,
                        }}
                      >
                        ✓
                      </motion.div>
                    </>
                  ) : (
                    <>
                      {/* Empty slot */}
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          background: isDark
                            ? 'linear-gradient(135deg, rgba(100, 100, 100, 0.1) 0%, rgba(60, 60, 60, 0.08) 100%)'
                            : 'linear-gradient(135deg, rgba(200, 200, 200, 0.1) 0%, rgba(220, 220, 220, 0.08) 100%)',
                        }}
                      >
                        <BookOpen
                          size={12}
                          style={{
                            color: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)',
                          }}
                        />
                      </div>
                      
                      {/* Dashed border for empty */}
                      <div
                        className="absolute inset-0 border-2 border-dashed rounded-sm opacity-40"
                        style={{
                          borderColor: isDark
                            ? 'rgba(255, 255, 255, 0.15)'
                            : 'rgba(0, 0, 0, 0.1)',
                        }}
                      />
                    </>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Shelf shadow effect */}
          <div
            className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r"
            style={{
              background: isDark
                ? 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.4) 50%, transparent)'
                : 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1) 50%, transparent)',
              borderRadius: '0 0 20px 20px',
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          className="p-4 rounded-[16px] border backdrop-blur text-center"
          style={{
            background: isDark
              ? 'rgba(30, 30, 30, 0.6)'
              : 'rgba(255, 255, 255, 0.5)',
            borderColor: isDark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(196, 164, 132, 0.15)',
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs uppercase tracking-[0.1em] opacity-70 mb-1">Progreso</p>
          <p className="text-2xl font-bold" style={{ color: isDark ? '#D4AF37' : '#C4A484' }}>
            {books.length > 0 ? Math.round((completedCount / books.length) * 100) : 0}%
          </p>
        </motion.div>

        <motion.div
          className="p-4 rounded-[16px] border backdrop-blur text-center"
          style={{
            background: isDark
              ? 'rgba(30, 30, 30, 0.6)'
              : 'rgba(255, 255, 255, 0.5)',
            borderColor: isDark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(196, 164, 132, 0.15)',
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <p className="text-xs uppercase tracking-[0.1em] opacity-70 mb-1">Total de libros</p>
          <p className="text-2xl font-bold" style={{ color: isDark ? '#D4AF37' : '#C4A484' }}>
            {books.length}
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
