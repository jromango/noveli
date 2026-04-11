import React, { useEffect, useRef, useState } from 'react'
import { X, Loader } from 'lucide-react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { searchByISBN, BookWithMetadata } from '../services/advancedBookSearch'

interface BarcodeScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onBookFound: (book: BookWithMetadata) => void
}

export default function BarcodeScannerModal({ isOpen, onClose, onBookFound }: BarcodeScannerModalProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [message, setMessage] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!isOpen || !containerRef.current) return

    const config = { fps: 10, qrbox: { width: 250, height: 250 } }

    const scanner = new Html5QrcodeScanner('qr-reader', config, false)

    const onScanSuccess = async (isbn: string) => {
      setIsScanning(true)
      setMessage({ type: 'info', text: '🔍 Buscando libro...' })

      // Clean ISBN/EAN
      const cleanISBN = isbn.replace(/[^0-9]/g, '')

      try {
        const book = await searchByISBN(cleanISBN)

        if (book) {
          setMessage({ type: 'success', text: `✓ Libro encontrado: ${book.title}` })
          scanner.clear()
          onBookFound(book)
          setTimeout(() => onClose(), 1500)
        } else {
          setMessage({ type: 'error', text: 'No se encontró el libro en la base de datos' })
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Error al buscar el libro' })
      } finally {
        setIsScanning(false)
      }
    }

    const onScanError = () => {
      // Silently fail - normal for QR scanners
    }

    scanner.render(onScanSuccess, onScanError)
    scannerRef.current = scanner

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md">
      <div className="bg-cream rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-300 shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="font-serif text-2xl font-bold text-text">Escanear Código</h2>
          <button
            onClick={onClose}
            disabled={isScanning}
            className={`p-1 rounded transition ${
              isScanning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'
            }`}
          >
            <X size={24} className="text-text" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* QR Reader Container */}
          <div
            id="qr-reader"
            ref={containerRef}
            className="mb-4 rounded-lg overflow-hidden border-2 border-gray-200"
          />

          {/* Status Messages */}
          {message && (
            <div
              className={`p-3 rounded-lg text-center font-sans text-sm mb-4 ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : message.type === 'error'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
              }`}
            >
              {message.text}
            </div>
          )}

          {isScanning && (
            <div className="flex items-center justify-center gap-2 text-text">
              <Loader size={20} className="animate-spin" />
              <span className="font-sans">Procesando...</span>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="font-sans text-sm text-gray-700 text-center">
              📸 Apunta tu cámara al código de barras (EAN/ISBN) del libro
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={isScanning}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg font-sans text-text hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
