import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Mail, Phone } from 'lucide-react'

interface AuthForgotPasswordProps {
  onBack: () => void
}

export default function AuthForgotPassword({ onBack }: AuthForgotPasswordProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [method, setMethod] = useState<'email' | 'phone'>('email')

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setMessage('Por favor ingresa tu correo electrónico')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}`,
      })

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('✅ Si existe una cuenta con este email, recibirás un enlace para restablecer tu contraseña.')
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage('Error inesperado. Por favor intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleResetPassword} className="space-y-4">
      <h3 className="text-lg font-semibold text-gold mb-4">Recuperar Contraseña</h3>

      {/* Método */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMethod('email')}
          className={`flex-1 py-2 rounded-lg border transition ${
            method === 'email'
              ? 'bg-gold/20 border-gold text-gold'
              : 'bg-black/40 border-gold/30 text-white hover:border-gold/50'
          }`}
        >
          Por Correo
        </button>
        <button
          type="button"
          onClick={() => setMethod('phone')}
          className={`flex-1 py-2 rounded-lg border transition ${
            method === 'phone'
              ? 'bg-gold/20 border-gold text-gold'
              : 'bg-black/40 border-gold/30 text-white hover:border-gold/50'
          }`}
        >
          Por SMS*
        </button>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gold mb-1">Correo electrónico</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          className="w-full px-3 py-2 bg-black border border-gold/40 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-gold transition"
        />
      </div>

      {method === 'phone' && (
        <div className="p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg text-sm text-yellow-400">
          *La recuperación por SMS está disponible si registraste un número de teléfono. Recibirás un código en tu mensaje de texto.
        </div>
      )}

      {/* Mensajes */}
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('✅')
            ? 'bg-green-900/20 text-green-400 border border-green-600/30'
            : 'bg-red-900/20 text-red-400 border border-red-600/30'
        }`}>
          {message}
        </div>
      )}

      {/* Botón enviar */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-gold text-black rounded-lg font-semibold hover:bg-gold/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
      </button>

      {/* Botón volver */}
      <button
        type="button"
        onClick={onBack}
        className="w-full text-sm text-gold hover:text-gold/80 transition"
      >
        Volver a iniciar sesión
      </button>
    </form>
  )
}
