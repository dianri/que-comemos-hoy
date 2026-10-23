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
├── public/                     # Recursos estáticos
├── src/
│   ├── components/             # Componentes modulares
│   │   ├── Navbar.tsx          # Barra de navegación e identidad de usuario
│   │   ├── FoodCard.tsx        # Tarjeta visual con votos, categorías y favoritos
│   │   ├── RouletteModal.tsx   # Ruleta Canvas coloreada por categoría con parada sincronizada
│   │   ├── RecipeDetailModal.tsx # Detalle centralizado de receta a pantalla completa
│   │   ├── AddFoodModal.tsx    # Modal para añadir platos con autocompletado IA
│   │   ├── EditFoodModal.tsx   # Modal para editar platos con autocompletado IA
│   │   ├── AuthModal.tsx       # Modal de inicio de sesión Magic Link con aviso de spam
│   │   ├── AdminUsersModal.tsx # Panel de administración de usuarios y roles
│   │   ├── ManageCategoriesModal.tsx # Gestión y reordenación personalizada de filtros
│   │   ├── ArcadeModal.tsx     # Minijuego arcade integrado con puntuaciones
│   │   ├── ImagePicker.tsx     # Selector de fotos y buscador directo en Google Images
│   │   ├── PwaInstallBanner.tsx # Banner flotante de instalación PWA con soporte iOS
│   │   └── Toast.tsx           # Notificaciones emergentes ligeras y reactivas
│   ├── context/
│   │   ├── UserContext.tsx     # Estado global de usuario, roles, votos y favoritos Supabase
│   │   └── CategoryContext.tsx # Categorías dinámicas, orden personalizado y realtime
│   ├── lib/
│   │   ├── aiDescription.ts    # Generación y autocompletado de descripciones con IA (cascada)
│   │   ├── sanitize.ts         # Sanitización XSS y validación de URLs de imágenes
│   │   ├── share.ts            # Compartir recetas mediante Web Share API o portapapeles
│   │   ├── sound.ts            # Síntesis de sonido Web Audio API (ruleta, pop festivo, arcade)
│   │   ├── supabase.ts         # Inicialización del cliente Supabase y fallbacks
│   │   └── toast.ts            # Despachador global de eventos Toast
│   ├── constants/
│   │   └── foodImages.ts       # Catálogo de fotografías gastronómicas optimizadas
│   ├── types.ts                # Definiciones de TypeScript (Food, Vote, Category, UserRole)
│   ├── vite-env.d.ts           # Tipado para variables de entorno de Vite
│   ├── index.css               # Directivas de Tailwind y estilos base
│   ├── App.tsx                 # Vista principal, podio, filtros drag-to-scroll y realtime
│   └── main.tsx                # Punto de entrada de la aplicación
├── .env.example                # Plantilla de variables de entorno
├── vercel.json                 # Configuración de rutas para despliegue en Vercel
├── vite.config.ts              # Configuración de bundler Vite
├── tailwind.config.js          # Configuración y paleta de colores de Tailwind
└── tsconfig*.json              # Configuración de compilación TypeScript
```

---

## 4. Reglas de Componentes Críticos

### `RouletteModal.tsx` (La Ruleta)
- La ruleta se dibuja dinámicamente en un elemento HTML5 Canvas compatible con pantallas Retina (escala 2x).
- **Gajos Coloreados por Categoría:** Cada porción de la ruleta adopta un color distintivo según su categoría culinaria (tonos tierra para carnes, azulados/marinos para pescados, dorados/ámbar para arroces/pastas, etc.), evitando la monotonía visual.
- **Sincronización con Filtros Activos:** La ruleta gira exclusivamente entre los platos que coinciden con los filtros de categoría y el texto de búsqueda activos en la pantalla principal.
- **Regla de Oro:** 
  1. El texto del nombre de cada plato debe estar **perfectamente centrado** tanto radialmente (equidistante entre el eje central y el borde exterior: `midRadius = innerRadius + (radius - innerRadius) / 2`) como angularmente (`textAlign = 'center'`, `textBaseline = 'middle'`).
  2. Color del texto oscuro (`#18181b` / `zinc-900`) en negrita para asegurar contraste máximo sobre los sectores.
  3. La lógica de parada debe calcular el ángulo objetivo exacto para que el segmento ganador quede **físicamente bajo la flecha roja fija superior (12 en punto)**.
- Efectos obligatorios: sonido de giro mecánico (`playRouletteTick`) y sonido festivo "Pop de Confeti / Explosión de Fiesta" (`playConfettiPop`) sintetizados con Web Audio API (`src/lib/sound.ts`) sin dependencias externas, sincronizados con la animación de confeti (`canvas-confetti`) y con control de silencio (mute) persistido en `localStorage`.

### `FoodCard.tsx` (Tarjetas de Plato)
- Imagen destacada con fallback automático si la URL falla (`onError`).
- Soporte para **múltiples categorías por plato**: se visualizan las etiquetas pertinentes en la tarjeta.
- Contador de votos reactivo gracias a Supabase Realtime y el trigger de base de datos.
- Botón de favoritos (estrella ⭐) sincronizado en tiempo real con Supabase (`public.user_favorites`).
- **Z-Index y Capas:** El badge flotante superior (`¡Plato Seleccionado!`) y las etiquetas/botones de la tarjeta se posicionan en `z-10`. Cuando la tarjeta está destacada (`isHighlighted`), la categoría y las acciones de voto/favorito se desplazan suavemente hacia abajo (`top-8 sm:top-10`) para prevenir solapamientos visuales. El contenedor sticky superior de filtros/buscador en `App.tsx` usa `z-30` y la barra de navegación `z-40` para garantizar que los elementos de las tarjetas pasen siempre por detrás al hacer scroll.
- **Sincronización:** Estado `imgSrc` reactivo al cambio de `food.image_url` mediante `useEffect` para reflejar ediciones de forma instantánea.

### `RecipeDetailModal.tsx` (Detalle de Receta)
- Modal centralizado de alta resolución abierto al hacer clic en cualquier tarjeta, al pulsar "Elección Rápida" o tras pulsar "¡A cocinar!" en la Ruleta.
- Muestra fotografía HD, todas las categorías asignadas, nombre del plato, descripción completa de la receta, popularidad/votos y botón para favoritos/likes.
- **Privacidad estricta:** Oculta cualquier dirección de correo electrónico, mostrando nombres de usuario o perfiles locales dinámicos.

### `AddFoodModal.tsx` y `EditFoodModal.tsx` (Creación y Edición de Platos)
- **Selección Múltiple de Categorías:** Permite asignar una o varias categorías a cada plato mediante chips interactivos.
- **Autocompletado con IA para Descripción Corta:** Botón con icono de destellos ✨ (`Sparkles` / `Loader2`) que genera descripciones gastronómicas atractivas y concisas mediante el servicio de cascada en `aiDescription.ts`. El texto es completamente editable por el usuario.
- **ImagePicker integrado:** Catálogo de fotos y acceso directo a Google Images prefiltrado por el nombre del plato.

### `ManageCategoriesModal.tsx` (Gestor de Categorías y Filtros)
- Panel accesible para superusuarios para crear nuevas categorías, eliminarlas o **reordenarlas personalmente** (subir/bajar).
- El orden establecido se persiste en la base de datos de Supabase (`public.categories.display_order`) y se refleja en tiempo real en todos los clientes.

### Barra de Filtros y Categorías (`App.tsx`)
- **Barra de Pestañas Principales Adaptativa:** Contenedor fluido con desplazamiento horizontal táctil (`overflow-x-auto scrollbar-none touch-pan-x overscroll-x-contain`). Garantiza que las pestañas ("Todos", "Mis Platos", "Platos de otros", "Favoritos") y sus contadores numéricos mantengan dimensiones uniformes (`whitespace-nowrap flex-shrink-0`) sin cortes ni solapamientos en pantallas móviles estrechas.
- **Drag-to-Scroll Horizontal:** Desplazamiento fluido con clic y arrastre en escritorio o swipe táctil en móvil.
- **Aislamiento Exclusivo con Pulsación Prolongada (Long Press):** Mantener pulsado (~500ms) cualquier filtro de categoría en PC o móvil aísla exclusivamente dicho filtro (desmarcando todas las demás) de forma silenciosa e inmediata, con feedback háptico (`navigator.vibrate`) y micro-animación visual, distinguiendo arrastres o scroll táctil para evitar falsos positivos.

### `PwaInstallBanner.tsx` (Banner de Instalación PWA)
- Captura el evento nativo `beforeinstallprompt` y gestiona la instalación controlada de la aplicación sin banners invasivos.
- Detección de modo `standalone`: si la aplicación ya se ejecuta instalada, el banner permanece oculto automáticamente.
- Soporte para iOS Safari mediante modal de guía interactiva ("Compartir > Añadir a pantalla de inicio").
- Persistencia de desestimación en `localStorage` (`que_comemos_pwa_dismissed`) para no molestar repetidamente al usuario si pulsa "Ahora no" o cierra el aviso.
- Escucha del evento `appinstalled` para confirmar la instalación con notificación Toast festiva.

### `AdminUsersModal.tsx` (Panel de Administración de Usuarios)
- Panel reservado exclusivamente para superusuarios con conteo y métricas en tiempo real.
- **Superusuario Raíz (`dianrie@hotmail.com`):** Inmutable, con privilegios exclusivos para ascender a otros usuarios a superusuarios o degradarlos a usuarios normales (`set_user_role`).
- **Superusuarios Delegados:** Pueden eliminar usuarios del sistema (`delete_user_admin`), pero no pueden alterar roles ni eliminar al superusuario raíz.
- Lista completa de usuarios con búsqueda dinámica, estados de sesión y acciones protegidas con modal de confirmación.

---

## 5. Base de Datos, Triggers y Realtime

### Tablas Principales
- **`public.foods`**: `id`, `name`, `image_url`, `category`, `categories` (TEXT[]), `description`, `votes_count`, `created_by`, `user_id` (UUID), `user_email` (TEXT), `is_global` (BOOLEAN DEFAULT false), `created_at`.
- **`public.votes`**: `id`, `food_id` (FK cascade), `user_name`, `user_id` (UUID), `created_at`.
  - Restricción única: `CONSTRAINT unique_user_food_vote UNIQUE (food_id, user_name)`.
- **`public.user_favorites`**: `id`, `user_id` (UUID FK cascade), `user_email` (TEXT), `food_id` (UUID FK cascade), `created_at`.
  - Restricción única: `CONSTRAINT unique_user_food_favorite UNIQUE (user_email, food_id)`.
- **`public.categories`**: `id`, `name`, `emoji`, `display_order` (INT), `created_at`.
- **`public.user_roles`**: `id`, `user_id` (UUID), `user_email` (TEXT UNIQUE), `role` ('root_admin' | 'superadmin' | 'user'), `created_at`, `updated_at`.
- **`public.game_scores`**: `id`, `user_name`, `score`, `created_at`.

### Sistema de Visibilidad, Moderación y Gestión Global
- **Visibilidad del Feed y Control Global (`is_global`):** La pantalla principal comunitaria muestra exclusivamente recetas marcadas como públicas globales (`is_global = true`). Los platos subidos por superusuarios ya no aparecen automáticamente en la carta principal por defecto; requieren ser activados explícitamente como globales. Las recetas privadas o en borrador son visibles únicamente para su propio creador y para superusuarios (para moderación y revisión).
- **Control en Formularios y Acción Rápida en Tarjetas:** Superusuarios cuentan con un interruptor ("Mostrar en la pantalla principal para todos") en `AddFoodModal` y `EditFoodModal`, además de un botón de acción rápida con icono de globo terráqueo (`Globe`) en las tarjetas `FoodCard` y en `RecipeDetailModal` para alternar al instante el estado público/privado con feedback visual y notificación Toast inmediata.
- **Favoritos Sincronizados en Supabase:** Los favoritos se guardan directamente en `public.user_favorites` asociados a la cuenta del usuario autenticado, asegurando disponibilidad multi-dispositivo inmediata (móvil, tablet, ordenador) con sincronización bidireccional Realtime y caché local optimista en `localStorage` (`que_comemos_favs_<email>`).
- En la interfaz principal existen las pestañas estándar: **Todos los platos**, **Mis Platos** (los creados por el usuario activo) y **⭐ Favoritos**, junto a la pestaña exclusiva **Platos de otros** (👥) visible únicamente para superusuarios para moderar y explorar las recetas aportadas por el resto de la comunidad.
- La Ruleta y la Elección Rápida respetan el filtro activo y las reglas de visibilidad, girando únicamente entre los platos visibles y públicos de la selección actual.

### Políticas RLS y Control de Acceso
- **`public.foods`**:
  - **Lectura protegida por moderación y visibilidad global:** Permite leer si `is_global = true`, si el usuario consultante es superusuario (`is_superadmin()`), o si el usuario es el propietario (`user_id = auth.uid()` o `user_email = auth.jwt() ->> 'email'`).
  - **Inserción:** Requiere usuario autenticado (`auth.uid() IS NOT NULL`).
  - **Modificación (`UPDATE`) y Eliminación (`DELETE`):**
    - **Superusuarios:** Permisos para editar y borrar cualquier plato.
    - **Propietarios:** Usuarios autenticados solo pueden editar o borrar los platos que ellos mismos hayan creado.
- **`public.user_favorites`**:
  - **Lectura, Inserción y Eliminación:** Protegidas por RLS. Exclusivas para el propio usuario autenticado (`user_id = auth.uid()` o `user_email = auth.jwt() ->> 'email'`) y superusuarios.
- **`public.categories`**:
  - Lectura pública (`SELECT true`). Inserciones, actualizaciones y borrados restringidos a superusuarios (`is_superadmin()`).
- **`public.user_roles`**:
  - Lectura pública (`SELECT true`). Inserciones y modificaciones de rol exclusivamente a través de la función RPC con verificación de seguridad `set_user_role` reservada para el superusuario raíz.
- **`public.votes`**:
  - Lectura libre (`true`), inserción y eliminación protegidas para usuarios autenticados.

### Triggers y Funciones en PostgreSQL
- `update_food_votes_count()`: Recalcula automáticamente `foods.votes_count` ante operaciones `INSERT` o `DELETE` en la tabla `votes`.
- `is_superadmin(check_email)`: Determina de forma segura y centralizada los privilegios administrativos en funciones y políticas RLS.

### Suscripciones Realtime Activas
- `public:foods_changes`: En `App.tsx` para reflejar adiciones, modificaciones y borrados de platos al instante.
- `public:categories_changes`: En `CategoryContext.tsx` para refrescar el orden y listado de filtros en tiempo real.
- `public:user_votes_${user.id}`: En `UserContext.tsx` para reflejar votos de forma reactiva entre sesiones.
- `public:user_favorites_${user.id}`: En `UserContext.tsx` para mantener los favoritos sincronizados al instante en todos los dispositivos conectados.

---

## 6. Variables de Entorno y Autenticación
- **Variables de Entorno**:
  - `VITE_SUPABASE_URL`: URL del proyecto Supabase.
  - `VITE_SUPABASE_ANON_KEY`: Clave pública `anon`.
  - `VITE_GEMINI_API_KEY` (Opcional): Clave para el modelo Gemini Flash en autocompletado de descripciones IA (con fallback automático a Pollinations AI y Wikipedia si no se define).
- **Autenticación con Enlace Mágico (Magic Link)**:
  - Implementada mediante `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })`.
  - `AuthModal.tsx` incluye aviso informativo sobre la carpeta de spam para mejorar la tasa de conversión de acceso.
  - `UserContext.tsx` escucha el ciclo de vida de la sesión con `onAuthStateChange`.
  - Acciones de añadir, editar, borrar platos y gestionar favoritos requieren sesión iniciada. Los votos y la ruleta permanecen abiertos a todos los visitantes.

---

## 7. Flujo de Trabajo Git y Control de Calidad

Este protocolo es de **cumplimiento estricto e inquebrantable** para cualquier desarrollo, modificación o mejora en el proyecto:

### 1. Creación Obligatoria de Rama (`features/...`)
- Cada vez que el usuario solicite una nueva funcionalidad, mejora, refactorización o cambio ("algo nuevo"), el agente **debe obligatoriamente crear y cambiar a una nueva rama de características** antes de modificar cualquier archivo de código.
- La rama debe seguir estrictamente el formato de nomenclatura:  
  `features/nombre-descriptivo-de-la-rama` (ej. `features/sync-user-favorites`, `features/ai-short-description`, `features/update-docs-readme-agents`).
- **Bajo ninguna circunstancia se debe desarrollar o realizar commits directamente sobre `main`**.

### 2. Desarrollo y Quality Gate Riguroso
- Todo el ciclo de desarrollo, modificaciones, depuración y pruebas debe realizarse exclusivamente en dicha rama de características.
- **Quality Gate Obligatorio:** Antes de considerar finalizada cualquier tarea o proceder a la fusión, es imprescindible ejecutar y superar con éxito el comando de compilación:
  ```bash
  npm run build
  ```
  El comando ejecuta `tsc -b && vite build`. Debe pasar con **0 errores de TypeScript y 0 advertencias**.

### 3. Fusión (Merge) a `main` y Sincronización
- Una vez que la tarea esté completamente terminada, validada y aprobada por el usuario:
  1. Realizar el `commit` con un mensaje semántico y descriptivo de los cambios realizados.
  2. Hacer `push` de la rama de características al repositorio remoto (`origin`).
  3. Cambiar a la rama principal `main` y asegurarse de que esté actualizada (`git pull`).
  4. Realizar la **fusión automática (merge)** de la rama de características hacia la rama principal `main`.
  5. Hacer el `push` de `main` a `origin`, dejando la rama principal lista, estable y sincronizada.

---

## 8. Protocolo de Desarrollo Paralelo (Multi-Agente)
- **Aislamiento de Ramas Estricto:** Cada agente debe trabajar **siempre y exclusivamente** en su propia rama de características dedicada (`features/nombre-especifico-de-la-tarea`). Está terminantemente prohibido que dos agentes operen sobre la misma rama de desarrollo o hagan commits directos en `main` simultáneamente.
- **Sincronización Previa Obligatoria:** Antes de iniciar cualquier tarea, el agente debe verificar el estado actual del repositorio y asegurar que parte del último commit estable de `main`.
- **Resolución Atómica de Archivos:** Las tareas asignadas a cada agente deben ser ortogonales (es decir, tocar componentes o archivos diferentes) siempre que sea posible para minimizar futuros conflictos de fusión.
- **Orden de Fusión y Actualización:** Si un agente realiza un *merge* a `main`, el segundo agente debe actualizar obligatoriamente su rama local con los cambios de `main` (`git pull origin main`) antes de proceder con su propio *merge*.
