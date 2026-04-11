import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, UserPlus, UserMinus, Users, BookOpen, MessageCircle, Award, Heart } from 'lucide-react'

export interface UserZoomData {
  id: string
  displayName: string
  username: string
  avatarUrl?: string | null
  rank?: string
  recentReviews?: string[]
  booksRead?: number
  followersCount?: number
  followingCount?: number
  bio?: string
  bookshelf?: Array<{
    id: string
    title: string
    author: string
    cover?: string | null
  }>
  achievements?: string[]
}

interface UserProfileZoomModalProps {
  isOpen: boolean
  user: UserZoomData | null
  isFollowing: boolean
  onClose: () => void
  onToggleFollow: (userId: string, currentlyFollowing: boolean) => Promise<void> | void
}

export default function UserProfileZoomModal({
  isOpen,
  user,
  isFollowing,
  onClose,
  onToggleFollow,
}: UserProfileZoomModalProps) {
  const [activeTab, setActiveTab] = React.useState<'library' | 'reviews' | 'achievements'>('library')
  const [likedReviews, setLikedReviews] = React.useState<Record<number, boolean>>({})

  React.useEffect(() => {
    if (!isOpen) {
      setActiveTab('library')
      setLikedReviews({})
    }
  }, [isOpen])

  const generatedBookshelf = React.useMemo(() => {
    if (user?.bookshelf && user.bookshelf.length > 0) return user.bookshelf
    return Array.from({ length: Math.max(3, Math.min(6, user?.booksRead || 4)) }).map((_, idx) => ({
      id: `${user?.id || 'user'}-book-${idx}`,
      title: `Lectura ${idx + 1}`,
      author: user?.displayName || 'Autor invitado',
      cover: null,
    }))
  }, [user])

  const reviews = user?.recentReviews || []
  const achievements =
    user?.achievements ||
    [
      'Racha activa de lectura',
      'Curador de recomendaciones',
      user?.rank || 'Bibliotecario Noveli',
    ]

  return (
    <AnimatePresence>
      {isOpen && user && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="scrollbar-hide relative w-full max-w-[min(96vw,1120px)] max-h-[90vh] overflow-y-auto rounded-[24px] border border-[#D4AF37]/20 bg-black/80 p-4 text-[#F5F1E8] shadow-[0_20px_56px_rgba(0,0,0,0.52)]"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="sticky float-right right-0 top-0 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Cerrar"
            >
              <X size={14} />
            </button>

            <div className="clear-both space-y-4">
              <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-[auto_1fr_auto] md:items-start">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="h-24 w-24 rounded-full border border-[#D4AF37]/35 object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[#D4AF37]/35 bg-white/10 text-3xl font-bold text-[#D4AF37]">
                    {(user.displayName || user.username || 'N').slice(0, 1).toUpperCase()}
                  </div>
                )}

                <div>
                  <p className="font-serif text-3xl font-bold">{user.displayName}</p>
                  <p className="text-sm text-[#CABEAE]">@{user.username}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#D4AF37]">{user.rank || 'Cazador de Historias'}</p>
                  <p className="mt-2 max-w-2xl text-sm text-[#DDD3C4]">
                    {user.bio || 'Lector apasionado por descubrir historias memorables y compartir reseñas con la comunidad Noveli.'}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                    <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                      <Users size={13} className="text-[#D4AF37]" />
                      <span className="text-[#E6DDCF]">{user.followersCount ?? 128} Lectores</span>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                      <Users size={13} className="text-[#D4AF37]" />
                      <span className="text-[#E6DDCF]">{user.followingCount ?? 74} Lectores seguidos</span>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                      <BookOpen size={13} className="text-[#D4AF37]" />
                      <span className="text-[#E6DDCF]">{user.booksRead || 0} Libros leídos</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <button
                    onClick={() => onToggleFollow(user.id, isFollowing)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/15 px-4 py-2 text-xs font-semibold text-[#D4AF37] transition hover:bg-[#D4AF37]/22"
                  >
                    {isFollowing ? <UserMinus size={14} /> : <UserPlus size={14} />}
                    {isFollowing ? 'Siguiendo' : 'Seguir'}
                  </button>
                  <button className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/15">
                    <MessageCircle size={14} />
                    Enviar mensaje
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
                <button
                  onClick={() => setActiveTab('library')}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === 'library' ? 'bg-[#D4AF37]/18 text-[#D4AF37]' : 'bg-white/5 text-[#CCC2B2]'
                  }`}
                >
                  Biblioteca
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === 'reviews' ? 'bg-[#D4AF37]/18 text-[#D4AF37]' : 'bg-white/5 text-[#CCC2B2]'
                  }`}
                >
                  Reseñas
                </button>
                <button
                  onClick={() => setActiveTab('achievements')}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === 'achievements' ? 'bg-[#D4AF37]/18 text-[#D4AF37]' : 'bg-white/5 text-[#CCC2B2]'
                  }`}
                >
                  Logros
                </button>
              </div>

              {activeTab === 'library' && (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(115px,1fr))] gap-3">
                  {generatedBookshelf.map((book) => (
                    <div key={book.id} className="rounded-xl border border-white/10 bg-white/5 p-2">
                      <div className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-black/30">
                        {book.cover ? (
                          <img src={book.cover} alt={book.title} className="h-full w-full object-contain p-1" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[11px] text-[#CABEAE]">Sin portada</div>
                        )}
                      </div>
                      <p className="mt-2 line-clamp-2 font-serif text-xs text-[#F3EBDD]">{book.title}</p>
                      <p className="line-clamp-1 text-[10px] text-[#CABEAE]">{book.author}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-3">
                  {reviews.length > 0 ? (
                    reviews.map((review, index) => (
                      <div key={`${user.id}-review-${index}`} className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-sm text-[#ECE3D6]">{review}</p>
                        <button
                          onClick={() =>
                            setLikedReviews((prev) => ({
                              ...prev,
                              [index]: !prev[index],
                            }))
                          }
                          className={`mt-2 inline-flex items-center gap-1 text-xs transition ${
                            likedReviews[index] ? 'text-[#D4AF37]' : 'text-[#BFB3A1] hover:text-[#D4AF37]'
                          }`}
                        >
                          <Heart size={13} className={likedReviews[index] ? 'fill-current' : ''} />
                          {likedReviews[index] ? 'Te gusta' : 'Like'}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-[#CABEAE]">
                      Este usuario aun no publica reseñas.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'achievements' && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {achievements.map((achievement, index) => (
                    <div key={`${user.id}-achievement-${index}`} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="inline-flex items-center gap-1 text-[#D4AF37]">
                        <Award size={14} />
                        <span className="text-xs uppercase tracking-[0.15em]">Nivel</span>
                      </div>
                      <p className="mt-2 font-serif text-sm text-[#F3EBDD]">{achievement}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
