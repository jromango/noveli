import { supabase } from '../lib/supabaseClient'

export interface BookshelfBook {
  id: string
  title: string
  author: string
  cover: string | null
  externalBookId?: string
  progress: number
  totalPages: number
  currentPage: number
  created_at: string
  publishedDate?: string
  synopsis?: string
  status: 'pending' | 'reading' | 'completed'
  genre?: string
}

export interface Note {
  id: string
  title: string
  author: string
  thumbnail: string | null
  notes: string
  created_at: string
  rating: number
  isPublic: boolean
  bookId: string
  user_id?: string
  username?: string
}

export interface UserProfile {
  id: string
  xp: number
  rank: string
  username?: string
  avatar_url?: string
  bio?: string
  is_private?: boolean
  created_at: string
  followersCount?: number
  followingCount?: number
}

export interface ReaderProfile extends UserProfile {
  isFollowing?: boolean
}

export interface FollowedTitle {
  id: string
  title: string
  author: string
  cover_url?: string | null
  created_at: string
}

// Verificar conexión a Supabase
export async function verifySupabaseConnection(): Promise<boolean> {
  try {
    console.log('🔌 Verificando conexión a Supabase...')
    const { data: { session }, error } = await supabase.auth.getSession()
    console.log('✅ Conexión a Supabase verificada')
    return true
  } catch (error) {
    console.error('❌ Error al verificar conexión a Supabase:', error)
    return false
  }
}

async function getCurrentUserId(): Promise<string | null> {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session?.user) {
    console.warn('⚠️ Usuario no autenticado para operación de base de datos')
    return null
  }
  return session.user.id
}

// Bookshelf operations
function mapBookshelfRow(row: any): BookshelfBook {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    cover: row.cover_url ?? null,
    externalBookId: row.external_book_id,
    totalPages: row.total_pages,
    progress: row.progress ?? 0,
    currentPage: row.current_page ?? 0,
    created_at: row.created_at,
    publishedDate: row.published_date,
    synopsis: row.synopsis,
    status: row.status ?? 'pending',
    genre: row.genre,
  }
}

export async function getBookshelfBooks(): Promise<BookshelfBook[]> {
  try {
    console.log('📚 Obteniendo libros del estante...')
    const userId = await getCurrentUserId()
    if (!userId) return []

    const { data, error } = await supabase
      .from('bookshelf')
      .select('id, title, author, cover_url, external_book_id, genre, status, progress, total_pages, current_page, published_date, synopsis, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    const rows = (data || []) as any[]
    const books = rows.map(mapBookshelfRow)
    console.log(`✅ ${books.length || 0} libros encontrados en el estante`)
    return books
  } catch (error) {
    console.error('❌ Error obteniendo estante:', error)
    return []
  }
}

export async function searchBookshelfByQuery(query: string): Promise<BookshelfBook[]> {
  try {
    const trimmed = query.trim()
    if (trimmed.length < 2) return []

    const userId = await getCurrentUserId()
    if (!userId) return []

    const { data, error } = await supabase
      .from('bookshelf')
      .select('id, title, author, cover_url, external_book_id, genre, status, progress, total_pages, current_page, published_date, synopsis, created_at')
      .eq('user_id', userId)
      .or(`title.ilike.%${trimmed}%,author.ilike.%${trimmed}%`)
      .order('created_at', { ascending: false })
      .limit(8)

    if (error) throw error
    return ((data || []) as any[]).map(mapBookshelfRow)
  } catch (error) {
    console.error('❌ Error buscando en biblioteca:', error)
    return []
  }
}

export async function saveBook(
  book: Omit<BookshelfBook, 'id' | 'created_at' | 'progress' | 'currentPage' | 'status'>,
): Promise<BookshelfBook | null> {
  try {
    console.log('💾 Guardando libro:', book.title)

    const userId = await getCurrentUserId()
    if (!userId) {
      throw new Error('Inicia sesión para guardar libros.')
    }

    const currentPage = book.currentPage || (book.totalPages > 0 ? 1 : 0)
    const progress = book.totalPages > 0 ? Math.round((currentPage / book.totalPages) * 100) : 0

    const payload: any = {
      title: book.title,
      author: book.author,
      cover_url: book.cover,
      total_pages: book.totalPages,
      genre: book.genre,
      current_page: currentPage,
      progress,
      status: 'reading',
      user_id: userId,
      published_date: book.publishedDate,
      synopsis: book.synopsis,
    }

    if (book.externalBookId) {
      payload.external_book_id = book.externalBookId
    }

    let insertResult = await supabase
      .from('bookshelf')
      .insert([payload])
      .select()
      .single()

    if (insertResult.error && payload.external_book_id && `${insertResult.error.message}`.includes('external_book_id')) {
      delete payload.external_book_id
      insertResult = await supabase
        .from('bookshelf')
        .insert([payload])
        .select()
        .single()
    }

    const { data, error } = insertResult

    if (error) {
      console.error('❌ Error al guardar libro en Supabase:', error)
      throw error
    }
    console.log('✅ Libro guardado exitosamente:', data?.id)
    return mapBookshelfRow(data)
  } catch (error) {
    console.error('❌ Error guardando libro:', error)
    return null
  }
}

export async function updateBookProgress(bookId: string, currentPage: number, status?: BookshelfBook['status']): Promise<boolean> {
  try {
    console.log('📖 Actualizando progreso del libro:', bookId, 'página:', currentPage)

    const userId = await getCurrentUserId()
    if (!userId) return false

    // Primero obtener el libro para calcular el progreso
    const { data: book, error: fetchError } = await supabase
      .from('bookshelf')
      .select('total_pages')
      .eq('id', bookId)
      .eq('user_id', userId)
      .single()

    if (fetchError) throw fetchError

    const progress = Math.round((currentPage / book.total_pages) * 100)
    const updateData: any = { current_page: currentPage, progress }

    if (status) {
      updateData.status = status
    }

    const { error } = await supabase
      .from('bookshelf')
      .update(updateData)
      .eq('id', bookId)
      .eq('user_id', userId)

    if (error) throw error
    console.log('✅ Progreso actualizado:', progress + '%')
    return true
  } catch (error) {
    console.error('❌ Error actualizando progreso:', error)
    return false
  }
}

export async function deleteBookshelfBook(bookId: string): Promise<boolean> {
  try {
    console.log('🗑️ Eliminando libro del estante:', bookId)
    const userId = await getCurrentUserId()
    if (!userId) return false

    const { error } = await supabase
      .from('bookshelf')
      .delete()
      .eq('id', bookId)
      .eq('user_id', userId)

    if (error) throw error
    console.log('✅ Libro eliminado del estante')
    return true
  } catch (error) {
    console.error('❌ Error eliminando libro:', error)
    return false
  }
}

export async function getBooksByGenre(genre?: string): Promise<BookshelfBook[]> {
  try {
    console.log('📚 Obteniendo libros por género:', genre || 'todos')
    const userId = await getCurrentUserId()
    if (!userId) return []

    let query = supabase
      .from('bookshelf')
      .select('id, title, author, cover_url, genre, status, progress, total_pages, current_page, published_date, synopsis, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (genre) {
      query = query.eq('genre', genre)
    }

    const { data, error } = await query
    if (error) throw error

    const rows = (data || []) as any[]
    const books = rows.map(mapBookshelfRow)
    console.log(`✅ ${books.length || 0} libros encontrados`)
    return books
  } catch (error) {
    console.error('❌ Error obteniendo libros por género:', error)
    return []
  }
}

// Notes operations
export async function getNotes(): Promise<Note[]> {
  try {
    console.log('📝 Obteniendo notas...')
    const userId = await getCurrentUserId()
    if (!userId) return []

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    console.log(`✅ ${data?.length || 0} notas encontradas`)
    return data || []
  } catch (error) {
    console.error('❌ Error obteniendo notas:', error)
    return []
  }
}

export async function saveNote(note: Omit<Note, 'id' | 'created_at'>): Promise<Note | null> {
  try {
    console.log('💾 Guardando nota para:', note.title)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('❌ Usuario no autenticado al guardar nota:', userError?.message || 'No user session')
      throw new Error('Inicia sesión para guardar notas')
    }

    const noteToInsert = {
      ...note,
      user_id: user.id,
    }

    const { data, error } = await supabase
      .from('notes')
      .insert([noteToInsert])
      .select()
      .single()

    if (error) throw error
    console.log('✅ Nota guardada exitosamente:', data?.id)
    return data
  } catch (error) {
    console.error('❌ Error guardando nota:', error)
    return null
  }
}

export async function getPublicNotes(query?: string): Promise<Note[]> {
  try {
    console.log('🌍 Obteniendo notas públicas...', query ? `Filtro: ${query}` : '')
    let notesQuery = supabase
      .from('notes')
      .select('*')
      .eq('isPublic', true)
      .order('created_at', { ascending: false })

    if (query?.trim()) {
      const trimmed = query.trim()
      notesQuery = notesQuery.or(`title.ilike.%${trimmed}%,author.ilike.%${trimmed}%`)
    }

    const { data, error } = await notesQuery

    if (error) throw error

    const notes = (data || []) as Note[]
    const userIds = Array.from(new Set(notes.map((note) => note.user_id).filter(Boolean)))

    if (userIds.length === 0) {
      console.log(`✅ ${notes.length} notas públicas encontradas sin autores`)
      return notes
    }

    const { data: profilesData, error: profileError } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', userIds)

    let profiles = profilesData
    if (profileError || !profilesData || profilesData.length === 0) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds)
      if (!fallbackError && fallbackData) {
        profiles = fallbackData
      }
    }

    const profileMap = new Map<string, string>()
    ;(profiles || []).forEach((profile: any) => {
      if (profile?.id && profile?.username) {
        profileMap.set(profile.id, profile.username)
      }
    })

    const notesWithUsernames = notes.map((note) => ({
      ...note,
      username: note.user_id ? profileMap.get(note.user_id) ?? 'Lector Anónimo' : 'Lector Anónimo',
    }))

    console.log(`✅ ${notesWithUsernames.length} notas públicas encontradas`)
    return notesWithUsernames
  } catch (error) {
    console.error('❌ Error obteniendo notas públicas:', error)
    return []
  }
}

// User profile operations
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    console.log('👤 Obteniendo perfil del usuario...')
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.log('⚠️ No hay usuario autenticado')
      return null
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    if (data) {
      console.log('✅ Perfil obtenido:', data.rank)
      return data
    }

    const defaultUsername = user.email?.split('@')[0] || 'Lector'
    console.log('✨ Creando nuevo perfil de usuario')
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([
        {
          id: user.id,
          xp: 0,
          rank: 'Lector Curioso',
          username: defaultUsername,
        },
      ])
      .select()
      .single()

    if (insertError) throw insertError
    console.log('✅ Perfil creado exitosamente')
    return newProfile
  } catch (error) {
    console.error('❌ Error obteniendo perfil de usuario:', error)
    return { id: 'anonymous', xp: 0, rank: 'Lector Curioso', created_at: new Date().toISOString() }
  }
}

export async function updateUserProfile(
  updates: Partial<Pick<UserProfile, 'username' | 'avatar_url' | 'bio' | 'is_private'>>,
): Promise<UserProfile | null> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('❌ Usuario no autenticado al actualizar perfil')
      return null
    }

    const updateData: any = {}
    if (updates.username !== undefined) updateData.username = updates.username
    if (updates.avatar_url !== undefined) updateData.avatar_url = updates.avatar_url
    if (updates.bio !== undefined) updateData.bio = updates.bio
    if (updates.is_private !== undefined) updateData.is_private = updates.is_private

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    console.log('✅ Perfil actualizado')
    return data
  } catch (error) {
    console.error('❌ Error actualizando perfil:', error)
    return null
  }
}

/**
 * Añade XP al perfil del usuario (reemplaza el valor anterior)
 * @param xpAmount Total XP to set (not additive, overwrites)
 */
export async function updateUserXP(xpAmount: number): Promise<UserProfile | null> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('❌ Usuario no autenticado al actualizar XP')
      return null
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ xp: xpAmount })
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    console.log(`✅ XP actualizado a ${xpAmount}`)
    return data
  } catch (error) {
    console.error('❌ Error actualizando XP:', error)
    return null
  }
}

/**
 * Incrementa el XP del usuario (lectura) con tracking de última fecha
 * @param xpGained XP value to add 
 */
export async function addUserXP(xpGained: number): Promise<UserProfile | null> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('❌ Usuario no autenticado al añadir XP')
      return null
    }

    // Get current XP
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('xp, last_read_date')
      .eq('id', user.id)
      .single()

    if (fetchError) throw fetchError

    const newXp = (profile?.xp || 0) + xpGained
    const today = new Date().toISOString().split('T')[0]

    // Update XP and last_read_date
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        xp: newXp,
        last_read_date: today 
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    console.log(`✅ XP incrementado: +${xpGained} (Total: ${newXp})`)
    return data
  } catch (error) {
    console.error('❌ Error incrementando XP:', error)
    return null
  }
}

export async function uploadUserAvatar(file: File): Promise<string | null> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('❌ Usuario no autenticado al subir avatar')
      return null
    }

    const fileExt = file.name.split('.').pop() ?? 'png'
    const filePath = `avatars/${user.id}/${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) throw uploadError

    const { data: publicUrlData, error: publicUrlError } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    if (publicUrlError) throw publicUrlError

    const publicUrl = publicUrlData.publicUrl
    await updateUserProfile({ avatar_url: publicUrl })
    return publicUrl
  } catch (error) {
    console.error('❌ Error subiendo avatar:', error)
    return null
  }
}

export async function searchReaders(query: string): Promise<ReaderProfile[]> {
  try {
    if (!query.trim()) return []

    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id

    let profileQuery = supabase
      .from('profiles')
      .select('id, username, avatar_url, xp, rank, is_private')
      .ilike('username', `%${query.trim()}%`)
      .or('is_private.is.null,is_private.eq.false')
      .limit(20)

    if (userId) {
      profileQuery = profileQuery.neq('id', userId)
    }

    const { data, error } = await profileQuery
    if (error) throw error

    const profiles = (data || []) as ReaderProfile[]

    if (!userId) {
      return profiles
    }

    const { data: followData, error: followError } = await supabase
      .from('follows')
      .select('followed_id')
      .eq('follower_id', userId)

    if (followError) {
      console.error('❌ Error obteniendo seguimiento:', followError)
      return profiles
    }

    const followedIds = (followData || []).map((item: any) => item.followed_id)
    return profiles.map((profile) => ({
      ...profile,
      isFollowing: followedIds.includes(profile.id),
    }))
  } catch (error) {
    console.error('❌ Error buscando lectores:', error)
    return []
  }
}

export async function followUser(followedId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    if (user.id === followedId) return false

    const { error } = await supabase
      .from('follows')
      .insert([{ follower_id: user.id, followed_id: followedId }])

    if (error) {
      console.error('❌ Error siguiendo usuario:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('❌ Error siguiendo usuario:', error)
    return false
  }
}

export async function unfollowUser(followedId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('followed_id', followedId)

    if (error) {
      console.error('❌ Error dejando de seguir usuario:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('❌ Error dejando de seguir usuario:', error)
    return false
  }
}

export async function getFollowCounts(userId?: string): Promise<{ followers: number; following: number }> {
  try {
    let targetId = userId
    if (!targetId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) return { followers: 0, following: 0 }
      targetId = user.id
    }

    const [{ count: followersCount }, { count: followingCount }] = await Promise.all([
      supabase.from('follows').select('id', { count: 'exact', head: true }).eq('followed_id', targetId),
      supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', targetId),
    ])

    return {
      followers: followersCount || 0,
      following: followingCount || 0,
    }
  } catch (error) {
    console.error('❌ Error obteniendo conteos de lectores:', error)
    return { followers: 0, following: 0 }
  }
}

export async function getFollowedTitles(): Promise<FollowedTitle[]> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return []

    const { data, error } = await supabase
      .from('book_follows')
      .select('id, title, author, cover_url, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as FollowedTitle[]
  } catch (error) {
    console.error('❌ Error obteniendo títulos seguidos:', error)
    return []
  }
}

export async function followTitle(title: string, author: string, coverUrl?: string | null): Promise<boolean> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return false

    const { error } = await supabase
      .from('book_follows')
      .insert([
        {
          user_id: userId,
          title,
          author,
          cover_url: coverUrl || null,
        },
      ])

    if (error) {
      if ((error as any).code === '23505') {
        return true
      }
      throw error
    }

    return true
  } catch (error) {
    console.error('❌ Error siguiendo título:', error)
    return false
  }
}

export async function unfollowTitle(title: string, author: string): Promise<boolean> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return false

    const { error } = await supabase
      .from('book_follows')
      .delete()
      .eq('user_id', userId)
      .eq('title', title)
      .eq('author', author)

    if (error) throw error
    return true
  } catch (error) {
    console.error('❌ Error dejando de seguir título:', error)
    return false
  }
}

export async function addXpAndUpdateRank(xpToAdd: number): Promise<UserProfile | null> {
  try {
    console.log(`⭐ Añadiendo ${xpToAdd} XP...`)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const profile = await getUserProfile()
    if (!profile) return null

    const newXp = profile.xp + xpToAdd
    let newRank = profile.rank

    // Determine rank based on XP
    if (newXp >= 3000) newRank = 'Maestro de la Lectura'
    else if (newXp >= 1500) newRank = 'Crítico Literario'
    else if (newXp >= 500) newRank = 'Bibliotecario Noveli'
    else newRank = 'Lector Curioso'

    const { data, error } = await supabase
      .from('profiles')
      .update({ xp: newXp, rank: newRank })
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    console.log(`✅ XP actualizado: ${profile.xp} → ${newXp}, Rango: ${newRank}`)
    return data
  } catch (error) {
    console.error('❌ Error añadiendo XP:', error)
    return null
  }
}
