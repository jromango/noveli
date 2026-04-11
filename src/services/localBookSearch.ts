import { supabase } from '../lib/supabaseClient'

export interface LocalBook {
  id: string
  title: string
  author: string
  thumbnail: string | null
  pageCount?: number
}

export async function searchLocalBooks(query: string): Promise<LocalBook[]> {
  if (!query || query.trim().length < 3) {
    console.log('❌ Query muy corto (< 3 caracteres). Ignorando.')
    return []
  }

  const cleanQuery = query.trim()
  console.log('🏠 [Local] Buscando en bookshelf:', cleanQuery)

  try {
    // Buscar en la tabla bookshelf por título o autor
    const { data, error } = await supabase
      .from('bookshelf')
      .select('id, title, author, cover_url, total_pages')
      .or(`title.ilike.%${cleanQuery}%,author.ilike.%${cleanQuery}%`)

    if (error) {
      console.error('❌ [Local] Error en consulta:', error)
      throw error
    }

    console.log(`📚 [Local] ${data?.length || 0} libros encontrados en el estante`)

    const books: LocalBook[] = (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      author: item.author,
      thumbnail: item.cover_url,
      pageCount: item.total_pages,
    }))

    console.log('📖 [Local] Libros encontrados:', books)
    return books
  } catch (error) {
    console.error('❌ [Local] Error:', error)
    return []
  }
}
