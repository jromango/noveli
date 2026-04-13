import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Mail, Lock, User, Phone, Calendar, MapPin } from 'lucide-react'

interface AuthSignUpProps {
  onSuccess: () => void
  onSwitchToSignIn: () => void
}

const COUNTRIES = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica', 'Cuba',
  'Ecuador', 'El Salvador', 'España', 'Guatemala', 'Guinea Ecuatorial', 'Honduras',
  'México', 'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'Puerto Rico', 'República Dominicana',
  'Uruguay', 'Venezuela', 'Otros'
]

export default function AuthSignUp({ onSuccess, onSwitchToSignIn }: AuthSignUpProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    country: '',
    phone: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es requerido'
    if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es requerido'
    if (!formData.username.trim()) newErrors.username = 'El alias es requerido'
    if (formData.username.length < 3) newErrors.username = 'El alias debe tener al menos 3 caracteres'
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Email inválido'
    if (formData.password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden'
    if (!formData.birthDate) newErrors.birthDate = 'La fecha de nacimiento es requerida'
    if (!formData.country) newErrors.country = 'Selecciona un país'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setMessage('')

    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        setMessage(`Error en autenticación: ${authError.message}`)
        setIsLoading(false)
        return
      }

      if (!authData.user) {
        setMessage('Error creando la cuenta')
        setIsLoading(false)
        return
      }

      // 2. Crear perfil con datos adicionales
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            username: formData.username,
            first_name: formData.firstName,
            last_name: formData.lastName,
            birth_date: formData.birthDate,
            country: formData.country,
            phone: formData.phone || null,
            xp: 0,
            rank: 'Lector Curioso',
          },
        ])

      if (profileError) {
        console.error('Error creando perfil:', profileError)
        setMessage('Error creando el perfil. Por favor intenta nuevamente.')
        setIsLoading(false)
        return
      }

      setMessage('✅ Cuenta creada exitosamente. Revisa tu email para confirmar.')
      setTimeout(() => onSuccess(), 2000)
    } catch (error) {
      console.error('Error:', error)
      setMessage('Error inesperado. Por favor intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      {/* Nombre y Apellido */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gold mb-1">Nombre</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Juan"
            className={`w-full px-3 py-2 bg-black border rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-gold transition ${
              errors.firstName ? 'border-red-500' : 'border-gold/40'
            }`}
          />
          {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gold mb-1">Apellido</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Pérez"
            className={`w-full px-3 py-2 bg-black border rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-gold transition ${
              errors.lastName ? 'border-red-500' : 'border-gold/40'
            }`}
          />
          {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
        </div>
      </div>

      {/* Alias */}
      <div>
        <label className="block text-sm font-medium text-gold mb-1">Alias (usuario)</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="juanPerez"
          className={`w-full px-3 py-2 bg-black border rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-gold transition ${
            errors.username ? 'border-red-500' : 'border-gold/40'
          }`}
        />
        {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gold mb-1">Correo electrónico</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="tu@correo.com"
          className={`w-full px-3 py-2 bg-black border rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-gold transition ${
            errors.email ? 'border-red-500' : 'border-gold/40'
          }`}
        />
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
      </div>

      {/* Fecha de nacimiento */}
      <div>
        <label className="block text-sm font-medium text-gold mb-1">Fecha de nacimiento</label>
        <input
          type="date"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleChange}
          className={`w-full px-3 py-2 bg-black border rounded-lg text-white focus:outline-none focus:border-gold transition ${
            errors.birthDate ? 'border-red-500' : 'border-gold/40'
          }`}
        />
        {errors.birthDate && <p className="text-red-400 text-xs mt-1">{errors.birthDate}</p>}
      </div>

      {/* País */}
      <div>
        <label className="block text-sm font-medium text-gold mb-1">País</label>
        <select
          name="country"
          value={formData.country}
          onChange={handleChange}
          className={`w-full px-3 py-2 bg-black border rounded-lg text-white focus:outline-none focus:border-gold transition ${
            errors.country ? 'border-red-500' : 'border-gold/40'
          }`}
        >
          <option value="">Selecciona tu país</option>
          {COUNTRIES.map(country => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        {errors.country && <p className="text-red-400 text-xs mt-1">{errors.country}</p>}
      </div>

      {/* Teléfono (opcional) */}
      <div>
        <label className="block text-sm font-medium text-gold mb-1">Teléfono (opcional)</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+1 (555) 123-4567"
          className="w-full px-3 py-2 bg-black border border-gold/40 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-gold transition"
        />
      </div>

      {/* Contraseña */}
      <div>
        <label className="block text-sm font-medium text-gold mb-1">Contraseña</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          className={`w-full px-3 py-2 bg-black border rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-gold transition ${
            errors.password ? 'border-red-500' : 'border-gold/40'
          }`}
        />
        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
      </div>

      {/* Confirmar Contraseña */}
      <div>
        <label className="block text-sm font-medium text-gold mb-1">Confirmar contraseña</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          className={`w-full px-3 py-2 bg-black border rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-gold transition ${
            errors.confirmPassword ? 'border-red-500' : 'border-gold/40'
          }`}
        />
        {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
      </div>

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

      {/* Botón registrarse */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-gold text-black rounded-lg font-semibold hover:bg-gold/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>

      {/* Link cambiar a sign in */}
      <button
        type="button"
        onClick={onSwitchToSignIn}
        className="w-full text-sm text-gold hover:text-gold/80 transition"
      >
        ¿Ya tienes cuenta? Inicia sesión
      </button>
    </form>
  )
}
