import React, { useEffect, useState } from 'react'
import { Camera, BookOpen, Plus, Search, Star, Compass, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { getTrendingBooks } from '../services/bookTrends'
import { BOOK_CATEGORIES, getCategoryQuery } from '../lib/bookCategories'
import { searchBooks, GoogleBook } from '../services/googleBooks'
import {
  saveBook,
  getBookshelfBooks,
  searchBookshelfByQuery,
  getFollowedTitles,
  followTitle,
  unfollowTitle,
  searchReaders,
  ReaderProfile,
  followUser,
  unfollowUser,
  updateBookProgress,
} from '../services/database'
import { generatePersonalizedRecommendations, SmartTag } from '../services/aiService'
import { useTheme } from '../context/ThemeContext'
import PageLayout from '../components/layout/PageLayout'
import CardNoveli from '../components/ui/CardNoveli'
import BarcodeScannerModal from '../components/BarcodeScannerModal'
import { themeConfig } from '../lib/themeConfig'
import BookZoomModal from '../components/modals/BookZoomModal'
import UserProfileZoomModal, { UserZoomData } from '../components/modals/UserProfileZoomModal'

interface SearchPageProps {
  onBookAdded?: (book: GoogleBook) => void
}

interface Recommendation extends GoogleBook {
  smartTag: SmartTag
  score: number
}

const MIN_QUERY_LENGTH = 2

function normalizeSearchValue(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function getBookRelevanceScore(book: GoogleBook, rawQuery: string): number {
  const query = normalizeSearchValue(rawQuery)
  if (!query) return 0

  const title = normalizeSearchValue(book.title)
  const author = normalizeSearchValue(book.author)
  const combined = `${title} ${author}`.trim()
  const tokens = query.split(/\s+/).filter(Boolean)

  let score = 0

  if (combined === query) score += 180
  if (title === query) score += 140
  if (author === query) score += 100
  if (title.startsWith(query)) score += 70
  if (author.startsWith(query)) score += 55
  if (title.includes(query)) score += 45
  if (author.includes(query)) score += 30

  for (const token of tokens) {
    if (title.includes(token)) score += 14
    if (author.includes(token)) score += 10
  }

  if (book.source === 'local' || book.inLibrary) score += 8
  if (book.thumbnail) score += 3
  if (book.publishedDate) score += 2

  return score
}

function sortBooksByRelevance(books: GoogleBook[], rawQuery: string): GoogleBook[] {
  return [...books].sort((left, right) => {
    const scoreDiff = getBookRelevanceScore(right, rawQuery) - getBookRelevanceScore(left, rawQuery)
    if (scoreDiff !== 0) return scoreDiff
    return left.title.localeCompare(right.title, 'es', { sensitivity: 'base' })
  })
}

function mapBookshelfBookToGoogleBook(book: Awaited<ReturnType<typeof getBookshelfBooks>>[number]): GoogleBook {
  return {
    id: book.id,
    externalBookId: book.externalBookId,
    title: book.title,
    author: book.author,
    thumbnail: book.cover,
    pageCount: book.totalPages,
    categories: book.genre ? [book.genre] : [],
    publishedDate: book.publishedDate,
    description: book.synopsis,
    source: 'local',
    inLibrary: true,
  }
}

function mergeUniqueBooks(localBooks: GoogleBook[], externalBooks: GoogleBook[]): GoogleBook[] {
  const seen = new Set<string>()
  const merged: GoogleBook[] = []

  for (const book of [...localBooks, ...externalBooks]) {
    const key = `${book.title.trim().toLowerCase()}::${book.author.trim().toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    merged.push(book)
  }

  return merged
}

export default function SearchPage({ onBookAdded }: SearchPageProps) {
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'
  const palette = themeConfig[theme]
  const colorConfig = {
    textPrimary: isDarkMode ? 'text-[#F5F1E8]' : 'text-[#3B2F24]',
    textAccent: isDarkMode ? 'text-[#D4AF37]' : 'text-[#C4A484]',
    textMuted: isDarkMode ? 'text-stone-400' : 'text-[#7E6A54]',
  }

  const [query, setQuery] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [searchScope, setSearchScope] = useState<'books' | 'users'>('books')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [trendingBooks, setTrendingBooks] = useState<GoogleBook[]>([])
  const [searchResults, setSearchResults] = useState<GoogleBook[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [noResults, setNoResults] = useState(false)
  const [savingBookId, setSavingBookId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [userResults, setUserResults] = useState<ReaderProfile[]>([])
  const [bookshelfCache, setBookshelfCache] = useState<Array<{ id: string; title: string; author: string; totalPages: number }>>([])
  const [followedTitles, setFollowedTitles] = useState<Array<{ title: string; author: string }>>([])
  const [isBookZoomOpen, setIsBookZoomOpen] = useState(false)
  const [bookZoomTarget, setBookZoomTarget] = useState<GoogleBook | null>(null)
  const [isUserZoomOpen, setIsUserZoomOpen] = useState(false)
  const [userZoomTarget, setUserZoomTarget] = useState<UserZoomData | null>(null)

  const normalize = (value: string) => value.trim().toLowerCase()
  const isInBookshelf = (book: { title: string; author: string }) =>
    bookshelfCache.some(
      (item) => normalize(item.title) === normalize(book.title) && normalize(item.author) === normalize(book.author),
    )

  const isTitleFollowed = (book: { title: string; author: string }) =>
    followedTitles.some(
      (item) => normalize(item.title) === normalize(book.title) && normalize(item.author) === normalize(book.author),
    )

  const executeSearch = async (rawQuery: string, scope: 'books' | 'users' = searchScope) => {
    const trimmed = rawQuery.trim()
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setActiveQuery('')
      setSearchResults([])
      setUserResults([])
      setNoResults(false)
      return
    }

    setLoading(true)
    setNoResults(false)
    setActiveQuery(trimmed)

    try {
      if (scope === 'users') {
        const users = await searchReaders(trimmed)
        setUserResults(users)
        setSearchResults([])
        setNoResults(users.length === 0)
        return
      }

      const [localResults, externalResults] = await Promise.all([
        searchBookshelfByQuery(trimmed),
        searchBooks(trimmed),
      ])

      const mergedResults = sortBooksByRelevance(
        mergeUniqueBooks(localResults.map(mapBookshelfBookToGoogleBook), externalResults),
        trimmed,
      )

      setSearchResults(mergedResults)
      setUserResults([])
      setNoResults(mergedResults.length === 0)
    } catch (error) {
      console.error('❌ Error buscando:', error)
      setSearchResults([])
      setUserResults([])
      setNoResults(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadTrendingAndRecommendations = async () => {
      setLoading(true)
      setNoResults(false)

      const books = await getTrendingBooks()
      setTrendingBooks(books)

      try {
        const [userBookshelf, followed] = await Promise.all([getBookshelfBooks(), getFollowedTitles()])
        setBookshelfCache(
          userBookshelf.map((book) => ({
            id: book.id,
            title: book.title,
            author: book.author,
            totalPages: book.totalPages,
          })),
        )
        setFollowedTitles(
          followed.map((item) => ({
            title: item.title,
            author: item.author,
          })),
        )
        if (userBookshelf.length > 0 && books.length > 0) {
          const aiRecommendations = await generatePersonalizedRecommendations(userBookshelf, books)
          const mappedRecommendations = aiRecommendations.map((rec) => ({
            ...rec.book,
            smartTag: rec.smartTag,
            score: rec.score,
          } as Recommendation))
          setRecommendations(mappedRecommendations)
        }
      } catch (error) {
        console.error('❌ Error generando recomendaciones:', error)
      }

      setLoading(false)
    }

    loadTrendingAndRecommendations()
  }, [])

  useEffect(() => {
    if (selectedCategory) return
    if (query.trim().length < MIN_QUERY_LENGTH) {
      setActiveQuery('')
      setSearchResults([])
      setUserResults([])
      setNoResults(false)
      return
    }

    const timer = window.setTimeout(async () => {
      await executeSearch(query, searchScope)
    }, 350)

    return () => window.clearTimeout(timer)
  }, [query, selectedCategory, searchScope])

  const handleCategoryClick = async (categoryId: string) => {
    setSelectedCategory(categoryId)
    setQuery('')
    setActiveQuery('')
    setLoading(true)
    setNoResults(false)

    try {
      const apiQuery = getCategoryQuery(categoryId)
      const results = await searchBooks(apiQuery)
      setSearchResults(results)
      setNoResults(results.length === 0)
    } catch (error) {
      console.error('❌ Error buscando categoría:', error)
      setSearchResults([])
      setNoResults(true)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (book: GoogleBook) => {
    const rating = book.pageCount ? Math.min(5, Math.max(1, Math.ceil((book.pageCount / 500) * 5))) : 0
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} size={14} className={index < rating ? 'star-filled' : 'star-outline'} />
        ))}
      </div>
    )
  }

  const handleAddBook = async (book: GoogleBook) => {
    const existingBook = bookshelfCache.find(
      (item) => normalize(item.title) === normalize(book.title) && normalize(item.author) === normalize(book.author),
    )

    if (existingBook) {
      setMessage('✅ En tu estante')
      window.setTimeout(() => setMessage(null), 1800)
      return
    }

    setSavingBookId(book.id)
    try {
      const savedBook = await saveBook({
        title: book.title,
        author: book.author,
        cover: book.thumbnail,
        totalPages: book.pageCount || 0,
        genre: book.categories?.[0] || selectedCategory || 'Sin género',
        publishedDate: book.publishedDate,
        synopsis: book.description,
        externalBookId: book.externalBookId || book.id,
      })

      if (savedBook) {
        setBookshelfCache((current) => [
          {
            id: savedBook.id,
            title: savedBook.title,
            author: savedBook.author,
            totalPages: savedBook.totalPages,
          },
          ...current,
        ])
        setMessage(`✅ Añadido “${book.title}” a tu estante`)
        onBookAdded?.(book)
        window.setTimeout(() => setMessage(null), 2800)
      } else {
        setMessage('No se pudo guardar en tu biblioteca. Verifica tu sesión.')
        window.setTimeout(() => setMessage(null), 2800)
      }
    } catch (error) {
      console.error('❌ Error guardando libro:', error)
      setMessage('No se pudo guardar en tu biblioteca. Intenta de nuevo.')
      window.setTimeout(() => setMessage(null), 2800)
    } finally {
      setSavingBookId(null)
    }
  }

  const handleToggleFollowTitle = async (book: GoogleBook) => {
    const followed = isTitleFollowed({ title: book.title, author: book.author })
    const ok = followed
      ? await unfollowTitle(book.title, book.author)
      : await followTitle(book.title, book.author, book.thumbnail)

    if (!ok) {
      setMessage('No se pudo actualizar el seguimiento del título')
      window.setTimeout(() => setMessage(null), 2200)
      return
    }

    setFollowedTitles((current) => {
      if (followed) {
        return current.filter(
          (item) => !(normalize(item.title) === normalize(book.title) && normalize(item.author) === normalize(book.author)),
        )
      }
      return [...current, { title: book.title, author: book.author }]
    })

    setMessage(followed ? `Dejaste de seguir “${book.title}”` : `Ahora sigues “${book.title}”`)
    window.setTimeout(() => setMessage(null), 2400)
  }

  const handleOpenBookZoom = (book: GoogleBook) => {
    setBookZoomTarget(book)
    setIsBookZoomOpen(true)
  }

  const handleMarkAsRead = async (book: GoogleBook) => {
    setSavingBookId(book.id)
    try {
      const existingBook = bookshelfCache.find(
        (item) => normalize(item.title) === normalize(book.title) && normalize(item.author) === normalize(book.author),
      )

      if (existingBook) {
        await updateBookProgress(existingBook.id, existingBook.totalPages || book.pageCount || 0, 'completed')
        setMessage(`Marcaste “${book.title}” como leído`)
        onBookAdded?.(book)
      } else {
        const savedBook = await saveBook({
          title: book.title,
          author: book.author,
          cover: book.thumbnail,
          totalPages: book.pageCount || 0,
          genre: book.categories?.[0] || selectedCategory || 'Sin género',
          publishedDate: book.publishedDate,
          synopsis: book.description,
          externalBookId: book.externalBookId || book.id,
        })

        if (savedBook) {
          await updateBookProgress(savedBook.id, savedBook.totalPages || 0, 'completed')
          setBookshelfCache((current) => [
            {
              id: savedBook.id,
              title: savedBook.title,
              author: savedBook.author,
              totalPages: savedBook.totalPages,
            },
            ...current,
          ])
          setMessage(`Marcaste “${book.title}” como leído`)
          onBookAdded?.(book)
        }
      }
    } catch (error) {
      console.error('❌ Error marcando libro como leído:', error)
      setMessage('No se pudo marcar como leído. Intenta de nuevo.')
    } finally {
      setSavingBookId(null)
      setIsBookZoomOpen(false)
      window.setTimeout(() => setMessage(null), 2800)
    }
  }

  const handleToggleFollowUser = async (userId: string, currentlyFollowing: boolean) => {
    const ok = currentlyFollowing ? await unfollowUser(userId) : await followUser(userId)
    if (!ok) return
    setUserResults((prev) => prev.map((reader) => (reader.id === userId ? { ...reader, isFollowing: !currentlyFollowing } : reader)))
  }

  const hasActiveSearch = activeQuery.trim().length >= MIN_QUERY_LENGTH
  const displayBooks = selectedCategory || hasActiveSearch ? searchResults : trendingBooks
  const editorPicks = (recommendations.length > 0 ? recommendations : displayBooks).slice(0, 2)
  const spotlightBook = editorPicks[0] || trendingBooks[0] || displayBooks[0]
  const genreChips = BOOK_CATEGORIES.slice(0, 6).map((category, index) => ({
    ...category,
    count: Math.max(48, 340 - index * 41),
  }))

  const getGlowColor = (index: number) => {
    const colors = [
      'rgba(225, 85, 105, 0.30)',
      'rgba(212, 175, 55, 0.30)',
      'rgba(74, 144, 226, 0.28)',
      'rgba(117, 87, 255, 0.26)',
      'rgba(29, 178, 140, 0.26)',
      'rgba(255, 133, 64, 0.28)',
    ]
    return colors[index % colors.length]
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' } },
  }

  return (
    <PageLayout>
      <motion.div
        key={theme}
        initial={{ opacity: 0.45, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="min-h-screen p-3 sm:p-4"
        style={{
          background: isDarkMode
            ? 'radial-gradient(circle at 50% -10%, rgba(212,175,55,0.15) 0%, rgba(8,8,8,0) 70%)'
            : 'radial-gradient(circle at 50% -10%, rgba(196,164,132,0.18) 0%, rgba(248,242,232,0) 70%)',
        }}
      >
        <div className="mx-auto w-full max-w-screen-xl space-y-7">
          <motion.section className="mb-2 grid grid-cols-1 gap-5" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={sectionVariants}>
            <CardNoveli className="overflow-hidden p-4 md:p-5" hoverable={false}>
              <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-[minmax(0,1fr)_270px]">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full border border-[#D4AF37]/45 bg-[#D4AF37]/10 p-2">
                      <Compass size={16} style={{ color: palette.accent }} />
                    </div>
                    <h1 className={`font-serif text-3xl font-bold ${isDarkMode ? 'text-white [text-shadow:0_0_14px_rgba(0,0,0,0.65)]' : 'text-[#3B2F24]'}`}>
                      Explorar
                    </h1>
                  </div>
                  <p className={`text-sm font-sans ${colorConfig.textMuted}`}>Descubre tu próxima gran lectura</p>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setIsScannerOpen(true)}
                      className={`inline-flex items-center gap-2 rounded-[30px] px-4 py-1.5 text-xs font-sans font-medium border transition ${isDarkMode ? 'bg-transparent hover:bg-white/[0.03] text-[#D4AF37] hover:shadow-[0_0_18px_rgba(212,175,55,0.25)]' : 'bg-white/70 hover:bg-white text-[#C4A484] hover:shadow-[0_0_18px_rgba(196,164,132,0.20)]'}`}
                      style={{ borderColor: palette.surfaceBorder }}
                    >
                      <Camera size={14} />
                      Escanear código
                    </button>
                  </div>

                  <form
                    className="max-w-2xl space-y-2"
                    onSubmit={(event) => {
                      event.preventDefault()
                      if (searchScope === 'books') {
                        setSelectedCategory(null)
                      }
                      void executeSearch(query, searchScope)
                    }}
                  >
                    <div className="relative flex gap-2">
                      <div className="relative flex-1">
                        <div className={`absolute inset-y-0 left-4 flex items-center ${colorConfig.textMuted}`}>
                          <Search size={18} />
                        </div>
                        <input
                          value={query}
                          onChange={(event) => {
                            if (searchScope === 'books') {
                              setSelectedCategory(null)
                            }
                            setQuery(event.target.value)
                          }}
                          type="text"
                          placeholder={searchScope === 'books' ? 'Busca por título, autor o ISBN...' : 'Busca lectores por username...'}
                          className={`w-full rounded-[30px] border py-2.5 pl-11 pr-5 text-sm font-sans shadow-[0_6px_20px_rgb(0,0,0,0.16)] transition-all duration-300 focus:outline-none ${isDarkMode ? 'bg-white/[0.03] text-white placeholder:text-gray-500 focus:ring-1 focus:ring-[#D4AF37]' : 'bg-white/72 text-[#3B2F24] placeholder:text-[#8D7A66] focus:ring-1 focus:ring-[#C4A484]'}`}
                          style={{ borderColor: palette.surfaceBorder }}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={query.trim().length < MIN_QUERY_LENGTH}
                        className={`rounded-[30px] border px-5 py-2.5 text-sm font-semibold transition ${query.trim().length < MIN_QUERY_LENGTH ? 'cursor-not-allowed opacity-50' : ''} ${isDarkMode ? 'bg-[#D4AF37] text-[#121212] border-[#D4AF37]' : 'bg-[#6F4E37] text-white border-[#6F4E37]'}`}
                      >
                        Go
                      </button>
                    </div>
                    {searchScope === 'books' && (
                      <p className={`pl-1 text-[11px] ${colorConfig.textMuted}`}>
                        Búsqueda en tiempo real con Google Books y respaldo automático de Open Library.
                      </p>
                    )}
                  </form>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSearchScope('books')
                        setNoResults(false)
                      }}
                      className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${searchScope === 'books' ? 'text-[#121212] bg-[#D4AF37] border-[#D4AF37]' : isDarkMode ? 'text-[#D4AF37] bg-white/[0.03] border-[#D4AF37]/20' : 'text-[#6F4E37] bg-white/70 border-[#C4A484]/35'}`}
                    >
                      Libros
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchScope('users')
                        setSelectedCategory(null)
                        setActiveQuery('')
                        setNoResults(false)
                      }}
                      className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${searchScope === 'users' ? 'text-[#121212] bg-[#D4AF37] border-[#D4AF37]' : isDarkMode ? 'text-[#D4AF37] bg-white/[0.03] border-[#D4AF37]/20' : 'text-[#6F4E37] bg-white/70 border-[#C4A484]/35'}`}
                    >
                      Usuarios
                    </button>
                  </div>

                  {searchScope === 'books' && (
                    <div className="space-y-3 pt-0.5">
                      <h2 className={`font-serif text-xl font-bold ${colorConfig.textPrimary}`}>Generos Editoriales</h2>
                      <div className="flex items-center gap-2">
                        <button className="rounded-full border p-2" style={{ borderColor: palette.surfaceBorder, color: palette.accent, background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.68)' }}>
                          <ChevronLeft size={16} />
                        </button>
                        <div className="grid flex-1 grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-2">
                          {genreChips.map((category) => (
                            <button
                              key={category.id}
                              onClick={() => handleCategoryClick(category.id)}
                              className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 border text-xs transition-all duration-300 ${
                                selectedCategory === category.id
                                  ? isDarkMode
                                    ? 'bg-[#D4AF37]/20 border-[#D4AF37]/50 text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                                    : 'bg-[#C4A484]/18 border-[#C4A484]/45 text-[#6F4E37] shadow-[0_0_15px_rgba(196,164,132,0.28)]'
                                  : isDarkMode
                                  ? 'bg-white/[0.03] border-[#D4AF37]/10 text-gray-200 hover:shadow-[0_0_14px_rgba(212,175,55,0.26)]'
                                  : 'bg-white/75 border-black/10 text-[#4B3A2A] hover:shadow-[0_0_12px_rgba(196,164,132,0.20)]'
                              }`}
                            >
                              <span>{category.emoji}</span>
                              <span>{category.label}</span>
                              <span className="opacity-70 text-[10px]">{category.count}</span>
                            </button>
                          ))}
                        </div>
                        <button className="rounded-full border p-2" style={{ borderColor: palette.surfaceBorder, color: palette.accent, background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.68)' }}>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative self-start overflow-hidden rounded-2xl border h-[240px] sm:h-[280px] xl:h-[330px]" style={{ borderColor: palette.surfaceBorder }}>
                  {spotlightBook?.thumbnail ? (
                    <img src={spotlightBook.thumbnail} alt={spotlightBook.title} className="h-full w-full bg-black/30 p-2 object-contain" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#1A1A1A] to-[#2B2B2B]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/28 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-white/70">Selección visual</p>
                    <p className="mt-1 font-serif text-xl text-white line-clamp-2">{spotlightBook?.title || 'Lectura destacada'}</p>
                    <p className="text-xs text-white/75 line-clamp-1">{spotlightBook?.author || 'Descubre nuevas voces'}</p>
                  </div>
                </div>
              </div>
            </CardNoveli>
          </motion.section>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
            <div className="space-y-5 lg:col-span-3">
              {searchScope === 'books' && editorPicks.length > 0 && (
                <motion.section initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} variants={sectionVariants}>
                  <h2 className={`mb-2 font-serif text-lg font-bold ${colorConfig.textPrimary}`}>⭐ Sugerencias de la IA</h2>
                  <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
                    {editorPicks.map((book, index) => (
                      <CardNoveli key={book.id} className="p-2" hoverable={true}>
                        <div className="flex items-center gap-2">
                          <img
                            src={book.thumbnail || '/placeholder-book.png'}
                            alt={book.title}
                            className="h-16 w-11 flex-none rounded-lg bg-black/30 p-0.5 object-contain"
                          />
                          <div className="min-w-0 flex-1">
                            <p className={`line-clamp-1 font-serif text-xs font-semibold ${colorConfig.textPrimary}`}>{book.title}</p>
                            <p className={`line-clamp-1 text-[10px] ${colorConfig.textMuted}`}>{book.author}</p>
                            <p className="mt-0.5 text-[10px] text-[#D4AF37]">{index === 0 ? 'Más leído' : 'Recomendado'} · ⭐ {Math.max(4.6, Math.round((book.score || 4.8) * 10) / 10)}</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleAddBook(book)}
                              className="rounded-full border px-2 py-0.5 text-[10px]"
                              style={{ borderColor: palette.accent, color: palette.accent }}
                                disabled={savingBookId === book.id || isInBookshelf({ title: book.title, author: book.author })}
                            >
                                {isInBookshelf({ title: book.title, author: book.author }) ? '✅' : '+'}
                            </button>
                            <button
                              onClick={() => handleToggleFollowTitle(book)}
                              className="rounded-full border px-2 py-0.5 text-[10px]"
                              style={{ borderColor: palette.surfaceBorder, color: palette.textPrimary }}
                            >
                              {isTitleFollowed({ title: book.title, author: book.author }) ? 'Sig.' : 'Seguir'}
                            </button>
                            <button
                              onClick={() => handleOpenBookZoom(book)}
                              className="rounded-full border px-2 py-0.5 text-[10px]"
                              style={{ borderColor: palette.surfaceBorder, color: palette.textPrimary }}
                            >
                              Ver
                            </button>
                          </div>
                        </div>
                      </CardNoveli>
                    ))}
                  </div>
                </motion.section>
              )}

              <motion.section initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} variants={sectionVariants}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className={`font-serif text-xl font-bold ${colorConfig.textPrimary}`}>Joyas para tu biblioteca</h2>
                    <p className={`font-sans text-xs ${colorConfig.textMuted}`}>
                      {searchScope === 'users'
                        ? `Usuarios para "${activeQuery.trim()}"`
                        : hasActiveSearch
                        ? `Resultados en tiempo real para "${activeQuery.trim()}"`
                        : selectedCategory
                        ? `Explorando ${BOOK_CATEGORIES.find((c) => c.id === selectedCategory)?.label}`
                        : 'Tendencias literarias actuales'}
                    </p>
                  </div>
                  {message && (
                    <div className="fixed right-6 top-24 z-50 rounded-2xl border border-[#D4AF37]/25 bg-black/60 px-4 py-2 text-xs font-medium text-[#D4AF37] shadow-xl backdrop-blur-md">
                      {message}
                    </div>
                  )}
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <CardNoveli key={index} className="animate-pulse overflow-hidden p-0" hoverable={false}>
                        <div className={`aspect-[2/3] w-full ${isDarkMode ? 'bg-white/[0.05]' : 'bg-black/[0.05]'}`} />
                        <div className="space-y-2 p-4">
                          <div className={`h-4 w-3/4 rounded-full ${isDarkMode ? 'bg-white/[0.08]' : 'bg-black/[0.08]'}`} />
                          <div className={`h-3 w-1/2 rounded-full ${isDarkMode ? 'bg-white/[0.06]' : 'bg-black/[0.06]'}`} />
                          <div className={`h-3 w-2/5 rounded-full ${isDarkMode ? 'bg-white/[0.06]' : 'bg-black/[0.06]'}`} />
                        </div>
                      </CardNoveli>
                    ))}
                  </div>
                ) : noResults ? (
                  <div className="px-6 py-16 text-center">
                    <BookOpen size={64} className={`mx-auto mb-4 ${isDarkMode ? 'text-[#D4AF37]/60' : 'text-[#C4A484]/70'}`} />
                    <h3 className={`mb-3 font-serif text-2xl font-bold ${colorConfig.textPrimary}`}>No encontramos nada</h3>
                    <p className={`font-sans ${colorConfig.textMuted}`}>Prueba con otro título, autor o ISBN. Si Google Books no responde, la búsqueda cae automáticamente a Open Library.</p>
                  </div>
                ) : searchScope === 'users' ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {userResults.map((reader) => (
                      <CardNoveli key={reader.id} className="p-5" hoverable={true}>
                        <div className="flex items-start justify-between gap-4">
                          <button
                            onClick={() => {
                              setUserZoomTarget({
                                id: reader.id,
                                displayName: reader.username || 'Lector Anónimo',
                                username: reader.username || 'lector',
                                avatarUrl: reader.avatar_url,
                                rank: reader.rank,
                                booksRead: Math.round((reader.xp || 0) / 120),
                              })
                              setIsUserZoomOpen(true)
                            }}
                            className="flex items-center gap-3 text-left"
                          >
                            {reader.avatar_url ? (
                              <img src={reader.avatar_url} alt={reader.username} className="h-14 w-14 rounded-full object-cover" />
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-lg font-semibold text-[#D4AF37]">
                                {(reader.username || 'L').slice(0, 1).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className={`font-serif text-lg ${colorConfig.textPrimary}`}>{reader.username || 'Lector Anónimo'}</p>
                              <p className={`text-xs ${colorConfig.textMuted}`}>{reader.rank}</p>
                            </div>
                          </button>

                          <button
                            onClick={() => handleToggleFollowUser(reader.id, !!reader.isFollowing)}
                            className={`rounded-full border px-4 py-2 text-xs font-medium transition ${reader.isFollowing ? 'border-white/20 bg-white/10 text-white' : 'border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]'}`}
                          >
                            {reader.isFollowing ? 'Siguiendo' : 'Seguir'}
                          </button>
                        </div>
                      </CardNoveli>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(126px,1fr))] gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(138px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(148px,1fr))]">
                    {displayBooks.map((book, index) => (
                      <motion.div key={book.id} whileHover={{ scale: 1.02 }} className="group/card relative overflow-visible">
                        <div
                          className="pointer-events-none absolute inset-x-3 top-8 -z-10 h-20 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover/card:opacity-100"
                          style={{ background: getGlowColor(index) }}
                        />
                        <CardNoveli className="overflow-hidden" hoverable={false}>
                          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-gray-800">
                                {book.thumbnail ? (
                                  <>
                                    <img
                                      src={book.thumbnail}
                                      alt={book.title}
                                      onClick={() => handleOpenBookZoom(book)}
                                      className="h-full w-full rounded-2xl bg-black/35 p-1 object-contain transition-transform duration-300 hover:scale-105"
                                      loading="lazy"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                        if (fallback) fallback.style.display = 'flex';
                                      }}
                                    />
                                    <div className="hidden h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-gray-600 to-gray-800" style={{ display: 'none' }}>
                                      <p className="px-2 text-center font-serif text-xs text-white line-clamp-3">{book.title}</p>
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-gray-600 to-gray-800">
                                    <p className="px-2 text-center font-serif text-xs text-white line-clamp-3">{book.title}</p>
                                  </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 hover:opacity-100">
                                  <button
                                    onClick={() => handleAddBook(book)}
                                    className="inline-flex items-center gap-1 rounded-full bg-transparent px-2.5 py-1 text-[11px] font-medium shadow-lg transition"
                                    style={{ border: `1px solid ${palette.accent}`, color: palette.accent }}
                                    disabled={savingBookId === book.id || isInBookshelf({ title: book.title, author: book.author })}
                                  >
                                    <Plus size={12} />
                                    {isInBookshelf({ title: book.title, author: book.author })
                                      ? 'En tu estante'
                                      : savingBookId === book.id
                                      ? 'Guardando...'
                                      : '+ Añadir'}
                                  </button>
                                </div>
                              </div>
                              <div className="space-y-1 p-2.5">
                                <p className={`font-serif text-xs font-semibold line-clamp-2 ${colorConfig.textPrimary}`}>{book.title}</p>
                                <p className={`font-sans text-[11px] ${colorConfig.textMuted}`}>{book.author}</p>
                                <div>{renderStars(book)}</div>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {book.publishedDate && (
                                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] ${isDarkMode ? 'text-cyan-200 bg-cyan-400/10 border border-cyan-300/15' : 'text-cyan-800 bg-cyan-50 border border-cyan-200'}`}>
                                      {book.publishedDate}
                                    </span>
                                  )}
                                  {book.source === 'local' && (
                                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] ${isDarkMode ? 'text-emerald-200 bg-emerald-400/10 border border-emerald-300/15' : 'text-emerald-800 bg-emerald-50 border border-emerald-200'}`}>
                                      En tu biblioteca
                                    </span>
                                  )}
                                  {book.categories?.slice(0, 2).map((category) => (
                                    <span key={category} className={`rounded-full px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] ${isDarkMode ? 'text-[#D4AF37] bg-white/[0.03] border border-[#D4AF37]/10' : 'text-[#6F4E37] bg-white/75 border border-black/10'}`}>
                                      {category}
                                    </span>
                                  ))}
                                  <button
                                    onClick={() => handleToggleFollowTitle(book)}
                                    className={`rounded-full px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] ${isTitleFollowed({ title: book.title, author: book.author }) ? 'text-[#D4AF37] bg-[#D4AF37]/12 border border-[#D4AF37]/20' : isDarkMode ? 'text-white/85 bg-white/[0.03] border border-white/10' : 'text-[#4B3A2A] bg-white/70 border border-black/10'}`}
                                  >
                                    {isTitleFollowed({ title: book.title, author: book.author }) ? 'Siguiendo' : 'Seguir'}
                                  </button>
                                </div>
                              </div>
                            </CardNoveli>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.section>
            </div>

            <div className="lg:col-span-1">
              <CardNoveli className="sticky top-24 p-4" hoverable={false}>
                <h3 className={`mb-3 text-center font-serif text-base font-bold ${colorConfig.textAccent}`}>Tendencias</h3>
                <div className="space-y-2.5">
                  {trendingBooks.slice(0, 5).map((book, index) => (
                    <div key={book.id} className="flex items-center gap-2.5">
                      <span className={`text-xs font-bold ${colorConfig.textAccent}`}>#{index + 1}</span>
                      <img src={book.thumbnail || '/placeholder-book.png'} alt={book.title} className={`h-12 w-9 rounded-lg object-contain bg-black/25 p-0.5 border ${isDarkMode ? 'border-[#D4AF37]/10' : 'border-black/10'}`} />
                      <div className="flex-1">
                        <p className={`line-clamp-2 font-serif text-[11px] font-semibold ${colorConfig.textPrimary}`}>{book.title}</p>
                        <p className={`font-sans text-[10px] ${colorConfig.textMuted}`}>{book.author}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardNoveli>
            </div>
          </div>
        </div>

        <BookZoomModal
          isOpen={isBookZoomOpen}
          book={bookZoomTarget}
          isInLibrary={
            !!bookZoomTarget &&
            isInBookshelf({ title: bookZoomTarget.title, author: bookZoomTarget.author })
          }
          isTitleFollowed={!!bookZoomTarget && isTitleFollowed({ title: bookZoomTarget.title, author: bookZoomTarget.author })}
          onClose={() => setIsBookZoomOpen(false)}
          onAddToList={handleAddBook}
          onMarkAsRead={handleMarkAsRead}
          onToggleFollowTitle={handleToggleFollowTitle}
        />

        <UserProfileZoomModal
          isOpen={isUserZoomOpen}
          user={userZoomTarget}
          isFollowing={userZoomTarget ? !!userResults.find((item) => item.id === userZoomTarget.id)?.isFollowing : false}
          onClose={() => setIsUserZoomOpen(false)}
          onToggleFollow={handleToggleFollowUser}
        />

        <BarcodeScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onBookFound={() => {
            setIsScannerOpen(false)
          }}
        />
      </motion.div>
    </PageLayout>
  )
}
