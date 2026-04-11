import React, { useState } from 'react'
import { X, Loader } from 'lucide-react'
import BookSearchAutocomplete from './BookSearchAutocomplete'
import { GoogleBook } from '../services/googleBooks'
import { saveNote } from '../services/database'

interface NewNoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (book: GoogleBook & { notes: string }) => void
}

export default function NewNoteModal({ isOpen, onClose, onSave }: NewNoteModalProps) {
  const [selectedBook, setSelectedBook] = useState<GoogleBook | null>(null)
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSelectBook = (book: GoogleBook) => {
    setSelectedBook(book)
  }

  const handleSave = async () => {
    if (!selectedBook) return

    setIsSaving(true)
    try {
      const result = await saveNote({
        title: selectedBook.title,
        author: selectedBook.author,
        thumbnail: selectedBook.thumbnail || null,
        notes,
      })

      if (result) {
        onSave({
          ...selectedBook,
          notes,
        })
        setSelectedBook(null)
        setNotes('')
        onClose()
      }
    } catch (error) {
      console.error('Error saving note:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    setSelectedBook(null)
    setNotes('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md">
      <div className="bg-cream rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-300 shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="font-serif text-2xl font-bold text-text">Nueva Nota</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-200 rounded transition"
          >
            <X size={24} className="text-text" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Book Search */}
          <div>
            <label className="block font-sans text-sm font-medium text-text mb-2">
              Selecciona un libro
            </label>
            <BookSearchAutocomplete onSelectBook={handleSelectBook} />
          </div>

          {/* Selected Book Preview */}
          {selectedBook && (
            <div className="flex gap-3 p-3 bg-white rounded-lg border border-gray-200">
              {selectedBook.thumbnail ? (
                <img
                  src={selectedBook.thumbnail}
                  alt={selectedBook.title}
                  className="w-12 h-16 object-cover rounded border border-gray-200 flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-16 bg-gray-300 rounded border border-gray-200 flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs">📖</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-serif font-semibold text-text text-sm truncate">
                  {selectedBook.title}
                </p>
                <p className="font-sans text-xs text-gray-600 truncate">
                  {selectedBook.author}
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block font-sans text-sm font-medium text-text mb-2">
              Tu nota
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escribe tus pensamientos sobre este libro..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-sans text-text focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent resize-none h-24"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleClose}
              disabled={isSaving}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-sans text-text hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedBook || isSaving}
              className="flex-1 px-4 py-2 bg-text text-cream rounded-lg font-sans font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Nota'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
