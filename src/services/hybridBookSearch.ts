import { searchBooks, GoogleBook, GoogleBooksError } from './googleBooks'
import { searchOpenLibrary, OpenLibraryBook, OpenLibraryError } from './openLibraryBooks'
import { searchLocalBooks, LocalBook } from './localBookSearch'

export interface UnifiedBook {
  id: string
  title: string
  author: string
  thumbnail: string | null
  pageCount?: number
  source: 'google' | 'openlibrary' | 'local' | 'gemini'
  reason?: string
}

export async function hybridBookSearch(query: string): Promise<UnifiedBook[]> {
  if (!query || query.trim().length < 3) {
    console.log('❌ [Hybrid] Query muy corto (< 3 caracteres). Ignorando.')
    return []
  }

  const cleanQuery = query.trim()
  console.log('🔄 [Hybrid] Iniciando búsqueda híbrida para:', cleanQuery)

  const allBooks: UnifiedBook[] = []

  // PASO 1: Buscar localmente
  console.log('📍 [Hybrid] PASO 1: Buscando en base de datos local...')
  try {
    const localBooks = await searchLocalBooks(cleanQuery)
    const unifiedLocal = localBooks.map((book: LocalBook) => ({
      ...book,
      source: 'local' as const,
    }))
    allBooks.push(...unifiedLocal)
    console.log(`✅ [Hybrid] ${unifiedLocal.length} libros encontrados localmente`)
  } catch (error) {
    console.error('⚠️ [Hybrid] Error en búsqueda local:', error)
  }

  // PASO 2: Intentar Google Books primero
  console.log('📍 [Hybrid] PASO 2: Intentando Google Books...')
  try {
    const googleBooks = await searchBooks(cleanQuery)
    const unifiedGoogle = googleBooks.map((book: GoogleBook) => ({
      ...book,
      source: 'google' as const,
    }))
    allBooks.push(...unifiedGoogle)
    console.log(`✅ [Hybrid] ${unifiedGoogle.length} libros encontrados en Google Books`)
    return allBooks // Si Google funciona, retornamos todo
  } catch (error) {
    if (error instanceof GoogleBooksError && error.status === 429) {
      console.warn('⚠️ [Hybrid] Google Books: Error 429 (Too Many Requests)')
    } else {
      console.warn('⚠️ [Hybrid] Google Books falló:', error)
    }
  }

  // PASO 3: Fallback a Open Library si Google falla
  console.log('📍 [Hybrid] PASO 3: Fallback a Open Library...')
  try {
    const openLibBooks = await searchOpenLibrary(cleanQuery)
    const unifiedOpenLib = openLibBooks.map((book: OpenLibraryBook) => ({
      ...book,
      source: 'openlibrary' as const,
    }))
    allBooks.push(...unifiedOpenLib)
    console.log(`✅ [Hybrid] ${unifiedOpenLib.length} libros encontrados en Open Library`)
  } catch (error) {
    console.error('❌ [Hybrid] Open Library también falló:', error)
  }

  console.log(`🎯 [Hybrid] Total de libros encontrados: ${allBooks.length}`)
  return allBooks
}

export function isGoogleBooksError429(error: unknown): boolean {
  return error instanceof GoogleBooksError && error.status === 429
}

export function isOpenLibraryError(error: unknown): boolean {
  return error instanceof OpenLibraryError
}
