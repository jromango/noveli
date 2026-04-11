import React, { useState } from 'react'
import { X, Loader, Check } from 'lucide-react'
import confetti from 'canvas-confetti'
import SearchBar from './SearchBar'
import { GoogleBook } from '../services/googleBooks'
import { saveBook, BookshelfBook, addXpAndUpdateRank } from '../services/database'
import { XP_CONFIG } from '../lib/gamification'

interface AddBookModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (book: BookshelfBook) => void
  onXpGained?: (xp: number) => void
}

export default function AddBookModal({ isOpen, onClose, onSave, onXpGained }: AddBookModalProps) {
  const [selectedBook, setSelectedBook] = useState<GoogleBook | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const launchConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 74,
      startVelocity: 26,
      origin: { y: 0.62 },
      colors: ['#8B5CF6', '#EAB308', '#2563EB', '#F59E0B'],
    })
  }

  const handleSelectBook = (book: GoogleBook) => {
    setSelectedBook(book)
  }

  const handleSave = async () => {
    if (!selectedBook) return

    setIsSaving(true)
    setSaveSuccess(false)
    try {
      const genre = selectedBook.categories?.[0] || 'Literatura'
      const totalPages = selectedBook.pageCount || 0

      const result = await saveBook({
        title: selectedBook.title,
        author: selectedBook.author,
        cover: selectedBook.thumbnail || null,
        totalPages,
        genre,
        publishedDate: selectedBook.publishedDate,
        synopsis: selectedBook.description,
        externalBookId: selectedBook.externalBookId || selectedBook.id,
      })

      if (result) {
        const xpToAward = selectedBook.fromAI
          ? XP_CONFIG.ADD_BOOK + XP_CONFIG.AI_SUGGESTION_BONUS
          : XP_CONFIG.ADD_BOOK

        // Add XP
        await addXpAndUpdateRank(xpToAward)
        onXpGained?.(xpToAward)

        if (selectedBook.fromAI) {
          launchConfetti()
        }

        // Mostrar mensaje de éxito
        setSaveSuccess(true)

        // Refrescar datos después de un breve delay
        setTimeout(() => {
          onSave(result)
          setSelectedBook(null)
          setSaveSuccess(false)
          onClose()
        }, 1500)
      } else {
        console.error('❌ Error: No se pudo guardar el libro')
        alert('Error al guardar el libro. Por favor, intenta de nuevo.')
      }
    } catch (error) {
      console.error('❌ Error guardando libro:', error)
      if (error instanceof Error && error.message === 'Inicia sesión para guardar libros') {
        alert('Inicia sesión para guardar libros')
      } else {
        alert('Error al guardar el libro. Por favor, intenta de nuevo.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    setSelectedBook(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md">
      <div className="scrollbar-hide w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-2xl border-[0.5px] border-gold/30 bg-black/80 backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gold/20 px-5 py-4">
          <h2 className="font-serif text-2xl font-semibold text-gold">Añadir Libro</h2>
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="rounded-full p-1 transition hover:bg-gold/10 disabled:opacity-50"
          >
            <X size={18} className="text-accent" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-5">
          {/* Book Search */}
          <div className="space-y-2">
            <label className="block font-serif text-base font-medium text-accent/95">
              Busca un libro
            </label>
            <p className="font-sans text-[11px] text-accent/55">Mínimo 3 caracteres para activar la búsqueda</p>
            <SearchBar onSelectBook={handleSelectBook} />
          </div>

          {/* Selected Book Preview */}
          {selectedBook && (
            <div className="flex gap-2.5 rounded-xl border border-gold/25 bg-black/45 p-2.5 backdrop-blur-md">
              {selectedBook.thumbnail ? (
                <img
                  src={selectedBook.thumbnail}
                  alt={selectedBook.title}
                  className="h-14 w-10 flex-shrink-0 rounded-md border border-gold/30 bg-black/25 p-0.5 object-contain"
                />
              ) : (
                <div className="flex h-14 w-10 flex-shrink-0 items-center justify-center rounded-md border border-gold/30 bg-gray-700">
                  <span className="text-xs text-accent">📖</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate font-serif text-sm font-semibold text-white">
                  {selectedBook.title}
                </p>
                <p className="truncate font-sans text-xs text-gold/70">
                  {selectedBook.author}
                </p>
                {selectedBook.fromAI && (
                  <p className="mt-1 line-clamp-2 text-[10px] text-violet-200/90">
                    ✨ Sugerido por IA: {selectedBook.aiDescription || 'Recomendacion personalizada de Noveli'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* XP Info */}
          {selectedBook && (
            <div className="rounded-xl border border-gold/30 bg-gold/20 p-3 text-center">
              <p className="font-sans text-xs font-semibold text-gold">
                +{selectedBook.fromAI ? XP_CONFIG.ADD_BOOK + XP_CONFIG.AI_SUGGESTION_BONUS : XP_CONFIG.ADD_BOOK} XP por añadir este libro
                {selectedBook.fromAI ? ' (incluye +20 XP IA)' : ''}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="pt-1">
            <button
              onClick={handleSave}
              disabled={!selectedBook || isSaving || saveSuccess}
              className="flex w-full items-center justify-center gap-2 rounded-3xl bg-gold/80 p-4 text-sm font-medium text-white transition-all duration-300 hover:bg-gold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Guardando...
                </>
              ) : saveSuccess ? (
                <>
                  <Check size={16} className="text-green-600" />
                  ¡Añadido!
                </>
              ) : (
                `+${selectedBook?.fromAI ? XP_CONFIG.ADD_BOOK + XP_CONFIG.AI_SUGGESTION_BONUS : XP_CONFIG.ADD_BOOK} XP - Añadir Libro`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
