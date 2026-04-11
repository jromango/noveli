import React, { useEffect, useMemo, useState } from 'react'
import { Home, Search, Users, UserCircle2, Moon, Sun, Sparkles } from 'lucide-react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { ThemePalette } from '../../lib/themeConfig'
import { UserProfile, BookshelfBook, searchBookshelfByQuery } from '../../services/database'
import { GeminiRecommendation, searchWithGeminiAssistant } from '../../services/geminiAssistant'
import NLogo from '../NLogo'
import AccountMenu from '../AccountMenu'
import GlobalSidebar from '../navigation/GlobalSidebar'

interface MainLayoutProps {
  children: React.ReactNode
  isDarkMode: boolean
  palette: ThemePalette
  user: SupabaseUser | null
  userProfile: UserProfile | null
  completedBooks: number
  accountMenuOpen: boolean
  setAccountMenuOpen: (value: boolean) => void
  onOpenSettings: () => void
  onSignOut: () => Promise<void>
  toggleTheme: () => void
  currentSection: 'home' | 'analytics' | 'search' | 'community' | 'profile'
  onNavigate: (path: '/dashboard' | '/analytics' | '/explore' | '/community' | '/profile') => void
}

export default function MainLayout({
  children,
  isDarkMode,
  palette,
  user,
  userProfile,
  completedBooks,
  accountMenuOpen,
  setAccountMenuOpen,
  onOpenSettings,
  onSignOut,
  toggleTheme,
  currentSection,
  onNavigate,
}: MainLayoutProps) {
  const [headerQuery, setHeaderQuery] = useState('')
  const [headerResults, setHeaderResults] = useState<BookshelfBook[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [aiMode, setAiMode] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiIntroFull, setAiIntroFull] = useState('')
  const [aiIntroTyped, setAiIntroTyped] = useState('')
  const [aiRecommendations, setAiRecommendations] = useState<GeminiRecommendation[]>([])
  const [aiError, setAiError] = useState('')
  const [libraryLookupLoading, setLibraryLookupLoading] = useState('')
  const [libraryLookupResults, setLibraryLookupResults] = useState<Record<string, BookshelfBook[]>>({})

  const aiOpen = aiMode && (aiLoading || aiIntroTyped.length > 0 || aiRecommendations.length > 0 || !!aiError)

  const canTriggerAi = useMemo(() => headerQuery.trim().length >= 3 && !aiLoading, [headerQuery, aiLoading])

  useEffect(() => {
    if (!user) {
      setHeaderQuery('')
      setHeaderResults([])
      setAiIntroFull('')
      setAiIntroTyped('')
      setAiRecommendations([])
      setAiError('')
      return
    }

    if (aiMode) {
      setSearchLoading(false)
      setHeaderResults([])
      return
    }

    const trimmed = headerQuery.trim()
    if (trimmed.length < 2) {
      setHeaderResults([])
      return
    }

    const timeout = window.setTimeout(async () => {
      setSearchLoading(true)
      const results = await searchBookshelfByQuery(trimmed)
      setHeaderResults(results)
      setSearchLoading(false)
    }, 260)

    return () => window.clearTimeout(timeout)
  }, [headerQuery, user, aiMode])

  useEffect(() => {
    if (!aiIntroFull) {
      setAiIntroTyped('')
      return
    }

    setAiIntroTyped('')
    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setAiIntroTyped(aiIntroFull.slice(0, index))
      if (index >= aiIntroFull.length) {
        window.clearInterval(timer)
      }
    }, 18)

    return () => window.clearInterval(timer)
  }, [aiIntroFull])

  const triggerAiSearch = async () => {
    if (!canTriggerAi) return

    setAiError('')
    setAiLoading(true)
    setAiIntroFull('')
    setAiRecommendations([])
    setLibraryLookupResults({})

    try {
      const result = await searchWithGeminiAssistant(headerQuery)
      if (result.recommendations.length === 0) {
        const fallbackResults = await searchBookshelfByQuery(headerQuery)
        setAiMode(false)
        setHeaderResults(fallbackResults)
      } else {
        setAiIntroFull(result.intro)
        setAiRecommendations(result.recommendations)
      }
    } catch (error) {
      console.error('❌ IA no disponible en header, usando fallback normal:', error)
      const fallbackResults = await searchBookshelfByQuery(headerQuery)
      setAiMode(false)
      setAiError('')
      setAiIntroFull('')
      setAiRecommendations([])
      setHeaderResults(fallbackResults)
    } finally {
      setAiLoading(false)
    }
  }

  const handleLookupInLibrary = async (recommendation: GeminiRecommendation) => {
    const key = `${recommendation.title}::${recommendation.author}`
    setLibraryLookupLoading(key)

    try {
      const query = `${recommendation.title} ${recommendation.author}`
      const results = await searchBookshelfByQuery(query)
      setLibraryLookupResults((current) => ({ ...current, [key]: results }))
    } finally {
      setLibraryLookupLoading('')
    }
  }

  return (
    <div className={`${isDarkMode ? 'dark' : ''} min-h-screen overflow-visible transition-colors duration-300`}>
      <div
        className="flex min-h-screen flex-col overflow-visible transition-colors duration-300"
        style={{
          backgroundColor: palette.background,
          backgroundImage: isDarkMode
            ? 'radial-gradient(1100px 460px at 50% -16%, rgba(212,175,55,0.11), transparent 64%), radial-gradient(900px 420px at 0% 100%, rgba(255,120,32,0.08), transparent 72%)'
            : 'radial-gradient(920px 420px at 82% -12%, rgba(196,164,132,0.24), transparent 66%), radial-gradient(900px 420px at 0% 100%, rgba(255,255,255,0.66), transparent 74%)',
          color: palette.textPrimary,
        }}
      >
        <header
          className="sticky top-0 z-40 border-b py-3 backdrop-blur-xl transition-colors duration-300"
          style={{
            backgroundColor: isDarkMode ? 'rgba(8,8,8,0.48)' : 'rgba(248,242,232,0.64)',
            borderColor: isDarkMode ? 'rgba(212,175,55,0.12)' : 'rgba(196,164,132,0.18)',
            boxShadow: isDarkMode ? '0 8px 30px rgba(0,0,0,0.35)' : '0 8px 26px rgba(120,90,35,0.12)',
          }}
        >
          <div className="mx-auto grid w-full max-w-screen-2xl grid-cols-[auto_1fr_auto] items-center gap-2 px-3 sm:gap-3 sm:px-5">
            <div className="flex items-center justify-start gap-2">
              <NLogo size={28} className="shrink-0" />
              <span className="hidden font-serif text-lg font-bold transition-colors duration-300 sm:inline" style={{ color: palette.title }}>
                Círculo Noveli
              </span>
            </div>

            {user && (
              <div className="hidden items-center justify-center md:flex">
                <div className="relative w-full max-w-2xl">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300" style={{ color: palette.accent }} />
                  <input
                    type="text"
                    placeholder="Buscar libros, lectores, reseñas..."
                    value={headerQuery}
                    onChange={(event) => setHeaderQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && aiMode) {
                        event.preventDefault()
                        triggerAiSearch()
                      }
                    }}
                    onBlur={() => window.setTimeout(() => setHeaderResults([]), 120)}
                    className={`w-full rounded-full border py-2 pl-9 pr-28 text-sm transition-colors duration-300 focus:outline-none ${
                      isDarkMode
                        ? 'bg-white/[0.04] text-[#F5F1E8] placeholder:text-[#8D8579]'
                        : 'bg-white/50 text-[#3B2F24] placeholder:text-[#8D7A66]'
                    }`}
                    style={{ borderColor: palette.surfaceBorder, backdropFilter: 'blur(10px)' }}
                  />

                  <button
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault()
                      setAiMode((current) => !current)
                      setHeaderResults([])
                      setAiError('')
                    }}
                    className={`absolute right-14 top-1/2 -translate-y-1/2 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                      aiMode
                        ? 'text-white'
                        : isDarkMode ? 'text-[#8D8579]' : 'text-[#8D7A66]'
                    }`}
                    style={{
                      borderColor: aiMode ? 'rgba(124,58,237,0.65)' : palette.surfaceBorder,
                      background: aiMode
                        ? 'linear-gradient(90deg, rgba(124,58,237,0.95), rgba(37,99,235,0.92))'
                        : isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.75)',
                    }}
                    title="Activar modo IA"
                    aria-label="Activar modo IA"
                  >
                    IA
                  </button>

                  <button
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault()
                      if (aiMode) {
                        triggerAiSearch()
                      }
                    }}
                    disabled={!aiMode || !canTriggerAi}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                      !aiMode || !canTriggerAi
                        ? 'cursor-not-allowed opacity-55'
                        : 'text-white'
                    }`}
                    style={{
                      borderColor: !aiMode || !canTriggerAi ? palette.surfaceBorder : 'rgba(56,189,248,0.72)',
                      background: !aiMode || !canTriggerAi
                        ? (isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.62)')
                        : 'linear-gradient(90deg, rgba(124,58,237,0.95), rgba(37,99,235,0.92))',
                    }}
                    title="Consultar IA"
                    aria-label="Consultar IA"
                  >
                    {aiLoading ? '...' : 'Go'}
                  </button>

                  {aiOpen && (
                    <div
                      className="scrollbar-hide absolute left-0 right-0 top-[calc(100%+8px)] z-[45] max-h-[28rem] overflow-y-auto rounded-2xl border p-3 shadow-xl backdrop-blur-md"
                      style={{
                        borderColor: 'rgba(167,139,250,0.42)',
                        background: isDarkMode
                          ? 'linear-gradient(165deg, rgba(59,7,100,0.80), rgba(30,58,138,0.84))'
                          : 'linear-gradient(165deg, rgba(237,233,254,0.95), rgba(219,234,254,0.95))',
                      }}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <Sparkles size={14} className={isDarkMode ? 'text-[#F5F1E8]' : 'text-[#1E1B4B]'} />
                        <p className={`text-xs font-semibold ${isDarkMode ? 'text-[#EDE9FE]' : 'text-[#312E81]'}`}>
                          Respuesta del Bibliotecario IA
                        </p>
                      </div>

                      {aiLoading ? (
                        <div className={`rounded-xl px-3 py-3 text-xs ${isDarkMode ? 'bg-white/10 text-[#E9D5FF]' : 'bg-white/70 text-[#312E81]'}`}>
                          Consultando Gemini...
                        </div>
                      ) : (
                        <>
                          {aiIntroTyped && (
                            <p className={`mb-3 whitespace-pre-wrap text-xs leading-relaxed ${isDarkMode ? 'text-[#E9D5FF]' : 'text-[#3730A3]'}`}>
                              {aiIntroTyped}
                            </p>
                          )}

                          {aiRecommendations.map((recommendation) => {
                            const key = `${recommendation.title}::${recommendation.author}`
                            const matches = libraryLookupResults[key] || []
                            const searchingLibrary = libraryLookupLoading === key

                            return (
                              <div
                                key={key}
                                className={`mb-2 rounded-xl border p-3 ${isDarkMode ? 'border-white/20 bg-white/10' : 'border-indigo-200 bg-white/70'}`}
                              >
                                <p className={`line-clamp-1 font-serif text-sm ${isDarkMode ? 'text-white' : 'text-[#1E1B4B]'}`}>
                                  {recommendation.title}
                                </p>
                                <p className={`line-clamp-1 text-xs ${isDarkMode ? 'text-[#DDD6FE]' : 'text-[#4338CA]'}`}>
                                  {recommendation.author}
                                </p>

                                <button
                                  type="button"
                                  onMouseDown={(event) => {
                                    event.preventDefault()
                                    handleLookupInLibrary(recommendation)
                                  }}
                                  className="mt-2 rounded-lg border border-cyan-300/60 bg-cyan-400/20 px-2 py-1 text-[11px] font-semibold text-cyan-100 transition hover:bg-cyan-400/30"
                                >
                                  {searchingLibrary ? 'Buscando...' : 'Ver en Biblioteca'}
                                </button>

                                {!searchingLibrary && matches.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {matches.slice(0, 3).map((book) => (
                                      <button
                                        key={book.id}
                                        onMouseDown={(event) => {
                                          event.preventDefault()
                                          setHeaderQuery('')
                                          setAiIntroFull('')
                                          setAiRecommendations([])
                                          onNavigate('/dashboard')
                                        }}
                                        className={`flex w-full items-center justify-between rounded-lg px-2 py-1 text-left text-[11px] transition ${
                                          isDarkMode ? 'bg-white/10 text-white hover:bg-white/18' : 'bg-indigo-50 text-[#312E81] hover:bg-indigo-100'
                                        }`}
                                      >
                                        <span className="line-clamp-1">{book.title}</span>
                                        <span className="ml-2 shrink-0 opacity-75">Abrir</span>
                                      </button>
                                    ))}
                                  </div>
                                )}

                                {!searchingLibrary && libraryLookupResults[key] && matches.length === 0 && (
                                  <p className={`mt-2 text-[11px] ${isDarkMode ? 'text-[#C4B5FD]' : 'text-[#4338CA]'}`}>
                                    No aparece en tu biblioteca aun. Ve a Explorar para anadirlo.
                                  </p>
                                )}
                              </div>
                            )
                          })}

                          {!aiLoading && aiError && (
                            <p className={`rounded-lg px-2 py-2 text-xs ${isDarkMode ? 'bg-red-500/15 text-red-200' : 'bg-red-100 text-red-700'}`}>
                              {aiError}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {(headerResults.length > 0 || (searchLoading && headerQuery.trim().length >= 2 && !aiMode)) && (
                    <div className="scrollbar-hide absolute left-0 right-0 top-[calc(100%+8px)] z-[45] max-h-80 overflow-y-auto rounded-2xl border border-white/15 bg-black/60 p-2 shadow-xl backdrop-blur-md">
                      {searchLoading ? (
                        <div className="px-3 py-2 text-xs text-[#D4AF37]">Buscando en tu biblioteca...</div>
                      ) : (
                        headerResults.map((book) => (
                          <button
                            key={book.id}
                            onMouseDown={(event) => {
                              event.preventDefault()
                              setHeaderQuery('')
                              setHeaderResults([])
                              onNavigate('/dashboard')
                            }}
                            className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition hover:bg-white/10"
                          >
                            <img
                              src={book.cover || '/placeholder-book.png'}
                              alt={book.title}
                              className="h-10 w-8 rounded-md bg-black/30 p-0.5 object-contain"
                            />
                            <div className="min-w-0">
                              <p className="line-clamp-1 font-serif text-xs text-white">{book.title}</p>
                              <p className="line-clamp-1 text-[11px] text-[#D9D0C2]">{book.author}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {user && (
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={toggleTheme}
                  className={`flex h-9 w-9 items-center justify-center rounded-[30px] border transition-colors duration-300 ${
                    isDarkMode ? 'bg-white/[0.03]' : 'bg-white/70'
                  }`}
                  style={{ borderColor: palette.surfaceBorder, color: palette.accent }}
                  aria-label="Cambiar tema"
                  title="Cambiar tema"
                >
                  {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <div className="relative">
                  <button
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className={`flex h-9 w-9 items-center justify-center overflow-hidden rounded-[30px] border transition-colors duration-300 ${
                      isDarkMode ? 'bg-white/[0.03]' : 'bg-white/70'
                    }`}
                    style={{ borderColor: palette.surfaceBorder }}
                  >
                    {userProfile?.avatar_url ? (
                      <img src={userProfile.avatar_url} alt={userProfile.username || 'Avatar'} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold" style={{ color: palette.accent }}>
                        {userProfile?.username?.slice(0, 1).toUpperCase() || 'N'}
                      </span>
                    )}
                  </button>

                  <AccountMenu
                    isOpen={accountMenuOpen}
                    email={user.email || ''}
                    username={userProfile?.username}
                    completedBooks={completedBooks}
                    onClose={() => setAccountMenuOpen(false)}
                    onSignOut={async () => {
                      await onSignOut()
                      setAccountMenuOpen(false)
                    }}
                    onEditProfile={() => onNavigate('/profile')}
                    onAccountSettings={onOpenSettings}
                  />
                </div>
              </div>
            )}
          </div>
        </header>

        {user && <GlobalSidebar isDarkMode={isDarkMode} />}

        <main className="relative z-10 flex-1 overflow-visible pb-[5.5rem] pt-3 md:pb-6 md:pl-[108px]">{children}</main>

        {user && (
          <nav
            className="fixed bottom-0 left-0 right-0 z-40 border-t px-6 py-3 backdrop-blur-xl transition-colors duration-300 md:hidden"
            style={{
              backgroundColor: isDarkMode ? 'rgba(10,10,10,0.82)' : 'rgba(248,242,232,0.86)',
              borderColor: isDarkMode ? 'rgba(212,175,55,0.12)' : 'rgba(196,164,132,0.16)',
            }}
          >
            <div className="flex items-center justify-around">
              <button
                onClick={() => onNavigate('/dashboard')}
                className={`flex flex-col items-center gap-1 rounded-[30px] p-3 transition ${
                  currentSection === 'home' ? '' : isDarkMode ? 'text-[#8D8579]' : 'text-[#8D7A66]'
                }`}
                style={currentSection === 'home' ? { color: palette.accent } : undefined}
              >
                <Home size={24} />
                <span className="text-xs">Inicio</span>
              </button>
              <button
                onClick={() => onNavigate('/explore')}
                className={`flex flex-col items-center gap-1 rounded-[30px] p-3 transition ${
                  currentSection === 'search' ? '' : isDarkMode ? 'text-[#8D8579]' : 'text-[#8D7A66]'
                }`}
                style={currentSection === 'search' ? { color: palette.accent } : undefined}
              >
                <Search size={24} />
                <span className="text-xs">Explorar</span>
              </button>
              <button
                onClick={() => onNavigate('/community')}
                className={`flex flex-col items-center gap-1 rounded-[30px] p-3 transition ${
                  currentSection === 'community' ? '' : isDarkMode ? 'text-[#8D8579]' : 'text-[#8D7A66]'
                }`}
                style={currentSection === 'community' ? { color: palette.accent } : undefined}
              >
                <Users size={24} />
                <span className="text-xs">Comunidad</span>
              </button>
              <button
                onClick={() => onNavigate('/profile')}
                className={`flex flex-col items-center gap-1 rounded-[30px] p-3 transition ${
                  currentSection === 'profile' ? '' : isDarkMode ? 'text-[#8D8579]' : 'text-[#8D7A66]'
                }`}
                style={currentSection === 'profile' ? { color: palette.accent } : undefined}
              >
                <UserCircle2 size={24} />
                <span className="text-xs">Perfil</span>
              </button>
            </div>
          </nav>
        )}
      </div>
    </div>
  )
}
