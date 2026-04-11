/**
 * Oráculo Noveli - AI Consultant Service
 * Infraestructura para consultar IA (OpenAI/Anthropic)
 * El "cerebro" de la red social literaria Círculo Noveli
 */

import { BookshelfBook } from './database'

export interface AIConsultationRequest {
  userBookshelf: BookshelfBook[]
  dominantGenre: string
  favoriteAuthors: string[]
  readingStreak: number
  prompt: string
}

export interface AIConsultationResponse {
  reasoning: string
  recommendations: string[]
  insight: string
  confidence: number // 0-1
}

/**
 * Consultar al Oráculo Noveli via API Real
 * 
 * INSTRUCCIONES PARA INTEGRACIÓN:
 * 1. Obtener API Key en: https://platform.openai.com/api-keys (OpenAI)
 *    O https://console.anthropic.com (Anthropic)
 * 
 * 2. Crear archivo .env.local en raíz del proyecto:
 *    VITE_OPENAI_API_KEY=sk-...
 *    VITE_ANTHROPIC_API_KEY=sk-ant-...
 * 
 * 3. Descomentar el código correspondiente abajo
 * 
 * 4. Instalar dependencias:
 *    npm install openai
 *    (O para Anthropic: npm install @anthropic-ai/sdk)
 */
export async function consultarInteractivoAI(
  request: AIConsultationRequest,
  provider: 'openai' | 'anthropic' = 'openai'
): Promise<AIConsultationResponse> {
  // =====================================================
  // OPCIÓN 1: OpenAI (GPT-4 / GPT-3.5-turbo)
  // =====================================================
  
  // import OpenAI from 'openai'
  // const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  // if (!apiKey) throw new Error('VITE_OPENAI_API_KEY no configurada')
  // 
  // const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })
  // 
  // const systemPrompt = `Eres el Oráculo Noveli, el cerebro de una red social literaria premium.
  // Tu rol es hacer recomendaciones personalizadas basadas en patrones de lectura.
  // Responde SIEMPRE en JSON con la estructura: { reasoning, recommendations, insight, confidence }
  // Tu confianza debe ser un número entre 0 y 1.`
  // 
  // const userPrompt = `
  // Género predominante: ${request.dominantGenre}
  // Autores favoritos: ${request.favoriteAuthors.join(', ')}
  // Streak de lectura: ${request.readingStreak} días
  // Libros recientes: ${request.userBookshelf.slice(0, 5).map(b => b.title).join(', ')}
  // 
  // ${request.prompt}
  // 
  // Responde SIEMPRE en JSON válido.`
  // 
  // try {
  //   const message = await client.messages.create({
  //     model: 'gpt-3.5-turbo',
  //     max_tokens: 1024,
  //     messages: [
  //       { role: 'user', content: userPrompt }
  //     ]
  //   })
  //   
  //   const content = message.content[0]
  //   if (content.type !== 'text') throw new Error('Respuesta inválida')
  //   
  //   const parsed = JSON.parse(content.text)
  //   return {
  //     reasoning: parsed.reasoning || 'Análisis completado',
  //     recommendations: parsed.recommendations || [],
  //     insight: parsed.insight || '',
  //     confidence: parsed.confidence || 0.7
  //   }
  // } catch (error) {
  //   console.error('❌ Error consultando OpenAI:', error)
  //   throw error
  // }

  // =====================================================
  // OPCIÓN 2: Anthropic Claude
  // =====================================================
  
  // import Anthropic from '@anthropic-ai/sdk'
  // const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  // if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY no configurada')
  // 
  // const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  // 
  // const systemPrompt = `Eres el Oráculo Noveli, el cerebro de una red social literaria premium.
  // Tu rol es hacer recomendaciones personalizadas basadas en patrones de lectura.
  // Responde SIEMPRE en JSON con la estructura: { reasoning, recommendations, insight, confidence }
  // Tu confianza debe ser un número entre 0 y 1.`
  // 
  // const userPrompt = `...` // (igual que arriba)
  // 
  // try {
  //   const message = await client.messages.create({
  //     model: 'claude-3-sonnet-20240229',
  //     max_tokens: 1024,
  //     system: systemPrompt,
  //     messages: [{ role: 'user', content: userPrompt }]
  //   })
  //   
  //   const content = message.content[0]
  //   if (content.type !== 'text') throw new Error('Respuesta inválida')
  //   
  //   const parsed = JSON.parse(content.text)
  //   return {
  //     reasoning: parsed.reasoning || 'Análisis completado',
  //     recommendations: parsed.recommendations || [],
  //     insight: parsed.insight || '',
  //     confidence: parsed.confidence || 0.7
  //   }
  // } catch (error) {
  //   console.error('❌ Error consultando Anthropic:', error)
  //   throw error
  // }

  // =====================================================
  // FALLBACK: Respuesta Local (Sin IA Real)
  // =====================================================
  
  return {
    reasoning: `Basado en tu afinidad por ${request.dominantGenre} y tu racha de ${request.readingStreak} días`,
    recommendations: [
      'Libro recomendado basado en tus preferencias',
      'Siguiente lectura sugerida',
      'Clásico en tu género favorito'
    ],
    insight: `El Oráculo ha analizado ${request.userBookshelf.length} libros en tu estante`,
    confidence: 0.65
  }
}

/**
 * Función simulada para análisis local sin API
 * Útil para desarrollo o cuando la IA no está disponible
 */
export function generarSugerenciaLocal(
  dominantGenre: string,
  favoriteAuthors: string[],
  readingStreak: number
): AIConsultationResponse {
  const genreDescriptor: Record<string, string> = {
    'Ficción': 'narrativas profundas y personajes complejos',
    'Fantasía': 'mundos imaginarios y aventuras épicas',
    'Misterio': 'tramas intrigantes y giros inesperados',
    'Romance': 'historias de conexión y emociones',
    'Terror': 'suspenso y atmósferas oscuras',
    'Ciencia Ficción': 'futuros posibles y tecnología',
    'Histórico': 'grandes momentos de la historia',
    'Lírica': 'belleza poética y expresión',
  }

  const descriptor = genreDescriptor[dominantGenre] || 'narrativas cautivadoras'
  
  return {
    reasoning: `Tu predominancia en ${dominantGenre} sugiere preferencia por ${descriptor}`,
    recommendations: [
      `Un clásico enraizado en ${dominantGenre}`,
      `La próxima tendencia en ${dominantGenre}`,
      `Una joya oculta similar a ${favoriteAuthors[0] || 'tus autores favoritos'}`
    ],
    insight: `Con una racha de ${readingStreak} días, el Oráculo detecta pasión genuina por la lectura`,
    confidence: readingStreak > 7 ? 0.85 : readingStreak > 3 ? 0.72 : 0.55
  }
}

/**
 * Función helper: Extraer análisis de bookshelf
 * Identifica patrones en lectura del usuario
 */
export function analizarPatronesLectura(bookshelf: BookshelfBook[]) {
  const genreCount: Record<string, number> = {}
  let totalPages = 0
  let completedBooks = 0

  bookshelf.forEach(book => {
    // Contar géneros
    const genre = book.genre || 'Sin género'
    genreCount[genre] = (genreCount[genre] || 0) + 1

    // Acumular páginas
    totalPages += book.totalPages || 0

    // Contar libros completados
    if (book.status === 'completed') completedBooks++
  })

  // Género predominante
  const dominantGenre = Object.entries(genreCount).sort(
    ([, a], [, b]) => b - a
  )[0]?.[0] || 'General'

  // Promedio de páginas por libro
  const avgPages = bookshelf.length > 0 ? Math.round(totalPages / bookshelf.length) : 0

  return {
    totalBooks: bookshelf.length,
    completedBooks,
    dominantGenre,
    genreCount,
    totalPages,
    avgPages,
    readingSpeed: avgPages > 400 ? 'Lector ávido' : avgPages > 200 ? 'Lector regular' : 'Lector casual',
  }
}

/**
 * Simular tendencias globales
 * En producción: consulta tabla que cuenta libros completados por otros en últimos 30 días
 */
export function generarTendenciasGlobales(): { title: string; count: number }[] {
  // En producción, esto sería una query Supabase:
  // SELECT book_title, COUNT(*) as count 
  // FROM bookshelf 
  // WHERE status = 'completed' AND updated_at > NOW() - INTERVAL '30 days'
  // GROUP BY book_title 
  // ORDER BY count DESC 
  // LIMIT 10

  const simulatedTrends = [
    { title: 'El Quijote', count: 23 },
    { title: 'Cien años de soledad', count: 19 },
    { title: 'Orgullo y prejuicio', count: 17 },
    { title: 'La sombra del viento', count: 15 },
    { title: '1984', count: 14 },
  ]

  return simulatedTrends
}

/**
 * Generar etiqueta inteligente para recomendación
 * Basada en múltiples factores
 */
export interface SmartLabel {
  emoji: string
  text: string
  color: string // Clase Tailwind
}

export function generarEtiquetaInteligente(
  matchPercentage: number,
  isViral: boolean,
  isPending: boolean,
  genre: string
): SmartLabel {
  if (matchPercentage >= 95) {
    return {
      emoji: '✨',
      text: `Match del ${matchPercentage}%`,
      color: 'from-yellow-400 to-yellow-600'
    }
  } else if (isViral) {
    return {
      emoji: '🔥',
      text: 'Viral en tu círculo',
      color: 'from-red-400 to-red-600'
    }
  } else if (isPending) {
    return {
      emoji: '🏆',
      text: 'Clásico pendiente',
      color: 'from-pink-400 to-pink-600'
    }
  } else {
    return {
      emoji: '💎',
      text: 'Gema literaria',
      color: 'from-blue-400 to-blue-600'
    }
  }
}

/**
 * Sub-categorización de lujo
 * Transform "Horror" -> "Horror Gótico Atmosférico"
 */
export function enriqueserCategoriaGenero(genre: string): string {
  const luxuryDescriptors: Record<string, string[]> = {
    'Ficción': ['Narrativa Contemporánea', 'Épica', 'Introspectiva'],
    'Fantasía': ['Fantasía de Alta Magia', 'Universos Paralelos', 'Épica Fantasiosa'],
    'Misterio': ['Misterio Psicológico', 'Thriller Intelectual', 'Enigma Clásico'],
    'Romance': ['Romance de Época', 'Pasión Contemporánea', 'Amor Épico'],
    'Terror': ['Terror Gótico Atmosférico', 'Psicológico Perturbador', 'Creepypasta Literaria'],
    'Ciencia Ficción': ['Sci-Fi Futurista', 'Distopía Reflexiva', 'Cyberpunk Visionario'],
    'Histórico': ['Saga Histórica', 'Ficción Histórica Épica', 'Crónica de Era'],
    'Lírica': ['Poesía Contemporánea', 'Verso Clasicista', 'Prosa Poética'],
  }

  const variants = luxuryDescriptors[genre] || luxuryDescriptors['Ficción']!
  return variants[Math.floor(Math.random() * variants.length)]
}
