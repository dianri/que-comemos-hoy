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
│   │   ├── EditFoodModal.tsx # Formulario modal para editar platos existentes
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
- **Z-Index y Capas:** El badge flotante superior (`¡Plato Seleccionado!`) se posiciona en `z-30 pointer-events-none` centrado arriba. Cuando la tarjeta está destacada (`isHighlighted`), la categoría y las acciones de voto/favorito se desplazan suavemente hacia abajo (`top-10`) para prevenir solapamientos visuales.
- **Sincronización:** Estado `imgSrc` reactivo al cambio de `food.image_url` mediante `useEffect` para reflejar ediciones de forma instantánea.

### `RecipeDetailModal.tsx` (Detalle de Receta)
- Modal centralizado de alta resolución abierto al hacer clic en cualquier tarjeta, al pulsar "Elección Rápida" o tras pulsar "¡A cocinar!" en la Ruleta.
- Muestra fotografía HD, categoría, nombre del plato, descripción completa de la receta, popularidad/votos y botón para favoritos/likes.
- **Privacidad estricta:** Oculta cualquier dirección de correo electrónico, mostrando nombres de usuario o perfiles locales dinámicos.

### `ImagePicker.tsx` (Selector y Buscador de Fotos)
- Catálogo de imágenes optimizadas de platos tradicionales y filtros rápidos.
- Pestaña de URL Directa con acceso directo "🔍 Buscar en Google" que abre en una nueva pestaña Google Images con el nombre del plato prefiltrado.
- Previsualización reactiva de URL con alerta visual si la imagen no carga o tiene enlace roto.

### `EditFoodModal.tsx` (Editar Plato)
- Formulario de modificación prellenado con los datos actuales del plato (nombre, categoría, descripción y foto con `ImagePicker`).
- Actualización inmutable estricta en el estado global (`map` con nuevo objeto clonado) y emisión optimista instantánea sin esperar la resolución de WebSocket.
- Accesible para los superusuarios o el propietario del plato.

### `AdminUsersModal.tsx` (Panel de Administración de Usuarios)
- Panel reservado exclusivamente para superusuarios con conteo y métricas en tiempo real.
- **Superusuario Raíz (`dianrie@hotmail.com`):** Es inmutable y cuenta con privilegios para ascender a otros usuarios a superusuarios o degradarlos a usuarios normales (`set_user_role`).
- **Superusuarios Delegados:** Tienen acceso al panel y pueden eliminar usuarios del sistema (`delete_user_admin`), pero no pueden alterar roles ni eliminar al superusuario raíz.
- Lista completa de usuarios con búsqueda dinámica, estados de sesión y acciones protegidas con modal de confirmación.

---

## 5. Base de Datos, Triggers y Realtime

### Tablas Principales
- **`public.foods`**: `id`, `name`, `image_url`, `category`, `description`, `votes_count`, `created_by`, `user_id` (UUID), `user_email` (TEXT), `created_at`.
- **`public.votes`**: `id`, `food_id` (FK cascade), `user_name`, `created_at`.
  - Restricción única: `CONSTRAINT unique_user_food_vote UNIQUE (food_id, user_name)`.
- **`public.user_roles`**: `id`, `user_id` (UUID), `user_email` (TEXT UNIQUE), `role` ('root_admin' | 'superadmin' | 'user'), `created_at`, `updated_at`.

### Sistema de Visibilidad, Moderación y Favoritos
- **Visibilidad del Feed:** El feed principal muestra exclusivamente recetas oficiales del sistema y recetas creadas por superusuarios. Las recetas añadidas por usuarios normales son visibles para su propio creador y para los superusuarios (para moderación), manteniéndose ocultas ante terceros y visitantes no registrados para prevenir spam.
- **Favoritos:** Los favoritos persisten en `localStorage` asociados al email (`que_comemos_favs_<email>`).
- En la interfaz principal existen tres pestañas: **Todos los platos**, **Mis Platos** (solo los creados por el usuario activo) y **⭐ Favoritos**.
- La Ruleta y la Elección Rápida respetan el filtro activo y las reglas de visibilidad, girando únicamente entre los platos visibles.

### Políticas RLS y Control de Acceso
- **`public.foods`**:
  - **Lectura protegida por moderación:** Permite leer si `user_email IS NULL`, si `is_superadmin(user_email)`, si el usuario es el propietario (`user_id = auth.uid()` o `user_email = email`), o si el usuario consultante es superusuario (`is_superadmin()`).
  - **Inserción:** Requiere usuario autenticado (`auth.uid() IS NOT NULL`).
  - **Modificación (`UPDATE`) y Eliminación (`DELETE`):**
    - **Superusuarios:** Permisos para editar y borrar cualquier plato.
    - **Propietarios:** Usuarios autenticados solo pueden editar o borrar los platos que ellos mismos hayan creado.
- **`public.user_roles`**:
  - Lectura pública (`SELECT true`). Inserciones y modificaciones de rol exclusivamente a través de la función RPC con verificación de seguridad `set_user_role` reservada para el superusuario raíz.
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
