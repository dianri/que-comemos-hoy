# 🤖 AGENTS.md: Manual del Proyecto "que-comemos-hoy"

Este documento define las reglas de estilo, la arquitectura, el flujo de datos y las convenciones técnicas que deben seguirse al desarrollar o modificar este proyecto.

---

## 1. Filosofía y Estilo
- **Frontend:** La interfaz debe ser moderna, limpia, minimalista y altamente visual, siguiendo la estética de una aplicación móvil nativa de alta calidad (App-like).
- **UI/UX:** Priorizar la facilidad de uso, con microinteracciones y transiciones suaves (*touch-friendly*).
- **Visuales:** Estilizado mediante Tailwind CSS. Todas las fotos de comida deben tener alta resolución, aspecto apetitoso y ocupar un lugar central en las tarjetas.

---

## 2. Arquitectura Técnica
- **Framework:** React 18 con Vite y TypeScript (`tsc -b && vite build`).
- **Estilizado:** Tailwind CSS + animaciones y utilidades personalizadas.
- **Iconografía & Efectos:** `lucide-react` para iconos y `canvas-confetti` para celebraciones.
- **Base de Datos / Backend:** Supabase (PostgreSQL + Realtime).
- **Alojamiento & CI/CD:** Vercel (con `vercel.json` configurado para SPA rewrites).

---

## 3. Estructura del Proyecto
```text
que-comemos-hoy/
├── public/                 # Recursos estáticos
├── src/
│   ├── components/         # Componentes modulares
│   │   ├── Navbar.tsx      # Barra de navegación e identidad local de usuario
│   │   ├── FoodCard.tsx    # Tarjeta visual con votos y categoría
│   │   ├── RouletteModal.tsx # Ruleta Canvas animada con sincronización precisa
│   │   ├── AddFoodModal.tsx  # Formulario modal para añadir platos
│   │   └── AuthModal.tsx     # Modal de inicio de sesión con Enlace Mágico (Magic Link)
│   ├── context/
│   │   └── UserContext.tsx # Estado global de usuario, sesión Supabase Auth y votos
│   ├── lib/
│   │   └── supabase.ts     # Inicialización del cliente Supabase y fallbacks
│   ├── types.ts            # Definiciones de TypeScript (Food, Vote, Category)
│   ├── vite-env.d.ts       # Tipado para variables de entorno de Vite
│   ├── index.css           # Directivas de Tailwind y estilos base
│   ├── App.tsx             # Vista principal, podio, filtros y suscripción realtime
│   └── main.tsx            # Punto de entrada de la aplicación
├── .env.example            # Plantilla de variables de entorno
├── vercel.json             # Configuración de rutas para despliegue en Vercel
├── vite.config.ts          # Configuración de bundler Vite
├── tailwind.config.js      # Configuración y paleta de colores de Tailwind
└── tsconfig*.json          # Configuración de compilación TypeScript
```

---

## 4. Reglas de Componentes Críticos

### `RouletteModal.tsx` (La Ruleta)
- La ruleta se dibuja dinámicamente en un elemento HTML5 Canvas compatible con pantallas Retina (escala 2x).
- **Regla de Oro:** 
  1. El texto del nombre de cada plato debe estar **perfectamente centrado** tanto radialmente (equidistante entre el eje central y el borde exterior: `midRadius = innerRadius + (radius - innerRadius) / 2`) como angularmente (`textAlign = 'center'`, `textBaseline = 'middle'`).
  2. Color del texto oscuro (`#18181b` / `zinc-900`) en negrita para asegurar contraste máximo sobre los sectores.
  3. La lógica de parada debe calcular el ángulo objetivo exacto para que el segmento ganador quede **físicamente bajo la flecha roja fija superior (12 en punto)**.
- Efectos obligatorios: sonido de giro (sintetizador Web Audio API sin dependencias externas de audio) y confeti (`canvas-confetti`) tras detenerse.

### `FoodCard.tsx` (Tarjetas de Plato)
- Imagen destacada con fallback automático si la URL falla (`onError`).
- El contador de votos se actualiza reactivamente gracias a Supabase Realtime y el trigger de base de datos.
- Indicador visual del estado del voto del usuario actual (corazón relleno/activo).

### `AddFoodModal.tsx` (Añadir Plato)
- Formulario rápido con validación, selector de categoría, previsualización de imagen en vivo y botones de "fotos rápidas" (presets de Unsplash) para añadir platos con 1 clic.

---

## 5. Base de Datos, Triggers y Realtime

### Tablas Principales
- **`public.foods`**: `id`, `name`, `image_url`, `category`, `description`, `votes_count`, `created_by`, `created_at`.
- **`public.votes`**: `id`, `food_id` (FK cascade), `user_name`, `created_at`.
  - Restricción única: `CONSTRAINT unique_user_food_vote UNIQUE (food_id, user_name)`.

### Políticas RLS (Row Level Security)
- **`public.foods`**:
  - Lectura pública: `SELECT true`.
  - Inserción y Eliminación protegidas: Requiere usuario autenticado (`auth.uid() IS NOT NULL`).
- **`public.votes`**:
  - Lectura, inserción y eliminación libres (`true`) para permitir votaciones fluidas por nombre local.

### Trigger en PostgreSQL
- La función `update_food_votes_count()` recalcula automáticamente `foods.votes_count` ante operaciones `INSERT` o `DELETE` en la tabla `votes`. El frontend nunca calcula votos manualmente.

### Suscripción Realtime
- En `App.tsx` se mantiene activa la suscripción al canal `public:foods_changes` escuchando eventos `INSERT`, `UPDATE` y `DELETE` para refrescar el feed instantáneamente en todos los clientes conectados.

---

## 6. Variables de Entorno y Autenticación
- **Variables de Entorno**:
  - `VITE_SUPABASE_URL`: URL del proyecto Supabase.
  - `VITE_SUPABASE_ANON_KEY`: Clave pública `anon`.
  - En `src/lib/supabase.ts` existen valores por defecto preconfigurados para permitir ejecución inmediata sin bloqueos.
- **Autenticación con Enlace Mágico (Magic Link)**:
  - Implementada mediante `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })`.
  - `UserContext.tsx` escucha el ciclo de vida de la sesión con `onAuthStateChange`.
  - La interfaz protege visualmente y a nivel de base de datos las acciones de **añadir platos** y **eliminar platos** requiriendo sesión iniciada. Los votos y la ruleta permanecen abiertos a todos los visitantes.

---

## 7. Flujo de Trabajo Git y Control de Calidad
- **Estrategia de Ramas:**
  - Toda nueva característica o corrección debe desarrollarse en ramas con el formato:  
    `features/XX-nombre-descriptivo` (ej. `features/01-meal-roulette-improvements`).
  - No commitear directamente sobre `main` para tareas aisladas.
- **Quality Gate Obligatorio:**
  - Antes de confirmar o dar por finalizada cualquier tarea, **siempre** ejecutar:
    ```bash
    npm run build
    ```
    El comando ejecuta `tsc -b && vite build`. Debe pasar con **0 errores de TypeScript y 0 advertencias**.
