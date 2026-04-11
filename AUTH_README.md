# Círculo Noveli - Sistema de Autenticación

## 🚀 Configuración de Autenticación

### 1. Configurar Supabase
1. Ve a [supabase.com](https://supabase.com) y crea un proyecto
2. Ve a Settings > API y copia tu `SUPABASE_URL` y `SUPABASE_ANON_KEY`
3. Actualiza `src/lib/supabaseClient.ts` con tus credenciales

### 2. Configurar Authentication Providers (Opcional)
En Supabase Dashboard > Authentication > Providers:
- Activa Google OAuth
- Activa GitHub OAuth
- Configura las URLs de redireccionamiento

### 3. Ejecutar Schema SQL
En Supabase Dashboard > SQL Editor, ejecuta el contenido de `DATABASE_SCHEMA.sql`

## 🔐 Funcionalidades de Autenticación

### Pantalla de Bienvenida
- Diseño de lujo negro-dorado
- Formulario de login/registro con Supabase Auth UI
- Soporte para email/password y proveedores OAuth

### Rutas Protegidas
- La aplicación requiere autenticación para acceder
- Pantalla de carga mientras verifica la sesión
- Redireccionamiento automático al login si no hay usuario

### Perfil Automático
- Se crea automáticamente un perfil con rango "Lector Curioso" al registrarse
- XP inicial: 0

### Persistencia de Sesión
- La sesión se mantiene entre refrescos de página
- `onAuthStateChange` maneja cambios de estado automáticamente

### Botón de Cerrar Sesión
- Ubicado en la pestaña "Perfil"
- Diseño elegante con icono de logout

## 🛡️ Seguridad (RLS - Row Level Security)

### Políticas Implementadas:
- **user_profiles**: Solo el propietario puede ver/editar su perfil
- **bookshelf**: Solo el propietario puede ver/editar sus libros
- **notes**: Todos pueden ver notas públicas, solo propietario puede editar las suyas
- **xp_logs**: Solo el propietario puede ver/editar sus logs de XP

## 🎨 Estética de Lujo

### Paleta de Colores:
- **Fondo**: Negro profundo (#000000)
- **Texto**: Blanco puro (#FFFFFF)
- **Acentos**: Dorado metálico (#D4AF37)
- **Fondos secundarios**: Negro suave (#111111)

### Tipografía:
- **Títulos**: Playfair Display (dorado)
- **Cuerpo**: Inter (blanco)

## 🏃‍♂️ Uso de la Aplicación

1. **Primera vez**: Se muestra la pantalla de autenticación
2. **Registro**: Crea cuenta con email o proveedores OAuth
3. **Login**: Inicia sesión con credenciales
4. **Aplicación**: Acceso completo a todas las funcionalidades
5. **Cerrar sesión**: Botón en perfil para salir

## 🔧 Desarrollo

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
# Actualizar src/lib/supabaseClient.ts

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
```

## 📱 Funcionalidades Disponibles

- ✅ Autenticación completa
- ✅ Perfil automático
- ✅ Rutas protegidas
- ✅ Persistencia de sesión
- ✅ Botón de logout elegante
- ✅ Seguridad RLS
- ✅ Estética de lujo negro-dorado