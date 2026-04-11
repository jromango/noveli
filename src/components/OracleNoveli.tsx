import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, BookOpen, TrendingUp } from 'lucide-react'
import { BookshelfBook } from '../services/database'
import {
  analizarPatronesLectura,
  generarTendenciasGlobales,
  generarEtiquetaInteligente,
  enriqueserCategoriaGenero,
  AIConsultationResponse
} from '../services/aiConsultant'

interface OracleNoveliProps {
  bookshelf: BookshelfBook[]
}

export default function OracleNoveli({ bookshelf }: OracleNoveliProps) {
  const [analysis, setAnalysis] = useState<ReturnType<typeof analizarPatronesLectura> | null>(null)
  const [trends, setTrends] = useState<{ title: string; count: number }[]>([])
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    
    // Analizar patrones de lectura
    const analysisResult = analizarPatronesLectura(bookshelf)
    setAnalysis(analysisResult)

    // Generar tendencias globales
    const globalTrends = generarTendenciasGlobales()
    setTrends(globalTrends)

    // Simular recomendaciones basadas en análisis
    const simulatedRecommendations = [
      {
        id: 'rec-1',
        title: 'El Quijote',
        author: 'Miguel de Cervantes',
        genre: analysisResult.dominantGenre,
        enrichedGenre: enriqueserCategoriaGenero(analysisResult.dominantGenre),
        matchPercentage: 98,
        isViral: true,
        isPending: true,
        explanation: `Basado en tu racha de lectura y preferencia por ${analysisResult.dominantGenre}`,
        insight: 'Sigue patrones similares a tus últimas 3 lecturas'
      },
      {
        id: 'rec-2',
        title: 'Cien años de soledad',
        author: 'Gabriel García Márquez',
        genre: analysisResult.dominantGenre,
        enrichedGenre: enriqueserCategoriaGenero(analysisResult.dominantGenre),
        matchPercentage: 92,
        isViral: true,
        isPending: false,
        explanation: `Comunidad literaria recomienda esto a lectores como tú`,
        insight: 'Trending en tu círculo de lectores'
      },
      {
        id: 'rec-3',
        title: '1984',
        author: 'George Orwell',
        genre: analysisResult.dominantGenre,
        enrichedGenre: enriqueserCategoriaGenero(analysisResult.dominantGenre),
        matchPercentage: 87,
        isViral: false,
        isPending: true,
        explanation: `Un clásico esencial que completa tu colección de ${analysisResult.dominantGenre}`,
        insight: 'Obra fundamental que falta en tu estante'
      }
    ]

    setRecommendations(simulatedRecommendations)
    setIsLoading(false)
  }, [bookshelf])

  if (!analysis) return null

  return (
    <div className="w-full space-y-6">
      {/* Título con icono pulsante */}
      <div className="flex items-center gap-3 mb-8">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-gold"
        >
          <Sparkles size={28} />
        </motion.div>
        <h2 className="font-serif text-3xl font-bold gradient-text">Sugerencias del Oráculo</h2>
      </div>

      {/* Contenedor principal con gradiente radial y borde animado */}
      <div className="relative overflow-hidden rounded-3xl">
        {/* Fondo con gradiente radial */}
        <div
          className="absolute inset-0 rounded-3xl"
          style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(217, 119, 6, 0.15), transparent 70%)'
          }}
        />

        {/* Borde con animación de brillo */}
        <div className="absolute inset-0 rounded-3xl pointer-events-none">
          <motion.div
            animate={{ backgroundPosition: ['200% 0%', '0% 0%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-3xl opacity-50"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.4), transparent)',
              backgroundPosition: '200% 0%',
              backgroundSize: '200% 100%',
              borderRadius: '1.5rem'
            }}
          />
        </div>

        {/* Contenido principal */}
        <div className="relative border border-gold/30 rounded-3xl backdrop-blur-md bg-black/40 p-8 space-y-8">
          {/* Sección de Análisis */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass-card p-4 border border-gold/20"
            >
              <p className="text-gold/60 text-xs font-sans uppercase tracking-widest mb-2">
                Libros en el Estante
              </p>
              <p className="text-gold text-3xl font-bold">{analysis.totalBooks}</p>
              <p className="text-gold/40 text-xs mt-2">
                {analysis.completedBooks} completados
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass-card p-4 border border-gold/20"
            >
              <p className="text-gold/60 text-xs font-sans uppercase tracking-widest mb-2">
                Género Dominante
              </p>
              <p className="text-gold font-serif font-semibold line-clamp-2">
                {analysis.dominantGenre}
              </p>
              <p className="text-gold/40 text-xs mt-2">
                {Math.round((Object.values(analysis.genreCount)[0] / analysis.totalBooks) * 100)}% de tu lectura
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass-card p-4 border border-gold/20"
            >
              <p className="text-gold/60 text-xs font-sans uppercase tracking-widest mb-2">
                Promedio de Páginas
              </p>
              <p className="text-gold text-3xl font-bold">{analysis.avgPages}</p>
              <p className="text-gold/40 text-xs mt-2">{analysis.readingSpeed}</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass-card p-4 border border-gold/20"
            >
              <p className="text-gold/60 text-xs font-sans uppercase tracking-widest mb-2">
                Total de Páginas
              </p>
              <p className="text-gold text-3xl font-bold">{analysis.totalPages}</p>
              <p className="text-gold/40 text-xs mt-2">Lectura acumulada</p>
            </motion.div>
          </div>

          {/* Sección de Próxima Lectura Recomendada */}
          {!isLoading && recommendations.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                <BookOpen size={20} className="text-gold" />
                Próxima Lectura Recomendada
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendations.map((rec, index) => {
                  const smartLabel = generarEtiquetaInteligente(
                    rec.matchPercentage,
                    rec.isViral,
                    rec.isPending,
                    rec.genre
                  )

                  return (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.15 }}
                      className="glass-card border border-gold/30 overflow-hidden hover:border-gold/60 transition-colors"
                    >
                      {/* Imagen simulada del libro */}
                      <div className="relative w-full h-48 bg-gradient-to-br from-gold/20 to-black/60 flex items-center justify-center overflow-hidden">
                        <BookOpen size={64} className="text-gold/40" />

                        {/* Smart Label Badge */}
                        <div
                          className={`absolute top-3 right-3 flex items-center gap-2 px-3 py-1 rounded-full border border-gold/50 backdrop-blur-sm bg-gradient-to-r ${smartLabel.color}`}
                        >
                          <span className="text-sm">{smartLabel.emoji}</span>
                          <span className="text-xs font-bold text-white">{smartLabel.text}</span>
                        </div>
                      </div>

                      {/* Información del libro */}
                      <div className="p-5 space-y-3">
                        <div>
                          <p className="font-serif font-bold text-gold text-lg line-clamp-2 mb-1">
                            {rec.title}
                          </p>
                          <p className="text-gold/70 text-sm font-sans">{rec.author}</p>
                        </div>

                        {/* Sub-categoría de lujo */}
                        <div className="pt-2 border-t border-gold/20">
                          <p className="text-xs font-sans text-gold/60 uppercase tracking-[0.15em] mb-1">
                            Clasificación
                          </p>
                          <p className="text-sm font-serif text-gold italic">
                            {rec.enrichedGenre}
                          </p>
                        </div>

                        {/* Explicación del Oráculo */}
                        <div className="pt-2 border-t border-gold/20">
                          <p className="text-xs font-sans text-gold/70 line-clamp-2 italic">
                            "{rec.explanation}"
                          </p>
                        </div>

                        {/* Score */}
                        <div className="flex items-center justify-between pt-3 border-t border-gold/20">
                          <span className="text-[11px] font-sans text-gold/50 uppercase tracking-widest">
                            Compatibilidad
                          </span>
                          <span className="font-bold text-gold">{rec.matchPercentage}%</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Sección de Tendencias Globales */}
          {trends.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-gold/20">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-gold" />
                Tendencias Globales (Últimos 30 Días)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {trends.map((trend, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card p-4 border border-gold/20"
                  >
                    <p className="text-gold/60 text-xs font-sans uppercase tracking-widest mb-2">
                      #{index + 1} Trending
                    </p>
                    <p className="text-gold font-serif font-semibold line-clamp-2 mb-2">
                      {trend.title}
                    </p>
                    <p className="text-gold/40 text-sm font-sans">
                      {trend.count} completados
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer con nota sobre IA */}
      <div className="text-center pt-4">
        <p className="text-gold/50 text-xs font-sans">
          El Oráculo Noveli analiza tu patrón de lectura para sugerencias personalizadas
        </p>
      </div>
    </div>
  )
}
