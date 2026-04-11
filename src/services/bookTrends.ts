import { GoogleBook, searchBooks } from './googleBooks'

export const BOOK_GENRES = [
  { id: 'fiction', label: 'Ficción', emoji: '📖' },
  { id: 'mystery', label: 'Misterio', emoji: '🔍' },
  { id: 'romance', label: 'Romance', emoji: '💕' },
  { id: 'scifi', label: 'Ciencia Ficción', emoji: '🚀' },
  { id: 'fantasy', label: 'Fantasía', emoji: '✨' },
  { id: 'biography', label: 'Biografía', emoji: '👤' },
]

const CHILE_TREND_QUERIES = [
  { query: 'Fabricante de lagrimas Erin Doom', category: 'Romance' },
  { query: 'Alas de sangre Rebecca Yarros', category: 'Romance' },
  { query: 'La paciente silenciosa Alex Michaelides', category: 'Thriller' },
  { query: 'Todo arde Juan Gomez Jurado', category: 'Thriller' },
  { query: 'El priorato del naranjo Samantha Shannon', category: 'Fantasia' },
  { query: 'Tres meses Joana Marcus', category: 'Aventura' },
]

const FALLBACK_CHILE_BOOKS: GoogleBook[] = [
  {
    id: 'chile-fabricante-lagrimas',
    title: 'Fabricante de lágrimas',
    author: 'Erin Doom',
    thumbnail: 'https://covers.openlibrary.org/b/title/Fabricante%20de%20lagrimas-L.jpg',
    pageCount: 560,
    categories: ['Romance'],
  },
  {
    id: 'chile-alas-sangre',
    title: 'Alas de Sangre',
    author: 'Rebecca Yarros',
    thumbnail: 'https://covers.openlibrary.org/b/title/Fourth%20Wing-L.jpg',
    pageCount: 760,
    categories: ['Romance', 'Fantasia'],
  },
  {
    id: 'chile-paciente-silenciosa',
    title: 'La paciente silenciosa',
    author: 'Alex Michaelides',
    thumbnail: 'https://covers.openlibrary.org/b/title/The%20Silent%20Patient-L.jpg',
    pageCount: 336,
    categories: ['Thriller'],
  },
  {
    id: 'chile-todo-arde',
    title: 'Todo arde',
    author: 'Juan Gomez-Jurado',
    thumbnail: 'https://covers.openlibrary.org/b/title/Todo%20arde-L.jpg',
    pageCount: 480,
    categories: ['Thriller'],
  },
  {
    id: 'chile-priorato-naranjo',
    title: 'El Priorato del Naranjo',
    author: 'Samantha Shannon',
    thumbnail: 'https://covers.openlibrary.org/b/title/The%20Priory%20of%20the%20Orange%20Tree-L.jpg',
    pageCount: 804,
    categories: ['Fantasia'],
  },
  {
    id: 'chile-tres-meses',
    title: 'Tres meses',
    author: 'Joana Marcus',
    thumbnail: 'https://covers.openlibrary.org/b/title/Tres%20meses-L.jpg',
    pageCount: 448,
    categories: ['Aventura'],
  },
]

export async function getTrendingBooks(): Promise<GoogleBook[]> {
  try {
    console.log('🔍 Cargando tendencias Chile 2024 (catalogo curado)')

    const foundBooks = await Promise.all(
      CHILE_TREND_QUERIES.map(async (item) => {
        const matches = await searchBooks(item.query)
        const match = matches[0]
        if (!match) return null
        return {
          ...match,
          categories: match.categories && match.categories.length > 0 ? match.categories : [item.category],
        } as GoogleBook
      }),
    )

    const normalized = foundBooks.filter(Boolean) as GoogleBook[]

    if (normalized.length >= 4) {
      console.log(`✅ ${normalized.length} tendencias Chile encontradas por API`)
      return normalized.slice(0, 8)
    }

    console.warn('⚠️ API devolvio pocos resultados; usando fallback curado Chile 2024')
    return FALLBACK_CHILE_BOOKS
  } catch (error) {
    console.error('❌ Error fetching trending:', error)
    return FALLBACK_CHILE_BOOKS
  }
}

export async function searchByGenre(genre: string): Promise<GoogleBook[]> {
  const genreQueries: { [key: string]: string } = {
    fiction: 'fiction',
    mystery: 'mystery thriller',
    romance: 'romance love',
    scifi: 'science fiction',
    fantasy: 'fantasy magic',
    biography: 'biography autobiography',
  }

  return searchBooks(genreQueries[genre] || genre)
}
