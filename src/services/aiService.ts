import { BookshelfBook } from './database'
import { GoogleBook } from './googleBooks'
import { getTrendingBooks } from './bookTrends'

export interface SmartTag {
  id: 'must-read' | 'trending' | 'masterpiece' | 'hidden-gem' | 'classic'
  label: string
  emoji: string
  color: string
  description: string
}

export const SMART_TAGS: Record<string, SmartTag> = {
  'must-read': {
    id: 'must-read',
    label: 'Imprescindible',
    emoji: '✨',
    color: 'from-yellow-400 to-yellow-600',
    description: 'Un clásico que todo lector debe experimentar',
  },
  'trending': {
    id: 'trending',
    label: 'Tendencia',
    emoji: '🔥',
    color: 'from-red-400 to-red-600',
    description: 'Muy popular en la comunidad literaria ahora',
  },
  'masterpiece': {
    id: 'masterpiece',
    label: 'Obra Maestra',
    emoji: '🏆',
    color: 'from-pink-400 to-pink-600',
    description: 'Una obra excepcional de su género',
  },
  'hidden-gem': {
    id: 'hidden-gem',
    label: 'Joya Oculta',
    emoji: '💎',
    color: 'from-blue-400 to-blue-600',
    description: 'Un libro poco conocido pero excepcional',
  },
  'classic': {
    id: 'classic',
    label: 'Clásico Literario',
    emoji: '📚',
    color: 'from-amber-400 to-amber-600',
    description: 'Una obra fundamental de la literatura',
  },
}

export interface UserGenrePreference {
  genre: string
  count: number
  percentage: number
}

export interface AIRecommendation {
  book: GoogleBook
  smartTag: SmartTag
  reason: string
  matchScore: number
}

/**
 * Analiza el estante del usuario y devuelve sus géneros favoritos
 * @param books - Array de libros del usuario
 * @returns Array de géneros ordenados por popularidad
 */
export function analyzeUserGenrePreferences(books: BookshelfBook[]): UserGenrePreference[] {
  if (books.length === 0) {
    return []
  }

  const genreMap = new Map<string, number>()

  books.forEach((book) => {
    if (book.genre) {
      const currentCount = genreMap.get(book.genre) || 0
      genreMap.set(book.genre, currentCount + 1)
    }
  })

  const total = books.length
  const preferences: UserGenrePreference[] = Array.from(genreMap.entries())
    .map(([genre, count]) => ({
      genre,
      count,
      percentage: (count / total) * 100,
    }))
    .sort((a, b) => b.count - a.count)

  console.log('📊 Análisis de géneros del usuario:', preferences)
  return preferences
}

/**
 * Obtiene el género favorito del usuario
 * @param books - Array de libros del usuario
 * @returns El género más frecuente o null
 */
export function getFavoriteGenre(books: BookshelfBook[]): string | null {
  const preferences = analyzeUserGenrePreferences(books)
  return preferences.length > 0 ? preferences[0].genre : null
}

/**
 * Asigna un Smart Tag inteligente a un libro basado en su perfil
 * @param book - El libro a etiquetar
 * @param userBooks - Libros del usuario para contexto
 * @returns El SmartTag asignado
 */
export function assignSmartTag(book: GoogleBook, userBooks: BookshelfBook[]): SmartTag {
  // Lógica de asignación de tags basada en:
  // - Popularidad del libro
  // - Género del usuario
  // - Número de páginas (clásicos suelen ser largos)
  // - Rating simulado

  const pageCount = book.pageCount || 300
  const hasGenreMatch = userBooks.some((b) =>
    b.genre
      ?.toLowerCase()
      .includes(book.categories?.[0]?.toLowerCase() || '')
  )

  // Lógica simulada de scoring
  const random = Math.random()

  // 40% probabilidad: Imprescindible (clásicos conocidos)
  if (random < 0.4 || (pageCount > 400 && book.categories?.includes('Classics'))) {
    return SMART_TAGS['must-read']
  }

  // 30% probabilidad: Tendencia (libros nuevos populares)
  if (random < 0.7) {
    return SMART_TAGS['trending']
  }

  // 20% probabilidad: Obra Maestra (género coincide y páginas moderadas)
  if (random < 0.9 || hasGenreMatch) {
    return SMART_TAGS['masterpiece']
  }

  // 10% probabilidad: Joya Oculta o Clásico
  if (pageCount > 450) {
    return SMART_TAGS['classic']
  }

  return SMART_TAGS['hidden-gem']
}

/**
 * Genera recomendaciones personalizadas basadas en preferencias del usuario
 * @param userBooks - Libros del usuario
 * @param candidateBooks - Libros para recomendar
 * @param maxRecommendations - Número máximo de recomendaciones
 * @returns Array de libros recomendados con Smart Tags
 */
export function generatePersonalizedRecommendations(
  userBooks: BookshelfBook[],
  candidateBooks: GoogleBook[],
  maxRecommendations: number = 3
): AIRecommendation[] {
  const preferences = analyzeUserGenrePreferences(userBooks)
  if (preferences.length === 0) {
    // Si no hay libros, mostrar tendencias generales
    return candidateBooks.slice(0, maxRecommendations).map((book) => ({
      book,
      smartTag: assignSmartTag(book, userBooks),
      reason: 'Libro popular en la comunidad literaria',
      matchScore: 0.75,
    }))
  }

  const userGenres = preferences.map((p) => p.genre.toLowerCase())
  const bookTitlesInShelf = userBooks.map((b) => b.title.toLowerCase())

  // Score basado en:
  // 1. Coincidencia de género
  // 2. No estar en el estante
  // 3. Popularidad
  const scoredBooks = candidateBooks
    .filter((book) => !bookTitlesInShelf.includes(book.title.toLowerCase()))
    .map((book) => {
      let score = 0.5 // Base score

      // Bonus por coincidencia de género
      const bookGenres = (book.categories || []).map((g) => g.toLowerCase())
      const genreMatch = bookGenres.some((bg) => userGenres.some((ug) => bg.includes(ug) || ug.includes(bg)))
      if (genreMatch) {
        score += 0.3
      }

      // Bonus por número de páginas (mejor contexto)
      if (book.pageCount && book.pageCount > 250) {
        score += 0.1
      }

      return { book, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, maxRecommendations)
    .map(({ book, score }) => ({
      book,
      smartTag: assignSmartTag(book, userBooks),
      reason:
        score > 0.7
          ? `Coincide con tu gusto por ${userGenres[0] || 'buena literatura'}`
          : `Libro popular para lectores como tú`,
      matchScore: score,
    }))

  console.log('🤖 Recomendaciones generadas:', scoredBooks.map((r) => r.book.title))
  return scoredBooks
}

/**
 * FUTURO: Conectar a OpenAI/Anthropic API
 * Esta función será reemplazada con una llamada real a la API cuando esté configurada
 */
export async function getAIRecommendationsFromAPI(
  _userBooks: BookshelfBook[],
  _candidateBooks: GoogleBook[]
): Promise<AIRecommendation[]> {
  // TODO: Implementar cuando se configure la API key
  // const response = await fetch('https://api.openai.com/v1/chat/completions', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
  //   },
  //   body: JSON.stringify({
  //     model: 'gpt-4',
  //     messages: [
  //       {
  //         role: 'system',
  //         content: 'Eres un experto asesor literario. Analiza el perfil del usuario y recomienda libros.',
  //       },
  //       {
  //         role: 'user',
  //         content: `Usuario tiene estos libros: ${_userBooks.map((b) => b.title).join(', ')}. Recomienda 3 de estos: ${_candidateBooks.map((b) => b.title).join(', ')}`,
  //       },
  //     ],
  //   }),
  // })

  // Por ahora, retorna vacío hasta que se configure
  return []
}

/**
 * Simula un análisis de lectura para generar insights
 */
export function generateReadingInsights(books: BookshelfBook[]): {
  totalBooks: number
  completedBooks: number
  averagePageCount: number
  favoriteGenre: string | null
  readingStreak: number
} {
  const completed = books.filter((b) => b.status === 'completed')
  const totalPages = completed.reduce((sum, b) => sum + (b.totalPages || 0), 0)

  return {
    totalBooks: books.length,
    completedBooks: completed.length,
    averagePageCount: completed.length > 0 ? Math.round(totalPages / completed.length) : 0,
    favoriteGenre: getFavoriteGenre(books),
    readingStreak: 7, // Simulado por ahora
  }
}
