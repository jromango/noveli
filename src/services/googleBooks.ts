import { searchOpenLibrary } from './openLibraryBooks'

export interface GoogleBook {
  id: string
  title: string
  author: string
  thumbnail: string | null
  pageCount?: number
  categories?: string[]
  publishedDate?: string
  description?: string
  externalBookId?: string
  source?: 'google' | 'local'
  inLibrary?: boolean
  fromAI?: boolean
  aiDescription?: string
}

export class GoogleBooksError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'GoogleBooksError'
    this.status = status
  }
}

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes'

function normalizeGoogleImage(url?: string | null): string | null {
  if (!url) return null

  return url
    .replace('http://', 'https://')
    .replace('&edge=curl', '')
    .replace('&zoom=5', '')
}

function getBestGoogleThumbnail(imageLinks?: Record<string, string>): string | null {
  if (!imageLinks) return null

  return normalizeGoogleImage(
    imageLinks.extraLarge
      || imageLinks.large
      || imageLinks.medium
      || imageLinks.small
      || imageLinks.thumbnail
      || imageLinks.smallThumbnail
      || null,
  )
}

export async function searchBooks(query: string): Promise<GoogleBook[]> {
  if (!query || query.trim().length < 2) {
    console.log('❌ Query muy corto (< 2 caracteres). Ignorando.')
    return []
  }

  const cleanQuery = query.trim()
  console.log('🔍 Buscando:', cleanQuery)

  try {
    const url = `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(cleanQuery)}&printType=books&projection=full&orderBy=relevance&maxResults=24`

    console.log('📡 URL de API:', url)

    const response = await fetch(url)
    console.log('📊 Status HTTP:', response.status, response.statusText)

    if (!response.ok) {
      console.error(`❌ Error HTTP ${response.status}:`, response.statusText)
      throw new GoogleBooksError(
        response.status === 429
          ? 'Too Many Requests'
          : `${response.status} ${response.statusText}`,
        response.status,
      )
    }

    const data = await response.json()
    console.log('📥 Respuesta API:', data)
    console.log(`📚 Total de items en respuesta:`, data.items?.length || 0)

    if (!data.items || data.items.length === 0) {
      console.warn(`⚠️ API retornó 0 items para: "${cleanQuery}"`)
      return []
    }

    const books = data.items
      .map((item: any) => {
        const volumeInfo = item.volumeInfo || {}
        const book: GoogleBook = {
          id: item.id || Math.random().toString(),
          title: volumeInfo.title || 'Sin título',
          author: volumeInfo.authors?.[0] || 'Autor desconocido',
          thumbnail: getBestGoogleThumbnail(volumeInfo.imageLinks),
          pageCount: volumeInfo.pageCount || 0,
          categories: volumeInfo.categories || [],
          publishedDate: volumeInfo.publishedDate || undefined,
          description: volumeInfo.description || undefined,
          externalBookId: item.id || undefined,
          source: 'google',
        }
        return book
      })
      .filter((book: GoogleBook) => {
        // Mostrar TODOS - sin filtros estrictos
        const isValid = book.title && book.title !== 'Sin título'
        if (!isValid) console.log('⊘ Filtrado (sin título):', book)
        return isValid
      })

    console.log(`✅ ${books.length} libros después del filtro`)
    console.log('📖 Libros encontrados:', books)

    return books
  } catch (error) {
    console.error('❌ Error en searchBooks:', error)

    try {
      console.warn('⚠️ Fallback automático a Open Library...')
      const fallbackBooks = await searchOpenLibrary(cleanQuery)
      return fallbackBooks.map((book) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        thumbnail: book.thumbnail,
        pageCount: book.pageCount,
        categories: [],
        publishedDate: book.publishedDate,
        description: book.description,
        externalBookId: book.isbn || book.id,
        source: 'google',
      }))
    } catch (fallbackError) {
      console.error('❌ Open Library también falló:', fallbackError)
    }

    if (error instanceof GoogleBooksError) {
      throw error
    }
    throw new GoogleBooksError('Error de red', 0)
  }
}
