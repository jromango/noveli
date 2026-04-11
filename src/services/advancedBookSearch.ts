import { GoogleBook, searchBooks } from './googleBooks'

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes'

export interface BookWithMetadata extends GoogleBook {
  publishedDate?: string
  synopsis?: string
  isbn?: string
}

/**
 * Search books with Spanish language restriction and newest content
 * Amplia búsqueda con maxResults=10 y debugging
 */
export async function searchLatestSpanishBooks(query: string): Promise<BookWithMetadata[]> {
  if (!query.trim()) return []

  try {
    const encodedQuery = encodeURIComponent(query)
    const url = `${GOOGLE_BOOKS_API}?q=${encodedQuery}&langRestrict=es&orderBy=newest&maxResults=10&printType=books`

    console.log('🔍 Búsqueda avanzada español - URL:', url)

    const response = await fetch(url)

    if (!response.ok) {
      console.error(`❌ Error HTTP ${response.status} en búsqueda avanzada`)
      throw new Error('Error searching books')
    }

    const data = await response.json()
    console.log(`📚 Búsqueda avanzada: ${data.items?.length || 0} resultados`)

    if (!data.items || data.items.length === 0) {
      console.warn(`⚠️ Sin resultados para: "${query}" - Intenta con el nombre del autor`)
      return []
    }

    const results = data.items
      .map((item: any) => {
        const volumeInfo = item.volumeInfo
        return {
          id: item.id,
          title: volumeInfo.title,
          author: volumeInfo.authors?.[0] || 'Autor desconocido',
          thumbnail: volumeInfo.imageLinks?.thumbnail || null,
          pageCount: volumeInfo.pageCount || 0,
          publishedDate: volumeInfo.publishedDate,
          synopsis: volumeInfo.description,
          isbn: volumeInfo.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')
            ?.identifier,
        }
      })
      .filter((book: BookWithMetadata) => book.title && book.author !== 'Autor desconocido')

    console.log(`✅ ${results.length} libros válidos después del filtro`)
    return results
  } catch (error) {
    console.error('❌ Error fetching Spanish books:', error)
    return []
  }
}

/**
 * Search by ISBN/EAN code
 */
export async function searchByISBN(isbn: string): Promise<BookWithMetadata | null> {
  try {
    const encodedISBN = encodeURIComponent(isbn)
    const url = `${GOOGLE_BOOKS_API}?q=isbn:${encodedISBN}&maxResults=1`

    console.log('📖 Buscando por ISBN:', isbn)

    const response = await fetch(url)

    if (!response.ok) {
      console.error(`❌ Error HTTP ${response.status} en búsqueda ISBN`)
      throw new Error('Error searching by ISBN')
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      console.warn(`⚠️ ISBN no encontrado: ${isbn}`)
      return null
    }

    const item = data.items[0]
    const volumeInfo = item.volumeInfo

    const book = {
      id: item.id,
      title: volumeInfo.title,
      author: volumeInfo.authors?.[0] || 'Autor desconocido',
      thumbnail: volumeInfo.imageLinks?.thumbnail || null,
      pageCount: volumeInfo.pageCount || 0,
      publishedDate: volumeInfo.publishedDate,
      synopsis: volumeInfo.description,
      isbn: isbn,
    }

    console.log(`✅ Libro encontrado por ISBN: ${book.title}`)
    return book
  } catch (error) {
    console.error('❌ Error searching by ISBN:', error)
    return null
  }
}
