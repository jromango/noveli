import React, { useState, useEffect } from 'react'
import { BookOpen, Plus, Sparkles, Award, Trash2, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { Note, BookshelfBook } from '../services/database'
import BookDetailModal from '../components/BookDetailModal'
import ActivityFeed from '../components/ActivityFeed'
import OracleNoveli from '../components/OracleNoveli'
import PageLayout from '../components/layout/PageLayout'
import CardNoveli from '../components/ui/CardNoveli'
import { themeConfig } from '../lib/themeConfig'
import XPLevelBar from '../components/gamification/XPLevelBar'
import CircularProgress from '../components/gamification/CircularProgress'
import StreakFireIcon from '../components/gamification/StreakFireIcon'
import ShelfBooksVisual from '../components/gamification/ShelfBooksVisual'
import QuestCard from '../components/gamification/QuestCard'
import LevelUpNotification from '../components/gamification/LevelUpNotification'
import { useSound } from '../hooks/useSound'
import { calculateLevel, hasLeveledUp } from '../lib/gamification'

interface HomePageProps {
  notes: Note[]
  bookshelves: BookshelfBook[]
  isLoading: boolean
  username: string
  theme: 'dark' | 'light'
  onAddBook: () => void
  onBookUpdated: (updatedBook: BookshelfBook) => void
  onBookRemoved: (bookId: string) => Promise<void> | void
  onXpGained?: (xp: number) => void
}

const GENRES = [
  { id: 'all', label: 'Todos', emoji: '📚' },
  { id: 'thriller', label: 'Thriller', emoji: '🔪' },
  { id: 'romance', label: 'Romántica', emoji: '💕' },
  { id: 'fantasy', label: 'Fantasía', emoji: '🧙‍♂️' },
  { id: 'sci-fi', label: 'Ciencia Ficción', emoji: '🚀' },
  { id: 'mystery', label: 'Misterio', emoji: '🔍' },
  { id: 'biography', label: 'Biografía', emoji: '👤' },
  { id: 'history', label: 'Historia', emoji: '📜' },
]

export default function HomePage({
  notes,
  bookshelves,
  isLoading,
  username,
  theme,
  onAddBook,
  onBookUpdated,
  onBookRemoved,
  onXpGained,
}: HomePageProps) {
  const isDarkMode = theme === 'dark'
  const palette = themeConfig[theme]
  const colorConfig = {
    textPrimary: isDarkMode ? 'text-[#F5F1E8]' : 'text-[#3B2F24]',
    textAccent: isDarkMode ? 'text-[#D4AF37]' : 'text-[#C4A484]',
    textMuted: isDarkMode ? 'text-[#B4ACA0]' : 'text-[#7E6A54]',
  }

  const { playSound } = useSound()
  const [selectedBook, setSelectedBook] = useState<BookshelfBook | null>(null)
  const [isBookModalOpen, setIsBookModalOpen] = useState(false)
  const [previousXp, setPreviousXp] = useState(0)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [previousLevel, setPreviousLevel] = useState(1)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(new Set())

  // Calculate gamification metrics
  const completedBooks = bookshelves.filter(book => book.status === 'completed').length
  const readingBooks = bookshelves.filter(book => book.status === 'reading')
  const totalPages = bookshelves.reduce((total, book) => total + book.currentPage, 0)
  const streakDays = 7 // TODO: Calculate from last_read_date
  const xp = completedBooks * 100 + readingBooks.length * 25 + Math.floor(totalPages / 50)
  const currentLevel = calculateLevel(xp)
  const lastReadingBook = readingBooks[0] || null
  const dailyPageTarget = 30

  // Detect level up
  useEffect(() => {
    if (xp > previousXp && isLoading === false) {
      if (hasLeveledUp(previousXp, xp)) {
        setShowLevelUp(true)
        playSound('levelup', { volume: 0.4 })
      } else if (xp > previousXp && previousXp > 0) {
        // Play achievement sound when XP is gained
        playSound('achievement', { volume: 0.25 })
      }
      setPreviousXp(xp)
      setPreviousLevel(currentLevel)
    }
  }, [xp, previousXp, isLoading, currentLevel, playSound])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 18) return '¡Buenas noches'
    if (hour >= 12) return '¡Buenas tardes'
    return '¡Buenos días'
  }

  const toggleBookSelection = (bookId: string) => {
    const newSelected = new Set(selectedBookIds)
    if (newSelected.has(bookId)) {
      newSelected.delete(bookId)
    } else {
      newSelected.add(bookId)
    }
    setSelectedBookIds(newSelected)
  }

  const selectAllBooks = () => {
    if (selectedBookIds.size === bookshelves.length) {
      setSelectedBookIds(new Set())
    } else {
      setSelectedBookIds(new Set(bookshelves.map(b => b.id)))
    }
  }

  const deleteSelectedBooks = async () => {
    if (selectedBookIds.size === 0) return
    
    const confirmed = window.confirm(
      `¿Eliminar ${selectedBookIds.size} libro${selectedBookIds.size > 1 ? 's' : ''} de tu biblioteca?`
    )
    if (!confirmed) return

    for (const bookId of selectedBookIds) {
      await onBookRemoved(bookId)
    }
    setSelectedBookIds(new Set())
    setIsSelectionMode(false)
  }

  const handleBookClick = (book: BookshelfBook) => {
    if (isSelectionMode) {
      toggleBookSelection(book.id)
    } else {
      setSelectedBook(book)
      setIsBookModalOpen(true)
    }
  }

  const staggerContainer = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.08, duration: 0.38, ease: 'easeOut' },
    },
  }

  const staggerItem = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.34, ease: 'easeOut' } },
  }

  return (
    <PageLayout className="p-4 sm:p-6">
      <motion.div
        className="max-w-6xl mx-auto space-y-8"
        initial="hidden"
        animate="show"
        variants={staggerContainer}
      >
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-gray-600"></div>
              <div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold border-r-gold animate-spin"
                style={{ animationDuration: '1s' }}
              ></div>
            </div>
          </div>
        ) : (
          <>
            {/* XP LEVEL BAR */}
            <motion.section variants={staggerItem}>
              <XPLevelBar currentXp={xp} theme={theme} />
            </motion.section>

            {/* HERO GREETING SECTION */}
            <motion.section
              variants={staggerItem}
              className="relative overflow-hidden rounded-[32px] border backdrop-blur-xl p-6 sm:p-8 md:p-10"
              style={{
                background: isDarkMode
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.06) 100%)'
                  : 'linear-gradient(135deg, rgba(59, 130, 246, 0.06) 0%, rgba(139, 92, 246, 0.04) 100%)',
                borderColor: isDarkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(196, 164, 132, 0.2)',
                boxShadow: isDarkMode
                  ? '0 0 20px rgba(59, 130, 246, 0.1), inset 0 0 12px rgba(139, 92, 246, 0.05)'
                  : '0 0 16px rgba(59, 130, 246, 0.08), inset 0 0 8px rgba(139, 92, 246, 0.04)',
              }}
            >
              {/* Animated gradient background */}
              <div
                className="pointer-events-none absolute -top-32 left-1/2 h-[380px] w-[600px] -translate-x-1/2 rounded-full opacity-25"
                style={{
                  background: isDarkMode
                    ? 'radial-gradient(circle, rgba(59, 130, 246, 0.15), transparent 70%)'
                    : 'radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent 70%)',
                  filter: 'blur(48px)',
                }}
              />

              <div className="relative z-10">
                <motion.h1
                  className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-3"
                  style={{ color: isDarkMode ? '#F5F1E8' : '#3B2F24' }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {getGreeting()} aventurero de historias!
                </motion.h1>

                <motion.p
                  className="text-base sm:text-lg mb-6 max-w-2xl"
                  style={{ color: isDarkMode ? '#B4ACA0' : '#7E6A54' }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  Aquí comienzan tus aventuras literarias. Cada página leída es un paso hacia nuevos logros y
                  desafíos épicos. 🌟
                </motion.p>

                {/* Genre Tags */}
                <motion.div
                  className="flex flex-wrap gap-2"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {GENRES.slice(0, 6).map((genre, index) => (
                    <button
                      key={genre.id}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 border"
                      style={{
                        background:
                          index === 0
                            ? isDarkMode
                              ? 'rgba(212, 175, 55, 0.15)'
                              : 'rgba(196, 164, 132, 0.12)'
                            : isDarkMode
                              ? 'rgba(30, 30, 30, 0.6)'
                              : 'rgba(245, 245, 245, 0.6)',
                        color:
                          index === 0
                            ? isDarkMode
                              ? '#D4AF37'
                              : '#C4A484'
                            : isDarkMode
                              ? '#B4ACA0'
                              : '#7E6A54',
                        borderColor: isDarkMode
                          ? index === 0
                            ? 'rgba(212, 175, 55, 0.4)'
                            : 'rgba(212, 175, 55, 0.15)'
                          : index === 0
                            ? 'rgba(196, 164, 132, 0.3)'
                            : 'rgba(196, 164, 132, 0.15)',
                      }}
                    >
                      <span className="mr-1">{genre.emoji}</span>
                      {genre.label}
                    </button>
                  ))}
                </motion.div>
              </div>
            </motion.section>

            {/* STATS SECTION - GAMIFIED */}
            <motion.section
              variants={staggerItem}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
            >
              {/* Streak Card */}
              <motion.div whileHover={{ scale: 1.02 }} className="overflow-hidden">
                <CardNoveli className="h-full flex items-center justify-center p-6 sm:p-8">
                  <StreakFireIcon streak={streakDays} theme={theme} />
                </CardNoveli>
              </motion.div>

              {/* Pages Read Card */}
              <motion.div whileHover={{ scale: 1.02 }} className="overflow-hidden">
                <CardNoveli className="h-full flex items-center justify-center p-6 sm:p-8">
                  <CircularProgress
                    current={totalPages}
                    target={2400}
                    theme={theme}
                    label="Páginas Hoy"
                  />
                </CardNoveli>
              </motion.div>

              {/* Books Completed / Shelf */}
              <motion.div whileHover={{ scale: 1.02 }} className="md:col-span-2 overflow-hidden">
                <CardNoveli className="h-full p-6 sm:p-8">
                  <ShelfBooksVisual
                    books={bookshelves}
                    completedCount={completedBooks}
                    theme={theme}
                  />
                </CardNoveli>
              </motion.div>
            </motion.section>

            {/* MISSIONS SECTION */}
            <motion.section variants={staggerItem} className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <Award size={24} style={{ color: isDarkMode ? '#D4AF37' : '#C4A484' }} />
                <h2 className={`font-serif text-2xl sm:text-3xl font-bold ${colorConfig.textPrimary}`}>
                  Tus Misiones Literarias
                </h2>
              </div>

              {/* Quest Card */}
              <QuestCard
                book={lastReadingBook}
                theme={theme}
                onContinueReading={() => {
                  if (lastReadingBook) {
                    handleBookClick(lastReadingBook)
                  }
                }}
              />
            </motion.section>

            {/* READING NOW SECTION */}
            {readingBooks.length > 1 && (
              <motion.section variants={staggerItem} className="space-y-4">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles size={24} style={{ color: isDarkMode ? '#D4AF37' : '#C4A484' }} />
                    <h2 className={`font-serif text-2xl font-bold ${colorConfig.textPrimary}`}>
                      También en lectura
                    </h2>
                  </div>
                  {readingBooks.length > 1 && (
                    <button
                      onClick={() => setIsSelectionMode(!isSelectionMode)}
                      className="px-3 py-1 text-sm rounded-lg transition-all"
                      style={{
                        background: isSelectionMode
                          ? isDarkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(196, 164, 132, 0.15)'
                          : isDarkMode ? 'rgba(212, 175, 55, 0.1)' : 'rgba(196, 164, 132, 0.08)',
                        color: isDarkMode ? '#D4AF37' : '#C4A484',
                      }}
                    >
                      {isSelectionMode ? '✕ Cancelar' : '☑ Seleccionar'}
                    </button>
                  )}
                </div>

                {isSelectionMode && (
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={selectAllBooks}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: isDarkMode ? 'rgba(212, 175, 55, 0.15)' : 'rgba(196, 164, 132, 0.12)',
                        color: isDarkMode ? '#D4AF37' : '#C4A484',
                        border: `1px solid ${isDarkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(196, 164, 132, 0.25)'}`,
                      }}
                    >
                      {selectedBookIds.size === readingBooks.length - 1 ? 'Deseleccionar todo' : 'Seleccionar todo'}
                    </button>
                    {selectedBookIds.size > 0 && (
                      <button
                        onClick={deleteSelectedBooks}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                        }}
                      >
                        <Trash2 size={16} />
                        Eliminar {selectedBookIds.size}
                      </button>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {readingBooks.slice(1).map((book, index) => (
                    <motion.div
                      key={book.id}
                      whileHover={{ scale: 1.06, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                      className="relative"
                    >
                      {isSelectionMode && (
                        <div
                          className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all"
                          style={{
                            background: selectedBookIds.has(book.id)
                              ? isDarkMode ? '#D4AF37' : '#C4A484'
                              : isDarkMode ? 'rgba(51, 51, 51, 0.8)' : 'rgba(240, 240, 240, 0.9)',
                            border: `2px solid ${selectedBookIds.has(book.id) ? 'transparent' : isDarkMode ? 'rgba(212, 175, 55, 0.4)' : 'rgba(196, 164, 132, 0.3)'}`,
                          }}
                          onClick={() => toggleBookSelection(book.id)}
                        >
                          {selectedBookIds.has(book.id) && <Check size={14} className="text-black" />}
                        </div>
                      )}
                      <button
                        onClick={() => handleBookClick(book)}
                        className="w-full text-left rounded-[12px] overflow-hidden group"
                      >
                        <div className="relative w-full aspect-[2/3] bg-gray-700 overflow-hidden rounded-[12px]">
                          {book.cover ? (
                            <img
                              src={book.cover}
                              alt={book.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-800">
                              <p className="text-white font-serif text-xs text-center px-2 line-clamp-3">
                                {book.title}
                              </p>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                          {/* Progress indicator */}
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="w-full h-0.5 rounded-full bg-black/40 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-orange-400 to-green-400"
                                style={{
                                  width: `${Math.min(100, (book.currentPage / book.totalPages) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <p className="mt-2 text-xs font-semibold line-clamp-2" style={{ color: isDarkMode ? '#F5F1E8' : '#3B2F24' }}>
                          {book.title}
                        </p>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* MY BOOKSHELF SECTION */}
            {bookshelves.length > 0 && (
              <motion.section variants={staggerItem} className="space-y-4">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen size={24} style={{ color: isDarkMode ? '#D4AF37' : '#C4A484' }} />
                    <h2 className={`font-serif text-2xl font-bold ${colorConfig.textPrimary}`}>
                      Mis Lecturas
                    </h2>
                  </div>
                  {bookshelves.length > 1 && (
                    <button
                      onClick={() => {
                        setIsSelectionMode(!isSelectionMode)
                        if (!isSelectionMode) setSelectedBookIds(new Set())
                      }}
                      className="px-3 py-1 text-sm rounded-lg transition-all"
                      style={{
                        background: isSelectionMode
                          ? isDarkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(196, 164, 132, 0.15)'
                          : isDarkMode ? 'rgba(212, 175, 55, 0.1)' : 'rgba(196, 164, 132, 0.08)',
                        color: isDarkMode ? '#D4AF37' : '#C4A484',
                      }}
                    >
                      {isSelectionMode ? '✕ Cancelar' : '☑ Seleccionar'}
                    </button>
                  )}
                </div>

                {isSelectionMode && (
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={selectAllBooks}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: isDarkMode ? 'rgba(212, 175, 55, 0.15)' : 'rgba(196, 164, 132, 0.12)',
                        color: isDarkMode ? '#D4AF37' : '#C4A484',
                        border: `1px solid ${isDarkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(196, 164, 132, 0.25)'}`,
                      }}
                    >
                      {selectedBookIds.size === bookshelves.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                    </button>
                    {selectedBookIds.size > 0 && (
                      <button
                        onClick={deleteSelectedBooks}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                        }}
                      >
                        <Trash2 size={16} />
                        Eliminar {selectedBookIds.size}
                      </button>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {bookshelves.map((book, index) => (
                    <motion.div
                      key={book.id}
                      whileHover={{ scale: 1.06, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06 }}
                      className="relative"
                    >
                      {isSelectionMode && (
                        <div
                          className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all"
                          style={{
                            background: selectedBookIds.has(book.id)
                              ? isDarkMode ? '#D4AF37' : '#C4A484'
                              : isDarkMode ? 'rgba(51, 51, 51, 0.8)' : 'rgba(240, 240, 240, 0.9)',
                            border: `2px solid ${selectedBookIds.has(book.id) ? 'transparent' : isDarkMode ? 'rgba(212, 175, 55, 0.4)' : 'rgba(196, 164, 132, 0.3)'}`,
                          }}
                          onClick={() => toggleBookSelection(book.id)}
                        >
                          {selectedBookIds.has(book.id) && <Check size={14} className="text-black" />}
                        </div>
                      )}
                      <button
                        onClick={() => handleBookClick(book)}
                        className="w-full text-left rounded-[12px] overflow-hidden group"
                      >
                        <div className="relative w-full aspect-[2/3] bg-gray-700 overflow-hidden rounded-[12px]">
                          {book.cover ? (
                            <img
                              src={book.cover}
                              alt={book.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-800">
                              <p className="text-white font-serif text-xs text-center px-2 line-clamp-3">
                                {book.title}
                              </p>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                          {/* Progress indicator */}
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="w-full h-0.5 rounded-full bg-black/40 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-orange-400 to-green-400"
                                style={{
                                  width: `${Math.min(100, (book.currentPage / book.totalPages) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <p className="mt-2 text-xs font-semibold line-clamp-2" style={{ color: isDarkMode ? '#F5F1E8' : '#3B2F24' }}>
                          {book.title}
                        </p>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* ORACLE SECTION */}
            {bookshelves.length > 0 && (
              <motion.section variants={staggerItem} className="space-y-4">
                <OracleNoveli bookshelf={bookshelves} />
              </motion.section>
            )}

            {/* ACTIVITY FEED */}
            <motion.section variants={staggerItem} className="space-y-4">
              <ActivityFeed books={bookshelves} notes={notes} username={username} />
            </motion.section>

            {/* EMPTY STATE */}
            {bookshelves.length === 0 && (
              <motion.div variants={staggerItem}>
                <CardNoveli className="text-center py-16 sm:py-20 px-6" hoverable={false}>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                  >
                    <Sparkles size={48} className="mx-auto mb-6 opacity-60" style={{ color: isDarkMode ? '#D4AF37' : '#C4A484' }} />
                  </motion.div>
                  <h3 className={`font-serif text-3xl font-bold mb-3 ${colorConfig.textPrimary}`}>
                    Comienza tu saga épica
                  </h3>
                  <p className={`font-sans mb-8 text-base max-w-md mx-auto ${colorConfig.textMuted}`}>
                    Tu biblioteca de aventuras literarias te espera. Añade tu primer libro y desbloquea increíbles
                    logros y misiones. 📚✨
                  </p>
                  <motion.button
                    onClick={onAddBook}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-[20px] border font-sans font-semibold transition-all duration-300"
                    style={{
                      background: isDarkMode
                        ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.08) 100%)'
                        : 'linear-gradient(135deg, rgba(196, 164, 132, 0.12) 0%, rgba(196, 164, 132, 0.06) 100%)',
                      color: isDarkMode ? '#D4AF37' : '#C4A484',
                      borderColor: isDarkMode ? 'rgba(212, 175, 55, 0.3)' : 'rgba(196, 164, 132, 0.25)',
                    }}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: isDarkMode
                        ? '0 0 24px rgba(212, 175, 55, 0.25)'
                        : '0 0 20px rgba(196, 164, 132, 0.2)',
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus size={20} /> Añadir libro
                  </motion.button>
                </CardNoveli>
              </motion.div>
            )}
          </>
        )}
      </motion.div>

      {/* FLOATING ACTION BUTTON */}
      {bookshelves.length > 0 && (
        <motion.button
          onClick={onAddBook}
          className="fixed bottom-24 right-4 sm:right-6 z-40 rounded-full border px-4 sm:px-6 py-3 font-medium transition-all flex items-center gap-2"
          style={{
            background: isDarkMode
              ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(196, 164, 132, 0.15) 0%, rgba(196, 164, 132, 0.08) 100%)',
            color: isDarkMode ? '#D4AF37' : '#C4A484',
            borderColor: isDarkMode ? 'rgba(212, 175, 55, 0.4)' : 'rgba(196, 164, 132, 0.3)',
            boxShadow: isDarkMode
              ? '0 12px 30px rgba(212, 175, 55, 0.2), 0 0 20px rgba(212, 175, 55, 0.15)'
              : '0 12px 30px rgba(196, 164, 132, 0.15), 0 0 16px rgba(196, 164, 132, 0.1)',
            backdropFilter: 'blur(12px)',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 120 }}
          whileHover={{
            scale: 1.08,
            boxShadow: isDarkMode
              ? '0 16px 36px rgba(212, 175, 55, 0.3), 0 0 24px rgba(212, 175, 55, 0.2)'
              : '0 16px 36px rgba(196, 164, 132, 0.2), 0 0 20px rgba(196, 164, 132, 0.15)',
          }}
          whileTap={{ scale: 0.94 }}
        >
          <Plus size={20} /> Nuevo
        </motion.button>
      )}

      {/* LEVEL UP NOTIFICATION */}
      <LevelUpNotification
        level={currentLevel}
        theme={theme}
        isVisible={showLevelUp}
        onClose={() => setShowLevelUp(false)}
      />

      {/* BOOK DETAIL MODAL */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          isOpen={isBookModalOpen}
          onClose={() => {
            setIsBookModalOpen(false)
            setSelectedBook(null)
          }}
          onUpdate={onBookUpdated}
          onRemove={onBookRemoved}
          onXpGained={onXpGained}
        />
      )}
    </PageLayout>
  )
}
