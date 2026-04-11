import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import CommunityPage from './pages/CommunityPage'
import ProfilePage from './pages/ProfilePage'
import AnalyticsPage from './pages/AnalyticsPage'
import NewNoteModal from './components/NewNoteModal'
import AddBookModal from './components/AddBookModal'
import EditProfileModal from './components/EditProfileModal'
import AuthScreen from './components/AuthScreen'
import SplashScreen from './components/SplashScreen'
import MainLayout from './components/layout/MainLayout'
import { GoogleBook } from './services/googleBooks'
import {
  getBookshelfBooks,
  getNotes,
  deleteBookshelfBook,
  BookshelfBook,
  Note,
  verifySupabaseConnection,
  getUserProfile,
  UserProfile,
} from './services/database'
import { supabase } from './lib/supabaseClient'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { getRankByXp } from './lib/gamification'
import { useTheme } from './context/ThemeContext'
import { themeConfig } from './lib/themeConfig'

type Section = 'home' | 'analytics' | 'search' | 'community' | 'profile'

function mapPathToSection(pathname: string): Section {
  const path = pathname.toLowerCase()
  if (path.includes('/analytics')) return 'analytics'
  if (path.includes('/explore') || path.includes('/explorar')) return 'search'
  if (path.includes('/community') || path.includes('/comunidad')) return 'community'
  if (path.includes('/profile') || path.includes('/perfil')) return 'profile'
  return 'home'
}

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const isDarkMode = theme === 'dark'
  const palette = themeConfig[theme]
  const currentSection = mapPathToSection(location.pathname)
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [notes, setNotes] = useState<Note[]>([])
  const [bookshelves, setBookshelves] = useState<BookshelfBook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [forceProfileRefresh, setForceProfileRefresh] = useState(0)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [showSplash, setShowSplash] = useState(true)
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (text: string) => {
    setToast(text)
    window.setTimeout(() => setToast(null), 2200)
  }

  // Verificar autenticación al cargar la app
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('❌ Error obteniendo sesión:', error)
        } else {
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('❌ Error verificando usuario:', error)
      } finally {
        setIsAuthLoading(false)
      }
    }

    checkUser()

    const splashTimer = setTimeout(() => {
      setShowSplash(false)
    }, 1100)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email)
        setUser(session?.user ?? null)
        setIsAuthLoading(false)

        // Si el usuario se desconecta, limpiar datos
        if (event === 'SIGNED_OUT') {
          setBookshelves([])
          setNotes([])
          navigate('/dashboard', { replace: true })
        }
      }
    )

    return () => {
      clearTimeout(splashTimer)
      subscription.unsubscribe()
    }
  }, [])

  // Verificar conexión a Supabase al cargar la app
  useEffect(() => {
    if (user) {
      verifySupabaseConnection()
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      setUserProfile(null)
      return
    }

    const loadProfile = async () => {
      const profile = await getUserProfile()
      setUserProfile(profile)
    }

    loadProfile()
  }, [user])

  // Cargar datos solo cuando hay usuario autenticado
  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      setIsLoading(true)
      try {
        const [booksData, notesData] = await Promise.all([
          getBookshelfBooks(),
          getNotes(),
        ])
        setBookshelves(booksData)
        setNotes(notesData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user])

  const handleBookSaved = async (book: BookshelfBook) => {
    try {
      const booksData = await getBookshelfBooks()
      setBookshelves(booksData)
      console.log('✅ Estante actualizado con el nuevo libro')
      showToast(`Libro añadido a tus lecturas: ${book.title}`)
    } catch (error) {
      console.error('❌ Error actualizando estante:', error)
    }
  }

  const handleAddBookFromSearch = async () => {
    try {
      const booksData = await getBookshelfBooks()
      setBookshelves(booksData)
      console.log('✅ Estante sincronizado desde Explorar')
      showToast('Lecturas sincronizadas')
    } catch (error) {
      console.error('❌ Error sincronizando estante desde Explorar:', error)
    }
  }

  const handleBookUpdated = (updatedBook: BookshelfBook) => {
    setBookshelves((current) => current.map((book) => (book.id === updatedBook.id ? updatedBook : book)))
  }

  const handleBookRemoved = async (bookId: string) => {
    const bookTitle = bookshelves.find((book) => book.id === bookId)?.title
    const deleted = await deleteBookshelfBook(bookId)
    if (!deleted) {
      console.error('❌ No se pudo eliminar el libro del estante')
      showToast('No se pudo eliminar el libro')
      return
    }
    setBookshelves((current) => current.filter((book) => book.id !== bookId))
    showToast(bookTitle ? `Libro eliminado: ${bookTitle}` : 'Libro eliminado de tus lecturas')
  }

  const handleXpGained = (xp: number) => {
    setForceProfileRefresh((prev) => prev + 1)
  }

  const handleAuthSuccess = () => {
    console.log('🎉 Autenticación exitosa, cargando aplicación...')
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('❌ Error cerrando sesión:', error)
      } else {
        console.log('✅ Sesión cerrada exitosamente')
      }
    } catch (error) {
      console.error('❌ Error cerrando sesión:', error)
    }
  }

  const handleAddBookClick = () => {
    setIsAddBookModalOpen(true)
  }

  const handleNavigate = (path: '/dashboard' | '/analytics' | '/explore' | '/community' | '/profile') => {
    if (location.pathname === path) return
    navigate(path)
  }

  const xp = userProfile?.xp ?? 0
  const currentRank = getRankByXp(xp)

  // Mostrar splash mientras se carga la app
  if (showSplash || isAuthLoading) {
    return <SplashScreen />
  }

  // Mostrar pantalla de autenticación si no hay usuario y no está en comunidad
  if (!user && currentSection !== 'community') {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />
  }

  const renderPage = () => {
    switch (currentSection) {
      case 'home':
        return (
          <HomePage
            notes={notes}
            bookshelves={bookshelves}
            isLoading={isLoading}
            username={userProfile?.username || user.email?.split('@')[0] || 'Lector'}
            onAddBook={handleAddBookClick}
            onXpGained={handleXpGained}
            onBookUpdated={handleBookUpdated}
            onBookRemoved={handleBookRemoved}
            theme={theme}
          />
        )
      case 'analytics':
        return (
          <AnalyticsPage
            xp={xp}
            totalBooks={bookshelves.length}
            completedBooks={bookshelves.filter((book) => book.status === 'completed').length}
          />
        )
      case 'search':
        return (
          <SearchPage
            onBookAdded={handleAddBookFromSearch}
          />
        )
      case 'community':
        return <CommunityPage isAuthenticated={!!user} theme={theme} />
      case 'profile':
        return (
          <ProfilePage
            notes={notes}
            books={bookshelves}
            onSignOut={handleSignOut}
            onOpenSettings={() => setIsEditProfileModalOpen(true)}
            key={forceProfileRefresh}
          />
        )
      default:
        return null
    }
  }

  return (
    <MainLayout
      isDarkMode={isDarkMode}
      palette={palette}
      user={user}
      userProfile={userProfile}
      completedBooks={bookshelves.filter((book) => book.status === 'completed').length}
      accountMenuOpen={accountMenuOpen}
      setAccountMenuOpen={setAccountMenuOpen}
      onOpenSettings={() => setIsEditProfileModalOpen(true)}
      onSignOut={handleSignOut}
      toggleTheme={toggleTheme}
      currentSection={currentSection}
      onNavigate={handleNavigate}
    >
      {toast && (
        <div className="fixed right-6 top-24 z-50 rounded-2xl border border-[#D4AF37]/25 bg-black/60 px-4 py-2 text-xs font-medium text-[#D4AF37] shadow-xl backdrop-blur-md">
          {toast}
        </div>
      )}

      <motion.div
        key={location.pathname}
        initial={{ opacity: 0.96 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
      >
        {renderPage()}
      </motion.div>

      <AddBookModal
        isOpen={isAddBookModalOpen}
        onClose={() => setIsAddBookModalOpen(false)}
        onSave={handleBookSaved}
        onXpGained={handleXpGained}
      />

      <NewNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={(bookWithNotes) => {
          const newNote: Note = {
            id: Date.now().toString(),
            title: bookWithNotes.title,
            author: bookWithNotes.author,
            thumbnail: bookWithNotes.thumbnail || null,
            notes: bookWithNotes.notes,
            created_at: new Date().toISOString(),
          }
          setNotes([newNote, ...notes])
          setIsNoteModalOpen(false)
        }}
      />

      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        currentUsername={userProfile?.username}
        currentAvatarUrl={userProfile?.avatar_url}
        currentBio={userProfile?.bio}
        currentIsPrivate={userProfile?.is_private}
        onProfileUpdated={async () => {
          const profile = await getUserProfile()
          setUserProfile(profile)
          setForceProfileRefresh((prev) => prev + 1)
        }}
      />
    </MainLayout>
  )
}
