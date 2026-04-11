import { GoogleBook } from '../services/googleBooks'
import { BOOK_CATEGORIES } from './bookCategories'

/**
 * Soft category filter - doesn't block results, just prioritizes them visually
 * Todos los libros se muestran, pero los de géneros definidos se marcan
 */
export interface BookWithCategoryMatch extends GoogleBook {
  matchedCategory?: string
  categoryMatch: boolean
}

/**
 * Check if a book likely belongs to a specific category based on title/author patterns
 * This is a soft match - not definitive
 */
function matchCategoryPatterns(book: GoogleBook, categoryId: string): boolean {
  const title = (book.title || '').toLowerCase()
  const author = (book.author || '').toLowerCase()

  const patterns: { [key: string]: RegExp[] } = {
    'ficcion': [/novela|ficción|trama|personaje/i],
    'novela-negra': [/crimen|detective|misterio|policía|homicidio|asesino/i],
    'thriller': [/suspenso|thriller|adrenalina|tensión|peligro/i],
    'suspense': [/suspenso|misterio|enigma|secreto|oculto/i],
    'novela-historica': [/histórico|época|siglo|pasado|revolución|guerra|antiguo/i],
    'romantica': [/amor|romance|corazón|pasión|enamorado|boda|amante/i],
    'ciencia-ficcion': [/futuro|distopia|espacio|ciencia|tecnología|alien|robótico/i],
    'distopia': [/distopía|futuro oscuro|gobierno totalitario|apocalipsis/i],
    'aventuras': [/aventura|viaje|exploración|peligro|acción/i],
    'fantasia': [/fantasía|magia|hechizo|dragón|reino|criatura mitológica/i],
    'contemporaneo': [/moderno|actual|presente|vida|sociedad|relación/i],
    'terror': [/horror|miedo|terror|sobrenatural|espíritu|fantasma/i],
    'paranormal': [/paranormal|sobrenatural|espíritu|poltergeist|misterio/i],
    'poesia': [/poesía|poema|verso|lírica|rima/i],
    'juvenil': [/joven|adolescente|ado|escuela|instituto/i],
    'infantil': [/niño|infantil|cuento|hada|princesa/i],
    'autoayuda': [/autoayuda|desarrollo personal|vida|hábitos|mejorar/i],
    'biografias': [/biografía|vida|autobiografía|memorias|historia personal/i],
  }

  const categoryPatterns = patterns[categoryId] || []
  return categoryPatterns.some((pattern) => pattern.test(title) || pattern.test(author))
}

/**
 * Soft filter - adds category match info but doesn't exclude anything
 */
export function applySoftCategoryFilter(
  books: GoogleBook[],
  categoryId?: string,
): BookWithCategoryMatch[] {
  if (!categoryId) {
    // No category filter - mark all as having potential matches
    return books.map((book) => ({
      ...book,
      categoryMatch: false,
    }))
  }

  return books.map((book) => ({
    ...book,
    categoryMatch: matchCategoryPatterns(book, categoryId),
    matchedCategory: matchCategoryPatterns(book, categoryId) ? categoryId : undefined,
  }))
}

/**
 * Sort books - matched categories first, then others
 */
export function sortByCategoryMatch(
  books: BookWithCategoryMatch[],
): BookWithCategoryMatch[] {
  return [...books].sort((a, b) => {
    // Priority to category matches
    if (a.categoryMatch && !b.categoryMatch) return -1
    if (!a.categoryMatch && b.categoryMatch) return 1
    return 0
  })
}
