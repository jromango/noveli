import React, { useState } from 'react'
import { X, Star, BookOpen, CheckCircle, Clock, Edit3, Save } from 'lucide-react'
import { BookshelfBook, updateBookProgress, saveNote, Note, addXpAndUpdateRank } from '../services/database'
import { XP_CONFIG } from '../lib/gamification'
import { useTheme } from '../context/ThemeContext'
import { themeConfig } from '../lib/themeConfig'

interface BookDetailModalProps {
  book: BookshelfBook
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedBook: BookshelfBook) => void
  onRemove: (bookId: string) => Promise<void> | void
  onXpGained?: (xp: number) => void
}

export default function BookDetailModal({ book, isOpen, onClose, onUpdate, onRemove, onXpGained }: BookDetailModalProps) {
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'
  const palette = themeConfig[theme]
  
  const [currentPage, setCurrentPage] = useState(book.currentPage.toString())
  const [status, setStatus] = useState<BookshelfBook['status']>(book.status)
  const [saveToast, setSaveToast] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [rating, setRating] = useState(5)
  const [isPublic, setIsPublic] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveProgress = async () => {
    const pageNum = parseInt(currentPage, 10)
    if (isNaN(pageNum) || pageNum < 0 || pageNum > book.totalPages) return

    const success = await updateBookProgress(book.id, pageNum, status)
    if (success) {
      const progress = Math.round((pageNum / book.totalPages) * 100)
      const updatedBook = { ...book, currentPage: pageNum, progress, status }
      onUpdate(updatedBook)
      setSaveToast('Progreso guardado correctamente')
      window.setTimeout(() => setSaveToast(null), 2800)

      // Si marca como completado, dar XP y mostrar confeti
      if (status === 'completed' && book.status !== 'completed') {
        await addXpAndUpdateRank(XP_CONFIG.COMPLETE_BOOK)
        onXpGained?.(XP_CONFIG.COMPLETE_BOOK)
      }
    }
  }

  const handleSaveNote = async () => {
    if (!noteText.trim()) return

    setIsSaving(true)
    const note: Omit<Note, 'id' | 'created_at'> = {
      title: book.title,
      author: book.author,
      thumbnail: book.cover,
      notes: noteText,
      rating,
      isPublic,
      bookId: book.id,
    }

    const savedNote = await saveNote(note)
    if (savedNote) {
      setNoteText('')
      setRating(5)
      setIsPublic(false)
      setIsEditing(false)
    }
    setIsSaving(false)
  }

  const handleRemoveBook = async () => {
    const confirmed = window.confirm('¿Quieres quitar este libro de tu biblioteca?')
    if (!confirmed) return
    await onRemove(book.id)
    onClose()
  }

  const getStatusIcon = (bookStatus: BookshelfBook['status']) => {
    switch (bookStatus) {
      case 'pending': return <Clock size={16} className="text-gray-500" />
      case 'reading': return <BookOpen size={16} className="text-blue-500" />
      case 'completed': return <CheckCircle size={16} className="text-green-500" />
    }
  }

  const getStatusText = (bookStatus: BookshelfBook['status']) => {
    switch (bookStatus) {
      case 'pending': return 'Pendiente'
      case 'reading': return 'Leyendo'
      case 'completed': return 'Terminado'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md">
      {saveToast && (
        <div className="fixed top-6 right-6 z-[60] rounded-2xl border border-gold/50 bg-gradient-to-r from-yellow-900/85 to-black/90 px-5 py-3 text-sm font-semibold text-gold shadow-2xl shadow-yellow-500/20 backdrop-blur-md animate-[fadeIn_0.25s_ease-out]">
          {saveToast}
        </div>
      )}
      <div className={`rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border shadow-xl ${
        isDarkMode 
          ? 'bg-[#1A1A1A] border-[#333333]' 
          : 'bg-cream border-gray-300'
      }`}>
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${
          isDarkMode 
            ? 'border-[#333333]' 
            : 'border-gray-200'
        }`}>
          <h2 className={`font-serif text-2xl font-bold ${
            isDarkMode 
              ? 'text-[#F5F1E8]' 
              : 'text-text'
          }`}>Detalles del Libro</h2>
          <button
            onClick={onClose}
            className={`p-1 rounded transition ${
              isDarkMode 
                ? 'hover:bg-[#333333] text-[#F5F1E8]' 
                : 'hover:bg-gray-200 text-text'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Book Info */}
          <div className="flex gap-4">
            <div className={`w-24 h-36 bg-gray-300 rounded border overflow-hidden flex-shrink-0 ${
              isDarkMode 
                ? 'border-[#444444] bg-[#333333]' 
                : 'border-gray-200'
            }`}>
              {book.cover ? (
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl">📖</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className={`font-serif text-xl font-bold mb-1 ${
                isDarkMode 
                  ? 'text-[#F5F1E8]' 
                  : 'text-text'
              }`}>{book.title}</h3>
              <p className={`mb-2 ${
                isDarkMode 
                  ? 'text-stone-400' 
                  : 'text-gray-600'
              }`}>{book.author}</p>
              <div className="flex items-center gap-2">
                {getStatusIcon(status)}
                <span className={`font-sans text-sm ${
                  isDarkMode 
                    ? 'text-stone-400' 
                    : 'text-gray-600'
                }`}>{getStatusText(status)}</span>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className={`rounded-lg p-4 border ${
            isDarkMode 
              ? 'bg-[#242424] border-[#333333]' 
              : 'bg-white border-gray-200'
          }`}>
            <h4 className={`font-serif font-semibold mb-4 ${
              isDarkMode 
                ? 'text-[#F5F1E8]' 
                : 'text-text'
            }`}>Progreso de Lectura</h4>

            <div className="space-y-4">
              {/* Status Selector */}
              <div>
                <label className={`block font-sans text-sm font-medium mb-2 ${
                  isDarkMode 
                    ? 'text-[#F5F1E8]' 
                    : 'text-text'
                }`}>
                  Estado
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as BookshelfBook['status'])}
                  className={`w-full px-3 py-2 border rounded-lg font-sans focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-[#1A1A1A] border-[#444444] text-[#F5F1E8]' 
                      : 'border-gray-300 text-text'
                  }`}
                >
                  <option value="pending">Pendiente</option>
                  <option value="reading">Leyendo</option>
                  <option value="completed">Terminado</option>
                </select>
              </div>

              {/* Page Input */}
              <div>
                <label className={`block font-sans text-sm font-medium mb-2 ${
                  isDarkMode 
                    ? 'text-[#F5F1E8]' 
                    : 'text-text'
                }`}>
                  Página actual (de {book.totalPages})
                </label>
                <input
                  type="number"
                  value={currentPage}
                  onChange={(e) => setCurrentPage(e.target.value)}
                  min="0"
                  max={book.totalPages}
                  className={`w-full px-3 py-2 border rounded-lg font-sans focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-[#1A1A1A] border-[#444444] text-[#F5F1E8]' 
                      : 'border-gray-300 text-text'
                  }`}
                />
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-sans text-sm ${
                    isDarkMode 
                      ? 'text-stone-400' 
                      : 'text-gray-600'
                  }`}>Progreso</span>
                  <span className="font-sans text-sm font-semibold text-gold">
                    {Math.round((parseInt(currentPage) / book.totalPages) * 100) || 0}%
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${
                  isDarkMode 
                    ? 'bg-[#333333]' 
                    : 'bg-gray-200'
                }`}>
                  <div
                    className="bg-gold-light h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.round((parseInt(currentPage) / book.totalPages) * 100) || 0}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={handleSaveProgress}
                className={`w-full px-4 py-2 rounded-lg font-sans font-medium transition ${
                  isDarkMode 
                    ? 'bg-[#D4AF37] text-[#1A1A1A] hover:bg-[#E5C158]' 
                    : 'bg-text text-cream hover:bg-gray-800'
                }`}
              >
                Guardar Progreso
              </button>

              <button
                onClick={handleRemoveBook}
                className={`w-full px-4 py-2 rounded-lg border font-sans text-sm font-semibold transition ${
                  isDarkMode 
                    ? 'border-red-700/60 bg-red-900/20 text-red-400 hover:bg-red-900/40' 
                    : 'border-red-300/60 bg-red-500/10 text-red-700 hover:bg-red-500/20'
                }`}
              >
                Quitar de mi biblioteca
              </button>
            </div>
          </div>

          {/* Notes Section */}
          <div className={`rounded-lg p-4 border ${
            isDarkMode 
              ? 'bg-[#242424] border-[#333333]' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h4 className={`font-serif font-semibold ${
                isDarkMode 
                  ? 'text-[#F5F1E8]' 
                  : 'text-text'
              }`}>Mis Notas</h4>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-3 py-1 bg-gold text-white rounded-lg font-sans text-sm hover:bg-gold-light transition"
              >
                <Edit3 size={14} />
                {isEditing ? 'Cancelar' : 'Escribir Nota'}
              </button>
            </div>

            {isEditing && (
              <div className="space-y-4">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Escribe tu reseña o reflexión sobre este libro..."
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg font-sans focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent resize-none ${
                    isDarkMode 
                      ? 'bg-[#1A1A1A] border-[#444444] text-[#F5F1E8] placeholder-stone-600' 
                      : 'border-gray-300 text-text'
                  }`}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <label className={`block font-sans text-sm font-medium mb-1 ${
                        isDarkMode 
                          ? 'text-[#F5F1E8]' 
                          : 'text-text'
                      }`}>
                        Calificación
                      </label>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setRating(i + 1)}
                            className="p-1"
                          >
                            <Star
                              size={20}
                              className={i < rating ? 'text-gold fill-gold' : isDarkMode ? 'text-stone-600' : 'text-gray-300'}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isPublic}
                          onChange={(e) => setIsPublic(e.target.checked)}
                          className={`rounded text-gold focus:ring-gold ${
                            isDarkMode 
                              ? 'border-[#444444] bg-[#1A1A1A]' 
                              : 'border-gray-300'
                          }`}
                        />
                        <span className={`font-sans text-sm ${
                          isDarkMode 
                            ? 'text-[#F5F1E8]' 
                            : 'text-text'
                        }`}>Pública</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveNote}
                    disabled={!noteText.trim() || isSaving}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-sans font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDarkMode 
                        ? 'bg-[#D4AF37] text-[#1A1A1A] hover:bg-[#E5C158]' 
                        : 'bg-text text-cream hover:bg-gray-800'
                    }`}
                  >
                    <Save size={16} />
                    {isSaving ? 'Guardando...' : 'Guardar Nota'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}