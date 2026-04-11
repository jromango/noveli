import React, { useState, useEffect, ChangeEvent } from 'react'
import { X, UploadCloud, Loader, Moon, Sun, Shield } from 'lucide-react'
import { updateUserProfile, uploadUserAvatar } from '../services/database'
import { useTheme } from '../context/ThemeContext'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  currentUsername?: string
  currentAvatarUrl?: string
  currentBio?: string
  currentIsPrivate?: boolean
  onProfileUpdated: () => void
}

export default function EditProfileModal({
  isOpen,
  onClose,
  currentUsername = '',
  currentAvatarUrl,
  currentBio = '',
  currentIsPrivate = false,
  onProfileUpdated,
}: EditProfileModalProps) {
  const { theme, toggleTheme } = useTheme()
  const isDarkMode = theme === 'dark'
  const [username, setUsername] = useState(currentUsername)
  const [bio, setBio] = useState(currentBio)
  const [isPrivate, setIsPrivate] = useState(currentIsPrivate)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setUsername(currentUsername)
      setBio(currentBio)
      setIsPrivate(currentIsPrivate)
      setAvatarFile(null)
    }
  }, [isOpen, currentUsername, currentBio, currentIsPrivate])

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setAvatarFile(selectedFile)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateUserProfile({
        username: username.trim(),
        bio: bio.trim(),
        is_private: isPrivate,
      })
      if (avatarFile) {
        await uploadUserAvatar(avatarFile)
      }
      onProfileUpdated()
      onClose()
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xl">
      <div className="scrollbar-hide w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-2xl border border-[#D4AF37]/25 bg-black/70 shadow-2xl shadow-black/50 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-serif text-2xl font-bold text-[#D4AF37]">Configuración</h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="rounded-full p-1 transition hover:bg-white/10 disabled:opacity-50"
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 p-5">
          {/* Username */}
          <div>
            <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[#CFC4B3]">
              Nombre de usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tu nombre de lector"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 font-sans text-sm text-white placeholder:text-white/40 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[#CFC4B3]">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Cuéntale a los lectores qué te inspira leer"
              className="scrollbar-hide w-full resize-none rounded-xl border border-white/15 bg-white/5 px-3 py-2 font-sans text-sm text-white placeholder:text-white/40 focus:outline-none"
            />
          </div>

          {/* Avatar */}
          <div>
            <label className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[#CFC4B3]">
              Avatar
            </label>
            <div className="flex items-center gap-4">
              {avatarFile ? (
                <img
                  src={URL.createObjectURL(avatarFile)}
                  alt="Preview"
                  className="h-16 w-16 rounded-full border border-[#D4AF37]/35 object-cover"
                />
              ) : currentAvatarUrl ? (
                <img
                  src={currentAvatarUrl}
                  alt="Current avatar"
                  className="h-16 w-16 rounded-full border border-[#D4AF37]/35 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#D4AF37]/35 bg-white/5">
                  <span className="text-xl text-[#D4AF37]">{username.slice(0, 1) || 'L'}</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 font-sans text-sm text-[#F5F1E8] focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-[#D4AF37]" />
                <p className="font-sans text-sm text-white">Perfil privado</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPrivate((current) => !current)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${isPrivate ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-white/10 text-[#CFC4B3]'}`}
              >
                {isPrivate ? 'Activado' : 'Desactivado'}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-sans text-sm text-white">Modo {isDarkMode ? 'oscuro' : 'claro'}</p>
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-[#D4AF37] transition hover:bg-white/15"
              >
                {isDarkMode ? <Sun size={13} /> : <Moon size={13} />}
                Cambiar
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 rounded-xl border border-white/15 px-4 py-2 font-sans text-[#E0D6C8] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#D4AF37]/80 px-4 py-2 font-sans font-medium text-black transition hover:bg-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <UploadCloud size={16} />
                  Guardar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}