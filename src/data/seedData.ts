export interface SeedBook {
  id: string
  title: string
  author: string
  cover_url: string
  current_page: number
  total_pages: number
}

export interface SeedFeedPost {
  id: string
  type: 'milestone' | 'rating' | 'review'
  text: string
  book_title?: string
  rating?: number
  review?: string
  created_at: string
}

export interface SeedUser {
  id: string
  display_name: string
  username: string
  avatar_url: string
  social_rank: 'Bibliotecario Noveli' | 'Cazador de Historias' | 'Lector Elite'
  medal_tier: 'gold-soft' | 'gold-bright' | 'gold-royal'
  medal_glow: number
  total_xp: number
  total_pages_read: number
  completed_books: number
  bookshelf: SeedBook[]
  feed_posts: SeedFeedPost[]
}

type BookBase = {
  id: string
  title: string
  author: string
  total_pages: number
  cover_url: string
}

const BOOK_POOL: BookBase[] = [
  { id: 'b1', title: 'Dracula', author: 'Bram Stoker', total_pages: 418, cover_url: 'https://covers.openlibrary.org/b/id/8235109-L.jpg' },
  { id: 'b2', title: '1984', author: 'George Orwell', total_pages: 328, cover_url: 'https://covers.openlibrary.org/b/id/153541-L.jpg' },
  { id: 'b3', title: 'Dune', author: 'Frank Herbert', total_pages: 544, cover_url: 'https://covers.openlibrary.org/b/id/8101356-L.jpg' },
  { id: 'b4', title: 'Frankenstein', author: 'Mary Shelley', total_pages: 280, cover_url: 'https://covers.openlibrary.org/b/id/7222246-L.jpg' },
  { id: 'b5', title: 'The Hobbit', author: 'J. R. R. Tolkien', total_pages: 310, cover_url: 'https://covers.openlibrary.org/b/id/6979861-L.jpg' },
  { id: 'b6', title: 'The Name of the Rose', author: 'Umberto Eco', total_pages: 536, cover_url: 'https://covers.openlibrary.org/b/id/8231990-L.jpg' },
  { id: 'b7', title: 'Fahrenheit 451', author: 'Ray Bradbury', total_pages: 194, cover_url: 'https://covers.openlibrary.org/b/id/9251996-L.jpg' },
  { id: 'b8', title: 'The Shadow of the Wind', author: 'Carlos Ruiz Zafon', total_pages: 576, cover_url: 'https://covers.openlibrary.org/b/id/8231856-L.jpg' },
  { id: 'b9', title: 'Pride and Prejudice', author: 'Jane Austen', total_pages: 432, cover_url: 'https://covers.openlibrary.org/b/id/8091016-L.jpg' },
  { id: 'b10', title: 'The Picture of Dorian Gray', author: 'Oscar Wilde', total_pages: 254, cover_url: 'https://covers.openlibrary.org/b/id/8225264-L.jpg' },
  { id: 'b11', title: 'The Little Prince', author: 'Antoine de Saint-Exupery', total_pages: 128, cover_url: 'https://covers.openlibrary.org/b/id/8232712-L.jpg' },
  { id: 'b12', title: 'The Alchemist', author: 'Paulo Coelho', total_pages: 208, cover_url: 'https://covers.openlibrary.org/b/id/8128691-L.jpg' },
  { id: 'b13', title: 'A Tale of Two Cities', author: 'Charles Dickens', total_pages: 489, cover_url: 'https://covers.openlibrary.org/b/id/7222161-L.jpg' },
  { id: 'b14', title: 'Moby Dick', author: 'Herman Melville', total_pages: 635, cover_url: 'https://covers.openlibrary.org/b/id/7222276-L.jpg' },
  { id: 'b15', title: 'Jane Eyre', author: 'Charlotte Bronte', total_pages: 507, cover_url: 'https://covers.openlibrary.org/b/id/8226191-L.jpg' },
  { id: 'b16', title: 'The Trial', author: 'Franz Kafka', total_pages: 255, cover_url: 'https://covers.openlibrary.org/b/id/8234143-L.jpg' },
  { id: 'b17', title: 'War and Peace', author: 'Leo Tolstoy', total_pages: 1225, cover_url: 'https://covers.openlibrary.org/b/id/7222241-L.jpg' },
  { id: 'b18', title: 'Wuthering Heights', author: 'Emily Bronte', total_pages: 416, cover_url: 'https://covers.openlibrary.org/b/id/7222167-L.jpg' },
  { id: 'b19', title: 'The Odyssey', author: 'Homer', total_pages: 560, cover_url: 'https://covers.openlibrary.org/b/id/8235231-L.jpg' },
  { id: 'b20', title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', total_pages: 671, cover_url: 'https://covers.openlibrary.org/b/id/8235124-L.jpg' },
  { id: 'b21', title: 'The Stranger', author: 'Albert Camus', total_pages: 185, cover_url: 'https://covers.openlibrary.org/b/id/10456658-L.jpg' },
  { id: 'b22', title: 'The Master and Margarita', author: 'Mikhail Bulgakov', total_pages: 470, cover_url: 'https://covers.openlibrary.org/b/id/10448774-L.jpg' },
  { id: 'b23', title: 'The Count of Monte Cristo', author: 'Alexandre Dumas', total_pages: 1276, cover_url: 'https://covers.openlibrary.org/b/id/10514443-L.jpg' },
  { id: 'b24', title: 'The Brothers Karamazov', author: 'Fyodor Dostoevsky', total_pages: 824, cover_url: 'https://covers.openlibrary.org/b/id/10521270-L.jpg' },
]

const USER_IDENTITIES = [
  { display_name: 'Valeria Montes', username: 'valeria_noveli', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' },
  { display_name: 'Nicolas Prado', username: 'nicolas_lecturas', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
  { display_name: 'Camila Duarte', username: 'camila_paginas', avatar_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop' },
  { display_name: 'Mateo Leiva', username: 'mateo_darkbooks', avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop' },
  { display_name: 'Isabela Rios', username: 'isabela_oraculo', avatar_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop' },
  { display_name: 'Lucas Salgado', username: 'lucas_biblioteca', avatar_url: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=200&h=200&fit=crop' },
  { display_name: 'Renata Vela', username: 'renata_resenas', avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop' },
  { display_name: 'Tomas Ferrer', username: 'tomas_historia', avatar_url: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=200&h=200&fit=crop' },
  { display_name: 'Abril Cardenas', username: 'abril_gotica', avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop' },
  { display_name: 'Santiago Mena', username: 'santiago_epico', avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop' },
  { display_name: 'Lucia Maren', username: 'lucia_nocturna', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop' },
  { display_name: 'Benjamin Soler', username: 'benjamin_pensador', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
  { display_name: 'Maia Escobar', username: 'maia_viaja_libros', avatar_url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&h=200&fit=crop' },
  { display_name: 'Joaquin Ares', username: 'joaquin_clasicos', avatar_url: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&h=200&fit=crop' },
  { display_name: 'Paula Neri', username: 'paula_versos', avatar_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&h=200&fit=crop' },
  { display_name: 'Emilio Luna', username: 'emilio_archivo', avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop' },
  { display_name: 'Ines Vidal', username: 'ines_brilho', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop' },
  { display_name: 'Bruno Nassar', username: 'bruno_tinta', avatar_url: 'https://images.unsplash.com/photo-1546961329-78bef0414d7c?w=200&h=200&fit=crop' },
  { display_name: 'Daniela Toral', username: 'daniela_mitos', avatar_url: 'https://images.unsplash.com/photo-1542204625-de293a675ee2?w=200&h=200&fit=crop' },
  { display_name: 'Gael Roman', username: 'gael_marcapaginas', avatar_url: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=200&h=200&fit=crop' },
]

function clampPercent(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function buildBookshelf(userIndex: number): SeedBook[] {
  const size = 5 + (userIndex % 6)
  const completedTarget = 2 + (userIndex % 4)
  const books: SeedBook[] = []

  for (let i = 0; i < size; i += 1) {
    const base = BOOK_POOL[(userIndex * 3 + i) % BOOK_POOL.length]
    const isCompleted = i < completedTarget

    let currentPage = base.total_pages
    if (!isCompleted) {
      const readingPercent = clampPercent(30 + ((userIndex + i) % 21), 30, 50)
      currentPage = Math.round((base.total_pages * readingPercent) / 100)
    }

    books.push({
      id: `${base.id}-u${userIndex + 1}`,
      title: base.title,
      author: base.author,
      cover_url: base.cover_url,
      current_page: currentPage,
      total_pages: base.total_pages,
    })
  }

  return books
}

function calculateXp(bookshelf: SeedBook[]): { totalXp: number; pagesRead: number; completed: number } {
  const pagesRead = bookshelf.reduce((sum, book) => sum + book.current_page, 0)
  const completed = bookshelf.filter((book) => book.current_page >= book.total_pages).length

  // Formula solicitada:
  // 10 XP por libro agregado + 50 XP por libro terminado + 1 XP por pagina leida
  const totalXp = bookshelf.length * 10 + completed * 50 + pagesRead

  return { totalXp, pagesRead, completed }
}

function getSocialRank(totalXp: number): SeedUser['social_rank'] {
  if (totalXp >= 2600) return 'Lector Elite'
  if (totalXp >= 1500) return 'Cazador de Historias'
  return 'Bibliotecario Noveli'
}

function buildFeedPosts(user: { username: string; display_name: string }, bookshelf: SeedBook[], pagesRead: number, userIndex: number): SeedFeedPost[] {
  const completedBook = bookshelf.find((book) => book.current_page >= book.total_pages) || bookshelf[0]
  const readingBook = bookshelf.find((book) => book.current_page < book.total_pages) || bookshelf[0]
  const milestone = Math.max(600, Math.round(pagesRead / 100) * 100)

  const reviews = [
    'Una atmosfera gotica insuperable, me atrapo desde la pagina 1.',
    'Prosa elegante y ritmo impecable, imposible de soltar.',
    'Construccion de mundo excelente y personajes memorables.',
    'Final potente, de esos que te dejan pensando varios dias.',
    'Un clasico que sigue sintiendose moderno y afilado.',
  ]

  return [
    {
      id: `p-${userIndex + 1}-1`,
      type: 'milestone',
      text: `${user.username} acaba de alcanzar las ${milestone} paginas leidas.`,
      created_at: '2026-04-07T10:20:00.000Z',
    },
    {
      id: `p-${userIndex + 1}-2`,
      type: 'rating',
      text: `${user.username} califico con 5 estrellas a ${completedBook.title}.`,
      book_title: completedBook.title,
      rating: 5,
      review: reviews[(userIndex + 1) % reviews.length],
      created_at: '2026-04-07T11:30:00.000Z',
    },
    {
      id: `p-${userIndex + 1}-3`,
      type: 'review',
      text: `${user.display_name} esta leyendo ${readingBook.title} y compartio una resena breve.`,
      book_title: readingBook.title,
      review: `Basado en su avance actual (${readingBook.current_page}/${readingBook.total_pages}), comenta: ${reviews[(userIndex + 3) % reviews.length]}`,
      created_at: '2026-04-07T13:10:00.000Z',
    },
  ]
}

function getMedalTier(glow: number): SeedUser['medal_tier'] {
  if (glow >= 0.86) return 'gold-royal'
  if (glow >= 0.64) return 'gold-bright'
  return 'gold-soft'
}

const generatedUsers = USER_IDENTITIES.map((identity, index) => {
  const bookshelf = buildBookshelf(index)
  const { totalXp, pagesRead, completed } = calculateXp(bookshelf)
  const social_rank = getSocialRank(totalXp)
  const feed_posts = buildFeedPosts(identity, bookshelf, pagesRead, index)

  return {
    id: `seed-user-${index + 1}`,
    display_name: identity.display_name,
    username: identity.username,
    avatar_url: identity.avatar_url,
    social_rank,
    total_xp: totalXp,
    total_pages_read: pagesRead,
    completed_books: completed,
    bookshelf,
    feed_posts,
  }
})

const maxCompleted = Math.max(...generatedUsers.map((user) => user.completed_books))

export const seedUsers: SeedUser[] = generatedUsers.map((user) => {
  const medal_glow = Number((0.35 + (user.completed_books / maxCompleted) * 0.65).toFixed(2))
  return {
    ...user,
    medal_glow,
    medal_tier: getMedalTier(medal_glow),
  }
})

// Datos listos para mapear dashboard y comunidad.
export const seedDashboardUsers = seedUsers

export const seedCommunityFeed = seedUsers.flatMap((user) =>
  user.feed_posts.map((post) => ({
    ...post,
    username: user.username,
    display_name: user.display_name,
    avatar_url: user.avatar_url,
    social_rank: user.social_rank,
    medal_tier: user.medal_tier,
  }))
)
