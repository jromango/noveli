import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export interface UserLibraryBook {
  id: string
  title: string
  author: string
  cover: string | null
  addedAt: string
}

interface UserLibraryContextValue {
  userLibrary: UserLibraryBook[]
  addBookToLibrary: (book: Omit<UserLibraryBook, 'addedAt'>) => void
  isBookInLibrary: (book: { id?: string; title: string; author: string }) => boolean
}

const STORAGE_KEY = 'noveli.userLibrary.v1'

const UserLibraryContext = createContext<UserLibraryContextValue | undefined>(undefined)

function normalize(value: string) {
  return value.trim().toLowerCase()
}

export function UserLibraryProvider({ children }: { children: React.ReactNode }) {
  const [userLibrary, setUserLibrary] = useState<UserLibraryBook[]>([])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as UserLibraryBook[]
      if (Array.isArray(parsed)) {
        setUserLibrary(parsed)
      }
    } catch (error) {
      console.error('❌ Error leyendo userLibrary de localStorage:', error)
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userLibrary))
    } catch (error) {
      console.error('❌ Error guardando userLibrary en localStorage:', error)
    }
  }, [userLibrary])

  const addBookToLibrary = (book: Omit<UserLibraryBook, 'addedAt'>) => {
    setUserLibrary((current) => {
      const exists = current.some((item) => {
        if (item.id && book.id && item.id === book.id) return true
        return normalize(item.title) === normalize(book.title) && normalize(item.author) === normalize(book.author)
      })

      if (exists) return current

      return [
        {
          ...book,
          addedAt: new Date().toISOString(),
        },
        ...current,
      ]
    })
  }

  const isBookInLibrary = (book: { id?: string; title: string; author: string }) => {
    return userLibrary.some((item) => {
      if (item.id && book.id && item.id === book.id) return true
      return normalize(item.title) === normalize(book.title) && normalize(item.author) === normalize(book.author)
    })
  }

  const value = useMemo(
    () => ({ userLibrary, addBookToLibrary, isBookInLibrary }),
    [userLibrary],
  )

  return <UserLibraryContext.Provider value={value}>{children}</UserLibraryContext.Provider>
}

export function useUserLibrary() {
  const context = useContext(UserLibraryContext)
  if (!context) {
    throw new Error('useUserLibrary debe usarse dentro de UserLibraryProvider')
  }
  return context
}
