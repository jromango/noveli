import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, BookOpen, Trophy, Feather, Crown, LogOut, Settings, Users, Home, UserCircle2, Globe, MessageCircle } from 'lucide-react'
import {
  Note,
  UserProfile,
  BookshelfBook,
  getUserProfile,
  getFollowCounts,
} from '../services/database'
import { getRankByXp, getXpToNextRank, getBadgeByCompletedBooks } from '../lib/gamification'
import { useTheme } from '../context/ThemeContext'
import PageLayout from '../components/layout/PageLayout'
import CardNoveli from '../components/ui/CardNoveli'
import { themeConfig } from '../lib/themeConfig'

interface ProfilePageProps {
  notes: Note[]
  books: BookshelfBook[]
  onSignOut: () => Promise<void>
  onOpenSettings: () => void
}

export default function ProfilePage({ notes, books, onSignOut, onOpenSettings }: ProfilePageProps) {
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'
  const palette = themeConfig[theme]
  const colorConfig = {
    textPrimary: isDarkMode ? 'text-[#F5F1E8]' : 'text-[#3B2F24]',
    textAccent: isDarkMode ? 'text-[#D4AF37]' : 'text-[#C4A484]',
    textMuted: isDarkMode ? 'text-gray-400' : 'text-[#7E6A54]',
  }
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 })
  const [isEmptyHover, setIsEmptyHover] = useState(false)

  const loadProfile = async () => {
    setLoading(true)
    const profile = await getUserProfile()
    setUserProfile(profile)
    const counts = await getFollowCounts()
    setFollowCounts(counts)
    setLoading(false)
  }

  useEffect(() => {
    loadProfile()
  }, [])

  if (loading) {
    return (
      <PageLayout>
        <div className={`text-center py-12 ${colorConfig.textAccent}`}>Cargando...</div>
      </PageLayout>
    )
  }

  const xp = userProfile?.xp || 0
  const currentRank = getRankByXp(xp)
  const xpToNextRank = getXpToNextRank(xp)
  const progressPercent = currentRank.maxXp === Infinity
    ? 100
    : ((xp - currentRank.minXp) / (currentRank.maxXp - currentRank.minXp)) * 100

  const completedBooks = books.filter(book => book.status === 'completed').length
  const badge = getBadgeByCompletedBooks(completedBooks)
  const heroNote = notes[0]

  const sectionVariants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' } },
  }

  return (
    <PageLayout>
    <motion.div
      key={theme}
      initial={{ opacity: 0.4, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="space-y-8"
    >
      <section className="px-6 py-8 grid grid-cols-1 gap-6">
        <CardNoveli className="hidden" hoverable={false}>
          {[Home, UserCircle2, MessageCircle, Globe].map((Icon, index) => (
            <button
              key={index}
              type="button"
              className={`flex h-14 w-14 items-center justify-center rounded-[22px] transition ${index === 1 ? '' : isDarkMode ? 'text-[#B4ACA0] hover:text-[#D4AF37]' : 'text-[#7E6A54] hover:text-[#C4A484]'}`}
              style={index === 1 ? { background: isDarkMode ? 'rgba(212,175,55,0.16)' : 'rgba(196,164,132,0.16)', color: palette.accent } : undefined}
              aria-label="Atajo perfil"
            >
              <Icon size={22} />
            </button>
          ))}
        </CardNoveli>

        <CardNoveli className="relative overflow-hidden p-0" hoverable={false}>
          {heroNote?.thumbnail ? (
            <img src={heroNote.thumbnail} alt={heroNote.title} className="h-[280px] w-full object-cover" />
          ) : (
            <div className="h-[280px] w-full bg-gradient-to-br from-[#1A1A1A] to-[#303030]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/25 to-transparent" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              className="h-10 w-10 rounded-[30px] border border-white/35 bg-black/35 text-white backdrop-blur-sm"
              aria-label="Configuracion"
              title="Configuracion"
            >
              <Settings size={16} className="mx-auto" />
            </button>
            <button
              onClick={onSignOut}
              className="h-10 w-10 rounded-[30px] border border-white/35 bg-black/35 text-white backdrop-blur-sm"
              aria-label="Cerrar sesion"
              title="Cerrar sesion"
            >
              <LogOut size={16} className="mx-auto" />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-white/75">Identidad literaria</p>
            <h1 className="mt-2 font-serif text-4xl font-bold text-white">Mi Perfil</h1>
            <p className="mt-2 font-sans text-white/80">Tu identidad literaria, logros y reseñas en un solo lugar.</p>
          </div>
        </CardNoveli>
      </section>

      <main className="px-6 py-8 max-w-5xl mx-auto space-y-8">
        {/* Profile Overview - Centered */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          variants={sectionVariants}
          whileHover={{ y: -8, boxShadow: '0 0 28px rgba(255, 215, 0, 0.26)' }}
          className="interactive-card rounded-3xl p-10 border max-w-3xl mx-auto transition-all duration-300"
        >
          <CardNoveli className="p-0 bg-transparent border-0 shadow-none" hoverable={false}>
            <div className="flex flex-col items-center gap-4 text-center">
              {userProfile?.avatar_url ? (
                <div className="relative">
                  <img
                    src={userProfile.avatar_url}
                    alt={userProfile.username || 'Avatar'}
                    className={`w-32 h-32 rounded-full object-cover border-2 shadow-lg ${isDarkMode ? 'border-[#D4AF37]' : 'border-[#C4A484]/55'}`}
                  />
                  <div className={`absolute inset-0 rounded-full border-2 animate-pulse ${isDarkMode ? 'border-[#D4AF37]/50' : 'border-[#C4A484]/45'}`}></div>
                </div>
              ) : (
                <div className="relative">
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold border-2 shadow-lg ${isDarkMode ? 'bg-white/10 text-[#D4AF37] border-white/20' : 'bg-stone-100 text-[#6F4E37] border-black/10'}`}>
                    {userProfile?.username?.slice(0, 1) || 'L'}
                  </div>
                  <div className={`absolute inset-0 rounded-full border-2 animate-pulse ${isDarkMode ? 'border-[#D4AF37]/50' : 'border-[#C4A484]/45'}`}></div>
                </div>
              )}

              <div>
                <p className={`font-sans text-sm uppercase tracking-[0.4em] ${colorConfig.textAccent}`}>Lector</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <h2 className={`font-serif text-4xl font-bold tracking-wider ${colorConfig.textPrimary}`}>{userProfile?.username || 'Lector Curioso'}</h2>
                  {badge && (
                    <motion.div
                      animate={{
                        boxShadow: [
                          '0 0 10px rgba(255,215,0,0.2)',
                          '0 0 28px rgba(255,215,0,0.65)',
                          '0 0 10px rgba(255,215,0,0.2)'
                        ],
                        scale: [1, 1.06, 1]
                      }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      className={`bg-gradient-to-r ${badge.color} p-4 rounded-full border ${isDarkMode ? 'border-white/20' : 'border-black/10'}`}
                    >
                      {badge.icon === 'Feather' && <Feather size={34} className="text-white" />}
                      {badge.icon === 'BookOpen' && <BookOpen size={34} className="text-white" />}
                      {badge.icon === 'Crown' && <Crown size={34} className="text-white" />}
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <span className={`inline-flex items-center gap-2 rounded-full backdrop-blur-sm border px-4 py-2 text-sm font-medium shadow-lg transition-all duration-300 ${isDarkMode ? 'bg-white/[0.03] text-white hover:bg-white/10' : 'bg-white text-[#1A1A1A] hover:bg-stone-100'}`} style={{ borderColor: palette.surfaceBorder }}>
                  <Trophy size={18} className={colorConfig.textAccent} /> {currentRank.name}
                </span>
                <span className={`inline-flex items-center gap-2 rounded-full backdrop-blur-sm border px-4 py-2 text-sm font-medium shadow-lg transition-all duration-300 ${isDarkMode ? 'bg-white/[0.03] text-white hover:bg-white/10' : 'bg-white text-[#1A1A1A] hover:bg-stone-100'}`} style={{ borderColor: palette.surfaceBorder }}>
                  <Users size={18} className={colorConfig.textAccent} /> {followCounts.followers} Lectores
                </span>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <motion.div whileHover={{ y: -6, boxShadow: '0 0 20px rgba(255, 215, 0, 0.22)' }} className={`interactive-card rounded-3xl backdrop-blur-md p-5 border shadow-xl transition-all duration-300 ${isDarkMode ? 'bg-white/5 border-white/15' : 'bg-white border-black/10'}`}>
                <div className="flex items-center justify-between">
                  <p className={`text-sm uppercase tracking-wider ${colorConfig.textMuted}`}>Libros Totales</p>
                  <BookOpen size={26} className={colorConfig.textAccent} />
                </div>
                <p className={`font-serif text-3xl font-bold mt-2 tracking-wider ${colorConfig.textPrimary}`}>{books.length}</p>
              </motion.div>
              <motion.div whileHover={{ y: -6, boxShadow: '0 0 20px rgba(255, 215, 0, 0.22)' }} className={`interactive-card rounded-3xl backdrop-blur-md p-5 border shadow-xl transition-all duration-300 ${isDarkMode ? 'bg-white/5 border-white/15' : 'bg-white border-black/10'}`}>
                <div className="flex items-center justify-between">
                  <p className={`text-sm uppercase tracking-wider ${colorConfig.textMuted}`}>Libros Completados</p>
                  <Trophy size={26} className={colorConfig.textAccent} />
                </div>
                <p className={`font-serif text-3xl font-bold mt-2 tracking-wider ${colorConfig.textPrimary}`}>{completedBooks}</p>
              </motion.div>
            </div>
          </CardNoveli>
        </motion.div>

        {/* XP Progress */}
        {xpToNextRank > 0 && (
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} variants={sectionVariants} whileHover={{ y: -6, boxShadow: '0 0 20px rgba(255, 215, 0, 0.22)' }} className={`interactive-card rounded-3xl p-7 border transition-all duration-300 ${isDarkMode ? 'bg-white/5 backdrop-blur-md border-white/15 shadow-2xl' : 'bg-white backdrop-blur-md border-black/10 shadow-xl'}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className={`font-sans text-sm uppercase tracking-wider ${colorConfig.textMuted}`}>Progreso al siguiente rango</p>
                <p className={`font-serif text-lg font-bold mt-1 tracking-wider ${colorConfig.textPrimary}`}>
                  {xp} / {currentRank.maxXp} XP
                </p>
              </div>
              <p className={`text-sm ${colorConfig.textMuted}`}>
                {xpToNextRank} XP para alcanzar{' '}
                <span className={`font-semibold ${colorConfig.textAccent}`}>
                  {currentRank.tier < 4 ? getRankByXp(currentRank.maxXp + 1).name : 'Máximo nivel'}
                </span>
              </p>
            </div>
            <div className={`mt-5 h-3 overflow-hidden rounded-full border ${isDarkMode ? 'bg-white/10 border-white/20' : 'bg-stone-100 border-black/10'}`}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light transition-all duration-500"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              ></div>
            </div>
          </motion.div>
        )}

        {/* Recent Reviews */}
        <motion.section className="space-y-6" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} variants={sectionVariants}>
          <h3 className={`font-serif text-2xl font-bold tracking-wider ${colorConfig.textPrimary}`}>Mis Ultimas Reseñas</h3>

          {notes.length > 0 ? (
            <div className="space-y-3">
              {notes.slice(0, 5).map((note) => (
                <motion.div
                  key={note.id}
                  whileHover={{ y: -6, boxShadow: '0 0 20px rgba(255, 215, 0, 0.2)' }}
                  className={`interactive-card rounded-2xl p-5 border shadow-xl transition-all duration-300 ${isDarkMode ? 'bg-white/5 backdrop-blur-md border-white/15 hover:border-white/25' : 'bg-white backdrop-blur-md border-black/10 hover:border-black/20'}`}
                >
                  <div className="flex gap-4">
                    {note.thumbnail ? (
                      <img
                        src={note.thumbnail}
                        alt={note.title}
                        className={`w-14 h-18 object-cover rounded-lg border flex-shrink-0 ${isDarkMode ? 'border-white/20' : 'border-black/10'}`}
                      />
                    ) : (
                      <div className={`w-14 h-18 rounded-lg border flex-shrink-0 flex items-center justify-center ${isDarkMode ? 'bg-white/10 border-white/20' : 'bg-stone-100 border-black/10'}`}>
                        <span className={`text-lg ${colorConfig.textAccent}`}>📖</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`font-serif font-semibold truncate tracking-wider ${colorConfig.textPrimary}`}>{note.title}</p>
                      <p className={`font-sans text-sm mb-2 truncate ${colorConfig.textMuted}`}>{note.author}</p>
                      <p className={`font-sans text-sm leading-relaxed line-clamp-3 ${colorConfig.textPrimary}`}>{note.notes}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              onHoverStart={() => setIsEmptyHover(true)}
              onHoverEnd={() => setIsEmptyHover(false)}
              className={`relative rounded-3xl p-10 border text-center overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/15 backdrop-blur-md' : 'bg-white border-black/10 backdrop-blur-md'}`}
            >
              <div className="flex flex-col items-center gap-3">
                <Feather size={34} className={colorConfig.textAccent} />
                <p className={`font-sans ${colorConfig.textMuted}`}>
                  Aun no tienes reseñas. Deja tu primera impresion literaria.
                </p>
              </div>
              <div className={`absolute inset-0 flex items-center justify-center transition ${isEmptyHover ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <button className={`px-5 py-2 rounded-full border transition ${isDarkMode ? 'bg-white/10 text-[#D4AF37] border-white/20 hover:bg-white/15' : 'bg-white text-[#6F4E37] border-black/10 hover:bg-stone-100'}`}>
                  Crear Reseña
                </button>
              </div>
            </motion.div>
          )}
        </motion.section>
      </main>
    </motion.div>
    </PageLayout>
  )
}
