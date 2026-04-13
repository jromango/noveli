import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import NLogo from './NLogo'
import AuthSignIn from './AuthSignIn'
import AuthSignUp from './AuthSignUp'
import AuthForgotPassword from './AuthForgotPassword'
import { Chrome } from 'lucide-react'

interface AuthScreenProps {
  onAuthSuccess: () => void
}

type AuthView = 'signin' | 'signup' | 'forgot'

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [authView, setAuthView] = useState<AuthView>('signin')
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ Usuario autenticado:', session.user.email)

        // Crear perfil automáticamente si no existe
        try {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single()

          if (!existingProfile) {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: session.user.id,
                  username: session.user.user_metadata?.name || session.user.email?.split('@')[0],
                  xp: 0,
                  rank: 'Lector Curioso',
                },
              ])

            if (profileError) {
              console.error('❌ Error creando perfil:', profileError)
            } else {
              console.log('✅ Perfil creado automáticamente')
            }
          }
        } catch (error) {
          console.error('❌ Error verificando perfil:', error)
        }

        onAuthSuccess()
      }
    })

    return () => subscription.unsubscribe()
  }, [onAuthSuccess])

  const handleGoogleSignIn = async () => {
    setIsLoadingGoogle(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      })
      if (error) console.error('Error con Google:', error)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoadingGoogle(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-[28px] bg-black border border-gold/30 shadow-2xl shadow-gold/20 flex items-center justify-center">
            <NLogo size={64} />
          </div>
          <h1 className="font-serif text-4xl font-bold text-gold mb-2">
            Círculo Noveli
          </h1>
          <p className="font-sans text-accent/80 text-lg">
            Tu biblioteca personal de lujo
          </p>
        </div>

        {/* Auth Form Container */}
        <div className="bg-secondary rounded-lg border border-gold/30 p-6 shadow-2xl shadow-gold/20">
          {authView === 'signin' && (
            <>
              {/* Google Sign In Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoadingGoogle}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-gold/40 hover:border-gold/70 text-white hover:bg-gold/10 transition disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                <Chrome size={20} />
                {isLoadingGoogle ? 'Conectando...' : 'Entrar con Google'}
              </button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gold/30"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-secondary text-gold/60">o</span>
                </div>
              </div>

              {/* Sign In Form */}
              <AuthSignIn
                onSuccess={onAuthSuccess}
                onSwitchToSignUp={() => setAuthView('signup')}
                onForgotPassword={() => setAuthView('forgot')}
              />
            </>
          )}

          {authView === 'signup' && (
            <AuthSignUp
              onSuccess={onAuthSuccess}
              onSwitchToSignIn={() => setAuthView('signin')}
            />
          )}

          {authView === 'forgot' && (
            <AuthForgotPassword
              onBack={() => setAuthView('signin')}
            />
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gold/50 mt-6">
          Al entrar aceptas nuestros términos y condiciones de privacidad
        </p>
      </div>
    </div>
  )
}
