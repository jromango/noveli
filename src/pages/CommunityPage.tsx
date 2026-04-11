import React, { FormEvent, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Search, Users, Flame, Sparkles } from 'lucide-react'
import {
  searchReaders,
  ReaderProfile,
  followUser,
  unfollowUser,
  addXpAndUpdateRank,
  getUserProfile,
} from '../services/database'
import {
  getSocialInteractionSnapshot,
  toggleReviewLike,
  addReviewComment,
  subscribeToSocialInteractions,
} from '../services/socialInteractions'
import { getTrendingBooks } from '../services/bookTrends'
import { seedUsers } from '../data/seedData'
import SocialFeedCard, { SocialReviewCard } from '../components/SocialFeedCard'
import PageLayout from '../components/layout/PageLayout'
import CardNoveli from '../components/ui/CardNoveli'
import { themeConfig } from '../lib/themeConfig'
import UserProfileZoomModal, { UserZoomData } from '../components/modals/UserProfileZoomModal'

interface CommunityPageProps {
  isAuthenticated?: boolean
  theme: 'dark' | 'light'
}

export default function CommunityPage({ isAuthenticated = true, theme }: CommunityPageProps) {
  const isDarkMode = theme === 'dark'
  const palette = themeConfig[theme]
  const colorConfig = {
    textPrimary: isDarkMode ? 'text-[#F5F1E8]' : 'text-[#3B2F24]',
    textAccent: isDarkMode ? 'text-[#D4AF37]' : 'text-[#C4A484]',
    textMuted: isDarkMode ? 'text-stone-400' : 'text-[#7E6A54]',
  }

  const [socialReviews, setSocialReviews] = useState<SocialReviewCard[]>([])
  const [interactionToast, setInteractionToast] = useState<string | null>(null)
  const [likedPulseId, setLikedPulseId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null)
  const [currentUserInitial, setCurrentUserInitial] = useState('N')
  const [readerQuery, setReaderQuery] = useState('')
  const [readerResults, setReaderResults] = useState<ReaderProfile[]>([])
  const [searchingReaders, setSearchingReaders] = useState(false)
  const [isLoadingFeed, setIsLoadingFeed] = useState(true)
  const [isZoomOpen, setIsZoomOpen] = useState(false)
  const [zoomUser, setZoomUser] = useState<UserZoomData | null>(null)
  const [monthlyTrends, setMonthlyTrends] = useState<string[]>([])

  useEffect(() => {
    const loadCurrentUser = async () => {
      const profile = await getUserProfile()
      setCurrentUserAvatar(profile?.avatar_url || null)
      setCurrentUserInitial((profile?.username?.slice(0, 1) || 'N').toUpperCase())
    }

    loadCurrentUser()
  }, [])

  useEffect(() => {
    const seedReviews = seedUsers
      .flatMap((user, userIndex) =>
        user.feed_posts
          .filter((post) => post.type !== 'milestone' && post.review)
          .map((post, postIndex) => {
            const reviewedBook = user.bookshelf.find((book) => book.title === post.book_title)
            return {
              id: `${user.id}-${post.id}`,
              userId: user.id,
              displayName: user.display_name,
              username: user.username,
              avatarUrl: user.avatar_url,
              socialRank: user.social_rank,
              createdAt: post.created_at,
              reviewText: post.review || post.text,
              bookTitle: post.book_title || reviewedBook?.title || 'Lectura destacada',
              bookCover: reviewedBook?.cover_url || user.bookshelf[0]?.cover_url || null,
              likes: Math.max(7, Math.round(user.total_xp / 130) + postIndex * 3),
              comments: (userIndex + postIndex) % 5,
              baseLikes: Math.max(7, Math.round(user.total_xp / 130) + postIndex * 3),
              baseComments: (userIndex + postIndex) % 5,
              likedByMe: false,
            }
          }),
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 18)

    setSocialReviews(seedReviews)
    setIsLoadingFeed(false)
  }, [])

  useEffect(() => {
    const syncSocialCounts = async () => {
      if (socialReviews.length === 0) return
      const reviewIds = socialReviews.map((card) => card.id)
      const snapshot = await getSocialInteractionSnapshot(reviewIds)

      setSocialReviews((prev) =>
        prev.map((card) => {
          const persistedLikes = snapshot.likesByReview[card.id] || 0
          const persistedComments = snapshot.commentsByReview[card.id] || 0
          return {
            ...card,
            likes: card.baseLikes + persistedLikes,
            comments: card.baseComments + persistedComments,
            likedByMe: snapshot.likedByCurrentUser.has(card.id),
          }
        }),
      )
    }

    syncSocialCounts()
    const unsubscribe = subscribeToSocialInteractions(syncSocialCounts)
    return () => unsubscribe()
  }, [socialReviews.length])

  useEffect(() => {
    const loadTrends = async () => {
      const books = await getTrendingBooks()
      const trends = books.slice(0, 4).map((book, index) => `${index + 1}. ${book.title}`)
      setMonthlyTrends(trends)
    }
    loadTrends()
  }, [])

  const suggestedUsers = useMemo(
    () =>
      seedUsers.slice(0, 6).map((user) => ({
        id: user.id,
        displayName: user.display_name,
        username: user.username,
        avatarUrl: user.avatar_url,
        rank: user.social_rank,
        booksRead: user.bookshelf.length,
        recentReviews: user.feed_posts
          .filter((post) => !!post.review)
          .map((post) => post.review || '')
          .slice(0, 3),
      })),
    [],
  )

  const rewardSocialXp = async () => {
    try {
      await addXpAndUpdateRank(5)
    } catch (error) {
      console.error('⚠️ No se pudo registrar XP social:', error)
    }
    setInteractionToast('+5 XP por interactuar con la comunidad')
    window.setTimeout(() => setInteractionToast(null), 2200)
  }

  const handleLike = async (cardId: string) => {
    const result = await toggleReviewLike(cardId)
    if (result === null) {
      setMessage('Activa primero la migración social en Supabase para guardar reacciones')
      window.setTimeout(() => setMessage(null), 2400)
      return
    }

    setSocialReviews((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, likedByMe: result, likes: card.likes + (result ? 1 : -1) } : card,
      ),
    )

    setLikedPulseId(cardId)
    window.setTimeout(() => setLikedPulseId(null), 450)

    if (result) {
      await rewardSocialXp()
    }
  }

  const handleCommentSubmit = async (cardId: string, commentText: string) => {
    const draft = commentText.trim()
    if (!draft) return false

    const saved = await addReviewComment(cardId, draft)
    if (!saved) {
      setMessage('Activa primero la migración social en Supabase para publicar comentarios')
      window.setTimeout(() => setMessage(null), 2400)
      return false
    }

    setSocialReviews((prev) => prev.map((card) => (card.id === cardId ? { ...card, comments: card.comments + 1 } : card)))
    await rewardSocialXp()
    return true
  }

  const handleShare = async (card: SocialReviewCard) => {
    const text = `${card.displayName} recomienda ${card.bookTitle}: "${card.reviewText}"`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Comunidad Noveli', text })
      } else {
        await navigator.clipboard.writeText(text)
        setMessage('Reseña copiada para compartir')
        window.setTimeout(() => setMessage(null), 2200)
      }
    } catch (error) {
      console.error('⚠️ Error al compartir:', error)
    }
  }

  const handleToggleFollowCard = async (card: SocialReviewCard) => {
    if (!isAuthenticated) return

    const nextFollow = !card.isFollowing
    const ok = nextFollow ? await followUser(card.userId) : await unfollowUser(card.userId)
    if (!ok) return

    setSocialReviews((prev) =>
      prev.map((item) => (item.userId === card.userId ? { ...item, isFollowing: nextFollow } : item)),
    )
  }

  const handleOpenUserZoomFromCard = (card: SocialReviewCard) => {
    setZoomUser({
      id: card.userId,
      displayName: card.displayName,
      username: card.username,
      avatarUrl: card.avatarUrl,
      rank: card.socialRank,
      recentReviews: [card.reviewText],
      booksRead: 0,
    })
    setIsZoomOpen(true)
  }

  const handleToggleFollowUserZoom = async (userId: string, currentlyFollowing: boolean) => {
    if (!isAuthenticated) return

    const ok = currentlyFollowing ? await unfollowUser(userId) : await followUser(userId)
    if (!ok) return

    setSocialReviews((prev) =>
      prev.map((item) => (item.userId === userId ? { ...item, isFollowing: !currentlyFollowing } : item)),
    )
    setReaderResults((prev) => prev.map((reader) => (reader.id === userId ? { ...reader, isFollowing: !currentlyFollowing } : reader)))
  }

  const handleSearchReaders = async (event: FormEvent) => {
    event.preventDefault()
    if (!readerQuery.trim()) {
      setReaderResults([])
      return
    }

    setSearchingReaders(true)
    const results = await searchReaders(readerQuery)
    setReaderResults(results)
    setSearchingReaders(false)
  }

  const handleToggleFollowReader = async (profileId: string, isFollowing?: boolean) => {
    if (!isAuthenticated) return

    if (isFollowing) {
      await unfollowUser(profileId)
    } else {
      await followUser(profileId)
    }

    setReaderResults((current) =>
      current.map((profile) => (profile.id === profileId ? { ...profile, isFollowing: !isFollowing } : profile)),
    )
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' } },
  }

  return (
    <PageLayout>
      <motion.div className="space-y-5 px-2 pb-4 pt-3 sm:px-3" initial="hidden" animate="show" variants={sectionVariants}>
        {interactionToast && (
          <div className={`fixed right-6 top-24 z-50 rounded-2xl border px-5 py-3 text-sm font-semibold shadow-xl backdrop-blur-md ${isDarkMode ? 'bg-[#080808]/90 border-[#D4AF37]/20 text-[#D4AF37]' : 'bg-white/90 border-black/10 text-[#6F4E37]'}`}>
            {interactionToast}
          </div>
        )}

        <CardNoveli className="overflow-hidden rounded-2xl p-4 md:p-5" hoverable={false}>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className={`text-xs uppercase tracking-[0.24em] ${colorConfig.textMuted}`}>Red Social Noveli</p>
              <h1 className={`mt-1.5 font-serif text-3xl font-bold ${colorConfig.textPrimary}`}>Comunidad</h1>
              <p className={`mt-1.5 text-sm font-sans ${colorConfig.textMuted}`}>
                Conversaciones, reseñas y actividad en tiempo real del Círculo.
              </p>
            </div>
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] ${isDarkMode ? 'bg-white/5 border-white/10 text-[#D4AF37]' : 'bg-white/70 border-black/10 text-[#6F4E37]'}`}>
              <Sparkles size={14} />
              Feed social activo
            </div>
          </div>
        </CardNoveli>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <div className="xl:col-span-8 space-y-4">
            {message && (
              <div className={`rounded-2xl border px-3 py-2 text-xs ${isDarkMode ? 'bg-white/5 border-[#D4AF37]/25 text-[#D4AF37]' : 'bg-white/75 border-black/10 text-[#6F4E37]'}`}>
                {message}
              </div>
            )}

            {isLoadingFeed ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <CardNoveli key={i} className="rounded-2xl p-4 animate-pulse" hoverable={false}>
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`} />
                      <div className="flex-1 space-y-2">
                        <div className={`h-4 w-1/3 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`} />
                        <div className={`h-3 w-1/4 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`} />
                      </div>
                    </div>
                    <div className="mt-5 space-y-2">
                      <div className={`h-4 w-full rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`} />
                      <div className={`h-4 w-5/6 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`} />
                      <div className={`h-4 w-3/4 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`} />
                    </div>
                  </CardNoveli>
                ))}
              </div>
            ) : (
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-90px' }}
                variants={{
                  hidden: {},
                  show: {
                    transition: {
                      staggerChildren: 0.08,
                    },
                  },
                }}
                className="w-full space-y-5"
              >
                {socialReviews.map((card, index) => (
                  <SocialFeedCard
                    key={card.id}
                    card={card}
                    index={index}
                    isDarkMode={isDarkMode}
                    currentUserAvatar={currentUserAvatar}
                    currentUserInitial={currentUserInitial}
                    likedPulse={likedPulseId === card.id}
                    onLike={handleLike}
                    onShare={handleShare}
                    onSubmitComment={handleCommentSubmit}
                    onOpenUser={handleOpenUserZoomFromCard}
                    onToggleFollow={handleToggleFollowCard}
                  />
                ))}
              </motion.div>
            )}
          </div>

          <div className="xl:col-span-4 space-y-4">
            <CardNoveli className="rounded-2xl p-4" hoverable={false}>
              <div className="mb-4 flex items-center gap-2">
                <Users size={18} className={colorConfig.textAccent} />
                <h2 className={`font-serif text-base font-semibold ${colorConfig.textPrimary}`}>Sugerencias</h2>
              </div>

              <div className="space-y-3">
                {suggestedUsers.map((user) => {
                  const isFollowing = !!socialReviews.find((item) => item.userId === user.id)?.isFollowing
                  return (
                    <div key={user.id} className={`flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 ${isDarkMode ? 'bg-white/5' : 'bg-white/70'}`}>
                      <button
                        onClick={() => {
                          setZoomUser(user)
                          setIsZoomOpen(true)
                        }}
                        className="flex min-w-0 items-center gap-3 text-left"
                      >
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.displayName} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold ${isDarkMode ? 'bg-white/10 text-[#D4AF37]' : 'bg-stone-100 text-[#6F4E37]'}`}>
                            {user.displayName.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className={`truncate text-sm font-semibold ${colorConfig.textPrimary}`}>{user.displayName}</p>
                          <p className={`truncate text-xs ${colorConfig.textMuted}`}>@{user.username}</p>
                        </div>
                      </button>
                      <button
                        onClick={async () => handleToggleFollowUserZoom(user.id, isFollowing)}
                        className={`rounded-full border px-3 py-1 text-xs transition ${isFollowing ? isDarkMode ? 'border-white/15 bg-white/10 text-white' : 'border-black/10 bg-black/5 text-[#1A1A1A]' : isDarkMode ? 'border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]' : 'border-[#C4A484]/40 bg-[#C4A484]/10 text-[#6F4E37]'}`}
                      >
                        {isFollowing ? 'Siguiendo' : 'Seguir'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </CardNoveli>

            <CardNoveli className="rounded-2xl p-4" hoverable={false}>
              <div className="mb-4 flex items-center gap-2">
                <Flame size={18} className={colorConfig.textAccent} />
                <h2 className={`font-serif text-base font-semibold ${colorConfig.textPrimary}`}>Tendencias del mes</h2>
              </div>
              <div className="space-y-2">
                {monthlyTrends.map((trend) => (
                  <p key={trend} className={`rounded-xl px-2.5 py-1.5 text-xs ${isDarkMode ? 'bg-white/5 text-gray-200' : 'bg-white/70 text-[#3B2F24]'}`}>
                    {trend}
                  </p>
                ))}
              </div>
            </CardNoveli>

            <CardNoveli className="rounded-2xl p-4" hoverable={false}>
              <div className="mb-4 flex items-center gap-2">
                <Search size={18} className={colorConfig.textAccent} />
                <h2 className={`font-serif text-base font-semibold ${colorConfig.textPrimary}`}>Buscar lectores</h2>
              </div>

              <form onSubmit={handleSearchReaders} className="space-y-3">
                <input
                  value={readerQuery}
                  onChange={(event) => setReaderQuery(event.target.value)}
                  placeholder="Ej: maria_lectora"
                  className={`w-full rounded-[30px] border px-3 py-2 text-xs focus:outline-none ${isDarkMode ? 'bg-white/[0.03] text-white placeholder:text-stone-500' : 'bg-white/72 text-[#3B2F24] placeholder:text-[#8D7A66]'}`}
                  style={{ borderColor: palette.surfaceBorder }}
                />
                <button
                  type="submit"
                  className="w-full rounded-[30px] border px-3 py-1.5 text-xs font-semibold transition"
                  style={{ borderColor: palette.accent, color: palette.accent }}
                >
                  {searchingReaders ? 'Buscando...' : 'Buscar'}
                </button>
              </form>

              {readerResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  {readerResults.slice(0, 4).map((reader) => (
                    <div key={reader.id} className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 ${isDarkMode ? 'bg-white/5' : 'bg-white/70'}`}>
                      <button
                        onClick={() => {
                          setZoomUser({
                            id: reader.id,
                            displayName: reader.username || 'Lector Anónimo',
                            username: reader.username || 'lector',
                            avatarUrl: reader.avatar_url,
                            rank: reader.rank,
                            booksRead: Math.round((reader.xp || 0) / 120),
                          })
                          setIsZoomOpen(true)
                        }}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className={`truncate text-sm font-semibold ${colorConfig.textPrimary}`}>{reader.username || 'Lector Anónimo'}</p>
                        <p className={`truncate text-xs ${colorConfig.textMuted}`}>{reader.rank}</p>
                      </button>
                      <button
                        onClick={() => handleToggleFollowReader(reader.id, reader.isFollowing)}
                        className={`rounded-full border px-3 py-1 text-xs ${reader.isFollowing ? isDarkMode ? 'border-white/15 bg-white/10 text-white' : 'border-black/10 bg-black/5 text-[#1A1A1A]' : isDarkMode ? 'border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]' : 'border-[#C4A484]/40 bg-[#C4A484]/10 text-[#6F4E37]'}`}
                      >
                        {reader.isFollowing ? 'Siguiendo' : 'Seguir'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardNoveli>
          </div>
        </div>

        <UserProfileZoomModal
          isOpen={isZoomOpen}
          user={zoomUser}
          isFollowing={zoomUser ? !!socialReviews.find((item) => item.userId === zoomUser.id)?.isFollowing || !!readerResults.find((item) => item.id === zoomUser.id)?.isFollowing : false}
          onClose={() => setIsZoomOpen(false)}
          onToggleFollow={handleToggleFollowUserZoom}
        />
      </motion.div>
    </PageLayout>
  )
}
