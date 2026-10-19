# 🍽️ ¿Qué comemos hoy?

Aplicación web moderna y colaborativa para decidir las comidas de forma aleatoria mediante una ruleta interactiva y permitir votaciones en tiempo real entre múltiples usuarios (familia, compañeros, amigos).

Diseñada especialmente para alojarse en **Vercel** y respaldada por **Supabase (PostgreSQL)** con sincronización en tiempo real.

---

## ✨ Características Principales

1. **🎲 Ruleta de la Suerte Interactiva**:
   - Ruleta animada con Canvas en tiempo real, física de giro suave (*ease-out*) y sonido sintético de clicks sin dependencias externas.
   - Efectos festivos de confeti al salir el plato ganador.
   - Opción de "Elección Rápida" para indecisos con prisa.

2. **🎴 Gestión y Galería de Tarjetas**:
   - Tarjetas visuales estilo app moderna con fotografía en alta definición, badges de categorías y descripción.
   - Contador de votos y botón "Me gusta" con actualización instantánea.
   - Presets de imágenes de comida para añadir platos rápidamente.
   - Filtros por categorías (Tradicional, Italiana, Arroces, Americana, Mexicana, Japonesa, Saludable, etc.) y barra de búsqueda.
   - Podio Top 3 con los platos más votados en tiempo real.

3. **👥 Sistema de Votaciones Colaborativo**:
   - Selector e identificador de usuario rápido en el Navbar (con avatar emoji y persistencia local).
   - Sistema de votación protegido contra duplicados por usuario a nivel de base de datos.
   - Suscripción en tiempo real vía Supabase Realtime Channels.

4. **🚀 Preparada para Vercel**:
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
