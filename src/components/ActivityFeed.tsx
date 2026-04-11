import React from 'react'
import { BookOpen, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { BookshelfBook, Note } from '../services/database'
import { timeAgo } from '../lib/utils'
import CardNoveli from './ui/CardNoveli'

interface Activity {
  id: string
  type: 'added' | 'started' | 'completed' | 'reviewed'
  user: string
  book?: BookshelfBook
  note?: Note
  timestamp: Date
}

interface ActivityFeedProps {
  books: BookshelfBook[]
  notes: Note[]
  username: string
}

export default function ActivityFeed({ books, notes, username }: ActivityFeedProps) {
  // Generate activities from books and notes
  const activities: Activity[] = []

  books.forEach(book => {
    activities.push({
      id: `book-${book.id}`,
      type: book.status === 'completed' ? 'completed' : book.status === 'reading' ? 'started' : 'added',
      user: username,
      book,
      timestamp: new Date(book.created_at),
    })
  })

  notes.forEach(note => {
    activities.push({
      id: `note-${note.id}`,
      type: 'reviewed',
      user: username,
      note,
      timestamp: new Date(note.created_at),
    })
  })

  // Sort by timestamp descending
  activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  const getActivityMessage = (activity: Activity) => {
    switch (activity.type) {
      case 'added':
        return `añadió "${activity.book?.title}" a su estante`
      case 'started':
        return `empezó a leer "${activity.book?.title}"`
      case 'completed':
        return `terminó "${activity.book?.title}" ${'⭐'.repeat(activity.note?.rating || 5)}`
      case 'reviewed':
        return `reseñó "${activity.note?.title}" ${'⭐'.repeat(activity.note?.rating || 5)}`
      default:
        return ''
    }
  }

  return (
    <section className="mb-12">
      <h2 className="font-serif text-2xl font-bold text-stone-800 mb-6 tracking-wider text-center">Actividad Reciente</h2>
      <div className="space-y-3">
        {activities.slice(0, 5).map((activity) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className=""
          >
            <CardNoveli className="rounded-xl p-3" hoverable={false}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {activity.book?.cover ? (
                  <img
                    src={activity.book.cover}
                    alt={activity.book.title}
                    className="w-10 h-10 object-cover rounded-full border-2 border-gold/60 shadow-md"
                  />
                ) : (
                  <div className="w-10 h-10 bg-black/70 rounded-full border-2 border-gold/60 flex items-center justify-center text-sm font-semibold text-white shadow-md">
                    {activity.user?.slice(0, 1).toUpperCase() || 'L'}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-stone-800 text-sm">
                  <span className="font-semibold text-gold">{activity.user}</span> {getActivityMessage(activity)}
                </p>
                <p className="text-amber-700/70 text-xs mt-1">{timeAgo(activity.timestamp)}</p>
              </div>
            </div>
            </CardNoveli>
          </motion.div>
        ))}
        {activities.length === 0 && (
          <CardNoveli className="rounded-2xl p-12 text-center" hoverable={false}>
            <div className="mb-4">
              <BookOpen size={48} className="text-gold/50 mx-auto" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-800 mb-2">Sin actividad reciente</h3>
            <p className="text-amber-700/80 text-sm">¡Empieza tu viaje literario añadiendo tu primer libro!</p>
          </CardNoveli>
        )}
      </div>
    </section>
  )
}