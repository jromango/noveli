import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Heart, MessageCircle, Share2 } from 'lucide-react'

export interface SocialReviewCard {
  id: string
  userId: string
  displayName: string
  username: string
  avatarUrl: string
  socialRank: string
  createdAt: string
  reviewText: string
  bookTitle: string
  bookCover: string | null
  likes: number
  comments: number
  baseLikes: number
  baseComments: number
  likedByMe: boolean
  isFollowing?: boolean
}

interface SocialFeedCardProps {
  card: SocialReviewCard
  index: number
  isDarkMode: boolean
  currentUserAvatar: string | null
  currentUserInitial: string
  likedPulse: boolean
  onLike: (cardId: string) => Promise<void>
  onShare: (card: SocialReviewCard) => Promise<void>
  onSubmitComment: (cardId: string, text: string) => Promise<boolean>
  onOpenUser?: (card: SocialReviewCard) => void
  onToggleFollow?: (card: SocialReviewCard) => Promise<void>
}

export default function SocialFeedCard({
  card,
  index,
  isDarkMode,
  currentUserAvatar,
  currentUserInitial,
  likedPulse,
  onLike,
  onShare,
  onSubmitComment,
  onOpenUser,
  onToggleFollow,
}: SocialFeedCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [localComments, setLocalComments] = useState<string[]>([])

  const isLongReview = card.reviewText.length > 180
  const shouldFade = isLongReview && !isExpanded
  const engagement = useMemo(() => Math.min(100, 35 + card.likes + card.comments * 2), [card.likes, card.comments])

  const submitComment = async () => {
    const text = draft.trim()
    if (!text) return
    const saved = await onSubmitComment(card.id, text)
    if (!saved) return
    setLocalComments((prev) => [text, ...prev].slice(0, 3))
    setDraft('')
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: 'easeOut' }}
      className="group relative"
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent p-[0.5px] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="h-full w-full rounded-3xl bg-transparent" />
      </div>

      <div
        className={[
          'relative rounded-2xl p-4 md:p-5',
          'backdrop-blur-md transition-all duration-300',
          isDarkMode
            ? 'bg-white/5 border border-white/10 shadow-[0_18px_46px_rgba(0,0,0,0.45)]'
            : 'bg-white/60 border border-black/10 shadow-[0_18px_46px_rgba(15,23,42,0.10)]',
        ].join(' ')}
      >
        <div className="flex items-start gap-3">
          <img
            src={card.avatarUrl}
            alt={card.displayName}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={[
                  'font-serif text-sm font-semibold tracking-wide',
                  isDarkMode ? 'text-white' : 'text-[#1A1A1A]',
                ].join(' ')}>
                  <button onClick={() => onOpenUser?.(card)} className="hover:underline">
                    {card.displayName}
                  </button>
                </p>
                <p className={[
                  'text-[10px] font-light',
                  isDarkMode ? 'text-gray-400' : 'text-stone-500',
                ].join(' ')}>
                  {card.socialRank}
                </p>
              </div>
              <p className={[
                  'text-[9px] font-light',
                isDarkMode ? 'text-gray-500' : 'text-stone-400',
              ].join(' ')}>
                Publicado {formatDistanceToNow(new Date(card.createdAt), { addSuffix: true, locale: es })}
              </p>
            </div>

            {onToggleFollow && (
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => onToggleFollow(card)}
                  className={[
                    'rounded-full border px-3 py-1 text-[11px] font-light transition-colors',
                    card.isFollowing
                      ? isDarkMode
                        ? 'border-white/15 bg-white/10 text-white hover:bg-white/15'
                        : 'border-black/10 bg-black/5 text-[#1A1A1A] hover:bg-black/10'
                      : isDarkMode
                      ? 'border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/18'
                      : 'border-[#C4A484]/40 bg-[#C4A484]/10 text-[#6F4E37] hover:bg-[#C4A484]/18',
                  ].join(' ')}
                >
                  {card.isFollowing ? 'Siguiendo' : 'Seguir'}
                </button>
              </div>
            )}

            <div className="mt-3 flex gap-3">
              <img
                src={card.bookCover || '/placeholder-book.png'}
                alt={card.bookTitle}
                className="h-20 w-14 rounded-xl bg-black/30 p-0.5 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.24)]"
              />

              <div className="flex-1 min-w-0">
                <p className={[
                  'font-serif text-xs font-semibold',
                  isDarkMode ? 'text-[#D4AF37]' : 'text-[#6F4E37]',
                ].join(' ')}>
                  {card.bookTitle}
                </p>

                <div className="relative mt-2">
                  <p
                    className={[
                      'text-xs leading-relaxed font-sans',
                      shouldFade ? 'max-h-[76px] overflow-hidden' : '',
                      isDarkMode ? 'text-gray-100' : 'text-[#1A1A1A]',
                    ].join(' ')}
                  >
                    {card.reviewText}
                  </p>
                  {shouldFade && (
                    <div className={[
                      'pointer-events-none absolute bottom-0 left-0 right-0 h-10',
                      isDarkMode ? 'bg-gradient-to-t from-[#111111] to-transparent' : 'bg-gradient-to-t from-white to-transparent',
                    ].join(' ')} />
                  )}
                </div>

                {isLongReview && (
                  <button
                    onClick={() => setIsExpanded((prev) => !prev)}
                    className={[
                      'mt-1 text-[11px] font-light transition-colors',
                      isDarkMode ? 'text-[#D4AF37] hover:text-yellow-300' : 'text-[#6F4E37] hover:text-[#C4A484]',
                    ].join(' ')}
                  >
                    {isExpanded ? 'Ver menos' : 'Ver más'}
                  </button>
                )}

                <div className="mt-2.5">
                  <div className={[
                    'h-[3px] w-full overflow-hidden rounded-full',
                    isDarkMode ? 'bg-white/10' : 'bg-black/10',
                  ].join(' ')}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#C4A484] to-[#D4AF37]"
                      style={{ width: `${engagement}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                animate={likedPulse ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                onClick={() => onLike(card.id)}
                className={[
                  'inline-flex items-center gap-1 text-[11px] font-extralight transition-colors',
                  card.likedByMe
                    ? 'text-[#D4AF37]'
                    : isDarkMode
                    ? 'text-gray-300 hover:text-[#D4AF37]'
                    : 'text-stone-500 hover:text-[#C4A484]',
                ].join(' ')}
              >
                <Heart size={14} className={card.likedByMe ? 'fill-current' : ''} />
                <span>{card.likes}</span>
              </motion.button>

              <button
                onClick={() => setIsComposerOpen((prev) => !prev)}
                className={[
                  'inline-flex items-center gap-1 text-[11px] font-extralight transition-colors',
                  isDarkMode ? 'text-gray-300 hover:text-[#D4AF37]' : 'text-stone-500 hover:text-[#C4A484]',
                ].join(' ')}
              >
                <MessageCircle size={14} />
                <span>{card.comments}</span>
              </button>

              <button
                onClick={() => onShare(card)}
                className={[
                  'inline-flex items-center gap-1 text-[11px] font-extralight transition-colors',
                  isDarkMode ? 'text-gray-300 hover:text-[#D4AF37]' : 'text-stone-500 hover:text-[#C4A484]',
                ].join(' ')}
              >
                <Share2 size={14} />
                <span>Compartir</span>
              </button>
            </div>

            <AnimatePresence initial={false}>
              {isComposerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className={[
                    'mt-4 rounded-2xl p-3',
                    isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white/70 border border-black/10',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-3">
                    {currentUserAvatar ? (
                      <img
                        src={currentUserAvatar}
                        alt="Tu avatar"
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className={[
                        'flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold',
                        isDarkMode ? 'bg-white/10 text-[#D4AF37]' : 'bg-stone-100 text-[#6F4E37]',
                      ].join(' ')}>
                        {currentUserInitial}
                      </div>
                    )}

                    <div className="flex-1">
                      <textarea
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder="Comparte tu comentario..."
                        rows={2}
                        className={[
                          'w-full resize-none rounded-xl border px-3 py-2 text-sm focus:outline-none',
                          isDarkMode
                            ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#D4AF37]'
                            : 'bg-white border-black/10 text-[#1A1A1A] placeholder:text-stone-400 focus:border-[#C4A484]',
                        ].join(' ')}
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={submitComment}
                          className={[
                            'rounded-full px-4 py-1.5 text-xs font-light transition-colors',
                            isDarkMode ? 'bg-white/10 text-[#D4AF37] hover:bg-white/15' : 'bg-stone-100 text-[#6F4E37] hover:bg-stone-200',
                          ].join(' ')}
                        >
                          Publicar
                        </button>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {localComments.map((comment, commentIndex) => (
                      <motion.div
                        key={`${card.id}-local-comment-${commentIndex}`}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.22 }}
                        className={[
                          'mt-2 rounded-xl px-3 py-2 text-xs font-light',
                          isDarkMode ? 'bg-black/20 text-gray-200' : 'bg-stone-100 text-stone-700',
                        ].join(' ')}
                      >
                        {comment}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
