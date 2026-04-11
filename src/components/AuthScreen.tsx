import React, { useEffect } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabaseClient'
import NLogo from './NLogo'

interface AuthScreenProps {
  onAuthSuccess: () => void
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ Usuario autenticado:', session.user.email)

        // Crear perfil automáticamente si no existe
        try {
          const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('id', session.user.id)
            .single()

          if (!existingProfile) {
            const { error: profileError } = await supabase
              .from('user_profiles')
              .insert([
                {
                  id: session.user.id,
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

        {/* Auth Form */}
        <div className="bg-secondary rounded-lg border border-gold/30 p-6 shadow-2xl shadow-gold/20">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#D4AF37',
                    brandAccent: '#C5A059',
                    brandButtonText: '#000000',
                    defaultButtonBackground: '#111111',
                    defaultButtonBackgroundHover: '#D4AF37',
                    defaultButtonBorder: '#D4AF37',
                    defaultButtonText: '#FFFFFF',
                    dividerBackground: '#D4AF37',
                    inputBackground: '#000000',
                    inputBorder: '#D4AF37',
                    inputBorderFocus: '#D4AF37',
                    inputBorderHover: '#C5A059',
                    inputLabelText: '#FFFFFF',
                    inputPlaceholder: '#FFFFFF80',
                    inputText: '#FFFFFF',
                    messageText: '#FFFFFF',
                    messageTextDanger: '#FF6B6B',
                    anchorTextColor: '#D4AF37',
                    anchorTextHoverColor: '#C5A059',
                  },
                  space: {
                    spaceSmall: '4px',
                    spaceMedium: '8px',
                    spaceLarge: '16px',
                    labelBottomMargin: '8px',
                    anchorBottomMargin: '4px',
                    emailInputSpacing: '4px',
                    socialAuthSpacing: '4px',
                    buttonPadding: '10px 15px',
                    inputPadding: '10px 15px',
                  },
                  fontSizes: {
                    baseBodySize: '14px',
                    baseInputSize: '16px',
                    baseLabelSize: '14px',
                    baseButtonSize: '16px',
                  },
                  radii: {
                    borderRadiusButton: '6px',
                    buttonBorderRadius: '6px',
                    inputBorderRadius: '6px',
                  },
                },
              },
              className: {
                container: 'auth-container',
                button: 'auth-button',
                input: 'auth-input',
                label: 'auth-label',
                message: 'auth-message',
                anchor: 'auth-anchor',
              },
            }}
            providers={['google', 'github']}
            redirectTo={window.location.origin}
            onlyThirdPartyProviders={false}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Correo electrónico',
                  password_label: 'Contraseña',
                  button_label: 'Entrar a Círculo Noveli',
                  loading_button_label: 'Entrando...',
                  social_provider_text: 'Entrar con {{provider}}',
                  link_text: '¿Ya tienes cuenta? Inicia sesión',
                  confirmation_text: 'Revisa tu email para el enlace de confirmación',
                },
                sign_up: {
                  email_label: 'Correo electrónico',
                  password_label: 'Contraseña',
                  button_label: 'Crear cuenta',
                  loading_button_label: 'Creando cuenta...',
                  social_provider_text: 'Registrarse con {{provider}}',
                  link_text: '¿No tienes cuenta? Regístrate',
                  confirmation_text: 'Revisa tu email para el enlace de confirmación',
                },
                forgotten_password: {
                  email_label: 'Correo electrónico',
                  button_label: 'Enviar instrucciones',
                  loading_button_label: 'Enviando...',
                  link_text: '¿Olvidaste tu contraseña?',
                  confirmation_text: 'Revisa tu email para el enlace de restablecimiento',
                },
              },
            }}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="font-sans text-accent/60 text-sm">
            Únete a la comunidad de lectores apasionados
          </p>
        </div>
      </div>
    </div>
  )
}