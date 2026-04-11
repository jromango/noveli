// Categorías editoriales estrictas para Círculo Noveli
export const BOOK_CATEGORIES = [
  { id: 'ficcion', label: 'Ficción', emoji: '📖' },
  { id: 'novela-negra', label: 'Novela Negra', emoji: '🔍' },
  { id: 'thriller', label: 'Thriller', emoji: '⚡' },
  { id: 'suspense', label: 'Suspense', emoji: '😰' },
  { id: 'novela-historica', label: 'Novela Histórica', emoji: '🕰️' },
  { id: 'romantica', label: 'Romántica', emoji: '💕' },
  { id: 'ciencia-ficcion', label: 'Ciencia Ficción', emoji: '🚀' },
  { id: 'distopia', label: 'Distopía', emoji: '🌪️' },
  { id: 'aventuras', label: 'Aventuras', emoji: '🏔️' },
  { id: 'fantasia', label: 'Fantasía', emoji: '✨' },
  { id: 'contemporaneo', label: 'Contemporáneo', emoji: '🏙️' },
  { id: 'terror', label: 'Terror', emoji: '👻' },
  { id: 'paranormal', label: 'Paranormal', emoji: '🔮' },
  { id: 'poesia', label: 'Poesía', emoji: '🎭' },
  { id: 'juvenil', label: 'Juvenil', emoji: '🎒' },
  { id: 'infantil', label: 'Infantil', emoji: '🧸' },
  { id: 'autoayuda', label: 'Autoayuda', emoji: '💪' },
  { id: 'biografias', label: 'Biografías', emoji: '📝' },
]

// Mapeo de categorías a términos de búsqueda
const categoryQueries: { [key: string]: string } = {
  'ficcion': 'fiction',
  'novela-negra': 'detective mystery noir',
  'thriller': 'thriller suspense',
  'suspense': 'suspense drama',
  'novela-historica': 'historical fiction',
  'romantica': 'romance love',
  'ciencia-ficcion': 'science fiction',
  'distopia': 'dystopian dystopia',
  'aventuras': 'adventure',
  'fantasia': 'fantasy magic',
  'contemporaneo': 'contemporary modern',
  'terror': 'horror scary',
  'paranormal': 'paranormal supernatural',
  'poesia': 'poetry poems',
  'juvenil': 'young adult YA',
  'infantil': 'children kids',
  'autoayuda': 'self help personal development',
  'biografias': 'biography autobiography memoir',
}

export function getCategoryQuery(categoryId: string): string {
  return categoryQueries[categoryId] || categoryId
}
