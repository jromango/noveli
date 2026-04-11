import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, BookOpen, Sparkles } from 'lucide-react'
import PageLayout from '../components/layout/PageLayout'
import CardNoveli from '../components/ui/CardNoveli'

interface AnalyticsPageProps {
  xp: number
  totalBooks: number
  completedBooks: number
}

export default function AnalyticsPage({ xp, totalBooks, completedBooks }: AnalyticsPageProps) {
  const completion = totalBooks > 0 ? Math.round((completedBooks / totalBooks) * 100) : 0

  return (
    <PageLayout className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="mx-auto max-w-5xl space-y-6"
      >
        <header>
          <p className="text-xs uppercase tracking-[0.28em] text-[#B9B1A4]">Vista inteligente</p>
          <h1 className="mt-2 font-serif text-4xl font-bold text-[#F5F1E8]">Analytics</h1>
          <p className="mt-2 text-sm text-[#B9B1A4]">Resumen de rendimiento lector con tarjetas de cristal premium.</p>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CardNoveli className="p-6" hoverable={false}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#B9B1A4]">Puntos XP</p>
                <p className="mt-2 font-serif text-4xl text-[#D4AF37]">{xp}</p>
              </div>
              <Sparkles size={30} className="text-[#D4AF37]" />
            </div>
          </CardNoveli>

          <CardNoveli className="p-6" hoverable={false}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#B9B1A4]">Libros Totales</p>
                <p className="mt-2 font-serif text-4xl text-[#D4AF37]">{totalBooks}</p>
              </div>
              <BookOpen size={30} className="text-[#D4AF37]" />
            </div>
          </CardNoveli>
        </section>

        <CardNoveli className="p-6" hoverable={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#B9B1A4]">Progreso de finalización</p>
              <p className="mt-2 font-serif text-3xl text-[#F5F1E8]">{completion}%</p>
            </div>
            <Trophy size={28} className="text-[#D4AF37]" />
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#6F4E37] via-[#B98E5C] to-[#F1D074]"
              style={{ width: `${completion}%`, boxShadow: '0 0 10px rgba(212,175,55,0.35)' }}
            />
          </div>
        </CardNoveli>
      </motion.div>
    </PageLayout>
  )
}
