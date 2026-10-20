# 🍽️ ¿Qué comemos hoy?

Aplicación web moderna y colaborativa para decidir las comidas de forma aleatoria mediante una ruleta interactiva y permitir votaciones en tiempo real entre múltiples usuarios (familia, compañeros, amigos).

Diseñada especialmente para alojarse en **Vercel** y respaldada por **Supabase (PostgreSQL)** con sincronización en tiempo real.

---

## ✨ Características Principales

1. **🎲 Ruleta de la Suerte Interactiva**:
   - Ruleta animada con Canvas en tiempo real (escala 2x Retina), física de giro suave (*ease-out*) y sonido sintético de clicks sin dependencias externas.
   - Textos perfectamente centrados y contrastados con alineación radial y angular exacta.
   - Efectos festivos de confeti al salir el plato ganador y botón "¡A cocinar!" que abre directamente la receta.
   - Modo "Elección Rápida" para indecisos con apertura inmediata de receta.

2. **🎴 Gestión y Galería de Tarjetas**:
   - Tarjetas visuales estilo app moderna con fotografía HD, badges de categorías y capas visuales sin solapamientos.
   - Contador de votos y botón "Me gusta" con actualización instantánea.
   - Selector de fotos integrado con catálogo de recetas tradicionales y botón directo para **buscar imágenes en Google**.
   - Filtros por categorías (Tradicional, Carnes, Pescados, Sopas, Arroces, Italiana, Americana, Mexicana, Japonesa, Saludable, etc.) y barra de búsqueda.
   - Pestañas principales: **Todos los platos**, **Mis Platos** y **⭐ Favoritos**.
   - Podio Top 3 con los platos más votados en tiempo real.

3. **📖 Modal de Detalle Centralizado de Receta**:
   - Vista centralizada a pantalla completa al hacer clic en cualquier tarjeta, al pulsar "Elección Rápida" o desde la Ruleta.
   - Foto en alta resolución, ingredientes/descripción completa, categoría, popularidad y acciones de like y favoritos.
   - **Privacidad estricta:** Oculta correos electrónicos mostrando nombres amigables de chef/usuario.

4. **👥 Autenticación con Enlace Mágico y Roles de Usuario**:
   - Inicio de sesión sin contraseñas mediante Enlace Mágico (Magic Link) de Supabase.
   - Control de acceso por roles: Superusuario Raíz (`dianrie@hotmail.com`), Superusuarios Delegados y Usuarios Normales.
   - Panel de administración de usuarios exclusivo para superusuarios con gestión de roles y bajas.
   - Moderación del feed: Los usuarios visitantes ven únicamente recetas oficiales o de superusuarios; los creadores ven también sus propios platos.

5. **⚡ Sincronización Realtime**:
   - Suscripción bidireccional inmediata mediante Supabase Realtime Channels (`INSERT`, `UPDATE` y `DELETE`).
   - Sincronización optimista e inmutable en el cliente para reflejar ediciones al instante sin recargar la página.

6. **🚀 Preparada para Vercel**:
   - Empaquetada con Vite + React + Tailwind CSS.
   - `vercel.json` configurado para SPA rewrites.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Herramienta de construcción:** Vite 6.
- **Backend / Base de Datos:** Supabase (PostgreSQL + Realtime).
- **Despliegue:** Vercel.

---

## 🚀 Despliegue en Vercel

1. Entra en [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New..."** > **"Project"**.
3. Selecciona el repositorio **`que-comemos-hoy`**.
4. En **Environment Variables**, añade:
   - `VITE_SUPABASE_URL`: Tu URL del proyecto Supabase.
   - `VITE_SUPABASE_ANON_KEY`: Tu clave pública `anon` de Supabase.
5. Haz clic en **"Deploy"** y ¡listo!

---

## 💻 Desarrollo Local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Compilar para producción
npm run build
```
