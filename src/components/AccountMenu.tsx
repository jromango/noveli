import React, { useEffect, useRef } from 'react'
import { LogOut, Settings, User, Feather, BookOpen, Crown } from 'lucide-react'
import { getBadgeByCompletedBooks } from '../lib/gamification'

interface AccountMenuProps {
  isOpen: boolean
  email: string
  username?: string
  completedBooks: number
  onClose: () => void
  onSignOut: () => Promise<void>
  onEditProfile: () => void
  onAccountSettings: () => void
}

export default function AccountMenu({
  isOpen,
  email,
  username,
  completedBooks,
  onClose,
  onSignOut,
  onEditProfile,
  onAccountSettings,
}: AccountMenuProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleOutsideClick = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isOpen, onClose])

  const displayName = username || 'Lector Curioso'
  const badge = getBadgeByCompletedBooks(completedBooks)

  return (
    <div
      ref={panelRef}
      className={`absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-lg border border-gold/30 bg-[#121212] shadow-lg transition-all duration-200 ease-out ${
        isOpen ? 'visible opacity-100 scale-100' : 'invisible opacity-0 scale-95'
      }`}
    >
      {/* Profile Info */}
      <div className="px-4 py-3 border-b border-gold/20">
        <div className="flex items-center gap-2">
          <p className="font-serif text-lg font-semibold text-white">{displayName}</p>
          {badge && (
            <div className={`bg-gradient-to-r ${badge.color} p-1 rounded-full`}>
              {badge.icon === 'Feather' && <Feather size={14} className="text-white" />}
              {badge.icon === 'BookOpen' && <BookOpen size={14} className="text-white" />}
              {badge.icon === 'Crown' && <Crown size={14} className="text-white" />}
            </div>
          )}
        </div>
        <p className="text-sm text-accent/70">{email}</p>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        <button
          onClick={() => {
            onEditProfile()
            onClose()
          }}
          className="w-full px-4 py-3 text-left text-accent hover:bg-gold/10 transition flex items-center gap-3"
        >
          <User size={18} />
          Editar Perfil
        </button>
        <button
          onClick={() => {
            onAccountSettings()
            onClose()
          }}
          className="w-full px-4 py-3 text-left text-accent hover:bg-gold/10 transition flex items-center gap-3"
        >
          <Settings size={18} />
          Ajustes de Cuenta
        </button>
        <div className="border-t border-gold/20 my-2"></div>
        <button
          onClick={onSignOut}
          className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10 transition flex items-center gap-3"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}
