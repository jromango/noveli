# Instrucciones para actualizar la tabla profiles

## Pasos:

1. Abre la consola de Supabase: https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a: SQL Editor → New Query
4. Copia y pega el contenido de `migrations/add_profile_fields.sql`
5. Haz clic en "Run"

## Lo que hace la migración:

- Agrega campo `username` a profiles
- Agrega campo `first_name` (nombre)
- Agrega campo `last_name` (apellido)
- Agrega campo `birth_date` (fecha de nacimiento)
- Agrega campo `country` (país)
- Agrega campo `phone` (teléfono)
- Agrega campo `avatar_url` (foto de perfil)
- Agrega campo `bio` (biografía)
- Agrega campo `is_private` (cuenta privada)

## Después de los cambios:

1. Ejecuta: `git add . && git commit -m "Nuevo sistema de autenticación completo" && git push origin main`
2. Vercel desplegará automáticamente

## Funcionalidades nuevas:

✅ Registro completo con nombre, apellido, alias, fecha nacimiento, país y teléfono
✅ Confirmación por email
✅ Recuperación de contraseña por email (y SMS en futuro)
✅ Eliminada opción de Github
✅ Solo Google o registro manual
✅ Todos los campos serán editables en configuración del usuario
