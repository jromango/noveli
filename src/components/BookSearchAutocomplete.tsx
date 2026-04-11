import React, { useState, useEffect, useRef, useCallback } from 'react'
import { GoogleBook } from '../services/googleBooks'
import { hybridBookSearch, UnifiedBook } from '../services/hybridBookSearch'
import { Loader, Search, Plus, Sparkles } from 'lucide-react'
import { detectSearchIntent, getGeminiRecommendations } from '../services/geminiService'
import AIResultCard from './search/AIResultCard'

interface BookSearchAutocompleteProps {
  onSelectBook: (book: GoogleBook) => void
}

export default function BookSearchAutocomplete({ onSelectBook }: BookSearchAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UnifiedBook[]>([])
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [errorMessage, setErrorMessage] = useState('')
  const [activeIntent, setActiveIntent] = useState<'traditional' | 'ai'>('traditional')
  const inputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<number | null>(null)

  const performSearch = useCallback(async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim()
    if (trimmedQuery.length < 3) {
      return
    }

    const intent = detectSearchIntent(trimmedQuery)
    setActiveIntent(intent)
    setLoading(true)
    setAiLoading(intent === 'ai')
    setErrorMessage('')
    setShowResults(true)

    try {
      if (intent === 'ai') {
        try {
          const recommendations = await getGeminiRecommendations(trimmedQuery)
          const aiBooks: UnifiedBook[] = recommendations.map((item, index) => ({
            id: `gemini-${index}-${item.titulo.toLowerCase().replace(/\s+/g, '-')}`,
            title: item.titulo,
            author: item.autor,
            thumbnail: null,
            source: 'gemini',
            reason: item.descripcion_breve,
          }))

          setResults(aiBooks)
          setSelectedIndex(-1)

          if (aiBooks.length === 0) {
            setErrorMessage('La IA no devolvio recomendaciones. Intenta otra descripcion.')
          }
        } catch (aiError) {
          console.error('⚠️ IA no disponible, activando fallback tradicional:', aiError)
          const fallbackBooks = await hybridBookSearch(trimmedQuery)
          setResults(fallbackBooks)
          setSelectedIndex(-1)
          setActiveIntent('traditional')
          if (fallbackBooks.length === 0) {
            setErrorMessage('No encontramos coincidencias para esta busqueda.')
          } else {
            setErrorMessage('')
          }
        }
      } else {
        const books = await hybridBookSearch(trimmedQuery)
        setResults(books)
        setSelectedIndex(-1)
        if (books.length === 0) {
          setErrorMessage('No hay resultados en ninguna fuente de búsqueda')
        }
      }
    } catch (error) {
      setResults([])
      setErrorMessage('Error en la búsqueda. Intenta de nuevo más tarde.')
      console.error('Error en búsqueda híbrida:', error)
    } finally {
      setLoading(false)
      setAiLoading(false)
    }
  }, [])

  useEffect(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }

    if (!query || query.trim().length === 0) {
      setResults([])
      setShowResults(false)
      setLoading(false)
      setErrorMessage('')
      return
    }

    if (query.trim().length < 3) {
      setResults([])
      setShowResults(false)
      setLoading(false)
      setErrorMessage('')
      return
    }

    setLoading(true)
    setShowResults(true)
    timeoutRef.current = setTimeout(() => {
      performSearch(query)
    }, 800)

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [query, performSearch])

  const handleManualSearch = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }
    if (query.trim().length >= 3) {
      performSearch(query)
    }
  }

  const handleSelectBook = (book: UnifiedBook) => {
    // Convertir UnifiedBook a GoogleBook
    const googleBook: GoogleBook = {
      id: book.id,
      title: book.title,
      author: book.author,
      thumbnail: book.thumbnail,
      pageCount: book.pageCount,
      fromAI: book.source === 'gemini',
      aiDescription: book.reason,
    }
    onSelectBook(googleBook)
    setQuery('')
    setResults([])
    setShowResults(false)
    setErrorMessage('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelectBook(results[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowResults(false)
        break
      default:
        break
    }
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setErrorMessage('')
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim().length >= 3 && setShowResults(true)}
          placeholder="Busca un libro"
          className="w-full rounded-xl border border-gold/25 bg-black/50 py-2.5 pl-3 pr-9 text-sm font-sans text-accent placeholder-accent/45 focus:outline-none"
        />
        <Search size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gold/70" />
        {loading && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2">
            {aiLoading ? <Sparkles size={14} className="animate-pulse text-violet-300" /> : <Loader size={14} className="animate-spin text-gold" />}
          </div>
        )}
      </div>

      {showResults && query.trim().length >= 3 && (
        <div className="scrollbar-hide absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border-[0.5px] border-gold/25 bg-black/80 backdrop-blur-md">
          {loading ? (
            <div className="p-3 text-center">
              <div className="flex items-center justify-center gap-2">
                {aiLoading ? <Sparkles size={14} className="animate-pulse text-violet-300" /> : <Loader size={14} className="animate-spin text-gold" />}
                <span className="font-sans text-xs text-accent/80">{aiLoading ? 'IA generando...' : 'Buscando...'}</span>
              </div>
            </div>
          ) : errorMessage ? (
            <div className="space-y-2 p-3 text-center">
              <p className="font-sans text-xs font-semibold text-accent">{errorMessage}</p>
              <p className="font-sans text-[11px] text-accent/60">
                Intenta escribir con calma o presiona el botón de buscar.
              </p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className={`border-b px-3 py-1.5 ${activeIntent === 'ai' ? 'border-violet-400/25 bg-violet-500/12' : 'border-gold/20 bg-gold/10'}`}>
                <p className="font-sans text-[11px] text-accent/80">
                  {activeIntent === 'ai' ? '✨' : '📚'} {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
                </p>
              </div>
              {results.map((book, index) => (
                <div
                  key={book.id || index}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex w-full items-center gap-2 border-b px-2.5 py-2 transition last:border-b-0 ${
                    book.source === 'gemini'
                      ? `border-violet-400/20 ${index === selectedIndex ? 'bg-gradient-to-r from-violet-600/20 to-blue-600/20' : 'hover:bg-violet-600/10'}`
                      : `border-gold/15 ${index === selectedIndex ? 'bg-gold/10' : 'hover:bg-gold/5'}`
                  }`}
                >
                  {book.source === 'gemini' ? (
                    <div className="w-full">
                      <AIResultCard
                        titulo={book.title}
                        autor={book.author}
                        descripcionBreve={book.reason || 'Sugerencia literaria generada por IA'}
                        onAdd={() => handleSelectBook(book)}
                        isSelected={index === selectedIndex}
                      />
                    </div>
                  ) : (
                    <>
                      <button onClick={() => handleSelectBook(book)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                        {book.thumbnail ? (
                          <img
                            src={book.thumbnail}
                            alt={book.title}
                            className="h-12 w-8 flex-shrink-0 rounded border border-gold/25 bg-black/20 p-0.5 object-contain"
                            loading="lazy"
                            onError={() => {
                              console.log('⚠️ Imagen no cargó:', book.thumbnail)
                            }}
                          />
                        ) : (
                          <div className="flex h-12 w-8 flex-shrink-0 items-center justify-center rounded border border-gold/25 bg-gray-700">
                            <span className="text-[10px] text-accent/60">📖</span>
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-serif text-xs font-semibold text-accent">{book.title}</p>
                          <p className="truncate font-sans text-[11px] text-accent/70">{book.author}</p>
                        </div>
                      </button>
                      <button
                        onClick={() => handleSelectBook(book)}
                        className="inline-flex h-7 items-center justify-center gap-1 rounded-full border border-gold/35 bg-gold/10 px-2.5 text-[10px] font-medium text-gold transition hover:bg-gold/20"
                      >
                        <Plus size={12} />
                        Añadir
                      </button>
                    </>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="space-y-1.5 p-3 text-center">
              <p className="font-sans text-xs font-semibold text-accent">😅 No encontramos resultados</p>
              <p className="font-sans text-[11px] text-accent/80">Intenta con otro nombre o variaciones</p>
            </div>
          )}
        </div>
      )}

      {/* Mostrar mini-ayuda si escribió algo pero menos de 3 caracteres */}
      {query.length > 0 && query.length < 3 && !showResults && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 rounded-lg border border-gold/20 bg-black/75 p-2 backdrop-blur-md">
          <p className="font-sans text-[11px] text-accent/80">
            ⌨️ Escribe al menos {3 - query.length} carácter{3 - query.length !== 1 ? 'es' : ''} más...
          </p>
        </div>
      )}
    </div>
  )
}
