export interface OpenLibraryBook {
  id: string
  title: string
  author: string
  thumbnail: string | null
  pageCount?: number
  isbn?: string
  publishedDate?: string
  description?: string
}

const OPENLIBRARY_API = 'https://openlibrary.org/search.json'
const OPENLIBRARY_COVERS = 'https://covers.openlibrary.org/b'

export class OpenLibraryError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'OpenLibraryError'
    this.status = status
  }
}

export async function searchOpenLibrary(query: string): Promise<OpenLibraryBook[]> {
  if (!query || query.trim().length < 2) {
    console.log('❌ Query muy corto (< 2 caracteres). Ignorando.')
    return []
  }

  const cleanQuery = query.trim()
  console.log('📖 [Open Library] Buscando:', cleanQuery)

  try {
    const url = `${OPENLIBRARY_API}?q=${encodeURIComponent(cleanQuery)}&limit=20`
    console.log('📡 [Open Library] URL:', url)

    const response = await fetch(url)
    console.log('📊 [Open Library] Status HTTP:', response.status, response.statusText)

    if (!response.ok) {
      console.error(`❌ [Open Library] Error HTTP ${response.status}:`, response.statusText)
      throw new OpenLibraryError(
        `${response.status} ${response.statusText}`,
        response.status,
      )
    }

    const data = await response.json()
    console.log('📥 [Open Library] Respuesta:', data)
    console.log(`📚 [Open Library] Total de items:`, data.docs?.length || 0)

    if (!data.docs || data.docs.length === 0) {
      console.warn(`⚠️ [Open Library] Sin resultados para: "${cleanQuery}"`)
      return []
    }

    const books = data.docs
      .map((doc: any) => {
        // Obtener portada: primero por cover_i (más fiable), luego por ISBN
        let thumbnail: string | null = null
        if (doc.cover_i) {
          thumbnail = `${OPENLIBRARY_COVERS}/id/${doc.cover_i}-L.jpg`
        } else if (doc.isbn && doc.isbn.length > 0) {
          thumbnail = `${OPENLIBRARY_COVERS}/isbn/${doc.isbn[0]}-L.jpg`
        }

        const book: OpenLibraryBook = {
          id: doc.key || `openlibrary-${Math.random().toString()}`,
          title: doc.title || 'Sin título',
          author: doc.author_name?.[0] || 'Autor desconocido',
          thumbnail,
          pageCount: doc.number_of_pages_median || undefined,
          isbn: doc.isbn?.[0],
          publishedDate: doc.first_publish_year ? String(doc.first_publish_year) : undefined,
          description: doc.subject?.slice(0, 5)?.join(', ') || undefined,
        }
        return book
      })
      .filter((book: OpenLibraryBook) => {
        const isValid = book.title && book.title !== 'Sin título'
        if (!isValid) console.log('⊘ [Open Library] Filtrado (sin título):', book)
        return isValid
      })

    console.log(`✅ [Open Library] ${books.length} libros después del filtro`)
    console.log('📖 [Open Library] Libros encontrados:', books)

    return books
  } catch (error) {
    console.error('❌ [Open Library] Error:', error)
    if (error instanceof OpenLibraryError) {
      throw error
    }
    throw new OpenLibraryError('Error de red', 0)
  }
}

// TODO: 
// - Implementar función para buscar libros en Open Library por título, autor o ISBN
// - Normalizar resultados al formato GoogleBook para integración con el resto de la app
// - Añadir soporte para obtener portada, autores, año, categorías y descripción
// - Manejar errores y estados de carga
// - Escribir pruebas unitarias para los métodos principales
// - Documentar ejemplos de uso en comentarios
